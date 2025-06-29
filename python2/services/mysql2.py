import subprocess
import time
import sys

def start_simple_mysql(
    name="mysql_simple",
    port=3307,
    root_password="root",
    user="testuser",
    user_password="testpass"
):
    # Clean up existing container (if any)
    subprocess.run(["docker", "rm", "-f", name], stdout=sys.stdout, stderr=sys.stderr)

    # Start MySQL container
    cmd = [
        "docker", "run", "-d",
        "--name", name,
        "-e", f"MYSQL_ROOT_PASSWORD={root_password}",
        "-p", f"{port}:3306",
        "mysql:latest"
    ]

    try:
        subprocess.run(cmd, check=True, stdout=sys.stdout, stderr=sys.stderr)
        print(f"✅ MySQL started on port {port} with container name '{name}'")

        # Wait for MySQL to be ready (20 seconds)
        print("⏳ Waiting for MySQL to be ready...")
        time.sleep(20)

        # Create user with remote access
        create_user_sql = f"""
        CREATE USER IF NOT EXISTS '{user}'@'%' IDENTIFIED BY '{user_password}';
        GRANT ALL PRIVILEGES ON *.* TO '{user}'@'%' WITH GRANT OPTION;
        FLUSH PRIVILEGES;
        """
        exec_sql_in_mysql(name, root_password, create_user_sql)
        print(f"✅ User '{user}' created with remote access from any IP")

        # Create example database 'finance'
        create_db_sql = "CREATE DATABASE IF NOT EXISTS finance;"
        exec_sql_in_mysql(name, root_password, create_db_sql)
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
        exec_sql_in_mysql(name, root_password, create_table_sql)
        print(f"✅ Table 'users' created in database 'finance'")

        # Insert sample users
        insert_users_sql = """
        USE finance;
        INSERT INTO users (username, email) VALUES
            ('alice', 'alice@example.com'),
            ('bob', 'bob@example.com'),
            ('charlie', 'charlie@example.com');
        """
        exec_sql_in_mysql(name, root_password, insert_users_sql)
        print(f"✅ Sample users inserted into 'users' table")

    except subprocess.CalledProcessError as e:
        print("❌ Error during MySQL setup")
        print(e)

def exec_sql_in_mysql(container_name, root_password, sql):
    exec_cmd = [
        "docker", "exec", "-i", container_name,
        "mysql", "-uroot", f"-p{root_password}", "-e", sql
    ]
    subprocess.run(exec_cmd, check=True, stdout=sys.stdout, stderr=sys.stderr)

# Example usage
if __name__ == "__main__":
    start_simple_mysql()
