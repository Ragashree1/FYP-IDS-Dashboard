import { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import React from 'react';
import axios from 'axios';
import Sidebar from "./Sidebar"

const EventLogPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [filterType, setFilterType] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logType, setLogType] = useState("apache"); // New state for log type
  const [currentPage, setCurrentPage] = useState(1); // New state for pagination
  const [totalPages, setTotalPages] = useState(1); // New state for total pages
  const fileInputRef = useRef(null);
  const [selectedLogs, setSelectedLogs] = useState([]); // New state for selected logs

  const userRole = "2"

  // Fetch logs based on log type and page
  useEffect(() => {
    setLoading(true);
    const endpoint = logType === "apache"
      ? 'http://localhost:8000/logs'
      : `http://localhost:8000/logs/networkLogs?page=${currentPage}&page_size=10`; // Add page_size parameter
    axios.get(endpoint)
      .then(response => {
        const data = response.data;
        if (logType === "apache") {
          setLogs(Array.isArray(data) ? data : []); // Ensure logs is an array
        } else {
          setLogs(Array.isArray(data.logs) ? data.logs : []); // Ensure logs is an array
          setTotalPages(data.totalPages || 1); // Set total pages for network logs
        }
      })
      .catch(error => {
        console.error('Error fetching logs:', error);
        setError('Failed to fetch logs');
        setLogs([]); // Reset logs to an empty array on error
      })
      .finally(() => {
        setLoading(false);
      });
  }, [logType, currentPage]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post('http://localhost:8000/logs/upload', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    }
  };

  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logs)) return []; // Ensure logs is an array
    if (!filterType && !searchQuery) {
      return logs;
    }

    return logs.filter((log) => {
      const query = searchQuery.toLowerCase()

      if (filterType && !searchQuery) {
        return true
      }

      if (searchQuery && !filterType) {
        return (
          log.log_type.toLowerCase().includes(query) ||
          log.message.toLowerCase().includes(query) ||
          (new Date(log.timestamp).toLocaleString()).toLowerCase().includes(query) ||
          log.source_ip.toLowerCase().includes(query) ||
          log.host.toLowerCase().includes(query) ||
          (log.http_method && log.http_method.toLowerCase().includes(query)) ||
          (log.http_status && String(log.http_status).toLowerCase().includes(query))
        )
      }

      switch (filterType.toLowerCase()) {
        case "type":
          return log.log_type.toLowerCase().includes(query)
        case "message":
          return log.message.toLowerCase().includes(query)
        case "date & time":
          return (new Date(log.timestamp).toLocaleString()).toLowerCase().includes(query)
        case "source ip":
          return log.source_ip.toLowerCase().includes(query)
        case "host":
          return log.host.toLowerCase().includes(query)
        case "http method":
          return log.http_method && log.http_method.toLowerCase().includes(query)
        case "http status":
          return log.http_status && String(log.http_status).toLowerCase().includes(query)

        default:
          return false
      }
    })
  }, [logs, filterType, searchQuery])

  const handleLogSelection = (logId) => {
    setSelectedLogs((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    );
  };

  const handlePredict = async () => {
    if (selectedLogs.length === 0) {
      alert("Please select at least one log to predict.");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8000/threat/predict/batch', {
        log_ids: selectedLogs.map((id) => parseInt(id, 0)),
      });
      const results = response.data;
      const success = results.filter((r) => !r.error);
      const errors = results.filter((r) => r.error);
  
      let message = "";
      if (success.length > 0) {
        message += `Predictions:\n${success.map((r) => `Log ID: ${r.log_id}, Prediction: ${r.prediction}`).join("\n")}\n`;
      }
      if (errors.length > 0) {
        message += `Errors:\n${errors.map((r) => `Log ID: ${r.log_id}, Error: ${r.error}`).join("\n")}`;
      }
      alert(message);
    } catch (error) {
      console.error("Error predicting threats:", error);
      alert("Failed to predict threats.");
    }
  };

  const clearSelection = () => {
    setSelectedLogs([]);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f4f4f4" }}>
      <Sidebar userRole={userRole} />

      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Logs Interface</h1>

        {/* Log Type Selector */}
        <div style={{ marginBottom: "20px" }}>
          <select
            value={logType}
            onChange={(e) => {
              setLogType(e.target.value);
              setCurrentPage(1); // Reset to first page when log type changes
            }}
            style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="apache">Apache Logs</option>
            <option value="network">Network Logs</option>
          </select>
        </div>

        {/* Statistics */}
        <div style={{
          background: "#999",
          padding: "15px",
          borderRadius: "8px",
          color: "white",
          display: "inline-block",
          marginBottom: "20px",
        }}>
          <p style={{ margin: 0 }}>Total Logs:</p>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{filteredLogs.length}</p>
        </div>


        {/* Search and Filter */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Filter By (All Fields)</option>
            <option value="Type">Type</option>
            <option value="Message">Message</option>
            <option value="Date & Time">Date & Time</option>
            <option value="Source IP">Source IP</option>
            <option value="Host">Host</option>
            <option value="http method">HTTP Method</option>
            <option value="http status">HTTP Status</option>
          </select>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              placeholder={filterType ? `Search by ${filterType}...` : "Search all fields..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            />
            <button 
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
              }}
            >
              🔍
            </button>
          </div>
        </div>

        {logType === "network" && (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    }}
  >
    {/* Left side: Clear + Predict */}
    <div>
      <button
        onClick={clearSelection}
        style={{
          padding: "10px 20px",
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginRight: "10px",
        }}
      >
        Clear Selection
      </button>
      <button
        onClick={handlePredict}
        style={{
          padding: "10px 20px",
          background: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Predict Selected Logs
      </button>
    </div>

    {/* Right side: Upload CSV */}
    <div>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        style={{
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Upload CSV
      </button>
    </div>
  </div>
)}


        {/* Logs Table */}
        <div style={{ width: "100%", maxHeight: "700px", overflowY: "auto" }}>
          <table
            style={{
              width: "100%",
              background: "#fff",
              borderCollapse: "collapse",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              minWidth: "800px",
            }}
          >
            <thead>
              <tr>
                {logType === "network" && (
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>
                    Select
                  </th>
                )}
                {logType === "apache" ? (
                  <>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Type</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Message</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Date & Time</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Source IP</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Host</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>HTTP Method</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>HTTP Status</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Destination Port</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Flow Duration</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Total Fwd Packets</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Total Bwd Packets</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Total Length Fwd Packets</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Total Length Bwd Packets</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Fwd Packet Length Mean</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Bwd Packet Length Mean</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Flow Bytes/s</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Flow Packets/s</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                  {logType === "network" && (
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log.id)}
                        onChange={() => handleLogSelection(log.id)}
                      />
                    </td>
                  )}
                  {logType === "apache" ? (
                    <>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.log_type}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.message}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.source_ip}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.host}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.http_method || 'N/A'}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.http_status || 'N/A'}</td>
                    </>
                  ) : (
                    <>
                      {/* <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.desip}</td> */}
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.dstport}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.flow_duration}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.total_fwd_packets}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.total_bwd_packets}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.total_length_fwd_packets}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.total_length_bwd_packets}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.fwd_packet_length_mean}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.bwd_packet_length_mean}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.flow_bytes_per_s}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.flow_packets_per_s}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {logType === "network" && (
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: "10px 20px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: "10px 20px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventLogPage

