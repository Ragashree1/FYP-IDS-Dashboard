"use client"

import React,  {useState, useMemo, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
  const isActive = (path) => location.pathname.startsWith(path);

  const [filter, setFilter] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOffence, setSelectedOffence] = useState(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [showGenerateReport, setShowGenerateReport] = useState(false)
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offences, setOffences] = useState([]);
  //const [attackData, setAttackData] = useState([]);
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

  const attackData = Object.values(
      offences.reduce((acc, offence) => {
          const message = offence._source?.message || ''; // Ensure message exists
          const parts = message.split(','); 
          const attackType = parts[11] ? parts[11].toLowerCase().trim() : 'Unknown'; // Extract attack type
          
          if (!acc[attackType]) {
              acc[attackType] = { name: attackType, value: 0, color: getRandomColor() }; // Initialize
          }
          acc[attackType].value += 1; // Aggregate count
  
          return acc;
        }, {})
    );
    // function getRandomColor() {
    //   return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    // }
    function getRandomColor() {
      const colors = ['#8884d8', '#ffc658', '#ff8042', '#82ca9d', '#d84d8d', '#4d88d8'];
      return colors[Math.floor(Math.random() * colors.length)];
  }
  
  
  

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
  // const attackData = [
  //   { name: 'Ransomwares', value: 20, color: '#8884d8' },
  //   { name: 'DDos', value: 20, color: '#ffc658' },
  //   { name: 'Phishing', value: 15, color: '#ff8042' },
  //   { name: 'SQL Injections', value: 7, color: '#82ca9d' },
  // ];

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
