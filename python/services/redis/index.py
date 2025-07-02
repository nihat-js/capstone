import subprocess
import uuid
import sys
import os

def start(config):
    port, name = config["port"], config.get("name", "redis")
    container_name = name + "_" + str(port) + "_" + str(uuid.uuid4())[:8]
    password = config.get("password")  # Optional password
    
    # Create log directory for Redis
    redis_log_dir = os.path.join(log_dir, "redis", container_name)
    os.makedirs(redis_log_dir, exist_ok=True)
    print(f"[INFO] Created Redis log directory at {redis_log_dir}")
    
    docker_cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "-p", f"{port}:6379",
        "-v", f"{redis_log_dir}:/var/log/redis"
    ]

    if password:
        docker_cmd += ["redis:latest", "redis-server", "--requirepass", password]
    else:
        docker_cmd.append("redis:latest")

    try:
        result = subprocess.run(docker_cmd, check=True, text=True)
        # Since we removed capture_output, get container ID separately
        get_id_cmd = ["docker", "ps", "-q", "--filter", f"name={container_name}"]
        id_result = subprocess.run(get_id_cmd, capture_output=True, text=True)
        container_id = id_result.stdout.strip()
        print(f"✅ Redis running on port {port}")
        print(f"📦 Container name: {container_name}")
        print(f"🔑 Container ID: {container_id}")
        print(f"📁 Logs directory: {redis_log_dir}")
        if password:
            print(f"🔐 Password: {password}")
        return container_id, None
    except subprocess.CalledProcessError as e:
        print("❌ Failed to start Redis")
        error_message = str(e)
        print(f"🔧 Error Message: {error_message}")
        
        # Check for port conflict and provide cleaner error message
        if "port is already allocated" in error_message or "Bind for" in error_message:
            return None, f"Port {port} is already in use. Please choose a different port."
        
        return None, f"Failed to start Redis: {error_message}"

# Example usage:
# config = {
#     "port": 6380,
#     "password": "strongredispass"
# }
# container_id = start_redis(config)
# print(f"Container ID: {container_id}")
