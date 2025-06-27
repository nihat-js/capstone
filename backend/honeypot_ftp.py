#!/usr/bin/env python3
"""
FTP Honeypot Implementation
Simulates an FTP server to capture attack attempts
"""

import socket
import threading
import os
import time
import json
from datetime import datetime
import logging

class FTPHoneypot:
    def __init__(self, config):
        self.config = config
        self.host = '0.0.0.0'
        self.port = int(config.get('port', 21))
        self.banner = config.get('ftp_banner', '220 Welcome to FTP Server')
        self.anonymous_login = config.get('anonymous_login', True)
        self.max_connections = int(config.get('max_connections', 10))
        self.fake_files = self._parse_fake_files(config.get('fake_files', ''))
        self.running = False
        self.server_socket = None
        self.connections = []
        
        # Setup logging
        self.logger = self._setup_logging()
        
    def _setup_logging(self):
        """Setup logging for FTP honeypot"""
        logger = logging.getLogger(f'ftp_honeypot_{self.port}')
        logger.setLevel(logging.INFO)
        
        # Create file handler
        log_file = f'logs/ftp_honeypot_{self.port}.log'
        os.makedirs('logs', exist_ok=True)
        
        handler = logging.FileHandler(log_file)
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
        
    def _parse_fake_files(self, fake_files_str):
        """Parse fake file structure from configuration"""
        files = {}
        if fake_files_str:
            for line in fake_files_str.strip().split('\n'):
                line = line.strip()
                if line:
                    if line.endswith('/'):
                        # Directory
                        files[line] = {'type': 'directory', 'size': 0}
                    else:
                        # File
                        files[line] = {'type': 'file', 'size': 1024}
        
        # Add some default files if none specified
        if not files:
            files = {
                'readme.txt': {'type': 'file', 'size': 256},
                'documents/': {'type': 'directory', 'size': 0},
                'documents/important.pdf': {'type': 'file', 'size': 5120},
                'uploads/': {'type': 'directory', 'size': 0}
            }
        
        return files
        
    def start(self):
        """Start the FTP honeypot"""
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(5)
            self.running = True
            
            self.logger.info(f"FTP Honeypot started on {self.host}:{self.port}")
            print(f"FTP Honeypot listening on port {self.port}")
            
            while self.running:
                try:
                    client_socket, address = self.server_socket.accept()
                    if len(self.connections) < self.max_connections:
                        client_thread = threading.Thread(
                            target=self._handle_client,
                            args=(client_socket, address)
                        )
                        client_thread.daemon = True
                        client_thread.start()
                    else:
                        client_socket.close()
                        self.logger.warning(f"Connection limit reached, rejecting {address}")
                        
                except socket.error:
                    if self.running:
                        self.logger.error("Socket error in main loop")
                    break
                    
        except Exception as e:
            self.logger.error(f"Failed to start FTP honeypot: {e}")
            print(f"Error starting FTP honeypot: {e}")
            
    def stop(self):
        """Stop the FTP honeypot"""
        self.running = False
        if self.server_socket:
            self.server_socket.close()
        
        # Close all client connections
        for conn in self.connections:
            try:
                conn.close()
            except:
                pass
        self.connections.clear()
        
        self.logger.info("FTP Honeypot stopped")
        print(f"FTP Honeypot on port {self.port} stopped")
        
    def _handle_client(self, client_socket, address):
        """Handle individual FTP client connection"""
        self.connections.append(client_socket)
        client_ip = address[0]
        
        self.logger.info(f"New FTP connection from {client_ip}:{address[1]}")
        
        try:
            # Send welcome banner
            self._send_response(client_socket, self.banner)
            
            authenticated = False
            username = None
            current_dir = "/"
            
            while self.running:
                try:
                    data = client_socket.recv(1024).decode('utf-8', errors='ignore').strip()
                    if not data:
                        break
                        
                    self.logger.info(f"Command from {client_ip}: {data}")
                    
                    # Parse FTP command
                    parts = data.split(' ', 1)
                    command = parts[0].upper()
                    args = parts[1] if len(parts) > 1 else ""
                    
                    # Handle FTP commands
                    if command == 'USER':
                        username = args
                        if self.anonymous_login and args.lower() in ['anonymous', 'ftp']:
                            self._send_response(client_socket, "331 Anonymous login ok, send your email address as password.")
                        else:
                            self._send_response(client_socket, f"331 Password required for {args}")
                            
                    elif command == 'PASS':
                        if username:
                            authenticated = True
                            self._send_response(client_socket, f"230 User {username} logged in")
                            self.logger.info(f"Login attempt from {client_ip}: {username}:{args}")
                        else:
                            self._send_response(client_socket, "503 Login with USER first")
                            
                    elif command == 'SYST':
                        self._send_response(client_socket, "215 UNIX Type: L8")
                        
                    elif command == 'PWD':
                        self._send_response(client_socket, f'257 "{current_dir}" is current directory')
                        
                    elif command == 'LIST' or command == 'NLST':
                        if authenticated:
                            self._handle_list_command(client_socket, current_dir)
                        else:
                            self._send_response(client_socket, "530 Not logged in")
                            
                    elif command == 'CWD':
                        if authenticated:
                            # Fake directory change
                            current_dir = args if args.startswith('/') else f"{current_dir.rstrip('/')}/{args}"
                            self._send_response(client_socket, f"250 Directory changed to {current_dir}")
                        else:
                            self._send_response(client_socket, "530 Not logged in")
                            
                    elif command == 'TYPE':
                        self._send_response(client_socket, "200 Type set to I")
                        
                    elif command == 'PASV':
                        # Fake passive mode response
                        self._send_response(client_socket, "227 Entering Passive Mode (127,0,0,1,200,10)")
                        
                    elif command == 'RETR':
                        if authenticated:
                            self.logger.info(f"File download attempt from {client_ip}: {args}")
                            self._send_response(client_socket, "550 File not found")
                        else:
                            self._send_response(client_socket, "530 Not logged in")
                            
                    elif command == 'STOR':
                        if authenticated:
                            self.logger.info(f"File upload attempt from {client_ip}: {args}")
                            self._send_response(client_socket, "550 Permission denied")
                        else:
                            self._send_response(client_socket, "530 Not logged in")
                            
                    elif command == 'QUIT':
                        self._send_response(client_socket, "221 Goodbye")
                        break
                        
                    else:
                        self._send_response(client_socket, f"502 Command '{command}' not implemented")
                        
                except socket.error:
                    break
                except Exception as e:
                    self.logger.error(f"Error handling client {client_ip}: {e}")
                    break
                    
        except Exception as e:
            self.logger.error(f"Connection error with {client_ip}: {e}")
        finally:
            try:
                client_socket.close()
                self.connections.remove(client_socket)
            except:
                pass
                
    def _send_response(self, client_socket, response):
        """Send FTP response to client"""
        try:
            if not response.endswith('\r\n'):
                response += '\r\n'
            client_socket.send(response.encode('utf-8'))
        except:
            pass
            
    def _handle_list_command(self, client_socket, current_dir):
        """Handle LIST/NLST command"""
        # Send fake file listing
        file_list = []
        for filename, info in self.fake_files.items():
            if info['type'] == 'directory':
                file_list.append(f"drwxr-xr-x 2 ftp ftp 4096 Jan 01 12:00 {filename.rstrip('/')}")
            else:
                file_list.append(f"-rw-r--r-- 1 ftp ftp {info['size']} Jan 01 12:00 {filename}")
        
        response = "150 Opening data connection\r\n"
        for line in file_list:
            response += line + "\r\n"
        response += "226 Transfer complete"
        
        self._send_response(client_socket, response)

def create_ftp_honeypot(config):
    """Factory function to create FTP honeypot"""
    return FTPHoneypot(config)

if __name__ == "__main__":
    # Test configuration
    test_config = {
        'port': 2121,
        'ftp_banner': '220 Test FTP Server Ready',
        'anonymous_login': True,
        'max_connections': 5,
        'fake_files': 'readme.txt\ndocuments/\ndocuments/secret.pdf\nuploads/'
    }
    
    honeypot = FTPHoneypot(test_config)
    try:
        honeypot.start()
    except KeyboardInterrupt:
        honeypot.stop()
