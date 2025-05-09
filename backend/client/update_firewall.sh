#!/bin/bash

# API URL where blocked IPs are fetched from
API_URL="http://localhost:8000/ip-blocking/blocked-ips-list/"

# Path to the firewall log (optional)
LOG_FILE="/var/log/ids-firewall-update.log"

# Fetch the list of currently blocked IPs from API
BLOCKED_IPS=$(curl -s $API_URL | jq -r '.blocked_ips[]')

# Ensure API request was successful
if [ $? -ne 0 ]; then
    echo "$(date) - API request failed." | tee -a $LOG_FILE
    exit 1
fi

# Get the existing blocked IPs in iptables
EXISTING_IPS=$(sudo iptables -L BLOCKLIST -n | awk '{print $4}' | grep -E '^[0-9]+(\.[0-9]+){3}$')

# Remove IPs that are no longer in the API blocklist
for ip in $EXISTING_IPS; do
    if [[ ! " ${BLOCKED_IPS[@]} " =~ " ${ip} " ]]; then
        echo "$(date) - Removing unblocked IP: $ip" | tee -a $LOG_FILE
        sudo iptables -D BLOCKLIST -s $ip -j DROP
    fi
done

# Ensure BLOCKLIST chain exists
sudo iptables -N BLOCKLIST 2>/dev/null

# Flush existing BLOCKLIST rules
sudo iptables -F BLOCKLIST

# Remove previous references to BLOCKLIST in INPUT to prevent duplication
sudo iptables -D INPUT -j BLOCKLIST 2>/dev/null

# Add new blocked IPs
if [ -n "$BLOCKED_IPS" ]; then
    for ip in $BLOCKED_IPS; do
        echo "$(date) - Blocking IP: $ip" | tee -a $LOG_FILE
        sudo iptables -A BLOCKLIST -s $ip -j DROP
    done
fi

# Reapply BLOCKLIST chain to INPUT
sudo iptables -I INPUT -j BLOCKLIST

# Persist firewall rules so they survive reboots
sudo iptables-save | sudo tee /etc/iptables.rules > /dev/null

echo "$(date) - Firewall updated successfully." | tee -a $LOG_FILE
exit 0
