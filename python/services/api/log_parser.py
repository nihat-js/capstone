import os
import json
import re
import requests
from datetime import datetime
from collections import defaultdict, Counter
from os import path

log_file = path.join(os.getenv("log_dir","../../logs"),"api","logs.txt")
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
    """Main function to parse API logs and return dashboard data"""
    try:
        result = parse_api_logs(200)  # Get last 200 logs
        logs = result.get('logs', [])
        stats = result.get('statistics', {})
        
        # Transform stats to match dashboard format
        dashboard_stats = {
            'total_requests': stats.get('total_requests', 0),
            'unique_ips': stats.get('unique_ips', 0),
            'suspicious_activities': stats.get('threat_levels', {}).get('HIGH', 0) + stats.get('threat_levels', {}).get('MEDIUM', 0),
            'failed_requests': 0,  # Would need to parse status codes from logs
            'top_attacking_ips': [{'ip': ip, 'count': count} for ip, count in stats.get('top_ips', {}).items()],
            'attack_timeline': [],  # Could be enhanced to show hourly data
            'threat_summary': {
                'high': stats.get('threat_levels', {}).get('HIGH', 0),
                'medium': stats.get('threat_levels', {}).get('MEDIUM', 0),
                'low': stats.get('threat_levels', {}).get('LOW', 0)
            },
            'recent_attacks': [{
                'timestamp': log.get('timestamp'),
                'type': f"{log.get('method')} {log.get('path')}",
                'details': f"IP: {log.get('ip')} - {log.get('user_agent', '')[:50]}...",
                'severity': log.get('threat_level', 'low').lower()
            } for log in logs if log.get('threat_level') in ['HIGH', 'MEDIUM']][:10]
        }
        
        return {
            'stats': dashboard_stats,
            'logs': logs,
            'total_logs': len(logs),
            'service': 'api',
            'last_updated': datetime.now().isoformat()
        }
        
    except Exception as e:
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
