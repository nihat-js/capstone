import subprocess
import uuid
import sys

def start(config):
    port, name = config["port"], config.get("name", "redis")
    name += "_" + str(port) + "_" + str(uuid.uuid4())[:8]
    password = config.get("password")  # Optional password
    docker_cmd = [
        "docker", "run", "-d",
        "--name", name,
        "-p", f"{port}:6379"
    ]

    if password:
        docker_cmd += ["redis:latest", "redis-server", "--requirepass", password]
    else:
        docker_cmd.append("redis:latest")

    try:
        result = subprocess.run(docker_cmd, check=True, capture_output=True, text=True)
        container_id = result.stdout.strip()
        print(f"✅ Redis running on port {port}")
        print(f"📦 Container name: {name}")
        print(f"🔑 Container ID: {container_id}")
        if password:
            print(f"🔐 Password: {password}")
        return container_id, None
    except subprocess.CalledProcessError as e:
        print("❌ Failed to start Redis")
        error_message = e.stderr.strip() if e.stderr else str(e)
        print(f"🔧 Error Message: {error_message}")
        
        # Check for port conflict and provide cleaner error message
        if "port is already allocated" in error_message or "Bind for" in error_message:
            return None, f"Port {port} is already in use. Please choose a different port."
        
        return None, f"Failed to start Redis: {error_message}", str(e.stderr.strip())

# Example usage:
# config = {
#     "port": 6380,
#     "password": "strongredispass"
# }
# container_id = start_redis(config)
# print(f"Container ID: {container_id}")
