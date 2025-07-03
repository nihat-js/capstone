from flask import Flask, request, jsonify
from functools import wraps
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv
import os
import subprocess
import sys
import requests

import services.ssh.index as ssh
import services.api.index as api
import services.mysql.index as mysql
import services.postgres.index as postgres
import services.phpmyadmin.index as phpmyadmin
import services.redis.index as redis
import psutil

import services.ssh.log_parser as ssh_log_parser
import services.mysql.log_parser as mysql_log_parser
import services.api.log_parser as api_log_parser

services = []
running_processes = {} 
load_dotenv()
log_dir = os.getenv("LOG_DIR")
tmp_dir = os.getenv("TMP_DIR")

# Clear any existing corrupted services data
services.clear()
running_processes.clear()

app = Flask(__name__)
CORS(app)

docker_services = {
    "mysql": mysql.start,
    "phpmyadmin": phpmyadmin.start,
    "postgres": postgres.start,
    "redis": redis.start,
    "ssh": ssh.start,
}

process_services = {
    "api": api.start,
}




@app.route('/services', methods=['GET'])
def list_services():
    """List all services with JSON-safe data"""
    try:
        safe_services = []
        for service in services:
            safe_service = {
                "type": service.get("type"),
                "name": service.get("name"),
                "config": service.get("config", {})
            }
            
            if service.get("type") == "docker":
                safe_service["container_id"] = service.get("container_id")
            elif service.get("type") == "process":
                safe_service["process_id"] = service.get("process_id")
                
            safe_services.append(safe_service)
            
        return jsonify(safe_services), 200
    except Exception as e:
        print(f"[ERROR] Failed to list services: {e}")
        return jsonify({"error": f"Failed to list services: {str(e)}"}), 500


def start_docker_service(name, config):
    """Start a Docker-based service"""
    try:
        result = docker_services[name](config)
        if isinstance(result, tuple):
            container_id, error_message = result
            return container_id, error_message
        else:
            return result, None
    except Exception as e:
        print(f"[ERROR] Failed to start docker service {name}: {e}")
        return None, str(e)


def start_process_service(name, config):
    """Start a process-based service"""
    print(f"[PROCESS] Starting process service: {name}")
    print(f"[PROCESS] Config: {config}")
    
    try:
        service_func = process_services[name]
        result = service_func(config)
        
        # Handle both return formats: PID only or (PID, error_message)
        if isinstance(result, tuple):
            process_id, error_message = result
        else:
            process_id, error_message = result, None
            
        print(f"[PROCESS] Service function returned: PID={process_id}, Error={error_message}")
        return process_id, error_message
        
    except Exception as e:
        print(f"[ERROR] Exception in start_process_service: {e}")
        import traceback
        traceback.print_exc()
        return None, str(e)


