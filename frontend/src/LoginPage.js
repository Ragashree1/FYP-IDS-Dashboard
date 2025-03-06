import React, { useState } from "react";
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
  selectInput: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "white",
    color: "black",
    appearance: "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.5rem center",
    backgroundSize: "12px",
    backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"black\" d=\"M7 10l5 5 5-5H7z\"/></svg>')",
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
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === "cybersecurity-analyst" && loginId === "test" && password === "test") {
      navigate("/dashboard");
    } else if (role === "network-admin" && loginId === "test" && password === "test") {
      navigate("/system-config");
	  } else if (role === "system-admin" && loginId === "test" && password === "test") {
      navigate("/roles-permission");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginForm}>
        <div style={styles.logoContainer}>
          <img src="/images/secuboard.png" alt="SecuBoard Logo" style={styles.logo} />
          <h1 style={styles.title}>SecuBoard</h1>
        </div>

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.selectInput}
            >
              <option value="" disabled>Select role</option>
              <option value="system-admin">System Admin</option>
              <option value="network-admin">Network Admin</option>
              <option value="cybersecurity-analyst">Cybersecurity Analyst</option>
              <option value="it-manager">IT Manager</option>
              <option value="data-analyst">Data Analyst</option>
            </select>
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
