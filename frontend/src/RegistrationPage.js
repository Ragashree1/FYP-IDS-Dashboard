﻿import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { validatePhoneNumber, validateEmail, validatePassword } from './utils/validation';

const RegistrationPage = () => {
  const navigate = useNavigate() // Add navigation hook

  // Add state for success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  // Add scoped styles to the component when it mounts
  useEffect(() => {
    // Create a unique ID for this component's styles
    const styleId = "registration-page-styles"

    // Only add styles if they don't already exist
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement("style")
      styleElement.id = styleId
      styleElement.innerHTML = `
        .registration-page-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f3f4f6;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .registration-page-wrapper .registration-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .registration-page-wrapper .logo-container {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .registration-page-wrapper .logo {
          height: 80px;
          width: auto;
          margin-bottom: 1rem;
        }

        .registration-page-wrapper h1 {
          text-align: center;
          color: #333;
          font-size: 1.5rem;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .registration-page-wrapper .registration-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .registration-page-wrapper .form-row {
          display: flex;
          gap: 1rem;
        }

        .registration-page-wrapper .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .registration-page-wrapper input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background-color: #f3f4f6;
          font-size: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .registration-page-wrapper input:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .registration-page-wrapper input::placeholder {
          color: #9ca3af;
        }

        .registration-page-wrapper .input-hint {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #6B7280;
        }

        .registration-page-wrapper .error-hint {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #ef4444;
        }

        .registration-page-wrapper .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .registration-page-wrapper .register-button {
          background-color: #10B981;
          color: white;
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .registration-page-wrapper .register-button:hover {
          background-color: #059669;
        }

        .registration-page-wrapper .register-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        /* Success Popup Styles */
        .success-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .success-popup {
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .success-popup-header {
          background-color: #8BC34A;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .success-popup-icon {
          width: 60px;
          height: 60px;
          background-color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .success-popup-icon svg {
          width: 30px;
          height: 30px;
          color: #8BC34A;
        }

        .success-popup-title {
          color: white;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 1px;
        }

        .success-popup-content {
          padding: 32px 24px;
        }

        .success-popup-message {
          color: #666;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .success-popup-button {
          background-color: #8BC34A;
          color: white;
          border: none;
          border-radius: 50px;
          padding: 12px 36px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .success-popup-button:hover {
          background-color: #7CB342;
        }

        @media (max-width: 640px) {
          .registration-page-wrapper .registration-container {
            margin: 1rem;
            padding: 1.5rem;
          }

          .registration-page-wrapper .form-row {
            flex-direction: column;
            gap: 1.5rem;
          }

          .registration-page-wrapper .logo {
            height: 60px;
          }
        }
      `
      document.head.appendChild(styleElement)
    }

    // Clean up function to remove styles when component unmounts
    return () => {
      const styleElement = document.getElementById(styleId)
      if (styleElement) {
        document.head.removeChild(styleElement)
      }
    }
  }, [])

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    userFirstName: "",
    userLastName: "",
    passwd: "",
    userComName: "",
    userEmail: "",
    userPhoneNum: "",
    userRole: 1,  // Set default role
    userSuspend: false  // Set default suspend status
  })

  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({
    userEmail: false,
    userPhoneNum: false,
    passwd: false,
  })

  useEffect(() => {
    document.title = "Registration" // Set page title
  }, [])

  // Validate a specific field
  const validateField = (name, value) => {
    switch (name) {
      case "userEmail":
        return value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
          ? ""
          : "Please enter a valid email format (e.g., name@example.com)."
      case "userPhoneNum":
        return value.match(/^\+[1-9]\d{0,2}\d{6,14}$/)
          ? ""
          : "Phone number must start with + followed by a country code (1-3 digits) and 6-14 digits."
      case "passwd":
        if (value.length < 6) {
          return "Password must be at least 6 characters long."
        }
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value)
        const hasNumber = /\d/.test(value)
        const hasCapital = /[A-Z]/.test(value)
        if (!hasSymbol || !hasNumber || !hasCapital) {
          return "Password must contain symbols, numbers and capital letters."
        }
        return ""
      case "username":
        return value.trim() !== ""
          ? ""
          : "username is required."
      case "userFirstName":
        return value.trim() !== ""
          ? ""
          : "First Name is required."
      case "userLastName":
        return value.trim() !== ""
          ? ""
          : "Last Name is required."
      case "userComName":
        return value.trim() !== ""
          ? ""
          : "Company Name is required."
      default:
        return ""
    }
  }

  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched({
      ...touched,
      [name]: true,
    })

    const errorMessage = validateField(name, value)
    if (errorMessage) {
      setErrors({
        ...errors,
        [name]: errorMessage,
      })
    } else {
      const newErrors = { ...errors }
      delete newErrors[name]
      setErrors(newErrors)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const newTouched = {}

    // Mark all fields as touched
    Object.keys(formData).forEach((key) => {
      newTouched[key] = true
    })
    setTouched(newTouched)

    // Validate each field
    if (!formData.userEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.userEmail = "Please enter a valid email format (e.g., name@example.com)."
    }
    if (!formData.userPhoneNum.match(/^\+[1-9]\d{0,2}\d{6,14}$/)) {
      newErrors.userPhoneNum = "Phone number must start with + followed by a country code (1-3 digits) and 6-14 digits.";
    }

    if (formData.passwd.length < 6) {
      newErrors.passwd = "Password must be at least 6 characters long."
    } else {
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(formData.passwd)
      const hasNumber = /\d/.test(formData.passwd)
      const hasCapital = /[A-Z]/.test(formData.passwd)

      if (!hasSymbol || !hasNumber || !hasCapital) {
        newErrors.passwd = "Password must contain symbols, numbers and capital letters."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "userComName" ? value.toLowerCase() : value,
    })

    // If the field has been touched, validate it on change
    if (touched[name]) {
      const errorMessage = validateField(name, value)
      if (errorMessage) {
        setErrors({
          ...errors,
          [name]: errorMessage,
        })
      } else {
        const newErrors = { ...errors }
        delete newErrors[name]
        setErrors(newErrors)
      }
    }
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only + and digits
    if (value === '' || value === '+' || /^\+\d*$/.test(value)) {
      handleChange(e);
    }
  };

  // Handle continue button click in success popup
  const handleContinue = () => {
    setShowSuccessPopup(false)
    // Store registration data in sessionStorage for use in payment page
    sessionStorage.setItem(
      "registrationData",
      JSON.stringify({
        firstName: formData.userFirstName,
        lastName: formData.userLastName,
      }),
    )
    // Navigate to login page
    navigate("/login")
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    console.log(formData)

    try {
      const response = await fetch("http://127.0.0.1:8000/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.detail || "Registration failed"}`);
        return;
      }

      const data = await response.json();
      setMessage("User registered successfully!");
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Network error. Please try again.");
    }
  }

  // Success Popup Component
  const SuccessPopup = () => (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <div className="success-popup-header">
          <div className="success-popup-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="success-popup-title">SUCCESS</div>
        </div>
        <div className="success-popup-content">
          <div className="success-popup-message">Congratulations, your account has been successfully created.</div>
          <button className="success-popup-button" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="registration-page-wrapper">
      <div className="registration-container">
        <div className="logo-container">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AwHpatwUXOxUSYkvlo8tVkBUyL8vzm.png"
            alt="SecuBoard Logo"
            className="logo"
          />
        </div>

        <h1>Registration</h1>

        <form id="registrationForm" className="registration-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="userFirstName"
                id="userFirstName"
                placeholder="First Name"
                value={formData.userFirstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="userLastName"
                id="userLastName"
                placeholder="Last Name"
                value={formData.userLastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="userComName"
                id="userComName"
                placeholder="Company Name"
                value={formData.userComName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="username"
                id="username"
                placeholder="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <input
              type="password"
              name="passwd"
              id="passwd"
              placeholder="Password"
              value={formData.passwd}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <small className="input-hint">Note: Password must contain symbols, numbers and capital letters.</small>
            {errors.passwd && touched.passwd && <small className="error-hint">{errors.passwd}</small>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="userEmail"
              id="userEmail"
              placeholder="Email"
              value={formData.userEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {errors.userEmail && touched.userEmail && <small className="error-hint">{errors.userEmail}</small>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="userPhoneNum"
              id="userPhoneNum"
              placeholder="Phone Number (e.g., +6591234567)"
              value={formData.userPhoneNum}
              onChange={handlePhoneChange} // Use the new handler
              onBlur={handleBlur}
              pattern="^\+[1-9]\d{0,2}\d{6,14}$"
              required
            />
            <small className="input-hint">
              Format: +[country code][number] (e.g., +65 for Singapore)
            </small>
            {errors.userPhoneNum && touched.userPhoneNum && (
              <small className="error-hint">{errors.userPhoneNum}</small>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="register-button">
              Register
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && <SuccessPopup />}
    </div>
  )
}

export default RegistrationPage

