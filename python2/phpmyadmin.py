import subprocess
import uuid
def start_phpmyadmin(config):
    port, container_name = config["port"], config["container_name"]
    container_name = container_name if container_name else "phpmyadmin"
    container_name += "_" + str(port) + "_" + str(uuid.uuid4())[:8]  
    docker_cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "-p", f"{port}:80",
        "phpmyadmin/phpmyadmin"
    ]
    try:
        result = subprocess.run(docker_cmd, check=True, capture_output=True, text=True)
        container_id = result.stdout.strip()
        print(f"✅ phpMyAdmin running at http://localhost:{port}")
        print(f"📦 Container name: {container_name}")
        print(f"🔑 Container ID: {container_id}")
        return container_id
    except subprocess.CalledProcessError as e:
        print("❌ Failed to start phpMyAdmin")
        print(f"🔧 Error Message: {e.stderr.strip()}")
        return None

config = {
    "container_name": "phpmyadmin" ,
    "port": 8080
}

container_id= start_phpmyadmin(config)
print(f"Container ID: {container_id}")
