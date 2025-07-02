FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y openssh-server sudo rsyslog && \
    mkdir /var/run/sshd && mkdir -p /var/log/ssh && \
    mkdir -p /var/log/honeypot

# Copy banner
COPY banner.txt /etc/ssh/banner

# SSH Configuration
RUN echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config && \
    echo 'LogLevel VERBOSE' >> /etc/ssh/sshd_config && \
    echo 'SyslogFacility AUTHPRIV' >> /etc/ssh/sshd_config && \
    echo 'Banner /etc/ssh/banner' >> /etc/ssh/sshd_config && \
    echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config && \
    echo 'ChallengeResponseAuthentication no' >> /etc/ssh/sshd_config && \
    echo 'UsePAM yes' >> /etc/ssh/sshd_config

# Create users first
RUN useradd -m admin && echo 'admin:admin123' | chpasswd && usermod -aG sudo admin && mkdir -p /home/admin/.ssh && chmod 700 /home/admin/.ssh


# Set file permissions
RUN chmod 644 /etc/passwd && \
    chmod 640 /etc/shadow

# Create log directory with proper permissions FROM START
RUN mkdir -p /var/log/ssh && \
    touch /var/log/ssh/auth.log /var/log/ssh/messages /var/log/ssh/commands.log && \
    chmod 777 /var/log/ssh && \
    chmod 777 /var/log/ssh/commands.log && \
    chmod 777 /var/log/ssh/auth.log && \
    chmod 777 /var/log/ssh/messages && \
    ls -la /var/log/ssh/

# Logging setup
RUN echo 'auth,authpriv.*    /var/log/ssh/auth.log' >> /etc/rsyslog.conf && \
    echo '*.info;mail.none;authpriv.none;cron.none    /var/log/ssh/messages' >> /etc/rsyslog.conf

# Create command logging setup with a custom bash wrapper  
RUN echo '#!/bin/bash' > /usr/local/bin/ssh_logger.sh && \
    echo 'LOGFILE="/var/log/ssh/commands.log"' >> /usr/local/bin/ssh_logger.sh && \
    echo 'echo "$(date +%Y-%m-%d\ %H:%M:%S) Session started for user $USER from $SSH_CLIENT" >> $LOGFILE' >> /usr/local/bin/ssh_logger.sh && \
    echo 'export PS1="$USER@securebank:~$ "' >> /usr/local/bin/ssh_logger.sh && \
    echo 'while true; do' >> /usr/local/bin/ssh_logger.sh && \
    echo '  read -e -p "$PS1" cmd' >> /usr/local/bin/ssh_logger.sh && \
    echo '  if [[ "$cmd" == "exit" ]]; then' >> /usr/local/bin/ssh_logger.sh && \
    echo '    echo "$(date +%Y-%m-%d\ %H:%M:%S) $USER: exit" >> $LOGFILE' >> /usr/local/bin/ssh_logger.sh && \
    echo '    break' >> /usr/local/bin/ssh_logger.sh && \
    echo '  fi' >> /usr/local/bin/ssh_logger.sh && \
    echo '  if [[ -n "$cmd" ]]; then' >> /usr/local/bin/ssh_logger.sh && \
    echo '    echo "$(date +%Y-%m-%d\ %H:%M:%S) $USER: $cmd" >> $LOGFILE' >> /usr/local/bin/ssh_logger.sh && \
    echo '    eval "$cmd"' >> /usr/local/bin/ssh_logger.sh && \
    echo '  fi' >> /usr/local/bin/ssh_logger.sh && \
    echo 'done' >> /usr/local/bin/ssh_logger.sh && \
    chmod +x /usr/local/bin/ssh_logger.sh

# Configure SSH to use our custom shell
RUN echo 'ForceCommand /usr/local/bin/ssh_logger.sh' >> /etc/ssh/sshd_config
RUN chmod 777 /var/log/ssh/commands.log
EXPOSE 22
CMD rsyslogd && sleep 2 && /usr/sbin/sshd -D
