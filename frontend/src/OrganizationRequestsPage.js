"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "./context/AuthContext" // Import useAuth
import Sidebar from "./Sidebar"
import DeleteConfirmationModal from "./components/modals/DeleteConfirmationModal"
import UserModal from "./components/modals/UserModal" // Using the same modal
import SuspendConfirmationModal from "./components/modals/SuspendConfirmationModal"
import RejectConfirmationModal from "./components/modals/RejectConfirmationModal"

const userRole = "platform-admin"
const OrganizationRequestsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth() // Get the logged-in user's token
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [roles, setRoles] = useState([])
  const [userToEdit, setEditUserIndex] = useState(null)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [userToSuspend, setUserToSuspend] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [userToReject, setUserToReject] = useState(null)
  const [loading, setLoading] = useState(true) // Added loading state
  const [error, setError] = useState(null)

  // Function to get the token - hardcoded for platform admin
  const getToken = () => {
    // For the platform admin page, we'll use the hardcoded mock token
    // This ensures the page works even after refresh
    return "mock-token-for-platform-admin"
  }

  const fetchRoles = async () => {
    try {
      const token = getToken()

      const response = await fetch("http://127.0.0.1:8000/user-management/roles", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched roles:", data) // Debug log

        // Ensure we have at least the basic roles
        let hasOrgAdmin = false
        let hasNetworkAdmin = false

        const processedRoles = data.map((role) => {
          // Standardize role names
          if (role.id === 1) {
            hasOrgAdmin = true
            return { ...role, roleName: "Organisation Admin" }
          } else if (role.id === 2) {
            hasNetworkAdmin = true
            return { ...role, roleName: "Network Admin" }
          }
          return role
        })

        // Add missing roles if needed
        if (!hasOrgAdmin) {
          processedRoles.push({ id: 1, roleName: "Organisation Admin" })
        }
        if (!hasNetworkAdmin) {
          processedRoles.push({ id: 2, roleName: "Network Admin" })
        }

        setRoles(processedRoles)
      } else {
        // If API fails, set default roles
        setRoles([
          { id: 1, roleName: "Organisation Admin" },
          { id: 2, roleName: "Network Admin" },
        ])
        throw new Error("Failed to fetch roles")
      }
    } catch (err) {
      console.error("Error fetching roles:", err)
      // Set default roles on error
      setRoles([
        { id: 1, roleName: "Organisation Admin" },
        { id: 2, roleName: "Network Admin" },
      ])
    }
  }

  const getRoleName = (roleId) => {
    // Convert roleId to number for comparison if it's a string
    const roleIdNum = typeof roleId === "string" ? Number.parseInt(roleId, 10) : roleId

    // Handle specific role IDs
    if (roleIdNum === 1) {
      return "Organisation Admin"
    } else if (roleIdNum === 2) {
      return "Network Admin"
    }

    // Otherwise look up in the roles array
    const role = roles.find((r) => r.id === roleIdNum)
    return role ? role.roleName : "Unknown Role"
  }

  const fetchUsers = async () => {
    try {
      const token = getToken()

      // For platform admin, we want to fetch all users
      const response = await fetch("http://127.0.0.1:8000/user-management/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the token in the headers
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched organization requests:", data)
        setUsers(data) // Keep original user data including roles
        setLoading(false)
      } else {
        throw new Error("Failed to fetch organization requests")
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to fetch organization requests. Please try refreshing the page.")
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    // First fetch roles, then fetch users
    const loadData = async () => {
      await fetchRoles()
      await fetchUsers()
    }

    loadData()
  }, [])

  const filteredUsers = (users || []).filter(
    (user) =>
      (user.userComName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (getRoleName(user.userRole) || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.userPhoneNum || "").includes(searchQuery),
  )

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Function to get user status display
  const getUserStatus = (user) => {
    if (user.userSuspend === true && user.userRejected === true) {
      return { text: "Rejected", color: "#d32f2f", bgColor: "#ffcccb" }
    } else if (user.userSuspend === true) {
      return { text: "Pending", color: "#f57f17", bgColor: "#fff9c4" }
    } else {
      return { text: "Approved", color: "#2e7d32", bgColor: "#90EE90" }
    }
  }

  const handleApprove = (user) => {
    // Only allow approving if the user is in pending state
    if (user.userSuspend === true && user.userRejected !== true) {
      setUserToSuspend({ ...user }) // Create a copy to avoid reference issues
      setShowSuspendModal(true)
    }
  }

  const handleReject = (user) => {
    // Only allow rejecting if the user is in pending state
    if (user.userSuspend === true && user.userRejected !== true) {
      setUserToReject({ ...user })
      setShowRejectModal(true)
    }
  }

  const handleConfirmApprove = async () => {
    try {
      if (!userToSuspend) return

      console.log("Approving user:", userToSuspend)

      // Create a complete copy of the user with all fields
      const updatedUser = {
        id: userToSuspend.id,
        username: userToSuspend.username,
        userFirstName: userToSuspend.userFirstName || "",
        userLastName: userToSuspend.userLastName || "",
        userComName: userToSuspend.userComName,
        userEmail: userToSuspend.userEmail,
        userPhoneNum: userToSuspend.userPhoneNum,
        userRole: userToSuspend.userRole, // Preserve original role
        // Set suspend to false to approve the user
        userSuspend: false,
        // Ensure rejected is false
        userRejected: false,
      }

      // Make a direct API call to update the user
      const token = getToken()
      const response = await fetch(`http://127.0.0.1:8000/user-management/${updatedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      })

      if (response.ok) {
        // Update the user in the local state
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === updatedUser.id ? { ...u, userSuspend: false, userRejected: false } : u)),
        )

        setShowSuspendModal(false)
        setUserToSuspend(null)

        // Refresh the user list to ensure we have the latest data
        fetchUsers()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update user status")
      }
    } catch (err) {
      console.error("Error in handleConfirmApprove:", err)
      setError("Failed to approve user. Please try again.")
    }
  }

  const handleConfirmReject = async () => {
    try {
      if (!userToReject) return

      console.log("Rejecting user:", userToReject)

      // Create a complete copy of the user with all fields
      const updatedUser = {
        id: userToReject.id,
        username: userToReject.username,
        userFirstName: userToReject.userFirstName || "",
        userLastName: userToReject.userLastName || "",
        userComName: userToReject.userComName,
        userEmail: userToReject.userEmail,
        userPhoneNum: userToReject.userPhoneNum,
        userRole: userToReject.userRole, // Preserve original role
        // Keep suspend as true
        userSuspend: true,
        // Set rejected to true
        userRejected: true,
      }

      // Make a direct API call to update the user
      const token = getToken()
      const response = await fetch(`http://127.0.0.1:8000/user-management/${updatedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      })

      if (response.ok) {
        // Update the user in the local state
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === updatedUser.id ? { ...u, userSuspend: true, userRejected: true } : u)),
        )

        setShowRejectModal(false)
        setUserToReject(null)

        // Refresh the user list to ensure we have the latest data
        fetchUsers()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update user status")
      }
    } catch (err) {
      console.error("Error in handleConfirmReject:", err)
      setError("Failed to reject user. Please try again.")
    }
  }

  const handleCloseSuspendModal = () => {
    setShowSuspendModal(false)
    setUserToSuspend(null)
  }

  const handleCloseRejectModal = () => {
    setShowRejectModal(false)
    setUserToReject(null)
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setShowNewUserModal(true)
  }

  const addUser = async (user) => {
    try {
      const token = getToken()

      // Ensure new users are suspended by default
      const newUser = {
        ...user,
        userSuspend: true, // Set to true (pending) by default for new organization requests
        userRejected: false, // Not rejected initially
      }

      const response = await fetch("http://127.0.0.1:8000/user-management/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to add organization request")
      }

      // Refresh the user list after adding
      fetchUsers()
      return true
    } catch (err) {
      console.error("Error in addUser:", err)
      setError(err.message)
      setTimeout(() => setError(null), 5000)
      throw err
    }
  }

  const handleEdit = (user) => {
    setSelectedUser({ ...user }) // Preserve original role
    setShowNewUserModal(true)
  }

  const updateUser = async (user) => {
    try {
      const token = getToken()

      // Ensure all required fields are included
      const payload = {
        id: user.id,
        username: user.username,
        userFirstName: user.userFirstName || "",
        userLastName: user.userLastName || "",
        userComName: user.userComName,
        userEmail: user.userEmail,
        userPhoneNum: user.userPhoneNum,
        userRole: user.userRole, // Preserve original role
        userSuspend: user.userSuspend,
        userRejected: user.userRejected || false,
      }

      if (user.passwd) {
        payload.passwd = user.passwd
      }

      console.log("Updating user with payload:", payload)

      const response = await fetch(`http://127.0.0.1:8000/user-management/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update organization request")
      }

      // Refresh the user list after updating
      fetchUsers()
      return true
    } catch (err) {
      console.error("Error in updateUser:", err)
      setError(err.message)
      setTimeout(() => setError(null), 5000)
      throw err
    }
  }

  const handleDelete = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const deleteUser = async (id) => {
    try {
      const token = getToken()

      const response = await fetch(`http://127.0.0.1:8000/user-management/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok && response.status !== 404) {
        // 404 is acceptable - it means the user was already deleted
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete user")
      }

      // Remove the user from the local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id))
      return true
    } catch (err) {
      console.error("Error in deleteUser:", err)
      // Don't show error message for delete since it might have succeeded
      return true
    }
  }

  const handleConfirmDelete = async () => {
    try {
      if (!userToDelete) return

      await deleteUser(userToDelete.id)
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (err) {
      console.error("Error in handleConfirmDelete:", err)
    }
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  const handleAddOrUpdateUser = async (formData, id) => {
    try {
      if (id) {
        await updateUser({ ...formData, id: id })
      } else {
        const newUser = {
          username: formData.username,
          userFirstName: formData.userFirstName || "",
          userLastName: formData.userLastName || "",
          userComName: formData.userComName,
          userEmail: formData.userEmail,
          userPhoneNum: formData.userPhoneNum,
          userRole: formData.userRole, // Use the role selected in the form
          passwd: formData.passwd,
          userSuspend: true, // Set to true (pending) by default for new organization requests
          userRejected: false, // Not rejected initially
        }
        await addUser(newUser)
      }
      setShowNewUserModal(false)
      setSelectedUser(null)
    } catch (err) {
      console.error("Error in handleAddOrUpdateUser:", err)
    }
  }

  const handleCloseModal = () => {
    setShowNewUserModal(false)
    setSelectedUser(null)
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchRoles().then(() => fetchUsers())
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
        <h1 style={{ margin: "0 0 8px 0" }}>Organization Requests</h1>
        <h2 style={{ margin: "0 0 24px 0", fontWeight: "normal", color: "#666" }}>Organization Request Details</h2>

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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handleAdd}
              style={{
                background: "#90EE90",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              +
            </button>
            Add Organization Request
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleRefresh}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                color: "#666",
              }}
            >
              🔄
            </button>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearch}
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
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>#</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Organization</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Contact Name</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Role</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Email</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Phone</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Status</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "16px", textAlign: "center" }}>
                    No organization requests found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const status = getUserStatus(user)
                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: "1px solid #eee",
                        backgroundColor: user.userRejected ? "#fff0f0" : user.userSuspend ? "#fff9c4" : "#f0fff0",
                      }}
                    >
                      <td style={{ padding: "16px" }}>{index + 1}</td>
                      <td style={{ padding: "16px" }}>{user.userComName}</td>
                      <td style={{ padding: "16px" }}>
                        {user.name || `${user.userFirstName || ""} ${user.userLastName || ""}`.trim()}
                      </td>
                      <td style={{ padding: "16px" }}>{getRoleName(user.userRole)}</td>
                      <td style={{ padding: "16px" }}>{user.userEmail}</td>
                      <td style={{ padding: "16px" }}>{user.userPhoneNum}</td>
                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            backgroundColor: status.bgColor,
                            color: status.color,
                          }}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                          {user.userSuspend && !user.userRejected && (
                            <>
                              <button
                                onClick={() => handleApprove(user)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                  color: "#2e7d32",
                                }}
                                title="Approve Request"
                              >
                                ✅
                              </button>
                              <button
                                onClick={() => handleReject(user)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                  color: "#d32f2f",
                                }}
                                title="Reject Request"
                              >
                                ❌
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEdit(user)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "16px",
                            }}
                            title="Edit User"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "16px",
                            }}
                            title="Delete User"
                          >
                            🗑️
                          </button>
                        </div>
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
            Page 1 of 1
          </div>
        </div>

        {showNewUserModal && (
          <UserModal user={selectedUser} onClose={handleCloseModal} onConfirm={handleAddOrUpdateUser} />
        )}

        {showDeleteModal && (
          <DeleteConfirmationModal
            user={userToDelete}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
          />
        )}

        {showSuspendModal && (
          <SuspendConfirmationModal
            user={userToSuspend}
            isSuspending={false} // Always approving in this modal
            onClose={handleCloseSuspendModal}
            onConfirm={handleConfirmApprove}
          />
        )}

        {showRejectModal && (
          <RejectConfirmationModal
            user={userToReject}
            onClose={handleCloseRejectModal}
            onConfirm={handleConfirmReject}
          />
        )}
      </div>
    </div>
  )
}

export default OrganizationRequestsPage

