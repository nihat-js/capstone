from flask import Flask, request, jsonify
import services.postgres as postgres
import subprocess
import services.mysql as mysql
import services.phpmyadmin as phpmyadmin
from functools import wraps

app = Flask(__name__)

services = []


def with_json(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            data = request.get_json(force=True)
        except Exception as e:
            return jsonify({"error": "Invalid or missing JSON"}), 400
        return f(data, *args, **kwargs)
    return decorated_function


DOCKER_SERVICES = {
    "postgres": postgres.start,
    "mysql": mysql.start,
    "phpmyadmin": phpmyadmin.start
}


@app.route('/services', methods=['GET'])
def list_services():
    return jsonify(services), 200


@app.route('/services/start', methods=['POST'])
def start_service():
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
    if data.get("type") == "docker":
        subprocess.run(["docker", "stop", data["container_id"]])
        services.filter(
            lambda x: x["container_id"] != data["container_id"])
        return jsonify({"message": "Service stopped successfully"}), 200
    elif data.get("type") == "terminal":
        subprocess.run(["pkill", "-f", data["name"]])
        services[:] = [s for s in services if s["name"] != data["name"]]
        return jsonify({"message": "Service stopped successfully"}), 200


app.run(host="localhost", port=5000, debug=True)
