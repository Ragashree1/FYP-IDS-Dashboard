import { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from 'axios';
import Sidebar from "./Sidebar"
import { checkPermissions, fetchUserRole } from "./utils/check_permissions"

const permission = "Event Logs"

  
const PermissionDeniedPopup = () => (
  <div className="permission-popup-overlay">
    <div className="success-popup">
      <div className="success-popup-header">
        <div className="success-popup-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <circle cx="12" cy="16" r="1"></circle>
          </svg>
        </div>
        <div className="success-popup-title">PERMISSION DENIED</div>
      </div>
      <div className="success-popup-content">
        <div className="success-popup-message">
          You do not have permission to view this page.
        </div>
      </div>
    </div>
  </div>
);


const EventLogPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [filterType, setFilterType] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Fetch logs from backend
  useEffect(() => {
    axios.get('http://localhost:8000/logs')
      .then(response => {
        setLogs(response.data);
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching logs:', error);
        setError('Failed to fetch logs');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const verifyPermissions = async () => {
      const allowed = await checkPermissions(permission);
      setHasPermission(allowed);
      if (!allowed) {
        setShowWarning(true);
      }
    };

    verifyPermissions();
  }, []);
  
  const getUserRole = async () => {
    const role  = await fetchUserRole();
    setUserRole(role);
    if (!role) {
      setError("Failed to fetch user role for Sidebar");
    }
  };
  
  useEffect(() => {
    getUserRole();
  }, []);
  
  


  // Updated filter logic
  const filteredLogs = useMemo(() => {
    if (!filterType && !searchQuery) {
      return logs
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

  if (!hasPermission) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar userRole={userRole} />
        <div style={{ flex: 1, position: 'relative' }}>
          {showWarning && <PermissionDeniedPopup />}
        </div>
      </div>
    );
  }
  
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
        width: "100%", // Ensure the input takes full width of the parent
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxSizing: "border-box", // Include padding in width calculation
      }}
    />
    <button 
      style={{
        position: "absolute",
        right: "8px",
        top: "50%",
        transform: "translateY(-50%)", // Center the button vertically
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0", // Optional: Adjust padding for better alignment
      }}
    >
      🔍
    </button>
  </div>
        </div>

        {/* Logs Table */}
        <div style={{ width: "100%", maxHeight: "700px", overflowY: "auto" }}>
          <table
            style={{
              width: "100%",
              background: "#fff",
              borderCollapse: "collapse",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              minWidth: "800px"
            }}
          >
            <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 2, boxShadow: "0 2px 2px rgba(0,0,0,0.1)" }}>
              <tr style={{ background: "#ccc", borderBottom: "2px solid #aaa" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Type</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Message</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Date & Time</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Source IP</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Host</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>HTTP Method</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>HTTP Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.log_type}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.message}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.source_ip}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.host}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.http_method || 'N/A'}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.http_status || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EventLogPage

