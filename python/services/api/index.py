# -*- coding: utf-8 -*-
from flask import Flask, jsonify, request
from datetime import datetime
from os import path, getenv
import os
import json
import argparse
import subprocess
import sys
import psutil


app = Flask(__name__)


log_file = path.join(getenv("log_dir", "../../logs"), "api", "logs.txt")
log_file_json = path.join(getenv("log_dir", "../../logs"), "api", "logs.json")
os.makedirs(path.dirname(log_file_json), exist_ok=True)
os.makedirs(path.dirname(log_file), exist_ok=True)


def start(config=None):
    """Start the API honeypot service with given configuration"""
    if not config:
        return None, "No configuration provided"

    port = config.get('port', 8080)
    username = config.get('username', 'james')
    password = config.get('password', 'james')
    
    # Handle empty password from config
    if not password or password.strip() == '':
        password = 'james'

    try:
        # Check if port is available first
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.bind(('localhost', port))
            sock.close()
        except OSError:
            return None, f"Port {port} is already in use"

        # Use a simpler approach that works reliably on Windows
        cmd = [
            'python', __file__,
            '--port', str(port),
            '--username', username,
            '--password', password
        ]
        
        # Start as background process
        if os.name == 'nt':  # Windows
            # Use CREATE_NEW_PROCESS_GROUP to properly detach on Windows
            process = subprocess.Popen(
                cmd,
                cwd=os.path.dirname(__file__),
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        else:
            # Linux/Unix approach
            process = subprocess.Popen(
                cmd,
                cwd=os.path.dirname(__file__),
                preexec_fn=os.setsid if hasattr(os, 'setsid') else None,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        
        # Give it a moment to start
        import time
        time.sleep(3)
        
        # Check if still running
        if process.poll() is None:
            # Verify the process is still running using psutil
            import psutil
            if psutil.pid_exists(process.pid):
                return process.pid, None
            else:
                return None, "Process started but disappeared immediately"
        else:
            return None, f"Process exited with code {process.returncode}"
            
    except Exception as e:
        return None, f"Failed to start API service: {str(e)}"


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
        f.write(
            f"{timestamp} - {ip_address} - {request.method} {request.path} - {user_agent}\n")
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


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "api-honeypot",
        "timestamp": datetime.utcnow().isoformat(),
        "port": args.port,
        "username": args.username
    })


@app.route('/', methods=['GET'])
def root():
    """Root endpoint to catch basic requests"""
    return jsonify({
        "message": "API Honeypot Service",
        "endpoints": ["/config", "/health"],
        "timestamp": datetime.utcnow().isoformat()
    })


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Start the API service.')
    parser.add_argument('--port', type=int, default=8080,
                        help='Port to run the API service on.')
    parser.add_argument("--username", type=str, default="james",
                        help="Username for the API service")
    parser.add_argument("--password", type=str, default="james",
                        help="Password for the API service")
    args = parser.parse_args()

    os.makedirs(os.path.dirname(log_file), exist_ok=True)

    try:
        app.run(host='0.0.0.0', port=args.port,
                debug=False, use_reloader=False)
    except Exception as e:
        print(f"Failed to start server: {e}")
        sys.exit(1)
