"use client"

import { useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "./context/AuthContext" // Import useAuth
import Sidebar from "./Sidebar"
import DeleteConfirmationModal from "./components/modals/DeleteConfirmationModal"
import UserModal from "./components/modals/UserModal" // Updated import
import SuspendConfirmationModal from "./components/modals/SuspendConfirmationModal"
import { checkPermissions, fetchPermissions } from "./utils/check_permissions"

const permission = "User Management"

const PermissionDeniedPopup = () => (
  <div className="permission-popup-overlay">
    <div className="success-popup">
      <div className="success-popup-header">
        <div className="success-popup-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <circle cx="12" cy="16" r="1"></circle>
          </svg>
        </div>
        <div className="success-popup-title">PERMISSION DENIED</div>
      </div>
      <div className="success-popup-content">
        <div className="success-popup-message">
          You do not have permission to view this page.
        </div>
      </div>
    </div>
  </div>
);


const UserManagementPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { authData } = useAuth() // Get the logged-in user's data
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
  const [hasPermission, setHasPermission] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [userPermission, setuserPermission] = useState([]) ;

 
  // Function to log user activity
  const logActivity = async (action, targetUser, description) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/audit/log-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          targetUser: targetUser.username || targetUser.id,
          description,
        }),
      })

      if (!response.ok) {
        console.error("Failed to log activity")
      }
    } catch (err) {
      console.error("Error logging activity:", err)
    }
  }

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token") // Get the token from localStorage
      const response = await fetch("http://localhost:8000/user-management/roles", {
        //const response = await fetch ("https://api.secuboard.live/user-management/roles", {
        method: "GET",
        });

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched roles:", data) // Debug log
        setRoles(data)
        setLoading(false)
            }else {
        throw new Error('Failed to fetch permissions');
      } 
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    fetchRoles();
  }, []);

  // Check for organization ID on component mount
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
  

   const getRoleName = (roleId) => {
    const role = roles.find((role) => role.id === roleId);
    return role ? role.roleName : "Unknown";
  };


  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token") // Get the token from localStorage
      const response = await fetch("http://localhost:8000/user-management/", {
      // const response = await fetch("https://api.secuboard.live/user-management/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`, // Pass the token in the headers
        },
      })

 if (response.ok) {
        const data = await response.json();
        console.log("Fetched users:", data); // Add this line to inspect the fetched data
        setUsers(data); // Assuming the response is an array of users
      }else {
        throw new Error('Failed to fetch users');
      } 
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to fetch users. Please try refreshing the page.")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers();
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

  const filteredUsers = (users || []).filter(
    (user) =>
      (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
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

      // Log the activity
      const action = updatedUser.userSuspend ? "user_suspended" : "user_activated"
      const description = updatedUser.userSuspend
        ? `Suspended user account: ${userToSuspend.username}`
        : `Activated user account: ${userToSuspend.username}`

      await logActivity(action, userToSuspend, description)

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
    const token = localStorage.getItem("token"); // Get the token from localStorage
    const response = await fetch("http://localhost:8000/user-management/", {
    //const response = await fetch("https://api.secuboard.live/user-management/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Ensure the token is included in the headers
      },
      body: JSON.stringify(user), // Send the user data in the request body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to add user");
    }

    fetchUsers(); // Refresh the user list after adding a new user
  } catch (err) {
    setError(err.message);
    // Optional: Add a timeout to clear the error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }
}


  const handleEdit = (user) => {
    setSelectedUser({ ...user })
    setShowNewUserModal(true)
  }

const updateUser = async (user) => {
    try {
      const token = localStorage.getItem("token"); // Get the token from localStorage
      const payload = {
        id: user.id,
        username: user.username,
        userFirstName: user.userFirstName,
        userLastName: user.userLastName,
        org: user.org,
        userEmail: user.userEmail,
        userPhoneNum: user.userPhoneNum,
        userRole: user.userRole,
        userSuspend: user.userSuspend,
        userRejected: user.userRejected || false,
        //organization_id: parsedOrgId || user.organization_id, // Preserve or update organization_id
      }

      const originalUser = users.find((u) => u.id === user.id)
      
      // Include password only if it is provided
      if (user.passwd) {
        payload.passwd = user.passwd
      }

      console.log("Updating user with payload:", payload)

      const response = await fetch(`http://localhost:8000/user-management/${user.id}`, {
      //const response = await fetch(`https://api.secuboard.live/user-management/${user.id}`, {
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

      // Determine what changed for the log description
      const changes = []
      if (originalUser) {
        if (originalUser.userRole !== user.userRole) {
          changes.push(`role from ${getRoleName(originalUser.userRole)} to ${getRoleName(user.userRole)}`)
          // Log specific role change
          await logActivity(
            "role_changed",
            user,
            `Changed user role for ${user.username} from ${getRoleName(originalUser.userRole)} to ${getRoleName(user.userRole)}`,
          )
        }

        if (originalUser.userEmail !== user.userEmail) {
          changes.push(`email to ${user.userEmail}`)
        }

        if (originalUser.userPhoneNum !== user.userPhoneNum) {
          changes.push(`phone number to ${user.userPhoneNum}`)
        }

        if (user.passwd) {
          changes.push("password")
          // Log password change
          await logActivity("password_changed", user, `Password was changed for user: ${user.username}`)
        }
      }

      // Log general update if there were changes
      if (changes.length > 0) {
        const description = `Updated user ${user.username}: ${changes.join(", ")}`
        await logActivity("user_updated", user, description)
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
      await fetch(`http://localhost:8000/user-management/${id}`, { method: "DELETE" });
      //await fetch(`https://api.secuboard.live/user-management/${id}`, { method: "DELETE" });
      fetchUsers()
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const handleConfirmDelete = () => {
    setUsers(users.filter((user) => user.id !== userToDelete.id))
    setShowDeleteModal(false)
    setUserToDelete(null)
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
  console.log("User's Permissions:", userPermission)

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
      <Sidebar permissions = {userPermission} />
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
