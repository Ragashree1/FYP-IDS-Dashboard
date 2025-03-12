"use client"

import React, { useState, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar" // Import the Sidebar component

const userRole = "network-admin"

const AutomatedReportForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    reportName: "",
    alertType: "",
    alertCriticality: "",
    repeatNumber: "",
    repeatPeriod: "",
    startDate: "",
    endDate: "",
    reportFormat: "",
    reportType: "summarized",
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
                  boxSizing: "border-box", // Added to prevent overflow
                }}
              />
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
                  boxSizing: "border-box", // Added to prevent overflow
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
                  boxSizing: "border-box", // Added to prevent overflow
                }}
              >
                <option value="">Select Criticality</option>
                <option value="all">All</option>
                <option value="suspicious">Suspicious Activity</option>
                <option value="dangerous">Highly Dangerous</option>
                <option value="known">Known Threat</option>
              </select>
            </div>

            <div
              style={{
                marginBottom: "15px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap", // Added to prevent overflow on small screens
              }}
            >
              <div style={{ flex: "1 1 150px" }}>
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
                    boxSizing: "border-box", // Added to prevent overflow
                  }}
                />
              </div>
              <div style={{ flex: "1 1 150px" }}>
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
                    boxSizing: "border-box", // Added to prevent overflow
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
              <label style={{ display: "block", marginBottom: "5px" }}>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxSizing: "border-box", // Added to prevent overflow
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxSizing: "border-box", // Added to prevent overflow
                }}
              />
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
                  boxSizing: "border-box", // Added to prevent overflow
                }}
              >
                <option value="">Select Type</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Report Type:</label>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  flexWrap: "wrap", // Added to prevent overflow on small screens
                }}
              >
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

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                flexWrap: "wrap", // Added to prevent overflow on small screens
              }}
            >
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
                  boxSizing: "border-box", // Added to prevent overflow
                }}
              />
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
                  boxSizing: "border-box", // Added to prevent overflow
                }}
              >
                <option value="">Select Type</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "8px" }}>Report Type:</label>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  flexWrap: "wrap", // Added to prevent overflow on small screens
                }}
              >
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

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                flexWrap: "wrap", // Added to prevent overflow on small screens
              }}
            >
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
  // Add state to track selected rows
  const [selectedRows, setSelectedRows] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname.startsWith(path)

  const offences = [
    { criticality: "Med", name: "Suspicious Activity from user", time: "12:12 PM", category: "Suspicious Activity" },
    { criticality: "Med", name: "Suspicious Activity from user", time: "12:15 PM", category: "Suspicious Activity" },
    { criticality: "Med", name: "Suspicious Activity from user", time: "12:17 PM", category: "Suspicious Activity" },
    { criticality: "High", name: "DDOS Attack", time: "12:20 PM", category: "Known Threat" },
    {
      criticality: "Low",
      name: "Connection Request from untrusted ...",
      time: "1:00 PM",
      category: "Suspicious Activity",
    },
    { criticality: "High", name: "DDOS Attack", time: "1:05 PM", category: "Known Threat" },
    {
      criticality: "High",
      name: "Connection Request from untrusted ...",
      time: "1:10 PM",
      category: "Suspicious Activity",
    },
    {
      criticality: "High",
      name: "Suspicious changes to system setti...",
      time: "1:12 PM",
      category: "Highly Dangerous",
    },
    {
      criticality: "Low",
      name: "Connection Request from untrusted ...",
      time: "1:14 PM",
      category: "Suspicious Activity",
    },

    { criticality: "Low", name: "Suspicious Activity from user", time: "1:15 PM", category: "Suspicious Activity" },
  ]

  // Updated filter logic to filter rows based on both filter type and search query
  const filteredOffences = useMemo(() => {
    if (!filterType && !searchQuery) {
      return offences
    }

    return offences.filter((offence) => {
      const query = searchQuery.toLowerCase()

      // If we have a filter type but no search query, show all logs
      if (filterType && !searchQuery) {
        return true
      }

      // If we have a search query but no filter type, search across all fields
      if (searchQuery && !filterType) {
        return (
          offence.criticality.toLowerCase().includes(query) ||
          offence.name.toLowerCase().includes(query) ||
          offence.time.toLowerCase().includes(query) ||
          offence.category.toLowerCase().includes(query)
        )
      }

      // If we have both filter type and search query, search only in the specified field
      switch (filterType) {
        case "Alert Criticality":
          return offence.criticality.toLowerCase().includes(query)
        case "Alert Name":
          return offence.name.toLowerCase().includes(query)
        case "Date & Time":
          return offence.time.toLowerCase().includes(query)
        case "Alert Category":
          return offence.category.toLowerCase().includes(query)
        default:
          return false
      }
    })
  }, [offences, filterType, searchQuery])

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

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f4f4f4",
        overflow: "hidden", // Added to prevent horizontal scrolling
      }}
    >
      {/* Use the Sidebar component */}
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
        <h1>Offences (Alert) Interface:</h1>

        {/* Statistics */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap", // Added to prevent overflow on small screens
          }}
        >
          <div
            style={{
              background: "#ddd",
              padding: "12px 20px",
              borderRadius: "20px",
              textAlign: "center",
              flex: "1 1 150px", // Added to make responsive
            }}
          >
            <p>Total Alerts</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{filteredOffences.length}</p>
          </div>
          <div
            style={{
              background: "#ddd",
              padding: "12px 20px",
              borderRadius: "20px",
              textAlign: "center",
              flex: "1 1 150px", // Added to make responsive
            }}
          >
            <p>Total High</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              {filteredOffences.filter((o) => o.criticality === "High").length}
            </p>
          </div>
          <div
            style={{
              background: "#ddd",
              padding: "12px 20px",
              borderRadius: "20px",
              textAlign: "center",
              flex: "1 1 150px", // Added to make responsive
            }}
          >
            <p>Total Med</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              {filteredOffences.filter((o) => o.criticality === "Med").length}
            </p>
          </div>
          <div
            style={{
              background: "#ddd",
              padding: "12px 20px",
              borderRadius: "20px",
              textAlign: "center",
              flex: "1 1 150px", // Added to make responsive
            }}
          >
            <p>Total Low</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              {filteredOffences.filter((o) => o.criticality === "Low").length}
            </p>
          </div>
        </div>

        {/* Filter and Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap", // Added to prevent overflow on small screens
            gap: "10px", // Added for spacing when wrapped
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              flex: "1 1 300px",
              maxWidth: "600px",
              flexWrap: "wrap", // Added to prevent overflow on small screens
            }}
          >
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                minWidth: "180px",
                boxSizing: "border-box", // Added to prevent overflow
              }}
            >
              <option value="">Filter By (All Fields)</option>
              <option value="Alert Criticality">Alert Criticality</option>
              <option value="Alert Category">Alert Category</option>
              <option value="Alert Name">Alert Name</option>
              <option value="Date & Time">Date & Time</option>
            </select>

            <div
              style={{
                position: "relative",
                flex: "1 1 200px",
                display: "flex",
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
                  boxSizing: "border-box", // Added to prevent overflow
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

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap", // Added to prevent overflow on small screens
              flex: "1 1 300px",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleOpenReportForm}
              style={{
                background: "green",
                color: "#fff",
                padding: "12px 20px",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                whiteSpace: "nowrap", // Prevent text wrapping
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
                whiteSpace: "nowrap", // Prevent text wrapping
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
        <div
          style={{
            width: "100%",
            overflow: "auto", // Changed from "hidden" to "auto" to allow scrolling if needed
            maxWidth: "100%", // Added to prevent overflow
          }}
        >
          <table
            style={{
              width: "100%",
              background: "#fff",
              borderCollapse: "collapse",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
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
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>
                  Alert Criticality
                </th>
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Alert Name</th>
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Date & Time</th>
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Alert Category</th>
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
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence.criticality}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence.name}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence.time}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence.category}</td>
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
              zIndex: 1000,
            }}
            onClick={closeModal}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                width: "90%",
                maxWidth: "800px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                position: "relative",
                maxHeight: "90vh",
                overflowY: "auto",
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    "@media (max-width: 600px)": {
                      gridTemplateColumns: "1fr",
                    },
                  }}
                >
                  <div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Alert Name:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.name}
                    </div>

                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Date & Time:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.time}
                    </div>

                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Source IP:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      121:121:121:121
                    </div>
                  </div>

                  <div>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Alert Criticality:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.criticality}
                    </div>

                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Alert Category:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      {selectedOffence.category}
                    </div>

                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Destination IP:</p>
                    <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
                      6.66.666.6666
                    </div>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Alert Message:</p>
                    <div
                      style={{
                        background: "#f0f0f0",
                        padding: "8px",
                        borderRadius: "4px",
                        marginBottom: "15px",
                        minHeight: "100px",
                        position: "relative",
                      }}
                    >
                      Suspicious activity has been detected from user DumbDumb
                      <button
                        style={{
                          position: "absolute",
                          right: "8px",
                          top: "8px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0",
                        }}
                      >
                        📋
                      </button>
                    </div>
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
      </div>
    </div>
  )
}

export default Offences

