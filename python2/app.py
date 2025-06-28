from flask import Flask, request, jsonify
import postgres
import subprocess
import mysql

app = Flask(__name__)


services = []


DOCKER_SERVICES = {
  "postgres" : postgres.start,
  "mysql" : mysql.start,
}

@app.route('/services', methods=['GET'])
def list_services():
    return jsonify(services), 200


@app.route('/services/start', methods=['POST'])
def start_service():
    data = request.get_json(force=False) 
    config = data.get('config', {})
    name,port = config.get("name"), config.get("port")
    if name is None or port is None:
        return jsonify({"error": "Name and port is required"}), 400
      
    container_id = None
    
    if name.lower() in DOCKER_SERVICES:
        try:
            container_id = DOCKER_SERVICES[name.lower()](config)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    # if ["postgres", "mysql", "redis", "mongodb"].count(name)  > 0:
    # if name == 'postgres':
    #     container_id = postgres.start(config)
    # elif name == 'mysql':
    #     container_id = mysql.start(config)
    # elif name == 'redis':
    #     container_id = redis.start_redis(config)
    # elif name == 'mongodb':
    #     container_id = mongodb.start_mongodb(config)
    # elif name == "flask_api":
        # container_id = flask_api.start_flask_api(config)
    else:
        return jsonify({"error": "Service not recognized"}), 400
    # services.append({
    #     "name": name,
    #     "config": config,
    #     "container_id": container_id
    # })
    
    return jsonify({
        "message": f"{name} service started successfully",
        "container_id": container_id
    }), 200


@app.route('/services/stop/<name>', methods=['POST'])
def stop_service(name):
    data = request.get_json()
    config = data.get('config', {})
    if ["postgres", "mysql", "redis", "mongodb"].count(name) > 0:
        subprocess.run(["kill", "-9", name])
    elif ["flask_api"].count(name) > 0:
        subprocess.run(["docker", "stop", name])


app.run(host="localhost", port=5000, debug=True)
