<<<<<<< Updated upstream
import { useState , useEffect} from "react"
=======
"use client"

import { useState, useEffect } from "react"
>>>>>>> Stashed changes
import { useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
<<<<<<< Updated upstream

const userRole = "organisation-admin"
=======
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
>>>>>>> Stashed changes

const DeleteConfirmationModal = ({ onClose, onConfirm }) => {
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
          borderRadius: "8px",
          padding: "24px",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Are you sure you want to delete this user account?</h3>
        <p style={{ marginBottom: "24px", color: "#666" }}>
          This action cannot be undone and all your data will be permanently deleted.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 24px",
              backgroundColor: "#90EE90",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "8px 24px",
              backgroundColor: "#ffcccb",
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
  )
}

const NewUserModal = ({ onClose, onConfirm, user = null }) => {
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    userid: '',
    userFirstName: '',
    userLastName: '',
    passwd: '',
    userComName: '',
    userEmail: '',
    userPhoneNum: '',
    userRole: 0,
    userSuspend: false,

  })
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

<<<<<<< Updated upstream
  const [errors, setErrors] = useState({
    userPhoneNum: "",
    passwd: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "userPhoneNum") {
      validatePhone(value)
    } else if (name === "passwd") {
      validatePassword(value)
    }
  }

  const validatePhone = (userPhoneNum) => {
    if (user && !userPhoneNum) {
      setErrors((prev) => ({ ...prev, userPhoneNum: "" }))
      return true
    }

    const phoneRegex = /^(\+\d{1,3}\s?)?[0-9]{8,10}$/

    if (!phoneRegex.test(userPhoneNum)) {
      setErrors((prev) => ({
        ...prev,
        userPhoneNum: "Please enter a valid phone number (8-10 digits with optional country code)",
      }))
      return false
    } else {
      setErrors((prev) => ({ ...prev, userPhoneNum: "" }))
      return true
    }
  }

  const validatePassword = (passwd) => {
    if (user && !passwd) {
      setErrors((prev) => ({ ...prev, passwd: "" }))
      return true
    }

    if (!user || passwd) {
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(passwd)
      const hasNumber = /\d/.test(passwd)
      const hasCapital = /[A-Z]/.test(passwd)

      if (!hasSymbol || !hasNumber || !hasCapital) {
        setErrors((prev) => ({
          ...prev,
          passwd: "Password must contain symbols, numbers, and capital letters",
        }))
        return false
      } else {
        setErrors((prev) => ({ ...prev, passwd: "" }))
        return true
      }
    }

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const isPhoneValid = validatePhone(formData.userPhoneNum)
    const isPasswordValid = validatePassword(formData.passwd)

    if (isPhoneValid && isPasswordValid) {
      onConfirm(formData, user?.id)
    }
  }

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
          borderRadius: "8px",
          width: "90%",
          maxWidth: "800px",
          padding: "24px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 24px 0" }}>{user ? "Modify User" : "New User"}</h2>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              alignItems: "start",
              "@media (max-width: 768px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Employee ID (username)</label>
                <input
                  type="text"
                  name="userid"
                  value={formData.userid}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box", // Added to prevent overflow
                  }}
                  required
                  disabled={!!user}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>First Name</label>
                <input
                  type="text"
                  name="userFirstName"
                  value={formData.userFirstName}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box", // Added to prevent overflow
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Last Name</label>
                <input
                  type="text"
                  name="userLastName"
                  value={formData.userLastName}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box", // Added to prevent overflow
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Role</label>
                <select
                  name="userRole"
                  value={formData.userRole}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box", // Added to prevent overflow
                  }}
                  required
                >
                  <option value=""disabled>Select Role</option>
                  {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roleName}
                  </option>
                ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Email</label>
                <input
                  type="email"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box", // Added to prevent overflow
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Phone</label>
                <input
                  type="tel"
                  name="userPhoneNum"
                  value={formData.userPhoneNum}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: errors.userPhoneNum ? "1px solid #ff4d4f" : "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box", // Added to prevent overflow
                  }}
                  placeholder="+65 98765432"
                  required
                />
                {errors.userPhoneNum && (
                  <p style={{ color: "#ff4d4f", fontSize: "12px", margin: "4px 0 0 0" }}>{errors.userPhoneNum}</p>
                )}
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Password</label>
                <input
                  type="password"
                  name="passwd"
                  value={formData.passwd}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: errors.passwd ? "1px solid #ff4d4f" : "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                    boxSizing: "border-box", // Added to prevent overflow
                  }}
                  required={!user}
                  placeholder={user ? "Leave blank to keep current password" : ""}
                />
                {errors.passwd && (
                  <p style={{ color: "#ff4d4f", fontSize: "12px", margin: "4px 0 0 0" }}>{errors.passwd}</p>
                )}
                <p style={{ color: "#666", fontSize: "12px", margin: "4px 0 0 0" }}>
                  Password must contain symbols, numbers, and capital letters.
                </p>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "24px",
            }}
          >
            <button
              type="submit"
              style={{
                padding: "8px 24px",
                backgroundColor: "#90EE90",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 24px",
                backgroundColor: "#ffcccb",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const SuspendConfirmationModal = ({ onClose, onConfirm, user, isSuspending }) => {
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
          borderRadius: "8px",
          padding: "24px",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
          {isSuspending
            ? `Are you sure you want to suspend ${user.userFirstName || ''} ${user.userLastName || ''}?`
            : `Are you sure you want to reactivate ${user.userFirstName || ''} ${user.userLastName || ''}?`}
        </h3>
        <p style={{ marginBottom: "24px", color: "#666" }}>
          {isSuspending
            ? "This user will no longer be able to access the system until reactivated."
            : "This will restore the user's access to the system."}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 24px",
              backgroundColor: "#90EE90",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "8px 24px",
              backgroundColor: "#ffcccb",
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
  )
}

const UserManagementPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [userToEdit, setEditUserIndex] = useState(null)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [userToSuspend, setUserToSuspend] = useState(null)
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null);
=======
  const getRoleName = (roleId) => {
    // Convert roleId to number for comparison if it's a string
    const roleIdNum = typeof roleId === "string" ? Number.parseInt(roleId, 10) : roleId
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
      const response = await fetch ("http://127.0.0.1:8000/user-management/", {
          method: "GET",
        });
=======
      const token = localStorage.getItem("token") // Get the token from localStorage
      const response = await fetch("http://127.0.0.1:8000/user-management/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the token in the headers
        },
      })
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
      (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userPhoneNum.includes(searchQuery),
=======
      (user.userComName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (getRoleName(user.userRole) || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.userPhoneNum || "").includes(searchQuery),
>>>>>>> Stashed changes
  )

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSuspend = (user) => {
    setUserToSuspend({ ...user })
    setShowSuspendModal(true)
  }

<<<<<<< Updated upstream
  const handleConfirmSuspend = () => {
    const updatedUser = {
      ...userToSuspend,
      suspended: !userToSuspend.userSuspend,
    };
  
    updateUserSuspend(updatedUser); // Update user suspend status in the backend
    setShowSuspendModal(false);
    setUserToSuspend(null);
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        body: JSON.stringify({ userSuspend: !user.userSuspend }), // Only send the suspended status
      });
  
      if (response.ok) {
        fetchUsers(); // Refresh the user list to reflect the updated status
      } else {
        throw new Error("Failed to update user suspend status");
=======
        body: JSON.stringify(newUser), // Send the user data in the request body
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to add user")
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  };

  const handleAdd = (user) => {
    // Set the selected user to be edited
  setSelectedUser(user);
  setShowNewUserModal(true); 
}

