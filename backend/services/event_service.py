import requests
import pickle
from sqlalchemy.orm import Session
from fastapi import Response
from fastapi.responses import StreamingResponse
from io import BytesIO
from models.models import VerifiedIP
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

ES_URL = "http://localhost:9200/cicflow-*/_search"

def fetch_cicflow_logs_from_es(size=500, from_time=None, orgId=None, db: Session = None):

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

def export_cicflow_logs_to_pkl():
    """Export CICFlow logs to a pickle file for download"""
    logs = fetch_cicflow_logs_from_es(size=1000)  # Get more logs for export
    
    # If there was an error fetching logs
    if isinstance(logs, dict) and "error" in logs:
        return {"error": logs["error"]}
    
    # Create a BytesIO object to store the pickle data
    pkl_bytes = BytesIO()
    
    # Add timestamp to the export data
    export_data = {
        "logs": logs,
        "exported_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "count": len(logs)
    }
    
    # Dump the logs to the BytesIO object
    pickle.dump(export_data, pkl_bytes)
    
    # Seek to the beginning of the BytesIO object
    pkl_bytes.seek(0)
    
    # Return a StreamingResponse with the pickle data
    return StreamingResponse(
        pkl_bytes,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename=cicflow_logs_{time.strftime('%Y%m%d_%H%M%S')}.pkl"}
    )
