import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationPage = () => {
  const navigate = useNavigate(); // Add navigation hook
  
  // Add scoped styles to the component when it mounts
  useEffect(() => {
    // Create a unique ID for this component's styles
    const styleId = 'registration-page-styles';
    
    // Only add styles if they don't already exist
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
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

        .registration-page-wrapper .password-hint {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #ef4444;
        }

        .registration-page-wrapper .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .registration-page-wrapper .next-button {
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

        .registration-page-wrapper .next-button:hover {
          background-color: #059669;
        }

        .registration-page-wrapper .next-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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
      `;
      document.head.appendChild(styleElement);
    }
    
    // Clean up function to remove styles when component unmounts
    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    loginId: '',
    password: '',
    email: '',
    phoneNumber: ''
  });

  // Validation state
  const [passwordError, setPasswordError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Validate password
  const validatePassword = (password) => {
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasCapital = /[A-Z]/.test(password);

    if (!hasSymbol || !hasNumber || !hasCapital) {
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate password
    if (!validatePassword(formData.password)) {
      setPasswordError('Password must contain symbols, numbers, and capital letters.');
      return;
    }
    
    // Clear any previous errors
    setPasswordError('');
    
    // Log form data (in a real app, you would send this to your server)
    console.log('Form submitted:', formData);
    
    // Set form as submitted
    setFormSubmitted(true);
    
    // Store registration data in sessionStorage to access it in the payment page if needed
    sessionStorage.setItem('registrationData', JSON.stringify(formData));
    
    // Navigate to payment page
    navigate('/payment');
  };

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
                name="firstName"
                id="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="companyName"
                id="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="loginId"
                id="loginId"
                placeholder="Login ID"
                value={formData.loginId}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <small className="password-hint">
              Note: Password must contain symbols, numbers and capital letters.
            </small>
            {passwordError && (
              <small className="password-hint">{passwordError}</small>
            )}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="next-button">
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;