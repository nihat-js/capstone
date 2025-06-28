"""
FTP Honeypot Service
Provides FTP honeypot functionality
"""
import os
import subprocess
import time

# Configuration defaults
DEFAULT_USERS = [
    {"username": "james", "password": "james"},
    {"username": "test", "password": "test"},
]
DEFAULT_FTP_PORT = 2121
DEFAULT_BANNER = "Welcome to my anonymous FTP honeypot. Unauthorized access prohibited."

def start_ftp_honeypot(config):
    """Start FTP honeypot with given configuration"""
    try:
        # Extract configuration
        users = config.get('users', DEFAULT_USERS)
        ftp_port = config.get('port', DEFAULT_FTP_PORT)
        banner_text = config.get('banner', DEFAULT_BANNER)
        
        print(f"🚀 Starting FTP honeypot on port {ftp_port}")
        
        # Setup directories
        os.makedirs("services/log", exist_ok=True)
        os.makedirs("build/ftp_honeypot_build", exist_ok=True)

        # Create Dockerfile
        dockerfile_content = f"""FROM ubuntu:22.04

RUN apt-get update && apt-get install -y vsftpd db-util

# Create FTP users and directories
"""
        for user in users:
            dockerfile_content += f"""
# Create user {user['username']}
RUN useradd -m {user['username']} && \\
    echo "{user['username']}:{user['password']}" | chpasswd && \\
    mkdir -p /home/{user['username']}/ftp && \\
    chown {user['username']}:{user['username']} /home/{user['username']}/ftp && \\
    chmod 755 /home/{user['username']}/ftp
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
    echo "secure_chroot_dir=/var/run/vsftpd/empty" >> /etc/vsftpd.conf && \\
    echo "banner_file=/etc/issue.net" >> /etc/vsftpd.conf && \\
    echo "listen_port=21" >> /etc/vsftpd.conf

# Create secure chroot dir
RUN mkdir -p /var/run/vsftpd/empty && chmod 755 /var/run/vsftpd/empty

EXPOSE 21

CMD ["/usr/sbin/vsftpd", "/etc/vsftpd.conf"]
"""

        # Write Dockerfile
        dockerfile_path = os.path.join("build/ftp_honeypot_build", "Dockerfile")
        with open(dockerfile_path, "w") as f:
            f.write(dockerfile_content)

        print("Building FTP honeypot Docker image...")
        result = subprocess.run(["docker", "build", "-t", "ftp-honeypot", "."], 
                              cwd="build/ftp_honeypot_build", 
                              capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Docker build failed: {result.stderr}")
            return False

        # Remove any existing container
        subprocess.run(
            ["docker", "rm", "-f", "ftp_honeypot_container"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # Start Docker container
        print("Starting FTP honeypot container...")
        result = subprocess.run([
            "docker", "run", "-d",
            "--name", "ftp_honeypot_container",
            "-p", f"{ftp_port}:21",
            "ftp-honeypot"
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Failed to start FTP container: {result.stderr}")
            return False

        print(f"✅ FTP Honeypot running on port {ftp_port}")
        return True
        
    except Exception as e:
        print(f"❌ Error starting FTP honeypot: {e}")
        return False

def stop_ftp_honeypot(container_name="ftp_honeypot_container"):
    """Stop FTP honeypot container"""
    try:
        print(f"🛑 Stopping FTP honeypot: {container_name}")
        result = subprocess.run(["docker", "rm", "-f", container_name], 
                              capture_output=True, text=True)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error stopping FTP honeypot: {e}")
        return False

def get_ftp_honeypot_status(container_name="ftp_honeypot_container"):
    """Get FTP honeypot status"""
    try:
        result = subprocess.run(["docker", "ps", "--filter", f"name={container_name}", "--format", "{{.Status}}"], 
                              capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            return "running"
        return "stopped"
    except Exception as e:
        print(f"❌ Error getting FTP status: {e}")
        return "stopped"

def get_ftp_honeypot_logs(instance_id=None):
    """Get FTP honeypot logs"""
    try:
        log_file = "services/log/ftp_logs.txt"
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                return f.read()
        
        # Try to get logs from Docker container
        result = subprocess.run(["docker", "logs", "ftp_honeypot_container"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout
        
        return "No FTP logs available yet"
    except Exception as e:
        return f"Error reading FTP logs: {e}"

def list_running_ftp_honeypots():
    """List running FTP honeypot containers"""
    try:
        result = subprocess.run(["docker", "ps", "--filter", "name=ftp_honeypot", "--format", "{{.Names}}"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            containers = [name.strip() for name in result.stdout.strip().split('\n') if name.strip()]
            return containers
        return []
    except Exception as e:
        print(f"❌ Error listing FTP honeypots: {e}")
        return []
