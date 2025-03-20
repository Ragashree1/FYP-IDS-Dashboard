"use client"

import React from 'react';
import { useState ,useEffect } from "react"
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell,ResponsiveContainer } from 'recharts'
import Sidebar from "./Sidebar"
import axios from 'axios';;
const userRole = "network-admin"

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
  const defaultClassifications = [
    { name: "not-suspicious", priority: 3, text: "Not Suspicious Traffic" },
    { name: "unknown", priority: 3, text: "Unknown Traffic" },
    { name: "bad-unknown", priority: 2, text: "Potentially Bad Traffic" },
    { name: "attempted-recon", priority: 2, text: "Attempted Information Leak" },
    { name: "successful-recon-limited", priority: 2, text: "Information Leak" },
    { name: "successful-recon-largescale", priority: 2, text: "Large Scale Information Leak" },
    { name: "attempted-dos", priority: 2, text: "Attempted Denial of Service" },
    { name: "successful-dos", priority: 2, text: "Denial of Service" },
    { name: "attempted-user", priority: 1, text: "Attempted User Privilege Gain" },
    { name: "unsuccessful-user", priority: 1, text: "Unsuccessful User Privilege Gain" },
    { name: "successful-user", priority: 1, text: "Successful User Privilege Gain" },
    { name: "attempted-admin", priority: 1, text: "Attempted Administrator Privilege Gain" },
    { name: "successful-admin", priority: 1, text: "Successful Administrator Privilege Gain" },
    { name: "rpc-portmap-decode", priority: 2, text: "Decode of an RPC Query" },
    { name: "shellcode-detect", priority: 1, text: "Executable code was detected" },
    { name: "string-detect", priority: 3, text: "A suspicious string was detected" },
    { name: "suspicious-filename-detect", priority: 2, text: "A suspicious filename was detected" },
    { name: "suspicious-login", priority: 2, text: "An attempted login using a suspicious username was detected" },
    { name: "system-call-detect", priority: 2, text: "A system call was detected" },
    { name: "tcp-connection", priority: 4, text: "A TCP connection was detected" },
    { name: "trojan-activity", priority: 1, text: "A Network Trojan was detected" },
    { name: "unusual-client-port-connection", priority: 2, text: "A client was using an unusual port" },
    { name: "network-scan", priority: 3, text: "Detection of a Network Scan" },
    { name: "denial-of-service", priority: 2, text: "Detection of a Denial of Service Attack" },
    { name: "non-standard-protocol", priority: 2, text: "Detection of a non-standard protocol or event" },
    { name: "protocol-command-decode", priority: 3, text: "Generic Protocol Command Decode" },
    { name: "web-application-activity", priority: 2, text: "Access to a potentially vulnerable web application" },
    { name: "web-application-attack", priority: 1, text: "Web Application Attack" },
    { name: "misc-activity", priority: 3, text: "Misc activity" },
    { name: "misc-attack", priority: 2, text: "Misc Attack" },
    { name: "icmp-event", priority: 3, text: "Generic ICMP event" },
    { name: "inappropriate-content", priority: 1, text: "Inappropriate Content was Detected" },
    { name: "policy-violation", priority: 1, text: "Potential Corporate Privacy Violation" },
    { name: "default-login-attempt", priority: 2, text: "Attempt to login by a default username and password" },
    { name: "sdf", priority: 2, text: "Sensitive Data" },
    { name: "file-format", priority: 1, text: "Known malicious file or file based exploit" },
    { name: "malware-cnc", priority: 1, text: "Known malware command and control traffic" },
    { name: "client-side-exploit", priority: 1, text: "Known client side exploit attempt" }
  ];
  
  function convertToKeyValuePair(data) {
    return data.reduce((acc, item) => {
      acc[item.text.toLowerCase()] = { name: item.name, priority: item.priority };
      return acc;
    }, {});
  }
  
  const classifications = convertToKeyValuePair(defaultClassifications);

  const attackData = Object.values(
      offences.reduce((acc, offence) => {
          let attackType = offence.classification  || 'Unknown'; // Extract attack type
          if (attackType.toString().toLowerCase().includes("none") || attackType.toString().toLowerCase().includes("unknown")) {
            attackType = "Others";
        }
        
          // if (!(attackType in Object.keys(classifications))) {
          //   attackType = 'Others';
          // }
          
          if (!acc[attackType]) {
              acc[attackType] = { name: attackType, value: 0, color: getRandomColor() }; // Initialize
          }
          acc[attackType].value += 1; // Aggregate count
  
          return acc;
        }, {})
    );
    function getRandomColor() {
      return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    } 
  

  useEffect(() => {
    axios.get('http://localhost:8000/alerts')
      .then(response => {
        if (response.data) {
          setLogs(response.data);
          setOffences(response.data);
          console.log(response.data)
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
  // const attackData = [
  //   { name: 'Ransomwares', value: 20, color: '#8884d8' },
  //   { name: 'DDos', value: 20, color: '#ffc658' },
  //   { name: 'Phishing', value: 15, color: '#ff8042' },
  //   { name: 'SQL Injections', value: 7, color: '#82ca9d' },
  // ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/LandingPage");
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
        {/* <div
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
        </div> */}

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
            <h3>Types of Attack Over Past 30 days</h3>
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