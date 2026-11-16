
export const validateRequired = (value) => {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return 'This field is required';
  }
  return null;
};

export const validateRequiredNumeric = (value) => {
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return 'This field is required';
  }
  return null;
};
export const validateLength = (value, minLength, maxLength) => {
  if (value.length < minLength) {
    return `Minimum length is ${minLength} characters`;
  }
  if (value.length > maxLength) {
    return `Maximum length is ${maxLength} characters`;
  }
  return null;
};
export const validateEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return ' Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password, confirmPassword) => {
  let passwordError = "";
  let confirmPasswordError = "";
  let passwordMatchError = "";

  if (!password) passwordError = "Password is required.";
  if (!confirmPassword) confirmPasswordError = "Confirm password is required.";
  if (password && confirmPassword && password !== confirmPassword) {
    passwordMatchError = "Passwords do not match.";
  }

  return { passwordError, confirmPasswordError, passwordMatchError };
};

export const validateUSCellNumber = (value) => {
  const usCellNumberRegex = /^\+1 (\d{3}-\d{3}-\d{4}|\(\d{3}\)-\d{3}-\d{4})$/;
  if (!usCellNumberRegex.test(value)) {
    return 'Invalid U.S. cell number. Accepted formats: +1 123-456-7890 or +1 (123)-456-7890';
  }
  return null;
};
export const validatePasswordStrength = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPasswordRegex.test(password)) {
    return "Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character.";
  }
  return null;
};
export const validateZipCode = (zipCode) => {
  const zipRegex = /^\d{5}$/;
  if (!zipCode) {
    return "ZIP Code is required.";
  }
  if (!zipRegex.test(zipCode)) {
    return "ZIP code must be 5 digits long.";
  }
  return null;
};

export const usAutomaticCalidation = (value) => {
  let numericValue = value?.replace(/[^\d+]/g, "");

  if (numericValue === "" || numericValue === "+") {
    return { formattedValue: "", error: "", isValid: true };
  }

  if (!numericValue?.startsWith("+1")) {
    numericValue = `+1${numericValue?.replace(/^\+/, "")}`;
  }

  const plainNumber = numericValue?.replace(/^\+1/, "")?.replace(/\D/g, "");
  let formattedValue = "+1";

  if (plainNumber.length > 0 && plainNumber.length <= 3) {
    formattedValue += ` (${plainNumber.slice(0, 3)}`;
  } else if (plainNumber.length > 3 && plainNumber.length <= 6) {
    formattedValue += ` (${plainNumber.slice(0, 3)}) ${plainNumber.slice(3)}`;
  } else if (plainNumber.length > 6) {
    formattedValue += ` (${plainNumber.slice(0, 3)}) ${plainNumber.slice(3, 6)}-${plainNumber.slice(6, 10)}`;
  }

  const usPhonePatternWithCountryCode = /^\+1 \(\d{3}\) \d{3}-\d{4}$/;
  const isValid = usPhonePatternWithCountryCode.test(formattedValue);
  let error = "";

  if (!isValid && formattedValue.length > 0) {
    error = "Invalid US phone number (e.g., +1 (123) 456-7890)";
  }

  return { formattedValue, error, isValid };
};

export const validateArrayNotEmpty = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    return 'This field is required';
  }
  return null;
};

export const validateSelectOption = (value, placeholder = "") => {
  if (!value || value === placeholder) {
    return "Please select a valid option.";
  }
  return null;
};