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
  Tooltip,
} from "recharts"
import Sidebar from "./Sidebar"
import axios from 'axios';
import { Select, ColorPicker } from 'antd';
import defaultClassifications from './defaultClassifications';  
const { Option } = Select;

const userRole = "network-admin"

const Dashboard = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offences, setOffences] = useState([]);
  const [timeRange, setTimeRange] = useState('5days'); // Add this new state
  const [plotTimeGranularity, setPlotTimeGranularity] = useState('daily');
  const [chartColors, setChartColors] = useState({
    critical: '#000000',
    high: '#ff4d4f',
    medium: '#faad14',
    low: '#52c41a',
    total: '#8884d8',
    custom: getRandomColor(),
    sourceChart: '#1890ff', // Add this new color
  });
  const [topSourcesLimit, setTopSourcesLimit] = useState(10);
  const [sourceMetric, setSourceMetric] = useState('src_ip');
  const [selectedSource, setSelectedSource] = useState('src_ip');
  //const [attackData, setAttackData] = useState([]);
  
  function convertToKeyValuePair(data) {
    return data.reduce((acc, item) => {
      acc[item.text.toLowerCase()] = { name: item.name, priority: item.priority };
      return acc;
    }, {});
  }
  
  const classifications = convertToKeyValuePair(defaultClassifications);

  

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

  const handleLogout = () => {
    navigate("/login")
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

  // Add this helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  } 
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

  // Add this new memoized calculation for alerts over time
  const alertsOverTime = useMemo(() => {
    const timeData = {};
    
    // Group alerts by hour
    filteredOffences.forEach(offence => {
      const date = new Date(offence.timestamp);
      // Format to YYYY-MM-DD HH:00 to group by hour
      const timeKey = new Date(date.setMinutes(0, 0, 0)).toISOString();
      
      if (!timeData[timeKey]) {
        timeData[timeKey] = {
          time: timeKey,
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        };
      }
      
      // Increment total count
      timeData[timeKey].total += 1;
      
      // Categorize by priority
      const priority = getPriority(offence.classification.toLowerCase().trim());
      if (priority === 1) timeData[timeKey].critical += 1;
      else if (priority === 2) timeData[timeKey].high += 1;
      else if (priority === 3) timeData[timeKey].medium += 1;
      else if (priority === 4) timeData[timeKey].low += 1;
    });

    // Convert to array and sort by time
    return Object.values(timeData)
      .sort((a, b) => new Date(a.time) - new Date(b.time))
      .map(item => ({
        ...item,
        time: new Date(item.time).toLocaleTimeString(), // Format time for display
      }));
  }, [filteredOffences]);

  // Add memoized calculation for top attack sources
  const topAttackSources = useMemo(() => {
    const sourceCount = {};
    
    filteredOffences.forEach(offence => {
      const key = offence[selectedSource]?.toString() || 'Unknown';
      sourceCount[key] = (sourceCount[key] || 0) + 1;
    });

    return Object.entries(sourceCount)
      .map(([key, count]) => ({ 
        key,
        count,
        label: `${key}${selectedSource.includes('port') ? ' (Port)' : ''}`
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topSourcesLimit);
  }, [filteredOffences, selectedSource, topSourcesLimit]);

  // Add color change handler
  const handleColorChange = (colorKey, color) => {
    setChartColors(prev => ({
      ...prev,
      [colorKey]: color.toHexString()
    }));
  };

  // Add source metric options
  const sourceMetricOptions = [
    { value: 'src_ip', label: 'Source IP' },
    { value: 'dest_ip', label: 'Destination IP' },
    { value: 'src_port', label: 'Source Port' },
    { value: 'dest_port', label: 'Destination Port' },
  ];

  const sourceOptions = [
    { value: 'src_ip', label: 'Source IP', label2: ' Source IPs', description: 'Shows which IPs are generating the most alerts' },
    { value: 'dest_ip', label: 'Destination IP', label2: ' Destination IPs', description: 'Helps identify which servers are targeted the most' },
    { value: 'src_port', label: 'Source Port', label2: ' Source Ports', description: 'Useful for analyzing where traffic originates' },
    { value: 'dest_port', label: 'Destination Port', label2: ' Targeted Ports', description: 'Helps understand which services are being targeted' }
  ];

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

        {/* Add Color Customization Panel */}
        <div style={{ marginBottom: "20px", background: "white", padding: "20px", borderRadius: "8px" }}>
          <h3>Chart Color Customization</h3>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div>
              <label>Critical</label>
              <ColorPicker value={chartColors.critical} onChange={(color) => handleColorChange('critical', color)} />
            </div>
            <div>
              <label>High</label>
              <ColorPicker value={chartColors.high} onChange={(color) => handleColorChange('high', color)} />
            </div>
            <div>
              <label>Medium</label>
              <ColorPicker value={chartColors.medium} onChange={(color) => handleColorChange('medium', color)} />
            </div>
            <div>
              <label>Low</label>
              <ColorPicker value={chartColors.low} onChange={(color) => handleColorChange('low', color)} />
            </div>
            <div>
              <label>Total Line</label>
              <ColorPicker value={chartColors.total} onChange={(color) => handleColorChange('total', color)} />
            </div>
          </div>
        </div>

        {/* Add Top Attack Sources Chart */}

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
                  <Bar dataKey="critical" name="Critical" fill={chartColors.critical} stackId="stack" />
                  <Bar dataKey="high" name="High" fill={chartColors.high} stackId="stack" />
                  <Bar dataKey="medium" name="Medium" fill={chartColors.medium} stackId="stack" />
                  <Bar dataKey="low" name="Low" fill={chartColors.low} stackId="stack" />
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
                  backgroundColor: chartColors.critical, 
                  marginRight: "8px" 
                }} />
                <span>Critical</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "12px", 
                  backgroundColor: chartColors.high, 
                  marginRight: "8px" 
                }} />
                <span>High Priority</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "12px", 
                  backgroundColor: chartColors.medium, 
                  marginRight: "8px" 
                }} />
                <span>Medium Priority</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "12px", 
                  backgroundColor: chartColors.low, 
                  marginRight: "8px" 
                }} />
                <span>Low Priority</span>
              </div>
            </div>

            <h3>Alerts Over Time</h3>
            <div style={{ width: "100%", height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={alertsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke={chartColors.total} 
                    name="Total Alerts"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="critical" 
                    stroke={chartColors.critical} 
                    name="Critical"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="high" 
                    stroke={chartColors.high} 
                    name="High"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="medium" 
                    stroke={chartColors.medium} 
                    name="Medium"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="low" 
                    stroke={chartColors.low} 
                    name="Low"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Add legend for the line chart */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: "20px", 
              marginTop: "10px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "2px", 
                  backgroundColor: chartColors.total, 
                  marginRight: "8px" 
                }} />
                <span>Total Alerts</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "2px", 
                  backgroundColor: chartColors.critical, 
                  marginRight: "8px" 
                }} />
                <span>Critical</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "2px", 
                  backgroundColor: chartColors.high, 
                  marginRight: "8px" 
                }} />
                <span>High</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "2px", 
                  backgroundColor: chartColors.medium, 
                  marginRight: "8px" 
                }} />
                <span>Medium</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "12px", 
                  height: "2px", 
                  backgroundColor: chartColors.low, 
                  marginRight: "8px" 
                }} />
                <span>Low</span>
              </div>
            </div>
            <div style={{ marginBottom: "24px", background: "white", padding: "20px", borderRadius: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          
          <div>
            <h3 style={{ marginBottom: "8px" }}>Top {sourceOptions.find(opt => opt.value === selectedSource)?.label2}</h3>
            <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
              {sourceOptions.find(opt => opt.value === selectedSource)?.description}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Select
              value={selectedSource}
              onChange={value => setSelectedSource(value)}
              style={{ width: 180 }}
            >
              {sourceOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Select
              value={topSourcesLimit}
              onChange={setTopSourcesLimit}
              style={{ width: 120 }}
            >
              <Option value={5}>Top 5</Option>
              <Option value={10}>Top 10</Option>
              <Option value={20}>Top 20</Option>
              <Option value={50}>Top 50</Option>
            </Select>
          </div>
        </div>

        {/* Add color customization for source chart */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ marginRight: "10px" }}>Chart Color:</label>
          <ColorPicker
            value={chartColors.sourceChart}
            onChange={(color) => handleColorChange('sourceChart', color)}
          />
        </div>
        
        <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topAttackSources}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="key"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={45}
                textAnchor="start"
              />
              <YAxis />
              <Tooltip
                // formatter={(value) => [value, 'Count']}
                formatter={(value, name, props) => [value, 'Count']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar 
                dataKey="count" 
                fill={chartColors.sourceChart}
                name={sourceOptions.find(opt => opt.value === selectedSource)?.label}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
        <div style={{ marginBottom: "24px", background: "white", padding: "20px", borderRadius: "8px" }}>
      
    </div>
      </div>
    </div>
  )
}

export default Dashboard