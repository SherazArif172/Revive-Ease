import React from "react";
import { formatDate } from "./dateUtils";

/**
 * Converts a UTC date string to EST and returns date components
 * All backend dates are in UTC, this function converts them to EST for date extraction
 * @param {string|Date} dateValue - UTC date string or Date object
 * @returns {Object} Object with year, month, date, and fullDate in EST timezone
 */
const convertUTCToEST = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    const utcDate = typeof dateValue === 'string' ? new Date(dateValue) : new Date(dateValue);
    if (isNaN(utcDate.getTime())) return null;
    
    // Convert UTC to Eastern Time (EST/EDT) using Intl.DateTimeFormat
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
    
    const parts = easternFormatter.formatToParts(utcDate);
    const easternParts = {};
    parts.forEach(part => {
      easternParts[part.type] = part.value;
    });
    
    return {
      year: parseInt(easternParts.year),
      month: parseInt(easternParts.month) - 1, // month is 0-indexed
      date: parseInt(easternParts.day),
      fullDate: new Date(
        parseInt(easternParts.year),
        parseInt(easternParts.month) - 1,
        parseInt(easternParts.day),
        parseInt(easternParts.hour),
        parseInt(easternParts.minute),
        parseInt(easternParts.second)
      )
    };
  } catch (error) {
    console.warn('Error converting UTC to EST:', error, dateValue);
    return null;
  }
};

export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return null;
  }
  const percentageChange = ((current - previous) / previous) * 100;
  return percentageChange.toFixed(0);
};

export const dataURLtoBlob = (dataURL) => {
  const mime = dataURL?.match(/data:(.*?);base64,/)[1]; // Extract MIME type
  const byteString = atob(dataURL?.split(',')[1]);
  const arrayBuffer = new Uint8Array(byteString?.length);

  for (let i = 0; i < byteString.length; i++) {
    arrayBuffer[i] = byteString?.charCodeAt(i);
  }
  return new Blob([arrayBuffer], { type: mime });
};

export const getFileExtension = (mimeType) => {
  return mimeType.split('/')[1];
};

export const extractGraphData = (data, monthStartDate) => {
  if (!data || !monthStartDate) return [];

  const targetMonth = monthStartDate.getMonth();
  const targetYear = monthStartDate.getFullYear();

  const moodScores = data?.mood_score || [];
  const painScores = data?.pain_score || [];
  const sleepScores = data?.sleep_score || [];
  const migraineDays = data?.migraine_days || [];

  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  const scoreMap = {};

  // Initialize scoreMap with default values
  for (let i = 1; i <= daysInMonth; i++) {
    scoreMap[i] = { name: String(i), Pain: 0, Mood: 0, Sleep: 0, MigraineDays: 0 };
  }

  // Function to process scores and keep only the latest value per day
  const processScores = (scores, type) => {
    const latestEntries = {};

    scores?.forEach(({ date, value }) => {
      // All backend dates are UTC - convert to EST for date extraction
      const estDate = convertUTCToEST(date);
      if (!estDate) return;
      
      if (estDate.month === targetMonth && estDate.year === targetYear) {
        const day = estDate.date;

        // Check if this is the latest entry for the day (compare UTC timestamps)
        const itemDate = new Date(date);
        if (!latestEntries[day] || itemDate.getTime() > new Date(latestEntries[day]?.date).getTime()) {
          latestEntries[day] = { date, value };
        }
      }
    });

    // Assign the latest values to scoreMap
    Object.entries(latestEntries).forEach(([day, { value }]) => {
      scoreMap[day][type] = value;
    });
  };

  processScores(moodScores, "Mood");
  processScores(painScores, "Pain");
  processScores(sleepScores, "Sleep");
  processScores(migraineDays, "MigraineDays");

  return Object.values(scoreMap);
};

export const extractWeeklyGraphData = (data, weekStartDate) => {
  if (!data || !weekStartDate) return [];

  const moodScores = data?.mood_score || [];
  const painScores = data?.pain_score || [];
  const sleepScores = data?.sleep_score || [];
  const migraineDays = data?.migraine_days || [];

  // Convert weekStartDate to Date object and calculate week range
  const startDate = new Date(weekStartDate);
  const weekMap = {};

  // Initialize weekMap with default values for each day (using EST dates for keys)
  for (let i = 0; i < 8; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    // Format date in EST timezone for consistent matching
    const formattedDate = formatDate(currentDate, "yyyy-MM-dd");

    weekMap[formattedDate] = { name: currentDate.getDate().toString(), Pain: 0, Mood: 0, Sleep: 0, MigraineDays: 0 };
  }

  // Function to map only the latest scores for each date
  const mapLatestScores = (scores, key) => {
    const latestEntries = {}; // Store latest data for each date

    scores?.forEach(({ date, value }) => {
      // Convert UTC date to EST and format for matching
      const formattedDate = formatDate(date, "yyyy-MM-dd");

      // Only update if it's a newer entry for the same date (compare UTC timestamps)
      // All backend dates are UTC, but we match by EST date
      if (weekMap[formattedDate]) {
        const currentDate = new Date(date);
        const existingDate = latestEntries[formattedDate] ? new Date(latestEntries[formattedDate]?.date) : null;
        if (!existingDate || currentDate.getTime() > existingDate.getTime()) {
          latestEntries[formattedDate] = { date, value };
        }
      }
    });

    // Assign latest values to weekMap
    Object.entries(latestEntries).forEach(([formattedDate, { value }]) => {
      weekMap[formattedDate][key] = value;
    });
  };

  // Process each category
  mapLatestScores(moodScores, "Mood");
  mapLatestScores(painScores, "Pain");
  mapLatestScores(sleepScores, "Sleep");
  mapLatestScores(migraineDays, "MigraineDays");

  // Return sorted data for the graph
  return Object.values(weekMap);
};

const RADIAN = Math.PI / 180;
export const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent
}) => {
  // Calculate position on the outer edge of the slice
  const angleInRadians = -midAngle * RADIAN;
  
  // Point on the outer edge of the slice
  const outerX = cx + outerRadius * Math.cos(angleInRadians);
  const outerY = cy + outerRadius * Math.sin(angleInRadians);
  
  // Adjust label distance based on slice size to prevent overlap
  // Smaller slices need more space to avoid overlapping with larger slices
  const basePadding = 20;
  const dynamicPadding = percent < 0.05 ? 35 : percent < 0.1 ? 30 : basePadding;
  const labelDistance = outerRadius + dynamicPadding;
  
  // Calculate label position
  const labelX = cx + labelDistance * Math.cos(angleInRadians);
  const labelY = cy + labelDistance * Math.sin(angleInRadians);
  
  // Determine text anchor based on position (left or right side)
  const textAnchor = labelX > cx ? "start" : "end";
  
  // Adjust font size based on slice size
  const fontSize = percent > 0.2 ? 14 : percent > 0.1 ? 12 : 10;
  
  // Text content
  const textContent = `${(percent * 100).toFixed(0)}%`;
  
  // Create horizontal line from slice edge to label
  // Line extends horizontally from the slice edge
  const lineLength = dynamicPadding - 5; // Length of horizontal line
  const lineEndX = labelX > cx 
    ? outerX + lineLength  // Right side: extend right
    : outerX - lineLength; // Left side: extend left
  const lineEndY = outerY; // Keep same Y for horizontal line
  
  return (
    <g>
      {/* Horizontal connecting line from slice edge to label */}
      <line
        x1={outerX}
        y1={outerY}
        x2={lineEndX}
        y2={lineEndY}
        stroke="#666"
        strokeWidth={1.5}
        fill="none"
      />
      {/* Vertical line from horizontal line to label (if needed for better positioning) */}
      {Math.abs(labelY - lineEndY) > 2 && (
        <line
          x1={lineEndX}
          y1={lineEndY}
          x2={labelX}
          y2={labelY}
          stroke="#666"
          strokeWidth={1.5}
          fill="none"
        />
      )}
      {/* Label text */}
      <text
        x={labelX}
        y={labelY}
        fill="#333"
        fontWeight="700"
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={fontSize}
        style={{ pointerEvents: 'none'}}
      >
        {textContent}
      </text>
    </g>
  );
};

