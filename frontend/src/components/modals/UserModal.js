import { useState, useEffect } from "react";

const UserModal = ({ onClose, onConfirm, user = null }) => {
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    id: user?.id || '',
    username: user?.username || '',
    userFirstName: user?.userFirstName || '',
    userLastName: user?.userLastName || '',
    passwd: '',
    userComName: user?.userComName || 'Company Name',
    userEmail: user?.userEmail || '',
    userPhoneNum: user?.userPhoneNum || '',
    userRole: user?.userRole || 1,
    userSuspend: user?.userSuspend || false,
  })

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
};

export default UserModal;
