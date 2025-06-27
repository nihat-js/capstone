from flask import Flask, request, jsonify
import datetime
import json
import os

app = Flask(__name__)
LOG_FILE = 'logs/http_honeypot_logs.txt'

def log_request(ip, method, path, headers, data):
    # Skip logging favicon.ico
    if path == "favicon.ico":
        return

    timestamp = datetime.datetime.now().isoformat()
    log_entry = {
        "timestamp": timestamp,
        "ip": ip,
        "method": method,
        "path": path,
        "headers": headers,
        "data": data
    }

    print(f"[LOG] {timestamp} - {ip} -> {method} {path}")
    with open(LOG_FILE, 'a') as f:
        f.write(json.dumps(log_entry) + '\n')

# Simulated API endpoints
@app.route('/api/login', methods=["POST"])
def fake_login():
    ip = request.remote_addr
    headers = dict(request.headers)
    data = request.get_data(as_text=True)
    log_request(ip, "POST", "api/login", headers, data)
    return jsonify({"message": "Invalid username or password"}), 401

@app.route('/api/data', methods=["GET"])
def fake_data():
    ip = request.remote_addr
    headers = dict(request.headers)
    data = request.get_data(as_text=True)
    log_request(ip, "GET", "api/data", headers, data)
    return jsonify({"data": []}), 200

@app.route('/api/status', methods=["GET"])
def fake_status():
    ip = request.remote_addr
    headers = dict(request.headers)
    data = request.get_data(as_text=True)
    log_request(ip, "GET", "api/status", headers, data)
    return jsonify({"status": "running"}), 200

# Catch-all route for all other paths
@app.route('/', defaults={'path': ''}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
@app.route('/<path:path>', methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def catch_all(path):
    ip = request.remote_addr
    method = request.method
    headers = dict(request.headers)
    data = request.get_data(as_text=True)
    log_request(ip, method, path, headers, data)
    return "Bad Path", 200

if __name__ == '__main__':
    # Make sure log file exists
    if not os.path.exists(LOG_FILE):
        open(LOG_FILE, 'w').close()

    app.run(host='0.0.0.0', port=80)
