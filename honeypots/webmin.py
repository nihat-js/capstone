import subprocess

WEBMIN_USER = "adminuser"
WEBMIN_PASS = "adminpass123"
WEBMIN_PORT = 12000
CONTAINER_NAME = "webmin_honeypot"
IMAGE_NAME = "chsliu/docker-webmin"

def run_container():
    # Remove existing container if any
    subprocess.run(["docker", "rm", "-f", CONTAINER_NAME], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    print(f"Starting container {CONTAINER_NAME} on port {WEBMIN_PORT}...")
    try:
        subprocess.run([
            "docker", "run", "-d",
            "--name", CONTAINER_NAME,
            "-p", f"{WEBMIN_PORT}:10000",
            "-e", f"USER_NAME={WEBMIN_USER}",
            "-e", f"PASSWORD={WEBMIN_PASS}",
            IMAGE_NAME
        ], check=True)
        print(f"Container {CONTAINER_NAME} running. Access Webmin at http://localhost:{WEBMIN_PORT}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to start container. Error:\n{e}")

def main():
    run_container()

if __name__ == "__main__":
    main()
