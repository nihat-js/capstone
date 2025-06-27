import os
import subprocess
import time

# Configuration
users = [
    {"username": "james", "password": "james"},
    {"username": "test", "password": "test"},
]
ssh_port = 2222
banner_text = "Welcome to my secure SSH server. Unauthorized access prohibited."

# Setup directories
os.makedirs("log", exist_ok=True)
build_dir = "build/ssh_honeypot_build"
os.makedirs(build_dir, exist_ok=True)

# Create Dockerfile
dockerfile_content = f"""
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y openssh-server openssl && \\
    mkdir /var/run/sshd

"""

for user in users:
    dockerfile_content += (
        f"RUN useradd -m {user['username']} -p $(openssl passwd -1 '{user['password']}')\n"
    )

dockerfile_content += f"""
# Create weak permissions
RUN chmod 775 /etc/shadow

# Add banner
RUN echo "{banner_text}" > /etc/issue.net

# Configure sshd
RUN echo "Port 22" > /etc/ssh/sshd_config && \\
    echo "PermitRootLogin yes" >> /etc/ssh/sshd_config && \\
    echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config && \\
    echo "PermitEmptyPasswords yes" >> /etc/ssh/sshd_config && \\
    echo "UsePAM no" >> /etc/ssh/sshd_config && \\
    echo "Banner /etc/issue.net" >> /etc/ssh/sshd_config

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
"""

# Write Dockerfile
dockerfile_path = os.path.join(build_dir, "Dockerfile")
with open(dockerfile_path, "w") as f:
    f.write(dockerfile_content)

# Build Docker image
print("Building SSH honeypot Docker image...")
subprocess.run(["docker", "build", "-t", "ssh-honeypot", "."], cwd=build_dir, check=True)

# Remove any existing container
subprocess.run(
    ["docker", "rm", "-f", "ssh_honeypot_container"],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

# Start Docker container
print("Starting SSH honeypot container...")
subprocess.run([
    "docker", "run", "-d",
    "--name", "ssh_honeypot_container",
    "-p", f"{ssh_port}:22",
    "ssh-honeypot"
], check=True)

print(f"SSH Honeypot running on port {ssh_port}. Logs will be saved in ./log/.")

# Log collection loop
log_file_path = "../logs/ssh_container_logs.txt"

print("Tailing SSH container logs... Press Ctrl+C to stop.")
with open(log_file_path, "wb") as log_file:
    log_process = subprocess.Popen(
        ["docker", "logs", "-f", "ssh_honeypot_container"],
        stdout=log_file,
        stderr=subprocess.STDOUT
    )

try:
    while True:
        time.sleep(5)
except KeyboardInterrupt:
    print("\nStopping SSH honeypot...")
    log_process.terminate()
    subprocess.run(["docker", "rm", "-f", "ssh_honeypot_container"])
