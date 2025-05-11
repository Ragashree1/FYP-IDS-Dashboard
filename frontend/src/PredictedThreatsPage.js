import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const PredictedThreatsPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = "2";

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const getOrgId = async () => {
    const token = localStorage.getItem("token");
    console.log("printing token ")
    console.log(token)
    const response = await fetch(`${API_BASE_URL}/login/get_user`, {
      headers : { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) { 
      return null;
    }
    const data = await response.json();
    console.log("printing data")
    console.log(data)
    return data.user.organization_id;}
  
    const getPredictions = async () => {
      const orgId = await getOrgId();
      if (!orgId) {
      setError("Failed to fetch organization ID");
      return;
      }
      try {
      const response = await axios.get(`http://localhost:8000/threat/predictions/organization/${orgId}`);
      setPredictions(response.data);
      }
      catch (error) {
      console.error("Error fetching predictions:", error);
      setError("Failed to fetch predictions");
      }
      finally {
      setLoading(false);
      }
    };

    useEffect(() => {
      setLoading(true);
      getPredictions();
    }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f4f4f4" }}>
      <Sidebar userRole={userRole} />

      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Predicted Threats</h1>

        <div style={{ width: "100%", maxHeight: "700px", overflowY: "auto" }}>
          <table
            style={{
              width: "100%",
              background: "#fff",
              borderCollapse: "collapse",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              minWidth: "800px",
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Log ID</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Prediction</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Created At</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Destination Port</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Flow Duration</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Total Fwd Packets</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Total Bwd Packets</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((prediction, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{prediction.log_id}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{prediction.prediction}</td>
                  
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {new Date(prediction.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {prediction.log_details.dstport || "N/A"}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {prediction.log_details.flow_duration || "N/A"}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {prediction.log_details.total_fwd_packets || "N/A"}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {prediction.log_details.total_bwd_packets || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PredictedThreatsPage;