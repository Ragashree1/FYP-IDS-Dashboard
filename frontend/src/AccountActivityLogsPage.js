import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Sidebar from "./Sidebar"

const AccountActivityLogsPage = () => {
  const navigate = useNavigate()
  const { authData } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [logToDelete, setLogToDelete] = useState(null)
  const [organizationId, setOrganizationId] = useState(null)

  useEffect(() => {
    const fetchOrgId = async () => {
      const token = localStorage.getItem("token")
      const response = await fetch("http://127.0.0.1:8000/login/get_user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setOrganizationId(data.user.organization_id)
      }
    }
    fetchOrgId()
  }, [])

  useEffect(() => {
    if (authData && organizationId) {
      fetchLogs()
    }
  }, [authData, organizationId])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch("http://127.0.0.1:8000/audit/account-logs", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Filter logs by organizationId
        setLogs(data.filter((log) => log.organization_id === organizationId))
      } else {
        throw new Error("Failed to fetch account activity logs")
      }
      setLoading(false)
    } catch (err) {
      console.error("Error fetching account activity logs:", err)
      setError("Failed to load account activity logs. Please try again later.")

      // Fallback to mock data if API fails
      setLogs([
        {
          id: 1,
          timestamp: new Date().toISOString(),
          user: authData?.username || "current_user",
          targetUser: "john.doe@example.com",
          action: "user_created",
          description: "Created new user account for John Doe",
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: authData?.username || "current_user",
          targetUser: "sarah.smith@example.com",
          action: "role_changed",
          description: "Changed user role from Network Admin to IT Manager",
        },
      ])
      setLoading(false)
    }
  }

  // Handle deleting a log
  const handleDeleteLog = async (logId) => {
    try {
      setDeleteLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`http://127.0.0.1:8000/audit/delete-log/${logId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove the deleted log from the state
        setLogs(logs.filter((log) => log.id !== logId))
        setError(null) // Clear any previous errors
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete log")
      }
    } catch (err) {
      console.error("Error deleting log:", err)
      setError(`Failed to delete log: ${err.message}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Replace the existing confirmDeleteLog function with this new implementation
  const confirmDeleteLog = (logId) => {
    setLogToDelete(logId)
    setShowDeleteConfirm(true)
  }

  // Add a new function to handle confirmation
  const handleConfirmDelete = () => {
    if (logToDelete) {
      handleDeleteLog(logToDelete)
      setShowDeleteConfirm(false)
      setLogToDelete(null)
    }
  }

  // Filter logs based on search query and filters
  const filteredLogs = logs.filter((log) => {
    // Search filter
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Date filter
    const logDate = new Date(log.timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = logDate.toDateString() === today.toDateString()
    } else if (dateFilter === "yesterday") {
      matchesDate = logDate.toDateString() === yesterday.toDateString()
    } else if (dateFilter === "last7days") {
      matchesDate = logDate >= lastWeek
    }

    // Action filter
    let matchesAction = true
    if (actionFilter !== "all") {
      matchesAction = log.action === actionFilter
    }

    return matchesSearch && matchesDate && matchesAction
  })

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Get action display name
  const getActionDisplayName = (action) => {
    switch (action) {
      case "user_created":
        return "User Created"
      case "user_deleted":
        return "User Deleted"
      case "user_suspended":
        return "User Suspended"
      case "user_activated":
        return "User Activated"
      case "user_updated":
        return "User Updated"
      case "role_changed":
        return "Role Changed"
      case "permissions_changed":
        return "Permissions Changed"
      case "password_changed":
        return "Password Changed"
      case "profile_updated":
        return "Profile Updated"
      default:
        return action
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
    }
  }

  // Get action badge color
  const getActionBadgeColor = (action) => {
    switch (action) {
      case "user_created":
        return { bg: "#f6ffed", text: "#52c41a" } // Green
      case "user_deleted":
        return { bg: "#fff1f0", text: "#f5222d" } // Red
      case "user_suspended":
        return { bg: "#fff2e8", text: "#fa541c" } // Orange
      case "user_activated":
        return { bg: "#f6ffed", text: "#52c41a" } // Green
      case "user_updated":
        return { bg: "#e6f7ff", text: "#1890ff" } // Blue
      case "role_changed":
        return { bg: "#e6f7ff", text: "#1890ff" } // Blue
      case "permissions_changed":
        return { bg: "#e6f7ff", text: "#1890ff" } // Blue
      case "password_changed":
        return { bg: "#f9f0ff", text: "#722ed1" } // Purple
      case "profile_updated":
        return { bg: "#f9f0ff", text: "#722ed1" } // Purple
      default:
        return { bg: "#f5f5f5", text: "#666666" } // Gray
    }
  }

  // Handle export to CSV
  const exportToCSV = () => {
    const headers = ["Timestamp", "User", "Target User", "Action", "Description"]

    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        [
          log.timestamp,
          log.user,
          log.targetUser,
          getActionDisplayName(log.action),
          `"${log.description.replace(/"/g, '""')}"`, // Escape quotes in description
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `account-activity-logs-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
      <Sidebar userRole="3" />
      <div
        style={{
          flex: 1,
          padding: "32px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {error && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "4px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          </div>
        )}

        <h1 style={{ margin: "0 0 8px 0" }}>Account Activity Logs</h1>
        <h2 style={{ margin: "0 0 24px 0", fontWeight: "normal", color: "#666" }}>
          Track user account activities and changes
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "white",
              }}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "white",
              }}
            >
              <option value="all">All Actions</option>
              <option value="user_created">User Created</option>
              <option value="user_deleted">User Deleted</option>
              <option value="user_suspended">User Suspended</option>
              <option value="user_activated">User Activated</option>
              <option value="user_updated">User Updated</option>
              <option value="role_changed">Role Changed</option>
              <option value="password_changed">Password Changed</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={exportToCSV}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4a4a4a",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>📥</span> Export CSV
            </button>

            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  width: "200px",
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
                  fontSize: "16px",
                  color: "#666",
                }}
              >
                🔍
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "8px",
            overflow: "auto",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            maxWidth: "100%",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Timestamp</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>User</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Target User</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Action</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Description</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "16px", textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "16px", textAlign: "center" }}>
                    No logs found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionColors = getActionBadgeColor(log.action)
                  return (
                    <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "16px" }}>{formatDate(log.timestamp)}</td>
                      <td style={{ padding: "16px" }}>{log.user}</td>
                      <td style={{ padding: "16px" }}>{log.targetUser}</td>
                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            backgroundColor: actionColors.bg,
                            color: actionColors.text,
                          }}
                        >
                          {getActionDisplayName(log.action)}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>{log.description}</td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <button
                          onClick={() => confirmDeleteLog(log.id)}
                          disabled={deleteLoading}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px",
                            color: "#f5222d",
                            opacity: deleteLoading ? 0.5 : 1,
                          }}
                          title="Delete Log"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #eee",
              textAlign: "right",
              color: "#666",
            }}
          >
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>
      </div>
      {showDeleteConfirm && (
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
              borderRadius: "8px",
              padding: "24px",
              width: "400px",
              maxWidth: "90%",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0" }}>Are you sure you want to delete this log?</h3>
            <p style={{ margin: "0 0 24px 0", color: "#666" }}>
              This action cannot be undone and this log will be permanently deleted.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#52c41a",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#ffccc7",
                  color: "#f5222d",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountActivityLogsPage

