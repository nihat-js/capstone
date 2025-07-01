import os
import re
from datetime import datetime
from collections import defaultdict

class SSHLogExtractor:
    def __init__(self, log_dir):
        self.log_dir = log_dir
        self.auth_log = os.path.join(log_dir, 'auth.log')
        self.commands_log = os.path.join(log_dir, 'commands.log')
        self.messages_log = os.path.join(log_dir, 'messages')
    
    def extract_logs(self, log_type='all', limit=100):
        """Extract SSH logs with intelligent parsing"""
        logs = []
        
        if log_type in ['all', 'auth']:
            logs.extend(self._parse_auth_logs(limit))
        
        if log_type in ['all', 'commands']:
            logs.extend(self._parse_command_logs(limit))
        
        if log_type in ['all', 'messages']:
            logs.extend(self._parse_message_logs(limit))
        
        # Sort by timestamp
        logs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        return logs[:limit]
    
    def _parse_auth_logs(self, limit):
        """Parse authentication logs"""
        logs = []
        if not os.path.exists(self.auth_log):
            return logs
        
        try:
            with open(self.auth_log, 'r') as f:
                lines = f.readlines()
                for line in reversed(lines[-limit:]):
                    if line.strip():
                        parsed = self._parse_auth_line(line.strip())
                        if parsed:
                            logs.append(parsed)
        except FileNotFoundError:
            pass
        return logs
    
    def _parse_command_logs(self, limit):
        """Parse command execution logs"""
        logs = []
        if not os.path.exists(self.commands_log):
            return logs
        
        try:
            with open(self.commands_log, 'r') as f:
                lines = f.readlines()
                for line in reversed(lines[-limit:]):
                    if line.strip():
                        parsed = self._parse_command_line(line.strip())
                        if parsed:
                            logs.append(parsed)
        except FileNotFoundError:
            pass
        return logs
    
    def _parse_message_logs(self, limit):
        """Parse system message logs"""
        logs = []
        if not os.path.exists(self.messages_log):
            return logs
        
        try:
            with open(self.messages_log, 'r') as f:
                lines = f.readlines()
                for line in reversed(lines[-limit:]):
                    if line.strip():
                        parsed = self._parse_message_line(line.strip())
                        if parsed:
                            logs.append(parsed)
        except FileNotFoundError:
            pass
        return logs
    
    def _parse_auth_line(self, line):
        """Parse authentication log line"""
        # Common SSH auth patterns
        patterns = [
            (r'(\w+\s+\d+\s+\d+:\d+:\d+).*Failed password for (\w+) from ([\d\.]+) port (\d+)', 
             'FAILED_LOGIN', 'HIGH'),
            (r'(\w+\s+\d+\s+\d+:\d+:\d+).*Accepted password for (\w+) from ([\d\.]+) port (\d+)', 
             'SUCCESSFUL_LOGIN', 'MEDIUM'),
            (r'(\w+\s+\d+\s+\d+:\d+:\d+).*Invalid user (\w+) from ([\d\.]+)', 
             'INVALID_USER', 'HIGH'),
            (r'(\w+\s+\d+\s+\d+:\d+:\d+).*Connection closed by ([\d\.]+)', 
             'CONNECTION_CLOSED', 'LOW')
        ]
        
        for pattern, event_type, threat_level in patterns:
            match = re.search(pattern, line)
            if match:
                groups = match.groups()
                return {
                    'timestamp': self._parse_syslog_timestamp(groups[0]),
                    'level': 'AUTH',
                    'type': event_type,
                    'ip': groups[2] if len(groups) > 2 else groups[1],
                    'user': groups[1] if len(groups) > 2 else 'unknown',
                    'details': {'raw_line': line},
                    'threat_level': threat_level
                }
        
        return {
            'timestamp': datetime.now().isoformat(),
            'level': 'AUTH',
            'type': 'OTHER',
            'details': {'raw_line': line},
            'threat_level': 'LOW'
        }
    
    def _parse_command_line(self, line):
        """Parse command execution log line"""
        # Pattern: USER=username PWD=/path CMD=command
        pattern = r'USER=(\w+)\s+PWD=([^\s]+)\s+CMD=(.+)'
        match = re.search(pattern, line)
        
        if match:
            user, pwd, cmd = match.groups()
            threat_level = self._assess_command_threat(cmd)
            
            return {
                'timestamp': datetime.now().isoformat(),
                'level': 'COMMAND',
                'type': 'COMMAND_EXECUTED',
                'user': user,
                'directory': pwd,
                'command': cmd,
                'details': {'raw_line': line},
                'threat_level': threat_level
            }
        
        return None
    
    def _parse_message_line(self, line):
        """Parse system message log line"""
        # Basic system message parsing
        return {
            'timestamp': datetime.now().isoformat(),
            'level': 'SYSTEM',
            'type': 'SYSTEM_MESSAGE',
            'details': {'raw_line': line},
            'threat_level': 'LOW'
        }
    
    def _parse_syslog_timestamp(self, timestamp_str):
        """Convert syslog timestamp to ISO format"""
        try:
            # Assume current year for syslog format
            current_year = datetime.now().year
            dt = datetime.strptime(f"{current_year} {timestamp_str}", "%Y %b %d %H:%M:%S")
            return dt.isoformat()
        except:
            return datetime.now().isoformat()
    
    def _assess_command_threat(self, command):
        """Assess threat level of executed command"""
        high_risk_commands = ['rm -rf', 'wget', 'curl', 'nc ', 'netcat', 'passwd', 'su ', 'sudo']
        medium_risk_commands = ['cat /etc', 'ls -la', 'ps aux', 'netstat', 'ss -']
        
        cmd_lower = command.lower()
        
        for risky_cmd in high_risk_commands:
            if risky_cmd in cmd_lower:
                return 'HIGH'
        
        for medium_cmd in medium_risk_commands:
            if medium_cmd in cmd_lower:
                return 'MEDIUM'
        
        return 'LOW'
    
    def get_statistics(self):
        """Get SSH access statistics"""
        logs = self.extract_logs('all', 1000)
        
        stats = {
            'total_events': len(logs),
            'failed_logins': len([l for l in logs if l.get('type') == 'FAILED_LOGIN']),
            'successful_logins': len([l for l in logs if l.get('type') == 'SUCCESSFUL_LOGIN']),
            'commands_executed': len([l for l in logs if l.get('type') == 'COMMAND_EXECUTED']),
            'unique_ips': len(set(l.get('ip', 'unknown') for l in logs if l.get('ip'))),
            'top_ips': defaultdict(int),
            'top_users': defaultdict(int),
            'threat_levels': defaultdict(int)
        }
        
        for log in logs:
            if log.get('ip'):
                stats['top_ips'][log['ip']] += 1
            if log.get('user'):
                stats['top_users'][log['user']] += 1
            stats['threat_levels'][log.get('threat_level', 'LOW')] += 1
        
        # Convert to sorted lists
        stats['top_ips'] = dict(sorted(stats['top_ips'].items(), key=lambda x: x[1], reverse=True)[:10])
        stats['top_users'] = dict(sorted(stats['top_users'].items(), key=lambda x: x[1], reverse=True)[:10])
        
        return stats

def extract_ssh_logs(log_dir, log_type='all', limit=100):
    """Main function to extract SSH logs"""
    extractor = SSHLogExtractor(log_dir)
    return {
        'logs': extractor.extract_logs(log_type, limit),
        'statistics': extractor.get_statistics()
    }
