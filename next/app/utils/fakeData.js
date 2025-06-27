// Fake data generator for honeypot dashboard
export const generateFakeHoneypots = () => {
  const honeypotTypes = ['ssh', 'telnet', 'rdp', 'http', 'ftp', 'mysql', 'mongodb', 'wordpress', 'phpmyadmin']
  const statuses = ['running', 'stopped', 'error', 'starting']
  const locations = ['US-East', 'EU-West', 'Asia-Pacific', 'Canada', 'Australia', 'Germany', 'Japan']
  
  const fakeHoneypots = []
  
  for (let i = 1; i <= 15; i++) {
    const type = honeypotTypes[Math.floor(Math.random() * honeypotTypes.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    
    fakeHoneypots.push({
      id: `hp-${i.toString().padStart(3, '0')}`,
      name: `${type.toUpperCase()} Honeypot ${i}`,
      type: type,
      status: status,
      port: Math.floor(Math.random() * 60000) + 1024,
      location: location,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_activity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      connections_today: Math.floor(Math.random() * 500),
      total_connections: Math.floor(Math.random() * 10000),
      attacks_blocked: Math.floor(Math.random() * 1000),
      data_collected: Math.floor(Math.random() * 1000) + 'MB',
      threat_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      uptime: Math.floor(Math.random() * 720) + 1, // hours
    })
  }
  
  return fakeHoneypots
}

export const generateFakeStats = (honeypots) => {
  const running = honeypots.filter(h => h.status === 'running').length
  const stopped = honeypots.filter(h => h.status === 'stopped').length
  const errors = honeypots.filter(h => h.status === 'error').length
  
  return {
    total: honeypots.length,
    running: running,
    stopped: stopped,
    errors: errors,
    totalConnections: honeypots.reduce((sum, h) => sum + h.total_connections, 0),
    connectionsToday: honeypots.reduce((sum, h) => sum + h.connections_today, 0),
    attacksBlocked: honeypots.reduce((sum, h) => sum + h.attacks_blocked, 0),
    dataCollected: honeypots.reduce((sum, h) => sum + parseInt(h.data_collected), 0) + 'MB',
    avgUptime: Math.floor(honeypots.reduce((sum, h) => sum + h.uptime, 0) / honeypots.length),
    topAttackTypes: [
      { type: 'Brute Force', count: 1247, percentage: 45 },
      { type: 'SQL Injection', count: 892, percentage: 32 },
      { type: 'Directory Traversal', count: 456, percentage: 16 },
      { type: 'XSS Attempts', count: 189, percentage: 7 }
    ],
    recentAttacks: [
      { time: '2 minutes ago', type: 'SSH Brute Force', source: '192.168.1.100', target: 'SSH Honeypot 3' },
      { time: '5 minutes ago', type: 'SQL Injection', source: '10.0.0.50', target: 'MySQL Honeypot 1' },
      { time: '12 minutes ago', type: 'Directory Traversal', source: '172.16.0.25', target: 'HTTP Honeypot 5' },
      { time: '18 minutes ago', type: 'Port Scan', source: '203.0.113.15', target: 'Multiple Services' },
      { time: '25 minutes ago', type: 'RDP Connection', source: '198.51.100.42', target: 'RDP Honeypot 2' }
    ],
    geographicData: [
      { country: 'United States', attacks: 1842, percentage: 38 },
      { country: 'China', attacks: 1156, percentage: 24 },
      { country: 'Russia', attacks: 892, percentage: 18 },
      { country: 'Germany', attacks: 534, percentage: 11 },
      { country: 'Brazil', attacks: 289, percentage: 6 },
      { country: 'Others', attacks: 156, percentage: 3 }
    ]
  }
}

export const generateFakeHoneypotTypes = () => {
  return {
    ssh: {
      name: 'SSH Server',
      description: 'Secure Shell honeypot for detecting unauthorized access attempts',
      icon: 'terminal',
      color: '#059669'
    },
    telnet: {
      name: 'Telnet Server', 
      description: 'Network switch/router telnet interface simulation',
      icon: 'terminal',
      color: '#dc2626'
    },
    rdp: {
      name: 'RDP Server',
      description: 'Remote Desktop Protocol honeypot for Windows systems',
      icon: 'monitor',
      color: '#2563eb'
    },
    http: {
      name: 'HTTP Server',
      description: 'Web server honeypot with customizable content',
      icon: 'globe',
      color: '#7c3aed'
    },
    ftp: {
      name: 'FTP Server',
      description: 'File transfer protocol honeypot',
      icon: 'folder',
      color: '#ea580c'
    },
    mysql: {
      name: 'MySQL Server',
      description: 'Database honeypot with fake financial data',
      icon: 'database',
      color: '#0891b2'
    },
    mongodb: {
      name: 'MongoDB',
      description: 'NoSQL database honeypot',
      icon: 'database',
      color: '#059669'
    },
    wordpress: {
      name: 'WordPress',
      description: 'Content management system honeypot',
      icon: 'globe',
      color: '#2563eb'
    },
    phpmyadmin: {
      name: 'phpMyAdmin',
      description: 'Database administration interface honeypot',
      icon: 'database',
      color: '#dc2626'
    }
  }
}
