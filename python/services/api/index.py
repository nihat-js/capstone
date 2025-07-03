#!/usr/bin/env python3
import uvicorn
import os
import json
import argparse
import subprocess
import sys
from datetime import datetime
from fastapi import FastAPI, Request
from os import path, getenv

app = FastAPI(title="API Honeypot Service", version="1.0.0")

# Global variables for configuration
port_config = 8080
username_config = "james"
password_config = "james"

# Setup logging
log_file = path.join(getenv("log_dir", "../../logs"), "api", "logs.txt")
log_file_json = path.join(getenv("log_dir", "../../logs"), "api", "logs.json")
os.makedirs(path.dirname(log_file_json), exist_ok=True)
os.makedirs(path.dirname(log_file), exist_ok=True)

def log_request(request: Request):
    """Log incoming requests"""
    user_agent = request.headers.get('User-Agent', 'unknown')
    ip_address = request.headers.get('X-Forwarded-For', str(request.client.host))
    timestamp = datetime.utcnow().isoformat()

    log_entry = {
        "timestamp": timestamp,
        "ip": ip_address,
        "method": request.method,
        "path": str(request.url.path),
        "user_agent": user_agent,
        "query_params": dict(request.query_params),
        "headers": dict(request.headers)
    }
    
    # Write to text log
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(f"{timestamp} - {ip_address} - {request.method} {request.url.path} - {user_agent}\n")
    
    # Write to JSON log
    with open(log_file_json, 'a', encoding='utf-8') as f:
        f.write(json.dumps(log_entry) + "\n")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log all requests"""
    if request.url.path != '/favicon.ico':
        log_request(request)
    response = await call_next(request)
    return response

@app.get("/config")
async def config():
    """Configuration endpoint"""
    return {
        "database": {
            "host": "localhost",
            "port": 3306,
            "username": username_config,
            "password": password_config,
        },
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "api-honeypot",
        "timestamp": datetime.utcnow().isoformat(),
        "port": port_config,
        "username": username_config
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "API Honeypot Service",
        "endpoints": ["/config", "/health"],
        "timestamp": datetime.utcnow().isoformat()
    }

def start(config):
    """Start the API honeypot service as a subprocess"""
    try:
        # Extract configuration
        port = config.get('port', 8080)
        username = config.get('username', 'james')
        password = config.get('password', 'james')
        
        # Get the current script path
        script_path = os.path.abspath(__file__)
        python_executable = sys.executable
        
        # Prepare command arguments
        cmd = [
            python_executable,
            script_path,
            "--port", str(port),
            "--username", username,
            "--password", password
        ]
        
        # Set up log file for subprocess output
        log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs", "api")
        os.makedirs(log_dir, exist_ok=True)
        subprocess_log = os.path.join(log_dir, "subprocess.log")
        
        # Start subprocess with detached process
        with open(subprocess_log, 'w') as log_file:
            process = subprocess.Popen(
                cmd,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                cwd=os.path.dirname(__file__),
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
            )
        
        print(f"API honeypot started on port {port} (PID: {process.pid})")
        
        # Return port as "fake PID" for tracking
        return port
        
    except Exception as e:
        print(f"Failed to start API honeypot: {e}")
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Start the API service.')
    parser.add_argument('--port', type=int, default=8080,
                        help='Port to run the API service on.')
    parser.add_argument("--username", type=str, default="james",
                        help="Username for the API service")
    parser.add_argument("--password", type=str, default="james",
                        help="Password for the API service")
    args = parser.parse_args()

    # Set global config
    port_config = args.port
    username_config = args.username
    password_config = args.password

    os.makedirs(path.dirname(log_file), exist_ok=True)

    try:
        print(f"Starting FastAPI honeypot on port {args.port}")
        uvicorn.run(app, host="0.0.0.0", port=args.port, log_level="error")
    except Exception as e:
        print(f"Failed to start server: {e}")
        exit(1)
