# HoneyShield - Advanced Honeypot Management System

A comprehensive honeypot management and monitoring platform with SSH honeypot support featuring CTF-style configurations and advanced logging capabilities.

## 🚀 Features

### 🔐 SSH Honeypot
- **CTF-Style Configurations**: Pre-built templates for realistic attack scenarios
- **Weak Security Simulation**: Intentionally vulnerable configurations to attract attackers
- **Fake File Systems**: Realistic directory structures with sensitive-looking files
- **Custom User Accounts**: Multiple fake users with weak passwords
- **Command Logging**: Detailed logging of all SSH commands and activities
- **Docker Isolation**: Each honeypot runs in isolated Docker containers

### 📊 Management Dashboard
- **Service Overview**: Visual display of 6 available honeypot services
- **Real-time Monitoring**: Live status updates and statistics
- **Quick Start Templates**: Pre-configured setups for different scenarios
- **Responsive Design**: Works on desktop and mobile devices
- **Demo Mode**: Test interface with fake data

### 🛠️ Configuration Options
- **Corporate Server**: Simulates enterprise SSH servers
- **Legacy System**: Old systems with weak authentication
- **Development Server**: Dev environments with default credentials
- **Custom Configuration**: Build your own honeypot setup

## 📋 Prerequisites

- **Docker Desktop** - Required for honeypot containers
- **Node.js** (v18+) - For the Next.js frontend  
- **Python** (v3.8+) - For the Flask API backend
- **Git** - For cloning the repository

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd capstone
```

### 2. Install Dependencies

#### Frontend (Next.js)
```bash
cd next
npm install
```

#### Backend (Python Flask)
```bash
cd python
pip install -r requirements.txt
```

### 3. Start the System

#### Option A: Windows Batch Scripts
1. **Start Flask API:**
   ```bash
   start_api.bat
   ```

2. **Start Next.js Frontend:**
   ```bash
   start.bat
   ```

#### Option B: Manual Start
1. **Start Flask API:**
   ```bash
   cd python
   python flask.py
   ```

2. **Start Next.js Frontend:**
   ```bash
   cd next
   npm run dev
   ```

### 4. Access the Application
- **Dashboard:** http://localhost:3000
- **API:** http://localhost:5000

## 🔧 SSH Honeypot Setup

### Quick Templates
1. **Corporate Server** - Enterprise-style SSH server with typical vulnerabilities
2. **Legacy System** - Outdated system with weak passwords (admin/admin, root/root)
3. **Development Server** - Dev environment with default credentials

### Custom Configuration
1. Navigate to SSH Configuration from dashboard
2. Choose a template or start from scratch
3. Configure:
   - Honeypot name and port
   - Fake user accounts
   - File system contents
   - Security settings
4. Save configuration
5. Start honeypot when prompted

### CTF-Style Files Included
- `/etc/passwd` - System user information
- `/home/admin/documents/company_secrets.txt` - Fake sensitive data
- `/var/log/system.log` - System activity logs
- `/home/admin/.bash_history` - Command history with suspicious activities
- `/opt/backup/database_dump.sql` - Fake database dump
- `/root/.ssh/id_rsa` - Fake private SSH key

## 🔍 Monitoring & Logs

### Real-time Monitoring
- Connection attempts
- Successful logins
- Command execution
- File access attempts

### Log Files
- Location: `python/services/log/`
- Format: Timestamped entries with full context
- Includes: Configuration, container logs, activity timeline

## 🧪 Testing

### API Testing
Run the included test script:
```bash
python test_api.py
```

### Manual Testing
1. Start SSH honeypot on port 2222
2. Test connection: `ssh admin@localhost -p 2222`
3. Try weak passwords: admin123, password, 123456
4. Monitor logs for captured activities

## 🛡️ Security Considerations

⚠️ **IMPORTANT WARNINGS:**
- This is a HONEYPOT system designed to attract attackers
- **NEVER** run on production networks without proper isolation
- Use dedicated VMs or isolated network segments
- Monitor logs regularly for security insights
- Keep all dependencies updated
- Follow responsible disclosure for any findings

## 📁 Project Structure

```
capstone/
├── next/                    # Next.js frontend
│   ├── app/
│   │   ├── components/     # React components
│   │   ├── config/         # Configuration pages
│   │   │   └── ssh/       # SSH config page
│   │   └── page.jsx       # Main dashboard
├── python/                 # Flask backend
│   ├── services/          # Honeypot services
│   │   ├── ssh.py        # SSH honeypot implementation
│   │   └── log/          # Log files directory
│   ├── flask.py          # Main Flask application
│   └── requirements.txt  # Python dependencies
├── start.bat             # Start Next.js frontend
├── start_api.bat         # Start Flask API
├── test_api.py          # API testing script
└── README.md            # This file
```

## 🔌 API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/honeypots` - List all honeypots
- `POST /api/ssh/configure` - Save SSH configuration
- `POST /api/ssh/start` - Start SSH honeypot
- `POST /api/ssh/stop` - Stop SSH honeypot
- `GET /api/ssh/status/<id>` - Get honeypot status
- `GET /api/ssh/logs/<id>` - Get honeypot logs

### Request Examples

#### Configure SSH Honeypot
```json
POST /api/ssh/configure
{
  "config": {
    "name": "Corporate SSH Server",
    "port": 2222,
    "banner": "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1",
    "enablePasswordAuth": true,
    "fakeUsers": [
      {"username": "admin", "password": "admin123", "shell": "/bin/bash"}
    ]
  }
}
```

#### Start Honeypot
```json
POST /api/ssh/start
{
  "config_id": "ssh_corporate_ssh_server_1234567890"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"Docker not running" error:**
   - Start Docker Desktop
   - Verify with: `docker version`

2. **"Port already in use" error:**
   - Change SSH port in configuration
   - Check for existing containers: `docker ps`

3. **"Failed to connect to API" error:**
   - Ensure Flask API is running on port 5000
   - Check firewall settings
   - Verify Python dependencies are installed

4. **Container build failures:**
   - Ensure Docker daemon is accessible
   - Check available disk space
   - Review Docker build logs

### Docker Commands
```bash
# List running containers
docker ps

# View container logs
docker logs ssh_honeypot_<name>

# Stop all honeypot containers
docker stop $(docker ps -q --filter "name=ssh_honeypot")

# Remove all honeypot containers
docker rm $(docker ps -aq --filter "name=ssh_honeypot")
```

## 🎯 Attack Scenarios

### Brute Force Testing
```bash
# Test weak passwords
ssh admin@localhost -p 2222
# Try: admin123, password, 123456

# Automated brute force (for testing)
hydra -l admin -P passwords.txt localhost -s 2222 ssh
```

### File Discovery
```bash
# After successful login, explore:
ls -la /home/admin/documents/
cat /etc/passwd
find / -name "*.txt" 2>/dev/null
history
```

## 📚 Educational Use

This honeypot system is designed for:
- Cybersecurity education and training
- Red team exercises
- Blue team detection development
- CTF competitions
- Security research (in controlled environments)

## 📄 License

This project is for educational and research purposes only. Use responsibly and in accordance with local laws and regulations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check Docker container logs
4. Test with the included test script
