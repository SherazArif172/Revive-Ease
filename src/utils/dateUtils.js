import { format } from "date-fns";

/**
 * Formats a UTC date (from backend) in Eastern Time (EST/EDT) timezone for display
 * All dates from backend are in UTC, this function converts them to EST for display
 * @param {Date|string} dateValue - UTC date to format (from backend)
 * @param {string} formatPattern - date-fns format pattern
 * @returns {string} Formatted date string in Eastern Time (EST/EDT)
 */
export const formatInUTC = (dateValue, formatPattern) => {
  if (!dateValue) return "-";
  
  try {
    let date;
    
    if (typeof dateValue === 'string') {
      let dateStr = dateValue.trim();
      
      // Check if it's already in MM/dd/yyyy or MM-dd-yyyy format (already formatted)
      const alreadyFormattedPattern = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
      const match = dateStr.match(alreadyFormattedPattern);
      
      if (match && !dateStr.includes('T') && !dateStr.includes('Z') && !dateStr.includes('+') && dateStr.length <= 10) {
        // It's already formatted as MM/dd/yyyy or MM-dd-yyyy, return as-is
        return dateStr;
      }
      
      // Date-only YYYY-MM-DD (e.g. session_date from backend): treat as calendar date, no timezone conversion.
      // Parsing as UTC midnight would shift the date back one day when converting to Eastern.
      const dateOnlyMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateOnlyMatch && !dateStr.includes('T') && !dateStr.includes('Z')) {
        const [, y, m, d] = dateOnlyMatch;
        const year = parseInt(y, 10);
        const month = parseInt(m, 10) - 1;
        const day = parseInt(d, 10);
        if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
          const calDate = new Date(year, month, day);
          if (!isNaN(calDate.getTime())) {
            return format(calDate, formatPattern);
          }
        }
      }
      
      // Otherwise, treat it as a UTC date string that needs parsing
      if (dateStr.includes(' ') && !dateStr.includes('T')) {
        dateStr = dateStr.replace(' ', 'T');
      }
      // All backend dates are UTC - if no timezone info and it looks like an ISO date, assume it's UTC
      if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.match(/-\d{2}:\d{2}$/) && dateStr.includes('T')) {
        dateStr += 'Z';
      }
      date = new Date(dateStr);
    } else if (dateValue instanceof Date) {
      date = new Date(dateValue);
    } else {
      return "-";
    }
    
    if (isNaN(date.getTime())) {
      return "-";
    }
    
    // Convert UTC date to Eastern Time (EST/EDT) using Intl.DateTimeFormat
    // This automatically handles EST (UTC-5) and EDT (UTC-4) based on daylight saving time
    const easternFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = easternFormatter.formatToParts(date);
    const easternParts = {};
    parts.forEach(part => {
      easternParts[part.type] = part.value;
    });
    
    // Check if the format pattern includes time components
    const hasTimeComponent = formatPattern && (formatPattern.includes('h') || formatPattern.includes('H') || formatPattern.includes('m') || formatPattern.includes('s') || formatPattern.includes('a'));
    
    if (hasTimeComponent) {
      // For date-time formatting, create a date with Eastern time components
      const easternDateObj = new Date(
        parseInt(easternParts.year),
        parseInt(easternParts.month) - 1,
        parseInt(easternParts.day),
        parseInt(easternParts.hour),
        parseInt(easternParts.minute),
        parseInt(easternParts.second)
      );
      return format(easternDateObj, formatPattern);
    } else {
      // For date-only formatting, convert UTC to Eastern Time (EST/EDT)
      // Get the Eastern Time date components
      const easternYear = parseInt(easternParts.year);
      const easternMonth = parseInt(easternParts.month) - 1; // month is 0-indexed
      const easternDay = parseInt(easternParts.day);
      
      // Create a date object with Eastern time components for formatting
      const easternDateObj = new Date(easternYear, easternMonth, easternDay, 12, 0, 0);
      return format(easternDateObj, formatPattern);
    }
  } catch (error) {
    console.warn('Error formatting UTC date in Eastern Time:', error, dateValue);
    return "-";
  }
};


/**
 * Gets the date format for Eastern Time (EST/EDT) timezone
 * @returns {string} Date format string ('MM/dd/yyyy')
 */
