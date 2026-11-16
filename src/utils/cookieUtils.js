import Cookies from "js-cookie";

// Simple encryption/decryption using base64 (for basic obfuscation)
// In production, consider using a more robust encryption library
const encryptData = (data) => {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error("Error encrypting data:", error);
    return null;
  }
};

const decryptData = (encryptedData) => {
  try {
    return JSON.parse(atob(encryptedData));
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
};

// Cookie names
const REMEMBER_ME_COOKIE = "revive_remember_me";
const REMEMBER_EMAIL_COOKIE = "email";
const REMEMBER_CREDENTIALS_COOKIE = "revive_remember_credentials";

// Set remember me data
export const setRememberMeData = (userData, expirationDays = 7) => {
  const dataToStore = {
    email: userData.email,
    userType: userData.userType,
    token: userData.token,
    id: userData.id,
    userData: userData.userData,
    fcmToken: userData.fcmToken,
    timestamp: Date.now()
  };

  const encryptedData = encryptData(dataToStore);
  if (encryptedData) {
    // Auto-detect environment and set appropriate cookie options
    const isProduction = window.location.protocol === 'https:' && 
                        window.location.hostname !== 'localhost';
    
    const cookieOptions = {
      expires: expirationDays,
      secure: isProduction, // true for HTTPS production, false for local HTTP
      sameSite: isProduction ? 'strict' : 'lax' // strict for production, lax for local
    };

    Cookies.set(REMEMBER_ME_COOKIE, encryptedData, cookieOptions);
    
    // Also set email separately for login form pre-fill
    Cookies.set(REMEMBER_EMAIL_COOKIE, userData.email, cookieOptions);
  }
};

// Get remember me data
export const getRememberMeData = () => {
  const encryptedData = Cookies.get(REMEMBER_ME_COOKIE);
  if (!encryptedData) {
    return null;
  }

  const decryptedData = decryptData(encryptedData);
  if (!decryptedData) {
    // If decryption fails, remove the corrupted cookie
    clearRememberMeData();
    return null;
  }

  // Check if data is not too old (optional additional security)
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  if (Date.now() - decryptedData.timestamp > maxAge) {
    clearRememberMeData();
    return null;
  }

  return decryptedData;
};

// Get remembered email for form pre-fill
export const getRememberedEmail = () => {
  return Cookies.get(REMEMBER_EMAIL_COOKIE) || "";
};

// Set remember me credentials (email and password for form pre-fill)
export const setRememberMeCredentials = (email, password, expirationDays = 7) => {
  const credentialsToStore = {
    email: email,
    password: password,
    timestamp: Date.now()
  };

  const encryptedCredentials = encryptData(credentialsToStore);
  if (encryptedCredentials) {
    // Auto-detect environment and set appropriate cookie options
    const isProduction = window.location.protocol === 'https:' && 
                        window.location.hostname !== 'localhost';
    
    const cookieOptions = {
      expires: expirationDays,
      secure: isProduction, // true for HTTPS production, false for local HTTP
      sameSite: isProduction ? 'strict' : 'lax' // strict for production, lax for local
    };

    Cookies.set(REMEMBER_CREDENTIALS_COOKIE, encryptedCredentials, cookieOptions);
    
    // Also set email separately for backward compatibility
    Cookies.set(REMEMBER_EMAIL_COOKIE, email, cookieOptions);
  }
};

// Get remembered credentials (email and password for form pre-fill)
export const getRememberedCredentials = () => {
  const encryptedCredentials = Cookies.get(REMEMBER_CREDENTIALS_COOKIE);
  if (!encryptedCredentials) {
    return { email: "", password: "" };
  }

  const decryptedCredentials = decryptData(encryptedCredentials);
  if (!decryptedCredentials) {
    // If decryption fails, remove the corrupted cookie
    clearRememberMeCredentials();
    return { email: "", password: "" };
  }

  // Check if credentials are not too old (optional additional security)
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  if (Date.now() - decryptedCredentials.timestamp > maxAge) {
    clearRememberMeCredentials();
    return { email: "", password: "" };
  }

  return {
    email: decryptedCredentials.email || "",
    password: decryptedCredentials.password || ""
  };
};

// Clear remember me credentials
export const clearRememberMeCredentials = () => {
  Cookies.remove(REMEMBER_CREDENTIALS_COOKIE);
};

// Clear remember me data
export const clearRememberMeData = () => {
  Cookies.remove(REMEMBER_ME_COOKIE);
  Cookies.remove(REMEMBER_EMAIL_COOKIE);
  clearRememberMeCredentials(); // Also clear credentials
};

// Check if user has remember me data
export const hasRememberMeData = () => {
  return !!Cookies.get(REMEMBER_ME_COOKIE);
};

// Update remember me data (for token refresh scenarios)
export const updateRememberMeToken = (newToken, expirationDays = 7) => {
  const existingData = getRememberMeData();
  if (existingData) {
    const updatedData = {
      ...existingData,
      token: newToken,
      timestamp: Date.now()
    };
    
    const encryptedData = encryptData(updatedData);
    if (encryptedData) {
      // Auto-detect environment and set appropriate cookie options
      const isProduction = window.location.protocol === 'https:' && 
                          window.location.hostname !== 'localhost';
      
      const cookieOptions = {
        expires: expirationDays,
        secure: isProduction, // true for HTTPS production, false for local HTTP
        sameSite: isProduction ? 'strict' : 'lax' // strict for production, lax for local
      };
      
      Cookies.set(REMEMBER_ME_COOKIE, encryptedData, cookieOptions);
    }
  }
};
