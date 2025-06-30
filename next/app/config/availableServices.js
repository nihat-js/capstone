import { Database, Globe, Lock, Terminal, Server, FileText, HardDrive, Layers } from "lucide-react";

// Grouped honeypot services by category
export const serviceCategories = {
  database: {
    name: 'Database Services',
    description: 'Database honeypots for SQL injection and data theft detection',
    icon: Database,
    color: '#10b981', // green
    services: [
      {
        id: 'mysql',
        name: 'MySQL',
        type: 'mysql',
        description: 'MySQL database honeypot for SQL injection detection',
        icon: Database,
        security: 'Database Auth',
        monitoring: 'Query Logging',
        attackTypes: 'SQL Injection, Data Exfiltration'
      },
      {
        id: 'postgres',
        name: 'PostgreSQL',
        type: 'postgres',
        description: 'PostgreSQL honeypot for advanced database attacks',
        icon: Database,
        security: 'Database Auth',
        monitoring: 'Query Logging',
        attackTypes: 'SQL Injection, Data Exfiltration'
      },
      {
        id: 'redis',
        name: 'Redis',
        type: 'redis',
        description: 'In-memory database honeypot for cache attacks',
        icon: HardDrive,
        security: 'AUTH Command',
        monitoring: 'Command Logging',
        attackTypes: 'Data Access, Command Injection'
      }
    ]
  },
  web: {
    name: 'Web Services',
    description: 'Web-based honeypots for HTTP attacks and web vulnerabilities',
    icon: Globe,
    color: '#3b82f6', // blue
    services: [
      {
        id: 'phpmyadmin',
        name: 'phpMyAdmin',
        type: 'phpmyadmin',
        description: 'Web-based MySQL administration honeypot',
        icon: Globe,
        security: 'Web Authentication',
        monitoring: 'Web Request Logging',
        attackTypes: 'Web Attacks, Database Access'
      },
      {
        id: 'api',
        name: 'API Server',
        type: 'api',
        description: 'RESTful API honeypot for web service attacks',
        icon: Globe,
        security: 'API Key Auth',
        monitoring: 'Request Logging',
        attackTypes: 'API Abuse, Data Harvesting'
      }
    ]
  },
  network: {
    name: 'Network Services',
    description: 'Network protocol honeypots for remote access attacks',
    icon: Terminal,
    color: '#8b5cf6', // purple
    services: [
      {
        id: 'ssh',
        name: 'SSH Server',
        type: 'ssh',
        description: 'Secure Shell honeypot for login attempts and commands',
        icon: Terminal,
        security: 'Password & Key Auth',
        monitoring: 'Command Logging',
        attackTypes: 'Brute Force, Credential Harvesting'
      },
      {
        id: 'ftp',
        name: 'FTP Server',
        type: 'ftp',
        description: 'File Transfer Protocol honeypot for file operations',
        icon: FileText,
        security: 'User Authentication',
        monitoring: 'File Operations',
        attackTypes: 'File Upload, Directory Listing'
      }
    ]
  }
};

// Flatten services for backward compatibility
export const availableServices = Object.values(serviceCategories)
  .flatMap(category => category.services);