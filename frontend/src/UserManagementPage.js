import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "./context/AuthContext" // Import useAuth
import Sidebar from "./Sidebar"
import DeleteConfirmationModal from "./components/modals/DeleteConfirmationModal"
import UserModal from "./components/modals/UserModal"  // Updated import
import SuspendConfirmationModal from "./components/modals/SuspendConfirmationModal"

const userRole = "1"
const UserManagementPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
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
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null);

  const fetchRoles = async () => {
    try {
      const response = await fetch ("http://127.0.0.1:8000/user-management/roles", {
          method: "GET",
        });

      if (response.ok) {
        const data = await response.json();
        setRoles(data); // Assuming the response is an array of permissions
      }else {
        throw new Error('Failed to fetch permissions');
      } 
    }
      catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    fetchRoles();
  }, []);

  const getRoleName = (roleId) => {
    const role = roles.find((role) => role.id === roleId);
    return role ? role.roleName : "Unknown";
  };


  const fetchUsers = async () => {
    try {
      const response = await fetch ("http://127.0.0.1:8000/user-management/", {
          method: "GET",
        });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched users:", data); // Add this line to inspect the fetched data
        setUsers(data); // Assuming the response is an array of users
      }else {
        throw new Error('Failed to fetch users');
      } 
    }
      catch (err) {
      setError("Failed to fetch users");
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = (users || []).filter(
    (user) =>
      (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getRoleName(user.userRole).toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userPhoneNum.includes(searchQuery),
  )

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSuspend = (user) => {
    setUserToSuspend(user)
    setShowSuspendModal(user)
  }

  const handleConfirmSuspend = () => {
    console.log("Confirm suspend user:", userToSuspend);
    userToSuspend.userSuspend = !userToSuspend.userSuspend;
    const updatedUser = {
      ...userToSuspend,
    };
  
    updateUserSuspend(updatedUser); // Update user suspend status in the backend
    setShowSuspendModal(false);
    setUserToSuspend(null);
  }

  const handleCloseSuspendModal = () => {
    setShowSuspendModal(false)
    setUserToSuspend(null)
  }

  const updateUserSuspend = async (user) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/user-management/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user), // Only send the suspended status
      });
  
      if (response.ok) {
        fetchUsers(); // Refresh the user list to reflect the updated status
      } else {
        throw new Error("Failed to update user suspend status");
      }
    } catch (err) {
      setError("Failed to update suspend status");
    }
  };

  const handleAdd = (user) => {
    // Set the selected user to be edited
  setSelectedUser(user);
  setShowNewUserModal(true); 
}

const addUser = async (user) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/user-management/`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to add user');
    }
    
    fetchUsers();
  } catch (err) {
    setError(err.message);
    // Optional: Add a timeout to clear the error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }
}

  const handleEdit = (user) => {
      // Set the selected user to be edited
    setSelectedUser(user);
    setShowNewUserModal(true); 
}

  const updateUser = async (user) => {
    try {
      const response = await fetch (`http://127.0.0.1:8000/user-management/${user.id}`, { method: "PUT", headers: {
        "Content-Type": "application/json", // Add this header to indicate the body is JSON
      },
        body: JSON.stringify(user), // Send userData as the payload to update the user
      });
  
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
  
      fetchUsers(); // Refresh the user list
    } catch (err) {
      setError("Failed to edit user");
    }
  };
  const handleDelete = async (user) => {
    await deleteUser(user.id);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/user-management/${id}`, { method: "DELETE" });
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

  const handleAddOrUpdateUser = (formData, id) => {
    if (id) {
      updateUser({ ...formData, id: id}); 
    } else {
      const newUser = {
        username: formData.username,
        userFirstName: formData.userFirstName,
        userLastName:formData.userLastName,
        userComName:formData.userComName,
        userRole: formData.userRole,
        userEmail: formData.userEmail,
        userPhoneNum: formData.userPhoneNum,
        passwd: formData.passwd,
        userSuspend: false,
      }
      addUser(newUser)
    }
    setShowNewUserModal(false)
    setSelectedUser(null)
  }

  const handleCloseModal = () => {
    setShowNewUserModal(false)
    setSelectedUser(null)
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
          <div style={{
            padding: "12px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px"
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
              onClick={() => setShowNewUserModal(true)}
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
            onClick={() => fetchUsers()}
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
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid #eee",
                    backgroundColor: user.userSuspend ? "#fff5f5" : "inherit",
                  }}
                >
                  <td style={{ padding: "16px" }}>{index + 1}</td>
                  <td style={{ padding: "16px" }}>{user.username}</td>
                  <td style={{ padding: "16px" }}>{user.name || `${user.userFirstName || ''} ${user.userLastName || ''}`.trim()}</td>
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
                        backgroundColor: user.userSuspend  ? "#ffcccb" : "#90EE90",
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
                          color: user.userSuspend ? "#2e7d32" : "#d32f2f",
                        }}
                        title={user.userSuspend ? "Reactivate User" : "Suspend User"}
                      >
                        {user.userSuspend ? "❌" : "✅"}
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
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
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
          <DeleteConfirmationModal user={selectedUser} onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} />
        )}

        {showSuspendModal && (
          <SuspendConfirmationModal
            user={userToSuspend}
            isSuspending={!userToSuspend.userSuspend}
            onClose={handleCloseSuspendModal}
            onConfirm={handleConfirmSuspend}
          />
        )}
      </div>
    </div>
  )
}

export default UserManagementPage