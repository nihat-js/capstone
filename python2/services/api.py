from flask import Flask, jsonify, request
from datetime import datetime
import os

app = Flask(__name__)

LOG_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '../logs/api_logs.txt'))
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

def log_request():
    user_agent = request.headers.get('User-Agent', 'unknown')
    with open(LOG_FILE, 'a') as f:
        f.write(f"{datetime.utcnow().isoformat()} - {request.remote_addr} - {request.method} {request.path} - {user_agent}\n")

@app.before_request
def before_request():
    if request.path == '/favicon.ico':
        return  # Skip logging favicon requests
    log_request()

def config():
    return jsonify({
        "database": {
            "host": "db.internal.local",
            "port": 5432,
            "user": "honeypotUser",
            "password": "tryMe123!",
            "name": "secret_db"
        },
        "api_key": "ABCD-1234-FAKE-KEY",
        "admin_email": "admin@fakecompany.com"
    })

app.add_url_rule('/config', 'config', config)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

