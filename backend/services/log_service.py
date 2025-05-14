import requests
from datetime import datetime
from database import SessionLocal
from models.models import Logs, NetworkLogs
import json
import pandas as pd
import os
import csv
from io import StringIO
from math import ceil
from sqlalchemy.orm import Query
from models.models import VerifiedIP
from fastapi.responses import StreamingResponse
import time

FIELD_MAPPING = {
    "Source IP": "src_ip",
    "Destination IP": "dst_ip",
    "Source Port": "src_port",
    "Destination Port": "dst_port",
    "Source MAC": "src_mac",
    "Destination MAC": "dst_mac",
    "Protocol": "protocol",
    "Timestamp": "timestamp",
    # ...existing field mappings...
}

CICFLOW_FIELDS = list(FIELD_MAPPING.keys())

ES_URL = "http://localhost:9200/cicflow-*/_search"

def fetch_logs():
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

def process_csv_file(file, orgId):
    with SessionLocal() as db:
        try:
            content = file.file.read().decode("utf-8")
            csv_reader = csv.DictReader(StringIO(content))
            csv_reader.fieldnames = [name.strip() for name in csv_reader.fieldnames]
            for row in csv_reader:
                network_log = NetworkLogs(
                    dst_port=int(row.get("Destination Port", 0)),
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
                    idle_min=float(row.get("Idle Min", 0)),
                    organization_id=orgId  # <-- Set the organization ID here
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
def get_log_by_id(log_id: int, orgId: int):
    """Get a single network log by its ID and orgId"""
    with SessionLocal() as db:
        log = db.query(NetworkLogs).filter(
            NetworkLogs.id == log_id,
            NetworkLogs.organization_id == orgId
        ).first()
        if log:
            return serialize_network_log(log)
        return None

def serialize_network_log(log):
    """
    Serialize a NetworkLogs object into a dictionary with handling for invalid float values.
    """
    def clean_float(value):
        if isinstance(value, float):
            if value in (float('inf'), float('-inf')) or value != value:  # Check for inf and NaN
                return None
        return value

    log_dict = {
        "id": log.id,
        "src_ip": log.src_ip,
        "dst_ip": log.dst_ip,
        "src_port": log.src_port,
        "dst_port": log.dst_port,
        "protocol": log.protocol,
        "timestamp": log.timestamp,
        "src_mac": log.src_mac,
        "dst_mac": log.dst_mac,
        "organization_id": log.organization_id,
        "flow_duration": clean_float(log.flow_duration),
        "total_fwd_packets": log.total_fwd_packets,
        "total_bwd_packets": log.total_bwd_packets,
        "total_length_fwd_packets": clean_float(log.total_length_fwd_packets),
        "total_length_bwd_packets": clean_float(log.total_length_bwd_packets),
        "fwd_packet_length_max": clean_float(log.fwd_packet_length_max),
        "fwd_packet_length_min": clean_float(log.fwd_packet_length_min),
        "fwd_packet_length_mean": clean_float(log.fwd_packet_length_mean),
        "fwd_packet_length_std": clean_float(log.fwd_packet_length_std),
        "bwd_packet_length_max": clean_float(log.bwd_packet_length_max),
        "bwd_packet_length_min": clean_float(log.bwd_packet_length_min),
        "bwd_packet_length_mean": clean_float(log.bwd_packet_length_mean),
        "bwd_packet_length_std": clean_float(log.bwd_packet_length_std),
        "flow_bytes_per_s": clean_float(log.flow_bytes_per_s),
        "flow_packets_per_s": clean_float(log.flow_packets_per_s),
        "flow_iat_mean": clean_float(log.flow_iat_mean),
        "flow_iat_std": clean_float(log.flow_iat_std),
        "flow_iat_max": clean_float(log.flow_iat_max),
        "flow_iat_min": clean_float(log.flow_iat_min),
        "fwd_iat_total": clean_float(log.fwd_iat_total),
        "fwd_iat_mean": clean_float(log.fwd_iat_mean),
        "fwd_iat_std": clean_float(log.fwd_iat_std),
        "fwd_iat_max": clean_float(log.fwd_iat_max),
        "fwd_iat_min": clean_float(log.fwd_iat_min),
        "bwd_iat_total": clean_float(log.bwd_iat_total),
        "bwd_iat_mean": clean_float(log.bwd_iat_mean),
        "bwd_iat_std": clean_float(log.bwd_iat_std),
        "bwd_iat_max": clean_float(log.bwd_iat_max),
        "bwd_iat_min": clean_float(log.bwd_iat_min),
        "fwd_psh_flags": log.fwd_psh_flags,
        "bwd_psh_flags": log.bwd_psh_flags,
        "fwd_urg_flags": log.fwd_urg_flags,
        "bwd_urg_flags": log.bwd_urg_flags,
        "fwd_header_length": log.fwd_header_length,
        "bwd_header_length": log.bwd_header_length,
        "fwd_packets_per_s": clean_float(log.fwd_packets_per_s),
        "bwd_packets_per_s": clean_float(log.bwd_packets_per_s),
        "min_packet_length": clean_float(log.min_packet_length),
        "max_packet_length": clean_float(log.max_packet_length),
        "packet_length_mean": clean_float(log.packet_length_mean),
        "packet_length_std": clean_float(log.packet_length_std),
        "packet_length_variance": clean_float(log.packet_length_variance),
        "down_up_ratio": clean_float(log.down_up_ratio),
        "average_packet_size": clean_float(log.average_packet_size),
        "avg_fwd_segment_size": clean_float(log.avg_fwd_segment_size),
        "avg_bwd_segment_size": clean_float(log.avg_bwd_segment_size),
        "fwd_avg_bytes_bulk": clean_float(log.fwd_avg_bytes_bulk),
        "fwd_avg_packets_bulk": clean_float(log.fwd_avg_packets_bulk),
        "fwd_avg_bulk_rate": clean_float(log.fwd_avg_bulk_rate),
        "bwd_avg_bytes_bulk": clean_float(log.bwd_avg_bytes_bulk),
        "bwd_avg_packets_bulk": clean_float(log.bwd_avg_packets_bulk),
        "bwd_avg_bulk_rate": clean_float(log.bwd_avg_bulk_rate)
    }
    return log_dict

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
        return {"logs": logs, "totalPages": total_pages, "total_count": total_logs}  # Return serialized logs and total pages

def fetch_cicflow_logs_from_es(orgId: int, size: int = 1000, from_time=None):
    """Fetch CICFlow logs from ES and store in DB"""
    with SessionLocal() as db:
        print("Fetching CICFlow logs from Elasticsearch and storing in DB...")

        verified_ips = {
            row.ip for row in db.query(VerifiedIP.ip)
            .filter_by(organization_id=orgId, is_verified=True)
            .all()
        }
        if not verified_ips:
            print("No verified IPs found for orgId", orgId)
            return []

        query = {
            "size": size,
            "query": {"match_all": {}},
            "sort": [{"@timestamp": "desc"}]
        }

        if from_time:
            query["query"]["bool"] = {"filter": [{"range": {"@timestamp": {"gte": from_time}}}]}

        headers = {"Content-Type": "application/json"}
        try:
            response = requests.get(ES_URL, json=query, headers=headers)
            response.raise_for_status()
        except Exception as e:
            print("Error querying Elasticsearch:", str(e))
            return []

        hits = response.json().get("hits", {}).get("hits", [])
        stored_logs = []

        for hit in hits:
            source = hit.get("_source", {})
            src_ip = source.get("src_ip")
            dst_ip = source.get("dst_ip")

            if src_ip not in verified_ips and dst_ip not in verified_ips:
                continue

            excluded_fields = {"src_ip", "dst_ip", "src_port", "dst_port", "protocol", "timestamp", "src_mac", "dst_mac"}

            db_entry = NetworkLogs(
                src_ip=source.get("src_ip"),
                dst_ip=source.get("dst_ip"),
                src_port=source.get("src_port"),
                dst_port=source.get("dst_port"),
                protocol=source.get("protocol"),
                timestamp=source.get("timestamp"),
                src_mac=source.get("src_mac"),
                dst_mac=source.get("dst_mac"),
                organization_id=orgId,
                **{
                    field_mapping_val: source.get(field_mapping_val)
                    for field_mapping_val in FIELD_MAPPING.values()
                    if field_mapping_val not in excluded_fields and hasattr(NetworkLogs, field_mapping_val)
                }
            )

            exists = db.query(NetworkLogs).filter(
                NetworkLogs.timestamp == source.get("timestamp"),
                NetworkLogs.src_ip == source.get("src_ip"),
                NetworkLogs.dst_ip == source.get("dst_ip"),
                NetworkLogs.organization_id == orgId
            ).first()
            
            if exists:
                continue

            db.add(db_entry)
            stored_logs.append(db_entry)

        db.commit()
        print(f"Stored {len(stored_logs)} logs for org {orgId}")
        return stored_logs

def export_cicflow_logs_to_csv(orgId: int):
    """Export CICFlow logs to a CSV file for download"""
    logs = fetch_cicflow_logs_from_es(orgId=orgId, size=1000)
    
    if isinstance(logs, dict) and "error" in logs:
        return {"error": logs["error"]}
    
    csv_buffer = StringIO()
    fieldnames = list(FIELD_MAPPING.keys())
    writer = csv.DictWriter(csv_buffer, fieldnames=fieldnames)
    writer.writeheader()
    
    with SessionLocal() as db:
        logs = db.query(NetworkLogs).filter(
            NetworkLogs.src_ip.in_([log.src_ip for log in logs])
        ).order_by(NetworkLogs.timestamp.desc()).all()
        
        for log in logs:
            row = {
                display_name: getattr(log, es_field, None)
                for display_name, es_field in FIELD_MAPPING.items()
            }
            writer.writerow(row)
    
    csv_buffer.seek(0)
    
    return StreamingResponse(
        iter([csv_buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=cicflow_logs_{time.strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )

def get_logs_from_db(orgId: int):
    """Get network logs from DB for a specific organization"""
    with SessionLocal() as db:
        verified_ips = {
            ip for (ip,) in db.query(VerifiedIP.ip)
            .filter(VerifiedIP.organization_id == orgId, VerifiedIP.is_verified == True)
            .all()
        }

        if not verified_ips:
            return []

        logs = db.query(NetworkLogs).filter(
            NetworkLogs.organization_id == orgId,
            NetworkLogs.src_ip.in_(verified_ips)
        ).order_by(NetworkLogs.timestamp.desc()).limit(500).all()

        results = []
        for row in logs:
            results.append({
                display_name: getattr(row, es_field, None)
                for display_name, es_field in FIELD_MAPPING.items()
            })
            results[-1]["@timestamp"] = row.timestamp

        return results

def fetch_cicflow_logs_for_all_orgs(limit=1000, minutes=5):
    """Fetch CICFlow logs from ES and store in DB for all organizations for the past X minutes"""
    try:
        # Calculate timestamp for X minutes ago
        from_time = datetime.utcnow() - pd.Timedelta(minutes=minutes)
        from_time_str = from_time.strftime("%Y-%m-%dT%H:%M:%S.%fZ")

        query = {
            "size": limit,
            "query": {
                "bool": {
                    "must": [
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": from_time_str
                                }
                            }
                        }
                    ]
                }
            },
            "sort": [{"@timestamp": "desc"}]
        }

        headers = {"Content-Type": "application/json"}
        try:
            response = requests.get(ES_URL, json=query, headers=headers)
            response.raise_for_status()
        except Exception as e:
            print(f"Error querying Elasticsearch: {str(e)}")
            return False

        hits = response.json().get("hits", {}).get("hits", [])
        if not hits:
            print(f"No logs found in Elasticsearch for the past {minutes} minutes")
            return False

        with SessionLocal() as db:
            verified_ips = db.query(VerifiedIP.ip, VerifiedIP.organization_id).filter(
                VerifiedIP.is_verified == True
            ).all()

        if not verified_ips:
            print("No verified IPs found in any organization")
            return False

        ip_org_map = {ip: org_id for ip, org_id in verified_ips}
        org_logs = {}
        
        for hit in hits:
            source = hit.get("_source", {})
            src_ip = source.get("src_ip", "")
            dst_ip = source.get("dst_ip", "")
            
            if isinstance(src_ip, list):
                src_ip = src_ip[0] if src_ip else ""
            if isinstance(dst_ip, list):
                dst_ip = dst_ip[0] if dst_ip else ""
            
            org_id = None
            if src_ip in ip_org_map:
                org_id = ip_org_map[src_ip]
            elif dst_ip in ip_org_map:
                org_id = ip_org_map[dst_ip]
            
            if org_id:
                if org_id not in org_logs:
                    org_logs[org_id] = []
                org_logs[org_id].append(hit)

        with SessionLocal() as db:
            for org_id, logs in org_logs.items():
                stored_count = 0
                for log in logs:
                    source = log.get("_source", {})
                    excluded_fields = {"src_ip", "dst_ip", "src_port", "dst_port", "protocol", "timestamp", "src_mac", "dst_mac"}

                    exists = db.query(NetworkLogs).filter(
                        NetworkLogs.timestamp == source.get("timestamp"),
                        NetworkLogs.src_ip == source.get("src_ip"),
                        NetworkLogs.dst_ip == source.get("dst_ip"),
                        NetworkLogs.organization_id == org_id
                    ).first()
                    
                    if exists:
                        continue

                    db_entry = NetworkLogs(
                        src_ip=source.get("src_ip"),
                        dst_ip=source.get("dst_ip"),
                        src_port=source.get("src_port"),
                        dst_port=source.get("dst_port"),
                        protocol=source.get("protocol"),
                        timestamp=source.get("timestamp"),
                        src_mac=source.get("src_mac"),
                        dst_mac=source.get("dst_mac"),
                        organization_id=org_id,
                        **{
                            field_mapping_val: source.get(field_mapping_val)
                            for field_mapping_val in FIELD_MAPPING.values()
                            if field_mapping_val not in excluded_fields and hasattr(NetworkLogs, field_mapping_val)
                        }
                    )
                    db.add(db_entry)
                    stored_count += 1

                print(f"Stored {stored_count} new logs for organization {org_id}")
            
            db.commit()
        
        return True

    except Exception as e:
        print(f"Error processing logs for all organizations: {str(e)}")
        return False

def delete_network_log(log_id: int):
    with SessionLocal() as db:
        log = db.query(NetworkLogs).filter(NetworkLogs.id == log_id).first()
        if not log:
            return False
        db.delete(log)
        db.commit()
        return True

def delete_network_logs_batch(log_ids: list):
    with SessionLocal() as db:
        logs = db.query(NetworkLogs).filter(NetworkLogs.id.in_(log_ids)).all()
        count = len(logs)
        for log in logs:
            db.delete(log)
        db.commit()
        return count
