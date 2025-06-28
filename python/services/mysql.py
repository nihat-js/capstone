import os
import subprocess
import time
import shutil

# Configuration
mysql_root_password = "rootpassword"
mysql_database = "finance"
mysql_user = "james"
mysql_password = "james"
mysql_port = 3306

build_dir = "build\mysql"
sql_source_path = "..\\..\\assets\\sql\\banking_Database.sql"
sql_dest_path = os.path.join(build_dir, "banking_Database.sql")


os.makedirs(build_dir, exist_ok=True)
os.makedirs("log", exist_ok=True)

if not os.path.isfile(sql_source_path):
    raise FileNotFoundError(f"SQL dump file not found at {sql_source_path}")
shutil.copy(sql_source_path, sql_dest_path)

# Create Dockerfile content
dockerfile_content = f"""
FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD={mysql_root_password}
ENV MYSQL_DATABASE={mysql_database}
ENV MYSQL_USER={mysql_user}
ENV MYSQL_PASSWORD={mysql_password}

COPY banking_Database.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
"""

# Write Dockerfile
dockerfile_path = os.path.join(build_dir, "Dockerfile")
with open(dockerfile_path, "w") as f:
    f.write(dockerfile_content)

print("Building MySQL honeypot Docker image...")
subprocess.run(["docker", "build", "-t", "mysql-honeypot", "."], cwd=build_dir, check=True)

# Remove existing container if running
subprocess.run(
    ["docker", "rm", "-f", "mysql_honeypot_container"],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

print("Starting MySQL honeypot container...")
subprocess.run([
    "docker", "run", "-d",
    "--name", "mysql_honeypot_container",
    "-p", f"{mysql_port}:3306",
    "mysql-honeypot"
], check=True)

print(f"MySQL Honeypot running on port {mysql_port}. Logs will be")

log_file_path = os.path.join("log", "mysql_container_logs.txt")

print("Tailing MySQL container logs... Press Ctrl+C to stop.")
with open(log_file_path, "wb") as log_file:
    log_process = subprocess.Popen(
        ["docker", "logs", "-f", "mysql_honeypot_container"],
        stdout=log_file,
        stderr=subprocess.STDOUT
    )

try:
    while True:
        time.sleep(5)
except KeyboardInterrupt:
    print("\nStopping MySQL honeypot...")
    log_process.terminate()
    subprocess.run(["docker", "rm", "-f", "mysql_honeypot_container"])
