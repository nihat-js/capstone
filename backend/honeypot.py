import socket
from logger import log_connection

HOST = '0.0.0.0'
PORT = 2222  # Commonly scanned port (fake SSH)

def run_honeypot():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        print(f"Honeypot listening on {HOST}:{PORT}")

        while True:
            conn, addr = s.accept()
            with conn:
                print(f"Connection from {addr}")
                data = conn.recv(1024)
                log_connection(addr, data)
                conn.sendall(b"Fake SSH service\r\n")
