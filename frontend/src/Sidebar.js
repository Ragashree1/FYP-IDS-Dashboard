import { useNavigate, useLocation } from "react-router-dom"

const Sidebar = ({ userRole }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname.startsWith(path)

  const handleLogout = () => {
    navigate("/LandingPage")
  }

  // Updated sidebar container styles
  const sidebarContainerStyle = {
    width: "250px",
    background: "#222",
    color: "#fff",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
  }

  // Style for the scrollable content area
  const contentAreaStyle = {
    padding: "20px",
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  }

  // Style for the fixed logout button container
  const logoutContainerStyle = {
    padding: "20px",
    background: "#222",
    borderTop: "1px solid #333",
  }

  // Common logout button styles
  const logoutButtonStyle = {
    width: "100%",
    padding: "10px",
    background: "red",
    border: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    borderRadius: "4px",
  }

  // Spacer div style
  const spacerStyle = {
    width: "250px",
    flexShrink: 0,
  }

  // Render Organisation Admin sidebar
  if (userRole === "1") {
    return (
      <div style={{ display: "flex" }}>
        <div style={spacerStyle} />
        <div style={sidebarContainerStyle}>
          <div style={contentAreaStyle}>
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AwHpatwUXOxUSYkvlo8tVkBUyL8vzm.png"
                  alt="SecuBoard"
                  style={{ width: "24px", height: "24px" }}
                />{" "}
                SecuBoard
              </h2>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/roles-permission") ? "#555" : "#333",
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
                  background: isActive("/user-management") ? "#555" : "#333",
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
                  background: isActive("/settings") ? "#555" : "#333",
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
          </div>
          <div style={logoutContainerStyle}>
            <button onClick={() => navigate("/LandingPage")} style={logoutButtonStyle}>
              <span style={{ fontSize: "18px" }}>🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render Network Admin sidebar
  if (userRole === "2") {
    return (
      <div style={{ display: "flex" }}>
        <div style={spacerStyle} />
        <div style={sidebarContainerStyle}>
          <div style={contentAreaStyle}>
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AwHpatwUXOxUSYkvlo8tVkBUyL8vzm.png"
                  alt="SecuBoard"
                  style={{ width: "24px", height: "24px" }}
                />{" "}
                SecuBoard
              </h2>
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/dashboard") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/dashboard")}
              >
                <span style={{ fontSize: "18px" }}>📊</span>
                Dashboard
              </li>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/offences") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/offences")}
              >
                <span style={{ fontSize: "18px" }}>🚨</span>
                Offences
              </li>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/playbooks") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/playbooks")}
              >
                <span style={{ fontSize: "18px" }}>📚</span>
                Playbooks
              </li>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/event-log") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/event-log")}
              >
                <span style={{ fontSize: "18px" }}>📝</span>
                Event Log Activity
              </li>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/reports") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/reports")}
              >
                <span style={{ fontSize: "18px" }}>📄</span>
                Reports
              </li>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/blocklist") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/blocklist")}
              >
                <span style={{ fontSize: "18px" }}>🚫</span>
                Blocklist Management
              </li>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/system-config") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/system-config")}
              >
                <span style={{ fontSize: "18px" }}>🔧</span>
                System Configurations
              </li>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/settings") ? "#555" : "#333",
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
          </div>
          <div style={logoutContainerStyle}>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              <span style={{ fontSize: "18px" }}>🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render Platform Administrator sidebar
  if (userRole === "platform-admin") {
    return (
      <div style={{ display: "flex" }}>
        <div style={spacerStyle} />
        <div style={sidebarContainerStyle}>
          <div style={contentAreaStyle}>
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AwHpatwUXOxUSYkvlo8tVkBUyL8vzm.png"
                  alt="SecuBoard"
                  style={{ width: "24px", height: "24px" }}
                />{" "}
                SecuBoard
              </h2>
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/organization-requests") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/organization-requests")}
              >
                <span style={{ fontSize: "18px" }}>🏢</span>
                Organization Requests
              </li>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/organization-management") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/organization-management")}
              >
                <span style={{ fontSize: "18px" }}>🔧</span>
                Organization Management
              </li>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/log-forwarding") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/log-forwarding")}
              >
                <span style={{ fontSize: "18px" }}>📊</span>
                Log Forwarding
              </li>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/api-access") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/api-access")}
              >
                <span style={{ fontSize: "18px" }}>🔑</span>
                API Access Management
              </li>
              <li
                style={{
                  padding: "12px 16px",
                  background: isActive("/platform-settings") ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/platform-settings")}
              >
                <span style={{ fontSize: "18px" }}>⚙️</span>
                Platform Settings
              </li>
            </ul>
          </div>
          <div style={logoutContainerStyle}>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              <span style={{ fontSize: "18px" }}>🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Return null for any other user role
  return null
}

export default Sidebar