const addUser = async (user) => {
  try {
    await fetch(`http://127.0.0.1:8000/user-management/`, { method: "POST" , headers: {
      "Content-Type": "application/json", // Add this header to indicate the body is JSON
    },
      body: JSON.stringify(user), // Send userData as the payload to add the user
    });
    fetchUsers() 
  } catch (err) {
    setError("Failed to add user");
=======
>>>>>>> Stashed changes
  }


  const handleEdit = (user) => {
    setSelectedUser({ ...user })
    setShowNewUserModal(true)
  }

  const updateUser = async (user) => {
    try {
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const handleAddOrUpdateUser = (formData, userId) => {
    if (userId) {
      // Call updateUser if the user is being edited
      updateUser({ ...formData, id: userId }); // Ensure the formData has the necessary properties for the update
    } else {
      const newUser = {
        userid: formData.userid,
        userFirstName: formData.userFirstName,
        userLastName:formData.userLastName,
        userRole: formData.userRole,
        userEmail: formData.userEmail,
        userPhoneNum: formData.userPhoneNum,
        passwd: formData.passwd,
        userSuspend: false,
=======
  const handleAddOrUpdateUser = async (formData, id) => {
    try {
      if (id) {
        await updateUser({ ...formData, id: id })
      } else {
        await addUser(formData)
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
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
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Employee ID</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Name</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Role</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Email</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Phone</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Status</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Modify</th>
              </tr>
            </thead>
            <tbody>
<<<<<<< Updated upstream
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid #eee",
                    backgroundColor: user.userSuspend ? "#fff5f5" : "inherit",
                  }}
                >
                  <td style={{ padding: "16px" }}>{user.id}</td>
                  <td style={{ padding: "16px" }}>{user.userid}</td>
                  <td style={{ padding: "16px" }}>{user.name || `${user.userFirstName || ''} ${user.userLastName || ''}`.trim()}</td>
                  <td style={{ padding: "16px" }}>{user.userRole}</td>
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
=======
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "16px", textAlign: "center" }}>
                    Loading...
>>>>>>> Stashed changes
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
            Page 1 of 2
          </div>
        </div>

        {showNewUserModal && (
          <NewUserModal user={selectedUser} onClose={handleCloseModal} onConfirm={handleAddOrUpdateUser} />
        )}

        {showDeleteModal && (
<<<<<<< Updated upstream
          <DeleteConfirmationModal onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} />
=======
          <DeleteConfirmationModal
            user={userToDelete}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
          />
>>>>>>> Stashed changes
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

