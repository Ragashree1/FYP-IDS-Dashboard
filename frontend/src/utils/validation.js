export const validatePhoneNumber = (phone) => {
  // New regex pattern following E.164 format
  const phoneRegex = /^\+[1-9]\d{0,2}\d{6,14}$/;
  
  if (!phone.startsWith('+')) {
    return "Phone number must start with +";
  }
  
  if (!phoneRegex.test(phone)) {
    return "Invalid format. Must be: +[country code][number]";
  }

  const digitsOnly = phone.slice(1); // Remove the + prefix
  
  if (digitsOnly.length < 7) {
    return "Phone number must have at least 7 digits after country code";
  }
  
  if (digitsOnly.length > 15) {
    return "Phone number cannot exceed 15 digits";
  }

  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
};

export const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return "Password must contain at least one special character (!@#$%^&*)";
  }
  return null;
};
