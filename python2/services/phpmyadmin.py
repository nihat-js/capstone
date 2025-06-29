import subprocess
import uuid
import sys

config = {
    "name": "phpmyadmin" ,
    "port": 8080
}


def start(config):
    port, name = config["port"], config["name"]
    name = name if name else "phpmyadmin"
    name += "_" + str(port) + "_" + str(uuid.uuid4())[:8]  
    docker_cmd = [
        "docker", "run", "-d",
        "--name", name,
        "-p", f"{port}:80",
        "phpmyadmin/phpmyadmin"
    ]
    try:
        result = subprocess.run(docker_cmd, check=True, capture_output=True, text=True, stdout=sys.stdout, stderr=sys.stderr)
        container_id = result.stdout.strip()
        print(f"✅ phpMyAdmin running at http://localhost:{port}")
        print(f"📦 Container name: {name}")
        print(f"🔑 Container ID: {container_id}")
        return container_id
    except subprocess.CalledProcessError as e:
        print("❌ Failed to start phpMyAdmin")
        print(f"🔧 Error Message: {e.stderr.strip()}")
        return None

# container_id= start_phpmyadmin(config)
# print(f"Container ID: {container_id}")
