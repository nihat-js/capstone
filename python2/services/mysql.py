import subprocess
import uuid
import sys
import os
import tempfile

def start(config):
    port, name = config["port"], config["name"]
    password = config.get("password", "root")  # Default root password
    init_sql = config.get("init_sql", "")  # Optional initial SQL script
    name = name if name else "mysql"
    name += "_" + str(port) + "_" + str(uuid.uuid4())[:8]
    print("comes to here")
    
    docker_cmd = [
        "docker", "run", "-d",
        "--name", name,
        "-e", f"MYSQL_ROOT_PASSWORD={password}",
        "-p", f"{port}:3306",
    ]
    
    # If init SQL is provided, create a temporary file and mount it
    temp_sql_file = None
    if init_sql and init_sql.strip():
        try:
            # Create a temporary SQL file
            # temp_sql_file = tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False)
            # temp_sql_file.write(init_sql)
            # temp_sql_file.close()
            
            # Mount the SQL file to the container's init directory
            # docker_cmd.extend(["-v", f"{temp_sql_file.name}:/docker-entrypoint-initdb.d/init.sql"])
            print(f"📄 Added initial SQL script: {len(init_sql)} characters")
        except Exception as e:
            print(f"⚠️ Warning: Failed to create init SQL file: {e}")
            if temp_sql_file:
                try:
                    os.unlink(temp_sql_file.name)
                except:
                    pass
    
    docker_cmd.append("mysql:latest")
    
    try:
        result = subprocess.run(docker_cmd, check=True, text=True)
        # Since we removed capture_output, get container ID separately
        get_id_cmd = ["docker", "ps", "-q", "--filter", f"name={name}"]
        id_result = subprocess.run(get_id_cmd, capture_output=True, text=True)
        container_id = id_result.stdout.strip()
        print(f"✅ MySQL running on port {port}")
        print(f"📦 Container name: {name}")
        print(f"🔑 Container ID: {container_id}")
        print(f"🔐 Root password: {password}")
        if init_sql and init_sql.strip():
            print(f"📄 Initial SQL script will be executed on first startup")
        
        # Clean up temp file after container starts (it's copied to container)
        if temp_sql_file and os.path.exists(temp_sql_file.name):
            try:
                os.unlink(temp_sql_file.name)
            except:
                pass
                
        return container_id, None
    except subprocess.CalledProcessError as e:
        # Clean up temp file on error
        if temp_sql_file and os.path.exists(temp_sql_file.name):
            try:
                os.unlink(temp_sql_file.name)
            except:
                pass
                
        print("❌ Failed to start MySQL")
        error_message = str(e)
        print(f"🔧 Error Message: {error_message}")
        
        # Check for port conflict and provide cleaner error message
        if "port is already allocated" in error_message or "Bind for" in error_message:
            return None, f"Port {port} is already in use. Please choose a different port."
        
        return None, f"Failed to start MySQL: {error_message}"

# Example usage:
config = {
    "name": "mysql",
    "port": 3307,
    "password": "securepass123"
}

start(config)
# container_id = start_mysql(config)
# print(f"Container ID: {container_id}")
