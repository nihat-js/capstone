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
        result = subprocess.run(docker_cmd, check=True, text=True)
        # Since we removed capture_output, get container ID separately
        get_id_cmd = ["docker", "ps", "-q", "--filter", f"name={name}"]
        id_result = subprocess.run(get_id_cmd, capture_output=True, text=True)
        container_id = id_result.stdout.strip()
        print(f"✅ phpMyAdmin running at http://localhost:{port}")
        print(f"📦 Container name: {name}")
        print(f"🔑 Container ID: {container_id}")
        return container_id, None
    except subprocess.CalledProcessError as e:
        print("❌ Failed to start phpMyAdmin")
        error_message = str(e)
        print(f"🔧 Error Message: {error_message}")
        
        # Check for port conflict and provide cleaner error message
        if "port is already allocated" in error_message or "Bind for" in error_message:
            return None, f"Port {port} is already in use. Please choose a different port."
        
        return None, f"Failed to start phpMyAdmin: {error_message}"

# container_id= start_phpmyadmin(config)
# print(f"Container ID: {container_id}")
