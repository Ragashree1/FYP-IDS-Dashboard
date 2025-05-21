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
  const [logType, setLogType] = useState("network"); // New state for log type
  const [currentPage, setCurrentPage] = useState(1); // New state for pagination
  const [totalPages, setTotalPages] = useState(1); // New state for total pages
  const fileInputRef = useRef(null);
  const [selectedLogs, setSelectedLogs] = useState([]); // New state for selected logs
  const [totalCount, setTotalCount] = useState(0);

  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    if (!filterType && !searchQuery) {
      return logs;
    }

    return logs.filter((log) => {
      const query = searchQuery.toLowerCase();

      // If we have a filter type but no search query, return all logs
      if (filterType && !searchQuery) {
        return true;
      }

      // If we have a search query but no filter type, search across all relevant fields
      if (searchQuery && !filterType) {
        if (logType === "apache") {
          return (
            log.log_type?.toLowerCase().includes(query) ||
            log.message?.toLowerCase().includes(query) ||
            (log.timestamp && new Date(log.timestamp).toLocaleString().toLowerCase().includes(query)) ||
            log.source_ip?.toLowerCase().includes(query) ||
            log.host?.toLowerCase().includes(query) ||
            (log.http_method && log.http_method.toLowerCase().includes(query)) ||
            (log.http_status && String(log.http_status).toLowerCase().includes(query))
          );
        } else { // network logs
          return (
            log.src_ip?.toLowerCase().includes(query) ||
            log.dst_ip?.toLowerCase().includes(query) ||
            String(log.dst_port)?.includes(query) ||
            String(log.flow_duration)?.includes(query) ||
            String(log.total_fwd_packets)?.includes(query) ||
            String(log.total_bwd_packets)?.includes(query)
          );
        }
      }

      // Apply specific filters based on filter type
      switch (filterType.toLowerCase()) {
        case "source ip":
          return log.src_ip?.toLowerCase().includes(query);
        case "destination ip":
          return log.dst_ip?.toLowerCase().includes(query);
        case "destination port":
          return String(log.dst_port)?.includes(query);
        case "flow duration":
          return String(log.flow_duration)?.includes(query);
        case "packets":
          return (
            String(log.total_fwd_packets)?.includes(query) ||
            String(log.total_bwd_packets)?.includes(query)
          );
        // Apache log specific filters
        case "type":
          return logType === "apache" && log.log_type?.toLowerCase().includes(query);
        case "message":
          return logType === "apache" && log.message?.toLowerCase().includes(query);
        case "date & time":
          return logType === "apache" && log.timestamp && 
            new Date(log.timestamp).toLocaleString().toLowerCase().includes(query);
        case "host":
          return logType === "apache" && log.host?.toLowerCase().includes(query);
        case "http method":
          return logType === "apache" && log.http_method?.toLowerCase().includes(query);
        case "http status":
          return logType === "apache" && String(log.http_status)?.includes(query);
        default:
          return false;
      }
    });
  }, [logs, filterType, searchQuery, logType]);

  const currentPageLogIds = useMemo(() => filteredLogs.map(log => log.id), [filteredLogs]);
  const userRole = "2"
  const API_BASE_URL = "https://api.secuboard.live";

  const isAllSelected = currentPageLogIds.length > 0 && currentPageLogIds.every(id => selectedLogs.includes(id));
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLogs(prev => prev.filter(id => !currentPageLogIds.includes(id)));
    } else {
      setSelectedLogs(prev => Array.from(new Set([...prev, ...currentPageLogIds])));
    }
  };

  const handleDownloadLogs = async () => {
    try {
      const orgId = await getOrgId();
      if (!orgId) {
        alert("Could not determine organization ID. Unable to download logs.");
        return;
      }
      const downloadUrl = `${API_BASE_URL}/logs/networkLogs/export/${orgId}`;
      // Trigger file download
      window.location.href = downloadUrl;
    } catch (error) {
      console.error("Error preparing log download:", error);
      alert("Failed to initiate log download.");
    }
  };


  const handleDeleteSelected = async () => {
    if (selectedLogs.length === 0) {
      alert("Please select at least one log to delete.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete the selected logs? This action cannot be undone.")) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/logs/networkLogs/batch`, {
        data: { log_ids: selectedLogs }
      });
      setLogs(prev => prev.filter(log => !selectedLogs.includes(log.id)));
      setSelectedLogs([]);
      alert("Selected logs deleted successfully.");
    } catch (error) {
      console.error("Error deleting logs:", error);
      alert("Failed to delete selected logs.");
    }
  };

  // Delete a single log
  const handleDeleteSingle = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this log?")) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/logs/networkLogs/${logId}`);
      setLogs(prev => prev.filter(log => log.id !== logId));
      setSelectedLogs(prev => prev.filter(id => id !== logId));
      alert("Log deleted successfully.");
    } catch (error) {
      console.error("Error deleting log:", error);
      alert("Failed to delete log.");
    }
  };

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
          setTotalCount(Array.isArray(data) ? data.length : 0);
        } else {
          setLogs(Array.isArray(data.logs) ? data.logs : []); // Ensure logs is an array
          setTotalPages(data.totalPages || 1); // Set total pages for network logs
          setTotalCount(data.total_count || 0);
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
      // Get orgId from backend (reuse your getOrgId function)
      const orgId = await getOrgId();
      if (!orgId) {
        alert("Could not determine organization ID.");
        return;
      }
      const response = await axios.post(
        `http://localhost:8000/logs/upload?orgId=${orgId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    }
  };

  

  const handleLogSelection = (logId) => {
    setSelectedLogs((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    );
  };

  const getOrgId = async () => {
    const token = localStorage.getItem("token");
    console.log("printing token ")
    console.log(token)
    const response = await fetch(`${API_BASE_URL}/login/get_user`, {
      headers : { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) { 
      return null;
    }
    const data = await response.json();
    console.log("printing data")
    console.log(data)
    return data.user.organization_id;}

  const handlePredict = async () => {
    if (selectedLogs.length === 0) {
      alert("Please select at least one log to predict.");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8000/threat/predict/batch', {
        log_ids: selectedLogs.map((id) => parseInt(id, 0)),
        organization_id: await getOrgId(),
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
            <option value="network">Network Logs</option>
            <option value="apache">Apache Logs</option>
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
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{logType === "network" ? totalCount : filteredLogs.length}</p>
        </div>


        {/* Search and Filter */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Filter By (All Fields)</option>
            {logType === "apache" ? (
              <>
                <option value="Type">Type</option>
                <option value="Message">Message</option>
                <option value="Date & Time">Date & Time</option>
                <option value="Source IP">Source IP</option>
                <option value="Host">Host</option>
                <option value="http method">HTTP Method</option>
                <option value="http status">HTTP Status</option>
              </>
            ) : (
              <>
                <option value="Source IP">Source IP</option>
                <option value="Destination IP">Destination IP</option>
                <option value="Destination Port">Destination Port</option>
                <option value="Flow Duration">Flow Duration</option>
                <option value="Packets">Packets (Fwd/Bwd)</option>
              </>
            )}
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
   {/* Left side: Clear + Predict + Delete */}
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
                  marginRight: "10px",
                }}
              >
                Predict Selected Logs
              </button>
              {/* <button
                onClick={handleDeleteSelected}
                style={{
                  padding: "10px 20px",
                  background: "#ff5722",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete Selected Logs
              </button> */}
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
      <button
        onClick={handleDownloadLogs}
        style={{
          padding: "10px 20px",
          background: "#17a2b8", // A different color for download
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Download Logs
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
                 <input
                   type="checkbox"
                   checked={isAllSelected}
                   onChange={handleSelectAll}
                   aria-label="Select all logs on this page"
                 /> Select
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
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Source IP</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Destination IP</th>
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
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Actions</th>
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
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.src_ip}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.dst_ip}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.dst_port}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.flow_duration}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.total_fwd_packets}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.total_bwd_packets}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.total_length_fwd_packets}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.total_length_bwd_packets}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.fwd_packet_length_mean}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.bwd_packet_length_mean}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.flow_bytes_per_s}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.flow_packets_per_s}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    <button
                      onClick={() => handleDeleteSingle(log.id)}
                      style={{
                        padding: "6px 12px",
                        background: "#ff5722",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
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
            <form
      onSubmit={e => {
        e.preventDefault();
        const page = Number(e.target.elements.gotoPage.value);
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
      }}
      style={{ display: "flex", alignItems: "center", gap: "5px" }}
    >
      <label htmlFor="gotoPage" style={{ marginLeft: "10px" }}>Go to page:</label>
      <input
        id="gotoPage"
        name="gotoPage"
        type="number"
        min={1}
        max={totalPages}
        defaultValue={currentPage}
        style={{ width: "60px", padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      <button
        type="submit"
        style={{
          padding: "5px 12px",
          background: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Go
      </button>
    </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventLogPage

