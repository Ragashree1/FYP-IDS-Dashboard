import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const navigate = useNavigate(); // Add navigation hook
  
  // Add scoped styles to the component when it mounts
  useEffect(() => {
    // Create a unique ID for this component's styles
    const styleId = 'payment-page-styles';
    
    // Only add styles if they don't already exist
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.innerHTML = `
        .payment-page-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f3f4f6;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .payment-page-wrapper .payment-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .payment-page-wrapper .logo-container {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .payment-page-wrapper .logo {
          height: 80px;
          width: auto;
          margin-bottom: 1rem;
        }

        .payment-page-wrapper h1 {
          text-align: center;
          color: #333;
          font-size: 1.5rem;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .payment-page-wrapper .payment-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .payment-page-wrapper .form-row {
          display: flex;
          gap: 1rem;
        }

        .payment-page-wrapper .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .payment-page-wrapper .form-group.small {
          flex: 0 0 100px;
        }

        .payment-page-wrapper .form-group label {
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .payment-page-wrapper .subscription-select {
          margin-bottom: 1rem;
        }

        .payment-page-wrapper select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background-color: #f3f4f6;
          font-size: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
        }

        .payment-page-wrapper select:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .payment-page-wrapper .total-amount {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .payment-page-wrapper .total-amount label {
          font-weight: 500;
        }

        .payment-page-wrapper .dollar-sign {
          font-size: 1rem;
          color: #374151;
        }

        .payment-page-wrapper input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background-color: #f3f4f6;
          font-size: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .payment-page-wrapper input:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .payment-page-wrapper input::placeholder {
          color: #9ca3af;
        }

        .payment-page-wrapper .payment-methods {
          display: flex;
          gap: 1rem;
          margin: 1rem 0;
          align-items: center;
        }

        .payment-page-wrapper .payment-method {
          height: 24px;
          width: auto;
          opacity: 0.7;
        }

        .payment-page-wrapper .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .payment-page-wrapper .submit-button {
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

        .payment-page-wrapper .submit-button:hover {
          background-color: #059669;
        }

        .payment-page-wrapper .submit-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        @media (max-width: 640px) {
          .payment-page-wrapper .payment-container {
            margin: 1rem;
            padding: 1.5rem;
          }

          .payment-page-wrapper .form-row {
            flex-direction: column;
            gap: 1.5rem;
          }

          .payment-page-wrapper .form-group.small {
            flex: 1;
          }

          .payment-page-wrapper .logo {
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
      subscription: '',
      total: '',
      creditFirstName: '',
      creditLastName: '',
      creditNum: '',
      creditCVV: '',
      creditDate: ''
    });
  
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    
  useEffect(() => {
    document.title = "Payment Information";

    // Fetch the logged-in user's ID from backend
    const fetchUserId = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/user/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setFormData((prevData) => ({ ...prevData, userid: data.id }));
        } else {
          console.error("Failed to fetch user ID");
        }
      } catch (error) {
        console.error("Error fetching user ID", error);
      }
    };

    fetchUserId();
  }, []);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.creditNum.match(/^\d{16}$/)) {
      newErrors.creditNum = "Credit card number must be 16 digits.";
    }
    if (!formData.creditDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.creditDate = "Expiration date format must be MM/YY.";
    }
    if (!formData.creditCVV.match(/^\d{3,4}$/)) {
      newErrors.creditCVV = "CVV must be 3 or 4 digits.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle subscription change
  const handleSubscriptionChange = (e) => {
    const { value } = e.target;
    let total = '';
    
    switch(value) {
      case 'monthly':
        total = '50.00';
        break;
      case 'annual':
        total = '500.00';
        break;
      default:
        total = '';
    }
    
    setFormData({
      ...formData,
      subscription: value,
      total: total
    });
  };

  // Format card number with spaces
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length > 0) {
      value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
    }
    
    setFormData({
      ...formData,
      creditNum: value
    });
  };

  // Format expiry date
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    setFormData({
      ...formData,
      creditDate: value
    });
  };

  // Allow only numbers in CVV
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    
    setFormData({
      ...formData,
      creditCVV: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/payment/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("Payment details saved successfully!");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.detail || "Payment failed"}`);
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="payment-page-wrapper">
      <div className="payment-container">
        <div className="logo-container">
          <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AwHpatwUXOxUSYkvlo8tVkBUyL8vzm.png" 
            alt="SecuBoard Logo" 
            className="logo" 
          />
        </div>

        <h1>Payment</h1>

        <form id="paymentForm" className="payment-form" onSubmit={handleSubmit}>
          <div className="form-group subscription-select">
            <label htmlFor="subscription">Subscription Type</label>
            <select 
              id="subscription" 
              name="subscription" 
              value={formData.subscription}
              onChange={handleSubscriptionChange}
              required
            >
              <option value="">Select a subscription plan</option>
              <option value="monthly">Monthly Subscription ($50)</option>
              <option value="annual">Annual Subscription ($500)</option>
            </select>
          </div>

          <div className="total-amount">
            <label htmlFor="total">Total</label>
            <span className="dollar-sign">$</span>
            <input 
              type="text"
              name="total"
              id="total"
              value={formData.total}
              readOnly
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <input 
                type="text"
                name="creditFirstName"
                id="creditFirstName"
                placeholder="First Name"
                value={formData.creditFirstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input 
                type="text"
                name="creditLastName"
                id="creditLastName"
                placeholder="Last Name"
                value={formData.creditLastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <input 
              type="text"
              name="creditNum"
              id="creditNum"
              placeholder="Card Number"
              maxLength="19"
              value={formData.creditNum}
              onChange={handleCardNumberChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group small">
              <input 
                type="text"
                name="creditCVV"
                id="creditCVV"
                placeholder="CVV"
                maxLength="4"
                value={formData.creditCVV}
                onChange={handleCvvChange}
                required
              />
            </div>
            <div className="form-group small">
              <input 
                type="text"
                name="creditDate"
                id="creditDate"
                placeholder="MM/YY"
                maxLength="5"
                value={formData.creditDate}
                onChange={handleExpiryChange}
                required
              />
            </div>
          </div>

          <div className="payment-methods">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="payment-method" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="payment-method" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="payment-method" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="payment-method" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg" alt="Bitcoin" className="payment-method" />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Submit Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;