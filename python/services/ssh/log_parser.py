import re
import os
import requests
import time
import json
from collections import defaultdict, Counter
from datetime import datetime, timedelta

# Use the same log directory structure as the SSH service
log_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../logs/ssh"))
AUTH_LOG_FILE = os.path.join(log_dir, "auth.log")
COMMANDS_LOG_FILE = os.path.join(log_dir, "commands.log")

# Threat level configurations
SUSPICIOUS_COMMANDS = {
    'HIGH': ['sudo', 'su', 'passwd', 'useradd', 'userdel', 'chmod 777', 'rm -rf', 'wget', 'curl', 'nc', 'netcat', 'ps aux'],
    'MEDIUM': ['ls', 'cat', 'whoami', 'id', 'uname', 'pwd', 'history', 'find'],
    'LOW': ['echo', 'date', 'uptime', 'df', 'free']
}

THREAT_INDICATORS = {
    'multiple_failed_attempts': 5,  # 5+ failed attempts = high threat
    'rapid_connections': 10,        # 10+ connections in short time
    'privileged_escalation': ['sudo', 'su'],
    'reconnaissance_commands': ['ps aux', 'netstat', 'ifconfig', 'whoami', 'id', 'uname'],
    'file_manipulation': ['rm', 'chmod', 'chown', 'mv', 'cp'],
    'network_commands': ['wget', 'curl', 'nc', 'netcat', 'ssh', 'scp']
}

def get_ip_location(ip):
    try:
        resp = requests.get(f"http://ip-api.com/json/{ip}?fields=status,country,regionName,city,isp,query")
        data = resp.json()
        if data.get('status') == 'success':
            return {
                'country': data.get('country'),
                'region': data.get('regionName'),
                'city': data.get('city'),
                'isp': data.get('isp'),
            }
    except Exception as e:
        print(f"Error fetching location for IP {ip}: {e}")
    return None

def get_command_threat_level(command):
    """Determine threat level of a command."""
    command_lower = command.lower().strip()
    
    for level, commands in SUSPICIOUS_COMMANDS.items():
        for suspicious_cmd in commands:
            if suspicious_cmd in command_lower:
                return level
    return 'INFO'

