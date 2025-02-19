"use client"

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  
    const isActive = (path) => location.pathname.startsWith(path);


  // Monthly alerts data
  const monthlyData = [
    { month: 'Jan', positive: 15, negative: 18 },
    { month: 'Feb', positive: 12, negative: 15 },
    { month: 'Mar', positive: 22, negative: 14 },
    { month: 'Apr', positive: 8, negative: 10 },
    { month: 'May', positive: 10, negative: 8 },
    { month: 'Jun', positive: 5, negative: 12 },
    { month: 'Jul', positive: 15, negative: 18 },
    { month: 'Aug', positive: 12, negative: 15 },
    { month: 'Sep', positive: 10, negative: 12 },
    { month: 'Oct', positive: 8, negative: 15 },
    { month: 'Nov', positive: 18, negative: 20 },
    { month: 'Dec', positive: 15, negative: 12 },
  ];

  // Network traffic data
  const trafficData = [
    { time: '1', value1: 30, value2: 40 },
    { time: '2', value1: 35, value2: 45 },
    { time: '3', value1: 40, value2: 42 },
    { time: '4', value1: 45, value2: 48 },
    { time: '5', value1: 42, value2: 50 },
    { time: '6', value1: 40, value2: 46 },
    { time: '7', value1: 38, value2: 45 },
  ];

  // Attack types data
  const attackData = [
    { name: 'Ransomwares', value: 20, color: '#8884d8' },
    { name: 'DDos', value: 20, color: '#ffc658' },
    { name: 'Phishing', value: 15, color: '#ff8042' },
    { name: 'SQL Injections', value: 7, color: '#82ca9d' },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

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
              background: isActive("/offences") ? "#007bff" : "#333", // Highlighting Offences
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
        {/* Top Stats */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={{ flex: 1, background: "#ddd", padding: "20px", borderRadius: "8px" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>100</div>
            <div>Active!</div>
          </div>
          <div style={{ flex: 1, background: "#ddd", padding: "20px", borderRadius: "8px" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>0</div>
            <div>Open</div>
          </div>
          <div style={{ flex: 1, background: "#ddd", padding: "20px", borderRadius: "8px" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>100+</div>
            <div>Ack</div>
          </div>
        </div>

        {/* Time Metrics */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#007bff" }} />
              <div>
                <div>0d 0h 30m</div>
                <div>Mean Time to Acknowledge</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "8px" }}>
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
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 2, background: "#fff", padding: "20px", borderRadius: "8px" }}>
            <h3>Alerts each month</h3>
            <BarChart width={600} height={300} data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Bar dataKey="positive" fill="#8884d8" name="Positive" />
              <Bar dataKey="negative" fill="#82ca9d" name="Negative" />
            </BarChart>

            <h3>Real time network Traffic</h3>
            <LineChart width={600} height={200} data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Line type="monotone" dataKey="value1" stroke="#8884d8" />
              <Line type="monotone" dataKey="value2" stroke="#82ca9d" />
            </LineChart>
          </div>

          <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "8px" }}>
            <h3>Types of Attack over the last month</h3>
            <PieChart width={300} height={300}>
              <Pie
                data={attackData}
                cx={150}
                cy={150}
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
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;