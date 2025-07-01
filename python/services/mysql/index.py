import subprocess
import time
import sys
import uuid
import os
from app_config import log_dir, tmp_dir

# config = {
#     name="mysql_simple",
#     port=3307,
#     root_password="root",
#     user="testuser",
#     user_password="testpass"
# }

def start(config):
    name = config.get("name", "mysql_simple")
    port = config.get("port", 3307)
    root_password = config.get("root_password", "root")
    user = config.get("user", "testuser")
    user_password = config.get("user_password", "testpass")
    
    # Create unique container name
    container_name = f"{name}_{port}_{str(uuid.uuid4())[:8]}"
    
    # Create log directory for MySQL
    mysql_log_dir = os.path.join(log_dir, "mysql", container_name)
    os.makedirs(mysql_log_dir, exist_ok=True)
    print(f"[INFO] Created MySQL log directory at {mysql_log_dir}")
    
    # Clean up existing container (if any)
    subprocess.run(["docker", "rm", "-f", container_name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Start MySQL container with log mounting
    cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "-e", f"MYSQL_ROOT_PASSWORD={root_password}",
        "-p", f"{port}:3306",
        "-v", f"{mysql_log_dir}:/var/log/mysql",
        "mysql:latest"
    ]

    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"✅ MySQL started on port {port} with container name '{container_name}'")

        # Wait for MySQL to be ready (20 seconds)
        print("⏳ Waiting for MySQL to be ready...")
        time.sleep(20)

        # Create user with remote access
        create_user_sql = f"""
        CREATE USER IF NOT EXISTS '{user}'@'%' IDENTIFIED BY '{user_password}';
        GRANT ALL PRIVILEGES ON *.* TO '{user}'@'%' WITH GRANT OPTION;
        FLUSH PRIVILEGES;
        """
        exec_sql_in_mysql(container_name, root_password, create_user_sql)
        print(f"✅ User '{user}' created with remote access from any IP")

        # Create example database 'finance'
        create_db_sql = "CREATE DATABASE IF NOT EXISTS finance;"
        exec_sql_in_mysql(container_name, root_password, create_db_sql)
        print(f"✅ Database 'finance' created")

        # Create table 'users' in 'finance' database
        create_table_sql = """
        USE finance;
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        exec_sql_in_mysql(container_name, root_password, create_table_sql)
        print(f"✅ Table 'users' created in database 'finance'")

        # Insert sample users
        insert_users_sql = """
        USE finance;
        INSERT INTO users (username, email) VALUES
            ('alice', 'alice@example.com'),
            ('bob', 'bob@example.com'),
            ('charlie', 'charlie@example.com');
        """
        exec_sql_in_mysql(container_name, root_password, insert_users_sql)
        print(f"✅ Sample users inserted into 'users' table")
        
        # Get container ID
        get_id_cmd = ["docker", "ps", "-q", "--filter", f"name={container_name}"]
        id_result = subprocess.run(get_id_cmd, capture_output=True, text=True)
        container_id = id_result.stdout.strip()
        
        return container_id, None

    except subprocess.CalledProcessError as e:
        print("❌ Error during MySQL setup")
        return None, f"MySQL setup failed: {str(e)}"

def exec_sql_in_mysql(container_name, root_password, sql):
    exec_cmd = [
        "docker", "exec", "-i", container_name,
        "mysql", "-uroot", f"-p{root_password}", "-e", sql
    ]
    subprocess.run(exec_cmd, check=True, stdout=sys.stdout, stderr=sys.stderr)

# Example usage
if __name__ == "__main__":
    config = {
        "name": "mysql_simple",
        "port": 3307,
        "root_password": "root",
        "user": "testuser",
        "user_password": "testpass"
    }
    container_id, error = start(config)
    if container_id:
        print(f"Started with container ID: {container_id}")
    else:
        print(f"Failed to start: {error}")