export const getDaysInMonthPatientReport = (year, month, rawData, currentMonthDatePatient) => {
  const days = [];

  // Get the total number of days in the given month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const filterYear = currentMonthDatePatient.getFullYear();
  const filterMonth = currentMonthDatePatient.getMonth();

  // Filter data for current month (convert UTC to EST first)
  const filteredData = rawData?.filter((item) => {
    const estDate = convertUTCToEST(item.date);
    if (!estDate) return false;
    return estDate.year === filterYear && estDate.month === filterMonth;
  });

  for (let day = 1; day <= totalDays; day++) {
    const dayString = day.toString();

    // Match data by EST date
    const matchingData = filteredData?.filter((item) => {
      const estDate = convertUTCToEST(item.date);
      return estDate && estDate.date.toString() === dayString;
    });

    // Get the latest entry for the given day
    let latestValue = 0;
    if (matchingData?.length > 0) {
      const latestEntry = matchingData.reduce((latest, item) => {
        return new Date(item.date) > new Date(latest.date) ? item : latest;
      });
      latestValue = latestEntry.value;
    }

    days.push({
      name: dayString,
      value: latestValue, // Only take the latest value
    });
  }

  return days;
};

export const getCurrentWeekPatientReport = (year, rawData, currentWeekStartPatientReport) => {
  const referenceDate = new Date(currentWeekStartPatientReport);

  const currentWeekStart = new Date(referenceDate);
  currentWeekStart.setDate(referenceDate.getDate() - referenceDate.getDay() + 1);
  currentWeekStart.setHours(0, 0, 0, 0);

  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekData = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(currentWeekStart);
    currentDate.setDate(currentWeekStart.getDate() + i);

    // Filter data by EST date (convert UTC to EST first)
    const matchingData = rawData?.filter((item) => {
      const estDate = convertUTCToEST(item?.date);
      if (!estDate) return false;
      const estDateObj = estDate.fullDate;
      return (
        estDateObj >= currentWeekStart &&
        estDateObj <= currentWeekEnd &&
        estDate.date === currentDate.getDate() &&
        estDate.year === year
      );
    });

    // Get the latest value based on the date
    const latestValue =
      matchingData?.length > 0
        ? matchingData?.reduce((latest, item) =>
          new Date(item?.date) > new Date(latest?.date) ? item : latest
        ).value
        : 0;

    weekData.push({
      name: weekDays[i],
      value: latestValue,
    });
  }

  const extraDate = new Date(currentWeekEnd);
  extraDate.setDate(currentWeekEnd.getDate() + 1);

  // Filter extra data by EST date (convert UTC to EST first)
  const extraData = rawData?.filter((item) => {
    const estDate = convertUTCToEST(item?.date);
    if (!estDate) return false;
    return (
      estDate.date === extraDate.getDate() &&
      estDate.year === year
    );
  });

  const extraValue =
    extraData?.length > 0
      ? extraData.reduce((latest, item) =>
        new Date(item.date) > new Date(latest.date) ? item : latest
      ).value
      : 0;

  weekData.push({
    name: "",
    value: extraValue,
  });

  return weekData;
};

// export const getTillDatePatientReport = (rawData, currentMonthDatePatient) => {
//   const days = [];

//   // Get the current date and go back 5 months
//   const currentDate = new Date(currentMonthDatePatient);
//   const fiveMonthsAgo = new Date(currentDate);
//   fiveMonthsAgo.setMonth(currentDate.getMonth() - 4); // -4 to include current month + 4 previous months = 5 total

//   // Base tick days; capped to each month's last day and ensuring last day is included
//   const baseDisplayDays = [1, 5, 10, 15, 20, 25, 30];

//   // Process data for each month
//   for (let i = 0; i < 5; i++) {
//     const monthDate = new Date(fiveMonthsAgo);
//     monthDate.setMonth(fiveMonthsAgo.getMonth() + i);

//     // For each month, add the display days respecting the month's actual length
//     const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
//     const monthDays = baseDisplayDays.filter((d) => d <= lastDayOfMonth);
//     if (monthDays[monthDays.length - 1] !== lastDayOfMonth) {
//       monthDays.push(lastDayOfMonth);
//     }

//     monthDays.forEach(day => {
//       // Filter data for this specific date
//       const dayData = rawData?.filter((item) => {
//         const itemDate = new Date(item.date);
//         return itemDate.getDate() === day && 
//                itemDate.getMonth() === monthDate.getMonth() && 
//                itemDate.getFullYear() === monthDate.getFullYear();
//       });

//       // Get the latest value for this date
//       let value = 0;
//       if (dayData && dayData.length > 0) {
//         const latestEntry = dayData.reduce((latest, item) => {
//           return new Date(item.date) > new Date(latest.date) ? item : latest;
//         });
//         value = latestEntry.value;
//       }

//       days.push({
//         date: day.toString(),
//         value: value,
//       });
//     });
//   }

