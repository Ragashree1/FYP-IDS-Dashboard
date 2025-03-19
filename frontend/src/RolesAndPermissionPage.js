
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
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Are you sure you want to delete this role?</h3>
        <p style={{ marginBottom: "24px", color: "#666" }}>
          This action cannot be undone and all permissions associated with this role will be permanently deleted.
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

const RoleDetailModal = ({ onClose, onConfirm, role = null }) => {
  const [formData, setFormData] = useState({
    role: role?.name || "",
    permissions: role?.permissions || [],
  })
  const [searchPermissions, setSearchPermissions] = useState("")

  const permissions = [
    "Blacklist UI",
    "Summarized Reports",
    "Approve Changes",
    "View Audit Logs",
    "View Audit Logs of users account",
    "System Configuration",
  ]

  const filteredPermissions = permissions.filter((permission) =>
    permission.toLowerCase().includes(searchPermissions.toLowerCase()),
  )

  const handlePermissionToggle = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  const handleConfirm = () => {
    if (!formData.role.trim()) {
      alert("Please enter a role name")
      return
    }
    onConfirm(formData)
    onClose()
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
        <h2 style={{ margin: "0 0 20px 0" }}>{role ? "Edit Role" : "Create Role"}</h2>
        <div
          style={{
            display: "flex",
            gap: "24px",
            flexDirection: "row",
            flexWrap: "wrap", // Added to prevent overflow on small screens
          }}
        >
          {/* Left Side - Role Input */}
          <div style={{ flex: "1 1 300px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>Role Name</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="Enter role name"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#f5f5f5",
                  boxSizing: "border-box", // Added to prevent overflow
                }}
              />
            </div>
          </div>

          {/* Right Side - Permissions */}
          <div style={{ flex: "1 1 300px" }}>
            <h3 style={{ margin: "0 0 16px 0" }}>Permissions</h3>
            <input
              type="text"
              placeholder="Search permissions"
              value={searchPermissions}
              onChange={(e) => setSearchPermissions(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#e0e0e0",
                boxSizing: "border-box", // Added to prevent overflow
              }}
            />
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "16px",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {filteredPermissions.map((permission) => (
                <div
                  key={permission}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                    style={{ marginRight: "8px" }}
                  />
                  <label htmlFor={permission}>{permission}</label>
                </div>
              ))}
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
            onClick={handleConfirm}
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

const RolesAndPermissionPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Organisation Admin",
      permissions: ["Blacklist UI", "Summarized Reports", "System Configuration"],
    },
    {
      id: 2,
      name: "Network Admin",
      permissions: ["View Audit Logs", "System Configuration"],
    },
    {
      id: 3,
      name: "Data Analyst",
      permissions: ["View Audit Logs", "View Audit Logs of users account"],
    },
    {
      id: 4,
      name: "IT Manager",
      permissions: ["Approve Changes", "System Configuration"],
    },
  ])

  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [showRoleFilter, setShowRoleFilter] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState(null)

  const uniqueRoles = ["All Roles", ...new Set(roles.map((role) => role.name))]

  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = roleFilter === "All Roles" || role.name === roleFilter
    return matchesSearch && matchesFilter
  })

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleOpenModal = (role = null) => {
    setSelectedRole(role)
    setShowRoleModal(true)
  }

  const handleConfirmRole = (formData) => {
    if (selectedRole) {
      // Modify existing role
      setRoles(
        roles.map((role) =>
          role.id === selectedRole.id
            ? {
                ...role,
                name: formData.role,
                permissions: formData.permissions,
              }
            : role,
        ),
      )
    } else {
      // Add new role
      const newRole = {
        id: roles.length + 1,
        name: formData.role,
        permissions: formData.permissions,
      }
      setRoles([...roles, newRole])
    }
    setShowRoleModal(false)
  }

  const handleDelete = (role) => {
    setRoleToDelete(role)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    setRoles(roles.filter((role) => role.id !== roleToDelete.id))
    setShowDeleteModal(false)
    setRoleToDelete(null)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setRoleToDelete(null)
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
        <h1 style={{ margin: "0 0 8px 0" }}>Roles & Permission Management</h1>
        <h2 style={{ margin: "0 0 24px 0", fontWeight: "normal", color: "#666" }}>Role Details & Permissions</h2>

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
              onClick={() => handleOpenModal()}
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
            Add Role
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap", // Added to prevent overflow on small screens
            }}
          >
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
              <button
                onClick={() => setShowRoleFilter(!showRoleFilter)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#666",
                }}
              >
                🝖
              </button>
              {showRoleFilter && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    zIndex: 10,
                    width: "150px",
                  }}
                >
                  {uniqueRoles.map((role) => (
                    <div
                      key={role}
                      onClick={() => {
                        setRoleFilter(role)
                        setShowRoleFilter(false)
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: roleFilter === role ? "#f0f0f0" : "transparent",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Roles</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Modify</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "16px" }}>{role.id}</td>
                  <td style={{ padding: "16px", textAlign: "center" }}>{role.name}</td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                      <button
                        onClick={() => handleOpenModal(role)}
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
                        onClick={() => handleDelete(role)}
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

        {showRoleModal && (
          <RoleDetailModal role={selectedRole} onClose={() => setShowRoleModal(false)} onConfirm={handleConfirmRole} />
        )}

        {showDeleteModal && (
          <DeleteConfirmationModal onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} />
        )}
      </div>
    </div>
  )
}

export default RolesAndPermissionPage

