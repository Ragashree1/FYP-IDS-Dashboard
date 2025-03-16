"use client"

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"

import Sidebar from "./Sidebar" // Import the Sidebar component

const userRole = "network-admin"

const API_URL = "http://localhost:8000/ip-blocking"; // Your backend API base URL

const fetchBlockedIPs = async (setBlocklist) => {
  try {
    const response = await fetch(`${API_URL}/blocked-ips/`);
    if (response.status === 403) {
      alert("🚫 Access denied: Your IP is blocked.");
      return;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched Blocked IPs:", data);  // ✅ Debugging log

    // Ensure data.blocked_ips is an array of objects before mapping
    if (!Array.isArray(data.blocked_ips)) {
      throw new Error("Invalid API response: expected an array of objects");
    }

    // ✅ Fix: Extract both IP and reason correctly
    setBlocklist(data.blocked_ips.map(({ ip, reason }) => ({
      ip,
      reason: reason || "No reason provided"  // Use actual reason, fallback if missing
    })));
  } catch (error) {
    console.error("❌ Error fetching blocked IPs:", error);
    if (error.message.includes("Failed to fetch")) {
      alert("⚠️ Could not connect to the server. Ensure backend is running.");
    }
  }
};

// Check if the current user's IP is blocked
const checkUserIP = async (navigate) => {
  try {
    const response = await fetch(`${API_URL}/check-my-ip/`);
    if (response.status === 403) {
      alert("🚫 Your IP is blocked.");
      navigate("/access-denied");
    }
  } catch (error) {
    console.error("❌ Error checking user IP:", error);
  }
};

const AddBlocklistModal = ({ onClose, onAdd }) => {
  const [newIP, setNewIP] = useState("")
  const [reason, setReason] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newIP && reason) {
      onAdd(newIP, reason) // Pass newIP and reason to onAdd
      onClose()
    }
  }

  return (
    <div
      style={{
        position: "fixed", // Changed from absolute to fixed
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        border: "1px solid #000",
        borderRadius: "4px",
        padding: "20px",
        width: "90%",
        maxWidth: "400px",
        zIndex: 1000,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Add to Blocklist</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#666",
            }}
          >
            IP Address to block
          </label>
          <input
            type="text"
            value={newIP}
            onChange={(e) => setNewIP(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              marginBottom: "15px",
            }}
          />
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#666",
            }}
          >
            Reason for blocking
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              marginBottom: "15px",
            }}
          />
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              type="submit"
              style={{
                padding: "6px 20px",
                backgroundColor: "#90EE90",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "6px 20px",
                backgroundColor: "#ffcccb",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

const RemoveIPModal = ({ onClose, onRemove, ipToRemove }) => {
  const [reason, setReason] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onRemove(ipToRemove, reason)
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed", // Changed from absolute to fixed
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        border: "1px solid #000",
        borderRadius: "4px",
        padding: "20px",
        width: "90%",
        maxWidth: "600px",
        zIndex: 1000,
      }}
    >
      <h2 style={{ margin: "0 0 20px 0" }}>Request to remove IP From Blocklist</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
            }}
          >
            IP Address to Remove
          </label>
          <input
            type="text"
            value={ipToRemove}
            disabled
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              marginBottom: "15px",
              backgroundColor: "#f5f5f5",
            }}
          />
          <label
            style={{
              display: "block",
              marginBottom: "8px",
            }}
          >
            Reason for removing
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="The IP belongs to a reputable service provider. Blocking IP disrupts critical communications"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              marginBottom: "20px",
              minHeight: "80px",
              resize: "none",
              backgroundColor: "#f5f5f5",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <button
              type="submit"
              style={{
                padding: "6px 20px",
                backgroundColor: "#90EE90",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Request
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "6px 20px",
                backgroundColor: "#ffcccb",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

const BlocklistManagementPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [selectedIP, setSelectedIP] = useState(null)
  const [blocklist, setBlocklist] = useState([])

  useEffect(() => {
    fetchBlockedIPs(setBlocklist);
    checkUserIP(navigate);
  }, [navigate]);

  const isActive = (path) => location.pathname.startsWith(path)

  const handleLogout = () => {
    navigate("/login")
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleRemoveIP = async (ip) => {
    try {
      const response = await fetch(`${API_URL}/unblock-ip/${ip}`, {
        method: "DELETE",
      });
  
      if (!response.ok) throw new Error("Failed to remove IP");
  
      setBlocklist((prevBlocklist) => prevBlocklist.filter((item) => item.ip !== ip)); // ✅ Correct state update
    } catch (error) {
      console.error("Error removing IP:", error);
    }
  };    

  const handleAddIP = async (ip, reason) => {
    if (!ip.trim() || !reason.trim()) {
      alert("⚠️ IP and reason are required!");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/block-ip/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ip.trim(), reason: reason.trim() }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || "Failed to block IP");
      }
  
      setBlocklist((prevBlocklist) => [...prevBlocklist, data]); // Update UI
    } catch (error) {
      console.error("Error blocking IP:", error);
    }
  };    

  const handleIPClick = (ip) => {
    setSelectedIP(ip)
    setShowRemoveModal(true)
  }

  const filteredBlocklist = blocklist.filter((item) => item.ip.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f4f4f4",
        overflow: "hidden", // Added to prevent horizontal scrolling
      }}
    >
      {/* Use the Sidebar component instead of hardcoded sidebar */}
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
        <h1>Blocklist Management</h1>

        {/* Search Bar */}
        <div
          style={{
            position: "relative",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Search by IP Address"
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: "100%",
              padding: "10px 35px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "14px",
              backgroundColor: "#f5f5f5",
              boxSizing: "border-box", // Added to prevent overflow
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

        {/* Blocklist Table */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h2>Blocklist List</h2>
            <button
              onClick={() => setShowAddModal(true)}
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
              overflow: "auto", // Changed from "hidden" to "auto" to allow scrolling if needed
              maxWidth: "100%", // Added to prevent overflow
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "15px",
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      backgroundColor: "#f8f8f8",
                    }}
                  >
                    IP Address
                  </th>
                  <th
                    style={{
                      padding: "15px",
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      backgroundColor: "#f8f8f8",
                    }}
                  >
                    Reason for adding
                  </th>
                  <th
                    style={{
                      padding: "15px",
                      width: "50px",
                      borderBottom: "1px solid #eee",
                      backgroundColor: "#f8f8f8",
                    }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocklist.map((item) => (
                  <tr key={item.ip}>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                      }}
                      onClick={() => handleIPClick(item.ip)}
                    >
                      {item.ip}
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {item.reason}
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #eee",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={() => handleIPClick(item.ip)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add IP Modal */}
        {showAddModal && <AddBlocklistModal onClose={() => setShowAddModal(false)} onAdd={handleAddIP} />}
        {showRemoveModal && (
          <RemoveIPModal ipToRemove={selectedIP} onClose={() => setShowRemoveModal(false)} onRemove={handleRemoveIP} />
        )}
      </div>
    </div>
  )
}

export default BlocklistManagementPage
