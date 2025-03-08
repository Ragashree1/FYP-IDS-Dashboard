"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

// Add this new component at the top of the file
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
  const [formData, setFormData] = useState({
    employeeId: user?.employeeId || "",
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(formData, user?.id)
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
            }}
          >
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Employee ID (username)</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, employeeId: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                  }}
                  required
                  disabled={!!user}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                  }}
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                  }}
                  required={!user}
                  placeholder={user ? "Leave blank to keep current password" : ""}
                />
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

// In the UserManagementPage component, add these new state variables
const UserManagementPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [users, setUsers] = useState([
    {
      id: 1,
      employeeId: "SA01",
      name: "Ryan Atwood",
      email: "RyanAtwood@yahoo.com",
      phone: "98705564",
    },
    {
      id: 2,
      employeeId: "NA01",
      name: "Seth Cohen",
      email: "SethCohen@yahoo.com",
      phone: "97352790",
    },
    {
      id: 3,
      employeeId: "CA01",
      name: "Marissa Cooper",
      email: "MarissaCoop@gmail.com",
      phone: "92735234",
    },
    {
      id: 4,
      employeeId: "ITM01",
      name: "Summer Roberts",
      email: "SummerRob@hotmail.com",
      phone: "87354723",
    },
    {
      id: 5,
      employeeId: "SA02",
      name: "Kirsten Cohen",
      email: "Kirsten@yahoo.com",
      phone: "93214456",
    },
    {
      id: 6,
      employeeId: "NA02",
      name: "Sandy Cohen",
      email: "SandyCohen@yahoo.com",
      phone: "87709667",
    },
    {
      id: 7,
      employeeId: "CA02",
      name: "Julie Cooper",
      email: "JulieCooper@gmail.com",
      phone: "85658203",
    },
    {
      id: 8,
      employeeId: "ITM02",
      name: "Luke Ward",
      email: "LukeW@gmail.com",
      phone: "96689077",
    },
    {
      id: 9,
      employeeId: "CA03",
      name: "Theresa Diaz",
      email: "Theresa@hotmail.com",
      phone: "97554211",
    },
    {
      id: 10,
      employeeId: "DA01",
      name: "Anna Stern",
      email: "AnnaSt@yahoo.com",
      phone: "83314489",
    },
  ])

  const [selectedUser, setSelectedUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery),
  )

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleView = (user) => {
    console.log("Viewing user:", user)
    // Implement view functionality
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setShowNewUserModal(true)
  }

  // Update the handleDelete function
  const handleDelete = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  // Add this new function to handle the actual deletion
  const handleConfirmDelete = () => {
    setUsers(users.filter((user) => user.id !== userToDelete.id))
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  // Add this function to handle closing the delete modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  const handleAddOrUpdateUser = (formData, userId) => {
    if (userId) {
      // Update existing user
      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
              }
            : user,
        ),
      )
    } else {
      // Add new user
      const newUser = {
        id: users.length + 1,
        employeeId: formData.employeeId,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
      }
      setUsers([...users, newUser])
    }
    setShowNewUserModal(false)
    setSelectedUser(null)
  }

  const handleCloseModal = () => {
    setShowNewUserModal(false)
    setSelectedUser(null)
  }

  // In the return statement, add the DeleteConfirmationModal
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
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
            <img src="/images/secuboard-logo.png" alt="SecuBoard" style={{ width: "24px", height: "24px" }} />
            SecuBoard
          </h2>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li
            style={{
              padding: "12px 16px",
              marginBottom: "8px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/roles-permission")}
          >
            <span style={{ fontSize: "18px" }}>🔒</span>
            Roles and Permission Management
          </li>
          <li
            style={{
              padding: "12px 16px",
              background: "#333",
              marginBottom: "8px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
			onClick={() => navigate("/user-management")}
          >
            <span style={{ fontSize: "18px" }}>👥</span>
            User Management
          </li>
          <li
            style={{
              padding: "12px 16px",
              marginBottom: "8px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/settings")}
          >
            <span style={{ fontSize: "18px" }}>⚙️</span>
            Settings
          </li>
        </ul>

        <button
          onClick={() => navigate("/login")}
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
      <div style={{ flex: 1, padding: "32px" }}>
        <h1 style={{ margin: "0 0 8px 0" }}>User Management</h1>
        <h2 style={{ margin: "0 0 24px 0", fontWeight: "normal", color: "#666" }}>Users Details</h2>

        {/* Update the Add User button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setShowNewUserModal(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                color: "#666",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Add User 👆
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
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
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                color: "#666",
              }}
            >
              ⚡
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

        {/* Users Table */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>#</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Employee ID</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Name</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Email</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Phone</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Modify</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "16px" }}>{user.id}</td>
                  <td style={{ padding: "16px" }}>{user.employeeId}</td>
                  <td style={{ padding: "16px" }}>{user.name}</td>
                  <td style={{ padding: "16px" }}>{user.email}</td>
                  <td style={{ padding: "16px" }}>{user.phone}</td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                      <button
                        onClick={() => handleView(user)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        👁️
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
            Page 1 of 2
          </div>
        </div>

        {/* Add the New User Modal */}
        {showNewUserModal && (
          <NewUserModal user={selectedUser} onClose={handleCloseModal} onConfirm={handleAddOrUpdateUser} />
        )}
      </div>

      {/* Add the Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} />}
    </div>
  )
}

export default UserManagementPage

