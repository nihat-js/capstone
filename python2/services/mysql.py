import subprocess
import uuid

def start(config):
    port, name = config["port"], config["name"]
    mysql_root_password = config.get("root_password", "root")  # Default root password
    name = name if name else "mysql"
    name += "_" + str(port) + "_" + str(uuid.uuid4())[:8]
    print("comes to here")
    
    docker_cmd = [
        "docker", "run", "-d",
        "--name", name,
        "-e", f"MYSQL_ROOT_PASSWORD={mysql_root_password}",
        "-p", f"{port}:3306",
        "mysql:latest"
    ]
    
    try:
        result = subprocess.run(docker_cmd, check=True, capture_output=True, text=True)
        container_id = result.stdout.strip()
        print(f"✅ MySQL running on port {port}")
        print(f"📦 Container name: {name}")
        print(f"🔑 Container ID: {container_id}")
        print(f"🔐 Root password: {mysql_root_password}")
        return container_id
    except subprocess.CalledProcessError as e:
        print("❌ Failed to start MySQL")
        print(f"🔧 Error Message: {e.stderr.strip()}")
        return None

# Example usage:
# config = {
#     "container_name": "mysql",
#     "port": 3307,
#     "root_password": "securepass123"
# }
# container_id = start_mysql(config)
# print(f"Container ID: {container_id}")
