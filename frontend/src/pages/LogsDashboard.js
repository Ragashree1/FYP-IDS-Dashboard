import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LogsDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/logs')
      .then(response => {
        if (response.data.hits && response.data.hits.hits) {
          setLogs(response.data.hits.hits);
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

  if (loading) return <p>Loading logs...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Snort Logs</h1>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Device</th>
            <th>Alert Message</th>
            <th>Source IP</th>
            <th>Destination IP</th>
            <th>Protocol</th>
            <th>Alert Category</th>
            <th>Rule ID</th>
            <th>Flow</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <tr key={index}>
                <td>{new Date(log._source['@timestamp']).toLocaleString()}</td>
                <td>{log._source['host']['ip'][0]}</td>
                <td>{log._source['message'] || 'N/A'}</td>
                <td>{log._source['src_ap'] || 'N/A'}</td>
                <td>{log._source['dst_ap'] || 'N/A'}</td>
                <td>{log._source['proto']|| 'N/A'}</td>
                <td>{log._source['class']|| 'N/A'}</td>
                <td>{log._source['rule']|| 'N/A'}</td>
                <td>{log._source['dir'] == 'C2S' ? 'Client to Server' : log._source['dir'] =='S2C' ? 'Server to Client' : log._source['dir'] || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No logs found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LogsDashboard;
