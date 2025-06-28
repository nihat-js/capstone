import os
import subprocess
import time

# Configuration
webmin_port = 10000  # Change this port if needed
webmin_user = "admin"
webmin_pass = "admin123"

container_name = "webmin_honeypot"
log_file_path = "log/webmin_container_logs.txt"
build_folder = "build/webmin_honeypot"
os.makedirs("log", exist_ok=True)
os.makedirs(build_folder, exist_ok=True)

# Create Dockerfile for Webmin setup with user/password configuration
dockerfile_content = f"""
FROM chsliu/docker-webmin

ENV WEBMIN_PORT={webmin_port}
ENV WEBMIN_USER={webmin_user}
ENV WEBMIN_PASS={webmin_pass}

EXPOSE {webmin_port}

CMD ["/bin/bash", "-c", "/etc/init.d/webmin restart && tail -f /var/log/webmin/miniserv.log"]
"""

# Write Dockerfile
with open(os.path.join(build_folder, "Dockerfile"), "w") as f:
    f.write(dockerfile_content)

# Build Docker image
print("Building Webmin honeypot Docker image...")
subprocess.run(["docker", "build", "-t", "webmin-honeypot", "."], cwd=build_folder, check=True)

# Remove any existing container
subprocess.run(
    ["docker", "rm", "-f", container_name],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

# Start Docker container
print("Starting Webmin honeypot container...")
subprocess.run([
    "docker", "run", "-d",
    "--name", container_name,
    "-p", f"{webmin_port}:{webmin_port}",
    "webmin-honeypot"
], check=True)

print(f"Webmin honeypot running on https://localhost:{webmin_port}/")
print("Default credentials:")
print(f"  Username: {webmin_user}")
print(f"  Password: {webmin_pass}")
print("Container logs will be saved to log/webmin_container_logs.txt")

# Log collection
print("Tailing Webmin container logs... Press Ctrl+C to stop.")
with open(log_file_path, "wb") as log_file:
    log_process = subprocess.Popen(
        ["docker", "logs", "-f", container_name],
        stdout=log_file,
        stderr=subprocess.STDOUT
    )

try:
    while True:
        time.sleep(5)
except KeyboardInterrupt:
    print("\nStopping Webmin honeypot...")
    log_process.terminate()
    subprocess.run(["docker", "rm", "-f", container_name])
