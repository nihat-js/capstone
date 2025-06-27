import datetime

LOG_FILE = 'honeypot_logs.txt'

def log_connection(addr, data):
    timestamp = datetime.datetime.now().isoformat()
    ip, port = addr
    log_entry = f"{timestamp} - Connection from {ip}:{port} - Data: {data.decode(errors='ignore')}\n"

    print(f"Logging: {log_entry.strip()}")
    with open(LOG_FILE, 'a') as f:
        f.write(log_entry)
