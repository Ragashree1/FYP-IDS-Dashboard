import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"
import { checkPermissions, fetchPermissions } from "./utils/check_permissions"

import Sidebar from "./Sidebar" // Import the Sidebar component

const permission = "Blacklist UI"

const API_URL = "http://localhost:8000/ip-blocking"; // backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const getOrgId = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const response = await fetch(`${API_BASE_URL}/login/get_user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data.user.organization_id;
};

const fetchBlockedIPs = async (setBlocklist, navigate) => {
  const token = localStorage.getItem("token");
  const orgId = await getOrgId();

  if (!orgId || !token) {
    alert("Missing authentication info. Please log in again.");
    localStorage.clear();
    navigate("/login");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/ip-blocking/${orgId}/blocked-ips`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.status === 403) {
      alert("Access denied: You are not authorized to view this organization's blocklist.");
      return;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched Blocked IPs:", data);  // Debugging log

    console.log("API Response:", data); // Log the API response
    console.log("Data Type:", typeof data); // Log the type of data

    if (!Array.isArray(data.blocked_ips)) {
      throw new Error("Invalid API response: expected an array of objects");
    }

    setBlocklist(data.blocked_ips.map(({ ip, reason }) => ({
      ip,
      reason: reason || "No reason provided"
    })));
  } catch (error) {
    console.error("Error fetching blocked IPs:", error);
    alert("Could not connect to the server: " + error.message);
  }
};

const AddBlocklistModal = ({ onClose, onAdd }) => {
  const [newIP, setNewIP] = useState("")
  const [reason, setReason] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newIP && reason) {
      onAdd(newIP, reason) // Pass newIP and reason to onAdd
      onClose()
    }
  }

  return (
    <div
  style={{
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    border: "1px solid #000",
    borderRadius: "4px",
    padding: "20px",
    width: "90%",
    maxWidth: "400px",
    zIndex: 1000,
    textAlign: "center", // Center text inside the modal
  }}
>
  <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Add to Blocklist</h2>
  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ width: "100%", textAlign: "left" }}>
      <label style={{ display: "block", marginBottom: "8px", color: "#666" }}>
        IP Address to block
      </label>
      <input
        type="text"
        value={newIP}
        onChange={(e) => setNewIP(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          marginBottom: "15px",
          boxSizing: "border-box",
        }}
      />
      <label style={{ display: "block", marginBottom: "8px", color: "#666" }}>
        Reason for blocking
      </label>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          marginBottom: "15px",
          boxSizing: "border-box",
        }}
      />
    </div>
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", width: "100%" }}>
      <button
        type="submit"
        style={{
          padding: "6px 20px",
          backgroundColor: "#90EE90",
          color: "black",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Add
      </button>
      <button
        type="button"
        onClick={onClose}
        style={{
          padding: "6px 20px",
          backgroundColor: "#ffcccb",
          color: "black",
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

  )
}

const RemoveIPModal = ({ onClose, onRemove, ipToRemove }) => {
  const [reason, setReason] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onRemove(ipToRemove, reason)
    onClose()
  }

  return (
      <div
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      border: "1px solid #000",
      borderRadius: "4px",
      padding: "20px",
      width: "90%",
      maxWidth: "600px",
      zIndex: 1000,
      textAlign: "center", // Center text inside the modal
    }}
  >
    <h2 style={{ margin: "0 0 20px 0" }}>Are you sure you want to remove blocked IP?</h2>
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", textAlign: "left" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          IP Address to Remove
        </label>
        <input
          type="text"
          value={ipToRemove}
          disabled
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            marginBottom: "15px",
            backgroundColor: "#f5f5f5",
            boxSizing: "border-box",
          }}
        />
      </div>
      
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", width: "100%" }}>
        <button
          type="submit"
          style={{
            padding: "6px 20px",
            backgroundColor: "#90EE90",
            color: "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Remove
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: "6px 20px",
            backgroundColor: "#ffcccb",
            color: "black",
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

  )
}
const PermissionDeniedPopup = () => (
  <div className="permission-popup-overlay">
    <div className="success-popup">
      <div className="success-popup-header">
        <div className="success-popup-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <circle cx="12" cy="16" r="1"></circle>
          </svg>
        </div>
        <div className="success-popup-title">PERMISSION DENIED</div>
      </div>
      <div className="success-popup-content">
        <div className="success-popup-message">
          You do not have permission to view this page.
        </div>
      </div>
    </div>
  </div>
);


const BlocklistManagementPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [selectedIP, setSelectedIP] = useState(null)
  const [blocklist, setBlocklist] = useState([])
  const [userOrgId, setUserOrgId] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [userPermission, setuserPermission] = useState([]) ;
  const [error, setError] = useState(null);


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };  

  useEffect(() => {
    const fetchOrgAndBlocklist = async () => {
      const orgId = await getOrgId();
      if (!orgId) {
        alert("Missing authentication info. Please log in again.");
        navigate("/login");
        return;
      }
      setUserOrgId(orgId);
      fetchBlockedIPs(setBlocklist, navigate);
    };
    fetchOrgAndBlocklist();
  }, [navigate]);  

    useEffect(() => {
    const verifyPermissions = async () => {
      const allowed = await checkPermissions(permission);
      setHasPermission(allowed);
      if (!allowed) {
        setShowWarning(true);
      }
    };

    verifyPermissions();
  }, []);
  
  const getUserPermission = async () => {
    const perm  = await fetchPermissions();
    setuserPermission(perm);
    if (!perm) {
      setError("Failed to fetch user's permission for Sidebar");
    }
  };
  
  useEffect(() => {
    getUserPermission();
  }, []);
  
  if (!hasPermission) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar permissions = {userPermission} />
        <div style={{ flex: 1, position: 'relative' }}>
          {showWarning && <PermissionDeniedPopup />}
        </div>
      </div>
    );
  }

  const isActive = (path) => location.pathname.startsWith(path)

  const handleLogout = () => {
    navigate("/login")
  }

  const handleRemoveIP = async (ip) => {
    try {
      const token = localStorage.getItem("token");
      const orgId = userOrgId;
      const response = await fetch(`${API_URL}/unblock-ip/${ip}?org_id=${orgId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    
      if (!response.ok){
        const data = await response.json();
        alert(data.detail || "Failed to remove IP");
        console.error("Failed to remove IP:", data.detail || "Failed to remove IP");
        return;
      }
    
      setBlocklist((prevBlocklist) => prevBlocklist.filter((item) => item.ip !== ip)); 
    } catch (error) {
      console.error("Error removing IP:", error);
      alert("Error removing IP: " + error.message);
    }
  };    

  const handleAddIP = async (ip, reason) => {
    try {
      const orgId = userOrgId;
      if (!orgId) {
        alert("Organization ID not loaded.");
        return;
      }
      const response = await fetch(`${API_URL}/block-ip/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: ip.trim(),
          reason: reason.trim(),
          organization_id: orgId
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Backend error:", data);
        alert("Failed to block IP: " + (data.detail || JSON.stringify(data)));
        return;
      }
  
      alert("IP blocked successfully");
      fetchBlockedIPs(setBlocklist, navigate);
    } catch (error) {
      console.error("Frontend error:", error);
      alert("Network error: " + error.message);
    }
  };
  
  const handleIPClick = (ip) => {
    setSelectedIP(ip)
    setShowRemoveModal(true)
  }

  const filteredBlocklist = blocklist.filter((item) => item.ip.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f4f4f4",
        overflow: "hidden",
      }}
    >
      <Sidebar permissions = {userPermission} />

      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <h1>Blocklist Management</h1>

        <div
          style={{
            position: "relative",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Search by IP Address"
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: "100%",
              padding: "10px 35px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "14px",
              backgroundColor: "#f5f5f5",
              boxSizing: "border-box", 
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666",
            }}
          >
            🔍
          </span>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h2>Blocklist List</h2>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#666",
              }}
            >
              <span>IP address</span>
              <span style={{ fontSize: "12px" }}>⊕</span>
            </button>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "4px",
              overflow: "auto", 
              maxWidth: "100%", 
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "15px",
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      backgroundColor: "#f8f8f8",
                    }}
                  >
                    IP Address
                  </th>
                  <th
                    style={{
                      padding: "15px",
                      textAlign: "left",
                      borderBottom: "1px solid #eee",
                      backgroundColor: "#f8f8f8",
                    }}
                  >
                    Reason for adding
                  </th>
                  <th
                    style={{
                      padding: "15px",
                      width: "50px",
                      borderBottom: "1px solid #eee",
                      backgroundColor: "#f8f8f8",
                    }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocklist.map((item) => (
                  <tr key={item.ip}>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                      }}
                      onClick={() => handleIPClick(item.ip)}
                    >
                      {item.ip}
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {item.reason}
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #eee",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={() => handleIPClick(item.ip)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#666",
                          padding: "5px",
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && <AddBlocklistModal onClose={() => setShowAddModal(false)} onAdd={handleAddIP} />}
        {showRemoveModal && (
          <RemoveIPModal ipToRemove={selectedIP} onClose={() => setShowRemoveModal(false)} onRemove={handleRemoveIP} />
        )}
      </div>
    </div>
  )
}

export default BlocklistManagementPage