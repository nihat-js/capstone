from flask import Flask, jsonify, request
from datetime import datetime
import os
app = Flask(__name__)

os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)




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
    
    with open(LOG_FILE, 'a') as f:
        f.write(f"{timestamp} - {ip_address} - {request.method} {request.path} - {user_agent}\n")
    
    json_log_file = LOG_FILE.replace('.txt', '_structured.json')
    with open(json_log_file, 'a') as f:
        import json
        f.write(json.dumps(log_entry) + '\n')

@app.before_request
def before_request():
    if request.path == '/favicon.ico':
        return  # Skip logging favicon requests
    log_request()

@app.route('/config', methods=['GET'])
def config():
    return jsonify({
        "database": {
            "host": "db.internal.local",
            "port": 3306,
            "user": "root",
            "password": "james",
            "name": "secret"
        },
        # "api_key": API_KEY,
        # "admin_email": ADMIN_EMAIL
    })


if __name__ == '__main__':
    print(f"Starting API service on port {9000}")
    app.run(host='0.0.0.0', port=9000)

