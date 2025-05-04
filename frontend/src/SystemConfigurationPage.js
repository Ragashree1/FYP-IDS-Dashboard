"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import Sidebar from "./Sidebar"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const userRole = "2"

// Function to extract organization ID from token and save to localStorage
const extractOrgIdFromToken = () => {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      console.error("No token found in localStorage")
      return null
    }

    // Decode the token
    const decodedToken = jwtDecode(token)
    console.log("Decoded token:", decodedToken)

    // Try to find organization_id in different possible locations in the token
    let orgId = null

    // Check if organization_id is directly in the token
    if (decodedToken.organization_id) {
      orgId = decodedToken.organization_id
    }
    // Check if it's in the user object
    else if (decodedToken.user && decodedToken.user.organization_id) {
      orgId = decodedToken.user.organization_id
    }

    if (orgId) {
      console.log("Found organization ID in token:", orgId)
      localStorage.setItem("orgId", String(orgId))
      return orgId
    } else {
      console.warn("Organization ID not found in token")
      return null
    }
  } catch (err) {
    console.error("Error extracting organization ID from token:", err)
    return null
  }
}

const AddIPModal = ({ onClose, onAdd }) => {
  const [newIP, setNewIP] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newIP) {
      onAdd(newIP)
      onClose()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "400px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>Add IP address</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#666",
              }}
            >
              IP Address to add
            </label>
            <input
              type="text"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              placeholder="Enter IP address"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginBottom: "15px",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const SystemConfiguration = () => {
  const [logType, setLogType] = useState("all")
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [clients, setClients] = useState([])
  const [logs, setLogs] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Check for organization ID on component mount
  useEffect(() => {
    // Check if orgId exists in localStorage
    let orgId = localStorage.getItem("orgId")
    console.log("Organization ID from localStorage (useEffect):", orgId)

    if (!orgId || isNaN(Number(orgId))) {
      console.log("No valid organization ID in localStorage, attempting to extract from token")
      orgId = extractOrgIdFromToken()

      if (orgId) {
        console.log("Successfully extracted organization ID from token:", orgId)
        // No need to navigate away, we can continue with the extracted orgId
        fetchVerifiedIPs(orgId)
        fetchLogs(orgId)
      } else {
        console.warn("Could not find organization ID in token")
        alert("Organization ID is missing. Please log in again.")
        navigate("/login")
      }
    } else {
      console.log("Found organization ID in localStorage:", orgId)
      fetchVerifiedIPs(orgId)
      fetchLogs(orgId)
    }
  }, [navigate])

  // Separate effect for logType changes to avoid duplicate fetches on mount
  useEffect(() => {
    const orgId = localStorage.getItem("orgId")
    if (orgId && !isNaN(Number(orgId))) {
      fetchLogs(orgId)
    }
  }, [logType])

  const fetchVerifiedIPs = async (orgId) => {
    try {
      console.log("Fetching verified IPs for organization:", orgId)
      // Check if orgId exists and is a valid number
      if (!orgId || isNaN(Number(orgId))) {
        console.error("Invalid organization ID:", orgId)
        alert("Invalid organization ID. Please log in again.")
        navigate("/login")
        return
      }
      const parsedOrgId = Number.parseInt(orgId, 10)
      console.log("Parsed organization ID:", parsedOrgId)

      const response = await fetch(`${API_BASE_URL}/ip-verification/verified-ips/${parsedOrgId}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.detail || errorData.message || "Failed to fetch verified IPs")
        } catch (e) {
          throw new Error(`Failed to fetch verified IPs: ${errorText}`)
        }
      }

      const data = await response.json()
      console.log("Verified IPs data:", data)
      setClients(data.verified_ips)
    } catch (error) {
      console.error("Error fetching verified IPs:", error.message)
      alert(`Error: ${error.message}`)
    }
  }

  const fetchLogs = async (orgId) => {
    try {
      console.log("Fetching logs for organization:", orgId)
      // Check if orgId exists and is a valid number
      if (!orgId || isNaN(Number(orgId))) {
        console.error("Invalid organization ID:", orgId)
        alert("Invalid organization ID. Please log in again.")
        navigate("/login")
        return
      }
      const parsedOrgId = Number.parseInt(orgId, 10)
      console.log("Parsed organization ID:", parsedOrgId)

      let endpoint = `/logs/${parsedOrgId}`
      if (logType === "client") {
        endpoint = `/logs/client-only/${parsedOrgId}`
      } else if (logType === "snort") {
        endpoint = `/logs/snort-only/${parsedOrgId}`
      }

      console.log("Fetching logs from endpoint:", `${API_BASE_URL}${endpoint}`)
      const response = await fetch(`${API_BASE_URL}${endpoint}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.detail || errorData.message || "Failed to fetch logs")
        } catch (e) {
          throw new Error(`Failed to fetch logs: ${errorText}`)
        }
      }

      const data = await response.json()
      console.log("Logs data:", data)
      setLogs(data)
    } catch (error) {
      console.error("Error fetching logs:", error.message)
      alert(`Error: ${error.message}`)
    }
  }

  const handleRemoveClient = async (id) => {
    try {
      console.log("Removing IP with ID:", id)
      const response = await fetch(`${API_BASE_URL}/ip-verification/remove-ip/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.detail || errorData.message || "Failed to remove IP")
        } catch (e) {
          throw new Error(`Failed to remove IP: ${errorText}`)
        }
      }

      setClients((prevClients) => prevClients.filter((client) => client.id !== id))
      alert("IP removed successfully!")
    } catch (error) {
      console.error("Error removing IP:", error.message)
      alert(`Error: ${error.message}`)
    }
  }

  const handleAddIP = async (newIP) => {
    // Try to get orgId from localStorage first
    let orgId = localStorage.getItem("orgId")
    console.log("Organization ID from localStorage:", orgId)

    // If not found in localStorage, try to extract from token
    if (!orgId || isNaN(Number(orgId))) {
      console.log("No valid organization ID in localStorage, attempting to extract from token")
      orgId = extractOrgIdFromToken()

      if (!orgId) {
        alert("Organization ID is missing. Please log in again.")
        navigate("/login")
        return
      }
    }

    try {
      const parsedOrgId = Number.parseInt(orgId, 10)
      console.log("Parsed organization ID:", parsedOrgId)

      const requestBody = { organization_id: parsedOrgId, ip: newIP }
      console.log("Sending request with body:", requestBody)

      const response = await fetch(`${API_BASE_URL}/ip-verification/verify-ip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.detail || errorData.message || "Failed to verify IP")
        } catch (e) {
          throw new Error(`Failed to verify IP: ${errorText}`)
        }
      }

      alert("IP verified successfully!")
      // Refresh the verified IPs list after adding a new one
      fetchVerifiedIPs(orgId)
      fetchLogs(orgId)
    } catch (error) {
      console.error("Error verifying IP:", error.message)
      alert(`Error: ${error.message}`)
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredClients = clients.filter((client) => client.ip.toLowerCase().includes(searchQuery.toLowerCase()))

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f4f4f4",
        overflow: "hidden",
      }}
    >
      <Sidebar userRole={userRole} />

      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <h1>Log Forwarding Configuration</h1>

        <div
          style={{
            position: "relative",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Search Clients by IP Address"
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: "100%",
              padding: "10px 35px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "14px",
              backgroundColor: "#f5f5f5",
              boxSizing: "border-box",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666",
            }}
          >
            🔍
          </span>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h2>Client List</h2>
            <button
              onClick={openModal}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#666",
              }}
            >
              <span>IP address</span>
              <span style={{ fontSize: "12px" }}>⊕</span>
            </button>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "4px",
              overflow: "auto",
              maxWidth: "100%",
            }}
          >
            {filteredClients.map((client) => (
              <div
                key={client.id}
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{client.ip}</span>
                <button
                  onClick={() => handleRemoveClient(client.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#666",
                    padding: "5px",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          <label>Filter by Log Type:</label>
          <select
            value={logType}
            onChange={(e) => setLogType(e.target.value)}
            style={{
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="all">All Logs</option>
            <option value="client">Client Forwarded</option>
            <option value="snort">Snort Detected</option>
          </select>
        </div>

        <div style={{ marginTop: "40px" }}>
          <h2>Forwarded Logs</h2>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              background: "white",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            {logs.length === 0 ? (
              <p>No logs forwarded yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Timestamp</th>
                    <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>IP</th>
                    <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Log</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={index}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.source}</td>
                      <td>
                        {log.message || log.log_data}
                        {log.type && (
                          <span style={{ marginLeft: "8px", fontSize: "0.8em", color: "#888" }}>[{log.type}]</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && <AddIPModal onClose={closeModal} onAdd={handleAddIP} />}
    </div>
  )
}

export default SystemConfiguration
