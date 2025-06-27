#!/usr/bin/env python3
"""
phpMyAdmin Honeypot Implementation
Simulates a phpMyAdmin web interface to capture database administration attacks
"""

from flask import Flask, request, render_template_string, redirect, session, make_response
import threading
import os
import logging
from datetime import datetime
import secrets

class PhpMyAdminHoneypot:
    def __init__(self, config):
        self.config = config
        self.host = '0.0.0.0'
        self.port = int(config.get('port', 80))
        self.phpmyadmin_version = config.get('phpmyadmin_version', '5.0.4')
        self.theme = config.get('theme', 'pmahomme')
        self.fake_databases = self._parse_databases(config.get('fake_databases', ''))
        self.show_login_page = config.get('show_login_page', True)
        self.running = False
        
        # Setup Flask app
        self.app = Flask(__name__)
        self.app.secret_key = secrets.token_hex(16)
        
        # Setup logging
        self.logger = self._setup_logging()
        
        # Setup routes
        self._setup_routes()
        
    def _setup_logging(self):
        """Setup logging for phpMyAdmin honeypot"""
        logger = logging.getLogger(f'phpmyadmin_honeypot_{self.port}')
        logger.setLevel(logging.INFO)
        
        # Create file handler
        log_file = f'logs/phpmyadmin_honeypot_{self.port}.log'
        os.makedirs('logs', exist_ok=True)
        
        handler = logging.FileHandler(log_file)
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
        
    def _parse_databases(self, databases_str):
        """Parse database names from configuration"""
        if databases_str:
            return [db.strip() for db in databases_str.strip().split('\n') if db.strip()]
        return ['information_schema', 'mysql', 'performance_schema', 'wordpress_db']
        
    def _setup_routes(self):
        """Setup Flask routes for phpMyAdmin simulation"""
        
        @self.app.before_request
        def log_request():
            """Log all requests"""
            client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            self.logger.info(f"Request from {client_ip}: {request.method} {request.url}")
            if request.form:
                self.logger.info(f"POST data from {client_ip}: {dict(request.form)}")
            if request.args:
                self.logger.info(f"GET parameters from {client_ip}: {dict(request.args)}")
                
        @self.app.route('/')
        @self.app.route('/index.php')
        @self.app.route('/phpmyadmin/')
        @self.app.route('/phpmyadmin/index.php')
        def index():
            """Main phpMyAdmin page"""
            if self.show_login_page and not session.get('authenticated'):
                return self._render_login_page()
            else:
                return self._render_main_page()
                
        @self.app.route('/login', methods=['POST'])
        @self.app.route('/phpmyadmin/login', methods=['POST'])
        def login():
            """Handle login attempts"""
            username = request.form.get('pma_username', '')
            password = request.form.get('pma_password', '')
            server = request.form.get('pma_servername', 'localhost')
            
            client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            self.logger.info(f"Login attempt from {client_ip}: {username}:{password}@{server}")
            
            # Always "authenticate" for honeypot
            session['authenticated'] = True
            session['username'] = username
            return redirect('/')
            
        @self.app.route('/logout')
        @self.app.route('/phpmyadmin/logout')
        def logout():
            """Handle logout"""
            session.clear()
            return redirect('/')
            
        @self.app.route('/db_structure.php')
        @self.app.route('/phpmyadmin/db_structure.php')
        def db_structure():
            """Database structure page"""
            db = request.args.get('db', self.fake_databases[0])
            return self._render_db_structure(db)
            
        @self.app.route('/sql.php', methods=['GET', 'POST'])
        @self.app.route('/phpmyadmin/sql.php', methods=['GET', 'POST'])
        def sql():
            """SQL query page"""
            if request.method == 'POST':
                sql_query = request.form.get('sql_query', '')
                client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
                self.logger.warning(f"SQL query from {client_ip}: {sql_query}")
                return self._render_sql_result(sql_query)
            else:
                return self._render_sql_page()
                
        @self.app.route('/import.php', methods=['GET', 'POST'])
        @self.app.route('/phpmyadmin/import.php', methods=['GET', 'POST'])
        def import_data():
            """Import page"""
            if request.method == 'POST':
                client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
                if 'import_file' in request.files:
                    file = request.files['import_file']
                    self.logger.warning(f"File upload attempt from {client_ip}: {file.filename}")
                return self._render_import_result()
            else:
                return self._render_import_page()
                
        @self.app.route('/export.php')
        @self.app.route('/phpmyadmin/export.php')
        def export():
            """Export page"""
            return self._render_export_page()
            
    def _render_login_page(self):
        """Render phpMyAdmin login page"""
        template = """
<!DOCTYPE html>
<html>
<head>
    <title>phpMyAdmin {{ version }}</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f4; }
        .container { max-width: 400px; margin: 100px auto; background: white; padding: 30px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo img { max-width: 200px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"], input[type="password"], select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px; box-sizing: border-box; }
        .btn { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; width: 100%; }
        .btn:hover { background: #2980b9; }
        .version { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h2>phpMyAdmin</h2>
        </div>
        <form method="post" action="/login">
            <div class="form-group">
                <label for="pma_servername">Server:</label>
                <select name="pma_servername" id="pma_servername">
                    <option value="localhost">localhost</option>
                    <option value="127.0.0.1">127.0.0.1</option>
                </select>
            </div>
            <div class="form-group">
                <label for="pma_username">Username:</label>
                <input type="text" name="pma_username" id="pma_username" value="root" required>
            </div>
            <div class="form-group">
                <label for="pma_password">Password:</label>
                <input type="password" name="pma_password" id="pma_password" required>
            </div>
            <button type="submit" class="btn">Log in</button>
        </form>
        <div class="version">phpMyAdmin {{ version }}</div>
    </div>
</body>
</html>
        """
        return render_template_string(template, version=self.phpmyadmin_version)
        
    def _render_main_page(self):
        """Render main phpMyAdmin dashboard"""
        template = """
<!DOCTYPE html>
<html>
<head>
    <title>phpMyAdmin {{ version }}</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .header { background: #2c3e50; color: white; padding: 10px 20px; }
        .header h1 { margin: 0; display: inline-block; }
        .logout { float: right; margin-top: 5px; }
        .logout a { color: white; text-decoration: none; }
        .container { display: flex; }
        .sidebar { width: 250px; background: #ecf0f1; padding: 20px; min-height: 600px; }
        .content { flex: 1; padding: 20px; }
        .database-list { list-style: none; padding: 0; }
        .database-list li { margin: 5px 0; }
        .database-list a { text-decoration: none; color: #3498db; }
        .database-list a:hover { text-decoration: underline; }
        .server-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .quick-access { background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>phpMyAdmin {{ version }}</h1>
        <div class="logout">
            Welcome {{ username }} | <a href="/logout">Log out</a>
        </div>
        <div style="clear: both;"></div>
    </div>
    <div class="container">
        <div class="sidebar">
            <h3>Databases</h3>
            <ul class="database-list">
                {% for db in databases %}
                <li><a href="/db_structure.php?db={{ db }}">{{ db }}</a></li>
                {% endfor %}
            </ul>
        </div>
        <div class="content">
            <div class="server-info">
                <h3>Server Information</h3>
                <p><strong>Server:</strong> localhost via TCP/IP</p>
                <p><strong>Software:</strong> MySQL 5.7.36</p>
                <p><strong>Protocol version:</strong> 10</p>
                <p><strong>User:</strong> {{ username }}@localhost</p>
                <p><strong>Server charset:</strong> UTF-8 Unicode (utf8)</p>
            </div>
            <div class="quick-access">
                <h3>Quick Access</h3>
                <p><a href="/sql.php">SQL Query</a> | <a href="/import.php">Import</a> | <a href="/export.php">Export</a></p>
            </div>
        </div>
    </div>
</body>
</html>
        """
        return render_template_string(
            template, 
            version=self.phpmyadmin_version,
            username=session.get('username', 'user'),
            databases=self.fake_databases
        )
        
    def _render_db_structure(self, db_name):
        """Render database structure page"""
        template = """
<!DOCTYPE html>
<html>
<head>
    <title>{{ db_name }} - phpMyAdmin</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #3498db; color: white; padding: 10px 20px; margin: -20px -20px 20px -20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
        .back-link { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Database: {{ db_name }}</h2>
    </div>
    <div class="back-link">
        <a href="/">&larr; Back to main page</a>
    </div>
    <h3>Tables in database "{{ db_name }}"</h3>
    <table>
        <tr>
            <th>Table</th>
            <th>Action</th>
            <th>Records</th>
            <th>Type</th>
            <th>Size</th>
        </tr>
        <tr>
            <td>users</td>
            <td><a href="/sql.php?db={{ db_name }}&table=users">Browse</a></td>
            <td>1,234</td>
            <td>MyISAM</td>
            <td>2.5 MB</td>
        </tr>
        <tr>
            <td>orders</td>
            <td><a href="/sql.php?db={{ db_name }}&table=orders">Browse</a></td>
            <td>5,678</td>
            <td>InnoDB</td>
            <td>12.3 MB</td>
        </tr>
        <tr>
            <td>products</td>
            <td><a href="/sql.php?db={{ db_name }}&table=products">Browse</a></td>
            <td>891</td>
            <td>InnoDB</td>
            <td>1.8 MB</td>
        </tr>
    </table>
</body>
</html>
        """
        return render_template_string(template, db_name=db_name)
        
    def _render_sql_page(self):
        """Render SQL query page"""
        template = """
<!DOCTYPE html>
<html>
<head>
    <title>SQL - phpMyAdmin</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #e74c3c; color: white; padding: 10px 20px; margin: -20px -20px 20px -20px; }
        textarea { width: 100%; height: 200px; font-family: monospace; }
        .btn { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; }
        .back-link { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Run SQL Query</h2>
    </div>
    <div class="back-link">
        <a href="/">&larr; Back to main page</a>
    </div>
    <form method="post">
        <h3>SQL Query:</h3>
        <textarea name="sql_query" placeholder="SELECT * FROM users WHERE username = 'admin'"></textarea>
        <br><br>
        <button type="submit" class="btn">Run Query</button>
    </form>
</body>
</html>
        """
        return render_template_string(template)
        
    def _render_sql_result(self, query):
        """Render SQL query results"""
        template = """
<!DOCTYPE html>
<html>
<head>
    <title>SQL Result - phpMyAdmin</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .query { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; font-family: monospace; }
        .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; }
        .back-link { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="back-link">
        <a href="/sql.php">&larr; Back to SQL page</a>
    </div>
    <h3>Query executed:</h3>
    <div class="query">{{ query }}</div>
    <div class="error">
        <strong>MySQL Error:</strong> #1146 - Table 'database.table' doesn't exist
    </div>
</body>
</html>
        """
        return render_template_string(template, query=query)
        
    def _render_import_page(self):
        """Render import page"""
        template = """
<!DOCTYPE html>
<html>
<head>
    <title>Import - phpMyAdmin</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f39c12; color: white; padding: 10px 20px; margin: -20px -20px 20px -20px; }
        .btn { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; }
        .back-link { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Import Database</h2>
    </div>
    <div class="back-link">
        <a href="/">&larr; Back to main page</a>
    </div>
    <form method="post" enctype="multipart/form-data">
        <h3>File to import:</h3>
        <input type="file" name="import_file" accept=".sql,.zip,.gz">
        <br><br>
        <button type="submit" class="btn">Import</button>
    </form>
</body>
</html>
        """
        return render_template_string(template)
        
    def _render_import_result(self):
        """Render import result"""
        template = """
<!DOCTYPE html>
<html>
<head>
    <title>Import Result - phpMyAdmin</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; }
        .back-link { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="back-link">
        <a href="/import.php">&larr; Back to import page</a>
    </div>
    <div class="error">
        <strong>Import Error:</strong> File upload failed. Please check file permissions.
    </div>
</body>
</html>
        """
        return render_template_string(template)
        
    def _render_export_page(self):
        """Render export page"""
        template = """
<!DOCTYPE html>
<html>
<head>
    <title>Export - phpMyAdmin</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #27ae60; color: white; padding: 10px 20px; margin: -20px -20px 20px -20px; }
        .btn { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; }
        .back-link { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Export Database</h2>
    </div>
    <div class="back-link">
        <a href="/">&larr; Back to main page</a>
    </div>
    <h3>Export Options:</h3>
    <form>
        <p>
            <input type="radio" name="export_type" value="sql" checked> SQL<br>
            <input type="radio" name="export_type" value="csv"> CSV<br>
            <input type="radio" name="export_type" value="xml"> XML
        </p>
        <button type="submit" class="btn">Export</button>
    </form>
</body>
</html>
        """
        return render_template_string(template)
        
    def start(self):
        """Start the phpMyAdmin honeypot"""
        try:
            self.running = True
            self.logger.info(f"phpMyAdmin Honeypot started on {self.host}:{self.port}")
            print(f"phpMyAdmin Honeypot listening on port {self.port}")
            
            # Run Flask app in a thread
            self.server_thread = threading.Thread(
                target=self.app.run,
                kwargs={
                    'host': self.host,
                    'port': self.port,
                    'debug': False,
                    'use_reloader': False
                }
            )
            self.server_thread.daemon = True
            self.server_thread.start()
            
            # Keep the main thread alive
            while self.running:
                threading.Event().wait(1)
                
        except Exception as e:
            self.logger.error(f"Failed to start phpMyAdmin honeypot: {e}")
            print(f"Error starting phpMyAdmin honeypot: {e}")
            
    def stop(self):
        """Stop the phpMyAdmin honeypot"""
        self.running = False
        self.logger.info("phpMyAdmin Honeypot stopped")
        print(f"phpMyAdmin Honeypot on port {self.port} stopped")

def create_phpmyadmin_honeypot(config):
    """Factory function to create phpMyAdmin honeypot"""
    return PhpMyAdminHoneypot(config)

if __name__ == "__main__":
    # Test configuration
    test_config = {
        'port': 8080,
        'phpmyadmin_version': '5.0.4',
        'theme': 'pmahomme',
        'fake_databases': 'information_schema\nmysql\nwordpress\ncustomer_db',
        'show_login_page': True
    }
    
    honeypot = PhpMyAdminHoneypot(test_config)
    try:
        honeypot.start()
    except KeyboardInterrupt:
        honeypot.stop()
