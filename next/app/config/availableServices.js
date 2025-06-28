import { Database, Globe, Lock, Monitor, Terminal, Wifi } from "lucide-react";

export const availableServices = [
  {
    id: 'ssh',
    name: 'SSH Server',
    type: 'ssh',
    description: 'Secure Shell honeypot for capturing login attempts and commands',
    icon: Terminal,
    security: 'Password & Key Auth',
    monitoring: 'Command Logging',
    attackTypes: 'Brute Force, Credential Harvesting'
  },
  {
    id: 'http',
    name: 'HTTP Server',
    type: 'http',
    description: 'Web server honeypot for detecting web-based attacks',
    icon: Globe,
    security: 'Form Authentication',
    monitoring: 'Request Logging',
    attackTypes: 'SQL Injection, XSS, Directory Traversal'
  },
  {
    id: 'ftp',
    name: 'FTP Server',
    type: 'ftp',
    description: 'File Transfer Protocol honeypot for file access monitoring',
    icon: Database,
    security: 'Anonymous & Auth',
    monitoring: 'File Operations',
    attackTypes: 'File Upload, Directory Listing'
  },
  {
    id: 'telnet',
    name: 'Telnet Server',
    type: 'telnet',
    description: 'Legacy terminal access honeypot',
    icon: Monitor,
    security: 'Basic Authentication',
    monitoring: 'Session Recording',
    attackTypes: 'Legacy System Exploitation'
  },
  {
    id: 'rdp',
    name: 'RDP Server',
    type: 'rdp',
    description: 'Remote Desktop Protocol honeypot for Windows attacks',
    icon: Wifi,
    security: 'Windows Auth',
    monitoring: 'Desktop Sessions',
    attackTypes: 'Remote Access, Credential Theft'
  },
  {
    id: 'mysql',
    name: 'MySQL Database',
    type: 'mysql',
    description: 'Database honeypot for SQL injection and data theft detection',
    icon: Lock,
    security: 'Database Auth',
    monitoring: 'Query Logging',
    attackTypes: 'SQL Injection, Data Exfiltration'
  }
]