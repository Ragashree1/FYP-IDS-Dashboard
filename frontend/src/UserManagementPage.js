"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "./context/AuthContext" // Import useAuth
import Sidebar from "./Sidebar"
import DeleteConfirmationModal from "./components/modals/DeleteConfirmationModal"
import UserModal from "./components/modals/UserModal" // Updated import
import SuspendConfirmationModal from "./components/modals/SuspendConfirmationModal"

const userRole = "1"
const UserManagementPage = () => {
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
  const [loading, setLoading] = useState(true) // Added loading state
  const [error, setError] = useState(null)

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token") // Get the token from localStorage
      const response = await fetch("http://127.0.0.1:8000/user-management/roles", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched roles:", data) // Debug log
        setRoles(data)
        setLoading(false)
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
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

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
      const token = localStorage.getItem("token") // Get the token from localStorage
      const response = await fetch("http://127.0.0.1:8000/user-management/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the token in the headers
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched users:", data) // Debug log
        setUsers(data)
        setLoading(false)
      } else {
        throw new Error("Failed to fetch users")
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to fetch users. Please try refreshing the page.")
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

  const handleSuspend = (user) => {
    setUserToSuspend({ ...user })
    setShowSuspendModal(true)
  }

  const handleConfirmSuspend = async () => {
    try {
      if (!userToSuspend) return

      // Toggle the suspend status
      const updatedUser = {
        ...userToSuspend,
        userSuspend: !userToSuspend.userSuspend,
      }

      await updateUser(updatedUser)
      setShowSuspendModal(false)
      setUserToSuspend(null)
    } catch (err) {
      console.error("Error in handleConfirmSuspend:", err)
    }
  }

  const handleCloseSuspendModal = () => {
    setShowSuspendModal(false)
    setUserToSuspend(null)
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setShowNewUserModal(true)
  }

  const addUser = async (user) => {
    try {
      const token = localStorage.getItem("token") // Get the token from localStorage

      // Set userSuspend to false for users created in user management page
      // This allows them to log in immediately without approval
      const newUser = {
        ...user,
        userSuspend: false,
        userRejected: false,
      }

      const response = await fetch("http://127.0.0.1:8000/user-management/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ensure the token is included in the headers
        },
        body: JSON.stringify(newUser), // Send the user data in the request body
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to add user")
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
    setSelectedUser({ ...user })
    setShowNewUserModal(true)
  }

  const updateUser = async (user) => {
    try {
      const token = localStorage.getItem("token") // Get the token from localStorage

      // Ensure all required fields are included
      const payload = {
        id: user.id,
        username: user.username,
        userFirstName: user.userFirstName || "",
        userLastName: user.userLastName || "",
        userComName: user.userComName,
        userEmail: user.userEmail,
        userPhoneNum: user.userPhoneNum,
        userRole: user.userRole,
        userSuspend: user.userSuspend,
        userRejected: user.userRejected || false,
      }

      // Include password only if it is provided
      if (user.passwd) {
        payload.passwd = user.passwd
      }

      console.log("Updating user with payload:", payload)

      const response = await fetch(`http://127.0.0.1:8000/user-management/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
        body: JSON.stringify(payload), // Send the payload
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update user")
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
      const token = localStorage.getItem("token") // Get the token from localStorage

      const response = await fetch(`http://127.0.0.1:8000/user-management/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
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
        await addUser(formData)
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
        overflow: "hidden", // Added to prevent horizontal scrolling
      }}
    >
      <Sidebar userRole={userRole} />
      <div
        style={{
          flex: 1,
          padding: "32px",
          overflowY: "auto", // Allow vertical scrolling
          overflowX: "hidden", // Prevent horizontal scrolling
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
        <h1 style={{ margin: "0 0 8px 0" }}>User Management</h1>
        <h2 style={{ margin: "0 0 24px 0", fontWeight: "normal", color: "#666" }}>Users Details</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap", // Added to prevent overflow on small screens
            gap: "10px", // Added for spacing when wrapped
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
            Add User
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
            overflow: "auto", // Changed from "hidden" to "auto" to allow scrolling if needed
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            maxWidth: "100%", // Added to prevent overflow
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>#</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Username</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Full Name</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Role</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Email</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Phone</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Status</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Modify</th>
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
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      backgroundColor: user.userSuspend ? "#fff5f5" : "inherit",
                    }}
                  >
                    <td style={{ padding: "16px" }}>{index + 1}</td>
                    <td style={{ padding: "16px" }}>{user.username}</td>
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
                          backgroundColor: user.userSuspend ? "#ffcccb" : "#90EE90",
                          color: user.userSuspend ? "#d32f2f" : "#2e7d32",
                        }}
                      >
                        {user.userSuspend ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                        <button
                          onClick={() => handleSuspend(user)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                          title={user.userSuspend ? "Activate User" : "Suspend User"}
                        >
                          {user.userSuspend ? "🔓" : "🔒"}
                        </button>
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
                ))
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
            isSuspending={!userToSuspend?.userSuspend}
            onClose={handleCloseSuspendModal}
            onConfirm={handleConfirmSuspend}
          />
        )}
      </div>
    </div>
  )
}

export default UserManagementPage

