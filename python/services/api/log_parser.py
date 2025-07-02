import os
import json
import re
import requests
from datetime import datetime
from collections import defaultdict, Counter
from os import path

# Use absolute path to ensure we find the log file
log_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../logs"))
log_file = path.join(log_dir, "api", "logs.txt")

ip_country_cache = {}

def get_country_from_ip(ip):
    if ip in ip_country_cache:
        return ip_country_cache[ip]
    country = get_country_ipapi(ip)
    if country == "Unknown":
        country = get_country_ipwhois(ip)
    ip_country_cache[ip] = country
    return country

def get_country_ipapi(ip):
    try:
        response = requests.get(f'https://ipapi.co/{ip}/country_name/', timeout=2)
        if response.status_code == 200:
            country = response.text.strip()
            if country and "Unknown" not in country:
                return country
    except requests.RequestException:
        pass
    return "Unknown"

def get_country_ipwhois(ip):
    try:
        response = requests.get(f'https://ipwho.is/{ip}', timeout=2)
        if response.status_code == 200:
            data = response.json()
            if data.get("success", False):
                return data.get("country", "Unknown")
    except requests.RequestException:
        pass
    return "Unknown"

def assess_threat_level(log_data):
    suspicious_paths = ['/admin', '/config', '/api/v1', '/database', '/backup']
    suspicious_agents = ['curl', 'wget', 'python', 'bot', 'scanner', 'sqlmap']

    indicators = 0
    path = log_data.get('path', '')
    user_agent = log_data.get('user_agent', '').lower()

    if any(p in path for p in suspicious_paths):
        indicators += 2
    if any(agent in user_agent for agent in suspicious_agents):
        indicators += 1

    if indicators >= 3:
        return 'HIGH'
    elif indicators >= 1:
        return 'MEDIUM'
    return 'LOW'

def parse_text_log_line(line):
    pattern = r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+) - ([\d\.]+) - (\w+) (\/\S*) - (.+)'
    match = re.match(pattern, line)

    if match:
        timestamp, ip, method, path, user_agent = match.groups()
        return {
            'timestamp': timestamp,
            'level': 'INFO',
            'type': 'API_REQUEST',
            'ip': ip,
            'method': method,
            'path': path,
            'user_agent': user_agent,
            'country': get_country_from_ip(ip),
            'details': {'raw_line': line},
            'threat_level': assess_threat_level({'ip': ip, 'path': path, 'user_agent': user_agent})
        }
    return None

def parse_api_logs(limit=100):
    logs = []
    try:
        with open(log_file, 'r') as f:
            lines = f.readlines()[-limit:]
            for line in reversed(lines):
                parsed = parse_text_log_line(line.strip())
                if parsed:
                    logs.append(parsed)
    except FileNotFoundError:
        pass
    stats = {
        'total_requests': len(logs),
        'unique_ips': len(set(log['ip'] for log in logs)),
        'top_paths': Counter(),
        'top_ips': Counter(),
        'threat_levels': Counter(),
        'methods': Counter()
    }
    for log in logs:
        stats['top_paths'][log['path']] += 1
        stats['top_ips'][log['ip']] += 1
        stats['threat_levels'][log['threat_level']] += 1
        stats['methods'][log['method']] += 1

    stats['top_paths'] = dict(stats['top_paths'].most_common(10))
    stats['top_ips'] = dict(stats['top_ips'].most_common(10))

    return {
        'logs': logs,
        'statistics': stats
    }

