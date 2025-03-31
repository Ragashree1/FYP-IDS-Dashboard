import React, { useState } from 'react';
import { validatePhoneNumber, validateEmail, validatePassword } from '../utils/validation';

const AccountForm = ({ onSubmit, initialData = {} }) => {
  console.log(initialData);
  const [formData, setFormData] = useState({
    userPhoneNum: initialData.userPhoneNum || '',
    userEmail: initialData.userEmail || '',
    passwd: initialData.passwd || '',
    // ... other fields
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'userPhoneNum':
        return validatePhoneNumber(value);
      case 'userEmail':
        return validateEmail(value);
      case 'passwd':
        return validatePassword(value);
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="userPhoneNum">Phone Number</label>
        <input
          id="userPhoneNum"
          name="userPhoneNum"
          type="tel"
          value={formData.userPhoneNum}
          onChange={handleChange}
          placeholder="+1234567890"
        />
        {errors.userPhoneNum && <span className="error">{errors.userPhoneNum}</span>}
      </div>

      {/* Similar input fields for email and password */}
      
      <button type="submit">Submit</button>
    </form>
  );
};

export default AccountForm;
