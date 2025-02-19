"use client"

import { useState, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const EventLogPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [filterType, setFilterType] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const isActive = (path) => location.pathname.startsWith(path)

  const handleLogout = () => {
    navigate("/login")
  }

  const logs = [
    {
      type: "User Login Request",
      name: "User Dumb logins",
      dateTime: "12/03/2025 02:56 PM",
      logSource: "",
      sourceIP: "1:11:111:1111",
      destinationIP: "2:22:222:2222",
      eventCount: 1,
    },
    {
      type: "Login Request",
      name: "User Login Request ...",
      dateTime: "12/03/2025 02:57 PM",
      logSource: "",
      sourceIP: "2:22:222:2222",
      destinationIP: "1:11:111:1111",
      eventCount: 1,
    },
    {
      type: "User Login Request",
      name: "User Stoopid logins",
      dateTime: "12/03/2025 05:12 PM",
      logSource: "",
      sourceIP: "3:33:333:3333",
      destinationIP: "2:22:222:2222",
      eventCount: 1,
    },
    {
      type: "Login Request",
      name: "User Login Request ...",
      dateTime: "12/03/2025 05:13 PM",
      logSource: "",
      sourceIP: "2:22:222:2222",
      destinationIP: "3:33:333:3333",
      eventCount: 1,
    },
    {
      type: "Connection Request",
      name: "Connection request...",
      dateTime: "12/03/2025 06:01 PM",
      logSource: "",
      sourceIP: "1:11:111:1111",
      destinationIP: "4:44:444:4444",
      eventCount: 4,
    },
    {
      type: "Connection Accepted",
      name: "Connection Accepted",
      dateTime: "12/03/2025 06:05 PM",
      logSource: "",
      sourceIP: "4:44:444:4444",
      destinationIP: "1:11:111:1111",
      eventCount: 1,
    },
    {
      type: "Get Request",
      name: "Server receives Ge...",
      dateTime: "12/03/2025 06:07 PM",
      logSource: "DownloadAVirus.com",
      sourceIP: "1:11:111:1111",
      destinationIP: "4:44:444:4444",
      eventCount: 1,
    },
    {
      type: "Get Request",
      name: "Get Request Acce...",
      dateTime: "12/03/2025 06:08 PM",
      logSource: "",
      sourceIP: "4:44:444:4444",
      destinationIP: "1:11:111:1111",
      eventCount: 1,
    },
    {
      type: "Post Request",
      name: "Server receives Pos...",
      dateTime: "12/03/2025 06:10 PM",
      logSource: "HackMySever.com",
      sourceIP: "1:11:111:1111",
      destinationIP: "4:44:444:4444",
      eventCount: 1,
    },
    {
      type: "Post Request",
      name: "Get Request Denied",
      dateTime: "12/03/2025 06:11 PM",
      logSource: "",
      sourceIP: "4:44:444:4444",
      destinationIP: "1:11:111:1111",
      eventCount: 1,
    },
  ]

  // Filter logs based on search query
  const searchedLogs = useMemo(() => {
    if (!searchQuery) return logs

    return logs.filter((log) => {
      const query = searchQuery.toLowerCase()
      return (
        log.type.toLowerCase().includes(query) ||
        log.name.toLowerCase().includes(query) ||
        log.dateTime.toLowerCase().includes(query) ||
        log.sourceIP.toLowerCase().includes(query) ||
        log.destinationIP.toLowerCase().includes(query) ||
        log.logSource.toLowerCase().includes(query)
      )
    })
  }, [searchQuery])

  // Get visible columns based on filter type
  const getVisibleColumns = () => {
    switch (filterType.toLowerCase()) {
      case "type":
        return ["type"]
      case "name":
        return ["name"]
      case "date & time":
        return ["dateTime"]
      case "source ip":
        return ["sourceIP"]
      case "destination ip":
        return ["destinationIP"]
      default:
        return ["type", "name", "dateTime", "logSource", "sourceIP", "destinationIP", "eventCount"]
    }
  }

  const visibleColumns = getVisibleColumns()

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f4f4f4" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          background: "#222",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2>SecuBoard</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li
            style={{
              padding: "10px",
              background: isActive("/dashboard") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/dashboard")}
          >
            <img
              src="/images/dashboard-logo.png"
              alt="Dashboard Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Dashboard
          </li>
          <li
            style={{
              padding: "10px",
              background: isActive("/offences") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/offences")}
          >
            <img
              src="/images/offences-logo.png"
              alt="Offences Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Offences
          </li>
          <li
            style={{
              padding: "10px",
              background: isActive("/event-log") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/event-log")}
          >
            <img
              src="/images/event-log-logo.png"
              alt="Event Log Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Event Log Activity
          </li>
          <li
            style={{
              padding: "10px",
              background: isActive("/reports") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/reports")}
          >
            <img
              src="/images/report-logo.png"
              alt="Reports Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Reports
          </li>
          <li
            style={{
              padding: "10px",
              background: isActive("/settings") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/settings")}
          >
            <img
              src="/images/settings-logo.png"
              alt="Settings Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Settings
          </li>
        </ul>
        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            width: "100%",
            padding: "10px",
            background: "red",
            border: "none",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <img
            src="/images/logout-logo.png"
            alt="Logout Logo"
            style={{ width: "20px", height: "20px", marginRight: "10px" }}
          />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Logs Interface</h1>

        {/* Statistics */}
        <div
          style={{
            background: "#999",
            padding: "15px",
            borderRadius: "8px",
            color: "white",
            display: "inline-block",
            marginBottom: "20px",
          }}
        >
          <p style={{ margin: 0 }}>Total Logs:</p>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{searchedLogs.length}</p>
        </div>

        {/* Search and Filter */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            alignItems: "stretch",
          }}
        >
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              minWidth: "150px",
            }}
          >
            <option value="">Select Filter Type</option>
            <option value="Type">Type</option>
            <option value="Name">Name</option>
            <option value="Date & Time">Date & Time</option>
            <option value="Source IP">Source IP</option>
            <option value="Destination IP">Destination IP</option>
          </select>
          <div
            style={{
              flex: 1,
              display: "flex",
              position: "relative",
              maxWidth: "400px",
            }}
          >
            <input
              type="text"
              placeholder="Enter search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
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
              }}
            >
              🔍
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                {visibleColumns.includes("type") && (
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Type</th>
                )}
                {visibleColumns.includes("name") && (
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Name</th>
                )}
                {visibleColumns.includes("dateTime") && (
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Date & Time</th>
                )}
                {visibleColumns.includes("logSource") && (
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Log Source</th>
                )}
                {visibleColumns.includes("sourceIP") && (
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Source IP</th>
                )}
                {visibleColumns.includes("destinationIP") && (
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Destination IP</th>
                )}
                {visibleColumns.includes("eventCount") && (
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #eee" }}>Event Count</th>
                )}
              </tr>
            </thead>
            <tbody>
              {searchedLogs.map((log, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  }}
                >
                  {visibleColumns.includes("type") && (
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.type}</td>
                  )}
                  {visibleColumns.includes("name") && (
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.name}</td>
                  )}
                  {visibleColumns.includes("dateTime") && (
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.dateTime}</td>
                  )}
                  {visibleColumns.includes("logSource") && (
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.logSource}</td>
                  )}
                  {visibleColumns.includes("sourceIP") && (
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.sourceIP}</td>
                  )}
                  {visibleColumns.includes("destinationIP") && (
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.destinationIP}</td>
                  )}
                  {visibleColumns.includes("eventCount") && (
                    <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                      {log.eventCount}
                    </td>
                  )}
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

