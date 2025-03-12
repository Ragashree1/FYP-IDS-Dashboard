"use client"
import { useNavigate, useLocation } from "react-router-dom"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts"
import Sidebar from "./Sidebar"

const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const userRole = "network-admin"

  // Monthly alerts data
  const monthlyData = [
    { month: "Jan", positive: 15, negative: 18 },
    { month: "Feb", positive: 12, negative: 15 },
    { month: "Mar", positive: 22, negative: 14 },
    { month: "Apr", positive: 8, negative: 10 },
    { month: "May", positive: 10, negative: 8 },
    { month: "Jun", positive: 5, negative: 12 },
    { month: "Jul", positive: 15, negative: 18 },
    { month: "Aug", positive: 12, negative: 15 },
    { month: "Sep", positive: 10, negative: 12 },
    { month: "Oct", positive: 8, negative: 15 },
    { month: "Nov", positive: 18, negative: 20 },
    { month: "Dec", positive: 15, negative: 12 },
  ]

  // Network traffic data
  const trafficData = [
    { time: "1", value1: 30, value2: 40 },
    { time: "2", value1: 35, value2: 45 },
    { time: "3", value1: 40, value2: 42 },
    { time: "4", value1: 45, value2: 48 },
    { time: "5", value1: 42, value2: 50 },
    { time: "6", value1: 40, value2: 46 },
    { time: "7", value1: 38, value2: 45 },
  ]

  // Attack types data
  const attackData = [
    { name: "Ransomwares", value: 20, color: "#8884d8" },
    { name: "DDos", value: 20, color: "#ffc658" },
    { name: "Phishing", value: 15, color: "#ff8042" },
    { name: "SQL Injections", value: 7, color: "#82ca9d" },
  ]

  const handleLogout = () => {
    navigate("/login")
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
      {/* Sidebar */}
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
        {/* Top Stats */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            flexWrap: "wrap", // Added to prevent overflow on small screens
          }}
        >
          <div
            style={{
              flex: "1 1 200px", // Changed from flex: 1 to prevent shrinking too small
              background: "#ddd",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "150px", // Added minimum width
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>100</div>
            <div>Active!</div>
          </div>
          <div
            style={{
              flex: "1 1 200px",
              background: "#ddd",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "150px",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>0</div>
            <div>Open</div>
          </div>
          <div
            style={{
              flex: "1 1 200px",
              background: "#ddd",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "150px",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>100+</div>
            <div>Ack</div>
          </div>
        </div>

        {/* Time Metrics */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            flexWrap: "wrap", // Added to prevent overflow on small screens
          }}
        >
          <div
            style={{
              flex: "1 1 200px",
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "200px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#007bff" }} />
              <div>
                <div>0d 0h 30m</div>
                <div>Mean Time to Acknowledge</div>
              </div>
            </div>
          </div>
          <div
            style={{
              flex: "1 1 200px",
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "200px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#007bff" }} />
              <div>
                <div>1d 0h 0m</div>
                <div>Mean Time to Resolve</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap", // Added to prevent overflow on small screens
          }}
        >
          <div
            style={{
              flex: "2 1 600px", // Changed from flex: 2 to be more responsive
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "300px", // Minimum width to ensure readability
              maxWidth: "100%", // Ensure it doesn't overflow its container
            }}
          >
            <h3>Alerts each month</h3>
            <div style={{ width: "100%", height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Bar dataKey="positive" fill="#8884d8" name="Positive" />
                  <Bar dataKey="negative" fill="#82ca9d" name="Negative" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <h3>Real time network Traffic</h3>
            <div style={{ width: "100%", height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Line type="monotone" dataKey="value1" stroke="#8884d8" />
                  <Line type="monotone" dataKey="value2" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            style={{
              flex: "1 1 300px",
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "250px", // Minimum width to ensure the pie chart is visible
            }}
          >
            <h3>Types of Attack over the last month</h3>
            <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attackData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attackData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: "20px" }}>
              {attackData.map((item, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: item.color,
                      marginRight: "8px",
                      borderRadius: "2px",
                    }}
                  />
                  <span>
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

