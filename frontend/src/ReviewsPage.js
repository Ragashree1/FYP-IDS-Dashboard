"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import { checkPermissions, fetchPermissions } from "./utils/check_permissions"

const permission = "Reviews_Management"


const PermissionDeniedPopup = () => (
  <div className="permission-popup-overlay">
    <div className="success-popup">
      <div className="success-popup-header">
        <div className="success-popup-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <circle cx="12" cy="16" r="1"></circle>
          </svg>
        </div>
        <div className="success-popup-title">PERMISSION DENIED</div>
      </div>
      <div className="success-popup-content">
        <div className="success-popup-message">
          You do not have permission to view this page.
        </div>
      </div>
    </div>
  </div>
);


const ReviewsPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState(null)
  const [userPermission, setuserPermission] = useState([]) ;

  // Function to get the token - hardcoded for platform admin
  const getToken = () => {
    // For the platform admin page, we'll use the hardcoded mock token
    return "mock-token-for-platform-admin"
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const token = getToken()

      const response = await fetch("http://localhost:8000/reviews/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        mode: "cors",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched reviews:", data)
        setReviews(data)
      } else {
        throw new Error("Failed to fetch reviews")
      }
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setError("Failed to fetch reviews. Please try refreshing the page.")
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    const verifyPermissions = async () => {
      const allowed = await checkPermissions(permission);
      setHasPermission(allowed);
      if (!allowed) {
        setShowWarning(true);
      }
    };

    verifyPermissions();
  }, []);

  const getUserPermission = async () => {
      const perm  = await fetchPermissions();
      setuserPermission(perm);
      if (!perm) {
        setError("Failed to fetch user's permission for Sidebar");
      }
    };
    
    useEffect(() => {
      getUserPermission();
    }, []);


  const filteredReviews = (reviews || []).filter(
    (review) =>
      (review.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.review_text || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Updated to match the system-activity-logs-page approach
  const confirmDeleteReview = (review) => {
    setReviewToDelete(review)
    setShowDeleteConfirm(true)
  }

  if (!hasPermission) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar permissions = {userPermission} />
        <div style={{ flex: 1, position: 'relative' }}>
          {showWarning && <PermissionDeniedPopup />}
        </div>
      </div>
    );
  }

  const deleteReview = async (id) => {
    try {
      setDeleteLoading(true)
      const token = getToken()

      const response = await fetch(`http://localhost:8000/reviews/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        mode: "cors",
      })

      if (!response.ok && response.status !== 404) {
        // 404 is acceptable - it means the review was already deleted
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete review")
      }

      // Remove the review from the local state
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== id))
      return true
    } catch (err) {
      console.error("Error in deleteReview:", err)
      setError(`Failed to delete review: ${err.message}`)
      return false
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (reviewToDelete) {
      const success = await deleteReview(reviewToDelete.id)
      if (success) {
        setShowDeleteConfirm(false)
        setReviewToDelete(null)
      }
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchReviews()
  }

  // Format date to a readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Render star rating
  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          style={{
            color: i < rating ? "#FBBF24" : "#d1d5db",
            fontSize: "1.25rem",
          }}
        >
          ★
        </span>
      ))
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f4f4f4",
        overflow: "hidden",
      }}
    >
      <Sidebar permissions = {userPermission} />
      <div
        style={{
          flex: 1,
          padding: "32px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {error && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "4px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          </div>
        )}
        <h1 style={{ margin: "0 0 8px 0" }}>Reviews Management</h1>
        <h2 style={{ margin: "0 0 24px 0", fontWeight: "normal", color: "#666" }}>Customer Reviews</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Total Reviews: {reviews.length}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleRefresh}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                color: "#666",
              }}
            >
              🔄
            </button>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearch}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  width: "200px",
                  boxSizing: "border-box",
                }}
              />
              <button
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#666",
                }}
              >
                🔍
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "8px",
            overflow: "auto",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            maxWidth: "100%",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>#</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Name</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Email</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Company</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Rating</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Review</th>
                <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>Date</th>
                <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "16px", textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "16px", textAlign: "center" }}>
                    No reviews found
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review, index) => (
                  <tr
                    key={review.id}
                    style={{
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <td style={{ padding: "16px" }}>{index + 1}</td>
                    <td style={{ padding: "16px" }}>{review.name}</td>
                    <td style={{ padding: "16px" }}>{review.email}</td>
                    <td style={{ padding: "16px" }}>{review.company || "-"}</td>
                    <td style={{ padding: "16px" }}>{renderStars(review.rating)}</td>
                    <td style={{ padding: "16px", maxWidth: "300px" }}>
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {review.review_text}
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>{formatDate(review.created_at)}</td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                        <button
                          onClick={() => confirmDeleteReview(review)}
                          disabled={deleteLoading}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px",
                            opacity: deleteLoading ? 0.5 : 1,
                          }}
                          title="Delete Review"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #eee",
              textAlign: "right",
              color: "#666",
            }}
          >
            Page 1 of 1
          </div>
        </div>

        {/* Delete Confirmation Modal - Inline like in SystemActivityLogsPage */}
        {showDeleteConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                width: "400px",
                maxWidth: "90%",
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: "0 0 16px 0" }}>Delete Review</h3>
              <p style={{ margin: "0 0 24px 0", color: "#666" }}>
                Are you sure you want to delete the review from {reviewToDelete?.name}?
              </p>
              <p style={{ margin: "0 0 24px 0", color: "#666" }}>
                This action cannot be undone and this review will be permanently deleted.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  style={{
                    padding: "8px 24px",
                    backgroundColor: "#52c41a",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    opacity: deleteLoading ? 0.7 : 1,
                  }}
                >
                  {deleteLoading ? "Deleting..." : "Confirm"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: "8px 24px",
                    backgroundColor: "#ffccc7",
                    color: "#f5222d",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsPage
