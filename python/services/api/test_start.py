#!/usr/bin/env python3
"""
Simple test script to debug the API service startup
"""
import subprocess
import os
import sys
import time

def test_api_start():
    """Test starting the API service directly"""
    print("Testing API service startup...")
    
    script_path = os.path.join(os.path.dirname(__file__), 'index.py')
    print(f"Script path: {script_path}")
    
    cmd = [
        'python', script_path,
        '--port', '8080',
        '--username', 'james',
        '--password', 'james'
    ]
    
    print(f"Command: {' '.join(cmd)}")
    
    try:
        # Try to start the process with output capture for debugging
        process = subprocess.Popen(
            cmd,
            cwd=os.path.dirname(__file__),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print(f"Process started with PID: {process.pid}")
        
        # Give it a moment to start
        time.sleep(2)
        
        # Check if still running
        if process.poll() is None:
            print("Process is still running!")
            
            # Try to communicate for a short time to get any output
            try:
                stdout, stderr = process.communicate(timeout=3)
                print(f"STDOUT: {stdout}")
                print(f"STDERR: {stderr}")
            except subprocess.TimeoutExpired:
                print("Process is running but timed out waiting for output")
                process.terminate()
                try:
                    stdout, stderr = process.communicate(timeout=2)
                    print(f"STDOUT: {stdout}")
                    print(f"STDERR: {stderr}")
                except:
                    pass
        else:
            stdout, stderr = process.communicate()
            print(f"Process exited with code: {process.returncode}")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            
    except Exception as e:
        print(f"Error starting process: {e}")

if __name__ == '__main__':
    test_api_start()
