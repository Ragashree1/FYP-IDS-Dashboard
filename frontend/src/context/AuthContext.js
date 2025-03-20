import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    console.log("Saved user from localStorage:", savedUser); // Debug log
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.token) {
        setUser(parsedUser);
      } else {
        localStorage.removeItem('user'); // Clear invalid user data
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log("Logging in user:", userData); // Debug log
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
      const interval = setInterval(verifyToken, 5 * 60 * 1000); // Check every 5 minutes
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
