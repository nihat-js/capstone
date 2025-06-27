from flask import Flask, request, jsonify
import datetime
import os

app = Flask(__name__)
LOG_FILE = "../logs/api_honeypot.log"

def log_request():
    with open(LOG_FILE, "a") as f:
        time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ip = request.remote_addr
        method = request.method
        path = request.path
        headers = dict(request.headers)
        body = request.get_data(as_text=True)

        f.write(f"---\nTime: {time}\nIP: {ip}\nMethod: {method}\nPath: {path}\nHeaders: {headers}\nBody: {body}\n\n")

@app.route("/status", methods=["GET"])
def status():
    log_request()
    return jsonify({
        "status": "ok",
        "uptime": "99.9%",
        "message": "API honeypot running"
    })

@app.route("/login", methods=["POST"])
def login():
    log_request()
    data = request.json or {}
    username = data.get("username")
    # Just log credentials, no real auth
    return jsonify({"message": f"User {username} logged in successfully."})

@app.route("/data", methods=["GET"])
def data():
    log_request()
    dummy_data = {
        "items": [
            {"id": 1, "name": "Item One"},
            {"id": 2, "name": "Item Two"},
            {"id": 3, "name": "Item Three"},
        ]
    }
    return jsonify(dummy_data)

@app.route('/', defaults={'path': ''}, methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
@app.route('/<path:path>', methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
def catch_all(path):
    log_request()
    return jsonify({"message": "API endpoint not found or unauthorized"}), 404

if __name__ == "__main__":
    port = int(os.environ.get("HONEYPOT_PORT", 8080))
    app.run(host="0.0.0.0", port=port)
