#!/bin/bash
LOGFILE="/var/log/honeypot/commands.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') $USER@$PWD: $@" >> $LOGFILE
exec "$@"
