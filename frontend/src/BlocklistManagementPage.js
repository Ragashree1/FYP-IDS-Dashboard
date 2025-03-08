"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const AddBlocklistModal = ({ onClose, onAdd }) => {
  const [newIP, setNewIP] = useState("")
  const [reason, setReason] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newIP && reason) {
      onAdd({ ip: newIP, reason })
      onClose()
    }
  }

  return (
    <div
      style={{
        position: "absolute",
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
        position: "absolute",
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
  const [blocklist, setBlocklist] = useState([
    { id: 1, ip: "192.168.1.10", reason: "Suspicious activity" },
    { id: 2, ip: "10.0.0.5", reason: "Multiple failed login attempts" },
    { id: 3, ip: "192.168.1.9", reason: "Port scanning detected" },
    { id: 4, ip: "192.168.1.100", reason: "Unauthorized access attempt" },
  ])

  const isActive = (path) => location.pathname.startsWith(path)

  const handleLogout = () => {
    navigate("/login")
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleRemoveIP = (ip, reason) => {
    console.log(`Removing IP: ${ip}, Reason: ${reason}`)
    setBlocklist(blocklist.filter((item) => item.ip !== ip))
  }

  const handleAddIP = (newItem) => {
    setBlocklist([...blocklist, { id: blocklist.length + 1, ...newItem }])
  }

  const handleIPClick = (ip) => {
    setSelectedIP(ip)
    setShowRemoveModal(true)
  }

  const filteredBlocklist = blocklist.filter((item) => item.ip.toLowerCase().includes(searchQuery.toLowerCase()))

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
              background: isActive("/blocklist") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/blocklist")}
          >
            <img
              src="/images/blocklist-logo.png"
              alt="Blocklist Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Blocklist Management
          </li>
          <li
            style={{
              padding: "10px",
              background: isActive("/system-config") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/system-config")}
          >
            <img
              src="/images/system-config-logo.png"
              alt="System Config Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            System Configurations
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
              overflow: "hidden",
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
                  <tr key={item.id}>
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

