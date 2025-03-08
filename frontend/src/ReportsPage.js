"use client"
import { useNavigate, useLocation } from "react-router-dom"

const Reports = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname.startsWith(path)

  const handleLogout = () => {
    navigate("/login")
  }

  const reports = [
    { name: "Report A", schedule: "Manual", createdBy: "Ng Mei Ting", dateGenerated: "6 Feb 2025" },
    { name: "Report B", schedule: "Manual", createdBy: "Ong Hui Min", dateGenerated: "6 Feb 2025" },
    { name: "Report C", schedule: "Monthly", createdBy: "Faris Amirul Bin Hassan", dateGenerated: "6 Feb 2025" },
    { name: "Report D", schedule: "Weekly", createdBy: "Ng Mei Ting", dateGenerated: "21 Dec 2024" },
    { name: "Report E", schedule: "Manual", createdBy: "Shalini Devi", dateGenerated: "17 Aug 2023" },
    { name: "Report F", schedule: "Manual", createdBy: "Christopher Pereira", dateGenerated: "13 Apr 2023" },
    { name: "Report G", schedule: "Monthly", createdBy: "Christopher Pereira", dateGenerated: "23 Mar 2021" },
    { name: "Report H", schedule: "Yearly", createdBy: "Faris Amirul Bin Hassan", dateGenerated: "17 Jul 2020" },
    { name: "Report I", schedule: "Weekly", createdBy: "Ong Hui Min", dateGenerated: "10 Apr 2019" },
    { name: "Report J", schedule: "Monthly", createdBy: "Shalini Devi", dateGenerated: "15 Jan 2019" },
  ]

  const handleDownload = (reportName) => {
    console.log(`Downloading ${reportName}`)
    // Add download logic here
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
        <h1>Reports</h1>

        {/* Reports Table */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #eee" }}>Report Name</th>
                <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #eee" }}>Schedule</th>
                <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #eee" }}>Created By</th>
                <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #eee" }}>Date Generated</th>
                <th style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                  Download Report
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr
                  key={report.name}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                    transition: "background-color 0.2s",
                  }}
                >
                  <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{report.name}</td>
                  <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{report.schedule}</td>
                  <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{report.createdBy}</td>
                  <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{report.dateGenerated}</td>
                  <td style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                    <button
                      onClick={() => handleDownload(report.name)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "5px",
                        fontSize: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.2s",
                        width: "30px",
                        height: "30px",
                        borderRadius: "4px",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      ↓
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports

