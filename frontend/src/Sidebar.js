import { useNavigate, useLocation } from "react-router-dom"

const Sidebar = ({ permissions }) => {
  const navigate = useNavigate()
  const location = useLocation()

  if (!permissions || permissions.length === 0) {
    console.log("No permissions provided");
    return null;
  }

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

  const allMenuItems = [
    { permission: "Roles & Permissions", label: "Roles and Permission Management", path: "/roles-permission", icon: "🔒" },
    { permission: "User Management", label: "User Management", path: "/user-management", icon: "👥" },
    { permission: "view_settings", label: "Settings", path: "/settings", icon: "⚙️" },
    { permission: "Dashboard", label: "Dashboard", path: "/dashboard", icon: "📊" },
    { permission: "Offences", label: "Offences", path: "/offences", icon: "🚨" },
    { permission: "Playbook Modal", label: "Playbooks", path: "/playbooks", icon: "📚" },
    { permission: "Event Logs", label: "Event Log Activity", path: "/event-log", icon: "📝" },
    { permission: "Reports Page", label: "Reports", path: "/reports", icon: "📄" },
    { permission: "Blacklist UI", label: "Blocklist Management", path: "/blocklist", icon: "🚫" },
    { permission: "System Configuration Page", label: "System Configurations", path: "/system-config", icon: "🔧" },
    { permission: "organization_requests", label: "Organization Requests", path: "/organization-requests", icon: "🏢" },
    { permission: "manage_organization", label: "Organization Management", path: "/organization-management", icon: "🔧" },
    { permission: "view_log_forwarding", label: "Log Forwarding", path: "/log-forwarding", icon: "📊" },
    { permission: "manage_api_access", label: "API Access Management", path: "/api-access", icon: "🔑" },
    { permission: "platform_settings", label: "Platform Settings", path: "/platform-settings", icon: "⚙️" },
  ];

  const accessibleMenuItems = allMenuItems.filter(item => permissions.includes(item.permission));
  
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
              />
              SecuBoard
            </h2>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {accessibleMenuItems.map((item) => (
              <li
                key={item.path}
                style={{
                  padding: "12px 16px",
                  background: isActive(item.path) ? "#555" : "#333",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate(item.path)}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                {item.label}
              </li>
            ))}
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
  );
};

export default Sidebar;