//   return days;
// };

export const getTillDatePatientReport = (patientData, maxDate, patientCreatedAt, selectedCategory = "overall") => {
  if (!patientData || !maxDate || !patientCreatedAt) return [];

  const months = [];

  // Start from patient creation month to current month
  const startDate = new Date(patientCreatedAt);
  const endDate = new Date(maxDate);

  // Set to first day of months
  const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  // Generate all months between start and end
  const currentMonth = new Date(startMonth);
  while (currentMonth <= endMonth) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthName = formatDate(currentMonth, 'MMM yyyy');

    // Get the last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    if (selectedCategory === "overall") {
      // Use total_pain_score for overall category
      const overallScores = patientData?.total_pain_score || [];

      // Filter scores for current month (convert UTC to EST first)
      const monthData = overallScores.filter((item) => {
        const estDate = convertUTCToEST(item.date);
        if (!estDate) return false;
        return estDate.month === month &&
          estDate.year === year &&
          estDate.fullDate <= endDate;
      });

      let displayValue = 0;

      if (monthData.length > 0) {
        // First, try to find the last day's value (using EST date)
        const lastDayEntries = monthData.filter(item => {
          const estDate = convertUTCToEST(item.date);
          return estDate && estDate.date === lastDayOfMonth;
        });

        // Sort last day entries by date (most recent first)
        const sortedLastDayEntries = lastDayEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Check if we have a last day entry AND it's non-zero
        if (sortedLastDayEntries.length > 0 && sortedLastDayEntries[0].value > 0) {
          displayValue = sortedLastDayEntries[0].value;
        } else {
          // If no last day entry OR last day value is zero, find the last non-zero value in the entire month
          const sortedMonthData = monthData.sort((a, b) => new Date(b.date) - new Date(a.date));
          const lastNonZeroEntry = sortedMonthData.find(item => item.value > 0);
          if (lastNonZeroEntry) {
            displayValue = lastNonZeroEntry.value;
          } else {
            // If no non-zero values at all, take the last value (even if zero)
            displayValue = sortedMonthData[0]?.value || 0;
          }
        }
      }

      months.push({
        date: monthName,
        value: displayValue,
        monthIndex: month,
        year: year
      });

    } else {
      // Use individual scores for specific categories
      const painScores = patientData?.pain_score || [];
      const moodScores = patientData?.mood_score || [];
      const sleepScores = patientData?.sleep_score || [];
      const migraineDays = patientData?.migraine_days || [];

      // Helper function to get display value for a specific score type
      const getDisplayValue = (scores) => {
        // Filter scores for current month (convert UTC to EST first)
        const monthData = scores.filter((item) => {
          const estDate = convertUTCToEST(item.date);
          if (!estDate) return false;
          return estDate.month === month && 
                 estDate.year === year &&
                 estDate.fullDate <= endDate;
        });
        
        if (monthData.length === 0) return 0;
        
        // Get the last day of the month
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        
        // 1. First, try to get non-zero values from the LAST DAY only (using EST date)
        const lastDayEntries = monthData.filter(item => {
          const estDate = convertUTCToEST(item.date);
          return estDate && estDate.date === lastDayOfMonth;
        });
        
        if (lastDayEntries.length > 0) {
          // Sort last day entries by date (most recent first)
          const sortedLastDayEntries = lastDayEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          // Find the most recent non-zero value from the last day
          const lastDayNonZero = sortedLastDayEntries.find(item => item.value > 0);
          if (lastDayNonZero) {
            return lastDayNonZero.value; // Return non-zero from last day
          }
          // If last day has only zeros, continue to step 2
        }
        
        // 2. If no non-zero values on last day, find the last non-zero value in the entire month
        const sortedMonthData = monthData.sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastNonZeroEntry = sortedMonthData.find(item => item.value > 0);
        
        // Return last non-zero value, or last value if all are zero
        return lastNonZeroEntry ? lastNonZeroEntry.value : (sortedMonthData[0]?.value || 0);
      };

      // Get display values for all three metrics
      const painValue = getDisplayValue(painScores);
      const moodValue = getDisplayValue(moodScores);
      const sleepValue = getDisplayValue(sleepScores);
      const migraineDaysValue = getDisplayValue(migraineDays);

      months.push({
        date: monthName,
        Pain: painValue,
        Mood: moodValue,
        Sleep: sleepValue,
        MigraineDays: migraineDaysValue,
        monthIndex: month,
        year: year
      });
    }

    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  return months;
};

