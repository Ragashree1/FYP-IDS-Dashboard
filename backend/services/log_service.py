import requests

def fetch_logs():
    es_url = "http://localhost:9200/snort-logs-*/_search"  # Match all timestamped indices
    query = {
        "size": 100,  # Fetch up to 100 logs (adjust as needed)
        "query": {"match_all": {}},  # Fetch all logs
        "sort": [{"@timestamp": "desc"}]  # Sort by most recent logs
    }
    
    headers = {"Content-Type": "application/json"}
    response = requests.get(es_url, json=query, headers=headers)
    
    return response.json()
