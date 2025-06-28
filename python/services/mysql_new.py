"""
MySQL Honeypot Service
Provides MySQL honeypot functionality
"""
import os
import subprocess
import time
import shutil

# Configuration defaults
DEFAULT_MYSQL_ROOT_PASSWORD = "rootpassword"
DEFAULT_MYSQL_DATABASE = "finance"
DEFAULT_MYSQL_USER = "james"
DEFAULT_MYSQL_PASSWORD = "james"
DEFAULT_MYSQL_PORT = 3306

def start_mysql_honeypot(config):
    """Start MySQL honeypot with given configuration"""
    try:
        # Extract configuration
        mysql_root_password = config.get('root_password', DEFAULT_MYSQL_ROOT_PASSWORD)
        mysql_database = config.get('database', DEFAULT_MYSQL_DATABASE)
        mysql_user = config.get('user', DEFAULT_MYSQL_USER)
        mysql_password = config.get('password', DEFAULT_MYSQL_PASSWORD)
        mysql_port = config.get('port', DEFAULT_MYSQL_PORT)
        
        print(f"🚀 Starting MySQL honeypot on port {mysql_port}")
        
        build_dir = "build/mysql"
        sql_source_path = "../../assets/sql/banking_Database.sql"
        sql_dest_path = os.path.join(build_dir, "banking_Database.sql")

        os.makedirs(build_dir, exist_ok=True)
        os.makedirs("services/log", exist_ok=True)

        # Check if SQL file exists, if not create a basic one
        if not os.path.isfile(sql_source_path):
            print(f"⚠️  SQL dump file not found at {sql_source_path}, creating basic database")
            basic_sql = f"""CREATE DATABASE IF NOT EXISTS {mysql_database};
USE {mysql_database};

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(50),
    email VARCHAR(100)
);

INSERT INTO users (username, password, email) VALUES 
('admin', 'admin123', 'admin@company.com'),
('user', 'password', 'user@company.com'),
('test', 'test123', 'test@company.com');

CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20),
    balance DECIMAL(10,2),
    user_id INT
);

INSERT INTO accounts (account_number, balance, user_id) VALUES 
('1234567890', 1000.00, 1),
('0987654321', 2500.50, 2),
('1111222233', 500.75, 3);
"""
            with open(sql_dest_path, 'w') as f:
                f.write(basic_sql)
        else:
            shutil.copy(sql_source_path, sql_dest_path)

        # Create Dockerfile content
        dockerfile_content = f"""FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD={mysql_root_password}
ENV MYSQL_DATABASE={mysql_database}
ENV MYSQL_USER={mysql_user}
ENV MYSQL_PASSWORD={mysql_password}

COPY banking_Database.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
"""

        # Write Dockerfile
        dockerfile_path = os.path.join(build_dir, "Dockerfile")
        with open(dockerfile_path, "w") as f:
            f.write(dockerfile_content)

        print("Building MySQL honeypot Docker image...")
        result = subprocess.run(["docker", "build", "-t", "mysql-honeypot", "."], 
                              cwd=build_dir, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Docker build failed: {result.stderr}")
            return False

        # Remove existing container if running
        subprocess.run(
            ["docker", "rm", "-f", "mysql_honeypot_container"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # Run MySQL container
        print("Starting MySQL honeypot container...")
        result = subprocess.run([
            "docker", "run", "-d",
            "--name", "mysql_honeypot_container",
            "-p", f"{mysql_port}:3306",
            "mysql-honeypot"
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Failed to start MySQL container: {result.stderr}")
            return False

        print(f"✅ MySQL honeypot running on port {mysql_port}")
        return True
        
    except Exception as e:
        print(f"❌ Error starting MySQL honeypot: {e}")
        return False

def stop_mysql_honeypot(container_name="mysql_honeypot_container"):
    """Stop MySQL honeypot container"""
    try:
        print(f"🛑 Stopping MySQL honeypot: {container_name}")
        result = subprocess.run(["docker", "rm", "-f", container_name], 
                              capture_output=True, text=True)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error stopping MySQL honeypot: {e}")
        return False

def get_mysql_honeypot_status(container_name="mysql_honeypot_container"):
    """Get MySQL honeypot status"""
    try:
        result = subprocess.run(["docker", "ps", "--filter", f"name={container_name}", "--format", "{{.Status}}"], 
                              capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            return "running"
        return "stopped"
    except Exception as e:
        print(f"❌ Error getting MySQL status: {e}")
        return "stopped"

def get_mysql_honeypot_logs(instance_id=None):
    """Get MySQL honeypot logs"""
    try:
        log_file = "services/log/mysql_logs.txt"
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                return f.read()
        
        # Try to get logs from Docker container
        result = subprocess.run(["docker", "logs", "mysql_honeypot_container"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout
        
        return "No MySQL logs available yet"
    except Exception as e:
        return f"Error reading MySQL logs: {e}"

def list_running_mysql_honeypots():
    """List running MySQL honeypot containers"""
    try:
        result = subprocess.run(["docker", "ps", "--filter", "name=mysql_honeypot", "--format", "{{.Names}}"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            containers = [name.strip() for name in result.stdout.strip().split('\n') if name.strip()]
            return containers
        return []
    except Exception as e:
        print(f"❌ Error listing MySQL honeypots: {e}")
        return []
