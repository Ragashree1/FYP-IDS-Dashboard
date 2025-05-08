import requests
from datetime import datetime
from database import SessionLocal
from models.models import Logs, NetworkLogs
import json
from apscheduler.schedulers.background import BackgroundScheduler
import pandas as pd
import os
import csv
from io import StringIO
from math import ceil
from sqlalchemy.orm import Query
from models.models import VerifiedIP

def preprocess_and_store_network_logs(pcapLogsHits):
    """
    Preprocess and store packetbeat logs into the NetworkLogs table, extracting all 45 features for ML.
    """
    with SessionLocal() as db:
        for log in pcapLogsHits:
            source = log.get('_source', {})
            
            # Extract basic fields
            timestamp = source.get('@timestamp')
            server = source.get('server')
            agent = source.get('agent')
            destination = source.get('destination', {})
            source_data = source.get('source', {})
            network = source.get('network', {})
            service = source.get('network', {}).get('protocol', {})
            http = source.get('http', {})
            icmp = source.get('icmp', {})
            flow = source.get('flow', {})
            
            # Extract features
            srcip = source_data.get('ip')
            sport = source_data.get('port')
            dstip = destination.get('ip')
            dsport = destination.get('port')
            proto = network.get('transport')
            state = flow.get('final')
            dur = flow.get('duration')
            sbytes = source_data.get('bytes')
            dbytes = destination.get('bytes')
            sttl = source_data.get('ttl')
            dttl = destination.get('ttl')
            sloss = source_data.get('loss')
            dloss = destination.get('loss')
            swin = source_data.get('tcp', {}).get('window')
            dwin = destination.get('tcp', {}).get('window')
            stcpb = source_data.get('tcp', {}).get('base_sequence_number')
            dtcpb = destination.get('tcp', {}).get('base_sequence_number')
            spkts = source_data.get('packets')
            dpkts = destination.get('packets')
            smeansz = sbytes / spkts if spkts else None
            dmeansz = dbytes / dpkts if dpkts else None
            trans_depth = http.get('request', {}).get('depth')
            res_bdy_len = http.get('response', {}).get('body', {}).get('bytes')
            ct_state_ttl = None  # Requires aggregation
            ct_flw_http_mthd = None  # Requires aggregation
            ct_ftp_cmd = None  # Requires aggregation
            ct_srv_src = None  # Requires aggregation
            ct_srv_dst = None  # Requires aggregation
            ct_dst_ltm = None  # Requires aggregation
            ct_src_ltm = None  # Requires aggregation
            ct_src_dport_ltm = None  # Requires aggregation
            ct_dst_sport_ltm = None  # Requires aggregation
            ct_dst_src_ltm = None  # Requires aggregation
            is_sm_ips_ports = 1 if srcip == dstip and sport == dsport else 0
            is_ftp_login = None  # Requires FTP-specific data
            stime = source.get('event', {}).get('start')
            ltime = source.get('event', {}).get('end')
            synack = None  # Requires TCP handshake data
            ackdat = None  # Requires TCP handshake data
            sjit = source_data.get('jitter')
            djit = destination.get('jitter')
            sintpkt = source_data.get('interpacket')
            dintpkt = destination.get('interpacket')
            tcprtt = synack + ackdat if synack and ackdat else None
            # service = source.get('service', {}).get('name')
            # flags = tcp_source.get('flags', []) or tcp_dest.get('flags', [])

            # Create a NetworkLogs object
            network_log = NetworkLogs(
                timestamp=timestamp,
                server=server,
                agent=agent,
                destination=destination,
                source=source_data,
                type=source.get('type'),
                icmp=icmp,
                network=network,
                path=source.get('path'),
                related=source.get('related'),
                ecs=source.get('ecs'),
                host=source.get('host'),
                client=source.get('client'),
                event=source.get('event'),
                status=source.get('status'),
                flow=flow,
                method=http.get('request', {}).get('method'),
                query=http.get('request', {}).get('query'),
                url=http.get('request', {}).get('url'),
                user_agent=source.get('user_agent'),
                http=http,
                # Add extracted features
                srcip=srcip,
                sport=sport,
                dstip=dstip,
                dsport=dsport,
                proto=proto,
                state=state,
                dur=dur,
                sbytes=sbytes,
                dbytes=dbytes,
                sttl=sttl,
                dttl=dttl,
                sloss=sloss,
                dloss=dloss,
                swin=swin,
                dwin=dwin,
                stcpb=stcpb,
                dtcpb=dtcpb,
                spkts=spkts,
                dpkts=dpkts,
                smeansz=smeansz,
                dmeansz=dmeansz,
                trans_depth=trans_depth,
                res_bdy_len=res_bdy_len,
                ct_state_ttl=ct_state_ttl,
                ct_flw_http_mthd=ct_flw_http_mthd,
                ct_ftp_cmd=ct_ftp_cmd,
                ct_srv_src=ct_srv_src,
                ct_srv_dst=ct_srv_dst,
                ct_dst_ltm=ct_dst_ltm,
                ct_src_ltm=ct_src_ltm,
                ct_src_dport_ltm=ct_src_dport_ltm,
                ct_dst_sport_ltm=ct_dst_sport_ltm,
                ct_dst_src_ltm=ct_dst_src_ltm,
                is_sm_ips_ports=is_sm_ips_ports,
                is_ftp_login=is_ftp_login,
                stime=stime,
                ltime=ltime,
                synack=synack,
                ackdat=ackdat,
                sjit=sjit,
                djit=djit,
                sintpkt=sintpkt,
                dintpkt=dintpkt,
                tcprtt=tcprtt,
                service=service
            )
            db.add(network_log)
        db.commit()

def fetch_logs():
    # es_url = "http://localhost:9200/packetbeat-*/_search"
    # response = requests.get(es_url)
    # pcapLogsHits = response.json().get('hits', {}).get('hits', [])
    
    # preprocess_and_store_network_logs(pcapLogsHits)
    
    # df = pd.DataFrame(hit['_source'] for hit in pcapLogsHits)
    # file_path = 'output.txt'
    # include_index = not os.path.exists(file_path) or os.stat(file_path).st_size == 0
    # with open('/home/raga/Desktop/fyp/backend/services/output.txt', 'a') as f:
    #     f.write(df.to_string(index=include_index))
    #     f.write('\n')
    # print(df.head())
    # print(df.columns)
    
    es_url = "http://localhost:9200/apache-*/_search"
    query = {
        "size": 100,
        "query": {"match_all": {}},
        "sort": [{"@timestamp": "desc"}]
    }
    
    headers = {"Content-Type": "application/json"}
    response = requests.get(es_url, json=query, headers=headers)
    logs = response.json().get('hits', {}).get('hits', [])
    
    return logs

def get_last_log_time():
    with SessionLocal() as db:
        last_log = db.query(Logs).order_by(Logs.timestamp.desc()).first()
        return last_log.timestamp if last_log else None

def preprocess_log(log):
    try:
        source = log['_source']
        return {
            "timestamp": source['@timestamp'],
            "log_type": source['fields']['log_type'],
            "source_ip": source['source']['address'],
            "host": source['host']['ip'][0],
            "message": source['message'],
            "event_data": {
                "original": source['event']['original'],
                "os": source['host']['os'],
                "hostname": source['host']['hostname']
            },
            "http_method": source['http']['request']['method'],
            "http_status": source['http']['response']['status_code'],
            "url": source['url']['original'],
            "user_agent": source['user_agent']['original'],
            "log_path": source['log']['file']['path']
        }
    except (KeyError, IndexError) as e:
        print(f"Skipping log due to error: {e}")
        return None

def save_logs(logs):
    print('bef save logs')
    with SessionLocal() as db:
        for log in logs:
            preprocessed_log = preprocess_log(log)
            if preprocessed_log:
                db_log = Logs(**preprocessed_log)
                db.add(db_log)
        db.commit()

