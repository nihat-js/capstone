from flask import Flask, request, jsonify
import postgres
from subprocess import subprocess

app = Flask(__name__)


services = []


@app.route('/services/start/<name>', methods=['POST'])
def start_service(name):
    data = request.get_json()
    config = data.get('config', {})
    container_id = None
    if name == 'postgres':
        container_id = postgres.start_postgres(config)
    elif name == 'mysql':
        container_id = mysql.start_mysql(config)
    elif name == 'redis':
        container_id = redis.start_redis(config)
    elif name == 'mongodb':
        container_id = mongodb.start_mongodb(config)
    elif name == "flask_api":
        # container_id = flask_api.start_flask_api(config)

        services.append({
            "name": name,
            "config": config,
            "container_id": container_id
        })


@app.route('/services/stop/<name>', methods=['POST'])
def stop_service(name):
	data = request.get_json()
	config = data.get('config', {})
	if ["postgres", "mysql", "redis", "mongodb"].count(name) > 0:
		subprocess.run(["kill", "-9", name])
	elif ["flask_api"].count(name) > 0:
		subprocess.run(["docker", "stop", name])

 
 
app.run(host="localhost", port=5000, debug=True) 