import pandas as pd
from scapy.all import rdpcap, TCP, IP
from collections import defaultdict
import statistics
import os

# Read the PCAP file
packets = rdpcap('/home/raga/captured.pcap')

# A dictionary to track flow information
flows = defaultdict(lambda: defaultdict(int))

# For storing extracted data
packet_data = []

# Process packets
for pkt in packets:
    if pkt.haslayer(IP) and pkt.haslayer(TCP):
        ip_src = pkt[IP].src
        ip_dst = pkt[IP].dst
        tcp_src_port = pkt[TCP].sport
        tcp_dst_port = pkt[TCP].dport
        protocol = "TCP"
        ttl_src = pkt[IP].ttl
        ttl_dst = pkt[IP].ttl
        
        # Calculate flow direction (source -> destination vs. destination -> source)
        flow_id = (ip_src, tcp_src_port, ip_dst, tcp_dst_port)  # Identify flow
        
        # Track the first and last timestamps of the flow
        if flow_id not in flows:
            flows[flow_id]['start_time'] = pkt.time  # Record the start time for the flow
        
        flows[flow_id]['end_time'] = pkt.time  # Update the end time with each new packet
        
        # Track packet counts and byte counts for the flow
        if pkt[IP].src == ip_src:
            flows[flow_id]["sbytes"] += len(pkt)
            flows[flow_id]["Spkts"] += 1
        else:
            flows[flow_id]["dbytes"] += len(pkt)
            flows[flow_id]["Dpkts"] += 1
        
        # TCP Flags and state tracking
        if pkt.haslayer(TCP):
            tcp_flags = pkt[TCP].flags
            flows[flow_id]["swin"] = pkt[TCP].window  # Source TCP window
            flows[flow_id]["dwin"] = pkt[TCP].window  # Destination TCP window
            if tcp_flags & 0x02:  # SYN flag
                flows[flow_id]["state"] = "SYN"
            elif tcp_flags & 0x10:  # ACK flag
                flows[flow_id]["state"] = "ACK"
            elif tcp_flags & 0x01:  # FIN flag
                flows[flow_id]["state"] = "FIN"

        flow_duration = flows[flow_id]['end_time'] - flows[flow_id]['start_time']
        if flow_duration > 0:
            flows[flow_id]["sload"] = (flows[flow_id]["sbytes"] * 8) / flow_duration  # Source load (bits per second)
            flows[flow_id]["dload"] = (flows[flow_id]["dbytes"] * 8) / flow_duration  # Destination load (bits per second)
        
        # Calculate mean packet size
        flows[flow_id]["smeansz"] = flows[flow_id]["sbytes"] / flows[flow_id]["Spkts"] if flows[flow_id]["Spkts"] > 0 else 0
        flows[flow_id]["dmeansz"] = flows[flow_id]["dbytes"] / flows[flow_id]["Dpkts"] if flows[flow_id]["Dpkts"] > 0 else 0
        
        if "timestamps" not in flows[flow_id]:
            flows[flow_id]["timestamps"] = []
        flows[flow_id]["timestamps"].append(pkt.time)
        if len(flows[flow_id]["timestamps"]) > 1:
            jitters = [flows[flow_id]["timestamps"][i] - flows[flow_id]["timestamps"][i-1] for i in range(1, len(flows[flow_id]["timestamps"]))]
            flows[flow_id]["sjit"] = statistics.stdev(jitters) if len(jitters) > 1 else 0
        
        if "src_timestamps" not in flows[flow_id]:
            flows[flow_id]["src_timestamps"] = []
        if "dst_timestamps" not in flows[flow_id]:
            flows[flow_id]["dst_timestamps"] = []

        if pkt[IP].src == ip_src:
            flows[flow_id]["src_timestamps"].append(pkt.time)
        else:
            flows[flow_id]["dst_timestamps"].append(pkt.time)

        def mean_interarrival(times):
            if len(times) > 1:
                return statistics.mean([t2 - t1 for t1, t2 in zip(times[:-1], times[1:])])
            return 0

        


        
        # Save extracted flow information
        packet_info = {
            "srcip": ip_src,
            "sport": tcp_src_port,
            "dstip": ip_dst,
            "dsport": tcp_dst_port,
            "proto": protocol,
            "sttl": ttl_src,
            "dttl": ttl_dst,
            "sbytes": flows[flow_id]["sbytes"],
            "dbytes": flows[flow_id]["dbytes"],
            "Spkts": flows[flow_id]["Spkts"],
            "Dpkts": flows[flow_id]["Dpkts"],
            "swin": flows[flow_id]["swin"],
            "dwin": flows[flow_id]["dwin"],
            "state": flows[flow_id].get("state", ""),
            "dur": flows[flow_id]['end_time'] - flows[flow_id]['start_time'],
            "sload": flows[flow_id]["sload"],
            "dload": flows[flow_id]["dload"],
            "smeansz": flows[flow_id]["smeansz"],
            "dmeansz": flows[flow_id]["dmeansz"],
            "sjit": flows[flow_id]["sjit"],
            "stime": flows[flow_id]['start_time'],
            "ltime": flows[flow_id]['end_time'],

        }

        packet_info["Sintpkt"] = mean_interarrival(flows[flow_id]["src_timestamps"])
        packet_info["Dintpkt"] = mean_interarrival(flows[flow_id]["dst_timestamps"])

        # Store TCP SYN/SYN-ACK/ACK timestamps per flow
        if "syn_time" not in flows[flow_id] and tcp_flags & 0x02:
            flows[flow_id]["syn_time"] = pkt.time
        elif "synack_time" not in flows[flow_id] and tcp_flags & 0x12:  # SYN-ACK (SYN + ACK)
            flows[flow_id]["synack_time"] = pkt.time
        elif "ack_time" not in flows[flow_id] and tcp_flags & 0x10:
            flows[flow_id]["ack_time"] = pkt.time

        # Estimate times
        synack = flows[flow_id].get("synack_time", 0) - flows[flow_id].get("syn_time", 0)
        ackdat = flows[flow_id].get("ack_time", 0) - flows[flow_id].get("synack_time", 0)
        tcprtt = flows[flow_id].get("ack_time", 0) - flows[flow_id].get("syn_time", 0)

        packet_info["tcprtt"] = tcprtt if tcprtt > 0 else 0
        packet_info["synack"] = synack if synack > 0 else 0
        packet_info["ackdat"] = ackdat if ackdat > 0 else 0

        packet_info["is_sm_ips_ports"] = int(ip_src == ip_dst and tcp_src_port == tcp_dst_port)
        state_ttl = (flows[flow_id].get("state", ""), ttl_src)
        flows[flow_id]["ct_state_ttl"] = flows[flow_id].get("ct_state_ttl", 0) + 1
        packet_info["ct_state_ttl"] = flows[flow_id]["ct_state_ttl"]
        
        
        packet_data.append(packet_info)

# Convert to a pandas DataFrame
df = pd.DataFrame(packet_data)

# Save to CSV
df.to_csv('/home/raga/extracted_packet_data.csv', index=False)

print("Packet data has been saved to extracted_packet_data.csv")