export const getDateFormat = () => {
  return 'MM/dd/yyyy';
};

/**
 * Safely formats a UTC date (from backend) in Eastern Time (EST/EDT) timezone
 * Handles iOS Safari date parsing issues
 * All dates from backend are in UTC, this function converts them to EST for display
 * @param {string|Date|null|undefined} dateValue - The UTC date to format (from backend)
 * @param {string} formatPattern - Optional format pattern (defaults to US format)
 * @returns {string} Formatted date string or "-" if invalid
 */
export const formatDate = (dateValue, formatPattern = null) => {
  if (!dateValue) return "-";
  
  try {
    // Check if it's already formatted (MM/dd/yyyy or MM-dd-yyyy)
    if (typeof dateValue === 'string') {
      const dateStr = dateValue.trim();
      const alreadyFormattedPattern = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
      const match = dateStr.match(alreadyFormattedPattern);
      
      if (match && !dateStr.includes('T') && !dateStr.includes('Z') && !dateStr.includes('+') && dateStr.length <= 10) {
        // It's already formatted, return as-is
        return dateStr;
      }
    }
    
    // Otherwise, format it using formatInUTC (assumes UTC input from backend)
    const formatStr = formatPattern || getDateFormat();
    return formatInUTC(dateValue, formatStr);
  } catch (error) {
    console.warn('Error formatting date:', error, dateValue);
    return "-";
  }
};

/**
 * Converts a local Date object to UTC ISO string for sending to backend
 * All dates sent to backend must be in UTC format
 * @param {Date} localDate - Local Date object from date picker
 * @param {boolean} includeTime - Whether to include time (default: false for date-only)
 * @returns {string} UTC ISO string (e.g., "2025-12-01T00:00:00.000Z")
 */
export const convertLocalDateToUTC = (localDate, includeTime = false) => {
  if (!localDate || !(localDate instanceof Date) || isNaN(localDate.getTime())) {
    return null;
  }
  
  try {
    if (includeTime) {
      // Include time components - convert local time to UTC
      return new Date(Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        localDate.getHours(),
        localDate.getMinutes(),
        localDate.getSeconds(),
        localDate.getMilliseconds()
      )).toISOString();
    } else {
      // Date-only: create UTC date at midnight for the selected date
      return new Date(Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        0, 0, 0, 0
      )).toISOString();
    }
  } catch (error) {
    console.warn('Error converting local date to UTC:', error, localDate);
    return null;
  }
};

/**
 * Parses a UTC date string (from backend) into a Date object
 * All dates from backend are in UTC format
 * @param {string|null|undefined} dateString - UTC date string from backend
 * @returns {Date|null} Date object or null if invalid/missing
 */
export const parseUTCDateString = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Assume all backend dates are UTC
    let dateStr = dateString.trim();
    
    // Replace space with T for ISO format
    if (dateStr.includes(' ') && !dateStr.includes('T')) {
      dateStr = dateStr.replace(' ', 'T');
    }
    
    // If no timezone info and it looks like an ISO date, assume it's UTC
    if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.match(/-\d{2}:\d{2}$/) && dateStr.includes('T')) {
      dateStr += 'Z';
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.warn('Error parsing UTC date string:', error, dateString);
    return null;
  }
};


  // Extracts the date part directly from UTC ISO string (e.g., "2025-12-24T00:00:00.000Z" -> "12/24/2025")
  export const formatDateOnly = (dateValue) => {
    if (!dateValue) return "-";
    
    try {
        // If already formatted, return as-is
        if (typeof dateValue === 'string') {
            const dateStr = dateValue.trim();
            const alreadyFormattedPattern = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
            const match = dateStr.match(alreadyFormattedPattern);
            
            if (match && !dateStr.includes('T') && !dateStr.includes('Z') && !dateStr.includes('+') && dateStr.length <= 10) {
                return dateStr;
            }
            
            // Extract date part from ISO string (YYYY-MM-DD)
            const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (dateMatch) {
                const [, year, month, day] = dateMatch;
                return `${month}/${day}/${year}`;
            }
        }
        
        // Fallback to regular formatDate if parsing fails
        return formatDate(dateValue, "MM/dd/yyyy");
    } catch (error) {
        console.warn('Error formatting date-only:', error, dateValue);
        return "-";
    }
};

