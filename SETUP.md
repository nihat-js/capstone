# Honeypot Dashboard Configuration

## Changes Made

### 1. Simplified Available Services
Updated to match your Flask API endpoints:
- SSH Server (ssh)
- MySQL Database (mysql)  
- PostgreSQL Database (postgres)
- Redis Server (redis)
- phpMyAdmin (phpmyadmin)

### 2. Real API Integration
- Created `services/api.js` for Flask backend communication
- Dashboard now fetches real data from `http://localhost:5000/services`
- Auto-refreshes every 30 seconds
- Shows real service counts and status

### 3. Simplified Modals with SSH User Support
- **CreateHoneypotModal**: Service type + port selection + SSH user configuration
- **ConfigurationModal**: Port configuration + SSH user management
- SSH services now include user management with username, password, and sudo privileges
- Default SSH user: admin/admin123 with sudo privileges

### 4. Real Service Management
- Start services via API calls to `/services/start`
- Stop services via API calls to `/services/stop` 
- Real-time status updates

## Setup Instructions

### 1. Start Your Flask API
```bash
cd python2
python app.py
```
Your API should be running on `http://localhost:5000`

### 2. Start the Next.js Dashboard
```bash
cd next
npm install
npm run dev
```
Dashboard will be available on `http://localhost:3000`

### 3. Usage
1. The dashboard will show any currently running services from your API
2. Use "Create Honeypot" to configure and start new services
3. For SSH services, configure users with username, password, and sudo privileges
4. Click on service cards to configure and deploy them
5. Stop services using the stop button on each honeypot card

## SSH Service Configuration
The SSH service requires user configuration:
- **Username**: Login username for SSH access
- **Password**: Password for the user
- **Sudo privileges**: Whether the user can run sudo commands
- You can add multiple users to a single SSH honeypot

## API Endpoints Used
- `GET /services` - List running services
- `POST /services/start` - Start a new service
- `POST /services/stop` - Stop a running service

## Notes
- Complex configuration components are commented out/removed
- Focus is on basic functionality that works with your current API
- All fake data generators are commented out in favor of real data
- Error handling included for when API is not available
- Fixed subprocess issues in all service files (MySQL, PostgreSQL, Redis, phpMyAdmin, FTP)
- Dashboard auto-refreshes every 4 seconds for real-time monitoring
- Improved loading states with skeleton animations instead of full-screen loading
- Enhanced error handling for port conflicts with user-friendly messages
