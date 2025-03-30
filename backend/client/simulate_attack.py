#!/usr/bin/env python3

from scapy.all import *
import argparse
import random
import time
import ipaddress

def validate_ip(ip):
    try:
        ipaddress.ip_address(ip)
        return True
    except ValueError:
        return False

def icmp_flood(target_ip, count=50):
    print(f"[!] Sending ICMP flood to {target_ip}")
    for _ in range(count):
        pkt = IP(dst=target_ip)/ICMP()
        try:
            send(pkt, verbose=False)
        except Exception as e:
            print(f"[!] Error sending ICMP packet: {e}")
        time.sleep(0.01)  # Add delay

def syn_scan(target_ip, ports=range(20, 30)):
    print(f"[!] Performing SYN scan on {target_ip}")
    for port in ports:
        pkt = IP(dst=target_ip)/TCP(dport=port, flags='S')
        try:
            send(pkt, verbose=False)
        except Exception as e:
            print(f"[!] Error sending SYN packet to port {port}: {e}")
        time.sleep(0.2)

def udp_flood(target_ip, count=50):
    print(f"[!] Sending UDP packets to {target_ip}")
    for _ in range(count):
        port = random.randint(1, 65535)  # Randomize port
        pkt = IP(dst=target_ip)/UDP(dport=port)/Raw(load="AttackTest")
        try:
            send(pkt, verbose=False)
        except Exception as e:
            print(f"[!] Error sending UDP packet to port {port}: {e}")
        time.sleep(0.01)  # Add delay

def http_get_flood(target_ip, count=30):
    print(f"[!] Sending fake HTTP GETs to {target_ip}")
    for _ in range(count):
        pkt = IP(dst=target_ip)/TCP(dport=80, flags="S")  # Initiates connection
        try:
            send(pkt, verbose=False)
        except Exception as e:
            print(f"[!] Error sending HTTP GET packet: {e}")
        time.sleep(0.01)  # Add delay

def main():
    print("[!] WARNING: This script is for authorized testing purposes only.")
    print("[!] Ensure you have explicit permission to run this script on the target system.")

    parser = argparse.ArgumentParser(description="Simulate multiple attack types to trigger Snort")
    parser.add_argument("victim_ip", help="IP address of the target machine (victim)")
    args = parser.parse_args()
    target_ip = args.victim_ip

    if not validate_ip(target_ip):
        print("[!] Invalid IP address provided.")
        return

    print("[*] Starting attack simulation...")

    icmp_flood(target_ip)
    syn_scan(target_ip)
    udp_flood(target_ip)
    http_get_flood(target_ip)

    print("Attack simulation complete. Check Snort logs for alerts.")

if __name__ == "__main__":
    main()
