"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import Sidebar from "./Sidebar" // Import the Sidebar component
import defaultClassifications from "./defaultClassifications" // Import default classifications

const userRole = "2"

const FilterModal = ({ onClose, onSubmit, initialValues }) => {
  const [formData, setFormData] = useState(() => ({
    startDateTime: initialValues?.startDateTime || "",
    endDateTime: initialValues?.endDateTime || "",
    src_ip: initialValues?.src_ip || "",
    dest_ip: initialValues?.dest_ip || "",
    src_port: initialValues?.src_port || "",
    dest_port: initialValues?.dest_port || "",
    protocol: initialValues?.protocol || "",
    message: initialValues?.message || "",
    classification: initialValues?.classification || "",
    host: initialValues?.host || "",
    alert_source: initialValues?.alert_source || "",
  }))

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
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
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0 }}>Advanced Filter:</h2>
        </div>

        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Filter Criteria:</h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Start Date:</label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>End Date:</label>
              <input
                type="datetime-local"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Source IP:</label>
              <input
                type="text"
                name="src_ip"
                value={formData.src_ip}
                onChange={handleChange}
                placeholder="Enter Source IP"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Destination IP:</label>
              <input
                type="text"
                name="dest_ip"
                value={formData.dest_ip}
                onChange={handleChange}
                placeholder="Enter Destination IP"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Source Port:</label>
              <input
                type="text"
                name="src_port"
                value={formData.src_port}
                onChange={handleChange}
                placeholder="Enter Source Port"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Destination Port:</label>
              <input
                type="text"
                name="dest_port"
                value={formData.dest_port}
                onChange={handleChange}
                placeholder="Enter Destination Port"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Protocol:</label>
              <input
                type="text"
                name="protocol"
                value={formData.protocol}
                onChange={handleChange}
                placeholder="Enter Protocol"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Message:</label>
              <input
                type="text"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter Message"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Category:</label>
              <input
                type="text"
                name="classification"
                value={formData.classification}
                onChange={handleChange}
                placeholder="Enter classification"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Host:</label>
              <input
                type="text"
                name="host"
                value={formData.host}
                onChange={handleChange}
                placeholder="Enter Host"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Alert Source:</label>
              <select
                name="alert_source"
                value={formData.alert_source}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                <option value="">All Sources</option>
                <option value="snort">Snort</option>
                <option value="suricata">Suricata</option>
                <option value="zeek">Zeek</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Apply Filter
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#333",
                  color: "white",
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
    </div>
  )
}

const AutomatedReportForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    reportName: "",
    alertType: "",
    alertCriticality: "",
    repeatNumber: "",
    repeatPeriod: "",
    reportFormat: "",
    reportType: "summarized",
    alertSource: "all",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
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
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0 }}>Automated Report Cycle:</h2>
        </div>

        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Alert Report Generation:</h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Report's Name:</label>
              <input
                type="text"
                name="reportName"
                value={formData.reportName}
                onChange={handleChange}
                placeholder="Enter Name"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Alert Source:</label>
              <select
                name="alertSource"
                value={formData.alertSource}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                <option value="all">All Sources</option>
                <option value="snort">Snort Only</option>
                <option value="suricata">Suricata Only</option>
                <option value="zeek">Zeek Only</option>
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Alert Type:</label>
              <select
                name="alertType"
                value={formData.alertType}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                <option value="">Select Type</option>
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="med">Med</option>
                <option value="high">High</option>
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Alert Criticality:</label>
              <select
                name="alertCriticality"
                value={formData.alertCriticality}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                <option value="">Select Criticality</option>
                <option value="all">All</option>
                <option value="suspicious">Suspicious Activity</option>
                <option value="dangerous">Highly Dangerous</option>
                <option value="known">Known Threat</option>
              </select>
            </div>

            <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Repeat Every:</label>
                <input
                  type="number"
                  name="repeatNumber"
                  value={formData.repeatNumber}
                  onChange={handleChange}
                  placeholder="Enter Number"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px" }}>&nbsp;</label>
                <select
                  name="repeatPeriod"
                  value={formData.repeatPeriod}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <option value="">Select Period</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Report's Format:</label>
              <select
                name="reportFormat"
                value={formData.reportFormat}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                <option value="">Select Type</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Report Type:</label>
              <div style={{ display: "flex", gap: "20px" }}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="reportType"
                    value="summarized"
                    checked={formData.reportType === "summarized"}
                    onChange={handleChange}
                    style={{ marginRight: "5px" }}
                  />
                  Summarized
                </label>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="reportType"
                    value="detailed"
                    checked={formData.reportType === "detailed"}
                    onChange={handleChange}
                    style={{ marginRight: "5px" }}
                  />
                  Detailed
                </label>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Generate
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#333",
                  color: "white",
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
    </div>
  )
}

const GenerateReportModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    reportName: "",
    reportFormat: "",
    reportType: "summarized",
    alertSource: "all",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
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
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
            gap: "15px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "0",
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0 }}>Generate Alert Report:</h2>
        </div>

        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Alert Report Generation:</h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px" }}>Report's Name:</label>
              <input
                type="text"
                name="reportName"
                value={formData.reportName}
                onChange={handleChange}
                placeholder="Enter Name"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px" }}>Alert Source:</label>
              <select
                name="alertSource"
                value={formData.alertSource}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "white",
                }}
              >
                <option value="all">All Sources</option>
                <option value="snort">Snort Only</option>
                <option value="suricata">Suricata Only</option>
                <option value="zeek">Zeek Only</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px" }}>Report's Format:</label>
              <select
                name="reportFormat"
                value={formData.reportFormat}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "white",
                }}
              >
                <option value="">Select Type</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "8px" }}>Report Type:</label>
              <div style={{ display: "flex", gap: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="radio"
                    name="reportType"
                    value="summarized"
                    checked={formData.reportType === "summarized"}
                    onChange={handleChange}
                  />
                  Summarized
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="radio"
                    name="reportType"
                    value="detailed"
                    checked={formData.reportType === "detailed"}
                    onChange={handleChange}
                  />
                  Detailed
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Generate
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#333",
                  color: "white",
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
    </div>
  )
}

