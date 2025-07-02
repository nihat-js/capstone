import subprocess
import uuid
import os
import sys
import json
import sys


def start(config):
    port, name = config.get("port"), config.get("name")
    postgres_password = config.get("password", "postgres")
    name += f"_{port}_{str(uuid.uuid4())[:8]}"

    config_file_path = os.path.join(tmp_dir, "postgresql.conf")
    pg_log_dir = os.path.join(log_dir, "postgres")
    os.makedirs(pg_log_dir, exist_ok=True)

    postgres_conf = """
      logging_collector = on
      log_directory = '/var/log/postgresql'
      log_filename = 'postgresql.log'
      log_statement = 'all'
    """

    with open(config_file_path, "w") as f:
        f.write(postgres_conf.strip() + "\n")

    docker_cmd = [
        "docker", "run", "-d",
        "--name", name,
        "-e", f"POSTGRES_PASSWORD={postgres_password}",
        "-p", f"{port}:5432",
        "-v", f"{pg_log_dir}:/var/log/postgresql",
        "-v", f"{config_file_path}:/etc/postgresql/postgresql.conf:ro",
        "postgres:latest",
        "-c", "config_file=/etc/postgresql/postgresql.conf"
    ]
    try:
        result = subprocess.run(docker_cmd, check=True, text=True)
        # Since we removed capture_output, we need to get container ID differently
        get_id_cmd = ["docker", "ps", "-q", "--filter", f"name={name}"]
        id_result = subprocess.run(get_id_cmd, capture_output=True, text=True)
        id = id_result.stdout.strip()
        return id, None  # ✅ success
    except subprocess.CalledProcessError as e:
        error_message = str(e)
        
        # Check for port conflict and provide cleaner error message
        if "port is already allocated" in error_message or "Bind for" in error_message:
            return None, f"Port {port} is already in use. Please choose a different port."
        
        return None, f"Failed to start PostgreSQL: {error_message}"


# Example usage:
# config = {
#     "container_name": "postgres",
#     "port": 5433,
#     "password": "securepass123"
# }
# container_id = start_postgres(config)
# print(f"Container ID: {container_id}")
