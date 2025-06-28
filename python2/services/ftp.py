import subprocess
import uuid
import os

config = {
    "name": "ftp",
    "port": 2121,
    "user": "myftpuser",
    "password": "secret123"
}
# container_id = start(config)
# print(f"FTP Container ID: {container_id}")


def start(config):
    port, name = config.get("port"), config.get("name", "ftp")
    ftp_user = config.get("user", "ftpuser")
    ftp_pass = config.get("password", "ftp123")

    name += f"_{port}_{str(uuid.uuid4())[:8]}"

    script_dir = os.path.dirname(os.path.abspath(__file__))
    ftp_data_dir = os.path.join(script_dir, "ftp_data")
    ftp_log_dir = os.path.join(script_dir, "ftp_logs")
    os.makedirs(ftp_data_dir, exist_ok=True)
    os.makedirs(ftp_log_dir, exist_ok=True)

    docker_cmd = [
        "docker", "run", "-d",
        "--name", name,
        "-e", f"FTP_USER={ftp_user}",
        "-e", f"FTP_PASS={ftp_pass}",
        "-e", "PASV_ADDRESS=127.0.0.1",  # for passive mode, use public IP in prod
        "-e", "PASV_MIN_PORT=21100",
        "-e", "PASV_MAX_PORT=21110",
        "-p", f"{port}:21",
        "-p", "21100-21110:21100-21110",  # passive port range
        "-v", f"{ftp_data_dir}:/home/vsftpd",
        "-v", f"{ftp_log_dir}:/var/log/vsftpd",
        "fauria/vsftpd"
    ]

    try:
        result = subprocess.run(docker_cmd, check=True, capture_output=True, text=True)
        container_id = result.stdout.strip()
        print(f"✅ FTP Server running on port {port}")
        print(f"📦 Container name: {name}")
        print(f"🔑 Container ID: {container_id}")
        print(f"👤 User: {ftp_user}")
        print(f"🔐 Password: {ftp_pass}")
        print(f"📁 Data Dir: {ftp_data_dir}")
        print(f"📄 Logs: {ftp_log_dir}")
        return container_id
    except subprocess.CalledProcessError as e:
        print("❌ Failed to start FTP Server")
        print(f"🔧 Error Message: {e.stderr.strip()}")
        return None
