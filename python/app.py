from flask import Flask, request, jsonify
from functools import wraps
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv
import os
import subprocess

import services.ssh.index as ssh
import services.api as api
import services.mysql as mysql

import services.api.log_extractor as api_log_extractor
import services.ssh._log_extractor as ssh_log_extractor


load_dotenv()
app = Flask(__name__)
CORS(app)
services = []
log_dir = os.getenv("LOG_DIR")

DOCKER_SERVICES = {
    "ssh" : ssh.start,
    # "postgres": postgres.start,
    # "mysql": service.start,
    # "phpmyadmin": phpmyadmin.start,
    # "redis" : redis.start,
    # "ftp": ftp.start
}

PROCESS_SERVICES = {
    # "api": api_service.start,
    # "rdp" : rdp_service.start,
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
    elif name.lower() in PROCESS_SERVICES:
        process_id, error_message = PROCESS_SERVICES[name.lower()](config)
        if error_message:
            return jsonify({"error": error_message}), 500
        else:
            services.append({
                "type": "process",
                "process_id": process_id,
                "name": name,
                "config": config})
            return jsonify({"error": False, "process_id": process_id}), 200
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
        return jsonify({"error": False}), 200
    elif data.get("type") == "process":
        # Stop process using the process_id
        process_id = data.get("process_id")
        if process_id:
            # Import the API service to use its stop function
            success = api_service.stop(process_id)
            if success:
                services = list(filter(
                    lambda x: x.get("process_id") != process_id,
                    services
                ))
                return jsonify({"error": False}), 200
            else:
                return jsonify({"error": "Failed to stop process"}), 500
        else:
            return jsonify({"error": "Process ID required"}), 400
    else:
        return jsonify({"error": "Invalid service type"}), 400


@app.route('/services/<container_id>/logs', methods=['GET'])
def get_logs(container_id):
    try:
        result = subprocess.run(
            ["docker", "logs", container_id],
            capture_output=True, text=True, timeout=10
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




@app.route('/services/<type>/reallogs', methods=['GET'])
def get_real_logs(type):
    if type == "api":
        print("bura geldi")
        data = api_log_extractor.extract_api_logs()
        return jsonify({
            "error": False,
            "message": "API logs extracted successfully",
            "data": data
        }), 200
    elif type == "ssh":
        # Assuming ssh service has a log extractor
        ssh_log_extractor.extract_ssh_logs()
        return jsonify({
            "error": False,
            "message": "SSH logs extracted successfully"
        }), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
