import subprocess
import time
import sys
import uuid
import os
from os import path, getenv
from datetime import datetime
# config = {
#     name="mysql_simple",
#     port=3307,
#     root_password="root",
#     user="testuser",
#     user_password="testpass"
# }

log_dir = path.abspath(path.join(getenv("log_dir","../../logs"),"mysql"))
os.makedirs(log_dir, exist_ok=True)

def start(config):
    name = config.get("name", "mysql_simple")
    port = config.get("port", 3307)
    root_password = config.get("root_password", "root")
    
    # Create unique container name
    container_name = f"{name}_{port}_{str(uuid.uuid4())[:8]}"
    
    # Remove existing container if it exists
    subprocess.run(["docker", "rm", "-f", container_name])

    # Simple Docker command
    cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "-e", f"MYSQL_ROOT_PASSWORD={root_password}",
        "-p", f"{port}:3306",
        "mysql:5.7"
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            container_id = result.stdout.strip()
            return container_id, None
        else:
            return None, f"Failed to start MySQL: {result.stderr}"
    except Exception as e:
        return None, f"Error starting MySQL: {str(e)}"

# Example usage
if __name__ == "__main__":
    import sys
    
    # Start honeypot mode
    config = {
        "name": "mysql_honeypot",
        "port": 3307,
        "root_password": "admin123"
    }
    container_id, error = start(config)
    if container_id:
        print(f"🎯 MySQL Honeypot started successfully!")
        print(f"📋 Container ID: {container_id}")
        print(f"🌐 Connection: mysql://root:admin123@localhost:3307")
    else:
        print(f"Failed to start: {error}")

