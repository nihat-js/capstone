from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import subprocess
import json
import signal
import time
import sys

# Add the current directory to Python path

from service_registry import registry

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Flask API is running'})




@app.route('/api/services', methods=['GET'])
def get_available_services():
    """Get list of available services"""
    try:
        services = registry.get_available_services()
        return jsonify({
            'success': True,
            'services': services
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/<service_name>/configure', methods=['POST'])
def configure_service(service_name):
    """Configure any service"""
    try:
        data = request.get_json()
        config = data.get('config', {})
        
        # Validate required fields
        required_fields = ['name', 'port']
        for field in required_fields:
            if field not in config or not config[field]:
                return jsonify({
                    'success': False,
                    'error': f'Missing or empty required field: {field}'
                }), 400
        
        # Ensure name is not just whitespace
        if not config['name'].strip():
            return jsonify({
                'success': False,
                'error': 'Honeypot name cannot be empty or just whitespace'
            }), 400
        
        # Validate port range
        try:
            port = int(config['port'])
            if port < 1 or port > 65535:
                return jsonify({
                    'success': False,
                    'error': 'Port must be between 1 and 65535'
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'Port must be a valid number'
            }), 400
        
        # Save configuration using registry
        success = registry.save_config(service_name, config)
        
        if success:
            print(f"✅ {service_name.upper()} configuration saved")
            print(f"   Name: {config['name']}")
            print(f"   Port: {config['port']}")
            
            return jsonify({
                'success': True,
                'message': f'{service_name.upper()} configuration saved successfully',
                'service': service_name,
                'config': config
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to save {service_name} configuration'
            }), 500
        
    except Exception as e:
        print(f"❌ Error configuring {service_name}: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to configure {service_name}: {str(e)}'
        }), 500

@app.route('/api/<service_name>/start', methods=['POST'])
def start_service(service_name):
    """Start any service"""

  

    try:
        data = request.get_json()
        config = data.get('config')
        
        # If no config provided, try to load from file
        if not config:
            saved_config = registry.load_config(service_name)
            if saved_config and 'config' in saved_config:
                config = saved_config['config']
            else:
                return jsonify({
                    'success': False,
                    'error': f'No configuration found for {service_name}. Please configure first.'
                }), 400
        
        print(f"🚀 Starting {service_name} honeypot")
        print(f"   Name: {config.get('name', 'Unknown')}")
        print(f"   Port: {config.get('port', 'Unknown')}")
        
        success = registry.start_service(service_name, config)
        
        if success:
            print(f"✅ {service_name} honeypot started successfully")
            message = f"{service_name.upper()} honeypot started successfully"
        else:
            print(f"❌ Failed to start {service_name} honeypot")
            message = f"Failed to start {service_name} honeypot"
            
        return jsonify({
            'success': success,
            'message': message,
            'service': service_name
        })
        
    except Exception as e:
        print(f"❌ Error starting {service_name} honeypot: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to start {service_name} honeypot: {str(e)}'
        }), 500

@app.route('/api/<service_name>/stop', methods=['POST'])
def stop_service(service_name):
    """Stop any service"""
    try:
        data = request.get_json() or {}
        instance_id = data.get('instance_id')
        
        success = registry.stop_service(service_name, instance_id)
        
        if success:
            message = f"{service_name.upper()} honeypot stopped successfully"
        else:
            message = f"Failed to stop {service_name} honeypot"
        
        return jsonify({
            'success': success,
            'message': message,
            'service': service_name
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to stop {service_name} honeypot: {str(e)}'
        }), 500

@app.route('/api/<service_name>/status', methods=['GET'])
def get_service_status(service_name):
    """Get status of any service"""
    try:
        status_info = registry.get_service_status(service_name)
        
        return jsonify({
            'success': True,
            'service': service_name,
            'status': status_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get {service_name} status: {str(e)}'
        }), 500

@app.route('/api/<service_name>/logs', methods=['GET'])
def get_service_logs(service_name):
    """Get logs for any service"""
    try:
        instance_id = request.args.get('instance_id')
        logs = registry.get_service_logs(service_name, instance_id)
        
        return jsonify({
            'success': True,
            'service': service_name,
            'logs': logs
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get {service_name} logs: {str(e)}'
        }), 500

@app.route('/api/honeypots', methods=['GET'])
def get_all_honeypots():
    """Get status of all honeypots"""
    try:
        status_info = registry.get_all_services_status()
        
        return jsonify({
            'success': True,
            'data': status_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get honeypots: {str(e)}'
        }), 500

def main():
    """Main function to start the Flask application"""
    print("="*50)
    print("    HoneyShield Flask API Server")
    print("="*50)
    print("Starting Flask API...")
    print("API will be available at: http://localhost:5000")
    print()
    print("Available services:")
    for service in registry.get_available_services():
        print(f"  - {service.upper()}")
    print()
    print("Generic endpoints:")
    print("  - GET  /api/health                        # Health check")
    print("  - GET  /api/services                      # List available services")
    print("  - POST /api/<service>/configure           # Save service configuration")
    print("  - POST /api/<service>/start               # Start service honeypot")
    print("  - POST /api/<service>/stop                # Stop service honeypot")
    print("  - GET  /api/<service>/status              # Get service status")
    print("  - GET  /api/<service>/logs                # Get service logs")
    print("  - GET  /api/honeypots                     # Get all honeypots")
    print()
    print("Prerequisites:")
    print("  - Docker Desktop must be running")
    print("  - Port 5000 must be available")
    print()
    print("Press Ctrl+C to stop the server")
    print("="*50)
    print()
    
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\nShutting down Flask API server...")
    except Exception as e:
        print(f"Error starting Flask API: {e}")
        return False
    
    return True

if __name__ == '__main__':
    main()
