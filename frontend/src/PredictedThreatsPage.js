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
  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState(null);

  const userRole = "2";
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleDeletePrediction = async (prediction) => {
    if (!window.confirm("Are you sure you want to delete this prediction?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/threat/prediction/${prediction.id}`);
      setPredictions((prev) => prev.filter((p) => p.id !== prediction.id));
      alert("Prediction deleted.");
    } catch (err) {
      alert("Failed to delete prediction.");
    }
  };


  const handleView = async (prediction) => {
    setShowModal(true);
    setSelectedLog(null);
    setLogLoading(true);
    setLogError(null);
    try {
      const orgId = await getOrgId();
      const response = await axios.get(
        `${API_BASE_URL}/event/${prediction.log_id}?orgId=${orgId}`
      );
      setSelectedLog(response.data || { error: "Log not found" });
    } catch (err) {
      setLogError(
        err.response && err.response.status === 404
          ? "Log not found"
          : "Failed to fetch log details"
      );
    } finally {
      setLogLoading(false);
    }};

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLog(null);
    setLogError(null);
  };


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
                    position: "sticky",
                    top: 0,
                    background: "#fff",
                    zIndex: 2,
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Log ID
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#fff",
                    zIndex: 2,
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Prediction
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#fff",
                    zIndex: 2,
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Detected At
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#fff",
                    zIndex: 2,
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Action
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
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    <button
                      style={{
                        padding: "6px 16px",
                        background: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      marginRight: "10px",
                      }}
                      onClick={() => handleView(prediction)}
                    >
                      View
                    </button>
                    <button
                      style={{
                        padding: "6px 16px",
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                      onClick={() => handleDeletePrediction(prediction)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

         {/* Modal for log details */}
         {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={handleCloseModal}
          >
            <div
              style={{
                background: "#fff",
                padding: "32px",
                borderRadius: "8px",
                minWidth: "350px",
                maxWidth: "90vw",
                maxHeight: "80vh",
                overflowY: "auto",
                boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Log Details</h2>
              {logLoading && <div>Loading log details...</div>}
              {logError && <div style={{ color: "red" }}>{logError}</div>}
              {selectedLog && !selectedLog.error && (
                <table style={{ width: "100%" }}>
                  <tbody>
                    {Object.entries(selectedLog).map(([key, value]) => (
                      <tr key={key}>
                        <td style={{ fontWeight: "bold", padding: "4px 8px", verticalAlign: "top" }}>{key}</td>
                        <td style={{ padding: "4px 8px" }}>{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {selectedLog && selectedLog.error && (
                <div style={{ color: "red" }}>{selectedLog.error}</div>
              )}
              <button
                style={{
                  marginTop: "20px",
                  padding: "8px 20px",
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictedThreatsPage;