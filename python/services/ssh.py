import os
import subprocess
import time
import json
from datetime import datetime

# Global state for running honeypots
_running_honeypots = {}

def sanitize_container_name(raw_name):
    """Sanitize container name to be Docker-safe"""
    if not raw_name or raw_name.strip() == '':
        raw_name = 'default_honeypot'
        
    safe_name = raw_name.replace(' ', '_').lower()
    safe_name = ''.join(c for c in safe_name if c.isalnum() or c == '_')
    
    if not safe_name:
        safe_name = 'default_honeypot'
        
    # Add timestamp to make it unique
    timestamp = str(int(time.time()))[-6:]
    return f"ssh_honeypot_{safe_name}_{timestamp}"

def create_honeypot_paths(container_name):
    """Create and return paths for honeypot files"""
    build_dir = f"build/{container_name}_build"
    log_file = f"services/log/ssh_{container_name}_logs.txt"
    
    # Ensure directories exist
    os.makedirs("services/log", exist_ok=True)
    os.makedirs(build_dir, exist_ok=True)
    
    return {
        'container_name': container_name,
        'build_dir': build_dir,
        'log_file': log_file
    }

def create_users_list(config):
    """Create users list with CTF-style weak credentials"""
    users = []
    
    # Default CTF-style accounts
    users.extend([
        "admin:admin",
        "root:password",
        "test:test",
        "guest:guest",
        "admin:password",
        "user:user",
        "demo:demo",
        "ftp:ftp",
        "operator:operator",
        "support:support"
    ])
    
    # Quick template defaults based on config
    template = config.get('template', '')
    if template:
        template_users = {
            'default': [],  # Already added above
            'weak_passwords': [
                "administrator:123456",
                "manager:manager",
                "service:service",
                "backup:backup",
                "temp:temp",
                "dev:dev"
            ],
            'common_accounts': [
                "oracle:oracle",
                "postgres:postgres",
                "mysql:mysql",
                "apache:apache",
                "nginx:nginx",
                "tomcat:tomcat"
            ],
            'iot_default': [
                "admin:1234",
                "root:root",
                "ubnt:ubnt",
                "support:support",
                "pi:raspberry",
                "camera:camera"
            ]
        }
        users.extend(template_users.get(template, []))
    
    # Add custom users
    for user in config.get('users', []):
        username = user.get('username', '').strip()
        password = user.get('password', '').strip()
        if username and password:
            users.append(f"{username}:{password}")
    
    return users

def create_sshd_config(config):
    """Generate sshd_config with security weaknesses"""
    sshd_config = f"""Port {config.get('port', 22)}
Protocol 2
UsePrivilegeSeparation no
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PermitEmptyPasswords yes
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding yes
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
MaxAuthTries 1000
LoginGraceTime 300
ClientAliveInterval 60
ClientAliveCountMax 3
LogLevel VERBOSE
SyslogFacility AUTH
Banner /etc/issue.net
"""
    return sshd_config

def create_dockerfile(config, paths):
    """Generate Dockerfile for SSH honeypot"""
    users_list = create_users_list(config)
    
    dockerfile_content = f"""FROM ubuntu:20.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install SSH server and other utilities
RUN apt-get update
RUN apt-get install -y openssh-server sudo nano vim curl wget
RUN mkdir /var/run/sshd

# Create users with weak passwords
"""
    
    for user_pass in users_list:
        if ':' in user_pass:
            username, password = user_pass.split(':', 1)
            dockerfile_content += f'RUN useradd -m -s /bin/bash {username}\n'
            dockerfile_content += f'RUN echo "{username}:{password}" | chpasswd\n'
            dockerfile_content += f'RUN usermod -aG sudo {username}\n'
    
    dockerfile_content += f"""
# Copy SSH configuration
COPY sshd_config /etc/ssh/sshd_config

# Set up SSH host keys
RUN ssh-keygen -A

# Create fake interesting files (CTF-style)
RUN mkdir -p /home/shared /var/backups /etc/myapp /var/log/myapp
RUN echo "Welcome to the corporate server!" > /etc/motd
RUN echo "Confidential: Database backup location: /backup/db_backup.sql" > /home/shared/readme.txt
RUN echo "flag{{ssh_honeypot_accessed}}" > /home/admin/flag.txt
RUN echo "CREATE DATABASE company_db; INSERT INTO users VALUES ('admin', 'plaintext_password');" > /var/backups/database_dump.sql
RUN echo "database_host=192.168.1.100" > /etc/myapp/config.ini
RUN echo "database_password=weak_password" >> /etc/myapp/config.ini
RUN echo "secret_key=hardcoded_secret_123" >> /etc/myapp/config.ini
RUN echo "2024-01-01 12:00:00 - Admin login from 192.168.1.50" > /var/log/myapp/access.log

# Create custom banner
RUN echo "{config.get('banner', 'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1')}" > /etc/issue.net

# Create startup script
RUN echo '#!/bin/bash' > /start.sh
RUN echo 'echo "Starting SSH Honeypot..."' >> /start.sh
RUN echo 'echo "$(date): SSH Honeypot started" >> /var/log/ssh_honeypot.log' >> /start.sh
RUN echo 'service ssh start' >> /start.sh
RUN echo 'tail -f /var/log/auth.log /var/log/ssh_honeypot.log' >> /start.sh
RUN chmod +x /start.sh

# Expose SSH port
EXPOSE {config.get('port', 22)}

# Start SSH service
CMD ["/start.sh"]
"""
    
    # Write Dockerfile
    dockerfile_path = os.path.join(paths['build_dir'], "Dockerfile")
    with open(dockerfile_path, "w") as f:
        f.write(dockerfile_content)
    
    # Write sshd_config
    sshd_config_path = os.path.join(paths['build_dir'], "sshd_config")
    with open(sshd_config_path, "w") as f:
        f.write(create_sshd_config(config))
    
    print(f"Created Dockerfile at: {dockerfile_path}")
    print(f"Created sshd_config at: {sshd_config_path}")
    return dockerfile_path

def build_docker_image(config, paths):
    """Build Docker image for SSH honeypot"""
    try:
        print(f"🔨 Building SSH honeypot Docker image: {paths['container_name']}")
        
        # Validate container name
        if not paths['container_name'] or paths['container_name'].endswith('_'):
            raise ValueError(f"Invalid container name: '{paths['container_name']}'")
        
        result = subprocess.run(
            ["docker", "build", "-t", paths['container_name'], "."],
            cwd=paths['build_dir'],
            check=True,
            capture_output=True,
            text=True
        )
        print(f"✅ Docker image built successfully: {paths['container_name']}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to build Docker image: {e}")
        print(f"   Container name: {paths['container_name']}")
        print(f"   Build directory: {paths['build_dir']}")
        if e.stderr:
            print(f"   Error output: {e.stderr}")
        if e.stdout:
            print(f"   Output: {e.stdout}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error building Docker image: {e}")
        print(f"   Container name: {paths['container_name']}")
        return False

def start_docker_container(config, paths):
    """Start the SSH honeypot container"""
    try:
        print(f"🐳 Starting SSH honeypot container: {paths['container_name']}")
        
        # Remove any existing container with the same name
        subprocess.run(
            ["docker", "rm", "-f", paths['container_name']],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
        # Start new container
        port = config.get('port', 2222)
        print(f"   Mapping port {port}:22")
        
        result = subprocess.run([
            "docker", "run", "-d",
            "--name", paths['container_name'],
            "-p", f"{port}:22",
            paths['container_name']
        ], check=True, capture_output=True, text=True)
        
        print(f"✅ SSH Honeypot container started: {paths['container_name']} on port {port}")
        print(f"   Container ID: {result.stdout.strip()[:12]}...")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start container: {e}")
        print(f"   Container name: {paths['container_name']}")
        print(f"   Port mapping: {config.get('port', 2222)}:22")
        if e.stderr:
            print(f"   Error output: {e.stderr}")
        if e.stdout:
            print(f"   Output: {e.stdout}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error starting container: {e}")
        return False

def start_logging(config, paths):
    """Start collecting logs from the container"""
    try:
        with open(paths['log_file'], "w") as log_file:
            # Write initial log entry
            log_file.write(f"=== SSH Honeypot Started at {datetime.now()} ===\n")
            log_file.write(f"Configuration: {json.dumps(config, indent=2)}\n")
            log_file.write("=== Container Logs ===\n")
            log_file.flush()
            
            # Start following container logs in background
            log_process = subprocess.Popen(
                ["docker", "logs", "-f", paths['container_name']],
                stdout=log_file,
                stderr=subprocess.STDOUT
            )
        
        print(f"Started logging to: {paths['log_file']}")
        return log_process
        
    except Exception as e:
        print(f"Failed to start logging: {e}")
        return None

def start_ssh_honeypot(config):
    """Start the SSH honeypot - main entry point"""
    try:
        print(f"Starting SSH honeypot: {config['name']}")
        
        # Sanitize and create paths
        container_name = sanitize_container_name(config.get('name', 'default'))
        paths = create_honeypot_paths(container_name)
        
        # Create Dockerfile and configs
        create_dockerfile(config, paths)
        
        # Build Docker image
        if not build_docker_image(config, paths):
            return False
        
        # Start container
        if not start_docker_container(config, paths):
            return False
        
        # Start logging
        log_process = start_logging(config, paths)
        
        # Store running honeypot info
        _running_honeypots[paths['container_name']] = {
            'config': config,
            'paths': paths,
            'log_process': log_process,
            'started_at': datetime.now().isoformat()
        }
        
        print(f"SSH honeypot '{config['name']}' is running on port {config.get('port', 2222)}")
        return True
        
    except Exception as e:
        print(f"Failed to start SSH honeypot: {e}")
        return False

def stop_ssh_honeypot(container_name):
    """Stop the SSH honeypot"""
    try:
        print(f"Stopping SSH honeypot: {container_name}")
        
        # Get honeypot info
        honeypot_info = _running_honeypots.get(container_name)
        
        # Stop log collection
        if honeypot_info and honeypot_info['log_process']:
            honeypot_info['log_process'].terminate()
            honeypot_info['log_process'].wait()
        
        # Stop and remove container
        subprocess.run(["docker", "rm", "-f", container_name], 
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Write final log entry
        if honeypot_info:
            log_file = honeypot_info['paths']['log_file']
            with open(log_file, "a") as f:
                f.write(f"\n=== SSH Honeypot Stopped at {datetime.now()} ===\n")
        
        # Remove from running honeypots
        if container_name in _running_honeypots:
            del _running_honeypots[container_name]
        
        print(f"SSH honeypot stopped: {container_name}")
        return True
        
    except Exception as e:
        print(f"Failed to stop SSH honeypot: {e}")
        return False

def get_ssh_honeypot_status(container_name):
    """Get the current status of the honeypot"""
    try:
        result = subprocess.run(
            ["docker", "ps", "--filter", f"name={container_name}", "--format", "{{.Status}}"],
            capture_output=True,
            text=True
        )
        
        if result.stdout.strip():
            return "running"
        else:
            return "stopped"
            
    except Exception as e:
        print(f"Failed to get status: {e}")
        return "unknown"

def get_ssh_honeypot_logs(container_name):
    """Get the current logs"""
    try:
        honeypot_info = _running_honeypots.get(container_name)
        if honeypot_info:
            log_file = honeypot_info['paths']['log_file']
            if os.path.exists(log_file):
                with open(log_file, 'r') as f:
                    return f.read()
        
        return "No logs available."
    except Exception as e:
        return f"Error reading logs: {e}"

def list_running_ssh_honeypots():
    """List all running SSH honeypots"""
    return list(_running_honeypots.keys())

def get_running_honeypot_info(container_name):
    """Get info about a running honeypot"""
    return _running_honeypots.get(container_name)

def cleanup_stopped_honeypots():
    """Clean up honeypots that are no longer running"""
    to_remove = []
    for container_name in _running_honeypots:
        if get_ssh_honeypot_status(container_name) == "stopped":
            to_remove.append(container_name)
    
    for container_name in to_remove:
        print(f"Cleaning up stopped honeypot: {container_name}")
        if container_name in _running_honeypots:
            del _running_honeypots[container_name]


        """Create Dockerfile based on configuration"""
        users = self.config.get('fakeUsers', [
            {"username": "admin", "password": "admin123", "shell": "/bin/bash"},
            {"username": "root", "password": "password", "shell": "/bin/bash"},
            {"username": "user", "password": "123456", "shell": "/bin/sh"}
        ])
        port = self.config.get('port', 2222)
        banner = self.config.get('banner', 'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1')
        
        dockerfile_content = f"""
FROM ubuntu:22.04

# Set environment variables to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update and install SSH server and utilities
RUN apt-get update && apt-get install -y \\
    openssh-server \\
    openssl \\
    nano \\
    vim \\
    wget \\
    curl \\
    netcat \\
    python3 \\
    python3-pip \\
    && mkdir /var/run/sshd

"""
        
        # Add fake users with different security levels
        for user in users:
            username = user.get('username', 'test')
            password = user.get('password', 'test')
            shell = user.get('shell', '/bin/bash')
            
            # Create user with home directory
            dockerfile_content += f"RUN useradd -m {username} -s {shell} -p $(openssl passwd -1 '{password}')\n"
            
            # Create some interesting files in user's home directory
            if username == "admin":
                dockerfile_content += f"""RUN mkdir -p /home/{username}/documents /home/{username}/scripts /home/{username}/.ssh
RUN echo 'Database Password: db_password_123' > /home/{username}/documents/credentials.txt
RUN echo '#!/bin/bash\necho "Backup completed successfully"' > /home/{username}/scripts/backup.sh
RUN chmod +x /home/{username}/scripts/backup.sh
RUN echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDhA...' > /home/{username}/.ssh/authorized_keys
RUN chmod 600 /home/{username}/.ssh/authorized_keys
RUN chown -R {username}:{username} /home/{username}
"""
            elif username == "root":
                dockerfile_content += f"""RUN mkdir -p /root/admin /root/.ssh
RUN echo 'MYSQL_ROOT_PASSWORD=super_secret_2024' > /root/admin/db_config.txt
RUN echo 'API_KEY=sk-1234567890abcdef' > /root/admin/api_keys.txt
RUN echo 'Production server access logs' > /root/admin/access.log
RUN chmod 600 /root/admin/*
"""
        
        # Add interesting system files with weak permissions (CTF-style)
        fake_files = self.config.get('fakeFiles', [])
        for fake_file in fake_files:
            file_path = fake_file.get('path', '')
            content = fake_file.get('content', '')
            if file_path and content:
                # Escape content for shell
                escaped_content = content.replace("'", "'\"'\"'").replace("\\", "\\\\")
                dockerfile_content += f"RUN mkdir -p $(dirname {file_path}) && echo '{escaped_content}' > {file_path}\n"
        
        # Add default interesting files
        dockerfile_content += """
# Create fake sensitive files with weak permissions
RUN echo 'admin:$6$salt$hash...:18000:0:99999:7:::' >> /etc/shadow
RUN echo 'root:$6$salt$anotherhash...:18000:0:99999:7:::' >> /etc/shadow
RUN chmod 644 /etc/shadow

# Create fake database dump
RUN mkdir -p /var/backups
RUN echo 'CREATE DATABASE company_db;' > /var/backups/database_dump.sql
RUN echo 'INSERT INTO users (username, password) VALUES ("admin", "plaintext_password");' >> /var/backups/database_dump.sql
RUN echo 'INSERT INTO customers (name, credit_card) VALUES ("John Doe", "4532-1234-5678-9012");' >> /var/backups/database_dump.sql
RUN chmod 644 /var/backups/database_dump.sql

# Create fake configuration files
RUN mkdir -p /etc/myapp
RUN echo 'database_host=192.168.1.100' > /etc/myapp/config.ini
RUN echo 'database_user=root' >> /etc/myapp/config.ini
RUN echo 'database_password=weak_password' >> /etc/myapp/config.ini
RUN echo 'secret_key=hardcoded_secret_123' >> /etc/myapp/config.ini
RUN chmod 644 /etc/myapp/config.ini

# Create fake log files
RUN mkdir -p /var/log/myapp
RUN echo '2024-01-01 12:00:00 - Admin login from 192.168.1.50' > /var/log/myapp/access.log
RUN echo '2024-01-01 12:05:00 - Failed login attempt for root from 10.0.0.1' >> /var/log/myapp/access.log
RUN echo '2024-01-01 12:10:00 - Database backup completed' >> /var/log/myapp/access.log
RUN chmod 644 /var/log/myapp/access.log

# Create fake private keys (for demonstration only)
RUN mkdir -p /home/admin/.ssh
RUN echo '-----BEGIN OPENSSH PRIVATE KEY-----' > /home/admin/.ssh/id_rsa
RUN echo 'b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdzc2gtcn' >> /home/admin/.ssh/id_rsa
RUN echo '(This is a fake private key for honeypot purposes)' >> /home/admin/.ssh/id_rsa
RUN echo '-----END OPENSSH PRIVATE KEY-----' >> /home/admin/.ssh/id_rsa
RUN chmod 600 /home/admin/.ssh/id_rsa
RUN chown admin:admin /home/admin/.ssh/id_rsa

# Create fake network configuration
RUN echo 'auto eth0' > /etc/network/interfaces.d/eth0.cfg
RUN echo 'iface eth0 inet static' >> /etc/network/interfaces.d/eth0.cfg
RUN echo 'address 192.168.1.100' >> /etc/network/interfaces.d/eth0.cfg
RUN echo 'netmask 255.255.255.0' >> /etc/network/interfaces.d/eth0.cfg
RUN echo 'gateway 192.168.1.1' >> /etc/network/interfaces.d/eth0.cfg

"""
        
        # Configure SSH with intentionally weak settings
        dockerfile_content += f"""
# Add custom banner
RUN echo "{banner}" > /etc/issue.net

# Configure SSH server with weak security (for honeypot purposes)
RUN echo "Port 22" > /etc/ssh/sshd_config && \\
    echo "Protocol 2" >> /etc/ssh/sshd_config && \\
    echo "PermitRootLogin yes" >> /etc/ssh/sshd_config && \\
    echo "PasswordAuthentication {'yes' if self.config.get('enablePasswordAuth', True) else 'no'}" >> /etc/ssh/sshd_config && \\
    echo "PubkeyAuthentication {'yes' if self.config.get('enableKeyAuth', False) else 'no'}" >> /etc/ssh/sshd_config && \\
    echo "PermitEmptyPasswords no" >> /etc/ssh/sshd_config && \\
    echo "UsePAM no" >> /etc/ssh/sshd_config && \\
    echo "Banner /etc/issue.net" >> /etc/ssh/sshd_config && \\
    echo "ClientAliveInterval 60" >> /etc/ssh/sshd_config && \\
    echo "ClientAliveCountMax 3" >> /etc/ssh/sshd_config && \\
    echo "MaxAuthTries 6" >> /etc/ssh/sshd_config && \\
    echo "MaxSessions {self.config.get('maxConnections', 10)}" >> /etc/ssh/sshd_config && \\
    echo "LoginGraceTime {self.config.get('sessionTimeout', 300)}" >> /etc/ssh/sshd_config && \\
    echo "LogLevel VERBOSE" >> /etc/ssh/sshd_config && \\
    echo "SyslogFacility AUTH" >> /etc/ssh/sshd_config

# Create custom SSH logging script
RUN echo '#!/bin/bash' > /usr/local/bin/ssh_logger.sh && \\
    echo 'exec > >(logger -t ssh-honeypot -p auth.info)' >> /usr/local/bin/ssh_logger.sh && \\
    echo 'exec 2>&1' >> /usr/local/bin/ssh_logger.sh && \\
    echo 'while IFS= read -r line; do' >> /usr/local/bin/ssh_logger.sh && \\
    echo '  echo "$(date): $line"' >> /usr/local/bin/ssh_logger.sh && \\
    echo '  echo "$(date): $line" >> /var/log/ssh_honeypot.log' >> /usr/local/bin/ssh_logger.sh && \\
    echo 'done' >> /usr/local/bin/ssh_logger.sh && \\
    chmod +x /usr/local/bin/ssh_logger.sh

# Create startup script
RUN echo '#!/bin/bash' > /usr/local/bin/start_honeypot.sh && \\
    echo 'echo "Starting SSH Honeypot..."' >> /usr/local/bin/start_honeypot.sh && \\
    echo 'echo "$(date): SSH Honeypot started" >> /var/log/ssh_honeypot.log' >> /usr/local/bin/start_honeypot.sh && \\
    echo '/usr/sbin/sshd -D -f /etc/ssh/sshd_config -E /var/log/ssh_honeypot.log' >> /usr/local/bin/start_honeypot.sh && \\
    chmod +x /usr/local/bin/start_honeypot.sh

# Create some fake processes script
RUN echo '#!/bin/bash' > /usr/local/bin/fake_processes.sh && \\
    echo 'sleep infinity &' >> /usr/local/bin/fake_processes.sh && \\
    echo 'python3 -c "import time; time.sleep(999999)" &' >> /usr/local/bin/fake_processes.sh && \\
    chmod +x /usr/local/bin/fake_processes.sh

EXPOSE 22

# Start SSH daemon with logging
CMD ["/usr/local/bin/start_honeypot.sh"]
"""
        
        # Write Dockerfile
        dockerfile_path = os.path.join(self.build_dir, "Dockerfile")
        with open(dockerfile_path, "w") as f:
            f.write(dockerfile_content)
        
        print(f"Created Dockerfile at: {dockerfile_path}")
        return dockerfile_path
    
    def build_image(self):
        """Build Docker image for SSH honeypot"""
        try:
            print(f"🔨 Building SSH honeypot Docker image: {self.container_name}")
            
            # Validate container name
            if not self.container_name or self.container_name.endswith('_'):
                raise ValueError(f"Invalid container name: '{self.container_name}'")
            
            result = subprocess.run(
                ["docker", "build", "-t", self.container_name, "."],
                cwd=self.build_dir,
                check=True,
                capture_output=True,
                text=True
            )
            print(f"✅ Docker image built successfully: {self.container_name}")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to build Docker image: {e}")
            print(f"   Container name: {self.container_name}")
            print(f"   Build directory: {self.build_dir}")
            if e.stderr:
                print(f"   Error output: {e.stderr}")
            if e.stdout:
                print(f"   Output: {e.stdout}")
            return False
        except Exception as e:
            print(f"❌ Unexpected error building Docker image: {e}")
            print(f"   Container name: {self.container_name}")
            return False
    
    def start_container(self):
        """Start the SSH honeypot container"""
        try:
            print(f"🐳 Starting SSH honeypot container: {self.container_name}")
            
            # Remove any existing container with the same name
            subprocess.run(
                ["docker", "rm", "-f", self.container_name],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            # Start new container
            port = self.config.get('port', 2222)
            print(f"   Mapping port {port}:22")
            
            result = subprocess.run([
                "docker", "run", "-d",
                "--name", self.container_name,
                "-p", f"{port}:22",
                self.container_name
            ], check=True, capture_output=True, text=True)
            
            print(f"✅ SSH Honeypot container started: {self.container_name} on port {port}")
            print(f"   Container ID: {result.stdout.strip()[:12]}...")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to start container: {e}")
            print(f"   Container name: {self.container_name}")
            print(f"   Port mapping: {self.config.get('port', 2222)}:22")
            if e.stderr:
                print(f"   Error output: {e.stderr}")
            if e.stdout:
                print(f"   Output: {e.stdout}")
            return False
        except Exception as e:
            print(f"❌ Unexpected error starting container: {e}")
            return False
    
    def start_logging(self):
        """Start collecting logs from the container"""
        try:
            with open(self.log_file, "w") as log_file:
                # Write initial log entry
                log_file.write(f"=== SSH Honeypot Started at {datetime.now()} ===\n")
                log_file.write(f"Configuration: {json.dumps(self.config, indent=2)}\n")
                log_file.write("=== Container Logs ===\n")
                log_file.flush()
                
                # Start following container logs
                self.log_process = subprocess.Popen(
                    ["docker", "logs", "-f", self.container_name],
                    stdout=log_file,
                    stderr=subprocess.STDOUT
                )
            
            print(f"Started logging to: {self.log_file}")
            return True
            
        except Exception as e:
            print(f"Failed to start logging: {e}")
            return False
    
    def start(self):
        """Start the SSH honeypot"""
        try:
            print(f"Starting SSH honeypot: {self.config['name']}")
            
            # Create Dockerfile
            self.create_dockerfile()
            
            # Build Docker image
            if not self.build_image():
                return False
            
            # Start container
            if not self.start_container():
                return False
            
            # Start logging
            if not self.start_logging():
                return False
            
            self.is_running = True
            print(f"SSH honeypot '{self.config['name']}' is running on port {self.config.get('port', 2222)}")
            return True
            
        except Exception as e:
            print(f"Failed to start SSH honeypot: {e}")
            return False
    
    def stop(self):
        """Stop the SSH honeypot"""
        try:
            print(f"Stopping SSH honeypot: {self.container_name}")
            
            # Stop log collection
            if self.log_process:
                self.log_process.terminate()
                self.log_process.wait()
                self.log_process = None
            
            # Stop and remove container
            subprocess.run(["docker", "rm", "-f", self.container_name], 
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            # Write final log entry
            with open(self.log_file, "a") as log_file:
                log_file.write(f"\n=== SSH Honeypot Stopped at {datetime.now()} ===\n")
            
            self.is_running = False
            print(f"SSH honeypot stopped: {self.container_name}")
            return True
            
        except Exception as e:
            print(f"Failed to stop SSH honeypot: {e}")
            return False
    
    def get_status(self):
        """Get the current status of the honeypot"""
        try:
            result = subprocess.run(
                ["docker", "ps", "--filter", f"name={self.container_name}", "--format", "{{.Status}}"],
                capture_output=True,
                text=True
            )
            
            if result.stdout.strip():
                return "running"
            else:
                return "stopped"
                
        except Exception as e:
            print(f"Failed to get status: {e}")
            return "unknown"
    
    def get_logs(self):
        """Get the current logs"""
        try:
            if os.path.exists(self.log_file):
                with open(self.log_file, 'r') as f:
                    return f.read()
            else:
                return "No logs available."
        except Exception as e:
            return f"Error reading logs: {e}"
