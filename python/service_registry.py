"""
Service Registry for Honeypot Management
Handles registration and management of different honeypot services
"""
import os
import sys
import importlib.util
import json
import time
from typing import Dict, List, Optional, Any, Callable

class ServiceRegistry:
    def __init__(self):
        self.services: Dict[str, Dict[str, Any]] = {}
        self.running_instances: Dict[str, Dict[str, Any]] = {}
        self.configs_dir = "configs"
        self._ensure_configs_dir()
        self._discover_services()
    
    def _ensure_configs_dir(self):
        """Ensure configs directory exists"""
        os.makedirs(self.configs_dir, exist_ok=True)
    
    def _discover_services(self):
        """Discover available services in the services directory"""
        services_dir = os.path.join(os.path.dirname(__file__), 'services')
        
        # Define service mappings
        service_files = {
            'ssh': 'ssh.py',
            'ftp': 'ftp.py', 
            'rdp': 'rdp.py',
            'mysql': 'mysql.py',
            'http': 'http.py',
            'dns': 'dns.py',
            'telnet': 'telnet.py'
        }
        
        for service_name, file_name in service_files.items():
            file_path = os.path.join(services_dir, file_name)
            if os.path.exists(file_path):
                try:
                    self._register_service_from_file(service_name, file_path)
                except Exception as e:
                    print(f"Warning: Could not register {service_name}: {e}")
    
    def _register_service_from_file(self, service_name: str, file_path: str):
        """Register a service from a Python file"""
        spec = importlib.util.spec_from_file_location(service_name, file_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Look for standard functions in the module
        functions = {}
        if hasattr(module, f'start_{service_name}_honeypot'):
            functions['start'] = getattr(module, f'start_{service_name}_honeypot')
        if hasattr(module, f'stop_{service_name}_honeypot'):
            functions['stop'] = getattr(module, f'stop_{service_name}_honeypot')
        if hasattr(module, f'get_{service_name}_honeypot_status'):
            functions['status'] = getattr(module, f'get_{service_name}_honeypot_status')
        if hasattr(module, f'get_{service_name}_honeypot_logs'):
            functions['logs'] = getattr(module, f'get_{service_name}_honeypot_logs')
        if hasattr(module, f'list_running_{service_name}_honeypots'):
            functions['list'] = getattr(module, f'list_running_{service_name}_honeypots')
        
        self.services[service_name] = {
            'module': module,
            'functions': functions,
            'file_path': file_path
        }
        
        print(f"✅ Registered service: {service_name}")
    
    def get_available_services(self) -> List[str]:
        """Get list of available services"""
        return list(self.services.keys())
    
    def load_config(self, service_name: str) -> Dict[str, Any]:
        """Load configuration for a service"""
        config_file = os.path.join(self.configs_dir, f"{service_name}.json")
        try:
            if os.path.exists(config_file):
                with open(config_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading config for {service_name}: {e}")
        return {}
    
    def save_config(self, service_name: str, config: Dict[str, Any]) -> bool:
        """Save configuration for a service"""
        config_file = os.path.join(self.configs_dir, f"{service_name}.json")
        try:
            # Add metadata
            config_with_meta = {
                'service': service_name,
                'created_at': time.time(),
                'updated_at': time.time(),
                'config': config
            }
            
            with open(config_file, 'w') as f:
                json.dump(config_with_meta, f, indent=2)
            print(f"✅ Config saved for {service_name}")
            return True
        except Exception as e:
            print(f"❌ Error saving config for {service_name}: {e}")
            return False
    
    def start_service(self, service_name: str, config: Dict[str, Any]) -> bool:
        """Start a service with given configuration"""
        if service_name not in self.services:
            print(f"❌ Service {service_name} not found")
            return False
        
        service = self.services[service_name]
        if 'start' not in service['functions']:
            print(f"❌ Start function not available for {service_name}")
            return False
        
        try:
            # Generate instance ID
            instance_id = f"{service_name}_{int(time.time())}"
            
            # Call the service start function
            success = service['functions']['start'](config)
            
            if success:
                self.running_instances[instance_id] = {
                    'service': service_name,
                    'config': config,
                    'started_at': time.time(),
                    'status': 'running'
                }
                print(f"✅ Started {service_name} instance: {instance_id}")
                return True
            else:
                print(f"❌ Failed to start {service_name}")
                return False
                
        except Exception as e:
            print(f"❌ Error starting {service_name}: {e}")
            return False
    
    def stop_service(self, service_name: str, instance_id: str = None) -> bool:
        """Stop a service instance"""
        if service_name not in self.services:
            return False
        
        service = self.services[service_name]
        if 'stop' not in service['functions']:
            return False
        
        try:
            # If no instance_id provided, try to stop any running instance
            if not instance_id:
                running_instances = [k for k, v in self.running_instances.items() 
                                   if v['service'] == service_name and v['status'] == 'running']
                if running_instances:
                    instance_id = running_instances[0]
            
            if instance_id and instance_id in self.running_instances:
                # For SSH, we need to get the container name differently
                if service_name == 'ssh' and 'list' in service['functions']:
                    containers = service['functions']['list']()
                    if containers:
                        success = service['functions']['stop'](containers[0])
                    else:
                        success = False
                else:
                    success = service['functions']['stop'](instance_id)
                
                if success and instance_id in self.running_instances:
                    self.running_instances[instance_id]['status'] = 'stopped'
                    self.running_instances[instance_id]['stopped_at'] = time.time()
                
                return success
            
            return False
            
        except Exception as e:
            print(f"❌ Error stopping {service_name}: {e}")
            return False
    
    def get_service_status(self, service_name: str, instance_id: str = None) -> Dict[str, Any]:
        """Get status of a service"""
        if service_name not in self.services:
            return {'status': 'not_found', 'error': f'Service {service_name} not found'}
        
        service = self.services[service_name]
        
        try:
            # Get basic status from our tracking
            instances = [v for k, v in self.running_instances.items() 
                        if v['service'] == service_name]
            
            status_info = {
                'service': service_name,
                'instances': instances,
                'total_instances': len(instances),
                'running_instances': len([i for i in instances if i['status'] == 'running'])
            }
            
            # Try to get real-time status if function exists
            if 'list' in service['functions']:
                try:
                    running_containers = service['functions']['list']()
                    status_info['containers'] = running_containers
                    status_info['container_count'] = len(running_containers)
                except:
                    status_info['containers'] = []
                    status_info['container_count'] = 0
            
            return status_info
            
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    def get_service_logs(self, service_name: str, instance_id: str = None) -> str:
        """Get logs for a service"""
        if service_name not in self.services:
            return f"Service {service_name} not found"
        
        service = self.services[service_name]
        
        if 'logs' not in service['functions']:
            # Try to read from log file
            log_file = f"services/log/{service_name}_logs.txt"
            if os.path.exists(log_file):
                try:
                    with open(log_file, 'r') as f:
                        return f.read()
                except:
                    pass
            return f"No logs available for {service_name}"
        
        try:
            return service['functions']['logs'](instance_id)
        except Exception as e:
            return f"Error getting logs: {e}"
    
    def get_all_services_status(self) -> Dict[str, Any]:
        """Get status of all services"""
        result = {
            'services': {},
            'statistics': {
                'total_services': len(self.services),
                'total_instances': len(self.running_instances),
                'running_instances': len([i for i in self.running_instances.values() if i['status'] == 'running'])
            }
        }
        
        for service_name in self.services:
            result['services'][service_name] = self.get_service_status(service_name)
        
        return result

# Global registry instance
registry = ServiceRegistry()
