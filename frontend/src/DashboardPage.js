import React, { useState, useMemo, useEffect } from 'react';
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
import axios from 'axios';


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
  const [timeRange, setTimeRange] = useState('30min'); // Add this new state
  const [plotTimeGranularity, setPlotTimeGranularity] = useState('monthly');
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

  // Time range options
  const timeRangeOptions = [
    { value: '30min', label: 'Last 30 Minutes' },
    { value: '5days', label: 'Last 5 Days' },
    { value: '10days', label: 'Last 10 Days' },
    { value: '1month', label: 'Last Month' },
    { value: '1year', label: 'Last Year' }
  ];

  // Filter data based on time range
  const filterDataByTimeRange = (data, range) => {
    const now = new Date();
    let filterDate = new Date();

    switch (range) {
      case '30min':
        filterDate.setMinutes(now.getMinutes() - 30);
        break;
      case '5days':
        filterDate.setDate(now.getDate() - 5);
        break;
      case '10days':
        filterDate.setDate(now.getDate() - 10);
        break;
      case '1month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case '1year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filterDate.setMinutes(now.getMinutes() - 30);
    }

    return data.filter(item => new Date(item.timestamp) >= filterDate);
  };

  // Memoized filtered data
  const filteredOffences = useMemo(() => {
    return filterDataByTimeRange(offences, timeRange);
  }, [offences, timeRange]);

  function getPriority(name) {
    name = name.trim()
    return classifications[name] ? classifications[name].priority : 'Unknown'
  }

  // Memoized attack data based on filtered offences
  const filteredAttackData = useMemo(() => {
    return Object.values(
      filteredOffences.reduce((acc, offence) => {
        let attackType = offence.classification || 'Unknown';
        if (attackType.toString().toLowerCase().includes("none") || 
            attackType.toString().toLowerCase().includes("unknown")) {
          attackType = "Others";
        }
        
        if (!acc[attackType]) {
          acc[attackType] = { name: attackType, value: 0, color: getRandomColor() };
        }
        acc[attackType].value += 1;
        return acc;
      }, {})
    );
  }, [filteredOffences]);

  // Add this before the return statement
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Add this new memoized calculation for monthly data
  const monthlyAlertData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(month => ({
      month,
      critical:0,
      high: 0,
      medium: 0,
      low: 0
    }));

    filteredOffences.forEach(offence => {
      const date = new Date(offence.timestamp);
      const monthIndex = date.getMonth();
      const priority = getPriority(offence.classification.toLowerCase().trim() || 'N/A');

      // Categorize alerts based on priority
      if (priority === 1) {
        monthlyData[monthIndex].critical += 1;
      } else if (priority === 2) {
        monthlyData[monthIndex].high += 1;
      } else if (priority === 3) {
        monthlyData[monthIndex].medium += 1;
      } else if (priority === 4) {
        monthlyData[monthIndex].low += 1;
      }
    });

    return monthlyData;
  }, [filteredOffences]);

  // Add this helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  // Add these new memoized calculations for different time granularities
  const alertsData = useMemo(() => {
    const data = {};
    
    filteredOffences.forEach(offence => {
      const date = new Date(offence.timestamp);
      let key;
      
      // Determine the key based on selected granularity
      switch (plotTimeGranularity) {
        case 'daily':
          key = formatDate(date);
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'yearly':
          key = date.getFullYear().toString();
          break;
        default:
          key = formatDate(date);
      }

      // Initialize the data structure if needed
      if (!data[key]) {
        data[key] = {
          period: key,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        };
      }

      // Increment the appropriate counter based on priority
      const priority = getPriority(offence.classification.toLowerCase().trim());
      if (priority === 1) data[key].critical += 1;
      else if (priority === 2) data[key].high += 1;
      else if (priority === 3) data[key].medium += 1;
      else if (priority === 4) data[key].low += 1;
    });

    // Convert to array and sort by period
    return Object.values(data).sort((a, b) => a.period.localeCompare(b.period));
  }, [filteredOffences, plotTimeGranularity]);


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
        {/* Add Time Range Filter */}
        <div style={{ marginBottom: "20px" }}>
          <select
            value={timeRange}
            onChange={handleTimeRangeChange}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              backgroundColor: "white",
              minWidth: "200px"
            }}
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Top Stats */}
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
        </div> */}

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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>Alerts Overview</h3>
              <select
                value={plotTimeGranularity}
                onChange={(e) => setPlotTimeGranularity(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  backgroundColor: "white"
                }}
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div style={{ width: "100%", height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12 }}
                    interval={0}  // Skip labels for better readability in daily view
                  />
                  <YAxis />
                  <Bar dataKey="critical" name="Critical" fill="#000000" stackId="stack" />
                  <Bar dataKey="high" name="High" fill="#ff4d4f" stackId="stack" />
                  <Bar dataKey="medium" name="Medium" fill="#faad14" stackId="stack" />
                  <Bar dataKey="low" name="Low" fill="#52c41a" stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: "20px", 
              marginTop: "10px" 
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "12px", 
                  backgroundColor: "#000000", 
                  marginRight: "8px" 
                }} />
                <span>Critical</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "12px", 
                  backgroundColor: "#ff4d4f", 
                  marginRight: "8px" 
                }} />
                <span>High Priority</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "12px", 
                  backgroundColor: "#faad14", 
                  marginRight: "8px" 
                }} />
                <span>Medium Priority</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "12px", 
                  backgroundColor: "#52c41a", 
                  marginRight: "8px" 
                }} />
                <span>Low Priority</span>
              </div>
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
            <h3>Types of Attack Over {timeRangeOptions.find(opt => opt.value === timeRange)?.label}</h3>
            <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredAttackData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {filteredAttackData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: "20px" }}>
              {filteredAttackData.map((item, index) => (
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