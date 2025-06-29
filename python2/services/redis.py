import subprocess
import uuid

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
        print(f"🔧 Error Message: {e.stderr.strip()}")
        return None, str(e.stderr.strip())

# Example usage:
# config = {
#     "port": 6380,
#     "password": "strongredispass"
# }
# container_id = start_redis(config)
# print(f"Container ID: {container_id}")
