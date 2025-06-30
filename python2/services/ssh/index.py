import subprocess
import uuid
import os
import sys

log_dir = os.getenv("LOG_DIR")
tmp_dir = os.getenv("TMP_DIR")

def start(config):
    port = config["port"]
    users = config["users"]
    base_name = config.get("name", "ssh_")
    banner = config.get("banner", "Welcome to the SSH honeypot server")
    passwd_chmod = config.get("passwd_chmod", "644")
    shadow_chmod = config.get("shadow_chmod", "640")
    container_name = f"{base_name}_{port}_{str(uuid.uuid4())[:8]}"
    image_name = "ssh_image"

    print(f"[INFO] Preparing to start container '{container_name}' on port {port}")

    container_tmp_dir = os.path.join(tmp_dir, container_name)
    os.makedirs(container_tmp_dir, exist_ok=True)
    print(f"[INFO] Created temporary build directory at {container_tmp_dir}")

    ssh_log_dir = os.path.join(log_dir, "ssh", container_name)
    os.makedirs(ssh_log_dir, exist_ok=True)
    print(f"[INFO] Created SSH log directory at {ssh_log_dir}")

    # Create SSH banner file
    banner_path = os.path.join(container_tmp_dir, "ssh_banner.txt")
    with open(banner_path, "w") as f:
        f.write(banner + "\n")
    print(f"[INFO] SSH banner created at {banner_path}")

    # Dockerfile content with SSH setup and enhanced logging
    dockerfile = f"""
    FROM ubuntu:20.04

    ENV DEBIAN_FRONTEND=noninteractive
    RUN apt-get update && apt-get install -y openssh-server sudo rsyslog && \\
        mkdir /var/run/sshd && mkdir -p /var/log/ssh && \\
        mkdir -p /var/log/honeypot

    # SSH Configuration for better logging and security
    RUN echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config && \\
        echo 'LogLevel VERBOSE' >> /etc/ssh/sshd_config && \\
        echo 'SyslogFacility AUTHPRIV' >> /etc/ssh/sshd_config && \\
        echo 'Banner /etc/ssh/banner' >> /etc/ssh/sshd_config && \\
        echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config && \\
        echo 'ChallengeResponseAuthentication no' >> /etc/ssh/sshd_config && \\
        echo 'UsePAM yes' >> /etc/ssh/sshd_config

    # Copy banner file
    COPY ssh_banner.txt /etc/ssh/banner

    # Create users with specified permissions
    {"".join([
        f"RUN useradd -m {u['username']} && echo '{u['username']}:{u['password']}' | chpasswd && "
        + (f"usermod -aG sudo {u['username']} && " if u.get('sudo') else "")
        + f"mkdir -p /home/{u['username']}/.ssh && chmod 700 /home/{u['username']}/.ssh\n"
        for u in users
    ])}

    # Set file permissions as requested
    RUN chmod {passwd_chmod} /etc/passwd && \\
        chmod {shadow_chmod} /etc/shadow

    # Enhanced logging setup
    RUN echo 'auth,authpriv.*    /var/log/honeypot/auth.log' >> /etc/rsyslog.conf && \\
        echo '*.info;mail.none;authpriv.none;cron.none    /var/log/honeypot/messages' >> /etc/rsyslog.conf && \\
        mkdir -p /var/log/honeypot && \\
        touch /var/log/honeypot/auth.log /var/log/honeypot/messages

    # Create a script to capture user commands
    RUN echo '#!/bin/bash' > /etc/profile.d/honeypot_logging.sh && \\
        echo 'export PROMPT_COMMAND="history -a; logger -p local0.info \\"USER=\\$USER PWD=\\$PWD CMD=\\$(history 1 | sed \\\"s/^[ ]*[0-9]\\\\+[ ]*//\\\")\\"' >> /etc/profile.d/honeypot_logging.sh && \\
        chmod +x /etc/profile.d/honeypot_logging.sh

    # Setup rsyslog to capture command logs
    RUN echo 'local0.*    /var/log/honeypot/commands.log' >> /etc/rsyslog.conf && \\
        touch /var/log/honeypot/commands.log

    EXPOSE 22

    # Start both rsyslog and SSH
    CMD service rsyslog start && /usr/sbin/sshd -D
    """

    dockerfile_path = os.path.join(container_tmp_dir, "Dockerfile")
    with open(dockerfile_path, "w") as f:
        f.write(dockerfile.strip() + "\n")

    print(f"[INFO] Dockerfile written to {dockerfile_path}")
    print(f"[INFO] Banner: {banner}")
    print(f"[INFO] File permissions - /etc/passwd: {passwd_chmod}, /etc/shadow: {shadow_chmod}")
    print("[INFO] Starting Docker image build...")

    # Step 1: Build the Docker image
    try:
        subprocess.run(
            ["docker", "build", "-t", image_name, container_tmp_dir],
            check=True,
            stdout=sys.stdout,
            stderr=sys.stderr,
            text=True
        )
        print("[SUCCESS] Docker image built successfully.")
    except subprocess.CalledProcessError as e:
        print("[ERROR] Docker image build failed.")
        return None, f"Build failed: {e}"

    # Step 2: Run the container with enhanced log mounting
    docker_run_cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "-p", f"{port}:22",
        "-v", f"{ssh_log_dir}:/var/log/honeypot",  # Mount honeypot logs
        "-v", f"{ssh_log_dir}:/var/log/ssh",       # Mount ssh logs
        image_name
    ]

    print("[INFO] Starting container with command:")
    print("       " + " ".join(docker_run_cmd))

    try:
        result = subprocess.run(docker_run_cmd, check=True, text=True)
        # Since we removed capture_output, get container ID separately
        get_id_cmd = ["docker", "ps", "-q", "--filter", f"name={container_name}"]
        id_result = subprocess.run(get_id_cmd, capture_output=True, text=True)
        container_id = id_result.stdout.strip()
        print(f"[SUCCESS] Container started with ID: {container_id}")
        print(f"[INFO] Logs will be available in: {ssh_log_dir}")
        print("[INFO] Log files: auth.log (login attempts), commands.log (user commands), messages (system)")
        return container_id, None
    except subprocess.CalledProcessError as e:
        print("[ERROR] Failed to start container.")
        error_message = str(e)
        
        # Check for port conflict and provide cleaner error message
        if "port is already allocated" in error_message or "Bind for" in error_message:
            return None, f"Port {port} is already in use. Please choose a different port."
        
        return None, f"Failed to start SSH: {error_message}"
