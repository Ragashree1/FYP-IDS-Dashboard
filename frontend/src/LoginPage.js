import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
};

export default function LoginPage() {
  const [userComName, setCompany] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // If no token, do nothing

      try {
        const response = await fetch("http://127.0.0.1:8000/login/get_token", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          navigate("/dashboard"); // Only navigate if the token is valid
        } else {
          localStorage.removeItem("token"); // Clear invalid token
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        localStorage.removeItem("token"); // Clear token on error
      }
    };

    checkToken();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    // Check if userComName is empty
    if (!userComName) {
      setError("Company/Organisation name is required.");
      return;
    }

    try {

      const loginResponse = await fetch("http://127.0.0.1:8000/login/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Update content type to application/json
        },
        body: JSON.stringify({
          userComName: userComName,
          userid: loginId, // Adjust the field name to match backend expectations
          passwd: password,
        }),
      });

      const loginData = await loginResponse.json();
      console.log("Response data:", loginData); // Log the entire response data
      if (!loginResponse.ok) throw new Error(loginData.detail || "Login failed");

      localStorage.setItem("token", loginData.access_token);
        // Check if userRole is defined
      if (loginData.userRole === undefined) {
        throw new Error("User role is not defined in the response");
      }

      const userRole = loginData.userRole;
      console.log("Userrole:", userRole); // Logging userRole
      if (userRole === 1) {
        navigate("/roles-permission");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message);
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginForm}>
        <div style={styles.logoContainer}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AwHpatwUXOxUSYkvlo8tVkBUyL8vzm.png"
              alt="SecuBoard Logo"
              className="logo"
              style={{ width: "70px", height: "70px" }} // Adjust width as needed
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
              onChange={(e) => setCompany(e.target.value.toLowerCase())}
              placeholder="Enter your company/organisation's name"
              style={styles.input}
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
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.loginButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
