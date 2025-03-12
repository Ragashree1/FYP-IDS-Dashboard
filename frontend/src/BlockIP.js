"use client";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_URL = "http://your-fastapi-server-ip:8000/ip-blocking";
const API_KEY = "YOUR_SECRET_API_KEY"; // Replace with your actual API key

const AddBlocklistModal = ({ onClose, onAdd }) => {
  const [newIP, setNewIP] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newIP && reason) {
      try {
        const response = await fetch(`${API_URL}/block-ip/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
          },
          body: JSON.stringify({ ip: newIP }),
        });

        if (!response.ok) throw new Error("Failed to block IP");

        onAdd({ ip: newIP, reason });
        onClose();
      } catch (error) {
        console.error("Error blocking IP:", error);
      }
    }
  };

  return (
    <div className="modal">
      <h2>Add to Blocklist</h2>
      <form onSubmit={handleSubmit}>
        <label>IP Address to block</label>
        <input
          type="text"
          value={newIP}
          onChange={(e) => setNewIP(e.target.value)}
          required
        />
        <label>Reason for blocking</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <button type="submit">Add</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

const RemoveIPModal = ({ onClose, onRemove, ipToRemove }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onRemove(ipToRemove, reason);
    onClose();
  };

  return (
    <div className="modal">
      <h2>Request to remove IP From Blocklist</h2>
      <form onSubmit={handleSubmit}>
        <label>IP Address to Remove</label>
        <input type="text" value={ipToRemove} disabled />
        <label>Reason for removing</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this IP should be removed..."
        />
        <button type="submit">Request</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

const BlocklistManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedIP, setSelectedIP] = useState(null);
  const [blocklist, setBlocklist] = useState([]);

  useEffect(() => {
    fetchBlockedIPs();
  }, []);

  const fetchBlockedIPs = async () => {
    try {
      const response = await fetch(`${API_URL}/blocked-ips/`, {
        headers: { "X-API-KEY": API_KEY },
      });
      const data = await response.json();
      setBlocklist(data.map((ip) => ({ ip, reason: "Blocked by Admin" })));
    } catch (error) {
      console.error("Error fetching blocked IPs:", error);
    }
  };

  const handleAddIP = async (newItem) => {
    setBlocklist([...blocklist, newItem]);
    fetchBlockedIPs();
  };

  const handleRemoveIP = async (ip) => {
    try {
      const response = await fetch(`${API_URL}/unblock-ip/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": API_KEY,
        },
        body: JSON.stringify({ ip }),
      });

      if (!response.ok) throw new Error("Failed to remove IP");

      setBlocklist(blocklist.filter((item) => item.ip !== ip));
    } catch (error) {
      console.error("Error removing IP:", error);
    }
  };

  const filteredBlocklist = blocklist.filter((item) =>
    item.ip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="blocklist-container">
      <h1>Blocklist Management</h1>
      <input
        type="text"
        placeholder="Search by IP Address"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={() => setShowAddModal(true)}>Add IP</button>
      <table>
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBlocklist.map((item, index) => (
            <tr key={index}>
              <td>{item.ip}</td>
              <td>{item.reason}</td>
              <td>
                <button onClick={() => handleRemoveIP(item.ip)}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <AddBlocklistModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddIP}
        />
      )}
      {showRemoveModal && (
        <RemoveIPModal
          ipToRemove={selectedIP}
          onClose={() => setShowRemoveModal(false)}
          onRemove={handleRemoveIP}
        />
      )}
    </div>
  );
};

export default BlocklistManagementPage;
