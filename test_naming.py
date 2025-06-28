#!/usr/bin/env python3
"""
Debug script to test SSH honeypot container naming
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from python.services.ssh import SSHHoneypot

def test_container_naming():
    """Test various container naming scenarios"""
    test_configs = [
        {"name": "Test Honeypot", "port": 2222},
        {"name": "", "port": 2222},  # Empty name
        {"name": "   ", "port": 2222},  # Whitespace only
        {"name": "Test@#$%Honeypot", "port": 2222},  # Special characters
        {"name": "SSH Server 123", "port": 2222},  # Normal name
        # Missing name key
        {"port": 2222}
    ]
    
    print("Testing SSH Honeypot Container Naming")
    print("=" * 50)
    
    for i, config in enumerate(test_configs, 1):
        print(f"\nTest {i}: {config}")
        try:
            honeypot = SSHHoneypot(config)
            print(f"✅ Container name: {honeypot.container_name}")
            print(f"   Build dir: {honeypot.build_dir}")
            print(f"   Log file: {honeypot.log_file}")
            
            # Validate Docker naming rules
            name = honeypot.container_name
            if name.endswith('_') or name.startswith('_'):
                print(f"❌ Invalid: name cannot start/end with underscore")
            elif not name.replace('_', '').replace('-', '').isalnum():
                print(f"❌ Invalid: name contains invalid characters")
            else:
                print(f"✅ Valid Docker container name")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("Container naming test completed!")

if __name__ == "__main__":
    test_container_naming()
