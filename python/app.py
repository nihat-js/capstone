from flask import Flask, request, jsonify
from functools import wraps
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv
import os
import subprocess
import sys

import services.ssh.index as ssh
import services.api.index as api
import services.mysql.index as mysql
import services.postgres.index as postgres
import services.phpmyadmin.index as phpmyadmin
import services.redis.index as redis

# Import log parsers for each service
import services.ssh.log_parser as ssh_log_parser
import services.mysql.log_parser as mysql_log_parser
import services.api.log_parser as api_log_parser

services = []
load_dotenv()
log_dir = os.getenv("LOG_DIR")
tmp_dir = os.getenv("TMP_DIR")

app = Flask(__name__)
CORS(app)

docker_services = {
    "api": api.start,
    "mysql": mysql.start,
    "phpmyadmin": phpmyadmin.start,
    "postgres": postgres.start,
    "redis" : redis.start,
    "ssh" : ssh.start,
}

process_services = {
    "api": api.start,
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



def start_docker_service(name, config):
    try:
        container_id = docker_services[name](config)
        return container_id, None
    except Exception as e:
        return None, str(e)


def start_process_service(name, config):
    try:
        process_id = process_services[name](config)
        return process_id, None
    except Exception as e:
        return None, str(e)
    ervices.append({
                "type": "docker",
                "container_id": container_id,
                "name": name,
                "config": config})


@app.route('/services/start', methods=['POST'])
def start_service():
    data = request.get_json(force=False)
    config = data.get('config', {})
    name, port = config.get("name"), config.get("port")
    if name is None or port is None:
        return jsonify({"error": "Name and port is required"}), 400
    
    name = name.strip().lower()
    port = int(port)

    if name in docker_services:
        container_id, error_message = start_docker_service(name, config)
        if container_id:
            services.append({
                "type": "docker",
                "container_id": container_id,
                "name": name,
                "config": config
            })
            return jsonify({"success": True, "container_id": container_id}), 200
        else:
            return jsonify({"error": error_message}), 500
    else:
        return jsonify({"error": "Unknown service"}), 400



def stop_docker_service(container_id):
    try:
        subprocess.run(["docker", "stop", container_id], check=True)
        return True, None
    except subprocess.CalledProcessError as e:
        return False, str(e)
    

def stop_process_service(process_id):
    try:
        # For now, just return success since we don't have process services implemented
        return True, None
    except Exception as e:
        return False, str(e)    


@app.route('/services/stop', methods=['POST'])
@with_json
def stop_service(data):
    if data.get("type") == "docker":
      return stop_docker_service(data.get("container_id"))
    elif data.get("type") == "process":
        return stop_process_service(data.get("process_id"))
    else:
        return jsonify({"error": "Invalid service type"}), 400


@app.route('/services/<container_id>/logs', methods=['GET'])
def get_logs(container_id):
    try:
        result = subprocess.run(["docker", "logs", container_id],capture_output=True, text=True, timeout=10,stderr=sys.stderr,stdout=sys.stdout)
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




# Log endpoints for frontend
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


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
