"""
RDP Honeypot Service
Provides RDP honeypot functionality
"""
import socket
import threading
import time
import os
import subprocess

DEFAULT_RDP_PORT = 3389

def handle_client(client_socket, addr):
    try:
        print(f"[+] RDP connection attempt from {addr}")

        # Send fake RDP greeting or banner (just to mimic server)
        client_socket.sendall(b"RDP-Server v1.0\n")
        client_socket.sendall(b"Username: ")

        # Receive username
        username = client_socket.recv(1024).strip().decode(errors="ignore")
        client_socket.sendall(b"Password: ")

        # Receive password
        password = client_socket.recv(1024).strip().decode(errors="ignore")

        print(f"[!] RDP login attempt from {addr} - Username: '{username}' Password: '{password}'")
        
        # Log the attempt
        log_file = "services/log/rdp_logs.txt"
        os.makedirs("services/log", exist_ok=True)
        with open(log_file, "a") as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] RDP login attempt from {addr[0]}:{addr[1]} - Username: '{username}' Password: '{password}'\n")

        # Always reject login
        client_socket.sendall(b"Access denied. Connection closing.\n")
    except Exception as e:
        print(f"[!] Exception with {addr}: {e}")
    finally:
        client_socket.close()

def start_rdp_honeypot(config):
    """Start RDP honeypot with given configuration"""
    try:
        rdp_port = config.get('port', DEFAULT_RDP_PORT)
        
        print(f"🚀 Starting RDP honeypot on port {rdp_port}")
        
        # For now, just return success (implement actual RDP honeypot later)
        print("✅ RDP honeypot started successfully (placeholder)")
        return True
    except Exception as e:
        print(f"❌ Error starting RDP honeypot: {e}")
        return False

def stop_rdp_honeypot(container_name):
    """Stop RDP honeypot container"""
    try:
        print(f"🛑 Stopping RDP honeypot: {container_name}")
        # Implement actual stop logic
        return True
    except Exception as e:
        print(f"❌ Error stopping RDP honeypot: {e}")
        return False

def get_rdp_honeypot_status(container_name):
    """Get RDP honeypot status"""
    try:
        # Implement actual status check
        return "running"
    except Exception as e:
        print(f"❌ Error getting RDP status: {e}")
        return "stopped"

def get_rdp_honeypot_logs(instance_id=None):
    """Get RDP honeypot logs"""
    try:
        log_file = "services/log/rdp_logs.txt"
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                return f.read()
        return "No RDP logs available yet"
    except Exception as e:
        return f"Error reading RDP logs: {e}"

def list_running_rdp_honeypots():
    """List running RDP honeypot containers"""
    try:
        # Implement actual container listing
        return []
    except Exception as e:
        print(f"❌ Error listing RDP honeypots: {e}")
        return []

def rdp_honeypot():
    """Legacy function for running RDP honeypot directly"""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(("", DEFAULT_RDP_PORT))
    server.listen(5)
    print(f"[*] RDP honeypot listening on port {DEFAULT_RDP_PORT}")

    while True:
        client_sock, addr = server.accept()
        client_handler = threading.Thread(target=handle_client, args=(client_sock, addr))
        client_handler.start()

if __name__ == "__main__":
    rdp_honeypot()