def parse_logs():
    """Main function to parse API logs and return comprehensive dashboard data"""
    try:
        result = parse_api_logs(500)  # Get last 500 logs for more data
        logs = result.get('logs', [])
        stats = result.get('statistics', {})
        
        hourly_activity = [0] * 24
        daily_activity = {}
        path_analysis = Counter()
        user_agent_analysis = Counter()
        attack_patterns = []
        
        # Analyze each log entry
        for log in logs:
            if log.get('timestamp'):
                try:
                    timestamp = datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00'))
                    hour = timestamp.hour
                    day = timestamp.date().isoformat()
                    
                    hourly_activity[hour] += 1
                    daily_activity[day] = daily_activity.get(day, 0) + 1
                except:
                    pass
            
            # Analyze paths for suspicious patterns
            path = log.get('path', '')
            path_analysis[path] += 1
            
            # Analyze user agents
            user_agent = log.get('user_agent', '')
            ua_short = user_agent.split()[0] if user_agent.split() else 'Unknown'
            user_agent_analysis[ua_short] += 1
            
            # Check for attack patterns
            if log.get('threat_level') in ['HIGH', 'MEDIUM']:
                attack_patterns.append({
                    'timestamp': log.get('timestamp'),
                    'ip': log.get('ip'),
                    'path': path,
                    'threat_level': log.get('threat_level'),
                    'details': f"{log.get('method')} {path} from {log.get('ip')}"
                })
        
        # Transform stats to match dashboard format
        dashboard_stats = {
            'total_requests': stats.get('total_requests', len(logs)),
            'unique_ips': stats.get('unique_ips', len(set(log.get('ip') for log in logs))),
            'suspicious_activities': len([log for log in logs if log.get('threat_level') in ['HIGH', 'MEDIUM']]),
            'failed_requests': len([log for log in logs if 'error' in log.get('path', '').lower()]),
            'top_attacking_ips': [
                {
                    'ip': ip, 
                    'count': count,
                    'threat_score': count * 10,  # Simple scoring
                    'threat_level': 'HIGH' if count > 5 else 'MEDIUM' if count > 2 else 'LOW',
                    'location': 'Unknown',  # Could enhance with geolocation
                    'paths': list(set([log.get('path') for log in logs if log.get('ip') == ip]))[:5]
                } 
                for ip, count in stats.get('top_ips', {}).items()
            ][:10],
            'attack_timeline': [
                {'hour': f"{i:02d}:00", 'attacks': hourly_activity[i]} 
                for i in range(24)
            ],
            'threat_summary': {
                'high': stats.get('threat_levels', {}).get('HIGH', 0),
                'medium': stats.get('threat_levels', {}).get('MEDIUM', 0),
                'low': stats.get('threat_levels', {}).get('LOW', 0)
            },
            'recent_attacks': [{
                'timestamp': attack.get('timestamp'),
                'type': f"API Request - {attack.get('threat_level')}",
                'details': attack.get('details'),
                'severity': attack.get('threat_level', 'low').lower(),
                'source': attack.get('ip')
            } for attack in attack_patterns[-15:]],  # Last 15 attacks
            'path_frequency': dict(path_analysis.most_common(20)),
            'user_agent_breakdown': dict(user_agent_analysis.most_common(10)),
            'daily_activity': daily_activity,
            'request_methods': dict(stats.get('methods', {})),
            'security_metrics': {
                'avg_requests_per_ip': len(logs) / max(len(set(log.get('ip') for log in logs)), 1),
                'most_targeted_path': path_analysis.most_common(1)[0][0] if path_analysis else 'None',
                'peak_hour': max(range(24), key=lambda h: hourly_activity[h]),
                'suspicious_rate': (len(attack_patterns) / max(len(logs), 1)) * 100
            }
        }
        
        # Enhanced logs with more context
        enhanced_logs = []
        for log in logs:
            enhanced_logs.append({
                **log,
                'details': f"{log.get('method', 'GET')} {log.get('path', '/')} - {log.get('user_agent', '')[:50]}...",
                'threat_score': 
                    100 if log.get('threat_level') == 'HIGH' else
                    60 if log.get('threat_level') == 'MEDIUM' else 20,
                'risk_indicators': [
                    'Suspicious path' if '/admin' in log.get('path', '') or '/config' in log.get('path', '') else None,
                    'Automated tool' if any(bot in log.get('user_agent', '').lower() for bot in ['bot', 'crawler', 'spider', 'scan']) else None,
                    'Repeated requests' if path_analysis.get(log.get('path', ''), 0) > 5 else None
                ]
            })
        
        return {
            'stats': dashboard_stats,
            'logs': enhanced_logs,
            'raw_data': {
                'all_requests': [{
                    'timestamp': log.get('timestamp'),
                    'method': log.get('method'),
                    'path': log.get('path'),
                    'ip': log.get('ip'),
                    'user_agent': log.get('user_agent'),
                    'threat_level': log.get('threat_level')
                } for log in logs],
                'unique_paths': list(path_analysis.keys()),
                'ip_details': [{
                    'ip': ip,
                    'requests': count,
                    'paths': list(set([log.get('path') for log in logs if log.get('ip') == ip])),
                    'user_agents': list(set([log.get('user_agent') for log in logs if log.get('ip') == ip]))[:3]
                } for ip, count in stats.get('top_ips', {}).items()]
            },
            'charts_data': {
                'hourly_requests': [
                    {'hour': f"{i:02d}:00", 'requests': hourly_activity[i]} 
                    for i in range(24)
                ],
                'path_distribution': [
                    {'path': path, 'count': count, 'percentage': (count/len(logs)*100) if logs else 0}
                    for path, count in path_analysis.most_common(15)
                ],
                'threat_distribution': [
                    {'level': level.title(), 'count': count}
                    for level, count in dashboard_stats['threat_summary'].items()
                ],
                'method_breakdown': [
                    {'method': method, 'count': count}
                    for method, count in stats.get('methods', {}).items()
                ],
                'top_ips': [
                    {'ip': ip, 'requests': count}
                    for ip, count in stats.get('top_ips', {}).items()
                ][:10]
            },
            'total_logs': len(enhanced_logs),
            'service': 'api',
            'last_updated': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"[ERROR] Error in API log parser: {str(e)}")
        return {
            'stats': {
                'total_requests': 0,
                'unique_ips': 0,
                'suspicious_activities': 0,
                'failed_requests': 0,
                'top_attacking_ips': [],
                'attack_timeline': [],
                'threat_summary': {'high': 0, 'medium': 0, 'low': 0},
                'recent_attacks': []
            },
            'logs': [],
            'total_logs': 0,
            'service': 'api',
            'error': str(e),
            'last_updated': datetime.now().isoformat()
        }
