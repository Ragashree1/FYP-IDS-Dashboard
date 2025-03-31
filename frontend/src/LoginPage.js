"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext" // Import AuthContext
import { jwtDecode } from "jwt-decode" // Import jwt-decode

const styles = {
  loginContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#2A2A2A",
    padding: "1rem",
  },
  loginForm: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#333",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "2rem",
  },
  logo: {
    width: "40px",
    height: "40px",
    marginRight: "0.5rem",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    color: "white",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    color: "white",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "white",
    color: "black",
  },
  error: {
    color: "#ff4d4d",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
  },
  loginButton: {
    display: "block",
    width: "100%",
    maxWidth: "8rem",
    margin: "1.5rem auto 0",
    padding: "0.5rem 1rem",
    backgroundColor: "#4a4a4a",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
}

export default function LoginPage() {
  const [userComName, setCompany] = useState("")
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth() // Use the login function from AuthContext

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!userComName) {
      setError("Company/Organisation name is required.")
      setIsLoading(false)
      return
    }

    // Check for the special login credentials for organization-request page
    if (userComName.toLowerCase() === "secuboard" && loginId === "test" && password === "Secure@123") {
      try {
        // Create a mock token for platform-admin role
        const userData = {
          token: "mock-token-for-platform-admin",
          userRole: "platform-admin", // Set role as platform-admin
          username: loginId,
          userComName: userComName,
        }

        // Store the mock token in localStorage for consistency
        localStorage.setItem("token", userData.token)

        // Update AuthContext with the user data
        login(userData)

        // Navigate to organization-request page
        navigate("/organization-requests")
      } catch (err) {
        console.error("Login failed:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
      return
    }

    try {
      // First, check if the account exists and its status
      const checkStatusResponse = await fetch("http://127.0.0.1:8000/user-management/check-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userComName: userComName,
          username: loginId,
        }),
      })

      if (checkStatusResponse.ok) {
        const statusData = await checkStatusResponse.json()

        // If account doesn't exist, proceed to login (which will fail with incorrect credentials)
        if (!statusData.exists) {
          // Continue to login attempt
        }
        // If account is suspended or pending approval, prevent login with specific messages
        else if (statusData.userSuspend === true) {
          if (statusData.userRejected === true) {
            setError("Your account request has been rejected. Please contact your administrator.")
            setIsLoading(false)
            return
          } else {
            setError("Account is pending approval. Please wait for administrator approval.")
            setIsLoading(false)
            return
          }
        }
      }

      // If account status check passes, proceed with login
      const loginResponse = await fetch("http://127.0.0.1:8000/login/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userComName: userComName,
          username: loginId,
          passwd: password,
        }),
      })

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json()
        throw new Error(errorData.detail || "Incorrect credentials. Please check your login details and try again.")
      }

      const loginData = await loginResponse.json()
      console.log("Response data from login:", loginData) // Debug log

      // Store the token in localStorage
      const token = loginData.access_token
      localStorage.setItem("token", token)

      try {
        // Decode the JWT token to extract user information
        const decodedToken = jwtDecode(token)
        console.log("Decoded token:", decodedToken) // Debug log

        // Extract user data from the decoded token
        // The structure depends on how your backend structures the JWT payload
        const userData = {
          token: token,
          // Check if user data is in the 'user' property or directly in the token
          userRole: decodedToken.user?.userRole || decodedToken.userRole,
          username: decodedToken.user?.username || decodedToken.sub,
          userComName: decodedToken.user?.userComName || decodedToken.company,
          // Add any other needed user properties
          id: decodedToken.user?.id || decodedToken.id,
          userFirstName: decodedToken.user?.userFirstName,
          userLastName: decodedToken.user?.userLastName,
          userEmail: decodedToken.user?.userEmail,
          userPhoneNum: decodedToken.user?.userPhoneNum,
          userSuspend: decodedToken.user?.userSuspend || false,
        }

        console.log("Extracted user data:", userData) // Debug log

        // Ensure userRole is a number for comparison
        const userRoleId = parseInt(userData.userRole, 10)
        console.log("User role ID (parsed):", userRoleId, "Type:", typeof userRoleId) // Debug log
        
        // Update userData with the parsed role ID
        userData.userRole = userRoleId

        // Update AuthContext with the user data
        login(userData)

        // Navigate based on user role
        if (userRoleId === 2) {
          console.log("Redirecting to dashboard (Network Admin)") // Debug log
          navigate("/dashboard")
        } else {
          console.log("Redirecting to user management (Organization Admin or other)") // Debug log
          navigate("/user-management")
        }
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError)
        setError("Error processing login response. Please try again.")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Login failed:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginForm}>
        <div style={styles.logoContainer}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AwHpatwUXOxUSYkvlo8tVkBUyL8vzm.png"
              alt="SecuBoard Logo"
              className="logo"
              style={{ width: "70px", height: "70px" }}
            />
            <h1 style={styles.title}>SecuBoard</h1>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label htmlFor="userComName" style={styles.label}>
              Company/Organisation
            </label>
            <input
              id="userComName"
              type="text"
              value={userComName}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter your company/organisation's name"
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="loginId" style={styles.label}>
              Login ID
            </label>
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="Enter your login ID"
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={{
              ...styles.loginButton,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}