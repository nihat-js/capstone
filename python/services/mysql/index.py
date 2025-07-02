import subprocess
import time
import sys
import uuid
import os
from os import path, getenv
from datetime import datetime
# config = {
#     name="mysql_simple",
#     port=3307,
#     root_password="root",
#     user="testuser",
#     user_password="testpass"
# }

log_dir = path.abspath(path.join(getenv("log_dir","../../logs"),"mysql"))
os.makedirs(log_dir, exist_ok=True)

def start(config):
    name = config.get("name", "mysql_simple")
    port = config.get("port", 3307)
    root_password = config.get("root_password", "root")
    user = config.get("user", "testuser")
    user_password = config.get("user_password", "testpass")
    
    # Create unique container name
    container_name = f"{name}_{port}_{str(uuid.uuid4())[:8]}"
    
    # Remove existing container if it exists
    subprocess.run(["docker", "rm", "-f", container_name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Simplified Docker command - let MySQL handle its own initialization
    cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "-e", f"MYSQL_ROOT_PASSWORD={root_password}",
        "-e", "MYSQL_ROOT_HOST=%",
        "-p", f"{port}:3306",
        "mysql:8.0"
    ]

    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        container_id = result.stdout.strip()
        print(f"✅ MySQL started on port {port} with container name '{container_name}'")

        print("⏳ Waiting for MySQL to be ready...")
        
        # Wait for MySQL to be fully ready by checking logs
        wait_for_mysql_ready(container_name)
        
        # Test connection first
        test_connection(container_name, root_password)
        
        # Create honeypot user
        create_user_sql = f"""
        CREATE USER IF NOT EXISTS '{user}'@'%' IDENTIFIED BY '{user_password}';
        GRANT ALL PRIVILEGES ON *.* TO '{user}'@'%' WITH GRANT OPTION;
        FLUSH PRIVILEGES;
        """
        exec_sql_in_mysql(container_name, root_password, create_user_sql)
        print(f"✅ User '{user}' created with remote access from any IP")

        # Setup honeypot databases and tables
        setup_honeypot_databases(container_name, root_password)
        
        # Set file permissions for log files
        setup_log_permissions(container_name)
        
        return container_id, None

    except subprocess.CalledProcessError as e:
        print("❌ Error during MySQL setup")
        print(f"Docker command: {' '.join(cmd)}")
        return None, f"MySQL setup failed: {str(e)}"

def test_connection(container_name, root_password):
    """Test MySQL connection before proceeding."""
    max_retries = 15  # Increased retries
    for i in range(max_retries):
        try:
            # Try to connect to MySQL
            test_cmd = [
                "docker", "exec", container_name,
                "mysql", "-uroot", f"-p{root_password}", "-e", "SELECT 1;"
            ]
            result = subprocess.run(test_cmd, check=True, capture_output=True, text=True)
            print(f"✅ MySQL connection established successfully!")
            
            # Enable logging settings after successful connection
            enable_logging_sql = """
            SET GLOBAL general_log = 'ON';
            SET GLOBAL log_output = 'FILE,TABLE';
            SET GLOBAL slow_query_log = 'ON';
            SET GLOBAL long_query_time = 0;
            """
            exec_sql_in_mysql(container_name, root_password, enable_logging_sql)
            print("✅ Query logging enabled")
            
            return True
        except subprocess.CalledProcessError as e:
            if i < max_retries - 1:
                print(f"⏳ Connection attempt {i+1}/{max_retries} - waiting for MySQL to be ready...")
                time.sleep(8)  # Longer wait between attempts
            else:
                print(f"❌ All connection attempts failed.")
                # Show container logs to help diagnose
                log_cmd = ["docker", "logs", "--tail", "10", container_name]
                log_result = subprocess.run(log_cmd, capture_output=True, text=True)
                print("Recent container logs:")
                print(log_result.stdout)
                print(log_result.stderr)
                raise Exception("MySQL connection failed after all retries")

def setup_honeypot_databases(container_name, root_password):
    """Setup realistic honeypot databases and tables."""
    
    # 1. Finance Database
    print("🏦 Setting up finance database...")
    finance_sql = """
    CREATE DATABASE IF NOT EXISTS finance;
    USE finance;
    
    CREATE TABLE IF NOT EXISTS accounts (
        account_id INT AUTO_INCREMENT PRIMARY KEY,
        account_number VARCHAR(20) UNIQUE NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        balance DECIMAL(15,2) DEFAULT 0.00,
        account_type ENUM('checking', 'savings', 'credit') DEFAULT 'checking',
        created_date DATE DEFAULT (CURRENT_DATE),
        status ENUM('active', 'frozen', 'closed') DEFAULT 'active'
    );
    
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id INT AUTO_INCREMENT PRIMARY KEY,
        account_id INT,
        amount DECIMAL(15,2) NOT NULL,
        transaction_type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
        description VARCHAR(255),
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts(account_id)
    );
    
    INSERT INTO accounts (account_number, customer_name, balance, account_type) VALUES
        ('ACC001234567', 'John Smith', 125000.50, 'checking'),
        ('ACC001234568', 'Sarah Johnson', 89000.75, 'savings'),
        ('ACC001234569', 'Michael Brown', 250000.00, 'checking'),
        ('ACC001234570', 'Emily Davis', 45000.25, 'savings'),
        ('ACC001234571', 'Corporate Holdings LLC', 1500000.00, 'checking');
    
    INSERT INTO transactions (account_id, amount, transaction_type, description) VALUES
        (1, 5000.00, 'deposit', 'Salary deposit'),
        (1, -150.00, 'withdrawal', 'ATM withdrawal'),
        (2, 10000.00, 'deposit', 'Investment return'),
        (3, -25000.00, 'transfer', 'Business payment'),
        (4, 2500.00, 'deposit', 'Monthly savings');
    """
    exec_sql_in_mysql(container_name, root_password, finance_sql)
    
    # 2. HR/Employee Database
    print("👥 Setting up hr_system database...")
    hr_sql = """
    CREATE DATABASE IF NOT EXISTS hr_system;
    USE hr_system;
    
    CREATE TABLE IF NOT EXISTS employees (
        emp_id INT AUTO_INCREMENT PRIMARY KEY,
        employee_number VARCHAR(10) UNIQUE NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        department VARCHAR(50),
        position VARCHAR(100),
        salary DECIMAL(10,2),
        hire_date DATE,
        ssn VARCHAR(11),
        phone VARCHAR(15)
    );
    
    CREATE TABLE IF NOT EXISTS login_credentials (
        cred_id INT AUTO_INCREMENT PRIMARY KEY,
        emp_id INT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        last_login TIMESTAMP,
        failed_attempts INT DEFAULT 0,
        FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
    );
    
    INSERT INTO employees (employee_number, first_name, last_name, email, department, position, salary, hire_date, ssn, phone) VALUES
        ('EMP001', 'Alice', 'Wilson', 'alice.wilson@company.com', 'IT', 'System Administrator', 85000.00, '2020-03-15', '123-45-6789', '555-0101'),
        ('EMP002', 'Bob', 'Anderson', 'bob.anderson@company.com', 'Finance', 'Senior Accountant', 75000.00, '2019-07-22', '987-65-4321', '555-0102'),
        ('EMP003', 'Charlie', 'Martinez', 'charlie.martinez@company.com', 'HR', 'HR Manager', 90000.00, '2018-01-10', '456-78-9012', '555-0103'),
        ('EMP004', 'Diana', 'Taylor', 'diana.taylor@company.com', 'Engineering', 'Lead Developer', 120000.00, '2021-09-01', '789-01-2345', '555-0104');
    
    INSERT INTO login_credentials (emp_id, username, password_hash, last_login) VALUES
        (1, 'awilson', 'hash_admin123', '2024-07-01 09:15:00'),
        (2, 'banderson', 'hash_finance456', '2024-07-01 08:30:00'),
        (3, 'cmartinez', 'hash_hr789', '2024-06-30 17:45:00'),
        (4, 'dtaylor', 'hash_dev101', '2024-07-01 10:20:00');
    """
    exec_sql_in_mysql(container_name, root_password, hr_sql)
    
    # 3. Backup Database (looks like archived data)
    print("💾 Setting up backup_2024 database...")
    backup_sql = """
    CREATE DATABASE IF NOT EXISTS backup_2024;
    USE backup_2024;
    
    CREATE TABLE IF NOT EXISTS user_backups (
        backup_id INT AUTO_INCREMENT PRIMARY KEY,
        original_user_id INT,
        username VARCHAR(50),
        email VARCHAR(100),
        password_backup VARCHAR(255),
        backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        backup_reason VARCHAR(100)
    );
    
    CREATE TABLE IF NOT EXISTS system_configs (
        config_id INT AUTO_INCREMENT PRIMARY KEY,
        config_name VARCHAR(100),
        config_value TEXT,
        environment ENUM('prod', 'staging', 'dev'),
        backup_date DATE,
        is_sensitive BOOLEAN DEFAULT FALSE
    );
    
    CREATE TABLE IF NOT EXISTS audit_logs_archive (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100),
        table_affected VARCHAR(50),
        old_values JSON,
        new_values JSON,
        timestamp TIMESTAMP,
        ip_address VARCHAR(45)
    );
    
    INSERT INTO user_backups (original_user_id, username, email, password_backup, backup_reason) VALUES
        (1001, 'admin_backup', 'admin@company.com', 'backup_pass_admin2024', 'Quarterly backup'),
        (1002, 'finance_backup', 'cfo@company.com', 'backup_pass_finance2024', 'Annual backup'),
        (1003, 'hr_backup', 'hr@company.com', 'backup_pass_hr2024', 'Policy change backup');
    
    INSERT INTO system_configs (config_name, config_value, environment, backup_date, is_sensitive) VALUES
        ('database_connection_string', 'mysql://prod-server:3306/main_db', 'prod', '2024-01-15', TRUE),
        ('api_secret_key', 'sk_live_abc123xyz789', 'prod', '2024-01-15', TRUE),
        ('smtp_server', 'smtp.company.com:587', 'prod', '2024-01-15', FALSE),
        ('backup_encryption_key', 'encrypt_key_2024_v3', 'prod', '2024-01-15', TRUE);
    """
    exec_sql_in_mysql(container_name, root_password, backup_sql)
    
    # 4. Customer Database
    print("🛒 Setting up customer_data database...")
    customer_sql = """
    CREATE DATABASE IF NOT EXISTS customer_data;
    USE customer_data;
    
    CREATE TABLE IF NOT EXISTS customers (
        customer_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        email VARCHAR(100),
        phone VARCHAR(15),
        address TEXT,
        credit_card_last4 VARCHAR(4),
        registration_date DATE,
        last_purchase TIMESTAMP,
        total_spent DECIMAL(10,2)
    );
    
    CREATE TABLE IF NOT EXISTS payment_methods (
        payment_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        card_type ENUM('visa', 'mastercard', 'amex'),
        card_last4 VARCHAR(4),
        expiry_month INT,
        expiry_year INT,
        billing_zip VARCHAR(10),
        is_default BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );
    
    INSERT INTO customers (first_name, last_name, email, phone, address, credit_card_last4, registration_date, total_spent) VALUES
        ('Jennifer', 'Lopez', 'jennifer.lopez@email.com', '555-1001', '123 Main St, New York, NY', '4532', '2023-03-15', 2450.75),
        ('Robert', 'Garcia', 'robert.garcia@email.com', '555-1002', '456 Oak Ave, Los Angeles, CA', '5421', '2023-05-22', 1890.50),
        ('Maria', 'Rodriguez', 'maria.rodriguez@email.com', '555-1003', '789 Pine Rd, Chicago, IL', '4916', '2023-07-10', 3200.25);
    
    INSERT INTO payment_methods (customer_id, card_type, card_last4, expiry_month, expiry_year, billing_zip, is_default) VALUES
        (1, 'visa', '4532', 12, 2026, '10001', TRUE),
        (2, 'mastercard', '5421', 8, 2025, '90210', TRUE),
        (3, 'visa', '4916', 3, 2027, '60601', TRUE);
    """
    exec_sql_in_mysql(container_name, root_password, customer_sql)
    
    print("✅ All honeypot databases and tables created successfully!")
    print("📊 Available databases: finance, hr_system, backup_2024, customer_data")

def exec_sql_in_mysql(container_name, root_password, sql):
    exec_cmd = [
        "docker", "exec", "-i", container_name,
        "mysql", "-uroot", f"-p{root_password}", "-e", sql
    ]
    subprocess.run(exec_cmd, check=True, stdout=sys.stdout, stderr=sys.stderr)

def setup_log_permissions(container_name):
    """Setup proper permissions for MySQL log files."""
    try:
        # Create log files and set permissions
        log_setup_cmd = [
            "docker", "exec", container_name, "bash", "-c", 
            "touch /var/log/mysql/general.log /var/log/mysql/slow.log && chmod 666 /var/log/mysql/*.log"
        ]
        subprocess.run(log_setup_cmd, check=True, capture_output=True)
        print("✅ MySQL log file permissions configured")
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Warning: Could not set log permissions: {e}")

def check_query_logs(container_name=None):
    """Check and display recent MySQL query logs."""
    if container_name is None:
        # Find running MySQL containers
        ps_cmd = ["docker", "ps", "--filter", "ancestor=mysql:8.0", "--format", "{{.Names}}"]
        result = subprocess.run(ps_cmd, capture_output=True, text=True)
        containers = result.stdout.strip().split('\n')
        if containers and containers[0]:
            container_name = containers[0]
        else:
            print("❌ No running MySQL containers found")
            return
    
    print(f"📊 Checking query logs for container: {container_name}")
    
    try:
        # Check general query log
        print("\n🔍 RECENT QUERIES (General Log):")
        general_log_cmd = ["docker", "exec", container_name, "tail", "-20", "/var/log/mysql/general.log"]
        result = subprocess.run(general_log_cmd, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        else:
            print("No general log entries found")
        
        # Check slow query log
        print("\n🐌 SLOW QUERIES:")
        slow_log_cmd = ["docker", "exec", container_name, "tail", "-10", "/var/log/mysql/slow.log"]
        result = subprocess.run(slow_log_cmd, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        else:
            print("No slow query entries found")
            
        # Check MySQL general log table
        print("\n📋 QUERY LOG TABLE (Last 10 entries):")
        table_log_sql = """
        SELECT event_time, user_host, thread_id, server_id, command_type, argument 
        FROM mysql.general_log 
        ORDER BY event_time DESC 
        LIMIT 10;
        """
        query_cmd = [
            "docker", "exec", container_name,
            "mysql", "-uroot", "-padmin123", "-e", table_log_sql
        ]
        result = subprocess.run(query_cmd, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error checking logs: {e}")

def wait_for_mysql_ready(container_name):
    """Wait for MySQL to be functional by monitoring logs."""
    print("⏳ Waiting for MySQL to be functional...")
    max_wait = 120  # 2 minutes max
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        try:
            # Check container logs for MySQL functional indicators
            log_cmd = ["docker", "logs", container_name]
            result = subprocess.run(log_cmd, capture_output=True, text=True)
            
            full_output = result.stdout + result.stderr
            
            # Look for the key indicators that MySQL is ready
            ready_indicators = [
                "ready for connections",
                "mysql init process done",
                "/usr/sbin/mysqld: ready for connections",
                "innodb initialization has ended"
            ]
            
            elapsed = int(time.time() - start_time)
            
            # Check if MySQL is fully ready
            if any(indicator in full_output.lower() for indicator in ready_indicators):
                print("✅ MySQL is fully ready for connections!")
                time.sleep(3)  # Give it a moment to settle
                return True
            
            # Show meaningful progress
            if "innodb initialization has started" in full_output.lower():
                print(f"⏳ InnoDB initializing... ({elapsed}s)")
            elif "initializing database files" in full_output.lower():
                print(f"⏳ Initializing database files... ({elapsed}s)")
            else:
                print(f"⏳ MySQL starting up... ({elapsed}s)")
            
            time.sleep(5)
            
        except Exception as e:
            print(f"⚠️  Error checking logs: {e}")
            time.sleep(5)
    
    print("⚠️  MySQL initialization timeout - attempting connection anyway")
    return False

# Example usage
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "logs":
        # Check logs mode
        container_name = sys.argv[2] if len(sys.argv) > 2 else None
        check_query_logs(container_name)
    else:
        # Start honeypot mode
        config = {
            "name": "mysql_honeypot",
            "port": 3307,
            "root_password": "admin123",
            "user": "dbuser",
            "user_password": "password123"
        }
        container_id, error = start(config)
        if container_id:
            print(f"🎯 MySQL Honeypot started successfully!")
            print(f"📋 Container ID: {container_id}")
            print(f"🌐 Connection: mysql://dbuser:password123@localhost:3307")
            print(f"🗄️  Available databases: finance, hr_system, backup_2024, customer_data")
            print(f"📝 Query logging enabled - all queries will be logged")
            print(f"⚠️  This is a honeypot - all connections are monitored!")
            print(f"📊 To check logs: python index.py logs")
        else:
            print(f"Failed to start: {error}")

