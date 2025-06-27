#!/usr/bin/env python3
"""
Telnet Switch Honeypot Implementation
Simulates a network switch or router with Telnet management interface
"""

import socket
import threading
import time
import os
import logging
from datetime import datetime

class TelnetSwitchHoneypot:
    def __init__(self, config):
        self.config = config
        self.host = '0.0.0.0'
        self.port = int(config.get('port', 23))
        self.device_type = config.get('device_type', 'cisco_switch')
        self.hostname = config.get('hostname', 'SW-CORE-01')
        self.enable_password = config.get('enable_password', 'enable123')
        self.motd = config.get('motd', '***************************************************\n* Authorized Access Only - All Activity Monitored *\n***************************************************')
        self.interface_config = self._parse_interfaces(config.get('interface_config', ''))
        self.running = False
        self.server_socket = None
        self.connections = []
        
        # Setup logging
        self.logger = self._setup_logging()
        
        # Device-specific configurations
        self.device_configs = {
            'cisco_switch': {
                'prompt': f'{self.hostname}>',
                'enable_prompt': f'{self.hostname}#',
                'banner': 'Cisco IOS Software, Catalyst 2960 Software (C2960-LANBASEK9-M)',
                'version_info': '''Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE, RELEASE SOFTWARE (fc1)
Technical Support: http://www.cisco.com/techsupport
Copyright (c) 1986-2012 by Cisco Systems, Inc.
Compiled Sat 28-Jul-12 00:29 by prod_rel_team'''
            },
            'cisco_router': {
                'prompt': f'{self.hostname}>',
                'enable_prompt': f'{self.hostname}#',
                'banner': 'Cisco IOS Software, ISR 2800 Software (C2800NM-ADVENTERPRISEK9-M)',
                'version_info': '''Cisco IOS Software, 2800 Software (C2800NM-ADVENTERPRISEK9-M), Version 15.1(4)M8, RELEASE SOFTWARE (fc2)
Technical Support: http://www.cisco.com/techsupport
Copyright (c) 1986-2014 by Cisco Systems, Inc.
Compiled Wed 26-Feb-14 07:21 by prod_rel_team'''
            },
            'juniper_switch': {
                'prompt': f'{self.hostname}> ',
                'enable_prompt': f'{self.hostname}# ',
                'banner': 'JUNOS Software Release [12.3R3.4] (Build date: 2013-06-24)',
                'version_info': '''Hostname: {hostname}
Model: ex4200-24t
JUNOS Software Release [12.3R3.4] (Build date: 2013-06-24 04:57:27 UTC)'''.format(hostname=self.hostname)
            },
            'hp_switch': {
                'prompt': f'{self.hostname}# ',
                'enable_prompt': f'{self.hostname}# ',
                'banner': 'HP ProCurve Switch 2848',
                'version_info': '''Image stamp:    /ws/swbuildm/rel_davos_qaoff/code/build/harp(swbuildm_rel_davos_qaoff_rel_davos)
                        Sep  7 2009 - 16:58:18
Boot Image:      Primary'''
            }
        }
        
    def _setup_logging(self):
        """Setup logging for Telnet honeypot"""
        logger = logging.getLogger(f'telnet_honeypot_{self.port}')
        logger.setLevel(logging.INFO)
        
        # Create file handler
        log_file = f'logs/telnet_honeypot_{self.port}.log'
        os.makedirs('logs', exist_ok=True)
        
        handler = logging.FileHandler(log_file)
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
        
    def _parse_interfaces(self, interfaces_str):
        """Parse interface configuration from config"""
        interfaces = {}
        if interfaces_str:
            for line in interfaces_str.strip().split('\n'):
                if ':' in line:
                    parts = line.split(':')
                    if len(parts) >= 2:
                        interface = parts[0].strip()
                        status = parts[1].strip()
                        interfaces[interface] = status
        
        # Add default interfaces if none specified
        if not interfaces:
            interfaces = {
                'GigabitEthernet0/1': 'up/up',
                'GigabitEthernet0/2': 'up/up',
                'GigabitEthernet0/3': 'down/down',
                'FastEthernet0/24': 'up/up'
            }
        
        return interfaces
        
    def start(self):
        """Start the Telnet honeypot"""
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(5)
            self.running = True
            
            self.logger.info(f"Telnet Switch Honeypot started on {self.host}:{self.port}")
            print(f"Telnet Switch Honeypot listening on port {self.port}")
            
            while self.running:
                try:
                    client_socket, address = self.server_socket.accept()
                    client_thread = threading.Thread(
                        target=self._handle_client,
                        args=(client_socket, address)
                    )
                    client_thread.daemon = True
                    client_thread.start()
                    
                except socket.error:
                    if self.running:
                        self.logger.error("Socket error in main loop")
                    break
                    
        except Exception as e:
            self.logger.error(f"Failed to start Telnet honeypot: {e}")
            print(f"Error starting Telnet honeypot: {e}")
            
    def stop(self):
        """Stop the Telnet honeypot"""
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
        
        self.logger.info("Telnet Switch Honeypot stopped")
        print(f"Telnet Switch Honeypot on port {self.port} stopped")
        
    def _handle_client(self, client_socket, address):
        """Handle individual Telnet client connection"""
        self.connections.append(client_socket)
        client_ip = address[0]
        
        self.logger.info(f"New Telnet connection from {client_ip}:{address[1]}")
        
        try:
            device_config = self.device_configs.get(self.device_type, self.device_configs['cisco_switch'])
            
            # Send initial banner and MOTD
            if self.motd:
                self._send_response(client_socket, self.motd + '\r\n\r\n')
            
            # Send device banner
            self._send_response(client_socket, device_config['banner'] + '\r\n\r\n')
            
            # Authentication
            authenticated = False
            privileged = False
            username = None
            
            # User Mode Authentication
            if not self._authenticate_user(client_socket, client_ip):
                return
                
            authenticated = True
            self._send_response(client_socket, device_config['prompt'] + ' ')
            
            # Command loop
            command_buffer = ""
            
            while self.running and authenticated:
                try:
                    data = client_socket.recv(1).decode('utf-8', errors='ignore')
                    if not data:
                        break
                    
                    if data == '\r' or data == '\n':
                        if command_buffer.strip():
                            command = command_buffer.strip()
                            self.logger.info(f"Command from {client_ip}: {command}")
                            
                            # Process command
                            if self._process_command(client_socket, command, privileged, device_config):
                                if command == 'enable':
                                    privileged = True
                                elif command == 'disable' or command == 'exit':
                                    privileged = False
                            
                            # Show appropriate prompt
                            prompt = device_config['enable_prompt'] if privileged else device_config['prompt']
                            self._send_response(client_socket, prompt + ' ')
                            
                        command_buffer = ""
                        
                    elif data == '\x08' or data == '\x7f':  # Backspace
                        if command_buffer:
                            command_buffer = command_buffer[:-1]
                            self._send_response(client_socket, '\x08 \x08')
                            
                    elif ord(data) >= 32:  # Printable characters
                        command_buffer += data
                        self._send_response(client_socket, data)
                        
                except socket.error:
                    break
                except Exception as e:
                    self.logger.error(f"Error in command loop with {client_ip}: {e}")
                    break
                    
        except Exception as e:
            self.logger.error(f"Connection error with {client_ip}: {e}")
        finally:
            try:
                client_socket.close()
                self.connections.remove(client_socket)
            except:
                pass
                
    def _authenticate_user(self, client_socket, client_ip):
        """Handle user authentication"""
        try:
            self._send_response(client_socket, "Username: ")
            username = self._receive_line(client_socket)
            
            self._send_response(client_socket, "Password: ")
            password = self._receive_line(client_socket, echo=False)
            
            self.logger.info(f"Login attempt from {client_ip}: {username}:{password}")
            
            # Always accept for honeypot (log the attempt)
            self._send_response(client_socket, "\r\n")
            return True
            
        except Exception as e:
            self.logger.error(f"Authentication error with {client_ip}: {e}")
            return False
            
    def _receive_line(self, client_socket, echo=True):
        """Receive a line of input from client"""
        line = ""
        while True:
            try:
                char = client_socket.recv(1).decode('utf-8', errors='ignore')
                if not char:
                    break
                    
                if char == '\r' or char == '\n':
                    break
                elif char == '\x08' or char == '\x7f':  # Backspace
                    if line:
                        line = line[:-1]
                        if echo:
                            self._send_response(client_socket, '\x08 \x08')
                elif ord(char) >= 32:
                    line += char
                    if echo:
                        self._send_response(client_socket, char)
                        
            except socket.error:
                break
                
        return line
        
    def _process_command(self, client_socket, command, privileged, device_config):
        """Process Telnet commands"""
        cmd_parts = command.lower().split()
        if not cmd_parts:
            return False
            
        cmd = cmd_parts[0]
        
        try:
            if cmd == 'help' or cmd == '?':
                self._send_help(client_socket, privileged)
                
            elif cmd == 'show':
                self._handle_show_command(client_socket, cmd_parts[1:] if len(cmd_parts) > 1 else [], device_config)
                
            elif cmd == 'enable':
                if not privileged:
                    self._send_response(client_socket, "Password: ")
                    enable_pass = self._receive_line(client_socket, echo=False)
                    self.logger.info(f"Enable password attempt: {enable_pass}")
                    self._send_response(client_socket, "\r\n")
                    return True
                    
            elif cmd == 'disable' or cmd == 'exit':
                return True
                
            elif cmd == 'configure' or cmd == 'conf':
                if privileged:
                    self._send_response(client_socket, "Configuring from terminal, memory, or network [terminal]? ")
                    self._receive_line(client_socket)
                    self._send_response(client_socket, "\r\nEnter configuration commands, one per line. End with CNTL/Z.\r\n")
                else:
                    self._send_response(client_socket, "% Invalid input detected at '^' marker.\r\n")
                    
            elif cmd == 'ping':
                target = cmd_parts[1] if len(cmd_parts) > 1 else "8.8.8.8"
                self._simulate_ping(client_socket, target)
                
            elif cmd == 'traceroute' or cmd == 'tracert':
                target = cmd_parts[1] if len(cmd_parts) > 1 else "8.8.8.8"
                self._simulate_traceroute(client_socket, target)
                
            else:
                self._send_response(client_socket, f"% Invalid command: {command}\r\n")
                
            return False
            
        except Exception as e:
            self.logger.error(f"Error processing command '{command}': {e}")
            self._send_response(client_socket, "% System error\r\n")
            return False
            
    def _send_help(self, client_socket, privileged):
        """Send help information"""
        if privileged:
            help_text = """Commands available:
  configure   Enter configuration mode
  show        Show running system information
  ping        Send echo messages
  traceroute  Trace route to destination
  enable      Turn on privileged commands
  disable     Turn off privileged commands
  exit        Exit from EXEC mode
"""
        else:
            help_text = """Commands available:
  show        Show running system information
  ping        Send echo messages
  traceroute  Trace route to destination
  enable      Turn on privileged commands
  exit        Exit from EXEC mode
"""
        self._send_response(client_socket, help_text)
        
    def _handle_show_command(self, client_socket, args, device_config):
        """Handle show commands"""
        if not args:
            self._send_response(client_socket, "% Incomplete command.\r\n")
            return
            
        show_cmd = args[0].lower()
        
        if show_cmd == 'version':
            self._send_response(client_socket, device_config['version_info'] + '\r\n')
            
        elif show_cmd == 'interfaces' or show_cmd == 'int':
            self._show_interfaces(client_socket)
            
        elif show_cmd == 'ip':
            if len(args) > 1 and args[1] == 'route':
                self._show_ip_route(client_socket)
            else:
                self._send_response(client_socket, "% Incomplete command.\r\n")
                
        elif show_cmd == 'running-config' or show_cmd == 'run':
            self._show_running_config(client_socket)
            
        else:
            self._send_response(client_socket, f"% Invalid show command: {show_cmd}\r\n")
            
    def _show_interfaces(self, client_socket):
        """Show interface status"""
        output = "Interface                  Status         Protocol\r\n"
        for interface, status in self.interface_config.items():
            status_parts = status.split('/')
            line_status = status_parts[0] if len(status_parts) > 0 else 'down'
            protocol_status = status_parts[1] if len(status_parts) > 1 else 'down'
            output += f"{interface:<25} {line_status:<14} {protocol_status}\r\n"
        self._send_response(client_socket, output)
        
    def _show_ip_route(self, client_socket):
        """Show IP routing table"""
        output = """Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area

Gateway of last resort is 192.168.1.1 to network 0.0.0.0

C    192.168.1.0/24 is directly connected, Vlan1
S*   0.0.0.0/0 [1/0] via 192.168.1.1
"""
        self._send_response(client_socket, output)
        
    def _show_running_config(self, client_socket):
        """Show running configuration"""
        config = f"""Building configuration...

Current configuration : 1234 bytes
!
version 15.0
service timestamps debug datetime msec
service timestamps log datetime msec
service password-encryption
!
hostname {self.hostname}
!
enable secret 5 $1$abcd$xxxxxxxxxxxxxxxxxxxxxx
!
interface Vlan1
 ip address 192.168.1.10 255.255.255.0
!
ip default-gateway 192.168.1.1
!
line con 0
line vty 0 4
 password 7 xxxxxxxxxxxxxxx
 login
!
end
"""
        self._send_response(client_socket, config)
        
    def _simulate_ping(self, client_socket, target):
        """Simulate ping command"""
        output = f"""PING {target}: 56 data bytes
64 bytes from {target}: icmp_seq=0 ttl=64 time=1.234 ms
64 bytes from {target}: icmp_seq=1 ttl=64 time=1.123 ms
64 bytes from {target}: icmp_seq=2 ttl=64 time=1.345 ms
64 bytes from {target}: icmp_seq=3 ttl=64 time=1.234 ms
64 bytes from {target}: icmp_seq=4 ttl=64 time=1.156 ms

--- {target} ping statistics ---
5 packets transmitted, 5 packets received, 0% packet loss
round-trip min/avg/max = 1.123/1.218/1.345 ms
"""
        self._send_response(client_socket, output)
        
    def _simulate_traceroute(self, client_socket, target):
        """Simulate traceroute command"""
        output = f"""traceroute to {target}, 30 hops max, 40 byte packets
 1  192.168.1.1 (192.168.1.1)  1.234 ms  1.123 ms  1.345 ms
 2  10.0.0.1 (10.0.0.1)  5.234 ms  5.123 ms  5.345 ms
 3  {target} ({target})  10.234 ms  10.123 ms  10.345 ms
"""
        self._send_response(client_socket, output)
        
    def _send_response(self, client_socket, response):
        """Send response to client"""
        try:
            client_socket.send(response.encode('utf-8'))
        except:
            pass

def create_telnet_honeypot(config):
    """Factory function to create Telnet honeypot"""
    return TelnetSwitchHoneypot(config)

if __name__ == "__main__":
    # Test configuration
    test_config = {
        'port': 2323,
        'device_type': 'cisco_switch',
        'hostname': 'TestSwitch',
        'enable_password': 'enable123',
        'motd': 'Test Switch - Authorized Access Only',
        'interface_config': 'GigabitEthernet0/1: up/up\nGigabitEthernet0/2: down/down'
    }
    
    honeypot = TelnetSwitchHoneypot(test_config)
    try:
        honeypot.start()
    except KeyboardInterrupt:
        honeypot.stop()
