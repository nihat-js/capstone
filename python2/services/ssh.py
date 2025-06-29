import subprocess
import uuid
import os
import sys
from app_config import log_dir, tmp_dir


def start(config):
    port = config["port"]
    users = config["users"]
    base_name = config.get("name", "ssh_")
    container_name = f"{base_name}_{port}_{str(uuid.uuid4())[:8]}"
    image_name = "ssh_image"

    print(f"[INFO] Preparing to start container '{container_name}' on port {port}")

    container_tmp_dir = os.path.join(tmp_dir, container_name)
    os.makedirs(container_tmp_dir, exist_ok=True)
    print(f"[INFO] Created temporary build directory at {container_tmp_dir}")

    ssh_log_dir = os.path.join(log_dir, "ssh", container_name)
    os.makedirs(ssh_log_dir, exist_ok=True)
    print(f"[INFO] Created SSH log directory at {ssh_log_dir}")

    # Dockerfile content with SSH setup
    dockerfile = f"""
    FROM ubuntu:20.04

    ENV DEBIAN_FRONTEND=noninteractive
    RUN apt-get update && apt-get install -y openssh-server sudo && \\
        mkdir /var/run/sshd && mkdir -p /var/log/ssh && echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config && \\
        echo 'LogLevel VERBOSE' >> /etc/ssh/sshd_config

    {"".join([
        f"RUN useradd -m {u['username']} && echo '{u['username']}:{u['password']}' | chpasswd && "
        + (f"usermod -aG sudo {u['username']} && " if u.get('sudo') else "")
        + f"mkdir -p /home/{u['username']}/.ssh && chmod 700 /home/{u['username']}/.ssh\n"
        for u in users
    ])}

    EXPOSE 22
    CMD ["/usr/sbin/sshd", "-D"]
    """

    dockerfile_path = os.path.join(container_tmp_dir, "Dockerfile")
    with open(dockerfile_path, "w") as f:
        f.write(dockerfile.strip() + "\n")

    print(f"[INFO] Dockerfile written to {dockerfile_path}")
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

    # Step 2: Run the container
    docker_run_cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "-p", f"{port}:22",
        "-v", f"{ssh_log_dir}:/var/log/ssh",  # logs inside container
        image_name
    ]

    print("[INFO] Starting container with command:")
    print("       " + " ".join(docker_run_cmd))

    try:
        result = subprocess.run(docker_run_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        container_id = result.stdout.strip()
        print(f"[SUCCESS] Container started with ID: {container_id}")
        return container_id, None
    except subprocess.CalledProcessError as e:
        print("[ERROR] Failed to start container.")
        print(f"[STDERR] {e.stderr.strip()}")
        return None, f"Run failed: {e.stderr.strip()}"
