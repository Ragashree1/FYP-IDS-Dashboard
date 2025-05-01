"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import Sidebar from "./Sidebar"

const userRole = "2"

const EventLogPage = () => {
  const [filterType, setFilterType] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedColumns, setSelectedColumns] = useState([])
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [liveUpdate, setLiveUpdate] = useState(true)
  const [lastTimestamp, setLastTimestamp] = useState(null)

  const orgId = localStorage.getItem("orgId");

  // Function to fetch logs
  const fetchLogs = useCallback(async (fromTime = null) => {
    try {
      const params = { size: 500 }
      if (fromTime) {
        params.from_time = fromTime
      }

      params.orgId = orgId

      const response = await axios.get("http://localhost:8000/events", { params })

      if (fromTime) {
        // If we're doing a live update, prepend new logs to the existing ones
        setLogs((prevLogs) => {
          const newLogs = [...response.data, ...prevLogs]
          return newLogs.slice(0, 1000) // Limit to 1000 logs for performance
        })
      } else {
        // Initial load
        setLogs(response.data)

        // Initialize selected columns with all available columns
        if (response.data.length > 0) {
          setSelectedColumns(Object.keys(response.data[0]).filter((col) => col !== "@timestamp"))
        }
      }

      // Update the last timestamp for the next live update
      if (response.data.length > 0) {
        const timestamps = response.data.map((log) => log["@timestamp"]).sort()
        setLastTimestamp(timestamps[timestamps.length - 1])
      }

      return response.data
    } catch (error) {
      setError("Failed to fetch logs: " + (error.response?.data?.detail || error.message))
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Live update effect
  useEffect(() => {
    let intervalId = null

    if (liveUpdate && lastTimestamp) {
      intervalId = setInterval(() => {
        fetchLogs(lastTimestamp)
      }, 5000) // Update every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [liveUpdate, lastTimestamp, fetchLogs])

  // Toggle column selection
  const toggleColumn = (column) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== column))
    } else {
      setSelectedColumns([...selectedColumns, column])
    }
  }

  // Select all columns
  const selectAllColumns = () => {
    if (logs.length > 0) {
      setSelectedColumns(Object.keys(logs[0]).filter((col) => col !== "@timestamp"))
    }
  }

  // Deselect all columns
  const deselectAllColumns = () => {
    setSelectedColumns([])
  }

  // Export logs to .pkl file
  const exportToPkl = async () => {
    try {
      // Use axios to get the file as a blob
      const response = await axios.get(`http://localhost:8000/events/export/${orgId}`, {
        responseType: "blob",
      })

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]))

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `cicflow_logs_${new Date().toISOString().replace(/[:.]/g, "-")}.pkl`)

      // Append to the document, click it, and remove it
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the URL
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError("Failed to export logs: " + error.message)
    }
  }

  // Filter logs based on search query and filter type
  const filteredLogs = logs.filter((log) => {
    if (!filterType && !searchQuery) return true

    const query = searchQuery.toLowerCase()

    if (filterType && !searchQuery) return true

    if (searchQuery && !filterType) {
      // Search across all fields
      return Object.entries(log).some(([key, value]) => {
        return value !== null && String(value).toLowerCase().includes(query)
      })
    }

    // If a specific filter type is selected
    if (log[filterType] !== undefined) {
      return String(log[filterType]).toLowerCase().includes(query)
    }

    return false
  })

  // Get unique source IPs
  const uniqueSourceIPs = new Set(logs.map((log) => log["Source IP"] || "Unknown")).size

  // Get unique destination ports
  const uniqueDestPorts = new Set(logs.map((log) => log["Destination Port"] || "Unknown")).size

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f4f4f4" }}>
      <Sidebar userRole={userRole} />

      <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>CICFlowMeter Network Traffic</h1>

        {/* Controls */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", marginRight: "15px" }}>
            <input
              type="checkbox"
              id="live-update"
              checked={liveUpdate}
              onChange={() => setLiveUpdate(!liveUpdate)}
              style={{ marginRight: "5px" }}
            />
            <label htmlFor="live-update">Live Updates</label>
          </div>

          <button
            onClick={() => fetchLogs()}
            style={{
              padding: "8px 12px",
              background: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>

          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            style={{
              padding: "8px 12px",
              background: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {showColumnSelector ? "Hide Columns" : "Select Columns"}
          </button>

          <button
            onClick={exportToPkl}
            style={{
              padding: "8px 12px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Export to .pkl
          </button>
        </div>

        {/* Statistics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "#333",
              color: "white",
              padding: "15px",
              borderRadius: "5px",
            }}
          >
            <div style={{ fontSize: "14px", color: "#aaa" }}>Total Logs</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{filteredLogs.length}</div>
          </div>

          <div
            style={{
              background: "#333",
              color: "white",
              padding: "15px",
              borderRadius: "5px",
            }}
          >
            <div style={{ fontSize: "14px", color: "#aaa" }}>Unique Source IPs</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{uniqueSourceIPs}</div>
          </div>

          <div
            style={{
              background: "#333",
              color: "white",
              padding: "15px",
              borderRadius: "5px",
            }}
          >
            <div style={{ fontSize: "14px", color: "#aaa" }}>Unique Destination Ports</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{uniqueDestPorts}</div>
          </div>
        </div>

        {/* Column Selector */}
        {showColumnSelector && (
          <div
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ margin: 0 }}>Column Selection</h3>
              <div>
                <button
                  onClick={selectAllColumns}
                  style={{
                    marginRight: "10px",
                    padding: "4px 8px",
                    background: "#f0f0f0",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllColumns}
                  style={{
                    padding: "4px 8px",
                    background: "#f0f0f0",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "8px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {logs.length > 0 &&
                Object.keys(logs[0])
                  .filter((col) => col !== "@timestamp")
                  .map((column) => (
                    <div key={column} style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        id={`col-${column}`}
                        checked={selectedColumns.includes(column)}
                        onChange={() => toggleColumn(column)}
                        style={{ marginRight: "5px" }}
                      />
                      <label htmlFor={`col-${column}`}>{column}</label>
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexDirection: window.innerWidth < 768 ? "column" : "row",
          }}
        >
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              flex: "0 0 200px",
            }}
          >
            <option value="">Filter By (All Fields)</option>
            {logs.length > 0 &&
              Object.keys(logs[0])
                .filter((col) => col !== "@timestamp")
                .map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
          </select>

          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              placeholder={filterType ? `Search by ${filterType}...` : "Search all fields..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                paddingRight: "30px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              🔍
            </span>
          </div>
        </div>

        {/* Live update indicator */}
        {liveUpdate && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#4CAF50",
                marginRight: "8px",
                animation: "pulse 1.5s infinite",
              }}
            ></div>
            <span style={{ fontSize: "14px", color: "#666" }}>
              Live updates enabled - new data will appear automatically
            </span>
          </div>
        )}

        {/* Loading indicator */}
        {loading && logs.length === 0 && <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>}

        {/* Error message */}
        {error && logs.length === 0 && (
          <div
            style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>Error</h3>
            <p>{error}</p>
            <button
              onClick={() => fetchLogs()}
              style={{
                padding: "8px 12px",
                background: "#f0f0f0",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Logs Table */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "5px",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                whiteSpace: "nowrap",
              }}
            >
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  {selectedColumns.map((column) => (
                    <th
                      key={column}
                      style={{
                        padding: "12px 15px",
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#666",
                        textTransform: "uppercase",
                      }}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <tr key={index} style={{ background: index % 2 === 0 ? "white" : "#f9f9f9" }}>
                      {selectedColumns.map((column) => (
                        <td
                          key={column}
                          style={{
                            padding: "10px 15px",
                            borderBottom: "1px solid #eee",
                            fontSize: "14px",
                            color: "#333",
                          }}
                        >
                          {log[column] !== null && log[column] !== undefined ? String(log[column]) : "N/A"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={selectedColumns.length}
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#666",
                      }}
                    >
                      No logs found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventLogPage
