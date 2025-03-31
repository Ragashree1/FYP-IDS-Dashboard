"use client"

import { useState, useEffect } from "react"

const UserModal = ({ onClose, onConfirm, user = null, fixedRole }) => {
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    id: user?.id || "",
    username: user?.username || "",
    userFirstName: user?.userFirstName || "",
    userLastName: user?.userLastName || "",
    passwd: "",
    userComName: user?.userComName || "Company Name",
    userEmail: user?.userEmail || "",
    userPhoneNum: user?.userPhoneNum || "",
    userRole: fixedRole || user?.userRole || 1,
    userSuspend: user?.userSuspend || false,
  })

  const fetchRoles = async () => {
    try {
      // Get token from localStorage or use mock token for platform admin
      const token = localStorage.getItem("token") || "mock-token-for-platform-admin"

      const response = await fetch("http://127.0.0.1:8000/user-management/roles", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched roles in modal:", data) // Debug log

        // Make sure we have at least the default roles if the API returns empty
        if (data && data.length > 0) {
          setRoles(data)
        } else {
          // Provide default roles if none are returned from the API
          setRoles([
            { id: 1, roleName: "Organisation Admin" },
            { id: 2, roleName: "Network Admin" },
          ])
        }

        // If no role is selected yet, set the first role as default
        if (!formData.userRole && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            userRole: data[0].id,
          }))
        }
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

  useEffect(() => {
    fetchRoles()

    // Update the role if fixedRole is provided
    if (fixedRole !== undefined) {
      setFormData((prev) => ({
        ...prev,
        userRole: fixedRole,
      }))
    }
  }, [fixedRole])

  const [errors, setErrors] = useState({
    userPhoneNum: "",
    passwd: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    // If the field is userRole and fixedRole is provided, don't update
    if (name === "userRole" && fixedRole !== undefined) {
      return
    }

    // For userRole, convert the value to a number
    if (name === "userRole") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }))
      console.log(`Role selected: ${value} (type: ${typeof Number(value)})`) // Debug log
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

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
      // Ensure the role is set to the fixed role if provided
      // Make sure userRole is a number
      const dataToSubmit = {
        ...formData,
        userRole: fixedRole !== undefined ? Number(fixedRole) : Number(formData.userRole),
      }

      console.log("Submitting user data:", dataToSubmit) // Debug log
      onConfirm(dataToSubmit, user?.id)
    }
  }

  // Find the role name for the current role ID
  const getCurrentRoleName = () => {
    // Handle specific role IDs
    if (fixedRole === 1 || formData.userRole === 1) {
      return "Organisation Admin"
    } else if (fixedRole === 2 || formData.userRole === 2) {
      return "Network Admin"
    }

    const role = roles.find((r) => r.id === (fixedRole || formData.userRole))
    return role ? role.roleName : "Loading..."
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
                <label style={{ display: "block", marginBottom: "8px" }}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
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
                {fixedRole !== undefined ? (
                  // If role is fixed, show a disabled input with the role name
                  <div>
                    <input
                      type="text"
                      value={getCurrentRoleName()}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: "#e9e9e9",
                        boxSizing: "border-box",
                        cursor: "not-allowed",
                      }}
                      disabled
                    />
                    <p style={{ color: "#666", fontSize: "12px", margin: "4px 0 0 0" }}>
                      Role is fixed for this user type
                    </p>
                  </div>
                ) : (
                  // Otherwise, show the dropdown
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
                      boxSizing: "border-box",
                    }}
                    required
                  >
                    {roles.length === 0 ? (
                      <option value="">Loading roles...</option>
                    ) : (
                      roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.roleName}
                        </option>
                      ))
                    )}
                  </select>
                )}
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
                    boxSizing: "border-box",
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

export default UserModal