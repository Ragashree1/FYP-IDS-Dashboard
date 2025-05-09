import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const PredictedThreatsPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = "2";

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8000/threat/predictions")
      .then((response) => {
        setPredictions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching predictions:", error);
        setError("Failed to fetch predictions");
      })
      .finally(() => {
        setLoading(false);
      });
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
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #eee" }}>Confidence</th>
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
                    {prediction.confidence ? `${(prediction.confidence * 100).toFixed(2)}%` : "N/A"}
                  </td>
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