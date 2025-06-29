from collections import Counter
from datetime import datetime
import os

LOG_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '../logs/api_logs.txt'))

def analyze_logs():
    ip_counter = Counter()
    ua_counter = Counter()
    dates = set()
    times = []

    with open(LOG_FILE, 'r') as f:
        for line in f:
            # Example line:
            # 2025-06-29T13:45:25.653656 - 192.168.40.108 - GET /config - Mozilla/5.0 (Windows NT 10.0; Win64; x64)
            try:
                parts = line.strip().split(' - ')
                timestamp_str = parts[0]
                ip = parts[1]
                method_path = parts[2]  # e.g. GET /config
                user_agent = parts[3] if len(parts) > 3 else 'unknown'

                timestamp = datetime.fromisoformat(timestamp_str)
                ip_counter[ip] += 1
                ua_counter[user_agent] += 1
                dates.add(timestamp.date())
                times.append(timestamp.time())
            except Exception as e:
                print(f"Skipping malformed line: {line.strip()} ({e})")

    unique_ips = len(ip_counter)
    total_requests = sum(ip_counter.values())
    most_common_ip, most_common_ip_count = ip_counter.most_common(1)[0] if ip_counter else (None, 0)
    most_common_ua, most_common_ua_count = ua_counter.most_common(1)[0] if ua_counter else (None, 0)

    print(f"Total requests: {total_requests}")
    print(f"Unique IPs: {unique_ips}")
    print(f"Dates logged: {sorted(dates)}")
    print(f"Most frequent IP: {most_common_ip} ({most_common_ip_count} requests)")
    print(f"Most frequent User-Agent: {most_common_ua} ({most_common_ua_count} requests)")
    print("\nRequests per IP:")
    for ip, count in ip_counter.most_common():
        print(f"  {ip}: {count}")
    print("\nRequests per User-Agent:")
    for ua, count in ua_counter.most_common():
        print(f"  {ua}: {count}")

if __name__ == "__main__":
    analyze_logs()
