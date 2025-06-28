import subprocess
import uuid
import os

def start_postgres(config):
    port,name = config.get("port"), config.get("name")
    postgres_password = config.get("password", "postgres")
    name += f"_{port}_{str(uuid.uuid4())[:8]}"

    script_dir = os.path.dirname(os.path.abspath(__file__))
    pg_log_dir = os.path.join(script_dir, "postgres_logs")
    os.makedirs(pg_log_dir, exist_ok=True)

    config_file_path = os.path.join(script_dir, "postgresql.conf")

    # Write custom postgresql.conf with query logging enabled
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
        result = subprocess.run(docker_cmd, check=True, capture_output=True, text=True)
        id = result.stdout.strip()
        print(f"✅ PostgreSQL running on port {port}")
        print(f"📦 Container name: {name}")
        print(f"🔑 Container ID: {id}")
        print(f"🔐 Password: {postgres_password}")
        print(f"📄 Logs will be written to: {pg_log_dir}")
        return id
    except subprocess.CalledProcessError as e:
        print("❌ Failed to start PostgreSQL")
        print(f"🔧 Error Message: {e.stderr.strip()}")
        return None

# Example usage:
# config = {
#     "container_name": "postgres",
#     "port": 5433,
#     "password": "securepass123"
# }
# container_id = start_postgres(config)
# print(f"Container ID: {container_id}")
