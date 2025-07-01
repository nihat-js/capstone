FROM ubuntu:20.04

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

# Create users
RUN useradd -m james && echo 'james:james' | chpasswd && usermod -aG sudo james && mkdir -p /home/james/.ssh && chmod 700 /home/james/.ssh
RUN useradd -m nihat && echo 'nihat:nihat' | chpasswd && mkdir -p /home/nihat/.ssh && chmod 700 /home/nihat/.ssh


# Set file permissions
RUN chmod 644 /etc/passwd && \
    chmod 640 /etc/shadow

# Logging setup
RUN echo 'auth,authpriv.*    /var/log/honeypot/auth.log' >> /etc/rsyslog.conf && \
    echo '*.info;mail.none;authpriv.none;cron.none    /var/log/honeypot/messages' >> /etc/rsyslog.conf && \
    mkdir -p /var/log/honeypot && \
    touch /var/log/honeypot/auth.log /var/log/honeypot/messages /var/log/honeypot/commands.log && \
    chmod 666 /var/log/honeypot/commands.log

# Create command logging setup with a custom bash wrapper
RUN echo '#!/bin/bash' > /usr/local/bin/honeypot_shell.sh && \
    echo 'LOGFILE="/var/log/honeypot/commands.log"' >> /usr/local/bin/honeypot_shell.sh && \
    echo 'echo "$(date +%Y-%m-%d\ %H:%M:%S) Session started for user $USER from $SSH_CLIENT" >> $LOGFILE' >> /usr/local/bin/honeypot_shell.sh && \
    echo 'export PS1="$USER@honeypot:~$ "' >> /usr/local/bin/honeypot_shell.sh && \
    echo 'while true; do' >> /usr/local/bin/honeypot_shell.sh && \
    echo '  read -e -p "$PS1" cmd' >> /usr/local/bin/honeypot_shell.sh && \
    echo '  if [[ "$cmd" == "exit" ]]; then' >> /usr/local/bin/honeypot_shell.sh && \
    echo '    echo "$(date +%Y-%m-%d\ %H:%M:%S) $USER: exit" >> $LOGFILE' >> /usr/local/bin/honeypot_shell.sh && \
    echo '    break' >> /usr/local/bin/honeypot_shell.sh && \
    echo '  fi' >> /usr/local/bin/honeypot_shell.sh && \
    echo '  if [[ -n "$cmd" ]]; then' >> /usr/local/bin/honeypot_shell.sh && \
    echo '    echo "$(date +%Y-%m-%d\ %H:%M:%S) $USER: $cmd" >> $LOGFILE' >> /usr/local/bin/honeypot_shell.sh && \
    echo '    eval "$cmd"' >> /usr/local/bin/honeypot_shell.sh && \
    echo '  fi' >> /usr/local/bin/honeypot_shell.sh && \
    echo 'done' >> /usr/local/bin/honeypot_shell.sh && \
    chmod +x /usr/local/bin/honeypot_shell.sh

# Configure SSH to use our custom shell
RUN echo 'ForceCommand /usr/local/bin/honeypot_shell.sh' >> /etc/ssh/sshd_config

EXPOSE 22
CMD rsyslogd && sleep 2 && /usr/sbin/sshd -D