@app.route('/services/start', methods=['POST'])
def start_service():
    """Start a new service (Docker or Process based)"""
    try:
        data = request.get_json()
        if not data or 'config' not in data:
            return jsonify({"error": "Missing config in request"}), 400
            
        config = data['config']
        name = config.get("name")
        port = config.get("port")
        
        print(f"[START] Service: {name}, Port: {port}")
        
        if not name or not port:
            return jsonify({"error": "Name and port are required"}), 400

        name = name.strip().lower()
        port = int(port)
        
        print(f"[START] Starting {name} on port {port}")
        print(f"[START] Full config: {config}")

        # Try Docker services first
        if name in docker_services:
            print(f"[START] Found Docker service: {name}")
            container_id, error_message = start_docker_service(name, config)
            
            if container_id:
                service_entry = {
                    "type": "docker",
                    "container_id": container_id,
                    "name": name,
                    "config": config
                }
                services.append(service_entry)
                print(f"[SUCCESS] Docker service {name} started: {container_id}")
                return jsonify({"success": True, "container_id": container_id}), 200
            else:
                print(f"[ERROR] Docker service {name} failed: {error_message}")
                return jsonify({"error": error_message or "Failed to start service"}), 500
                
        # Try Process services
        elif name in process_services:
            print(f"[START] Found Process service: {name}")
            process_id, error_message = start_process_service(name, config)
            
            if process_id:
                service_entry = {
                    "type": "process",
                    "process_id": int(process_id),  # Ensure it's an integer
                    "name": name,
                    "config": config
                }
                services.append(service_entry)
                running_processes[name] = int(process_id)
                print(f"[SUCCESS] Process service {name} started: PID {process_id}")
                return jsonify({"success": True, "process_id": int(process_id)}), 200
            else:
                print(f"[ERROR] Process service {name} failed: {error_message}")
                return jsonify({"error": error_message or "Failed to start service"}), 500
        else:
            print(f"[ERROR] Unknown service: {name}")
            available_services = list(docker_services.keys()) + list(process_services.keys())
            return jsonify({
                "error": f"Unknown service '{name}'. Available: {available_services}"
            }), 400

    except Exception as e:
        print(f"[ERROR] Exception in start_service: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


def stop_docker_service(container_id):
    """Stop a Docker container"""
    try:
        result = subprocess.run(["docker", "stop", container_id], 
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"[STOP] Docker container {container_id} stopped successfully")
            return True, None
        else:
            error_msg = f"Failed to stop container: {result.stderr}"
            print(f"[ERROR] {error_msg}")
            return False, error_msg
    except subprocess.TimeoutExpired:
        return False, "Timeout while stopping container"
    except Exception as e:
        return False, str(e)


def stop_process_service(process_id):
    """Stop a process by PID"""
    try:
        if not psutil.pid_exists(process_id):
            print(f"[STOP] Process {process_id} already stopped")
            return True, "Process already stopped"
            
        proc = psutil.Process(process_id)
        proc.terminate()
        
        # Wait for graceful termination
        try:
            proc.wait(timeout=5)
            print(f"[STOP] Process {process_id} terminated gracefully")
        except psutil.TimeoutExpired:
            print(f"[STOP] Force killing process {process_id}")
            proc.kill()
            proc.wait(timeout=2)
            
        return True, None
        
    except psutil.NoSuchProcess:
        return True, "Process already stopped"
    except Exception as e:
        print(f"[ERROR] Failed to stop process {process_id}: {e}")
        return False, str(e)


@app.route('/services/stop', methods=['POST'])
def stop_service():
    """Stop a running service"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request data"}), 400
            
        service_type = data.get("type")
        
        if service_type == "docker":
            container_id = data.get("container_id")
            if not container_id:
                return jsonify({"error": "Missing container_id"}), 400
                
            success, error_message = stop_docker_service(container_id)
            if success:
                return jsonify({"success": True}), 200
            else:
                return jsonify({"error": error_message}), 500
                
        elif service_type == "process":
            process_id = data.get("process_id")
            if not process_id:
                return jsonify({"error": "Missing process_id"}), 400
                
            success, error_message = stop_process_service(process_id)
            if success:
                return jsonify({"success": True}), 200
            else:
                return jsonify({"error": error_message}), 500
        else:
            return jsonify({"error": "Invalid service type. Use 'docker' or 'process'"}), 400
            
    except Exception as e:
        print(f"[ERROR] Exception in stop_service: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@app.route('/services/<container_id>/logs', methods=['GET'])
def get_logs(container_id):
    try:
        result = subprocess.run(["docker", "logs", container_id], capture_output=True,
                                text=True, timeout=10, stderr=sys.stderr, stdout=sys.stdout)
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


@app.route('/logs/api', methods=['GET'])
def get_api_logs():
    try:
        result = api_log_parser.parse_logs()
        return jsonify({
            "success": True,
            "logs": result.get('logs', []),
            "stats": result.get('stats', {}),
            "service": "api"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "logs": [],
            "stats": {},
            "service": "api"
        }), 500


@app.route('/logs/ssh', methods=['GET'])
def get_ssh_logs():
    try:
        result = ssh_log_parser.parse_logs()
        return jsonify({
            "success": True,
            "logs": result.get('logs', []),
            "stats": result.get('stats', {}),
            "service": "ssh"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "logs": [],
            "stats": {},
            "service": "ssh"
        }), 500


@app.route('/logs/mysql', methods=['GET'])
def get_mysql_logs():
    try:
        result = mysql_log_parser.parse_logs()
        return jsonify({
            "success": True,
            "logs": result.get('logs', []),
            "stats": result.get('stats', {}),
            "service": "mysql"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "logs": [],
            "stats": {},
            "service": "mysql"
        }), 500


@app.route('/services/<type>/reallogs', methods=['GET'])
def get_real_logs(type):
    if type == "api":
        try:
            logs = api_log_parser.parse_logs()
            return jsonify({
                "error": False,
                "message": "API logs extracted successfully",
                "data": logs
            }), 200
        except Exception as e:
            return jsonify({
                "error": True,
                "message": str(e)
            }), 500
    elif type == "ssh":
        try:
            logs = ssh_log_parser.parse_logs()
            return jsonify({
                "error": False,
                "message": "SSH logs extracted successfully",
                "data": logs
            }), 200
        except Exception as e:
            return jsonify({
                "error": True,
                "message": str(e)
            }), 500
    elif type == "mysql":
        try:
            logs = mysql_log_parser.parse_logs()
            return jsonify({
                "error": False,
                "message": "MySQL logs extracted successfully",
                "data": logs
            }), 200
        except Exception as e:
            return jsonify({
                "error": True,
                "message": str(e)
            }), 500
    else:
        return jsonify({
            "error": True,
            "message": "Unknown service type"
        }), 400


@app.route('/services/status', methods=['GET'])
def get_services_status():
    """Get status of all running services"""
    running_services = []

    for service in services:
        service_status = {
            **service,
            'status': 'unknown'
        }

        if service['type'] == 'process':
            try:
                # Special handling for API service (uses port as fake PID)
                if service['name'] == 'api':
                    # Check if API service is running by making a health check
                    import requests
                    try:
                        port = service.get('config', {}).get('port', service['process_id'])
                        response = requests.get(f"http://localhost:{port}/health", timeout=2)
                        if response.status_code == 200:
                            service_status['status'] = 'running'
                            service_status['health_check'] = 'passed'
                        else:
                            service_status['status'] = 'stopped'
                            service_status['health_check'] = 'failed'
                    except requests.exceptions.RequestException:
                        service_status['status'] = 'stopped'
                        service_status['health_check'] = 'failed'
                else:
                    # Check if process is still running using psutil
                    if psutil.pid_exists(service['process_id']):
                        proc = psutil.Process(service['process_id'])
                        service_status['status'] = 'running'
                        service_status['cpu_percent'] = proc.cpu_percent()
                        service_status['memory_mb'] = round(
                            proc.memory_info().rss / 1024 / 1024, 2)
                        service_status['create_time'] = datetime.fromtimestamp(
                            proc.create_time()).isoformat()
                    else:
                        service_status['status'] = 'stopped'
                        # Remove from tracking if stopped
                        if service['name'] in running_processes:
                            del running_processes[service['name']]
            except psutil.NoSuchProcess:
                service_status['status'] = 'stopped'
                if service['name'] in running_processes:
                    del running_processes[service['name']]
            except Exception as e:
                service_status['status'] = f'error: {str(e)}'

        elif service['type'] == 'docker':
            try:
                result = subprocess.run(['docker', 'ps', '--filter', f"id={service['container_id']}", '--format', '{{.Status}}'],
                                        capture_output=True, text=True, timeout=5)
                if result.returncode == 0 and result.stdout.strip():
                    service_status['status'] = 'running'
                    service_status['docker_status'] = result.stdout.strip()
                else:
                    service_status['status'] = 'stopped'
            except Exception as e:
                service_status['status'] = f'error: {str(e)}'

        running_services.append(service_status)

    return jsonify({
        'services': running_services,
        'total': len(running_services),
        'running': len([s for s in running_services if s['status'] == 'running'])
    }), 200


@app.route('/services/<service_name>/logs/<log_type>', methods=['GET'])
def get_service_logs(service_name, log_type):
    """Get subprocess logs (stdout/stderr) for a service"""
    if log_type not in ['stdout', 'stderr']:
        return jsonify({
            "error": True,
            "message": "Invalid log type. Use 'stdout' or 'stderr'"
        }), 400

    # Map service names to their log directories
    log_paths = {
        'api': os.path.join(log_dir or 'logs', 'api', f'{service_name}_{log_type}.log'),
        'ssh': os.path.join(log_dir or 'logs', 'ssh', f'{service_name}_{log_type}.log'),
        'mysql': os.path.join(log_dir or 'logs', 'mysql', f'{service_name}_{log_type}.log'),
    }

    if service_name not in log_paths:
        return jsonify({
            "error": True,
            "message": f"Unknown service: {service_name}"
        }), 400

    log_file_path = log_paths[service_name]

    try:
        if os.path.exists(log_file_path):
            with open(log_file_path, 'r') as f:
                lines = f.readlines()

            # Get the last N lines (default 100, max 1000)
            max_lines = min(int(request.args.get('lines', 100)), 1000)
            recent_lines = lines[-max_lines:] if len(
                lines) > max_lines else lines

            return jsonify({
                "error": False,
                "service": service_name,
                "log_type": log_type,
                "lines": recent_lines,
                "total_lines": len(lines),
                "showing_lines": len(recent_lines),
                "file_path": log_file_path
            }), 200
        else:
            return jsonify({
                "error": False,
                "service": service_name,
                "log_type": log_type,
                "lines": [],
                "total_lines": 0,
                "showing_lines": 0,
                "message": f"Log file not found: {log_file_path}"
            }), 200

    except Exception as e:
        return jsonify({
            "error": True,
            "message": f"Failed to read log file: {str(e)}"
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