const Offences = () => {
  const [filterType, setFilterType] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOffence, setSelectedOffence] = useState(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [showGenerateReport, setShowGenerateReport] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [hideUncategorized, setHideUncategorized] = useState(false)
  const [filterCriteria, setFilterCriteria] = useState({})
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [alertSource, setAlertSource] = useState("all") // "all", "snort", or "suricata"
  const navigate = useNavigate()
  const location = useLocation()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [offences, setOffences] = useState([])
  const [snortAlerts, setSnortAlerts] = useState([])
  const [suricataAlerts, setSuricataAlerts] = useState([])
  const [zeekAlerts, setZeekAlerts] = useState([])
  const [organizationId, setOrganizationId] = useState(null)

  function convertToKeyValuePair(data) {
    return data.reduce((acc, item) => {
      acc[item.text.toLowerCase()] = { name: item.name, priority: item.priority }
      return acc
    }, {})
  }

  const classifications = convertToKeyValuePair(defaultClassifications)

 // Updated getPriority function to invert Zeek severity levels only
function getPriority(name, doc) {
  // Special handling for Zeek alerts - invert the severity
  if (doc && doc.alert_source === "zeek") {
    // First check if the document has a priority field
    if (doc.priority !== undefined) {
      const priority = parseInt(doc.priority);
      // Invert the priority (1->4, 2->3, 3->2, 4->1)
      return (5 - priority).toString();
    }
    
    // Then check if the document has a severity field
    if (doc.severity !== undefined) {
      const severity = parseInt(doc.severity);
      // Invert the severity
      return (5 - severity).toString();
    }
  }
  
  // Normal handling for non-Zeek alerts (Suricata, Snort)
  
  // First check if the document has a priority field
  if (doc && doc.priority !== undefined) {
    return doc.priority.toString();
  }
  
  // Then check if the document has a severity field
  if (doc && doc.severity !== undefined) {
    return doc.severity.toString();
  }
  
  // Then check if we have alert.severity (Suricata format)
  if (doc && doc.alert && doc.alert.severity !== undefined) {
    return doc.alert.severity.toString();
  }
  
  // Fall back to the old method if severity field isn't present
  name = name.trim()
  return classifications[name] ? classifications[name].priority : "Unknown"
}

  // Function to extract organization ID from JWT token
  const getOrganizationIdFromToken = () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return null
      
      // Decode JWT token
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      
      const payload = JSON.parse(jsonPayload)
      console.log("Token payload:", payload)
      
      // Get organization_id from token payload
      return payload.organization_id || null
    } catch (error) {
      console.error("Error extracting organization ID from token:", error)
      return null
    }
  }

  // Initialize organization ID on component mount
  useEffect(() => {
    // First try to get organization ID from token
    const orgIdFromToken = getOrganizationIdFromToken()
    if (orgIdFromToken) {
      console.log("Found organization ID in token:", orgIdFromToken)
      setOrganizationId(orgIdFromToken)
      // Also store it in localStorage for future use
      localStorage.setItem("orgId", orgIdFromToken)
    } else {
      // Fallback to localStorage if not in token
      const storedOrgId = localStorage.getItem("orgId")
      console.log("Using organization ID from localStorage:", storedOrgId)
      setOrganizationId(storedOrgId)
    }
  }, [])

  // Updated useEffect to fetch alerts only when organizationId is available
  useEffect(() => {
    if (!organizationId) {
      console.log("No organization ID available yet, waiting...")
      return
    }

    console.log(`Fetching alerts from API for organization ${organizationId}...`)
    setLoading(true)

    // Get the JWT token from localStorage for authentication
    const token = localStorage.getItem("token")
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    // Create an array to track completed requests
    let completedRequests = 0
    const totalRequests = 3
    const checkAllCompleted = () => {
      completedRequests++
      if (completedRequests === totalRequests) {
        setLoading(false)
      }
    }

    // Fetch Snort alerts from alerts endpoint
    console.log(`Fetching Snort alerts from /alerts/${organizationId} endpoint`)
    axios
      .get(`http://localhost:8000/alerts/${organizationId}`, { headers })
      .then((response) => {
        console.log("Snort API Response:", response.data)
        // Add alert_source property if not present
        const processedAlerts = response.data.map(alert => ({
          ...alert,
          alert_source: alert.alert_source || "snort" // Ensure alert_source is set
        }))
        setSnortAlerts(processedAlerts)
      })
      .catch((error) => {
        console.error("Error fetching Snort alerts:", error)
        setSnortAlerts([])
      })
      .finally(() => {
        checkAllCompleted()
      })

    // Fetch Suricata alerts
    console.log(`Fetching Suricata alerts from /suricata_alerts/${organizationId} endpoint`)
    axios
      .get(`http://localhost:8000/suricata_alerts/${organizationId}`, { headers })
      .then((response) => {
        console.log("Suricata API Response:", response.data)
        // Add alert_source property if not present
        const processedAlerts = response.data.map(alert => ({
          ...alert,
          alert_source: "suricata" // Ensure alert_source is set
        }))
        setSuricataAlerts(processedAlerts)
      })
      .catch((error) => {
        console.error("Error fetching Suricata alerts:", error)
        setSuricataAlerts([])
      })
      .finally(() => {
        checkAllCompleted()
      })

    // Fetch Zeek alerts
    console.log(`Fetching Zeek alerts from /zeek_alerts/${organizationId} endpoint`)
axios
  .get(`http://localhost:8000/zeek_alerts/${organizationId}`, { headers })
  .then((response) => {
    console.log("Zeek API Response:", response.data)
    // Add alert_source property if not present
    const processedAlerts = response.data.map(alert => ({
      ...alert,
      alert_source: "zeek" // Ensure alert_source is set
    }))
    setZeekAlerts(processedAlerts)
  })
  .catch((error) => {
    console.error("Error fetching Zeek alerts:", error)
    setZeekAlerts([])
  })
  .finally(() => {
    checkAllCompleted()
  })
  }, [organizationId]) // Only re-run when organizationId changes

  // Combine alerts whenever snortAlerts or suricataAlerts change
  useEffect(() => {
    console.log("Combining alerts:", {
      snortCount: snortAlerts.length,
      suricataCount: suricataAlerts.length,
      zeekCount: zeekAlerts.length,
      loading,
    })

    const combinedAlerts = [...snortAlerts, ...suricataAlerts, ...zeekAlerts]

    if (combinedAlerts.length === 0 && !loading) {
      console.log("No alerts found, adding mock data for testing")
      // Add mock data for testing if API fails
      const mockData = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          priority: 1,
          protocol: "TCP",
          raw: "TCP:1234",
          length: 60,
          direction: "->",
          src_ip: "192.168.1.100",
          src_port: 45678,
          dest_ip: "203.0.113.5",
          dest_port: 80,
          classification: "attempted-admin",
          action: "BLOCK",
          message: "EXPLOIT-KIT Possible CVE-2023-1234 exploit attempt",
          signature_id: "2003745",
          host: "192.168.1.1",
          alert_source: "snort",
        },
        {
          id: 2,
          timestamp: new Date().toISOString(),
          priority: 2,
          protocol: "TCP",
          raw: "TCP:5678",
          length: 120,
          direction: "->",
          src_ip: "192.168.1.105",
          src_port: 56789,
          dest_ip: "203.0.113.10",
          dest_port: 443,
          classification: "web-application-attack",
          action: "ALERT",
          message: "WEB-ATTACKS SQL injection attempt",
          signature_id: "2034567",
          host: "192.168.1.1",
          alert_source: "snort",
        },
        {
          id: 3,
          timestamp: new Date().toISOString(),
          priority: 3,
          protocol: "UDP",
          raw: "UDP:9012",
          length: 80,
          direction: "->",
          src_ip: "192.168.1.110",
          src_port: 12345,
          dest_ip: "203.0.113.15",
          dest_port: 53,
          classification: "attempted-recon",
          action: "ALERT",
          message: "DNS SPOOF query response with TTL of 1 min. and no authority",
          signature_id: "2012345",
          host: "192.168.1.1",
          alert_source: "suricata",
        },
        {
          id: 4,
          timestamp: new Date().toISOString(),
          priority: 2,
          protocol: "TCP",
          raw: "",
          length: 0,
          direction: "->",
          src_ip: "192.168.1.120",
          src_port: 54321,
          dest_ip: "93.184.216.34",
          dest_port: 80,
          classification: "suspicious-activity",
          action: "ALERT",
          message: "Zeek detected suspicious HTTP connection",
          signature_id: "0",
          host: "192.168.1.1",
          alert_source: "zeek",
          conn_id: "CXWyFM3QQpBiNXQAk1",
          event_type: "http",
          uid: "CXWyFM3QQpBiNXQAk1",
          service: "http",
        },
      ]
      setOffences(mockData)
      setLogs(mockData)
      setError("Using mock data. API endpoints not found or returned no data. Check your backend server.")
    } else {
      setOffences(combinedAlerts)
      setLogs(combinedAlerts)

      if (snortAlerts.length === 0 && suricataAlerts.length === 0 && zeekAlerts.length === 0) {
        setError("No alerts were found from any source.")
      } else {
        setError(null)
      }
    }
  }, [snortAlerts, suricataAlerts, zeekAlerts, loading])

  // Add a refresh function
  const refreshAlerts = () => {
    if (organizationId) {
      console.log("Manually refreshing alerts...")
      setLoading(true)
      
      // Get the JWT token from localStorage for authentication
      const token = localStorage.getItem("token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      // Create an array to track completed requests
      let completedRequests = 0
      const totalRequests = 3
      const checkAllCompleted = () => {
        completedRequests++
        if (completedRequests === totalRequests) {
          setLoading(false)
        }
      }
      
      // Fetch all three types of alerts
      axios
        .get(`http://localhost:8000/alerts/${organizationId}`, { headers })
        .then((response) => {
          const processedAlerts = response.data.map(alert => ({
            ...alert,
            alert_source: alert.alert_source || "snort"
          }))
          setSnortAlerts(processedAlerts)
        })
        .catch((error) => {
          console.error("Error refreshing Snort alerts:", error)
        })
        .finally(() => {
          checkAllCompleted()
        })
        
      axios
        .get(`http://localhost:8000/suricata_alerts/${organizationId}`, { headers })
        .then((response) => {
          const processedAlerts = response.data.map(alert => ({
            ...alert,
            alert_source: "suricata"
          }))
          setSuricataAlerts(processedAlerts)
        })
        .catch((error) => {
          console.error("Error refreshing Suricata alerts:", error)
        })
        .finally(() => {
          checkAllCompleted()
        })
        
      axios
        .get(`http://localhost:8000/zeek_alerts/${organizationId}`, { headers })
        .then((response) => {
          const processedAlerts = response.data.map(alert => ({
            ...alert,
            alert_source: "zeek"
          }))
          setZeekAlerts(processedAlerts)
        })
        .catch((error) => {
          console.error("Error refreshing Zeek alerts:", error)
        })
        .finally(() => {
          checkAllCompleted()
        })
    } else {
      console.error("Cannot refresh: No organization ID available")
      setError("Cannot refresh: No organization ID available. Please log in again.")
    }
  }

  // Updated filter logic to filter rows based on both filter type and search query
  const filteredOffences = useMemo(() => {
    let filtered = offences

    // Filter by alert source
    if (alertSource !== "all") {
      filtered = filtered.filter((offence) => offence.alert_source === alertSource)
    }

    if (hideUncategorized) {
      filtered = filtered.filter(
        (offence) => getPriority(offence.classification.toLowerCase().trim() || "N/A", offence) !== "Unknown",
      )
    }

    // Advanced filter logic
    filtered = filtered.filter((offence) => {
      let match = true

      if (filterCriteria.startDateTime) {
        match = match && new Date(offence.timestamp) >= new Date(filterCriteria.startDateTime)
      }
      if (filterCriteria.endDateTime) {
        match = match && new Date(offence.timestamp) <= new Date(filterCriteria.endDateTime)
      }
      if (filterCriteria.src_ip) {
        match = match && offence.src_ip.toLowerCase().includes(filterCriteria.src_ip.toLowerCase())
      }
      if (filterCriteria.dest_ip) {
        match = match && offence.dest_ip.toLowerCase().includes(filterCriteria.dest_ip.toLowerCase())
      }
      if (filterCriteria.src_port) {
        match = match && offence.src_port.toString().includes(filterCriteria.src_port)
      }
      if (filterCriteria.dest_port) {
        match = match && offence.dest_port.toString().includes(filterCriteria.dest_port)
      }
      if (filterCriteria.protocol) {
        match = match && offence.protocol.toLowerCase().includes(filterCriteria.protocol.toLowerCase())
      }
      if (filterCriteria.message) {
        match = match && offence.message.toLowerCase().includes(filterCriteria.message.toLowerCase())
      }
      if (filterCriteria.classification) {
        match = match && offence.classification.toLowerCase().includes(filterCriteria.classification.toLowerCase())
      }
      if (filterCriteria.host) {
        match = match && offence.host.toLowerCase().includes(filterCriteria.host.toLowerCase())
      }
      if (filterCriteria.alert_source) {
        match = match && offence.alert_source === filterCriteria.alert_source
      }

      if (searchQuery && !filterType) {
        match =
          match &&
          (offence.classification.toLowerCase().includes(searchQuery.toLowerCase()) ||
            offence.src_ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
            offence.dest_ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
            offence.src_port.toString().includes(searchQuery) ||
            offence.dest_port.toString().includes(searchQuery) ||
            offence.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            offence.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            new Date(offence.timestamp).toLocaleString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            offence.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (offence.alert_source || "snort").includes(searchQuery.toLowerCase()))
      } else if (searchQuery && filterType) {
        switch (filterType.toLowerCase()) {
          case "alert category":
            match = match && offence.classification.toLowerCase().includes(searchQuery.toLowerCase())
            break
          case "severity":
            match =
              match &&
              String(getPriority(offence.classification.toLowerCase().trim() || "N/A", offence))
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            break
          case "source ip":
            match = match && offence.src_ip.toLowerCase().includes(searchQuery.toLowerCase())
            break
          case "destination ip":
            match = match && offence.dest_ip.toLowerCase().includes(searchQuery.toLowerCase())
            break
          case "source port":
            match = match && offence.src_port.toString().includes(searchQuery)
            break
          case "destination port":
            match = match && offence.dest_port.toString().includes(searchQuery)
            break
          case "protocol":
            match = match && offence.protocol.toLowerCase().includes(searchQuery.toLowerCase())
            break
          case "alert name":
            match = match && offence.message.toLowerCase().includes(searchQuery.toLowerCase())
            break
          case "date & time":
            match = match && new Date(offence.timestamp).toLocaleString().includes(searchQuery.toLowerCase())
            break
          case "alert source":
            match = match && (offence.alert_source || "snort").toLowerCase().includes(searchQuery.toLowerCase())
            break
          default:
            break
        }
      }

      return match
    })

    // Sort the filtered results by timestamp (newest first)
    filtered.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp)
    })

    // For debugging
    console.log(
      "Timestamps after sorting:",
      filtered.map((o) => o.timestamp),
    )

    return filtered
  }, [offences, hideUncategorized, filterCriteria, searchQuery, filterType, alertSource])

  const resetFilters = () => {
    setFilterType("")
    setSearchQuery("")
    setHideUncategorized(false)
    setFilterCriteria({})
    setAlertSource("all")
  }

  // Function to handle "select all" checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // If checked, select all filtered offences
      const allRowIndexes = filteredOffences.map((_, index) => index)
      setSelectedRows(allRowIndexes)
    } else {
      // If unchecked, clear all selections
      setSelectedRows([])
    }
  }

  // Function to handle individual row selection
  const handleSelectRow = (index, e) => {
    if (e.target.checked) {
      // Add this row to selected rows if not already there
      if (!selectedRows.includes(index)) {
        setSelectedRows([...selectedRows, index])
      }
    } else {
      // Remove this row from selected rows
      setSelectedRows(selectedRows.filter((rowIndex) => rowIndex !== index))
    }
  }

  // Check if all filtered rows are selected
  const areAllSelected = filteredOffences.length > 0 && selectedRows.length === filteredOffences.length

  function getAlertCount() {
    return offences.length
  }

  function getSnortAlertCount() {
    return offences.filter((alert) => !alert.alert_source || alert.alert_source === "snort").length
  }

  function getSuricataAlertCount() {
    return offences.filter((alert) => alert.alert_source === "suricata").length
  }

  function getZeekAlertCount() {
    return offences.filter((alert) => alert.alert_source === "zeek").length
  }

  function getCriticalAlerts() {
    return offences
      .map((offence, index) => getPriority(offence.classification.toLowerCase().trim() || "N/A", offence))
      .filter((val) => val == 1).length
  }

  function getHighAlerts() {
    return offences
      .map((offence, index) => getPriority(offence.classification.toLowerCase().trim() || "N/A", offence))
      .filter((val) => val == 2).length
  }

  function getMediumAlerts() {
    return offences
      .map((offence, index) => getPriority(offence.classification.toLowerCase().trim() || "N/A", offence))
      .filter((val) => val == 3).length
  }

  function getLowAlerts() {
    return offences
      .map((offence, index) => getPriority(offence.classification.toLowerCase().trim() || "N/A", offence))
      .filter((val) => val == 4).length
  }

  function getUncategorizedAlerts() {
    return offences.filter(
      (offence, index) => getPriority(offence.classification.toLowerCase().trim() || "N/A", offence) == "Unknown",
    ).length
  }

  const openModal = (offence) => {
    setSelectedOffence(offence)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOffence(null)
  }

  const handleLogout = () => {
    navigate("/login")
  }

  const handleOpenReportForm = () => {
    setShowReportForm(true)
  }

  const handleCloseReportForm = () => {
    setShowReportForm(false)
  }

  const handleOpenGenerateReport = () => {
    setShowGenerateReport(true)
  }

  const handleCloseGenerateReport = () => {
    setShowGenerateReport(false)
  }

  const handleSubmitReport = (formData) => {
    console.log("Report Data:", formData)
    setShowReportForm(false)
  }

  const handleSubmitGenerateReport = (formData) => {
    console.log("Generate Report Data:", formData)
    setShowGenerateReport(false)
  }

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true)
  }

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false)
  }

  const handleSubmitFilter = (formData) => {
    setFilterCriteria(formData)
    setIsFilterModalOpen(false)
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f4f4f4" }}>
      {/* Use the Sidebar component */}
      <Sidebar userRole={userRole} />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Offences (Alert) Interface:</h1>

    

        {/* Loading indicator */}
        {loading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Loading alerts...</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            <p>{error}</p>
          </div>
        )}

        {/* Refresh button */}
        <div style={{ marginBottom: "20px" }}>
          <button 
            onClick={refreshAlerts}
            style={{
              background: "#2196f3",
              color: "#fff",
              padding: "12px 20px",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            Refresh Alerts
          </button>
        </div>

        {/* Statistics */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Total Alerts</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{getAlertCount()}</p>
          </div>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Snort Alerts</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{getSnortAlertCount()}</p>
          </div>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Suricata Alerts</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{getSuricataAlertCount()}</p>
          </div>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Zeek Alerts</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{getZeekAlertCount()}</p>
          </div>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Total Critical</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{getCriticalAlerts()}</p>
          </div>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Total High</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{getHighAlerts()}</p>
          </div>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Total Med</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{getMediumAlerts()}</p>
          </div>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Total Low</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{getLowAlerts()}</p>
          </div>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Total Uncategorized</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{getUncategorizedAlerts()}</p>
          </div>
        </div>

        {/* Filter and Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "10px", flex: 1, maxWidth: "800px", flexWrap: "wrap" }}>
            <select
              value={alertSource}
              onChange={(e) => setAlertSource(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                minWidth: "180px",
              }}
            >
              <option value="all">All Alert Sources</option>
              <option value="snort">Snort Alerts Only</option>
              <option value="suricata">Suricata Alerts Only</option>
              <option value="zeek">Zeek Alerts Only</option>
            </select>

            <select
              value={hideUncategorized}
              onChange={(e) => setHideUncategorized(e.target.value === "true")}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                minWidth: "180px",
              }}
            >
              <option value="false">Show All Alerts</option>
              <option value="true">Hide Uncategorized Alerts</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                minWidth: "180px",
              }}
            >
              <option value="">Filter By (All Fields)</option>
              <option value="Alert Category">Alert Category</option>
              <option value="Severity">Severity</option>
              <option value="Source IP">Source IP</option>
              <option value="Destination IP">Destination IP</option>
              <option value="Source Port">Source Port</option>
              <option value="Destination Port">Destination Port</option>
              <option value="Protocol">Protocol</option>
              <option value="Alert Name">Alert Name</option>
              <option value="Date & Time">Date & Time</option>
              <option value="Alert Source">Alert Source</option>
            </select>

            <div
              style={{
                position: "relative",
                flex: 1,
                display: "flex",
                minWidth: "200px", // Ensure minimum width to prevent overlap
              }}
            >
              <input
                type="text"
                placeholder={filterType ? `Search by ${filterType}...` : "Search all fields..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
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
                }}
              >
                🔍
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={resetFilters}
              style={{
                background: "grey",
                color: "#fff",
                padding: "12px 20px",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
            <button
              onClick={handleOpenFilterModal}
              style={{
                background: "blue",
                color: "#fff",
                padding: "12px 20px",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              Advanced Filter
            </button>
            <button
              onClick={handleOpenReportForm}
              style={{
                background: "green",
                color: "#fff",
                padding: "12px 20px",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              Add Automate Report Cycle
            </button>
            <button
              onClick={handleOpenGenerateReport}
              style={{
                background: "darkgreen",
                color: "#fff",
                padding: "12px 20px",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* Selected rows info */}
        {selectedRows.length > 0 && (
          <div
            style={{
              marginBottom: "10px",
              padding: "8px 12px",
              backgroundColor: "#e0f7fa",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{selectedRows.length} offences selected</span>
            <button
              onClick={() => setSelectedRows([])}
              style={{
                background: "none",
                border: "none",
                color: "#0277bd",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Offences Table */}
        <div style={{ width: "100%", maxHeight: "700px", overflowY: "auto" }}>
          <table
            style={{
              width: "100%",
              background: "#fff",
              borderCollapse: "collapse",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              minWidth: "800px",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 2,
                boxShadow: "0 2px 2px rgba(0,0,0,0.1)",
              }}
            >
              <tr style={{ background: "#ccc", borderBottom: "2px solid #aaa" }}>
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>
                  <input
                    type="checkbox"
                    checked={areAllSelected}
                    onChange={handleSelectAll}
                    style={{ cursor: "pointer" }}
                  />{" "}
                  Select
                </th>
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Alert Message</th>
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Date & Time</th>
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Protocol</th>
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Alert Category</th>
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>
                  Severity level (1=Critical, 4=Low)
                </th>
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Source</th>
                <th style={{ padding: "10px", textAlign: "center" }}>View</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffences.map((offence, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: selectedRows.includes(index) ? "#f0f7ff" : "inherit",
                  }}
                >
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(index)}
                      onChange={(e) => handleSelectRow(index, e)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "block",
                        whiteSpace: "normal", // Allow all messages to wrap naturally
                        overflow: "hidden",
                        textAlign: "center",
                        maxWidth: "400px", // Limit width to force wrapping for long messages
                        margin: "0 auto", // Center the text block
                      }}
                    >
                      {offence.message.replace(/^"|"$/g, "")}
                    </div>
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    {new Date(offence.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence.protocol}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    {offence.classification.toLowerCase() || "N/A"}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    {getPriority(offence.classification.toLowerCase().trim() || "N/A", offence)}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence.alert_source || "snort"}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <button
                      style={{ background: "purple", color: "#fff", padding: "5px 10px", borderRadius: "5px" }}
                      onClick={() => openModal(offence)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 3,
            }}
            onClick={closeModal}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                width: "800px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <h2 style={{ margin: 0 }}>Alert Details</h2>
                <button
                  onClick={closeModal}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "red",
                    padding: "0",
                  }}
                >
                  ×
                </button>
              </div>

              {selectedOffence && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Alert Message:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.message || "N/A"}
                    </div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Date & Time:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.timestamp ? new Date(selectedOffence.timestamp).toLocaleString() : "N/A"}
                    </div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Source Port:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.src_port || "N/A"}
                    </div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Source IP:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.src_ip || "N/A"}
                    </div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Direction:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.direction || "N/A"}
                    </div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Alert Source:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.alert_source || "snort"}
                    </div>

                    {/* Show Zeek-specific fields if the alert is from Zeek */}
                    {selectedOffence.alert_source === "zeek" && (
                      <>
                        <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Event Type:</p>
                        <div
                          style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}
                        >
                          {selectedOffence.event_type || "N/A"}
                        </div>
                        <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Connection ID:</p>
                        <div
                          style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}
                        >
                          {selectedOffence.conn_id || "N/A"}
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Alert Category:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.classification || "N/A"}
                    </div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Signature ID:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.signature_id || "N/A"}
                    </div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Alert Protocol:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.protocol || "N/A"}
                    </div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Destination Port:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.dest_port || "N/A"}
                    </div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Destination IP:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.dest_ip || "N/A"}
                    </div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Severity Level:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {getPriority(selectedOffence.classification.toLowerCase().trim() || "N/A", selectedOffence)}
                    </div>

                    {/* Show more Zeek-specific fields if the alert is from Zeek */}
                    {selectedOffence.alert_source === "zeek" && (
                      <>
                        <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Unique ID:</p>
                        <div
                          style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}
                        >
                          {selectedOffence.uid || "N/A"}
                        </div>
                        <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Service:</p>
                        <div
                          style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}
                        >
                          {selectedOffence.service || "N/A"}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Automated Report Form Modal */}
        {showReportForm && <AutomatedReportForm onClose={handleCloseReportForm} onSubmit={handleSubmitReport} />}

        {showGenerateReport && (
          <GenerateReportModal onClose={handleCloseGenerateReport} onSubmit={handleSubmitGenerateReport} />
        )}

        {isFilterModalOpen && (
          <FilterModal onClose={handleCloseFilterModal} onSubmit={handleSubmitFilter} initialValues={filterCriteria} />
        )}
      </div>
    </div>
  )
}

export default Offences