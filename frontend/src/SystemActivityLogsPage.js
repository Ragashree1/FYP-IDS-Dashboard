"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Sidebar from "./Sidebar"
import { checkPermissions, fetchPermissions } from "./utils/check_permissions"

const permission = "System_Activity"

const SystemActivityLogsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()  // Use user from AuthContext
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [componentFilter, setComponentFilter] = useState("all")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [logToDelete, setLogToDelete] = useState(null)
  const [userPermission, setuserPermission] = useState([]) ;

  useEffect(() => {
    // Fetch system activity logs from the API
    if (user) {
      console.log("Current user:", user)  // Debug log
      fetchLogs()
    }
  }, [user])

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

  const getUserPermission = async () => {
      const perm  = await fetchPermissions();
      setuserPermission(perm);
      if (!perm) {
        setError("Failed to fetch user's permission for Sidebar");
      }
    };
    
    useEffect(() => {
      getUserPermission();
    }, []);

    if (!hasPermission) {
      return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar permissions = {userPermission} />
          <div style={{ flex: 1, position: 'relative' }}>
            {showWarning && <PermissionDeniedPopup />}
          </div>
        </div>
      );
    }

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      console.log("Using token for API call:", token)  // Debug log

      const response = await fetch("http://localhost:8000/audit/system-logs", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Received logs from API:", data)  // Debug log
        setLogs(data)
      } else {
        const errorText = await response.text()
        console.error("API error response:", errorText)  // Debug log
        throw new Error(`Failed to fetch system activity logs: ${errorText}`)
      }
      setLoading(false)
    } catch (err) {
      console.error("Error fetching system activity logs:", err)
      setError("Failed to load system activity logs. Please try again later.")

      // Fallback to mock data if API fails
      const mockData = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          user: user?.username || "admin@example.com",
          component: "Playbook",
          action: "playbook_created",
          description: "Created new playbook: DDoS Protection",
          ipAddress: "192.168.1.45",
          resourceId: "1",
          resourceName: "DDoS Protection",
          userComName: user?.userComName || "default"
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: user?.username || "john.doe@example.com",
          component: "Playbook",
          action: "playbook_updated",
          description: "Updated playbook Brute Force Detection: conditions, actions",
          ipAddress: "192.168.1.32",
          resourceId: "2",
          resourceName: "Brute Force Detection",
          userComName: user?.userComName || "default"
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: user?.username || "sarah.smith@example.com",
          component: "Playbook",
          action: "playbook_status_changed",
          description: "Deactivated playbook: Content Filtering",
          ipAddress: "192.168.1.28",
          resourceId: "3",
          resourceName: "Content Filtering",
          userComName: user?.userComName || "default"
        },
        {
          id: 4,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          user: user?.username || "admin@example.com",
          component: "Playbook",
          action: "playbook_deleted",
          description: "Deleted playbook: Obsolete Rule",
          ipAddress: "192.168.1.45",
          resourceId: "4",
          resourceName: "Obsolete Rule",
          userComName: user?.userComName || "default"
        },
      ]
      console.log("Using mock data:", mockData)  // Debug log
      setLogs(mockData)
      setLoading(false)
    }
  }

  // Handle deleting a log
  const handleDeleteLog = async (logId) => {
    try {
      setDeleteLoading(true)
      const token = localStorage.getItem("token")

      const response = await fetch(`http://localhost:8000/audit/delete-system-log/${logId}`, {
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
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.resourceName && log.resourceName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()))

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

    // Component filter
    let matchesComponent = true
    if (componentFilter !== "all") {
      matchesComponent = log.component === componentFilter
    }

    return matchesSearch && matchesDate && matchesAction && matchesComponent
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
    case "playbook_created":
      return "Playbook Created"
    case "playbook_updated":
      return "Playbook Updated"
    case "playbook_deleted":
      return "Playbook Deleted"
    case "playbook_status_changed":
      return "Status Changed"
    case "rule_added":
      return "Rule Added"
    case "rule_modified":
      return "Rule Modified"
    case "rule_deleted":
      return "Rule Deleted"
    case "threshold_change":
      return "Threshold Changed"
    case "configuration_change":
      return "Config Changed"
    case "ip_blocked":
      return "IP Blocked"
    case "ip_unblocked":
      return "IP Unblocked"
    default:
      return action
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
  }
}

// Update the getActionBadgeColor function in system-activity-logs-page.tsx
const getActionBadgeColor = (action) => {
  switch (action) {
    case "playbook_created":
      return { bg: "#f6ffed", text: "#52c41a" } // Green
    case "playbook_updated":
      return { bg: "#e6f7ff", text: "#1890ff" } // Blue
    case "playbook_deleted":
      return { bg: "#fff1f0", text: "#f5222d" } // Red
    case "playbook_status_changed":
      return { bg: "#fff7e6", text: "#fa8c16" } // Orange
    case "rule_added":
      return { bg: "#f6ffed", text: "#52c41a" } // Green
    case "rule_modified":
      return { bg: "#e6f7ff", text: "#1890ff" } // Blue
    case "rule_deleted":
      return { bg: "#fff1f0", text: "#f5222d" } // Red
    case "threshold_change":
      return { bg: "#e6f7ff", text: "#0066cc" } // Blue
    case "configuration_change":
      return { bg: "#f9f0ff", text: "#722ed1" } // Purple
    case "ip_blocked":
      return { bg: "#fff1f0", text: "#f5222d" } // Red
    case "ip_unblocked":
      return { bg: "#f6ffed", text: "#52c41a" } // Blue
    default:
      return { bg: "#f5f5f5", text: "#666666" } // Gray
  }
}

  // Get unique components for filter
  const uniqueComponents = [...new Set(logs.map((log) => log.component))]

  // Get unique actions for filter
  const uniqueActions = [...new Set(logs.map((log) => log.action))]

  // Handle export to CSV
  const exportToCSV = () => {
    const headers = ["Timestamp", "User", "Component", "Action", "Description", "IP Address", "Resource Name"]

    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        [
          log.timestamp,
          log.user,
          log.component,
          getActionDisplayName(log.action),
          `"${log.description.replace(/"/g, '""')}"`, // Escape quotes in description
          log.ipAddress,
          log.resourceName ? `"${log.resourceName.replace(/"/g, '""')}"` : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `system-activity-logs-${new Date().toISOString().split("T")[0]}.csv`)
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
      <Sidebar permissions = {userPermission} />
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

        <h1 style={{ margin: "0 0 8px 0" }}>System Activity Logs</h1>
        <h2 style={{ margin: "0 0 24px 0", fontWeight: "normal", color: "#666" }}>
          Track changes to playbooks, rules, and system configurations
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
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
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "white",
              }}
            >
              <option value="all">All Components</option>
              {uniqueComponents.map((component) => (
                <option key={component} value={component}>
                  {component}
                </option>
              ))}
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
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {getActionDisplayName(action)}
                </option>
              ))}
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
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Component</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Action</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Description</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Resource</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>IP Address</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "16px", textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "16px", textAlign: "center" }}>
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
                      <td style={{ padding: "16px" }}>{log.component}</td>
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
                      <td style={{ padding: "16px" }}>{log.resourceName || "-"}</td>
                      <td style={{ padding: "16px" }}>{log.ipAddress}</td>
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

export default SystemActivityLogsPage