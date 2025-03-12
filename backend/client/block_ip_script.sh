#!/bin/bash
BLOCK_LIST_URL="http://your-fastapi-server-ip:8000/ip-blocking/blocked-ips"
API_KEY="YOUR_SECRET_API_KEY"

BLOCKED_IPS=$(curl -s -H "X-API-KEY: $API_KEY" $BLOCK_LIST_URL)

for ip in $BLOCKED_IPS; do
    if ! sudo iptables -C INPUT -s $ip -j DROP 2>/dev/null; then
        sudo iptables -A INPUT -s $ip -j DROP
        echo "Blocked IP: $ip"
    fi
done


#instructions 
#sudo crontab -e
#* * * * * /usr/local/bin/block_ip_script.sh
