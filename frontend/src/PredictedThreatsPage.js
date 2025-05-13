import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const PredictedThreatsPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const userRole = "2";

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const getOrgId = async () => {
    const token = localStorage.getItem("token");
    console.log("printing token ");
    console.log(token);
    const response = await fetch(`${API_BASE_URL}/login/get_user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    console.log("printing data");
    console.log(data);
    return data.user.organization_id;
  };

  const getPredictions = async (pageNum = 1) => {
    try {
      const orgId = await getOrgId();
      if (!orgId) {
        setError("Failed to fetch organization ID");
        setLoading(false); // Ensure loading is stopped
        return;
      }

      setLoadingMore(true);
      const response = await axios.get(
        `${API_BASE_URL}/threat/predictions/organization/${orgId}?page=${pageNum}&limit=20`
      );
      console.log("Predictions API response:", response.data);

      const { items, total, has_more } = response.data;

      if (pageNum === 1) {
        setPredictions(items || []);
      } else {
        setPredictions((prev) => [...prev, ...(items || [])]);
      }

      setHasMore(has_more);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setError("Failed to fetch predictions");
    } finally {
      setLoading(false); // Always stop loading
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getPredictions(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      getPredictions(nextPage);
    }
  };

  const observer = useRef();
  const lastPredictionRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

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
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Log ID
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Prediction
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((prediction, index) => (
                <tr
                  key={prediction.log_id}
                  ref={index === predictions.length - 1 ? lastPredictionRef : null}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  }}
                >
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {prediction.log_id}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {prediction.prediction}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {new Date(prediction.created_at).toLocaleString()}
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