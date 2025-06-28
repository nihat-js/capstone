#!/usr/bin/env python3
"""
Test script to verify HoneyShield SSH honeypot functionality
"""

import requests
import json
import time

API_BASE = "http://localhost:5000/api"

def test_health():
    """Test API health endpoint"""
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            print("✅ API Health Check: PASSED")
            return True
        else:
            print(f"❌ API Health Check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ API Health Check: FAILED (Error: {e})")
        return False

def test_ssh_configuration():
    """Test SSH configuration endpoint"""
    test_config = {
        "config": {
            "name": "Test SSH Honeypot",
            "port": 2222,
            "banner": "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1",
            "enablePasswordAuth": True,
            "enableKeyAuth": False,
            "maxConnections": 10,
            "sessionTimeout": 300,
            "fakeUsers": [
                {"username": "admin", "password": "admin123", "shell": "/bin/bash"},
                {"username": "test", "password": "test", "shell": "/bin/sh"}
            ],
            "fakeFiles": [
                {"path": "/etc/passwd", "content": "root:x:0:0:root:/root:/bin/bash"},
                {"path": "/home/admin/secret.txt", "content": "This is a secret file"}
            ]
        }
    }
    
    try:
        response = requests.post(f"{API_BASE}/ssh/configure", json=test_config)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ SSH Configuration: PASSED")
                return data.get('config_id')
            else:
                print(f"❌ SSH Configuration: FAILED (Error: {data.get('error')})")
                return None
        else:
            print(f"❌ SSH Configuration: FAILED (Status: {response.status_code})")
            return None
    except Exception as e:
        print(f"❌ SSH Configuration: FAILED (Error: {e})")
        return None

def test_honeypots_list():
    """Test honeypots listing endpoint"""
    try:
        response = requests.get(f"{API_BASE}/honeypots")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Honeypots List: PASSED")
                return True
            else:
                print(f"❌ Honeypots List: FAILED (Error: {data.get('error')})")
                return False
        else:
            print(f"❌ Honeypots List: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Honeypots List: FAILED (Error: {e})")
        return False

def main():
    """Run all tests"""
    print("🧪 Starting HoneyShield API Tests")
    print("=" * 40)
    
    # Test 1: Health Check
    if not test_health():
        print("\n❌ Basic connectivity failed. Make sure Flask API is running.")
        return
    
    # Test 2: SSH Configuration
    config_id = test_ssh_configuration()
    if not config_id:
        print("\n❌ Configuration test failed.")
        return
    
    # Test 3: Honeypots List
    if not test_honeypots_list():
        print("\n❌ Honeypots list test failed.")
        return
    
    print("\n" + "=" * 40)
    print("🎉 All tests PASSED!")
    print(f"✅ Test configuration created with ID: {config_id}")
    print("\nNext steps:")
    print("1. Try starting the honeypot from the web interface")
    print("2. Test SSH connections to port 2222")
    print("3. Monitor logs for attack attempts")

if __name__ == "__main__":
    main()
