"use client"

import React, { useState, useMemo, useEffect} from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from 'axios';

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
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offences, setOffences] = useState([]);
  const classifications = {
    "not suspicious": { priority: 3, text: "Not Suspicious Traffic" },
    "unknown": { priority: 3, text: "Unknown Traffic" },
    "bad unknown": { priority: 2, text: "Potentially Bad Traffic" },
    "attempted recon": { priority: 2, text: "Attempted Information Leak" },
    "successful recon limited": { priority: 2, text: "Information Leak" },
    "successful recon largescale": { priority: 2, text: "Large Scale Information Leak" },
    "attempted dos": { priority: 2, text: "Attempted Denial of Service" },
    "successful dos": { priority: 2, text: "Denial of Service" },
    "attempted user": { priority: 1, text: "Attempted User Privilege Gain" },
    "unsuccessful user": { priority: 1, text: "Unsuccessful User Privilege Gain" },
    "successful user": { priority: 1, text: "Successful User Privilege Gain" },
    "attempted admin": { priority: 1, text: "Attempted Administrator Privilege Gain" },
    "successful admin": { priority: 1, text: "Successful Administrator Privilege Gain" },
    "rpc portmap decode": { priority: 2, text: "Decode of an RPC Query" },
    "shellcode detect": { priority: 1, text: "Executable code was detected" },
    "string detect": { priority: 3, text: "A suspicious string was detected" },
    "suspicious filename detect": { priority: 2, text: "A suspicious filename was detected" },
    "suspicious login": { priority: 2, text: "An attempted login using a suspicious username was detected" },
    "system call detect": { priority: 2, text: "A system call was detected" },
    "tcp connection": { priority: 4, text: "A TCP connection was detected" },
    "trojan activity": { priority: 1, text: "A Network Trojan was detected" },
    "unusual client port connection": { priority: 2, text: "A client was using an unusual port" },
    "network scan": { priority: 3, text: "Detection of a Network Scan" },
    "denial of service": { priority: 2, text: "Detection of a Denial of Service Attack" },
    "non standard protocol": { priority: 2, text: "Detection of a non standard protocol or event" },
    "protocol command decode": { priority: 3, text: "Generic Protocol Command Decode" },
    "web application activity": { priority: 2, text: "Access to a potentially vulnerable web application" },
    "web application attack": { priority: 1, text: "Web Application Attack" },
    "misc activity": { priority: 3, text: "Misc activity" },
    "misc attack": { priority: 2, text: "Misc Attack" },
    "icmp event": { priority: 3, text: "Generic ICMP event" },
    "inappropriate content": { priority: 1, text: "Inappropriate Content was Detected" },
    "policy violation": { priority: 1, text: "Potential Corporate Privacy Violation" },
    "default login attempt": { priority: 2, text: "Attempt to login by a default username and password" },
    "sdf": { priority: 2, text: "Sensitive Data" },
    "file format": { priority: 1, text: "Known malicious file or file based exploit" },
    "malware cnc": { priority: 1, text: "Known malware command and control traffic" },
    "client side exploit": { priority: 1, text: "Known client side exploit attempt" }
};


  useEffect(() => {
    axios.get('http://localhost:8000/logs')
      .then(response => {
        if (response.data.hits && response.data.hits.hits) {
          setLogs(response.data.hits.hits);
          setOffences(response.data.hits.hits);
          console.log(response.data.hits.hits)
        } else {
          setLogs([]);
          setError('Unexpected data format from server');
        }
      })
      .catch(error => {
        console.error('Error fetching logs:', error);
        setError('Failed to fetch logs');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  const isActive = (path) => location.pathname.startsWith(path)

  const filteredOffences = useMemo(() => {
    return offences
  }, [offences])

  function getAlertCount() {
    return offences.length
  }

  
  function getHighAlerts() {
    return offences.map((offence, index) => getPriority(offence._source['message'].split(',')[11].toLowerCase().trim() || 'N/A')).filter((val) => val == 1).length

  }

  
  function getMediumAlerts() {
    return offences.map((offence, index) => getPriority(offence._source['message'].split(',')[11].toLowerCase().trim() || 'N/A')).filter((val) => val == 2 || val == 3).length

  }

  function getLowAlerts() {
    return offences.map((offence, index) => getPriority(offence._source['message'].split(',')[11].toLowerCase().trim() || 'N/A')).filter((val) => val == 4).length

  }

  function getUncategorizedAlerts() {
    return offences.filter((offence, index) => getPriority(offence._source['message'].split(',')[11].toLowerCase().trim() || 'N/A') == 'Unknown').length
  }

  const openModal = (offence) => {
    setSelectedOffence(offence)
    setIsModalOpen(true)
  }

  function getPriority(name) {
    console.log(name)
    name = name.trim()
    console.log(classifications[name])
    return classifications[name] ? classifications[name].priority : 'Unknown'
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
            <p>Total Alerts </p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{getAlertCount()}</p>
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
            <p>Uncategorized Alerts</p>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{getUncategorizedAlerts()}</p>
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
              {(filter === "" || filter === "Alert Message") && (
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>
                  Alert Message
                </th>
              )}
              {(filter === "" || filter === "Date & Time") && (
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Date & Time</th>
              )}
              {(filter === "" || filter === "Alert Name") && (
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Protocol</th>
              )}
              {(filter === "" || filter === "Alert Category") && (
                <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Alert Category</th>
              )}
              <th style={{ padding: "10px", textAlign: "center", borderRight: "1px solid #aaa" }}>Severity level (1=High, 4=Low)</th>
              <th style={{ padding: "10px", textAlign: "center" }}>View</th>
            </tr>
          </thead>
          <tbody>
            {offences.map((offence, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  <input type="checkbox" />
                </td>
                {(filter === "" || filter === "Alert Message") && (
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence._source['message'].split(',')[10].replace(/"/g, '') || 'N/A'}</td>
                )}
                {(filter === "" || filter === "Date & Time") && (
                  <td style={{ padding: "10px", textAlign: "center" }}>{new Date(offence._source['@timestamp']).toLocaleString()}</td>
                )}
                {(filter === "" || filter === "Protocol") && (
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence._source['message'].split(',')[2] || 'N/A'}</td>
                )}
                {(filter === "" || filter === "Alert Category") && (
                  <td style={{ padding: "10px", textAlign: "center" }}>{offence._source['message'].split(',')[11].toLowerCase() || 'N/A'}</td>
                )}
                <td style={{ padding: "10px", textAlign: "center" }}>{getPriority(offence._source['message'].split(',')[11].toLowerCase().trim() || 'N/A')}</td>
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
        {selectedOffence._source['message'].split(',')[10]?.trim().replace(/^"|"$/g, '') || 'N/A'}
      </div>
      <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Date & Time:</p>
      <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
        {selectedOffence._source['@timestamp'] ? new Date(selectedOffence._source['@timestamp']).toLocaleString() : 'N/A'}
      </div>
      <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Source IP:</p>
      <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
        {selectedOffence._source['message'].split(',')[7]  || 'N/A'}
      </div>
    </div>
    <div>
      <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Alert Type:</p>
      <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
        {selectedOffence._source['message'].split(',')[11]|| 'N/A'}
      </div>
      <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Alert Protocol:</p>
      <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
      {selectedOffence._source['message'].split(',')[2]  || 'N/A'}
      </div>
      <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Destination IP:</p>
      <div style={{ background: "#f0f0f0", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}>
        {selectedOffence._source['message'].split(',')[8]  || 'N/A'}
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
