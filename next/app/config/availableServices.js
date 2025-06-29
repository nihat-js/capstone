import { Database, Globe, Lock, Terminal, Server } from "lucide-react";

// Available services that match your Flask API
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
    id: 'mysql',
    name: 'MySQL Database',
    type: 'mysql',
    description: 'Database honeypot for SQL injection and data theft detection',
    icon: Database,
    security: 'Database Auth',
    monitoring: 'Query Logging',
    attackTypes: 'SQL Injection, Data Exfiltration'
  },
  {
    id: 'postgres',
    name: 'PostgreSQL Database',
    type: 'postgres',
    description: 'PostgreSQL honeypot for database attack detection',
    icon: Database,
    security: 'Database Auth',
    monitoring: 'Query Logging',
    attackTypes: 'SQL Injection, Data Exfiltration'
  },
  {
    id: 'redis',
    name: 'Redis Server',
    type: 'redis',
    description: 'In-memory database honeypot for cache attacks',
    icon: Server,
    security: 'AUTH Command',
    monitoring: 'Command Logging',
    attackTypes: 'Data Access, Command Injection'
  },
  {
    id: 'phpmyadmin',
    name: 'phpMyAdmin',
    type: 'phpmyadmin',
    description: 'Web-based MySQL administration honeypot',
    icon: Globe,
    security: 'Web Authentication',
    monitoring: 'Web Request Logging',
    attackTypes: 'Web Attacks, Database Access'
  }
]