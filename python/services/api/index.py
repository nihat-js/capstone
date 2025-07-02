from flask import Flask, jsonify, request
from datetime import datetime
from os import path ,getenv
import os
import json
import argparse
import subprocess
app = Flask(__name__)


log_file = path.join(getenv("log_dir","../../logs"),"api","logs.txt")
log_file_json = path.join(getenv("log_dir","../../logs"),"api","logs.json")

def start():
    subprocess.run(["mkdir", "-p", path.dirname(log_file_json)], check=True)

def log_request():
    user_agent = request.headers.get('User-Agent', 'unknown')
    ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
    timestamp = datetime.utcnow().isoformat()
    
    log_entry = {
        "timestamp": timestamp,
        "ip": ip_address,
        "method": request.method,
        "path": request.path,
        "user_agent": user_agent,
        "query_params": dict(request.args),
        "headers": dict(request.headers)
    }
    with open(log_file, 'a') as f:
        f.write(f"{timestamp} - {ip_address} - {request.method} {request.path} - {user_agent}\n")
    with open(log_file_json, 'a') as f:
        f.write(json.dumps(log_entry) + "\n")    
    

@app.before_request
def before_request():
    if request.path == '/favicon.ico':
        return 
    log_request()

@app.route('/config', methods=['GET'])
def config():
    return jsonify({
        "database": {
            "host": "localhost",
            "port": 3306,
            "username": args.username,
            "password": args.password,
        },
    })


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Start the API service.')
    parser.add_argument('--port', type=int, default=9000, help='Port to run the API service on.')
    parser.add_argument("--username", type=str, default="james", help="Username for the API service")
    parser.add_argument("--password", type=str, default="james", help="Password for the API service")
    args = parser.parse_args()
    print(f"Starting API service on port {args.port}")
    app.run(host='0.0.0.0', port=args.port)

