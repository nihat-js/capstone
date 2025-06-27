import socket
import threading

RDP_PORT = 3389

def handle_client(client_socket, addr):
    try:
        print(f"[+] Connection attempt from {addr}")

        # Send fake RDP greeting or banner (just to mimic server)
        client_socket.sendall(b"RDP-Server v1.0\n")
        client_socket.sendall(b"Username: ")

        # Receive username
        username = client_socket.recv(1024).strip().decode(errors="ignore")
        client_socket.sendall(b"Password: ")

        # Receive password
        password = client_socket.recv(1024).strip().decode(errors="ignore")

        print(f"[!] Login attempt from {addr} - Username: '{username}' Password: '{password}'")

        # Always reject login
        client_socket.sendall(b"Access denied. Connection closing.\n")
    except Exception as e:
        print(f"[!] Exception with {addr}: {e}")
    finally:
        client_socket.close()

def rdp_honeypot():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(("", RDP_PORT))
    server.listen(5)
    print(f"[*] RDP honeypot listening on port {RDP_PORT}")

    while True:
        client_sock, addr = server.accept()
        client_handler = threading.Thread(target=handle_client, args=(client_sock, addr))
        client_handler.start()

if __name__ == "__main__":
    rdp_honeypot()
