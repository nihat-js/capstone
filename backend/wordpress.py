import os
import subprocess

WORDPRESS_PORT = 8080  # change if you want
MYSQL_ROOT_PASSWORD = "rootpass123"
MYSQL_USER = "wordpress"
MYSQL_PASSWORD = "wordpresspass"
MYSQL_DATABASE = "wordpress_db"
COMPOSE_DIR = "wordpress_honeypot"

docker_compose_content = f"""
version: '3.7'

services:
  db:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: {MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: {MYSQL_DATABASE}
      MYSQL_USER: {MYSQL_USER}
      MYSQL_PASSWORD: {MYSQL_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql

  wordpress:
    image: wordpress:latest
    depends_on:
      - db
    ports:
      - "{WORDPRESS_PORT}:80"
    restart: always
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: {MYSQL_USER}
      WORDPRESS_DB_PASSWORD: {MYSQL_PASSWORD}
      WORDPRESS_DB_NAME: {MYSQL_DATABASE}
volumes:
  db_data:
"""

def main():
    os.makedirs(COMPOSE_DIR, exist_ok=True)
    compose_path = os.path.join(COMPOSE_DIR, "docker-compose.yml")
    
    with open(compose_path, "w") as f:
        f.write(docker_compose_content)
    
    print(f"Docker Compose file written to {compose_path}")
    print("Starting WordPress honeypot stack...")

    subprocess.run(["docker-compose", "up", "-d"], cwd=COMPOSE_DIR, check=True)

    print(f"WordPress honeypot is running on http://localhost:{WORDPRESS_PORT}")

if __name__ == "__main__":
    main()