def analyze_commands():
    """Analyze commands from commands.log."""
    if not os.path.exists(COMMANDS_LOG_FILE):
        print(f"[WARNING] Commands log file not found: {COMMANDS_LOG_FILE}")
        return {}
    
    command_stats = {
        'total_commands': 0,
        'users': defaultdict(lambda: {
            'commands': [],
            'threat_levels': Counter(),
            'sessions': 0,
            'first_activity': None,
            'last_activity': None
        }),
        'threat_summary': Counter(),
        'commands_by_type': Counter(),
        'session_timeline': []
    }
    
    session_pattern = re.compile(r'(?P<date>\d{4}-\d{2}-\d{2}) (?P<time>\d{2}:\d{2}:\d{2}) Session started for user (?P<user>\S+)')
    command_pattern = re.compile(r'(?P<date>\d{4}-\d{2}-\d{2}) (?P<time>\d{2}:\d{2}:\d{2}) (?P<user>\S+): (?P<command>.+)')
    
    try:
        with open(COMMANDS_LOG_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                
                # Check for session start
                session_match = session_pattern.match(line)
                if session_match:
                    user = session_match.group('user')
                    timestamp = datetime.strptime(f"{session_match.group('date')} {session_match.group('time')}", "%Y-%m-%d %H:%M:%S")
                    command_stats['users'][user]['sessions'] += 1
                    command_stats['session_timeline'].append({
                        'user': user,
                        'timestamp': timestamp,
                        'type': 'session_start'
                    })
                    
                    if not command_stats['users'][user]['first_activity']:
                        command_stats['users'][user]['first_activity'] = timestamp
                    command_stats['users'][user]['last_activity'] = timestamp
                    continue
                
                # Check for command execution
                cmd_match = command_pattern.match(line)
                if cmd_match:
                    user = cmd_match.group('user')
                    command = cmd_match.group('command')
                    timestamp = datetime.strptime(f"{cmd_match.group('date')} {cmd_match.group('time')}", "%Y-%m-%d %H:%M:%S")
                    
                    threat_level = get_command_threat_level(command)
                    
                    command_stats['total_commands'] += 1
                    command_stats['users'][user]['commands'].append({
                        'command': command,
                        'timestamp': timestamp,
                        'threat_level': threat_level
                    })
                    command_stats['users'][user]['threat_levels'][threat_level] += 1
                    command_stats['threat_summary'][threat_level] += 1
                    command_stats['commands_by_type'][command.split()[0] if command.split() else 'unknown'] += 1
                    
                    if not command_stats['users'][user]['first_activity']:
                        command_stats['users'][user]['first_activity'] = timestamp
                    command_stats['users'][user]['last_activity'] = timestamp
                    
    except Exception as e:
        print(f"[ERROR] Error reading commands log: {e}")
    
    return command_stats

def calculate_threat_score(ip_info, user_commands):
    """Calculate overall threat score for an IP/user combination."""
    score = 0
    
    # Failed authentication attempts
    if ip_info['failed_attempts'] >= THREAT_INDICATORS['multiple_failed_attempts']:
        score += 50
    else:
        score += ip_info['failed_attempts'] * 5
    
    # Rapid connections
    if ip_info['connections_opened'] >= THREAT_INDICATORS['rapid_connections']:
        score += 30
    
    # Command analysis
    if user_commands:
        high_threat_commands = user_commands['threat_levels'].get('HIGH', 0)
        medium_threat_commands = user_commands['threat_levels'].get('MEDIUM', 0)
        
        score += high_threat_commands * 20
        score += medium_threat_commands * 5
        
        # Check for specific threat patterns
        for cmd_info in user_commands['commands']:
            cmd = cmd_info['command'].lower()
            
            # Privilege escalation attempts
            if any(priv_cmd in cmd for priv_cmd in THREAT_INDICATORS['privileged_escalation']):
                score += 25
            
            # Reconnaissance commands
            if any(recon_cmd in cmd for recon_cmd in THREAT_INDICATORS['reconnaissance_commands']):
                score += 15
            
            # File manipulation
            if any(file_cmd in cmd for file_cmd in THREAT_INDICATORS['file_manipulation']):
                score += 10
            
            # Network commands
            if any(net_cmd in cmd for net_cmd in THREAT_INDICATORS['network_commands']):
                score += 20
    
    return min(score, 100)  # Cap at 100

def get_threat_level_from_score(score):
    """Convert numeric score to threat level."""
    if score >= 80:
        return "🔴 CRITICAL"
    elif score >= 60:
        return "🟠 HIGH"
    elif score >= 40:
        return "🟡 MEDIUM"
    elif score >= 20:
        return "🔵 LOW"
    else:
        return "🟢 MINIMAL"

def extract_ips_from_commands():
    """Extract IP and session info from commands.log when auth.log is missing."""
    ip_data = defaultdict(lambda: {
        'count': 0,
        'users': Counter(),
        'first_seen': None,
        'last_seen': None,
        'failed_attempts': 0,
        'successful_logins': 0,
        'connections_opened': 0,
        'connections_closed': 0,
        'location': None,
    })
    
    if not os.path.exists(COMMANDS_LOG_FILE):
        return ip_data
    
    # Enhanced patterns to extract IPs from session start lines
    session_ip_pattern = re.compile(r'Session started for user (?P<user>\S+) from (?P<ip>\d+\.\d+\.\d+\.\d+)')
    session_simple_pattern = re.compile(r'(?P<date>\d{4}-\d{2}-\d{2}) (?P<time>\d{2}:\d{2}:\d{2}) Session started for user (?P<user>\S+)')
    
    try:
        with open(COMMANDS_LOG_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if 'Session started' in line:
                    # Try to extract IP first
                    ip_match = session_ip_pattern.search(line)
                    if ip_match:
                        ip = ip_match.group('ip')
                        user = ip_match.group('user')
                    else:
                        # Fall back to parsing without IP
                        simple_match = session_simple_pattern.match(line)
                        if simple_match:
                            user = simple_match.group('user')
                            ip = f"unknown_{user}"  # Create synthetic IP for tracking
                        else:
                            continue
                    
                    # Parse timestamp
                    if 'date' in line and 'time' in line:
                        date_match = re.search(r'(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})', line)
                        if date_match:
                            timestamp = datetime.strptime(f"{date_match.group(1)} {date_match.group(2)}", "%Y-%m-%d %H:%M:%S")
                        else:
                            timestamp = datetime.now()
                    else:
                        timestamp = datetime.now()
                    
                    ip_data[ip]['count'] += 1
                    ip_data[ip]['users'][user] += 1
                    ip_data[ip]['connections_opened'] += 1
                    ip_data[ip]['successful_logins'] += 1  # Session started = successful login
                    
                    if ip_data[ip]['first_seen'] is None or timestamp < ip_data[ip]['first_seen']:
                        ip_data[ip]['first_seen'] = timestamp
                    if ip_data[ip]['last_seen'] is None or timestamp > ip_data[ip]['last_seen']:
                        ip_data[ip]['last_seen'] = timestamp
                        
    except Exception as e:
        print(f"[ERROR] Error extracting IPs from commands log: {e}")
    
    return ip_data

def analyze_attack_patterns(command_stats, ip_data):
    """Analyze attack patterns and generate cyber security insights."""
    patterns = {
        'attack_waves': [],
        'session_clusters': [],
        'command_sequences': [],
        'anomalies': [],
        'peak_hours': Counter(),
        'user_behavior': {}
    }
    
    if not command_stats or not command_stats.get('session_timeline'):
        return patterns
    
    # Analyze attack waves (multiple sessions in short time)
    sessions = sorted(command_stats['session_timeline'], key=lambda x: x['timestamp'])
    for i in range(len(sessions) - 1):
        time_diff = (sessions[i+1]['timestamp'] - sessions[i]['timestamp']).total_seconds()
        if time_diff <= 300:  # 5 minutes
            patterns['attack_waves'].append({
                'start': sessions[i]['timestamp'],
                'end': sessions[i+1]['timestamp'],
                'duration': time_diff,
                'users': [sessions[i]['user'], sessions[i+1]['user']]
            })
    
    # Analyze peak attack hours
    for session in sessions:
        hour = session['timestamp'].hour
        patterns['peak_hours'][hour] += 1
    
    # Analyze command sequences for attack patterns
    for user, user_info in command_stats.get('users', {}).items():
        commands = user_info.get('commands', [])
        if len(commands) >= 3:
            # Look for reconnaissance -> escalation -> persistence patterns
            recon_count = 0
            escalation_count = 0
            
            for cmd_info in commands:
                cmd = cmd_info['command'].lower()
                if any(recon in cmd for recon in ['ps', 'netstat', 'whoami', 'id', 'uname']):
                    recon_count += 1
                if any(esc in cmd for esc in ['sudo', 'su', 'passwd', 'chmod']):
                    escalation_count += 1
            
            patterns['user_behavior'][user] = {
                'total_commands': len(commands),
                'reconnaissance_commands': recon_count,
                'escalation_attempts': escalation_count,
                'attack_pattern_score': recon_count + (escalation_count * 2)
            }
    
    return patterns

def parse_ssh_honeypot_logs():
    print(f"[INFO] 🔍 SSH HONEYPOT CYBER ATTACK ANALYZER")
    print(f"[INFO] ━" * 60)
    print(f"[INFO] Auth Log: {AUTH_LOG_FILE}")
    print(f"[INFO] Commands Log: {COMMANDS_LOG_FILE}")
    
    auth_log_exists = os.path.exists(AUTH_LOG_FILE)
    commands_log_exists = os.path.exists(COMMANDS_LOG_FILE)
    
    if not auth_log_exists and not commands_log_exists:
        print(f"[ERROR] ❌ No log files found! Cannot perform analysis.")
        return {
            'stats': {
                'total_connections': 0,
                'failed_logins': 0,
                'successful_logins': 0,
                'unique_ips': 0,
                'commands_executed': 0,
                'top_attacking_ips': [],
                'attack_timeline': [],
                'threat_summary': {'high': 0, 'medium': 0, 'low': 0},
                'recent_attacks': []
            },
            'logs': [],
            'total_logs': 0,
            'service': 'ssh',
            'last_updated': datetime.now().isoformat()
        }
    
    # Always analyze commands first
    print(f"[INFO] 📊 Analyzing command logs...")
    command_stats = analyze_commands()
    
    # Determine IP data source
    if not auth_log_exists:
        print(f"[WARNING] ⚠️  Auth log missing - extracting data from commands.log")
        ip_data = extract_ips_from_commands()
        skip_geolocation = True  # Don't query geolocation for synthetic IPs
    else:
        print(f"[INFO] 🔐 Parsing authentication logs...")
        skip_geolocation = False
    
        # Parse authentication logs (existing auth.log parsing code)
        log_pattern = re.compile(
            r'^(?P<month>\w{3}) (?P<day>\d{1,2}) (?P<time>\d{2}:\d{2}:\d{2}) '
            r'\S+ sshd\[\d+\]: (?P<message>.+)$'
        )
        ip_pattern = re.compile(r'from (?P<ip>\d+\.\d+\.\d+\.\d+)')
        user_pattern = re.compile(r'user=(?P<user>\S+)|for (?P<user2>\S+) from')
        failed_password_pattern = re.compile(r'(Failed password|authentication failure)')
        success_pattern = re.compile(r'(Accepted password|session opened)')
        connection_open_pattern = re.compile(r'Connection from (?P<ip>\d+\.\d+\.\d+\.\d+)')
        connection_close_pattern = re.compile(r'Connection closed by (?P<ip>\d+\.\d+\.\d+\.\d+)')

        months = { 'Jan':1, 'Feb':2, 'Mar':3, 'Apr':4, 'May':5, 'Jun':6,
                   'Jul':7, 'Aug':8, 'Sep':9, 'Oct':10, 'Nov':11, 'Dec':12 }

        ip_data = defaultdict(lambda: {
            'count': 0,
            'users': Counter(),
            'first_seen': None,
            'last_seen': None,
            'failed_attempts': 0,
            'successful_logins': 0,
            'connections_opened': 0,
            'connections_closed': 0,
            'location': None,
        })

        try:
            with open(AUTH_LOG_FILE, 'r') as f:
                for line in f:
                    m = log_pattern.match(line)
                    if not m:
                        continue

                    month = months[m.group('month')]
                    day = int(m.group('day'))
                    time_str = m.group('time')
                    timestamp = datetime(datetime.now().year, month, day,
                                         int(time_str[0:2]), int(time_str[3:5]), int(time_str[6:8]))

                    message = m.group('message')

                    ip_match = ip_pattern.search(message)
                    if ip_match:
                        ip = ip_match.group('ip')
                    else:
                        ip = None

                    conn_open_match = connection_open_pattern.search(message)
                    conn_close_match = connection_close_pattern.search(message)

                    if conn_open_match:
                        ip_conn = conn_open_match.group('ip')
                        ip_data[ip_conn]['connections_opened'] += 1

                    if conn_close_match:
                        ip_conn = conn_close_match.group('ip')
                        ip_data[ip_conn]['connections_closed'] += 1

                    if ip:
                        data = ip_data[ip]
                        data['count'] += 1

                        user_match = user_pattern.search(message)
                        if user_match:
                            user = user_match.group('user') or user_match.group('user2')
                            if user:
                                data['users'][user] += 1

                        if failed_password_pattern.search(message):
                            data['failed_attempts'] += 1

                        if success_pattern.search(message):
                            data['successful_logins'] += 1

                        if data['first_seen'] is None or timestamp < data['first_seen']:
                            data['first_seen'] = timestamp
                        if data['last_seen'] is None or timestamp > data['last_seen']:
                            data['last_seen'] = timestamp
        except FileNotFoundError:
            print(f"[ERROR] Could not read auth log file: {AUTH_LOG_FILE}")
            if not command_stats:
                return
            ip_data = {}
        except Exception as e:
            print(f"[ERROR] Error reading auth log file: {e}")
            if not command_stats:
                return
            ip_data = {}

    # Analyze attack patterns
    print(f"[INFO] 🕵️ Analyzing attack patterns...")
    attack_patterns = analyze_attack_patterns(command_stats, ip_data)

    # Query location for real IPs only
    if ip_data and not skip_geolocation:
        print(f"[INFO] 🌍 Fetching geolocation data for {len(ip_data)} IPs...")
        for ip in ip_data.keys():
            if not ip.startswith('unknown_'):  # Skip synthetic IPs
                location = get_ip_location(ip)
                ip_data[ip]['location'] = location
                time.sleep(0.5)  # Red  uced delay

    # Generate comprehensive dashboard-ready report
    return generate_dashboard_report(ip_data, command_stats, attack_patterns)

def generate_dashboard_report(ip_data, command_stats, attack_patterns):
    """Generate a comprehensive, dashboard-ready security report with rich data."""
    
    # Calculate metrics
    total_ips = len(ip_data) if ip_data else 0
    total_failed_attempts = sum(info['failed_attempts'] for info in ip_data.values()) if ip_data else 0
    total_successful_logins = sum(info['successful_logins'] for info in ip_data.values()) if ip_data else 0
    total_connections = sum(info['connections_opened'] for info in ip_data.values()) if ip_data else 0
    total_commands = command_stats.get('total_commands', 0) if command_stats else 0
    active_users = len(command_stats.get('users', {})) if command_stats else 0
    
    # Calculate threat scores for top attacking IPs
    top_attacking_ips = []
    if ip_data:
        threat_scores = []
        for ip, info in ip_data.items():
            user_commands = None
            if command_stats and command_stats.get('users') and info['users']:
                primary_user = info['users'].most_common(1)[0][0]
                user_commands = command_stats['users'].get(primary_user)
            
            threat_score = calculate_threat_score(info, user_commands)
            threat_level = get_threat_level_from_score(threat_score)
            
            location = "Unknown"
            if info.get('location'):
                loc = info['location']
                location = f"{loc.get('country', 'Unknown')}"
            
            threat_scores.append({
                'ip': ip,
                'threat_score': threat_score,
                'threat_level': threat_level,
                'failed_attempts': info['failed_attempts'],
                'successful_logins': info['successful_logins'],
                'connections': info['connections_opened'],
                'location': location,
                'first_seen': info['first_seen'].isoformat() if info['first_seen'] else None,
                'last_seen': info['last_seen'].isoformat() if info['last_seen'] else None,
                'users': dict(info['users'].most_common()),
                'total_events': info['count']
            })
        
        threat_scores.sort(key=lambda x: x['threat_score'], reverse=True)
        top_attacking_ips = threat_scores[:10]
    
    # Generate detailed logs list for frontend
    logs = []
    
    # Add authentication events from ip_data
    if ip_data:
        for ip, info in ip_data.items():
            if info['failed_attempts'] > 0:
                logs.append({
                    'timestamp': info['last_seen'].isoformat() if info['last_seen'] else datetime.now().isoformat(),
                    'event_type': 'failed_login',
                    'ip': ip,
                    'message': f"{info['failed_attempts']} failed authentication attempts",
                    'threat_level': 'high' if info['failed_attempts'] > 5 else 'medium',
                    'country': info.get('location', {}).get('country', 'Unknown') if info.get('location') else 'Unknown',
                    'details': f"Multiple failed login attempts from {ip}"
                })
            
            if info['successful_logins'] > 0:
                users_list = ', '.join([f"{user}({count})" for user, count in info['users'].most_common(3)])
                logs.append({
                    'timestamp': info['last_seen'].isoformat() if info['last_seen'] else datetime.now().isoformat(),
                    'event_type': 'login',
                    'ip': ip,
                    'message': f"Successful authentication for users: {users_list}",
                    'threat_level': 'high',
                    'country': info.get('location', {}).get('country', 'Unknown') if info.get('location') else 'Unknown',
                    'details': f"Successful login from {ip}"
                })
    
    # Add detailed command execution events
    if command_stats and command_stats.get('users'):
        for user, user_info in command_stats['users'].items():
            if user_info and user_info.get('commands'):
                for cmd_info in user_info['commands'][-20:]:  # Last 20 commands
                    threat_level = cmd_info['threat_level'].lower()
                    logs.append({
                        'timestamp': cmd_info['timestamp'].isoformat(),
                        'event_type': 'command',
                        'username': user,
                        'command': cmd_info['command'],
                        'message': f"Command executed: {cmd_info['command'][:50]}...",
                        'threat_level': threat_level,
                        'details': f"User {user} executed: {cmd_info['command']}"
                    })
    
    # Sort logs by timestamp (newest first)
    logs.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Calculate threat summary with more detail
    threat_summary = {'high': 0, 'medium': 0, 'low': 0}
    if command_stats and command_stats.get('threat_summary'):
        threat_summary = {
            'high': command_stats['threat_summary'].get('HIGH', 0),
            'medium': command_stats['threat_summary'].get('MEDIUM', 0),
            'low': command_stats['threat_summary'].get('LOW', 0) + command_stats['threat_summary'].get('INFO', 0)
        }
    
    # Enhanced recent attacks (last 15 high/medium threat events)
    recent_attacks = [
        {
            'timestamp': log['timestamp'],
            'type': log['event_type'].replace('_', ' ').title(),
            'details': log.get('details', log.get('message', '')),
            'severity': log.get('threat_level', 'low'),
            'source': log.get('ip', log.get('username', 'Unknown'))
        }
        for log in logs 
        if log.get('threat_level') in ['high', 'medium']
    ][:15]
    
    # Generate command statistics and charts data
    command_frequency = {}
    user_activity = {}
    hourly_activity = [0] * 24
    daily_activity = {}
    
    if command_stats and command_stats.get('users'):
        for user, user_info in command_stats['users'].items():
            if user_info and user_info.get('commands'):
                user_activity[user] = {
                    'total_commands': len(user_info['commands']),
                    'sessions': user_info.get('sessions', 0),
                    'first_activity': user_info.get('first_activity').isoformat() if user_info.get('first_activity') else None,
                    'last_activity': user_info.get('last_activity').isoformat() if user_info.get('last_activity') else None,
                    'threat_levels': dict(user_info.get('threat_levels', {})),
                    'top_commands': [cmd_info['command'] for cmd_info in user_info['commands'][-10:]]
                }
                
                # Count command frequency
                for cmd_info in user_info['commands']:
                    cmd_base = cmd_info['command'].split()[0] if cmd_info['command'].split() else 'unknown'
                    command_frequency[cmd_base] = command_frequency.get(cmd_base, 0) + 1
                    
                    # Activity by hour
                    if cmd_info.get('timestamp'):
                        hour = cmd_info['timestamp'].hour
                        hourly_activity[hour] += 1
                        
                        # Activity by day
                        day = cmd_info['timestamp'].date().isoformat()
                        daily_activity[day] = daily_activity.get(day, 0) + 1
    
    # Top commands used
    top_commands = sorted(command_frequency.items(), key=lambda x: x[1], reverse=True)[:15]
    
    # Attack timeline (hourly breakdown)
    attack_timeline = [
        {'hour': i, 'attacks': hourly_activity[i]} 
        for i in range(24)
    ]
    
    # Connection patterns
    connection_patterns = []
    if ip_data:
        for ip, info in ip_data.items():
            if info['connections_opened'] > 0:
                connection_patterns.append({
                    'ip': ip,
                    'connections': info['connections_opened'],
                    'duration': (info['last_seen'] - info['first_seen']).total_seconds() if info['first_seen'] and info['last_seen'] else 0,
                    'success_rate': (info['successful_logins'] / max(info['connections_opened'], 1)) * 100,
                    'country': info.get('location', {}).get('country', 'Unknown') if info.get('location') else 'Unknown'
                })
    
    return {
        'stats': {
            'total_connections': total_connections,
            'failed_logins': total_failed_attempts,
            'successful_logins': total_successful_logins,
            'unique_ips': total_ips,
            'commands_executed': total_commands,
            'active_users': active_users,
            'top_attacking_ips': top_attacking_ips,
            'attack_timeline': attack_timeline,
            'threat_summary': threat_summary,
            'recent_attacks': recent_attacks,
            'command_frequency': dict(top_commands),
            'user_activity': user_activity,
            'connection_patterns': connection_patterns[:10],
            'daily_activity': daily_activity,
            'security_metrics': {
                'avg_commands_per_session': total_commands / max(total_successful_logins, 1),
                'most_active_hour': max(range(24), key=lambda h: hourly_activity[h]),
                'attack_success_rate': (total_successful_logins / max(total_connections, 1)) * 100,
                'top_threat_commands': [cmd for cmd, count in top_commands if count > 2][:10]
            }
        },
        'logs': logs[:100],  # Return last 100 logs
        'raw_data': {
            'all_commands': [
                {
                    'user': user,
                    'command': cmd_info['command'],
                    'timestamp': cmd_info['timestamp'].isoformat(),
                    'threat_level': cmd_info['threat_level']
                }
                for user, user_info in (command_stats.get('users', {}) or {}).items()
                for cmd_info in (user_info.get('commands', []) or [])
            ][-50:],  # Last 50 commands
            'session_timeline': [
                {
                    'user': session['user'],
                    'timestamp': session['timestamp'].isoformat(),
                    'type': session['type']
                }
                for session in (command_stats.get('session_timeline', []) or [])
            ],
            'ip_details': [
                {
                    'ip': ip,
                    'country': info.get('location', {}).get('country', 'Unknown') if info.get('location') else 'Unknown',
                    'city': info.get('location', {}).get('city', 'Unknown') if info.get('location') else 'Unknown',
                    'isp': info.get('location', {}).get('isp', 'Unknown') if info.get('location') else 'Unknown',
                    'first_seen': info['first_seen'].isoformat() if info['first_seen'] else None,
                    'last_seen': info['last_seen'].isoformat() if info['last_seen'] else None,
                    'total_events': info['count'],
                    'users': dict(info['users'].most_common())
                }
                for ip, info in (ip_data or {}).items()
            ]
        },
        'charts_data': {
            'hourly_activity': [
                {'hour': f"{i:02d}:00", 'attacks': hourly_activity[i]} 
                for i in range(24)
            ],
            'command_distribution': [
                {'command': cmd, 'count': count, 'percentage': (count/total_commands*100) if total_commands > 0 else 0}
                for cmd, count in top_commands[:10]
            ],
            'threat_level_distribution': [
                {'level': level.title(), 'count': count}
                for level, count in threat_summary.items()
            ],
            'user_command_breakdown': [
                {
                    'user': user, 
                    'commands': len(info.get('commands', [])),
                    'sessions': info.get('sessions', 0),
                    'high_threat': info.get('threat_levels', {}).get('HIGH', 0),
                    'medium_threat': info.get('threat_levels', {}).get('MEDIUM', 0)
                }
                for user, info in (command_stats.get('users', {}) or {}).items()
            ]
        },
        'total_logs': len(logs),
        'service': 'ssh',
        'last_updated': datetime.now().isoformat()
    }

def parse_logs():
    """Main function to parse SSH logs and return dashboard data"""
    try:
        result = parse_ssh_honeypot_logs()
        return result
    except Exception as e:
        return {
            'stats': {
                'total_connections': 0,
                'failed_logins': 0,
                'successful_logins': 0,
                'unique_ips': 0,
                'commands_executed': 0,
                'top_attacking_ips': [],
                'attack_timeline': [],
                'threat_summary': {'high': 0, 'medium': 0, 'low': 0},
                'recent_attacks': []
            },
            'logs': [],
            'total_logs': 0,
            'service': 'ssh',
            'error': str(e),
            'last_updated': datetime.now().isoformat()
        }

if __name__ == "__main__":
    result = parse_logs()
    print(json.dumps(result, indent=2, default=str))
