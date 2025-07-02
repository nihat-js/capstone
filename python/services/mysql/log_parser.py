import os
import json
import re
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from os import path

# MySQL log file paths
log_dir = os.getenv("LOG_DIR", "../../logs")
error_log_file = path.join(log_dir, "mysql", "error.log")
general_log_file = path.join(log_dir, "mysql", "general.log")
slow_query_log_file = path.join(log_dir, "mysql", "slow.log")

def parse_mysql_general_log(file_path):
    """Parse MySQL general query log"""
    logs = []
    
    if not os.path.exists(file_path):
        return logs
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Parse general log format: timestamp thread_id command_type argument
            match = re.match(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(\d+)\s+(\w+)\s+(.*)', line)
            if match:
                timestamp, thread_id, command, argument = match.groups()
                
                logs.append({
                    'timestamp': timestamp,
                    'thread_id': thread_id,
                    'command': command,
                    'query': argument,
                    'type': 'query'
                })
    except Exception as e:
        print(f"Error parsing MySQL general log: {e}")
    
    return logs

def parse_mysql_error_log(file_path):
    """Parse MySQL error log"""
    logs = []
    
    if not os.path.exists(file_path):
        return logs
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Parse error log format
            if '[ERROR]' in line or '[Warning]' in line or '[Note]' in line:
                # Extract timestamp if present
                timestamp_match = re.match(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)', line)
                timestamp = timestamp_match.group(1) if timestamp_match else datetime.now().isoformat()
                
                log_level = 'ERROR' if '[ERROR]' in line else ('WARNING' if '[Warning]' in line else 'INFO')
                
                logs.append({
                    'timestamp': timestamp,
                    'level': log_level,
                    'message': line,
                    'type': 'error'
                })
    except Exception as e:
        print(f"Error parsing MySQL error log: {e}")
    
    return logs

def analyze_sql_injection_attempts(logs):
    """Analyze logs for SQL injection attempts"""
    injection_patterns = [
        r"'.*OR.*'.*=.*'",  # Basic OR injection
        r"UNION.*SELECT",    # UNION-based injection
        r"DROP\s+TABLE",     # Table dropping
        r"INSERT.*INTO",     # Unauthorized inserts
        r"UPDATE.*SET",      # Unauthorized updates
        r"DELETE.*FROM",     # Unauthorized deletes
        r"--",               # SQL comments
        r"/\*.*\*/",        # SQL comments
        r"'.*OR.*1=1",      # Classic injection
        r"'.*OR.*'1'='1",   # Classic injection variant
        r"EXEC\s*\(",       # Stored procedure execution
        r"xp_cmdshell",     # Command execution
    ]
    
    injection_attempts = []
    
    for log in logs:
        if log.get('type') == 'query':
            query = log.get('query', '').upper()
            
            for pattern in injection_patterns:
                if re.search(pattern, query, re.IGNORECASE):
                    injection_attempts.append({
                        **log,
                        'threat_type': 'sql_injection',
                        'pattern_matched': pattern,
                        'severity': 'high'
                    })
                    break
    
    return injection_attempts

def generate_dashboard_stats(logs):
    """Generate dashboard-ready statistics"""
    stats = {
        'total_connections': 0,
        'total_queries': 0,
        'failed_logins': 0,
        'sql_injection_attempts': 0,
        'suspicious_activities': 0,
        'top_attacking_ips': [],
        'attack_timeline': [],
        'threat_summary': {
            'high': 0,
            'medium': 0,
            'low': 0
        },
        'recent_attacks': []
    }
    
    # Analyze logs
    injection_attempts = analyze_sql_injection_attempts(logs)
    stats['sql_injection_attempts'] = len(injection_attempts)
    
    # Count queries and connections
    ip_counter = Counter()
    hourly_attacks = defaultdict(int)
    
    for log in logs:
        if log.get('type') == 'query':
            stats['total_queries'] += 1
            
            # Extract IP if available (you might need to enhance this based on your log format)
            query = log.get('query', '')
            if 'Connect' in query:
                stats['total_connections'] += 1
            
            # Count failed logins
            if 'Access denied' in query or 'authentication failed' in query:
                stats['failed_logins'] += 1
                
        elif log.get('type') == 'error':
            if 'Access denied' in log.get('message', ''):
                stats['failed_logins'] += 1
    
    # Add injection attempts to threat summary
    stats['threat_summary']['high'] = len(injection_attempts)
    stats['suspicious_activities'] = len(injection_attempts) + stats['failed_logins']
    
    # Recent attacks (last 10)
    all_threats = injection_attempts[-10:]
    stats['recent_attacks'] = [{
        'timestamp': threat.get('timestamp'),
        'type': 'SQL Injection Attempt',
        'details': threat.get('query', '')[:100] + '...' if len(threat.get('query', '')) > 100 else threat.get('query', ''),
        'severity': threat.get('severity', 'medium')
    } for threat in all_threats]
    
    return stats

def parse_logs():
    """Main function to parse all MySQL logs and return dashboard data"""
    try:
        # Parse different log types
        general_logs = parse_mysql_general_log(general_log_file)
        error_logs = parse_mysql_error_log(error_log_file)
        
        # Combine all logs
        all_logs = general_logs + error_logs
        
        # Sort by timestamp
        all_logs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        # Generate dashboard statistics
        stats = generate_dashboard_stats(all_logs)
        
        return {
            'stats': stats,
            'logs': all_logs[:100],  # Return last 100 logs
            'total_logs': len(all_logs),
            'service': 'mysql',
            'last_updated': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error in MySQL log parser: {e}")
        return {
            'stats': {
                'total_connections': 0,
                'total_queries': 0,
                'failed_logins': 0,
                'sql_injection_attempts': 0,
                'suspicious_activities': 0,
                'top_attacking_ips': [],
                'attack_timeline': [],
                'threat_summary': {'high': 0, 'medium': 0, 'low': 0},
                'recent_attacks': []
            },
            'logs': [],
            'total_logs': 0,
            'service': 'mysql',
            'error': str(e),
            'last_updated': datetime.now().isoformat()
        }

if __name__ == "__main__":
    result = parse_logs()
    print(json.dumps(result, indent=2))
