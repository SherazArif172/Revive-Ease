import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Vector from "../../../../assets/icons/arrow-down.png";
import chevronLeft from "../../../../assets/icons/chevron-left.png";
import chevronRight from "../../../../assets/icons/chevron-right.png";
import { useGetPatientByIdQuery } from "../../../../redux/apis/allPatient_api";
import { extractGraphData, extractWeeklyGraphData, getCurrentWeekPatientReport, getDaysInMonthPatientReport, getTillDatePatientReport, renderCustomizedLabel } from "../../../../utils/PercentageHandler";
import EngagementMedicineReport from "./EngagemenetMedicineReport";
import EngagementFactors from "./EngagementFactors";
import EngagementPatientReport from "./EngagementPatientReport";
import { formatDate } from "../../../../utils/dateUtils";

const PatientEngagement = ({ patientId, providerReportGraph }) => {

  const patientGraphData = useSelector((state) => state?.allPatients?.patient?.patientData);

  // eslint-disable-next-line no-unused-vars
  const created = useSelector((state) => state?.allPatients?.patient?.patientData?.createdAt);

  const TimeSpentOnReviveGraph = useSelector((state) => state?.allPatients?.patientsGraph?.patientData);

  // const formatDate = (date) => {
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //   const day = date.getDate().toString().padStart(2, '0');
  //   const year = date.getFullYear();
  //   return `${month}/${day}/${year}`;
  // };

  const getWeeklyRange = (week) => {
    const weekStart = new Date(week);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  const today = new Date();
  const [selected, setSelected] = useState("Daily");
  const [lastDay, setLastDay] = useState(null);
  const [graphType, setGraphType] = useState("onmount");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const getLastDateOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const lastMonthDate = getLastDateOfMonth(currentMonthDate);
  const [currentDateOfThisMonth, setCurrentDate] = useState(today);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(today));
  const [selectedCategory, setSelectedCategory] = useState("overall");
  const [currentMonthDatePatient, setCurrentMonthDatePatient] = useState(new Date());
  const [currentTillDateMonth, setCurrentTillDateMonth] = useState(new Date());
  const getCurrentWeekStart = () => {
    const today = new Date();
    return getWeekStart(today);
  };

  const [currentWeekStartPatientReport, setCurrentWeekStartPatientReport] = useState(getCurrentWeekStart());
  const actorType = useSelector((state) => state?.user?.userType);
  const user_id = useSelector((state) => state?.user?.id);
  const [currentTab, setCurrentTab] = useState("Patient Report");

  const syncFilterMonthAndYear = (dateObj) => {
    if (!dateObj || Number.isNaN(dateObj.getTime())) return;
    setFilterMonth(dateObj.getMonth() + 1);
    setFilterYear(dateObj.getFullYear());
  };

  const patientCreatedAt = patientGraphData?.createdAt ? new Date(patientGraphData.createdAt) : new Date();

  const minDate = patientCreatedAt;
  const maxDate = new Date();

  // Calculate week range for API call - recalculate when currentWeekStart changes
  const calculateWeekRange = () => {
    if (!currentWeekStart) return null;
    try {
      const weekStart = new Date(currentWeekStart);
      if (isNaN(weekStart.getTime())) return null;
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return { weekStart, weekEnd };
    } catch (error) {
      console.error('Error calculating week range:', error);
      return null;
    }
  };

  const weekRange = calculateWeekRange();

  // Format dates for API - use direct formatting to ensure MM/DD/yyyy format
  const getFormattedWeekDates = () => {
    if (!weekRange || !weekRange.weekStart || !weekRange.weekEnd) return null;
    try {
      const startDate = weekRange.weekStart;
      const endDate = weekRange.weekEnd;
      
      // Format directly as MM/DD/yyyy to ensure correct format
      const formatDateForAPI = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };
      
      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);
      
      return { startDate: startDateStr, endDate: endDateStr };
    } catch (error) {
      console.error('Error formatting week dates:', error);
      return null;
    }
  };

  const weekDates = getFormattedWeekDates();

  const getReportMonthYear = () => {
    if (graphType === "Login_data") {
      return { month: filterMonth, year: filterYear };
    }

    if (selected === "Daily") {
      return {
        month: currentDateOfThisMonth.getMonth() + 1,
        year: currentDateOfThisMonth.getFullYear(),
      };
    }

    return {
      month: currentMonthDate.getMonth() + 1,
      year: currentMonthDate.getFullYear(),
    };
  };

  const activeReportMonthYear = getReportMonthYear();

  // eslint-disable-next-line no-unused-vars
  const { data: patientData, refetch } = useGetPatientByIdQuery({
    id: patientId,
    page: "",
    rowsPerPage: "",
    currentTab: "Approved",
    month: activeReportMonthYear.month,
    year: activeReportMonthYear.year,
    graphType: graphType,
    actorId: user_id,
    actorType: actorType,
    ...(selected === "Weekly" && graphType === "Time_spent_on_time" && weekDates
      ? {
        startDate: weekDates.startDate,
        endDate: weekDates.endDate,
      }
      : {}),
  });

  function getWeekStart(date) {
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const start = new Date(date);
    start.setDate(start.getDate() + diff);
    return start;
  }

  const getLastDayOfMonth = (dateStr) => {
    if (!dateStr) return null;

    const date = new Date(dateStr);

    if (isNaN(date)) return null;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const lastDate = new Date(year, month, 0).getDate();

    return { lastDate, month, year };
  };
  useEffect(() => {
    setGraphType("onmount");
  }, []);

  // Initialize dates based on patient's createdAt
  useEffect(() => {
    if (patientGraphData?.createdAt) {
      const createdAt = new Date(patientGraphData.createdAt);
      setCurrentTillDateMonth(createdAt);
      setCurrentWeekStartPatientReport(getCurrentWeekStart());
    }
  }, [patientGraphData?.createdAt]);

  useEffect(() => {
    if (selectedDate) {
      const result = getLastDayOfMonth(selectedDate);
      setLastDay(result);
    } else {
      setLastDay(null);
    }
    // Update filterMonth and filterYear for the selected month
    syncFilterMonthAndYear(selectedDate);
    // Ensure graphType is set to Login_data when selectedDate changes
    // This ensures login data is fetched for the selected month
    // Use a callback to ensure state is updated before refetch
    setGraphType("Login_data");
  }, [selectedDate]);

  useEffect(() => {
    if (currentDateOfThisMonth) {
      syncFilterMonthAndYear(currentDateOfThisMonth);
    }
  }, [currentDateOfThisMonth]);

  useEffect(() => {
    if (currentMonthDate) {
      syncFilterMonthAndYear(currentMonthDate);
    }
  }, [currentMonthDate]);

  // Do not overwrite the API month from the week-start date.
  // The week start can fall in the previous month while the report should remain on the current selected month.

  // Track previous selectedDate to detect month/year changes
  const prevSelectedDateRef = useRef(selectedDate);
  
  // Specifically handle login data fetching when selectedDate month/year changes
  // This ensures login data is fetched with the correct month/year and graphType="Login_data"
  useEffect(() => {
    if (selectedDate) {
      const prevDate = prevSelectedDateRef.current;
      const monthChanged = !prevDate || 
        prevDate.getMonth() !== selectedDate.getMonth() || 
        prevDate.getFullYear() !== selectedDate.getFullYear();
      
      if (monthChanged) {
        prevSelectedDateRef.current = selectedDate;
        // Ensure we refetch login data when the month/year actually changes
        // The graphType and filterMonth/filterYear are updated in the selectedDate useEffect above
        // Use a small delay to ensure all state updates are applied before refetching
        const timer = setTimeout(() => {
          // Verify graphType is Login_data and refetch
          if (graphType === "Login_data") {
            refetch();
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedDate, graphType, refetch]);

  const numbers = Array.from({ length: lastDay?.lastDate }, (_, i) => ({
    day: i + 1,
    month: lastDay?.month,
    year: lastDay?.year,
  }));

  const [patientReport, setPatientReport] = useState("weekly");

  const aggregatedDataArray = TimeSpentOnReviveGraph?.loginHistory || [];

  const aggregatedData = aggregatedDataArray.reduce((acc, item) => {
    if (!item?.date) return acc;
    const hours = (item?.timeDuration / 3600).toFixed(2);
    
    // Add local timezone key (primary - matches daily/monthly/weekly lookup)
    const dateObj = new Date(item.date);
    const localKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
    acc[localKey] = hours;
    
    // Also add EST formatted key as fallback
    const formattedDate = formatDate(item?.date, "yyyy-MM-dd");
    if (!acc[formattedDate]) {
      acc[formattedDate] = hours;
    }
    return acc;
  }, {});

  // month graph
  const monthDays = Array.from({ length: lastMonthDate }, (_, i) => {
    const day = (i + 1).toString().padStart(2, "0");
    const date = `${currentMonthDate.getFullYear()}-${String(
      currentMonthDate.getMonth() + 1
    ).padStart(2, "0")}-${day}`;

    const minutes = aggregatedData[date] ? parseFloat(aggregatedData[date]) * 60 : 0;

    return {
      name: day,
      mins: minutes.toFixed(0),
    };
  });

  // week graph - use EXACT same approach as daily/monthly (local timezone keys)
  const startOfWeek = new Date(currentWeekStart);
  startOfWeek.setHours(0, 0, 0, 0); // Normalize to start of day

  // weekly graph data - match daily/monthly pattern exactly
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    
    // Create date key using local timezone - EXACT same as daily/monthly
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const date = String(day.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${date}`;
    
    // Get day name for display
    const dayName = formatDate(day, "EEEE").slice(0, 3);
    
    // Look up in aggregatedData using local timezone key (same as daily/monthly)
    // aggregatedData has local timezone keys from the fallback we added
    const hoursValue = aggregatedData[dateKey];
    const hours = hoursValue ? parseFloat(hoursValue) : 0;
    const minutes = hours * 60; // Convert hours to minutes
    
    return {
      name: dayName,
      mins: minutes.toFixed(0)
    };
  });

  // daily graph
  const currentYear = currentDateOfThisMonth.getFullYear();
  const currentMonth = (currentDateOfThisMonth.getMonth() + 1)
    .toString()
    .padStart(2, "0");
  const formattedCurrentDate = currentDateOfThisMonth
    .getDate()
    .toString()
    .padStart(2, "0");
  const currentDateKey = `${currentYear}-${currentMonth}-${formattedCurrentDate}`;
  const currentDateData = aggregatedData[currentDateKey] || "0";
  const dailyData = [
    {
      name: formatDate(currentDateOfThisMonth, "EEEE").slice(0, 3),
      mins: currentDateData ? (parseFloat(currentDateData) * 60).toFixed(0) : "0.00",
    },
  ];

  const handleButtonClick = (type, e) => {
    e.preventDefault();
    setSelected(type);
    if (type === "Daily") {
      syncFilterMonthAndYear(currentDateOfThisMonth);
      setGraphType("Time_spent_on_time");
    }
    else if (type === "Monthly") {
      syncFilterMonthAndYear(currentMonthDate);
      setGraphType("Time_spent_on_time");
    }
    else if (type === "Weekly") {
      syncFilterMonthAndYear(currentMonthDate);
      setGraphType("Time_spent_on_time");
    }
  };

  // Use separate dates for each report type
  const monthData = getDaysInMonthPatientReport(currentMonthDatePatient.getFullYear(), currentMonthDatePatient.getMonth(), patientGraphData?.total_pain_score, currentMonthDatePatient);
  const weeklyData = getCurrentWeekPatientReport(currentMonthDatePatient.getFullYear(), patientGraphData?.total_pain_score, currentWeekStartPatientReport);

  // For Till Date, always show data from patient registration to current date
  const tillDateData = getTillDatePatientReport(
    patientGraphData,
    maxDate,
    patientCreatedAt,
    selectedCategory
  );
  const dataLine = extractGraphData(patientGraphData, currentMonthDatePatient);
  const dataLineWeekly = extractWeeklyGraphData(patientGraphData, currentWeekStartPatientReport).map((entry, index, array) =>
    index === array.length - 1 ? { ...entry, name: "" } : entry
  );

  const handleClickPatientReport = (type) => {
    setPatientReport(type);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handlePrevMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
    setGraphType("Time_spent_on_time");
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
    setGraphType("Time_spent_on_time");
  };

  const handleNextDate = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.getTime() + 24 * 60 * 60 * 1000)
    );
    setGraphType("Time_spent_on_time");
  };

  const handlePrevDate = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.getTime() - 24 * 60 * 60 * 1000)
    );
    setGraphType("Time_spent_on_time");
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => {
      const newStart = new Date(prev);
      newStart.setDate(newStart.getDate() - 7);
      return newStart;
    });
    setGraphType("Time_spent_on_time");
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const newStart = new Date(prev);
      newStart.setDate(newStart.getDate() + 7);
      return newStart;
    });
    setGraphType("Time_spent_on_time");
  };

  const handlePrevMonthPatientReport = () => {
    const newDate = new Date(currentMonthDatePatient.getFullYear(), currentMonthDatePatient.getMonth() - 1, 1);
    setCurrentMonthDatePatient(newDate);
  };

  const handleNextMonthPatientReport = () => {
    const newDate = new Date(currentMonthDatePatient.getFullYear(), currentMonthDatePatient.getMonth() + 1, 1);
    setCurrentMonthDatePatient(newDate);
  };

  // const handlePrevFiveMonthPatientReport = () => {
  //   const newDate = new Date(currentTillDateMonth.getFullYear(), currentTillDateMonth.getMonth() - 5, 1);
  //   if (newDate >= minDate) {
  //     setCurrentTillDateMonth(newDate);
  //   }
  // };

  // const handleNextFiveMonthPatientReport = () => {
  //   const newDate = new Date(currentTillDateMonth.getFullYear(), currentTillDateMonth.getMonth() + 5, 1);
  //   if (newDate <= maxDate) {
  //     setCurrentTillDateMonth(newDate);
  //   }
  // };

  const handlePrevFiveMonthPatientReport = () => {
    const newDate = new Date(currentTillDateMonth.getFullYear(), currentTillDateMonth.getMonth() - 1, 1);
    setCurrentTillDateMonth(newDate);
  };

  const handleNextFiveMonthPatientReport = () => {
    const newDate = new Date(currentTillDateMonth.getFullYear(), currentTillDateMonth.getMonth() + 1, 1);
    setCurrentTillDateMonth(newDate);
  };

  const handlePrevWeekPatientReport = () => {
    const newStart = new Date(currentWeekStartPatientReport);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStartPatientReport(newStart);
  };

  const handleNextWeekPatientReport = () => {
    const newStart = new Date(currentWeekStartPatientReport);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStartPatientReport(newStart);
  };

  // Helper function to parse video_duration string to seconds
  const parseVideoDurationToSeconds = (durationStr) => {
    if (!durationStr || typeof durationStr !== 'string' || durationStr === 'Rest Day') {
      return 0;
    }

    let totalSeconds = 0;
    
    // Match minutes and seconds patterns
    const minsMatch = durationStr.match(/(\d+)\s*mins?/i);
    const secsMatch = durationStr.match(/(\d+)\s*secs?/i);
    
    if (minsMatch) {
      totalSeconds += parseInt(minsMatch[1], 10) * 60;
    }
    
    if (secsMatch) {
      totalSeconds += parseInt(secsMatch[1], 10);
    }
    
    return totalSeconds;
  };

  // Get assignedTaskJourney data (check both patientData and TimeSpentOnReviveGraph)
  const assignedTaskJourneyData = TimeSpentOnReviveGraph?.graph_assigned || [];




  // Filter tasks by category and value === true
  const getCompletedTasksByCategory = (tasks, category, dateFilter) => {
    const filtered = tasks?.filter((task) => 
      task?.category_name === category && task?.value === true
    );
    
    if (!dateFilter) return filtered;
    
    // Apply date filter based on selected time period - use same approach as calculateTrackTime
    return filtered?.filter((task) => {
      const taskDate = new Date(task.date);
      if (dateFilter.type === 'daily') {
        const selectedDate = new Date(dateFilter.date);
        return taskDate.toDateString() === selectedDate.toDateString();
      } else if (dateFilter.type === 'weekly') {
        const weekStart = new Date(dateFilter.weekStart);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return taskDate >= weekStart && taskDate <= weekEnd;
      } else if (dateFilter.type === 'monthly') {
        const monthDate = new Date(dateFilter.monthDate);
        return taskDate.getMonth() === monthDate.getMonth() && 
               taskDate.getFullYear() === monthDate.getFullYear();
      }
      return true;
    });
  };

  // Calculate total time in seconds for a category
  const calculateCategoryTime = (tasks) => {
    return tasks?.reduce((total, task) => {
      const duration = parseVideoDurationToSeconds(task?.video_duration);
      return total + duration;
    }, 0) || 0;
  };

  // Calculate Track time from loginHistory
  const calculateTrackTime = (loginHistory, dateFilter) => {
    if (!loginHistory || !Array.isArray(loginHistory)) return 0;
    
    let filteredHistory = loginHistory;
    
    if (dateFilter) {
      filteredHistory = loginHistory.filter((item) => {
        const itemDate = new Date(item.date);
        if (dateFilter.type === 'daily') {
          const selectedDate = new Date(dateFilter.date);
          return itemDate.toDateString() === selectedDate.toDateString();
        } else if (dateFilter.type === 'weekly') {
          const weekStart = new Date(dateFilter.weekStart);
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          return itemDate >= weekStart && itemDate <= weekEnd;
        } else if (dateFilter.type === 'monthly') {
          const monthDate = new Date(dateFilter.monthDate);
          return itemDate.getMonth() === monthDate.getMonth() && 
                 itemDate.getFullYear() === monthDate.getFullYear();
        }
        return true;
      });
    }
    
    return filteredHistory.reduce((total, item) => {
      return total + (item?.timeDuration || 0);
    }, 0);
  };

  // Calculate times for Daily
  const trackTimeDaily = calculateTrackTime(TimeSpentOnReviveGraph?.loginHistory, { type: 'daily', date: currentDateOfThisMonth });
  const activityTasksDaily = getCompletedTasksByCategory(assignedTaskJourneyData, "Activity", { type: 'daily', date: currentDateOfThisMonth });
  const relaxTasksDaily = getCompletedTasksByCategory(assignedTaskJourneyData, "Relax", { type: 'daily', date: currentDateOfThisMonth });
  const learnTasksDaily = getCompletedTasksByCategory(assignedTaskJourneyData, "Learn", { type: 'daily', date: currentDateOfThisMonth });
  
  const activityTimeDaily = calculateCategoryTime(activityTasksDaily);
  const relaxTimeDaily = calculateCategoryTime(relaxTasksDaily);
  const learnTimeDaily = calculateCategoryTime(learnTasksDaily);
  const totalTimeDaily = trackTimeDaily + activityTimeDaily + relaxTimeDaily + learnTimeDaily;

  // Calculate times for Weekly
  const trackTimeWeekly = calculateTrackTime(TimeSpentOnReviveGraph?.loginHistory, { type: 'weekly', weekStart: currentWeekStart });
  const activityTasksWeekly = getCompletedTasksByCategory(assignedTaskJourneyData, "Activity", { type: 'weekly', weekStart: currentWeekStart });
  const relaxTasksWeekly = getCompletedTasksByCategory(assignedTaskJourneyData, "Relax", { type: 'weekly', weekStart: currentWeekStart });
  const learnTasksWeekly = getCompletedTasksByCategory(assignedTaskJourneyData, "Learn", { type: 'weekly', weekStart: currentWeekStart });
  
  const activityTimeWeekly = calculateCategoryTime(activityTasksWeekly);
  const relaxTimeWeekly = calculateCategoryTime(relaxTasksWeekly);
  const learnTimeWeekly = calculateCategoryTime(learnTasksWeekly);
  const totalTimeWeekly = trackTimeWeekly + activityTimeWeekly + relaxTimeWeekly + learnTimeWeekly;

  // Calculate times for Monthly
  const trackTimeMonthly = calculateTrackTime(TimeSpentOnReviveGraph?.loginHistory, { type: 'monthly', monthDate: currentMonthDate });
  const activityTasksMonthly = getCompletedTasksByCategory(assignedTaskJourneyData, "Activity", { type: 'monthly', monthDate: currentMonthDate });
  const relaxTasksMonthly = getCompletedTasksByCategory(assignedTaskJourneyData, "Relax", { type: 'monthly', monthDate: currentMonthDate });
  const learnTasksMonthly = getCompletedTasksByCategory(assignedTaskJourneyData, "Learn", { type: 'monthly', monthDate: currentMonthDate });
  
  const activityTimeMonthly = calculateCategoryTime(activityTasksMonthly);
  const relaxTimeMonthly = calculateCategoryTime(relaxTasksMonthly);
  const learnTimeMonthly = calculateCategoryTime(learnTasksMonthly);
  const totalTimeMonthly = trackTimeMonthly + activityTimeMonthly + relaxTimeMonthly + learnTimeMonthly;

  // Pie chart for current month: calculate percentage based on time
  const dataGraph = [
    { 
      name: "Track", 
      value: totalTimeMonthly > 0 ? (trackTimeMonthly / totalTimeMonthly) * 100 : 0, 
      fill: "#293C7F" 
    },
    { 
      name: "Activity", 
      value: totalTimeMonthly > 0 ? (activityTimeMonthly / totalTimeMonthly) * 100 : 0, 
      fill: "#3D7E63" 
    },
    { 
      name: "Relax", 
      value: totalTimeMonthly > 0 ? (relaxTimeMonthly / totalTimeMonthly) * 100 : 0, 
      fill: "#ABA03B" 
    },
    { 
      name: "Learn", 
      value: totalTimeMonthly > 0 ? (learnTimeMonthly / totalTimeMonthly) * 100 : 0, 
      fill: "#B15151" 
    },
  ];

  // Pie chart for today: calculate percentage based on time
  const dataGraphPerDay = [
    { 
      name: "Track", 
      value: totalTimeDaily > 0 ? (trackTimeDaily / totalTimeDaily) * 100 : 0, 
      fill: "#293C7F" 
    },
    { 
      name: "Activity", 
      value: totalTimeDaily > 0 ? (activityTimeDaily / totalTimeDaily) * 100 : 0, 
      fill: "#3D7E63" 
    },
    { 
      name: "Relax", 
      value: totalTimeDaily > 0 ? (relaxTimeDaily / totalTimeDaily) * 100 : 0, 
      fill: "#ABA03B" 
    },
    { 
      name: "Learn", 
      value: totalTimeDaily > 0 ? (learnTimeDaily / totalTimeDaily) * 100 : 0, 
      fill: "#B15151" 
    }
  ];

  // Pie chart for this week: calculate percentage based on time
  const dataGraphPerWeek = [
    { 
      name: "Track", 
      value: totalTimeWeekly > 0 ? (trackTimeWeekly / totalTimeWeekly) * 100 : 0, 
      fill: "#293C7F" 
    },
    { 
      name: "Activity", 
      value: totalTimeWeekly > 0 ? (activityTimeWeekly / totalTimeWeekly) * 100 : 0, 
      fill: "#3D7E63" 
    },
    { 
      name: "Relax", 
      value: totalTimeWeekly > 0 ? (relaxTimeWeekly / totalTimeWeekly) * 100 : 0, 
      fill: "#ABA03B" 
    },
    { 
      name: "Learn", 
      value: totalTimeWeekly > 0 ? (learnTimeWeekly / totalTimeWeekly) * 100 : 0, 
        fill: "#B15151" 
    }
  ];

  const filteredDataGraph = dataGraph?.filter((entry) => entry?.value > 0);
  const filteredDataGraphPerDay = dataGraphPerDay?.filter((entry) => entry?.value > 0);
  const filteredDataGraphperWeek = dataGraphPerWeek?.filter((entry) => entry?.value > 0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <div className="default-container ps-3 mt-3  bg-white">
        <div className="">
          <div className="col-12 patient-num">
            <div className="d-flex justify-content-between">
              <div>
                <p className="month-text">
                  <b>Login data</b>
                </p>
              </div>
              <div className="d-flex align-items-center position-relative me-5" style={{ width: "150px" }}>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => { setSelectedDate(date); setGraphType("Login_data"); }}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  className="border-0 fw-bold  font-orange pointer"
                  minDate={minDate}
                  maxDate={maxDate}
                  onKeyDown={(e) => e.preventDefault()}
                  customInput={
                    <div className="d-flex align-items-center">
                      <input
                        value={selectedDate ? formatDate(selectedDate, 'MMMM yyyy') : ''}
                        readOnly
                        className="border-0 fw-bold font-orange pointer bg-transparent"
                        style={{ width: '140px' }}
                      />
                      <img
                        loading="lazy"
                        src={Vector}
                        alt="Calendar Icon"
                        className="ms-2"
                        height={15}
                      />
                    </div>
                  }
                />
              </div>
            </div>
            <div
              className="d-flex flex-wrap align-items-center justify-content-start"
              style={{ flexWrap: "wrap" }}
            >
              {numbers?.map(({ day, month, year }) => {
                const today = new Date().getDate();
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();

                const matchingDays = patientGraphData?.loginHistory?.map((date) => {
                  const utcDate = new Date(date?.date);
                  return {
                    day: utcDate.getDate(),
                    month: utcDate.getMonth() + 1,
                  };
                });

                const isMatchingDay = matchingDays?.some(
                  (d) => d.day === day && d.month === month
                );

                let backgroundColor;
                let color;

                if (!isMatchingDay) {
                  if (
                    month < currentMonth ||
                    (month === currentMonth && day < today) ||
                    year < currentYear
                  ) {
                    backgroundColor = "#A6A6A6";
                    color = "#FFFFFF";
                  } else if (
                    month > currentMonth ||
                    (month === currentMonth && day > today) ||
                    year > currentYear
                  ) {
                    backgroundColor = "#EEEEEE";
                    color = "#000000";

                  } else if (day === today) {
                    backgroundColor = "#A6A6A6";
                    color = "#000000";

                  }
                } else {
                  backgroundColor = "#007E9E";
                  color = "#FFFFFF";
                }

                return (
                  <span
                    key={`${day}-${month}`}
                    className="circle mx-2 "
                    style={{ backgroundColor, color }}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>

        </div>
        <div className="col-12 patient-num mt-3 ">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="month-text mt-3">
                <b>Total Time Spent On Revive</b>
              </p>
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "15px",
                }}
              >
                <div className="month-button">
                  <button
                    type="button"
                    onClick={(e) => handleButtonClick("Daily", e)}
                    style={{
                      backgroundColor:
                        selected === "Daily" ? "#F88200" : "#EDEDED",
                      color: selected === "Daily" ? "#FFFFFF" : "#000000",
                      border: "none",
                      padding: "12px 24px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      outline: "none",
                      borderRadius: selected === "Daily" ? "5px" : "0px", // Add border radius for selected button
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleButtonClick("Weekly", e)}
                    style={{
                      backgroundColor:
                        selected === "Weekly" ? "#F88200" : "#EDEDED",
                      color: selected === "Weekly" ? "#FFFFFF" : "#000000",
                      border: "none",
                      padding: "12px 24px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      outline: "none",
                      borderRadius: selected === "Weekly" ? "5px" : "0px", // Add border radius for selected button
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    Weekly
                  </button>

                  {/* Monthly Button */}
                  <button
                    type="button"
                    onClick={(e) => handleButtonClick("Monthly", e)}
                    style={{
                      backgroundColor:
                        selected === "Monthly" ? "#F88200" : "#EDEDED",
                      color: selected === "Monthly" ? "#FFFFFF" : "#000000",
                      border: "none",
                      padding: "12px 24px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      outline: "none",
                      borderRadius: selected === "Monthly" ? "5px" : "0px",
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    Monthly
                  </button>
                </div>
              </div>
            </div>
          </div>
          {selected === "Monthly" ? (
            <div>
              <p className="month-text flex items-center">
                <img loading="lazy"
                  className="me-2 pointer"
                  src={chevronLeft}
                  onClick={handlePrevMonth}
                  alt="Previous"
                />
                <b className="me-2">
                  {formatDate(currentMonthDate, "MMMM yyyy")}
                </b>
                <img loading="lazy"
                  className="mx-2 pointer"
                  src={chevronRight}
                  onClick={handleNextMonth}
                  alt="Next"
                />
              </p>
            </div>) : selected === "Weekly" ? (
              <p className="month-text flex items-center">
                <img loading="lazy" className="me-2 pointer" src={chevronLeft} onClick={handlePrevWeek} alt="Previous" />
                <b className="me-2">{getWeeklyRange(currentWeekStart)}</b>
                <img loading="lazy" className="mx-2 pointer" src={chevronRight} onClick={handleNextWeek} alt="Next" />
              </p>
            ) : (
            <p className="month-text flex items-center">
              <img loading="lazy"
                className="me-2 pointer"
                src={chevronLeft}
                onClick={handlePrevDate}
                alt="Previous"
              />
              <b className="me-2">
                {formatDate(currentDateOfThisMonth)}
              </b>
              <img loading="lazy"
                className="mx-2 pointer"
                src={chevronRight}
                onClick={handleNextDate}
                alt="Next"
              />
            </p>
          )}
          <div className="row">
            <div className={`${selected === "Monthly" ? "col-md-12" : "col-md-6"}`}>
              {selected === "Monthly" ? (
                <div className="col-md-12" style={{ height: "250px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={monthDays}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      barSize={20}
                    >
                      <XAxis dataKey="name" tickFormatter={(tick) => tick} />
                      <YAxis
                        tick={{ width: 75 }}
                        ticks={[0, 30, 60, 90, 120]}
                        tickFormatter={(tick) => `${tick} mins`}
                      />
                      <Tooltip cursor={{ fill: "white" }} />
                      <CartesianGrid
                        horizontal={true}
                        vertical={false}
                        stroke="#ccc"
                      />
                      <Bar dataKey="mins" fill="#027FA3" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : selected === "Weekly" ? (
                <div className="col-md-12 mt-5" style={{ height: "200px" }}>
                  <ResponsiveContainer height={200}>
                    <BarChart
                      data={weekData}
                      margin={{
                        top: 13,
                        left: 20,
                      }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis
                        tick={{ width: 75 }}
                        ticks={[0, 30, 60, 90, 120]}
                        tickFormatter={(tick) => `${tick} mins`}
                      />
                      <Tooltip cursor={{ fill: "white" }} />
                      <CartesianGrid
                        horizontal={true}
                        vertical={false}
                        stroke="#ccc"
                      />
                      <Bar dataKey="mins" fill="#027FA3" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="row">
                  <div className="col-md-12 mt-5" style={{ height: "200px" }}>
                    <ResponsiveContainer height={200}>
                      <BarChart
                        data={dailyData}
                        margin={{
                          top: 13,
                          left: 20,
                        }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis
                          tick={{ width: 75 }}
                          allowDataOverflow
                          ticks={[0, 30, 60, 90, 120]}
                          tickFormatter={(tick) => `${tick} mins`}
                        />
                        <Tooltip cursor={{ fill: "white" }} />
                        <CartesianGrid
                          horizontal={true}
                          vertical={false}
                          stroke="#ccc"
                        />
                        <Bar
                          dataKey="mins"
                          fill="#027FA3"
                          radius={[6, 6, 0, 0]}
                          barSize={180}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
            <div className="col-md-6">
              <div className=" mt-4" style={{ height: "250px" }}>
                <div
                  className="pie-chart-container d-flex ps-5"
                  style={{ flex: 0.3, height: "100%", width: "100%" }}
                >
                  {selected === "Daily" && filteredDataGraphPerDay.length > 0 ? (
                    <ResponsiveContainer width={400} height="100%">
                      <PieChart width={400} height={400}>
                        <Pie
                          data={filteredDataGraphPerDay}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="none"
                        >
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : selected === "Weekly" && filteredDataGraphperWeek.length > 0 ? (
                    <ResponsiveContainer width={400} height="100%">
                      <PieChart width={400} height={400}>
                        <Pie
                          data={filteredDataGraphperWeek}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="none"
                        >

                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : selected === "Monthly" && filteredDataGraph.length > 0 ? (
                    <ResponsiveContainer width={400} height="100%">
                      <PieChart width={400} height={400}>
                        <Pie
                          data={filteredDataGraph}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="none"
                        >

                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    // Show empty grey-colored graph if no data is available
                    <ResponsiveContainer width={400} height="100%">
                      <PieChart width={400} height={400}>
                        <Pie
                          data={[{ name: "No Data", value: 1 }]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#D3D3D3"
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#D3D3D3" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div
                    className="review-management-text px-5 ms-3 my-5"
                    style={{
                      flex: "0 0 auto",

                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div className=" box-size box-color-5"></div>
                      <div>
                        <p className="log-text-room">No Data</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div className=" box-size box-color-1"></div>
                      <div>
                        <p className="log-text-room">Learn</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div className=" box-size box-color-2"></div>
                      <div>
                        <p className="log-text-room">Relax</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div className=" box-size box-color-3"></div>
                      <div>
                        <p className="log-text-room">Track</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div className=" box-size box-color-4"></div>
                      <div>
                        <p className="log-text-room">Activity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {!providerReportGraph && <div className="mt-3">
          <div className="col-12 patient-num mt-3">
            <div className="n">
              <TabContext value={currentTab}>
                <Box>
                  <TabList
                    className=""
                    onChange={handleTabChange}
                    aria-label="lab API tabs example"
                  >
                    <Tab label="Patient Report" value="Patient Report" />
                    <Tab label="Medicine Report" value="Medicine Report" />
                    <Tab label="Factors" value="Factors" />
                  </TabList>
                </Box>
                <TabPanel value="Patient Report">
                  <EngagementPatientReport
                    state={patientData}
                    handleClickPatientReport={handleClickPatientReport}
                    providerReportGraph={providerReportGraph}
                    patientReport={patientReport}
                    currentTab={currentTab}
                    selectedCategory={selectedCategory}
                    monthData={monthData}
                    weeklyData={weeklyData}
                    tillDateData={tillDateData}
                    dataLine={dataLine}
                    dataLineWeekly={dataLineWeekly}
                    handlePrevMonthPatientReport={handlePrevMonthPatientReport}
                    handleNextMonthPatientReport={handleNextMonthPatientReport}
                    handlePrevFiveMonthPatientReport={handlePrevFiveMonthPatientReport}
                    handleNextFiveMonthPatientReport={handleNextFiveMonthPatientReport}
                    handleNextWeekPatientReport={handleNextWeekPatientReport}
                    handlePrevWeekPatientReport={handlePrevWeekPatientReport}
                    handleCategoryClick={handleCategoryClick}
                    getWeeklyRange={getWeeklyRange}
                    currentWeekStartPatientReport={currentWeekStartPatientReport}
                    currentMonthDatePatient={currentMonthDatePatient}
                    currentTillDateMonth={currentTillDateMonth}
                    minDate={minDate}
                    maxDate={maxDate}
                    patientCreatedAt={patientCreatedAt}
                  />
                </TabPanel>
                <TabPanel value="Medicine Report">
                  <EngagementMedicineReport patientData={patientGraphData} />
                </TabPanel>
                <TabPanel value="Factors">
                  <EngagementFactors patientData={patientGraphData} />
                </TabPanel>
              </TabContext>
            </div>
          </div>
        </div>}



      </div>

    </>
  );
};

export default PatientEngagement;
