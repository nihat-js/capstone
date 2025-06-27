import os
import subprocess
import time

# Configuration
users = [
    {"username": "james", "password": "james"},
    {"username": "test", "password": "test"},
]
ftp_port = 2121
banner_text = "Welcome to my anonymous FTP honeypot. Unauthorized access prohibited."

# Setup directories
os.makedirs("log", exist_ok=True)
os.makedirs("build/ftp_honeypot_build", exist_ok=True)

# Create Dockerfile
dockerfile_content = f"""
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y vsftpd db-util

# Create FTP users and directories
"""
for user in users:
    dockerfile_content += f"""
# Create user {user['username']} with non-writable home
RUN useradd -m {user['username']} && \\
    echo "{user['username']}:{user['password']}" | chpasswd && \\
    chmod 555 /home/{user['username']}  # read & execute only
"""

dockerfile_content += f"""
# Anonymous FTP setup
RUN mkdir -p /home/ftp/anon_upload && \\
    chmod -R 755 /home/ftp && \\
    chown -R ftp:ftp /home/ftp

# Add banner message
RUN echo "{banner_text}" > /etc/issue.net

# Configure vsftpd
RUN echo "listen=YES" > /etc/vsftpd.conf && \\
    echo "listen_ipv6=NO" >> /etc/vsftpd.conf && \\
    echo "anonymous_enable=YES" >> /etc/vsftpd.conf && \\
    echo "local_enable=YES" >> /etc/vsftpd.conf && \\
    echo "write_enable=YES" >> /etc/vsftpd.conf && \\
    echo "anon_upload_enable=YES" >> /etc/vsftpd.conf && \\
    echo "anon_mkdir_write_enable=YES" >> /etc/vsftpd.conf && \\
    echo "anon_root=/home/ftp" >> /etc/vsftpd.conf && \\
    echo "local_umask=022" >> /etc/vsftpd.conf && \\
    echo "dirmessage_enable=YES" >> /etc/vsftpd.conf && \\
    echo "use_localtime=YES" >> /etc/vsftpd.conf && \\
    echo "xferlog_enable=YES" >> /etc/vsftpd.conf && \\
    echo "connect_from_port_20=YES" >> /etc/vsftpd.conf && \\
    echo "chroot_local_user=YES" >> /etc/vsftpd.conf && \\
    echo "allow_writeable_chroot=YES" >> /etc/vsftpd.conf && \\
    echo "secure_chroot_dir=/var/run/vsftpd/empty" >> /etc/vsftpd.conf && \\
    echo "banner_file=/etc/issue.net" >> /etc/vsftpd.conf && \\
    echo "listen_port=21" >> /etc/vsftpd.conf

# Create secure chroot dir
RUN mkdir -p /var/run/vsftpd/empty && chmod 755 /var/run/vsftpd/empty

EXPOSE 21

CMD ["/usr/sbin/vsftpd", "/etc/vsftpd.conf"]
"""

# Write Dockerfile
with open("build/ftp_honeypot_build/Dockerfile", "w") as f:
    f.write(dockerfile_content)

# Build Docker image
print("Building FTP honeypot Docker image with anonymous login...")
subprocess.run(["docker", "build", "-t", "ftp-honeypot", "."], cwd="build/ftp_honeypot_build", check=True)

# Remove any existing container
subprocess.run(
    ["docker", "rm", "-f", "ftp_honeypot_container"],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

# Start Docker container
print("Starting FTP honeypot container...")
subprocess.run([
    "docker", "run", "-d",
    "--name", "ftp_honeypot_container",
    "-p", f"{ftp_port}:21",
    "ftp-honeypot"
], check=True)

print(f"FTP Honeypot (with anonymous and local login) running on port {ftp_port}. Logs will be saved in ./log/.")

# Log collection loop
log_file_path = "log/ftp_container_logs.txt"

print("Tailing FTP container logs... Press Ctrl+C to stop.")
with open(log_file_path, "wb") as log_file:
    log_process = subprocess.Popen(
        ["docker", "logs", "-f", "ftp_honeypot_container"],
        stdout=log_file,
        stderr=subprocess.STDOUT
    )

try:
    while True:
        time.sleep(5)
except KeyboardInterrupt:
    print("\nStopping FTP honeypot...")
    log_process.terminate()
    subprocess.run(["docker", "rm", "-f", "ftp_honeypot_container"])
