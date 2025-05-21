import React from 'react';
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Chart from "chart.js/auto"

const LandingPage = () => {
  const navigate = useNavigate()
  const barChartRef = useRef(null)
  const lineChartRef = useRef(null)
  const pieChartRef = useRef(null)
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200)

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    company: "",
    rating: 5,
    review_text: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Add a state for storing reviews
  const [testimonials, setTestimonials] = useState([])

  // Add a function to fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch("https://api.secuboard.live/reviews/")
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data)
      }
    } catch (err) {
      console.error("Error fetching reviews:", err)
    }
  }

  // Call fetchReviews when component mounts
  useEffect(() => {
    fetchReviews()
  }, [])

  const handleSignIn = () => {
    navigate("/login")
  }

  const handleRegister = () => {
    navigate("/register")
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const charts = []

    if (barChartRef.current && lineChartRef.current && pieChartRef.current) {
      // Bar Chart
      charts.push(
        new Chart(barChartRef.current, {
          type: "bar",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [
              {
                label: "Positive",
                data: [15, 8, 6, 7, 9, 12, 8, 10, 14, 9, 12, 14],
                backgroundColor: "#3B82F6",
              },
              {
                label: "Negative",
                data: [10, 12, 5, 8, 7, 6, 9, 8, 11, 10, 13, 11],
                backgroundColor: "#EF4444",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                align: "end",
                labels: {
                  usePointStyle: true,
                  boxWidth: 8,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: false,
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  // Adjust font size based on screen width
                  font: {
                    size: windowWidth < 768 ? 8 : 12,
                  },
                  maxRotation: windowWidth < 768 ? 45 : 0,
                },
              },
            },
          },
        }),
      )

      // Line Chart
      charts.push(
        new Chart(lineChartRef.current, {
          type: "line",
          data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
            datasets: [
              {
                label: "Traffic 1",
                data: [400, 300, 500, 450, 600, 400],
                borderColor: "#EF4444",
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
              },
              {
                label: "Traffic 2",
                data: [240, 350, 320, 400, 350, 300],
                borderColor: "#10B981",
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                display: false,
                beginAtZero: true,
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  // Adjust font size based on screen width
                  font: {
                    size: windowWidth < 768 ? 8 : 12,
                  },
                },
              },
            },
          },
        }),
      )

      // Pie Chart
      charts.push(
        new Chart(pieChartRef.current, {
          type: "pie",
          data: {
            labels: ["SQL Injection", "DDoS", "Phishing", "Ransomware"],
            datasets: [
              {
                data: [400, 300, 250, 200],
                backgroundColor: ["#10B981", "#FBBF24", "#EF4444", "#3B82F6"],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: windowWidth < 768 ? "bottom" : "right",
                labels: {
                  font: {
                    size: windowWidth < 768 ? 10 : 12,
                  },
                  boxWidth: windowWidth < 768 ? 10 : 15,
                },
              },
            },
          },
        }),
      )
    }

    // Cleanup function to destroy charts when component unmounts
    return () => {
      charts.forEach((chart) => chart.destroy())
    }
  }, [windowWidth])

  // Handle review form input changes
  const handleReviewInputChange = (e) => {
    const { name, value } = e.target
    setReviewForm({
      ...reviewForm,
      [name]: value,
    })

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  // Validate review form
  const validateReviewForm = () => {
    const errors = {}

    if (!reviewForm.name.trim()) {
      errors.name = "Name is required"
    }

    if (!reviewForm.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(reviewForm.email)) {
      errors.email = "Email is invalid"
    }

    if (!reviewForm.review_text.trim()) {
      errors.review_text = "Review text is required"
    } else if (reviewForm.review_text.trim().length < 5) {
      errors.review_text = "Review must be at least 5 characters"
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      errors.rating = "Rating must be between 1 and 5"
    }

    return errors
  }

  // Handle review form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const errors = validateReviewForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("https://api.secuboard.live/reviews/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to submit review")
      }

      // Get the newly created review from the response
      const newReview = await response.json()

      // Add the new review to the testimonials
      setTestimonials((prevTestimonials) => [newReview, ...prevTestimonials])

      // Reset form on success
      setReviewForm({
        name: "",
        email: "",
        company: "",
        rating: 5,
        review_text: "",
      })

      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (err) {
      console.error("Error submitting review:", err)
      setSubmitError(err.message || "Failed to submit review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        margin: 0,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        backgroundColor: "#f3f4f6",
        width: "100%",
        overflowX: "hidden", // Prevent horizontal scrolling
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: windowWidth < 640 ? "0.75rem" : "1rem",
          backgroundColor: "black",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          color: "white",
          width: "100%",
          boxSizing: "border-box", // Ensure padding is included in width
        }}
      >
        <div className="logo" style={{ display: "flex", alignItems: "center" }}>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Y8LDecX2cddd1SDl4hHq0tDECwe50j.png"
            alt="SecuBoard Logo"
            style={{
              height: windowWidth < 640 ? "50px" : "80px",
              width: "auto",
              marginRight: windowWidth < 640 ? "0.5rem" : "1rem",
            }}
          />
          {windowWidth > 480 && <span style={{ fontSize: windowWidth < 640 ? "1.25rem" : "1.5rem" }}>SecuBoard</span>}
        </div>
        <div>
          <button
            onClick={handleRegister}
            style={{
              padding: windowWidth < 640 ? "0.4rem 0.75rem" : "0.5rem 1rem",
              borderRadius: "9999px",
              fontSize: windowWidth < 640 ? "0.75rem" : "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              backgroundColor: "white",
              color: "#374151",
              border: "none",
              marginRight: "0.5rem",
            }}
          >
            Register
          </button>
          <button
            onClick={handleSignIn}
            style={{
              padding: windowWidth < 640 ? "0.4rem 0.75rem" : "0.5rem 1rem",
              borderRadius: "9999px",
              fontSize: windowWidth < 640 ? "0.75rem" : "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              backgroundColor: "#3B82F6",
              color: "white",
              border: "none",
            }}
          >
            Sign in
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: windowWidth < 640 ? "1rem 0.75rem" : "2rem 1rem",
          boxSizing: "border-box", // Ensure padding is included in width
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: "48rem",
            marginBottom: "3rem",
            width: "100%",
          }}
        >
          <h1
            style={{
              fontSize: windowWidth < 640 ? "1.5rem" : "1.875rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Welcome to SecuBoard – The Future of Intrusion Detection
          </h1>
          <h2
            style={{
              fontSize: windowWidth < 640 ? "1.125rem" : "1.25rem",
              color: "#4b5563",
              marginBottom: "1.5rem",
            }}
          >
            Protect Your Network with AI-Powered Threat Detection
          </h2>
          <p style={{ color: "#4b5563", marginBottom: "1.5rem" }}>
            SecuBoard is a next-generation, web-based Intrusion Detection System (IDS) that seamlessly integrates with
            industry-leading tools like Snort, Zeek, and Suricata, providing real-time network monitoring, AI-powered
            threat detection, and automated security alerts – all in one intuitive dashboard.
          </p>
          <p style={{ fontWeight: "bold" }}>Get Started Today!</p>
          <p>Join organizations worldwide in securing their networks with SecuBoard.</p>
          <p>Sign up now for early access and experience next-gen intrusion detection.</p>
          <p style={{ fontWeight: "bold" }}>Your network's security starts here.</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              windowWidth < 768
                ? "1fr"
                : windowWidth < 1024
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            boxSizing: "border-box", // Ensure content fits within container
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              padding: windowWidth < 640 ? "1rem" : "1.5rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              width: "100%",
              boxSizing: "border-box", // Ensure padding is included in width
            }}
          >
            <h3 style={{ fontWeight: 500, marginBottom: "1rem", textAlign: "left" }}>Alerts each month</h3>
            <div
              style={{
                flexGrow: 1,
                position: "relative",
                height: windowWidth < 640 ? "200px" : "300px",
                width: "100%",
              }}
            >
              <canvas ref={barChartRef}></canvas>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              padding: windowWidth < 640 ? "1rem" : "1.5rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              width: "100%",
              boxSizing: "border-box", // Ensure padding is included in width
            }}
          >
            <h3 style={{ fontWeight: 500, marginBottom: "1rem", textAlign: "left" }}>Real-time network Traffic</h3>
            <div
              style={{
                flexGrow: 1,
                position: "relative",
                height: windowWidth < 640 ? "200px" : "300px",
                width: "100%",
              }}
            >
              <canvas ref={lineChartRef}></canvas>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              padding: windowWidth < 640 ? "1rem" : "1.5rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              gridColumn: windowWidth < 768 ? "span 1" : "span 2",
              width: "100%",
              boxSizing: "border-box", // Ensure padding is included in width
            }}
          >
            <h3 style={{ fontWeight: 500, marginBottom: "1rem", textAlign: "left" }}>Types of Attack over the month</h3>
            <div
              style={{
                flexGrow: 1,
                position: "relative",
                height: windowWidth < 640 ? "250px" : "300px",
                width: "100%",
              }}
            >
              <canvas ref={pieChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div
          style={{
            marginTop: "3rem",
            marginBottom: "3rem",
            width: "100%",
            boxSizing: "border-box", // Ensure content fits within container
          }}
        >
          <h2
            style={{
              fontSize: windowWidth < 640 ? "1.25rem" : "1.5rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}
          >
            Key Features
          </h2>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              padding: windowWidth < 640 ? "1rem" : "1.5rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              width: "100%",
              boxSizing: "border-box", // Ensure padding is included in width
            }}
          >
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gridTemplateColumns:
                  windowWidth < 640
                    ? "1fr"
                    : windowWidth < 1024
                      ? "repeat(2, 1fr)"
                      : "repeat(auto-fit, minmax(300px, 1fr))",
                gap: windowWidth < 640 ? "1rem" : "1.5rem",
                width: "100%",
              }}
            >
              <li>
                <h3
                  style={{
                    fontSize: windowWidth < 640 ? "1rem" : "1.125rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: "0.5rem", color: "#3B82F6" }}>•</span>
                  Prioritized Threat Alerts
                </h3>
                <p
                  style={{
                    marginLeft: "1rem",
                    color: "#4b5563",
                    fontSize: windowWidth < 640 ? "0.875rem" : "1rem",
                  }}
                >
                  Receive real-time security notifications based on criticality.
                </p>
              </li>

              <li>
                <h3
                  style={{
                    fontSize: windowWidth < 640 ? "1rem" : "1.125rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: "0.5rem", color: "#3B82F6" }}>•</span>
                  Smart Blacklisting & Traffic Filtering
                </h3>
                <p
                  style={{
                    marginLeft: "1rem",
                    color: "#4b5563",
                    fontSize: windowWidth < 640 ? "0.875rem" : "1rem",
                  }}
                >
                  Easily add/remove IP addresses and filter network activity.
                </p>
              </li>

              <li>
                <h3
                  style={{
                    fontSize: windowWidth < 640 ? "1rem" : "1.125rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: "0.5rem", color: "#3B82F6" }}>•</span>
                  AI-Powered Threat Detection
                </h3>
                <p
                  style={{
                    marginLeft: "1rem",
                    color: "#4b5563",
                    fontSize: windowWidth < 640 ? "0.875rem" : "1rem",
                  }}
                >
                  Utilizes Machine Learning models for anomaly detection.
                </p>
              </li>

              <li>
                <h3
                  style={{
                    fontSize: windowWidth < 640 ? "1rem" : "1.125rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: "0.5rem", color: "#3B82F6" }}>•</span>
                  Custom Security Rules & Policies
                </h3>
                <p
                  style={{
                    marginLeft: "1rem",
                    color: "#4b5563",
                    fontSize: windowWidth < 640 ? "0.875rem" : "1rem",
                  }}
                >
                  Define organization-specific security rules.
                </p>
              </li>

              <li>
                <h3
                  style={{
                    fontSize: windowWidth < 640 ? "1rem" : "1.125rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: "0.5rem", color: "#3B82F6" }}>•</span>
                  Advanced Reporting & Insights
                </h3>
                <p
                  style={{
                    marginLeft: "1rem",
                    color: "#4b5563",
                    fontSize: windowWidth < 640 ? "0.875rem" : "1rem",
                  }}
                >
                  Generate detailed security reports for decision-making.
                </p>
              </li>

              <li>
                <h3
                  style={{
                    fontSize: windowWidth < 640 ? "1rem" : "1.125rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: "0.5rem", color: "#3B82F6" }}>•</span>
                  User Access Management
                </h3>
                <p
                  style={{
                    marginLeft: "1rem",
                    color: "#4b5563",
                    fontSize: windowWidth < 640 ? "0.875rem" : "1rem",
                  }}
                >
                  Multi-role authentication for Network Admins, IT Managers, Analysts, etc.
                </p>
              </li>

              <li>
                <h3
                  style={{
                    fontSize: windowWidth < 640 ? "1rem" : "1.125rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: "0.5rem", color: "#3B82F6" }}>•</span>
                  Seamless API Integration
                </h3>
                <p
                  style={{
                    marginLeft: "1rem",
                    color: "#4b5563",
                    fontSize: windowWidth < 640 ? "0.875rem" : "1rem",
                  }}
                >
                  Connect with external security tools for enhanced protection.
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "2rem 0", width: "100%" }}></div>

        {/* Customer Testimonials Section */}
        <div
          style={{
            marginTop: "2rem",
            width: "100%",
            boxSizing: "border-box", // Ensure content fits within container
          }}
        >
          <h2
            style={{
              fontSize: windowWidth < 640 ? "1.25rem" : "1.5rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}
          >
            Customer Testimonials
          </h2>

          {testimonials.length === 0 ? (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "0.5rem",
                padding: windowWidth < 640 ? "1rem" : "1.5rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                width: "100%",
                boxSizing: "border-box",
                textAlign: "center",
              }}
            >
              <p style={{ color: "#6b7280" }}>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "0.5rem",
                  padding: windowWidth < 640 ? "1rem" : "1.5rem",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  marginBottom: "1.5rem",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: windowWidth < 480 ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: windowWidth < 480 ? "flex-start" : "flex-start",
                    marginBottom: "1rem",
                    gap: windowWidth < 480 ? "0.5rem" : "0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        backgroundColor: "#e5e7eb",
                        borderRadius: "9999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontWeight: 500 }}>{testimonial.name}</h3>
                      {testimonial.company && (
                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                          {testimonial.company}
                        </p>
                      )}
                      <div style={{ display: "flex", color: "#FBBF24" }}>
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={i < testimonial.rating ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      color: "#6b7280",
                      fontSize: "0.875rem",
                      marginTop: windowWidth < 480 ? "0.25rem" : "0",
                    }}
                  >
                    {new Date(testimonial.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p
                  style={{
                    color: "#374151",
                    lineHeight: 1.5,
                    fontSize: windowWidth < 640 ? "0.875rem" : "1rem",
                  }}
                >
                  {testimonial.review_text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Review Submission Form */}
        <div
          style={{
            marginTop: "3rem",
            marginBottom: "3rem",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <h2
            style={{
              fontSize: windowWidth < 640 ? "1.25rem" : "1.5rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}
          >
            Share Your Experience
          </h2>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              padding: windowWidth < 640 ? "1rem" : "1.5rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {submitSuccess ? (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#d1fae5",
                  borderRadius: "0.375rem",
                  marginBottom: "1rem",
                }}
              >
                <p style={{ color: "#065f46", margin: 0 }}>
                  Thank you for your review! It has been submitted successfully.
                </p>
              </div>
            ) : null}

            {submitError ? (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#fee2e2",
                  borderRadius: "0.375rem",
                  marginBottom: "1rem",
                }}
              >
                <p style={{ color: "#b91c1c", margin: 0 }}>{submitError}</p>
              </div>
            ) : null}

            <form onSubmit={handleReviewSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: windowWidth < 768 ? "1fr" : "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label
                    htmlFor="name"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={reviewForm.name}
                    onChange={handleReviewInputChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: formErrors.name ? "1px solid #ef4444" : "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                    }}
                  />
                  {formErrors.name && (
                    <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={reviewForm.email}
                    onChange={handleReviewInputChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: formErrors.email ? "1px solid #ef4444" : "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                    }}
                  />
                  {formErrors.email && (
                    <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="company"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Company (Optional)
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={reviewForm.company}
                  onChange={handleReviewInputChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="rating"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Rating *
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: star <= reviewForm.rating ? "#FBBF24" : "#d1d5db",
                        fontSize: "1.5rem",
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {formErrors.rating && (
                  <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{formErrors.rating}</p>
                )}
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor="review_text"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Your Review *
                </label>
                <textarea
                  id="review_text"
                  name="review_text"
                  value={reviewForm.review_text}
                  onChange={handleReviewInputChange}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: formErrors.review_text ? "1px solid #ef4444" : "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    resize: "vertical",
                  }}
                ></textarea>
                {formErrors.review_text && (
                  <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {formErrors.review_text}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: "#3B82F6",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LandingPage
