# 🍯 Honeypot Management Platform

A comprehensive, modular honeypot management system built with Next.js frontend and Python Flask backend. Deploy, monitor, and manage various types of security honeypots from a single dashboard.

## 🏗️ Project Structure

The project is organized into four main parts:

```
honeypot-1/
├── 🎨 frontend/          # Next.js frontend (all UI components)
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   └── package.json      # Frontend dependencies
├── 🔧 backend/           # Python Flask backend (all API logic)
│   ├── app.py           # Main Flask application
│   └── requirements.txt # Backend dependencies
├── 📁 logs/             # All honeypot logs storage
└── 📜 scripts/          # Honeypot scripts and simulation data
    ├── documents/       # Fake documents for bait
    ├── sql/            # Fake SQL databases and injection patterns
    └── templates/      # Honeypot configuration templates
```

## 🚀 Features

### 🎯 Supported Honeypot Types

- **🔐 Cowrie SSH/Telnet Honeypot** - Medium-interaction SSH and Telnet honeypot
- **📁 FTP Honeypot** - Pure-FTPd honeypot with file operation logging
- **🌐 Telnet Switch Honeypot** - Simulates Cisco/Juniper network devices
- **🗄️ MySQL Database Honeypot** - Catches database attacks and SQL injection
- **💻 phpMyAdmin Honeypot** - Web-based database administration interface
- **🖥️ RDP Honeypot** - Remote Desktop Protocol honeypot
- **📧 SMTP Honeypot** - Email server honeypot for spam and phishing detection

### 📊 Dashboard Features

- **Real-time Monitoring** - Live status updates and activity tracking
- **Advanced Configuration** - Granular settings for each honeypot type
- **Log Management** - View, search, download, and clear logs
- **Threat Analytics** - Attack pattern analysis and reporting
- **Multi-category Support** - Organized by service type
- **Responsive Design** - Modern, mobile-friendly interface

## 🛠️ Installation & Setup

### 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd honeypot-1
   ```

2. **Run the startup script:**
   
   **Windows:**
   ```cmd
   start.bat
   ```
   
   **Linux/macOS:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

3. **Access the application:**
   - 📊 **Frontend Dashboard:** http://localhost:3000
   - 🔧 **Backend API:** http://localhost:5000

## 🎭 Simulation Data

The platform includes realistic bait data:

### 💼 Fake Banking Database (`scripts/sql/`)
- Customer accounts with realistic data
- Transaction histories
- Credit card information
- Login attempts and security logs
- Common SQL injection patterns

### 📄 Fake Documents (`scripts/documents/`)
- Security reports with credentials
- Employee access lists
- Customer database extracts
- Network configuration files

### 🎨 Templates (`scripts/templates/`)
- SSH/Telnet banners
- FTP welcome messages
- Network device prompts
- Custom honeypot configurations

## 🧩 Architecture

### Frontend (Next.js)
- React Components with TypeScript
- Tailwind CSS for styling
- Real-time dashboard updates
- Responsive design

### Backend (Flask)
- RESTful API design
- Process management for honeypots
- File handling and log management
- CORS support for frontend integration

### Data Flow
```
Frontend (Next.js) ↔ Backend (Flask) ↔ Honeypot Scripts ↔ Logs
```

## 🛡️ Security Considerations

- Honeypots contain **fake sensitive data** for simulation purposes only
- Do not use real credentials or sensitive information
- Ensure proper network isolation in production environments
- Regularly review and analyze collected data

---

**Built with ❤️ for cybersecurity professionals and researchers**
