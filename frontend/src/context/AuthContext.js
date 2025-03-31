import { createContext, useState, useContext, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // Install this package if not already installed

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    console.log("Saved token from localStorage:", savedToken); // Debug log
    
    // Special case for platform admin mock token
    if (savedToken === "mock-token-for-platform-admin") {
      const userData = {
        username: "test",
        userRole: "platform-admin",
        userComName: "secuboard",
        token: savedToken,
      };
      setUser(userData);
      setLoading(false);
      return;
    }
    
    if (savedToken) {
      try {
        const decodedToken = jwtDecode(savedToken); // Decode the token
        console.log("Decoded token:", decodedToken); // Debug log

        // Extract user details from the token
        const userData = {
          id: decodedToken.id,
          username: decodedToken.sub,
          userRole: decodedToken.role,
          userComName: decodedToken.company,
          userSuspend: decodedToken.suspend,
          token: savedToken,
        };

        setUser(userData); // Set the user state
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('token'); // Clear invalid token
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log("Logging in user:", userData); // Debug log
    
    // Ensure userRole is stored as a number if it's a numeric string
    if (userData.userRole && !isNaN(userData.userRole)) {
      userData.userRole = parseInt(userData.userRole, 10);
    }
    
    console.log("Processed user data for login:", userData); // Debug log after processing
    
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    console.log("Logging out user"); // Debug log
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Clear token on logout
  };

  // Verify token periodically
  useEffect(() => {
    if (user?.token) {
      // Skip verification for mock token
      if (user.token === "mock-token-for-platform-admin") {
        return;
      }
      
      console.log("Token being sent for validation:", user.token); // Debug log
      const verifyToken = async () => {
        try {
          const response = await fetch('http://127.0.0.1:8000/login/get_token', {
            headers: {
              'Authorization': `Bearer ${user.token}`,
            },
          });

          if (!response.ok) {
            console.log("Token validation failed, logging out."); // Debug log
            logout(); // Token is invalid or expired
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      };

      verifyToken();
      const interval = setInterval(verifyToken, 10 * 60 * 1000); // Check every 10 minutes
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while initializing
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);