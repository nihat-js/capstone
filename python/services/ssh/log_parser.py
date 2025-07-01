import re
import os
import requests
import time
from collections import defaultdict, Counter
from datetime import datetime

LOG_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), r'C:\Users\nihat\Desktop\capstone\logs\ssh\ssh_2222_72cb792e\auth.log'))

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

def parse_ssh_honeypot_logs():
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

    with open(LOG_FILE, 'r') as f:
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

    # Query location for each IP (with delay to respect API rate limits)
    for ip in ip_data.keys():
        location = get_ip_location(ip)
        ip_data[ip]['location'] = location
        time.sleep(1)  # wait 1 second to avoid API rate limits

    print(f"Unique IPs: {len(ip_data)}\n")

    for ip, info in ip_data.items():
        users = ', '.join(f"{u}({c})" for u, c in info['users'].most_common(3)) or 'N/A'
        session_duration = (info['last_seen'] - info['first_seen']).total_seconds() if info['first_seen'] and info['last_seen'] else 0
        loc = info.get('location')
        location_str = "N/A"
        if loc:
            location_str = f"{loc.get('city', 'N/A')}, {loc.get('region', 'N/A')}, {loc.get('country', 'N/A')} (ISP: {loc.get('isp', 'N/A')})"

        print(f"IP: {ip}")
        print(f"  Location: {location_str}")
        print(f"  Attempts: {info['count']}")
        print(f"  Users tried (top 3): {users}")
        print(f"  Failed auth attempts: {info['failed_attempts']}")
        print(f"  Successful logins: {info['successful_logins']}")
        print(f"  Connections opened: {info['connections_opened']}")
        print(f"  Connections closed: {info['connections_closed']}")
        print(f"  First seen: {info['first_seen']}")
        print(f"  Last seen: {info['last_seen']}")
        print(f"  Session duration (seconds): {session_duration}")
        print()

if __name__ == "__main__":
    parse_ssh_honeypot_logs()