export const calculatePercentagePerSelectedDate = (tasks, selectedDate) => {
  if (!tasks?.length) return 0;

  const selectedDateStr = formatDate(selectedDate, "MM-dd-yyyy");

  const tasksForDate = tasks.filter(task =>
    formatDate(task.date, "MM-dd-yyyy") === selectedDateStr
  );

  const totalTasks = tasksForDate?.length;
  const completedTasks = tasksForDate.filter(task => task.value === true)?.length;

  return totalTasks === 0 ? 0 : ((completedTasks / totalTasks) * 100).toFixed(0);
};

/**
 * Counts the number of completed tasks (value === true) for a specific date
 * @param {Array} tasks - Array of tasks
 * @param {Date|string} selectedDate - The date to filter tasks for
 * @returns {number} Count of completed tasks for the selected date
 */
export const countCompletedTasksPerDate = (tasks, selectedDate) => {
  if (!tasks?.length) return 0;

  const selectedDateStr = formatDate(selectedDate, "MM-dd-yyyy");

  const tasksForDate = tasks.filter(task =>
    formatDate(task.date, "MM-dd-yyyy") === selectedDateStr
  );

  const completedTasks = tasksForDate.filter(task => task.value === true)?.length;

  return completedTasks;
};

/**
 * Counts the number of completed tasks (value === true) for a specific week
 * @param {Array} tasks - Array of tasks
 * @param {Date|string} selectedWeek - The week start date to filter tasks for
 * @returns {number} Count of completed tasks for the selected week
 */
export const countCompletedTasksPerWeek = (tasks, selectedWeek) => {
  if (!tasks?.length) return 0;

  const { start, end } = getWeekRange(selectedWeek);

  const tasksInWeek = tasks.filter(task => {
    const taskDateStr = formatDate(task.date, "MM-dd-yyyy");
    return taskDateStr >= start && taskDateStr <= end;
  });

  const completedTasks = tasksInWeek.filter(task => task.value === true)?.length;

  return completedTasks;
};

/**
 * Counts the number of completed tasks (value === true) for a specific month
 * @param {Array} tasks - Array of tasks
 * @param {Date|string} selectedMonth - The month to filter tasks for
 * @returns {number} Count of completed tasks for the selected month
 */
export const countCompletedTasksPerMonth = (tasks, selectedMonth) => {
  if (!tasks?.length) return 0;

  const monthDate = new Date(selectedMonth);
  const targetMonth = monthDate.getMonth();
  const targetYear = monthDate.getFullYear();

  const tasksInMonth = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate.getMonth() === targetMonth && taskDate.getFullYear() === targetYear;
  });

  const completedTasks = tasksInMonth.filter(task => task.value === true)?.length;

  return completedTasks;
};

/**
 * Counts the number of completed tasks (value === true) for all tasks (overall)
 * @param {Array} tasks - Array of tasks
 * @returns {number} Count of completed tasks
 */
export const countCompletedTasksOverall = (tasks) => {
  if (!tasks?.length) return 0;

  const completedTasks = tasks.filter(task => task.value === true)?.length;

  return completedTasks;
};

export const calculateOverallCompletionPercentage = (tasks) => {
  if (!tasks?.length) return 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.value === true)?.length;

  return totalTasks === 0 ? 0 : ((completedTasks / totalTasks) * 100).toFixed(0);
};


const getWeekRange = (selectedDate) => {
  const date = new Date(selectedDate);
  const day = date.getDay();

  const startDate = new Date(date);
  startDate.setDate(date.getDate() - (day === 0 ? 6 : day - 1));

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    start: formatDate(startDate, "MM-dd-yyyy"),
    end: formatDate(endDate, "MM-dd-yyyy")
  };
};

export const calculateWeeklyCompletionPercentage = (tasks, selectedWeek) => {
  if (!tasks?.length) return 0;

  const { start, end } = getWeekRange(selectedWeek);

  const tasksInWeek = tasks.filter(task => {
    const taskDateStr = formatDate(task.date, "MM-dd-yyyy");
    return taskDateStr >= start && taskDateStr <= end;
  });

  const totalTasks = tasksInWeek?.length;
  const completedTasks = tasksInWeek.filter(task => task.value === true)?.length;

  return totalTasks === 0 ? 0 : ((completedTasks / totalTasks) * 100).toFixed(0);
};

