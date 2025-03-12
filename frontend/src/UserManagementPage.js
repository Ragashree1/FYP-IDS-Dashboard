"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"

const userRole = "organisation-admin"

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
    role: user?.role || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
  });

  const [errors, setErrors] = useState({
    phone: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'phone') {
      validatePhone(value);
    } else if (name === 'password') {
      validatePassword(value);
    }
  };

  const validatePhone = (phone) => {
    if (user && !phone) {
      setErrors(prev => ({ ...prev, phone: "" }));
      return true;
    }
    
    const phoneRegex = /^(\+\d{1,3}\s?)?[0-9]{8,10}$/;
    
    if (!phoneRegex.test(phone)) {
      setErrors(prev => ({ 
        ...prev, 
        phone: "Please enter a valid phone number (8-10 digits with optional country code)" 
      }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, phone: "" }));
      return true;
    }
  };

  const validatePassword = (password) => {
    if (user && !password) {
      setErrors(prev => ({ ...prev, password: "" }));
      return true;
    }
    
    if (!user || password) {
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasCapital = /[A-Z]/.test(password);
      
      if (!hasSymbol || !hasNumber || !hasCapital) {
        setErrors(prev => ({ 
          ...prev, 
          password: "Password must contain symbols, numbers, and capital letters" 
        }));
        return false;
      } else {
        setErrors(prev => ({ ...prev, password: "" }));
        return true;
      }
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isPhoneValid = validatePhone(formData.phone);
    const isPasswordValid = validatePassword(formData.password);
    
    if (isPhoneValid && isPasswordValid) {
      onConfirm(formData, user?.id);
    }
  };

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
            }}
          >
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Employee ID (username)</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
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
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
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
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
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
                <label style={{ display: "block", marginBottom: "8px" }}>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                  }}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Organisation Admin">Organisation Admin</option>
                  <option value="Network Admin">Network Admin</option>
                  <option value="IT Manager">IT Manager</option>
				  <option value="Data Analyst">Data Analyst</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: errors.phone ? "1px solid #ff4d4f" : "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                  }}
                  placeholder="+65 98765432"
                  required
                />
                {errors.phone && (
                  <p style={{ color: "#ff4d4f", fontSize: "12px", margin: "4px 0 0 0" }}>
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: errors.password ? "1px solid #ff4d4f" : "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5",
                  }}
                  required={!user}
                  placeholder={user ? "Leave blank to keep current password" : ""}
                />
                {errors.password && (
                  <p style={{ color: "#ff4d4f", fontSize: "12px", margin: "4px 0 0 0" }}>
                    {errors.password}
                  </p>
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
  );
};

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
      role: "Organisation Admin",
      email: "RyanAtwood@yahoo.com",
      phone: "98705564",
    },
    {
      id: 2,
      employeeId: "NA01",
      name: "Seth Cohen",
      role: "Network Admin",
      email: "SethCohen@yahoo.com",
      phone: "97352790",
    },
    {
      id: 3,
      employeeId: "CA01",
      name: "Marissa Cooper",
      role: "Network Admin",
      email: "MarissaCoop@gmail.com",
      phone: "92735234",
    },
    {
      id: 4,
      employeeId: "ITM01",
      name: "Summer Roberts",
      role: "Data Analyst",
      email: "SummerRob@hotmail.com",
      phone: "87354723",
    },
    {
      id: 5,
      employeeId: "SA02",
      name: "Kirsten Cohen",
      role: "Organisation Admin",
      email: "Kirsten@yahoo.com",
      phone: "93214456",
    },
    {
      id: 6,
      employeeId: "NA02",
      name: "Sandy Cohen",
      role: "Network Admin",
      email: "SandyCohen@yahoo.com",
      phone: "87709667",
    },
    {
      id: 7,
      employeeId: "CA02",
      name: "Julie Cooper",
      role: "Network Admin",
      email: "JulieCooper@gmail.com",
      phone: "85658203",
    },
    {
      id: 8,
      employeeId: "ITM02",
      name: "Luke Ward",
      role: "IT Manager",
      email: "LukeW@gmail.com",
      phone: "96689077",
    },
    {
      id: 9,
      employeeId: "CA03",
      name: "Theresa Diaz",
      role: "IT Manager",
      email: "Theresa@hotmail.com",
      phone: "97554211",
    },
    {
      id: 10,
      employeeId: "DA01",
      name: "Anna Stern",
      role: "Network Admin",
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
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery),
  )

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleView = (user) => {
    console.log("Viewing user:", user)
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setShowNewUserModal(true)
  }

  const handleDelete = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    setUsers(users.filter((user) => user.id !== userToDelete.id))
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  const handleAddOrUpdateUser = (formData, userId) => {
    if (userId) {
      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                name: `${formData.firstName} ${formData.lastName}`,
                role: formData.role,
                email: formData.email,
                phone: formData.phone,
              }
            : user,
        ),
      )
    } else {
      const newUser = {
        id: users.length + 1,
        employeeId: formData.employeeId,
        name: `${formData.firstName} ${formData.lastName}`,
        role: formData.role,
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

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f4f4f4" }}>
      <Sidebar userRole={userRole} />

      <div style={{ flex: 1, padding: "32px" }}>
        <h1 style={{ margin: "0 0 8px 0" }}>User Management</h1>
        <h2 style={{ margin: "0 0 24px 0", fontWeight: "normal", color: "#666" }}>Users Details</h2>

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
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Role</th>
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
                  <td style={{ padding: "16px" }}>{user.role}</td>
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

        {showNewUserModal && (
          <NewUserModal user={selectedUser} onClose={handleCloseModal} onConfirm={handleAddOrUpdateUser} />
        )}

        {showDeleteModal && <DeleteConfirmationModal onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} />}
      </div>
    </div>
  )
}

export default UserManagementPage