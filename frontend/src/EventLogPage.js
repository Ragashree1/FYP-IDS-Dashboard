import { useState, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import React from 'react';
import Sidebar from "./Sidebar" // Import the Sidebar component

const EventLogPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [filterType, setFilterType] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Determine the user role - this could come from your auth context or localStorage
  const userRole = "network-admin"

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


  // Updated filter logic to filter rows based on both filter type and search query
  const filteredLogs = useMemo(() => {
    if (!filterType && !searchQuery) {
      return logs
    }

    return logs.filter((log) => {
      const query = searchQuery.toLowerCase()

      // If we have a filter type but no search query, show all logs
      if (filterType && !searchQuery) {
        return true
      }

      // If we have a search query but no filter type, search across all fields
      if (searchQuery && !filterType) {
        return (
          log.type.toLowerCase().includes(query) ||
          log.name.toLowerCase().includes(query) ||
          log.dateTime.toLowerCase().includes(query) ||
          log.sourceIP.toLowerCase().includes(query) ||
          log.destinationIP.toLowerCase().includes(query) ||
          (log.logSource && log.logSource.toLowerCase().includes(query))
        )
      }

      // If we have both filter type and search query, search only in the specified field
      switch (filterType.toLowerCase()) {
        case "type":
          return log.type.toLowerCase().includes(query)
        case "name":
          return log.name.toLowerCase().includes(query)
        case "date & time":
          return log.dateTime.toLowerCase().includes(query)
        case "source ip":
          return log.sourceIP.toLowerCase().includes(query)
        case "destination ip":
          return log.destinationIP.toLowerCase().includes(query)
        case "log source":
          return log.logSource && log.logSource.toLowerCase().includes(query)
        default:
          return false
      }
    })
  }, [logs, filterType, searchQuery])

  // Always show all columns
  const allColumns = ["type", "name", "dateTime", "logSource", "sourceIP", "destinationIP", "eventCount"]

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f4f4f4",
        overflow: "hidden", // Added to prevent horizontal scrolling
      }}
    >
      {/* Use the Sidebar component */}
      <Sidebar userRole={userRole} />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto", // Allow vertical scrolling
          overflowX: "hidden", // Prevent horizontal scrolling
        }}
      >
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
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{filteredLogs.length}</p>
        </div>

        {/* Search and Filter */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            alignItems: "stretch",
            flexWrap: "wrap", // Added to prevent overflow on small screens
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
              boxSizing: "border-box", // Added to prevent overflow
            }}
          >
            <option value="">Filter By (All Fields)</option>
            <option value="Type">Type</option>
            <option value="Name">Name</option>
            <option value="Date & Time">Date & Time</option>
            <option value="Log Source">Log Source</option>
            <option value="Source IP">Source IP</option>
            <option value="Destination IP">Destination IP</option>
          </select>
          <div
            style={{
              flex: 1,
              display: "flex",
              position: "relative",
              maxWidth: "400px",
              boxSizing: "border-box", // Added to prevent overflow
            }}
          >
            <input
              type="text"
              placeholder={filterType ? `Search by ${filterType}...` : "Search all fields..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                boxSizing: "border-box", // Added to prevent overflow
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
            overflow: "auto", // Changed from "hidden" to "auto" to allow scrolling if needed
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            maxWidth: "100%", // Added to prevent overflow
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Type</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Date & Time</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Log Source</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Source IP</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Destination IP</th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #eee" }}>Event Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  }}
                >
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.type}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.name}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.dateTime}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.logSource}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.sourceIP}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{log.destinationIP}</td>
                  <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                    {log.eventCount}
                  </td>
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

