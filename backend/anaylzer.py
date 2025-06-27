def analyze_logs(log_file='honeypot_logs.txt'):
    with open(log_file, 'r') as f:
        lines = f.readlines()

    ip_counts = {}
    for line in lines:
        if "Connection from" in line:
            ip = line.split("Connection from ")[1].split(":")[0]
            ip_counts[ip] = ip_counts.get(ip, 0) + 1

    print("Top attackers:")
    for ip, count in sorted(ip_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"{ip}: {count} attempts")