def update_and_fetch_logs():
    print('bef update and fetch logs')
    last_log_time = get_last_log_time()
    logs = fetch_logs()
    
    new_logs = []
    for log in logs:
        log_time = datetime.strptime(log['_source']['@timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ")
        if not last_log_time or log_time > last_log_time:
            new_logs.append(log)
    
    save_logs(new_logs)
    
    with SessionLocal() as db:
        return db.query(Logs).all() or []  # Ensure a list is returned

def process_csv_file(file):
    with SessionLocal() as db:
        try:
            content = file.file.read().decode("utf-8")
            csv_reader = csv.DictReader(StringIO(content))
            
            # Strip spaces from column names
            csv_reader.fieldnames = [name.strip() for name in csv_reader.fieldnames]
            
            for row in csv_reader:
                network_log = NetworkLogs(
                    # timestamp=row.get("timestamp"),
                    dstport=int(row.get("Destination Port", 0)),
                    flow_duration=int(row.get("Flow Duration", 0)),
                    total_fwd_packets=int(row.get("Total Fwd Packets", 0)),
                    total_bwd_packets=int(row.get("Total Backward Packets", 0)),
                    total_length_fwd_packets=float(row.get("Total Length of Fwd Packets", 0)),
                    total_length_bwd_packets=float(row.get("Total Length of Bwd Packets", 0)),
                    fwd_packet_length_max=float(row.get("Fwd Packet Length Max", 0)),
                    fwd_packet_length_min=float(row.get("Fwd Packet Length Min", 0)),
                    fwd_packet_length_mean=float(row.get("Fwd Packet Length Mean", 0)),
                    fwd_packet_length_std=float(row.get("Fwd Packet Length Std", 0)),
                    bwd_packet_length_max=float(row.get("Bwd Packet Length Max", 0)),
                    bwd_packet_length_min=float(row.get("Bwd Packet Length Min", 0)),
                    bwd_packet_length_mean=float(row.get("Bwd Packet Length Mean", 0)),
                    bwd_packet_length_std=float(row.get("Bwd Packet Length Std", 0)),
                    flow_bytes_per_s=float(row.get("Flow Bytes/s", 0)),
                    flow_packets_per_s=float(row.get("Flow Packets/s", 0)),
                    flow_iat_mean=float(row.get("Flow IAT Mean", 0)),
                    flow_iat_std=float(row.get("Flow IAT Std", 0)),
                    flow_iat_max=float(row.get("Flow IAT Max", 0)),
                    flow_iat_min=float(row.get("Flow IAT Min", 0)),
                    fwd_iat_total=float(row.get("Fwd IAT Total", 0)),
                    fwd_iat_mean=float(row.get("Fwd IAT Mean", 0)),
                    fwd_iat_std=float(row.get("Fwd IAT Std", 0)),
                    fwd_iat_max=float(row.get("Fwd IAT Max", 0)),
                    fwd_iat_min=float(row.get("Fwd IAT Min", 0)),
                    bwd_iat_total=float(row.get("Bwd IAT Total", 0)),
                    bwd_iat_mean=float(row.get("Bwd IAT Mean", 0)),
                    bwd_iat_std=float(row.get("Bwd IAT Std", 0)),
                    bwd_iat_max=float(row.get("Bwd IAT Max", 0)),
                    bwd_iat_min=float(row.get("Bwd IAT Min", 0)),
                    fwd_psh_flags=int(row.get("Fwd PSH Flags", 0)),
                    bwd_psh_flags=int(row.get("Bwd PSH Flags", 0)),
                    fwd_urg_flags=int(row.get("Fwd URG Flags", 0)),
                    bwd_urg_flags=int(row.get("Bwd URG Flags", 0)),
                    fwd_header_length=int(row.get("Fwd Header Length", 0)),
                    bwd_header_length=int(row.get("Bwd Header Length", 0)),
                    fwd_packets_per_s=float(row.get("Fwd Packets/s", 0)),
                    bwd_packets_per_s=float(row.get("Bwd Packets/s", 0)),
                    min_packet_length=float(row.get("Min Packet Length", 0)),
                    max_packet_length=float(row.get("Max Packet Length", 0)),
                    packet_length_mean=float(row.get("Packet Length Mean", 0)),
                    packet_length_std=float(row.get("Packet Length Std", 0)),
                    packet_length_variance=float(row.get("Packet Length Variance", 0)),
                    fin_flag_count=int(row.get("FIN Flag Count", 0)),
                    syn_flag_count=int(row.get("SYN Flag Count", 0)),
                    rst_flag_count=int(row.get("RST Flag Count", 0)),
                    psh_flag_count=int(row.get("PSH Flag Count", 0)),
                    ack_flag_count=int(row.get("ACK Flag Count", 0)),
                    urg_flag_count=int(row.get("URG Flag Count", 0)),
                    cwe_flag_count=int(row.get("CWE Flag Count", 0)),
                    ece_flag_count=int(row.get("ECE Flag Count", 0)),
                    down_up_ratio=float(row.get("Down/Up Ratio", 0)),
                    average_packet_size=float(row.get("Average Packet Size", 0)),
                    avg_fwd_segment_size=float(row.get("Avg Fwd Segment Size", 0)),
                    avg_bwd_segment_size=float(row.get("Avg Bwd Segment Size", 0)),
                    fwd_avg_bytes_bulk=float(row.get("Fwd Avg Bytes/Bulk", 0)),
                    fwd_avg_packets_bulk=float(row.get("Fwd Avg Packets/Bulk", 0)),
                    fwd_avg_bulk_rate=float(row.get("Fwd Avg Bulk Rate", 0)),
                    bwd_avg_bytes_bulk=float(row.get("Bwd Avg Bytes/Bulk", 0)),
                    bwd_avg_packets_bulk=float(row.get("Bwd Avg Packets/Bulk", 0)),
                    bwd_avg_bulk_rate=float(row.get("Bwd Avg Bulk Rate", 0)),
                    subflow_fwd_packets=int(row.get("Subflow Fwd Packets", 0)),
                    subflow_fwd_bytes=int(row.get("Subflow Fwd Bytes", 0)),
                    subflow_bwd_packets=int(row.get("Subflow Bwd Packets", 0)),
                    subflow_bwd_bytes=int(row.get("Subflow Bwd Bytes", 0)),
                    init_win_bytes_forward=int(row.get("Init_Win_bytes_forward", 0)),
                    init_win_bytes_backward=int(row.get("Init_Win_bytes_backward", 0)),
                    act_data_pkt_fwd=int(row.get("act_data_pkt_fwd", 0)),
                    min_seg_size_forward=int(row.get("min_seg_size_forward", 0)),
                    active_mean=float(row.get("Active Mean", 0)),
                    active_std=float(row.get("Active Std", 0)),
                    active_max=float(row.get("Active Max", 0)),
                    active_min=float(row.get("Active Min", 0)),
                    idle_mean=float(row.get("Idle Mean", 0)),
                    idle_std=float(row.get("Idle Std", 0)),
                    idle_max=float(row.get("Idle Max", 0)),
                    idle_min=float(row.get("Idle Min", 0))
                )
                db.add(network_log)
            db.commit()
            print('CSV file processed and data stored successfully.')
            return {"message": "CSV file processed and data stored successfully."}
        except Exception as e:
            db.rollback()
            print(f"Error processing CSV file: {e}")
            return {"error": str(e)}

def get_network_logs():
    """
    Fetch all network logs from the database.
    """
    with SessionLocal() as db:
        return db.query(NetworkLogs).all()

def serialize_network_log(log):
    """
    Serialize a NetworkLogs object into a dictionary.
    """
    return {
        "id": log.id,
        "dstport": log.dstport,
        "flow_duration": log.flow_duration,
        "total_fwd_packets": log.total_fwd_packets,
        "total_bwd_packets": log.total_bwd_packets,
        "total_length_fwd_packets": log.total_length_fwd_packets,
        "total_length_bwd_packets": log.total_length_bwd_packets,
        "fwd_packet_length_max": log.fwd_packet_length_max,
        "fwd_packet_length_min": log.fwd_packet_length_min,
        "fwd_packet_length_mean": log.fwd_packet_length_mean,
        "fwd_packet_length_std": log.fwd_packet_length_std,
        "bwd_packet_length_max": log.bwd_packet_length_max,
        "bwd_packet_length_min": log.bwd_packet_length_min,
        "bwd_packet_length_mean": log.bwd_packet_length_mean,
        "bwd_packet_length_std": log.bwd_packet_length_std,
        "flow_bytes_per_s": log.flow_bytes_per_s,
        "flow_packets_per_s": log.flow_packets_per_s,
        "flow_iat_mean": log.flow_iat_mean,
        "flow_iat_std": log.flow_iat_std,
        "flow_iat_max": log.flow_iat_max,
        "flow_iat_min": log.flow_iat_min,
        "fwd_iat_total": log.fwd_iat_total,
        "fwd_iat_mean": log.fwd_iat_mean,
        "fwd_iat_std": log.fwd_iat_std,
        "fwd_iat_max": log.fwd_iat_max,
        "fwd_iat_min": log.fwd_iat_min,
        "bwd_iat_total": log.bwd_iat_total,
        "bwd_iat_mean": log.bwd_iat_mean,
        "bwd_iat_std": log.bwd_iat_std,
        "bwd_iat_max": log.bwd_iat_max,
        "bwd_iat_min": log.bwd_iat_min,
        "fwd_psh_flags": log.fwd_psh_flags,
        "bwd_psh_flags": log.bwd_psh_flags,
        "fwd_urg_flags": log.fwd_urg_flags,
        "bwd_urg_flags": log.bwd_urg_flags,
        "fwd_header_length": log.fwd_header_length,
        "bwd_header_length": log.bwd_header_length,
        "fwd_packets_per_s": log.fwd_packets_per_s,
        "bwd_packets_per_s": log.bwd_packets_per_s,
        "min_packet_length": log.min_packet_length,
        "max_packet_length": log.max_packet_length,
        "packet_length_mean": log.packet_length_mean,
        "packet_length_std": log.packet_length_std,
        "packet_length_variance": log.packet_length_variance,
        "fin_flag_count": log.fin_flag_count,
        "syn_flag_count": log.syn_flag_count,
        "rst_flag_count": log.rst_flag_count,
        "psh_flag_count": log.psh_flag_count,
        "ack_flag_count": log.ack_flag_count,
        "urg_flag_count": log.urg_flag_count,
        "cwe_flag_count": log.cwe_flag_count,
        "ece_flag_count": log.ece_flag_count,
        "down_up_ratio": log.down_up_ratio,
        "average_packet_size": log.average_packet_size,
        "avg_fwd_segment_size": log.avg_fwd_segment_size,
        "avg_bwd_segment_size": log.avg_bwd_segment_size,
        "fwd_avg_bytes_bulk": log.fwd_avg_bytes_bulk,
        "fwd_avg_packets_bulk": log.fwd_avg_packets_bulk,
        "fwd_avg_bulk_rate": log.fwd_avg_bulk_rate,
        "bwd_avg_bytes_bulk": log.bwd_avg_bytes_bulk,
        "bwd_avg_packets_bulk": log.bwd_avg_packets_bulk,
        "bwd_avg_bulk_rate": log.bwd_avg_bulk_rate,
        "subflow_fwd_packets": log.subflow_fwd_packets,
        "subflow_fwd_bytes": log.subflow_fwd_bytes,
        "subflow_bwd_packets": log.subflow_bwd_packets,
        "subflow_bwd_bytes": log.subflow_bwd_bytes,
        "init_win_bytes_forward": log.init_win_bytes_forward,
        "init_win_bytes_backward": log.init_win_bytes_backward,
        "act_data_pkt_fwd": log.act_data_pkt_fwd,
        "min_seg_size_forward": log.min_seg_size_forward,
        "active_mean": log.active_mean,
        "active_std": log.active_std,
        "active_max": log.active_max,
        "active_min": log.active_min,
        "idle_mean": log.idle_mean,
        "idle_std": log.idle_std,
        "idle_max": log.idle_max,
        "idle_min": log.idle_min,
    }

def get_paginated_network_logs(page: int, page_size: int):
    """
    Fetch paginated network logs from the database.
    """
    with SessionLocal() as db:
        total_logs = db.query(NetworkLogs).count()
        total_pages = ceil(total_logs / page_size)
        offset = (page - 1) * page_size
        logs_query: Query = db.query(NetworkLogs).order_by(NetworkLogs.id.desc()).offset(offset).limit(page_size)
        logs = [serialize_network_log(log) for log in logs_query]  # Serialize logs
        return {"logs": logs, "totalPages": total_pages}  # Return serialized logs and total pages

FIELD_MAPPING = {
    "Source IP": "src_ip",
    "Destination IP": "dst_ip",
    "Source Port": "src_port",
    "Destination Port": "dst_port",
    "Source MAC": "src_mac",
    "Destination MAC": "dst_mac",
    "Protocol": "protocol",
    "Timestamp": "timestamp",
    "Flow Duration": "flow_duration",
    "Total Fwd Packets": "tot_fwd_pkts",
    "Total Backward Packets": "tot_bwd_pkts",
    "Total Length of Fwd Packets": "totlen_fwd_pkts",
    "Total Length of Bwd Packets": "totlen_bwd_pkts",
    "Fwd Packet Length Max": "fwd_pkt_len_max",
    "Fwd Packet Length Min": "fwd_pkt_len_min",
    "Fwd Packet Length Mean": "fwd_pkt_len_mean",
    "Fwd Packet Length Std": "fwd_pkt_len_std",
    "Bwd Packet Length Max": "bwd_pkt_len_max",
    "Bwd Packet Length Min": "bwd_pkt_len_min",
    "Bwd Packet Length Mean": "bwd_pkt_len_mean",
    "Bwd Packet Length Std": "bwd_pkt_len_std",
    "Flow Bytes/s": "flow_byts_s",
    "Flow Packets/s": "flow_pkts_s",
    "Flow IAT Mean": "flow_iat_mean",
    "Flow IAT Std": "flow_iat_std",
    "Flow IAT Max": "flow_iat_max",
    "Flow IAT Min": "flow_iat_min",
    "Fwd IAT Total": "fwd_iat_tot",
    "Fwd IAT Mean": "fwd_iat_mean",
    "Fwd IAT Std": "fwd_iat_std",
    "Fwd IAT Max": "fwd_iat_max",
    "Fwd IAT Min": "fwd_iat_min",
    "Bwd IAT Total": "bwd_iat_tot",
    "Bwd IAT Mean": "bwd_iat_mean",
    "Bwd IAT Std": "bwd_iat_std",
    "Bwd IAT Max": "bwd_iat_max",
    "Bwd IAT Min": "bwd_iat_min",
    "Fwd PSH Flags": "fwd_psh_flags",
    "Bwd PSH Flags": "bwd_psh_flags",
    "Fwd URG Flags": "fwd_urg_flags",
    "Bwd URG Flags": "bwd_urg_flags",
    "Fwd Header Length": "fwd_header_len",
    "Bwd Header Length": "bwd_header_len",
    "Fwd Packets/s": "fwd_pkts_s",
    "Bwd Packets/s": "bwd_pkts_s",
    "Min Packet Length": "pkt_len_min",
    "Max Packet Length": "pkt_len_max",
    "Packet Length Mean": "pkt_len_mean",
    "Packet Length Std": "pkt_len_std",
    "Packet Length Variance": "pkt_len_var",
    "FIN Flag Count": "fin_flag_cnt",
    "SYN Flag Count": "syn_flag_cnt",
    "RST Flag Count": "rst_flag_cnt",
    "PSH Flag Count": "psh_flag_cnt",
    "ACK Flag Count": "ack_flag_cnt",
    "URG Flag Count": "urg_flag_cnt",
    "CWE Flag Count": "cwe_flag_count",
    "ECE Flag Count": "ece_flag_cnt",
    "Down/Up Ratio": "down_up_ratio",
    "Average Packet Size": "pkt_size_avg",
    "Avg Fwd Segment Size": "fwd_seg_size_avg",
    "Avg Bwd Segment Size": "bwd_seg_size_avg",
    "Fwd Avg Bytes/Bulk": "fwd_byts_b_avg",
    "Fwd Avg Packets/Bulk": "fwd_pkts_b_avg",
    "Fwd Avg Bulk Rate": "fwd_blk_rate_avg",
    "Bwd Avg Bytes/Bulk": "bwd_byts_b_avg",
    "Bwd Avg Packets/Bulk": "bwd_pkts_b_avg",
    "Bwd Avg Bulk Rate": "bwd_blk_rate_avg",
    "Subflow Fwd Packets": "subflow_fwd_pkts",
    "Subflow Fwd Bytes": "subflow_fwd_byts",
    "Subflow Bwd Packets": "subflow_bwd_pkts",
    "Subflow Bwd Bytes": "subflow_bwd_byts",
    "Init_Win_bytes_forward": "init_fwd_win_byts",
    "Init_Win_bytes_backward": "init_bwd_win_byts",
    "act_data_pkt_fwd": "fwd_act_data_pkts",
    "min_seg_size_forward": "fwd_seg_size_min",
    "Active Mean": "active_mean",
    "Active Std": "active_std",
    "Active Max": "active_max",
    "Active Min": "active_min",
    "Idle Mean": "idle_mean",
    "Idle Std": "idle_std",
    "Idle Max": "idle_max",
    "Idle Min": "idle_min"
}

CICFLOW_FIELDS = list(FIELD_MAPPING.keys())


def fetch_cicflow_logs_from_es(size=500, from_time=None, orgId=None):

    ES_URL = "http://localhost:9200/cicflow-*/_search"

    with SessionLocal() as db:
        print("Fetching cicflow logs from Elasticsearch...")

        query = {
            "size": size,
            "query": {
                "bool": {
                    "must": [{"match_all": {}}]
                }
            },
            "sort": [{"@timestamp": "desc"}]
        }
        
        # Add time filter if specified
        if from_time:
            query["query"]["bool"]["filter"] = [
                {"range": {"@timestamp": {"gte": from_time}}}
            ]

        verified_ips = []
        if orgId and db:
            verified_ips = db.query(VerifiedIP.ip).filter(
                VerifiedIP.organization_id == orgId,
                VerifiedIP.is_verified == True
            ).all()
            verified_ips = [ip for (ip,) in verified_ips]

        headers = {"Content-Type": "application/json"}

        try:
            response = requests.get(ES_URL, json=query, headers=headers)
            response.raise_for_status()
            hits = response.json().get("hits", {}).get("hits", [])

            verified_ips = {
                row.ip for row in db.query(VerifiedIP.ip)
                .filter_by(organization_id=orgId, is_verified=True)
                .all()
            }

            if not verified_ips:
                return []

            logs = []

            for hit in hits:
                source = hit.get("_source", {})
                if source.get("src_ip") not in verified_ips:
                    continue

                log_entry = {
                    display_name: source.get(es_field, None)
                    for display_name, es_field in FIELD_MAPPING.items()
                }
                
                # Add timestamp for sorting and filtering
                log_entry["@timestamp"] = source.get("@timestamp", "")
                logs.append(log_entry)

            return logs
        except Exception as e:
            return {"error": str(e)}
