#!/usr/bin/env python3
"""
Honeypot Management Dashboard
Run this script to start the Flask web server for managing honeypots.
"""

from app import app
import os

if __name__ == '__main__':
    # Ensure required directories exist
    os.makedirs('logs', exist_ok=True)
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    print("=" * 60)
    print("🍯 HONEYPOT MANAGEMENT DASHBOARD")
    print("=" * 60)
    print("Starting Flask web server...")
    print("Dashboard will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    
    # Run Flask app
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )