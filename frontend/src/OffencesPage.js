"use client"

import React, { useState, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const AutomatedReportForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    reportName: '',
    alertType: '',
    alertCriticality: '',
    repeatNumber: '',
    repeatPeriod: '',
    startDate: '',
    endDate: '',
    reportFormat: '',
    reportType: 'summarized'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0 }}>Automated Report Cycle:</h2>
        </div>

        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0 }}>Alert Report Generation:</h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Report's Name:</label>
              <input
                type="text"
                name="reportName"
                value={formData.reportName}
                onChange={handleChange}
                placeholder="Enter Name"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Alert Type:</label>
              <select
                name="alertType"
                value={formData.alertType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="">Select Type</option>
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="med">Med</option>
                <option value="high">High</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Alert Criticality:</label>
              <select
                name="alertCriticality"
                value={formData.alertCriticality}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="">Select Criticality</option>
                <option value="all">All</option>
                <option value="suspicious">Suspicious Activity</option>
                <option value="dangerous">Highly Dangerous</option>
                <option value="known">Known Threat</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Repeat Every:</label>
                <input
                  type="number"
                  name="repeatNumber"
                  value={formData.repeatNumber}
                  onChange={handleChange}
                  placeholder="Enter Number"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>&nbsp;</label>
                <select
                  name="repeatPeriod"
                  value={formData.repeatPeriod}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
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

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Report's Format:</label>
              <select
                name="reportFormat"
                value={formData.reportFormat}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="">Select Type</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Report Type:</label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="reportType"
                    value="summarized"
                    checked={formData.reportType === 'summarized'}
                    onChange={handleChange}
                    style={{ marginRight: '5px' }}
                  />
                  Summarized
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="reportType"
                    value="detailed"
                    checked={formData.reportType === 'detailed'}
                    onChange={handleChange}
                    style={{ marginRight: '5px' }}
                  />
                  Detailed
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Generate
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


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
  const [filter, setFilter] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOffence, setSelectedOffence] = useState(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [showGenerateReport, setShowGenerateReport] = useState(false)
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

  const filteredOffences = useMemo(() => {
    return offences
  }, [])

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
    <div style={{ display: "flex", height: "100vh", background: "#f4f4f4" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          background: "#222",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2>SecuBoard</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li
            style={{
              padding: "10px",
              background: isActive("/dashboard") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/dashboard")}
          >
            <img
              src="/images/dashboard-logo.png"
              alt="Dashboard Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Dashboard
          </li>
          <li
            style={{
              padding: "10px",
              background: isActive("/offences") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/offences")}
          >
            <img
              src="/images/offences-logo.png"
              alt="Offences Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Offences
          </li>
          <li
            style={{
              padding: "10px",
              background: isActive("/event-log") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/event-log")}
          >
            <img
              src="/images/event-log-logo.png"
              alt="Event Log Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Event Log Activity
          </li>
          <li
            style={{
              padding: "10px",
              background: isActive("/reports") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/reports")}
          >
            <img
              src="/images/report-logo.png"
              alt="Reports Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Reports
          </li>
          <li
            style={{
              padding: "10px",
              background: isActive("/settings") ? "#555" : "#333",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/settings")}
          >
            <img
              src="/images/settings-logo.png"
              alt="Settings Logo"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Settings
          </li>
        </ul>
        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            width: "100%",
            padding: "10px",
            background: "red",
            border: "none",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <img
            src="/images/logout-logo.png"
            alt="Logout Logo"
            style={{ width: "20px", height: "20px", marginRight: "10px" }}
          />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Offences (Alert) Interface:</h1>

        {/* Statistics */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Total Alerts</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>10</p>
          </div>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Total High</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>4</p>
          </div>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Total Med</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>3</p>
          </div>
          <div style={{ background: "#ddd", padding: "12px 20px", borderRadius: "20px", textAlign: "center" }}>
            <p>Total Low</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>3</p>
          </div>
        </div>

        {/* Filter and Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ccc" }}
          >
            <option value="">Select Filter Type</option>
            <option value="Alert Criticality">Alert Criticality</option>
            <option value="Alert Category">Alert Category</option>
            <option value="Alert Name">Alert Name</option>
            <option value="Date & Time">Date & Time</option>
          </select>
          <div>
            <button
              onClick={handleOpenReportForm}
              style={{
                background: "green",
                color: "#fff",
                padding: "12px 20px",
                marginRight: "10px",
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

        {/* Offences Table */}
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
                <input type="checkbox" /> Select
              </th>
              {(filter === "" || filter === "Alert Criticality") && (
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>
                  Alert Criticality
                </th>
              )}
              {(filter === "" || filter === "Alert Name") && (
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Alert Name</th>
              )}
              {(filter === "" || filter === "Date & Time") && (
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Date & Time</th>
              )}
              {(filter === "" || filter === "Alert Category") && (
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Alert Category</th>
              )}
              <th style={{ padding: "10px", textAlign: "center" }}>View</th>
            </tr>
          </thead>
          <tbody>
            {filteredOffences.map((offence, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  <input type="checkbox" />
                </td>
                {(filter === "" || filter === "Alert Criticality") && (
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence.criticality}</td>
                )}
                {(filter === "" || filter === "Alert Name") && (
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence.name}</td>
                )}
                {(filter === "" || filter === "Date & Time") && (
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence.time}</td>
                )}
                {(filter === "" || filter === "Alert Category") && (
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence.category}</td>
                )}
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
        {showReportForm && (
  <AutomatedReportForm onClose={handleCloseReportForm} onSubmit={handleSubmitReport} />
)}

{showGenerateReport && (
  <GenerateReportModal onClose={handleCloseGenerateReport} onSubmit={handleSubmitGenerateReport} />
)}
        
      </div>
    </div>
  )
}

export default Offences
