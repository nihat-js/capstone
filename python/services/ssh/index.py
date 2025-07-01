import subprocess
import uuid
import os
import sys
from os import path, getenv

log_dir = os.path.abspath(path.join(getenv("log_dir", "../../logs"), "ssh")).replace('\\', '/')
tmp_dir = os.path.abspath(path.join(getenv("tmp_dir", "../../.tmp/ssh"))).replace('\\', '/')
os.makedirs(log_dir, exist_ok=True)
os.makedirs(tmp_dir, exist_ok=True)

print(f"[INFO] Log directory: {log_dir}")
print(f"[INFO] Temporary directory: {tmp_dir}")

def start(config):
    port = config["port"]
    users = config["users"]
    base_name = config.get("name", "ssh_")
    banner = config.get("banner", "Welcome to the SSH honeypot server")
    passwd_chmod = config.get("passwd_chmod", "644")
    shadow_chmod = config.get("shadow_chmod", "640")
    container_name = f"{base_name}_{port}_{str(uuid.uuid4())[:8]}"
    image_name = "ssh_image" + f"_{port}_{str(uuid.uuid4())[:8]}"

    print(f"[INFO] Preparing to start container '{container_name}' on port {port}")

    # Create banner file
    banner_path = os.path.join(tmp_dir, "banner.txt")
    with open(banner_path, "w") as f:
        f.write(banner + "\n")
    print(f"[INFO] SSH banner created at {banner_path}")

    # Verify files exist
    required_files = [banner_path]
    for file_path in required_files:
        if not os.path.exists(file_path):
            print(f"[ERROR] Required file {file_path} does not exist.")
            return None, f"Failed to create required file: {file_path}"
    print(f"[INFO] Files in tmp_dir: {os.listdir(tmp_dir)}")

    dockerfile = f"""
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y openssh-server sudo rsyslog && \\
    mkdir /var/run/sshd && mkdir -p /var/log/ssh && \\
    mkdir -p /var/log/honeypot

# Copy banner
COPY banner.txt /etc/ssh/banner

# SSH Configuration
RUN echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config && \\
    echo 'LogLevel VERBOSE' >> /etc/ssh/sshd_config && \\
    echo 'SyslogFacility AUTHPRIV' >> /etc/ssh/sshd_config && \\
    echo 'Banner /etc/ssh/banner' >> /etc/ssh/sshd_config && \\
    echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config && \\
    echo 'ChallengeResponseAuthentication no' >> /etc/ssh/sshd_config && \\
    echo 'UsePAM yes' >> /etc/ssh/sshd_config

# Create users first
{"".join([
    f"RUN useradd -m {u['username']} && echo '{u['username']}:{u['password']}' | chpasswd && "
    + (f"usermod -aG sudo {u['username']} && " if u.get('sudo') else "")
    + f"mkdir -p /home/{u['username']}/.ssh && chmod 700 /home/{u['username']}/.ssh\n"
    for u in users
])}

# Set file permissions
RUN chmod {passwd_chmod} /etc/passwd && \\
    chmod {shadow_chmod} /etc/shadow

# Create log directory with proper permissions FROM START
RUN mkdir -p /var/log/ssh && \\
    touch /var/log/ssh/auth.log /var/log/ssh/messages /var/log/ssh/commands.log && \\
    chmod 777 /var/log/ssh && \\
    chmod 777 /var/log/ssh/commands.log && \\
    chmod 777 /var/log/ssh/auth.log && \\
    chmod 777 /var/log/ssh/messages && \\
    ls -la /var/log/ssh/

# Logging setup
RUN echo 'auth,authpriv.*    /var/log/ssh/auth.log' >> /etc/rsyslog.conf && \\
    echo '*.info;mail.none;authpriv.none;cron.none    /var/log/ssh/messages' >> /etc/rsyslog.conf

# Create command logging setup with a custom bash wrapper  
RUN echo '#!/bin/bash' > /usr/local/bin/ssh_logger.sh && \\
    echo 'LOGFILE="/var/log/ssh/commands.log"' >> /usr/local/bin/ssh_logger.sh && \\
    echo 'echo "$(date +%Y-%m-%d\\ %H:%M:%S) Session started for user $USER from $SSH_CLIENT" >> $LOGFILE' >> /usr/local/bin/ssh_logger.sh && \\
    echo 'export PS1="$USER@securebank:~$ "' >> /usr/local/bin/ssh_logger.sh && \\
    echo 'while true; do' >> /usr/local/bin/ssh_logger.sh && \\
    echo '  read -e -p "$PS1" cmd' >> /usr/local/bin/ssh_logger.sh && \\
    echo '  if [[ "$cmd" == "exit" ]]; then' >> /usr/local/bin/ssh_logger.sh && \\
    echo '    echo "$(date +%Y-%m-%d\\ %H:%M:%S) $USER: exit" >> $LOGFILE' >> /usr/local/bin/ssh_logger.sh && \\
    echo '    break' >> /usr/local/bin/ssh_logger.sh && \\
    echo '  fi' >> /usr/local/bin/ssh_logger.sh && \\
    echo '  if [[ -n "$cmd" ]]; then' >> /usr/local/bin/ssh_logger.sh && \\
    echo '    echo "$(date +%Y-%m-%d\\ %H:%M:%S) $USER: $cmd" >> $LOGFILE' >> /usr/local/bin/ssh_logger.sh && \\
    echo '    eval "$cmd"' >> /usr/local/bin/ssh_logger.sh && \\
    echo '  fi' >> /usr/local/bin/ssh_logger.sh && \\
    echo 'done' >> /usr/local/bin/ssh_logger.sh && \\
    chmod +x /usr/local/bin/ssh_logger.sh

# Configure SSH to use our custom shell
RUN echo 'ForceCommand /usr/local/bin/ssh_logger.sh' >> /etc/ssh/sshd_config
RUN chmod 777 /var/log/ssh/commands.log
EXPOSE 22
CMD rsyslogd && sleep 2 && /usr/sbin/sshd -D
"""

    dockerfile_path = os.path.join(tmp_dir, "Dockerfile")
    with open(dockerfile_path, "w") as f:
        f.write(dockerfile.strip() + "\n")
    print(f"[INFO] Dockerfile written to {dockerfile_path}")

    # Verify Dockerfile exists
    if not os.path.exists(dockerfile_path):
        print(f"[ERROR] Dockerfile {dockerfile_path} does not exist.")
        return None, f"Failed to create Dockerfile: {dockerfile_path}"

    print(f"[INFO] Banner: {banner}")
    print(f"[INFO] File permissions - /etc/passwd: {passwd_chmod}, /etc/shadow: {shadow_chmod}")
    print("[INFO] Starting Docker image build...")

    try:
        subprocess.run(
            ["docker", "build", "-t", image_name, tmp_dir],
            check=True,
            stdout=sys.stdout,
            stderr=sys.stderr,
            text=True
        )
        print("[SUCCESS] Docker image built successfully.")
    except subprocess.CalledProcessError as e:
        print("[ERROR] Docker image build failed.")
        return None, f"Build failed: {e}"

    # Run the container
    docker_run_cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "-p", f"{port}:22",
        "-v", f"{log_dir}:/var/log/ssh",
        image_name
    ]

    print("[INFO] Starting container with command:")
    print("       " + " ".join(docker_run_cmd))

    try:
        subprocess.run(docker_run_cmd, check=True, text=True)
        get_id_cmd = ["docker", "ps", "-q", "--filter", f"name={container_name}"]
        id_result = subprocess.run(get_id_cmd, capture_output=True, text=True)
        container_id = id_result.stdout.strip()
        print(f"[SUCCESS] Container started with ID: {container_id}")
        print(f"[INFO] Logs will be available in: {log_dir}")
        print("[INFO] Log files: auth.log (login attempts), commands.log (user commands), messages (system)")
        return container_id, None
    except subprocess.CalledProcessError as e:
        print("[ERROR] Failed to start container.")
        error_message = str(e)
        if "port is already allocated" in error_message or "Bind for" in error_message:
            return None, f"Port {port} is already in use. Please choose a different port."
        return None, f"Failed to start SSH: {error_message}"

if __name__ == "__main__":
    start({
        "port": 2222,
        "users": [
            {"username": "james", "password": "james", "sudo": True},
            {"username": "nihat", "password": "nihat", "sudo": False}
        ],
        "name": "ssh_honeypot",
        "banner": '''
        Welcome to SecureBank Production Server
        =======================================
        WARNING: This system is for authorized personnel only.
        All activities are monitored and logged.
        Unauthorized access is strictly prohibited.
        Last login: Mon July 4 11:45:32 2025 from 152.49.21.29
        ''',
        "passwd_chmod": "644",
        "shadow_chmod": "640"
    })