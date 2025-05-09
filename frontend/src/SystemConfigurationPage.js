import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const userRole = "2";

const AddIPModal = ({ onClose, onAdd }) => {
  const [newIP, setNewIP] = useState("");
  const [userOrgId, setOrgId] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newIP) {
      onAdd(newIP);
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

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
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "400px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>Add IP address</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#666",
              }}
            >
              IP Address to add
            </label>
            <input
              type="text"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              placeholder="Enter IP address"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginBottom: "15px",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const SystemConfiguration = () => {
  const [logType, setLogType] = useState("all");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState([]); // Ensure clients is initialized as an empty array
  const [logs, setLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userOrgId, setOrgId] = useState(0);

  const fetchVerifiedIPs = async (orgId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ip-verification/verified-ips/${orgId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch verified IPs");
      }
      const data = await response.json();
      setClients(data[0]);
      console.log("printing data.verified_ips")
      console.log(data.verified_ips)
      console.log("printing clients")
      console.log(clients)
      console.log(orgId)
      console.log(data)
    } catch (error) {
      console.error("Error fetching verified IPs:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  

  const handleRemoveClient = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ip-verification/remove-ip/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove IP");
      }

      fetchVerifiedIPs(userOrgId); // Refresh the list after deletion
      setClients((prevClients) => prevClients.filter((client) => client.id !== id));
      alert("IP removed successfully!");
    } catch (error) {
      console.error("Error removing IP:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddIP = async (newIP) => {
    // const token = localStorage.getItem("token");
    // const response = await fetch(`${API_BASE_URL}/login/get_user`, {
    //   headers: { Authorization: `Bearer ${token}` },
    // });

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || "Failed to fetch user details");
    // }

    // const data = await response.json();
    // console.log(data)
    // const orgId = data.user.organization_id;
    // if (!orgId) {
    //   alert("Organization ID is missing. Please register again." + token);
    //   return;
    // }

    try {
      const response = await fetch(`${API_BASE_URL}/ip-verification/verify-ip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization_id: userOrgId, ip: newIP }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify IP");
      }

      alert("IP verified successfully!");
      fetchVerifiedIPs(getOrgId()); // Refresh the list after adding
      console.log(fetchVerifiedIPs(userOrgId))
      // setClients((prevClients) => [...prevClients, { ip: newIP }]); // Add the new IP to the list
    } catch (error) {
      console.error("Error verifying IP:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const getOrgId = async () => {
    const token = localStorage.getItem("token");
    console.log("printing token ")
    console.log(token)
    const response = await fetch(`${API_BASE_URL}/login/get_user`, {
      headers : { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) { 
      return null;
    }
    const data = await response.json();
    console.log("printing data")
    console.log(data)
    return data.user.organization_id;}


    useEffect(() => {
      const fetchOrgAndIPs = async () => {
        const fetchedOrgId = await getOrgId();
        if (!fetchedOrgId) {
          alert("Organization ID is missing. Please register again.");
          return;
        }
        setOrgId(fetchedOrgId);
        fetchVerifiedIPs(fetchedOrgId);
        console.log("printing fetchedOrgId")
        console.log(fetchedOrgId)
        console.log("printing userOrgId")
        console.log(userOrgId)
      };
    
      // Only run on page load
      fetchOrgAndIPs();

    }, []);

  // useEffect(() => {
  //   (async () => {
  //     if (userOrgId == 0) {
  //       const fetchedOrgId = await getOrgId();
  //       setOrgId(fetchedOrgId);
  //       console.log("printing fetchedOrgId")
  //       console.log(fetchedOrgId)
  //       console.log("printing userOrgId")
  //       console.log(userOrgId)
  //       if (!fetchedOrgId) {
  //         alert("Organization ID is missing aaa. Please register again.");
  //         return;
  //       }

  //     }
  //       fetchVerifiedIPs(userOrgId);
  //   })();
  // }, [navigate, logType, userOrgId]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // const filteredClients = clients && clients.filter((client) => client.ip.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredClients = clients && clients.length > 0
    ? clients.filter((client) => client.ip && client.ip.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f4f4f4",
        overflow: "hidden",
      }}
    >
     
      <Sidebar userRole={userRole} />

      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <h1>Log Forwarding Configuration</h1>

        <div
          style={{
            position: "relative",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Search Clients by IP Address"
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
            <h2>Client List</h2>
            <button
              onClick={openModal}
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
            {filteredClients.map((client) => (
              <div
                key={client.id}
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{client.ip}</span>
                <button
                  onClick={() => handleRemoveClient(client.id)}
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
              </div>
            ))}
          </div>
        </div>

      </div>
      {isModalOpen && <AddIPModal onClose={closeModal} onAdd={handleAddIP} />}
    </div>
  );
};

export default SystemConfiguration;
