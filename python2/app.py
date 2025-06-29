from flask import Flask, request, jsonify
import services.postgres as postgres
from functools import wraps
import subprocess
import services.mysql as mysql
import services.phpmyadmin as phpmyadmin
import services.redis as redis
import services.ssh as ssh
import services.ftp as ftp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

services = []
DOCKER_SERVICES = {
    "ssh" : ssh.start,
    "postgres": postgres.start,
    "mysql": mysql.start,
    "phpmyadmin": phpmyadmin.start,
    "redis" : redis.start,
    "ftp": ftp.start
}



def with_json(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            data = request.get_json(force=True)
        except Exception as e:
            return jsonify({"error": "Invalid or missing JSON"}), 400
        return f(data, *args, **kwargs)
    return decorated_function


@app.route('/services', methods=['GET'])
def list_services():
    return jsonify(services), 200


@app.route('/services/start', methods=['POST'])
def start_service():
    global services
    data = request.get_json(force=False)
    config = data.get('config', {})
    name, port = config.get("name"), config.get("port")
    if name is None or port is None:
        return jsonify({"error": "Name and port is required"}), 400

    if name.lower() in DOCKER_SERVICES:
        container_id, error_message = DOCKER_SERVICES[name.lower()](config)
        if error_message:
            return jsonify({"error": error_message}), 500
        else:
            services.append({
                "type": "docker",
                "container_id": container_id,
                "name": name,
                "config": config})
            return jsonify({"error": False, "container_id": container_id}), 200
    else:
        return jsonify({"error": "Service not recognized"}), 400


@app.route('/services/stop', methods=['POST'])
@with_json
def stop_service(data):
    global services
    
    if data.get("type") == "docker":
        subprocess.run(["docker", "stop", data["container_id"]])
        services = list(filter(
            lambda x: x["container_id"] != data["container_id"],
            services
        ))
        return jsonify({"message": "Service stopped successfully"}), 200

    elif data.get("type") == "terminal":
        subprocess.run(["pkill", "-f", data["name"]])
        services[:] = [s for s in services if s["name"] != data["name"]]
        return jsonify({"message": "Service stopped successfully"}), 200


@app.route('/services/<container_id>/logs', methods=['GET'])
def get_container_logs(container_id):
    try:
        # Get Docker container logs
        result = subprocess.run(
            ["docker", "logs", container_id], 
            capture_output=True, 
            text=True, 
            timeout=30  # 30 second timeout
        )
        
        if result.returncode == 0:
            logs = result.stdout
            if result.stderr:
                logs += "\n--- STDERR ---\n" + result.stderr
            
            return jsonify({
                "error": False,
                "logs": logs,
                "container_id": container_id
            }), 200
        else:
            return jsonify({
                "error": True,
                "message": f"Failed to get logs: {result.stderr}"
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({
            "error": True,
            "message": "Timeout while fetching logs"
        }), 500
    except Exception as e:
        return jsonify({
            "error": True,
            "message": f"Error fetching logs: {str(e)}"
        }), 500


@app.route('/services/<container_id>/reallogs', methods=['GET'])
def get_real_logs(container_id):
    try:
        # Find the service in our services list to get log directory
        service = None
        for s in services:
            if s.get("container_id") == container_id:
                service = s
                break
        
        if not service:
            return jsonify({
                "error": True,
                "message": "Service not found"
            }), 404
        
        # Get log type from query parameter (auth, commands, messages)
        log_type = request.args.get('type', 'auth')
        
        # Construct log file path based on service type and log type
        if service.get("name") == "ssh":
            from app_config import log_dir
            import os
            
            # Get container name from our service config
            container_name = None
            for existing_service in services:
                if existing_service.get("container_id") == container_id:
                    # Extract container name from config or construct it
                    config = existing_service.get("config", {})
                    port = config.get("port")
                    # Find the actual container name
                    result = subprocess.run(
                        ["docker", "inspect", "--format={{.Name}}", container_id],
                        capture_output=True, text=True
                    )
                    if result.returncode == 0:
                        container_name = result.stdout.strip().lstrip('/')
                    break
            
            if not container_name:
                return jsonify({
                    "error": True,
                    "message": "Could not determine container name"
                }), 500
            
            log_file_map = {
                "auth": "auth.log",
                "commands": "commands.log", 
                "messages": "messages"
            }
            
            if log_type not in log_file_map:
                return jsonify({
                    "error": True,
                    "message": f"Invalid log type. Available: {list(log_file_map.keys())}"
                }), 400
            
            log_file_path = os.path.join(log_dir, "ssh", container_name, log_file_map[log_type])
            
            try:
                if os.path.exists(log_file_path):
                    with open(log_file_path, 'r') as f:
                        logs = f.read()
                    
                    return jsonify({
                        "error": False,
                        "logs": logs,
                        "log_type": log_type,
                        "container_id": container_id,
                        "log_file": log_file_path
                    }), 200
                else:
                    return jsonify({
                        "error": False,
                        "logs": f"Log file {log_file_path} not found yet. Container may still be starting or no activity has occurred.",
                        "log_type": log_type,
                        "container_id": container_id
                    }), 200
                    
            except Exception as e:
                return jsonify({
                    "error": True,
                    "message": f"Error reading log file: {str(e)}"
                }), 500
        else:
            return jsonify({
                "error": True,
                "message": f"Real logs not implemented for service type: {service.get('name')}"
            }), 400
            
    except Exception as e:
        return jsonify({
            "error": True,
            "message": f"Error fetching real logs: {str(e)}"
        }), 500


app.run(host="localhost", port=5000, debug=True)
