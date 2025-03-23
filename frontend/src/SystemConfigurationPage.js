"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar" // Import the Sidebar component

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const userRole = "network-admin"

const AddIPModal = ({ onClose, onAdd }) => {
  const [newIP, setNewIP] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newIP) {
      onAdd(newIP)
      onClose()
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
                boxSizing: "border-box", // Added to prevent overflow
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
  )
}

const SystemConfiguration = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [clients, setClients] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId")
  
    if (!storedClientId) {
      // Redirect to client registration page if no client is found
      navigate("/client-registration")
    } else {
      fetchVerifiedIPs(storedClientId)
    }
  }, [navigate])

  const fetchClientId = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/clients/get-client`)
      if (!response.ok) throw new Error("Failed to fetch client ID")

      const data = await response.json()
      
      if (!data.client_id) {
        throw new Error("Client ID is missing in API response.")
      }

      console.log("Fetched Client ID:", data.client_id) 

      localStorage.setItem("clientId", data.client_id)

      //Ensure client_id is valid before calling fetchVerifiedIPs
      await fetchVerifiedIPs(data.client_id)
    } catch (error) {
      console.error("Error fetching client ID:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVerifiedIPs = async (clientId) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/ip-verification/verified-ips/${clientId}`)
      if (!response.ok) throw new Error("Failed to fetch verified IPs")

      const data = await response.json()
      setClients(data.verified_ips)
    } catch (error) {
      console.error("Error fetching verified IPs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveClient = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ip-verification/remove-ip/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove IP")

      setClients((prevClients) => prevClients.filter((client) => client.id !== id))

      alert("IP removed successfully!")
    } catch (error) {
      console.error("Error removing IP:", error)
      alert("Error removing IP. Please try again.")
    }
  }

  const handleAddClient = async (newIP) => {
    try {
      const clientId = localStorage.getItem("clientId") // Get client ID from storage
      if (!clientId) throw new Error("Client ID is missing. Please register again.")

      console.log("Sending IP Verification request:", { client_id: Number(clientId), ip: newIP })

      const response = await fetch(`${API_BASE_URL}/ip-verification/verify-ip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: Number(clientId), ip: newIP }), //Ensure correct JSON format
      })

      const data = await response.json()
      console.log("API Response:", data) //Log the API response

      if (!response.ok) throw new Error(data.detail || "Failed to verify IP")

      setClients((prevClients) => [...prevClients, { id: data.id, ip: newIP }])
    } catch (error) {
      console.error("Error verifying IP:", error.message)
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredClients = clients.filter((client) => client.ip.toLowerCase().includes(searchQuery.toLowerCase()))

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
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
      {/* Use the Sidebar component instead of hardcoded sidebar */}
      <Sidebar userRole={userRole} />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto", // Allow vertical scrolling
          overflowX: "hidden", // Prevent horizontal scrolling
        }}
      >
        <h1>Log Forwarding Configuration</h1>

        {/* Search Bar */}
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
              boxSizing: "border-box", // Added to prevent overflow
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

        {/* Client List */}
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
              overflow: "auto", // Changed from "hidden" to "auto" to allow scrolling if needed
              maxWidth: "100%", // Added to prevent overflow
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
      {isModalOpen && <AddIPModal onClose={closeModal} onAdd={handleAddClient} />}
    </div>
  )
}

export default SystemConfiguration

