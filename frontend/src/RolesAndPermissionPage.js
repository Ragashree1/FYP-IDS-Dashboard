"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const RoleDetailModal = ({ onClose, onConfirm, employee = null }) => {
  const [formData, setFormData] = useState({
    employeeId: employee?.employeeId || "",
    firstName: employee?.name?.split(" ")[0] || "",
    lastName: employee?.name?.split(" ")[1] || "",
    role: employee?.role || "Select Role",
    permissions: [],
  })
  const [searchPermissions, setSearchPermissions] = useState("")

  const availableRoles = [
    "Select Role",
    "IT Manager",
    "System Admin",
    "Network Admin",
    "Cybersecurity Analyst",
    "Data Analyst",
  ]

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
    if (formData.role === "Select Role") {
      alert("Please select a role")
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
        }}
      >
        <div style={{ display: "flex", gap: "24px" }}>
          {/* Left Side - Role Details */}
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 20px 0" }}>Role Detail</h2>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px" }}>Employee ID</label>
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
                disabled={!!employee}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
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
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
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
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>Roles</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#f5f5f5",
                }}
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Side - Permissions */}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 16px 0" }}>Permissions</h3>
            <input
              type="text"
              placeholder="Search"
              value={searchPermissions}
              onChange={(e) => setSearchPermissions(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#e0e0e0",
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
          width: "90%",
          maxWidth: "400px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginBottom: "16px" }}>Are you sure you want to delete this user account?</h3>
        <p style={{ marginBottom: "24px", color: "#666" }}>
          This action cannot be undone and all your data will be permanently deleted.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
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

const RolesAndPermissionPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employees, setEmployees] = useState([
    { id: 1, employeeId: "SA01", name: "Ryan Atwood", role: "System Admin" },
    { id: 2, employeeId: "NA01", name: "Seth Cohen", role: "Network Admin" },
    { id: 3, employeeId: "CA01", name: "Marissa Cooper", role: "Cybersecurity Analyst" },
    { id: 4, employeeId: "ITM01", name: "Summer Roberts", role: "Network Admin" },
    { id: 5, employeeId: "SA02", name: "Kirsten Cohen", role: "System Admin" },
    { id: 6, employeeId: "NA02", name: "Sandy Cohen", role: "Network Admin" },
    { id: 7, employeeId: "CA02", name: "Julie Cooper", role: "Cybersecurity Analyst" },
    { id: 8, employeeId: "ITM02", name: "Luke Ward", role: "IT Manager" },
    { id: 9, employeeId: "CA03", name: "Theresa Diaz", role: "Cybersecurity Analyst" },
    { id: 10, employeeId: "DA01", name: "Anna Stern", role: "Data Analyst" },
  ])

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleOpenModal = (employee = null) => {
    setSelectedEmployee(employee)
    setShowRoleModal(true)
  }

  const handleConfirmRole = (formData) => {
    if (selectedEmployee) {
      // Modify existing employee
      setEmployees(
        employees.map((emp) =>
          emp.id === selectedEmployee.id
            ? {
                ...emp,
                name: `${formData.firstName} ${formData.lastName}`,
                role: formData.role,
              }
            : emp,
        ),
      )
    } else {
      // Add new employee
      const newEmployee = {
        id: employees.length + 1,
        employeeId: formData.employeeId,
        name: `${formData.firstName} ${formData.lastName}`,
        role: formData.role,
      }
      setEmployees([...employees, newEmployee])
    }
    setShowRoleModal(false)
  }

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee)
    setShowDeleteConfirmation(true)
  }

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      setEmployees(employees.filter((emp) => emp.id !== employeeToDelete.id))
      setShowDeleteConfirmation(false)
      setEmployeeToDelete(null)
    }
  }

  // Rest of the component remains the same...
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
              background: "#333",
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
        <h1 style={{ margin: "0 0 8px 0" }}>Roles & Permission Management</h1>
        <h2 style={{ margin: "0 0 24px 0", fontWeight: "normal", color: "#666" }}>Role Details & Permissions</h2>

        {/* Search and Add Role */}
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
              onClick={() => handleOpenModal()}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "24px",
                color: "#666",
                display: "flex",
                alignItems: "center",
              }}
            >
              Roles +
            </button>
          </div>
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
        </div>

        {/* Table */}
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
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Roles</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Modify</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "16px" }}>{employee.id}</td>
                  <td style={{ padding: "16px" }}>{employee.employeeId}</td>
                  <td style={{ padding: "16px" }}>{employee.name}</td>
                  <td style={{ padding: "16px" }}>{employee.role}</td>
                  <td style={{ padding: "16px" }}>
                    <button
                      onClick={() => handleOpenModal(employee)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        marginRight: "8px",
                      }}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteClick(employee)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        color: "red",
                      }}
                    >
                      🗑️
                    </button>
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

        {/* Role Detail Modal */}
        {showRoleModal && (
          <RoleDetailModal
            employee={selectedEmployee}
            onClose={() => setShowRoleModal(false)}
            onConfirm={handleConfirmRole}
          />
        )}
        {showDeleteConfirmation && (
          <DeleteConfirmationModal onClose={() => setShowDeleteConfirmation(false)} onConfirm={handleDeleteConfirm} />
        )}
      </div>
    </div>
  )
}

export default RolesAndPermissionPage

