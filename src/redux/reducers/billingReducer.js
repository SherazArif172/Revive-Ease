import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastSessionTime: 0,
  sessionDate: null,
  loading: false,
  coachId: null,
  error: null,
  billingRecords: [],
  billingSummary: [],
  coachRecords: [],
  billingStatus: [],
  cptReports: [],
  createSession: [],
  allSession: [],
  allCallLogs: [],
  billingTab: false,
  billingAgainData: [],
  getRTMBilling: [],
  createdBillStatus : [],
  addCallLog: false
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setTime: (state, action) => {
      state.time = action.payload;
    },

    startSession: (state) => {
      const currentDate = new Date().toISOString().split('T')[0];
      if (state.sessionDate === currentDate) {
        state.time = state.lastSessionTime;
      } else {
        state.time = 0;
        state.sessionDate = currentDate;
      }
      state.isRunning = true;
      state.loading = true;
      state.error = null;
    },

    pauseSession: (state) => {
      // Save the paused time as the last session time
      state.lastSessionTime = state.time;
      state.isRunning = false;
      state.loading = false;
    },

    resetSession: (state) => {
      state.time = 0;
      state.isRunning = false;
      state.loading = false;
      state.error = null;
      state.lastSessionTime = 0; // Reset last session time on reset
    },

    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    setBillingSummary: (state, action) => {
      state.billingSummary = action.payload || [];
    },
    setCreatedBillStatus: (state, action) => {
      state.createdBillStatus = action.payload || [];
    },

    
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    setBillingAllRecords: (state, action) => {
      state.billingRecords = action.payload;
    },
    setBillingStatus: (state, action) => {
      state.billingStatus = action.payload;
    },
    setCptReports: (state, action) => {
      state.cptReports = action.payload;
    },

    setBillingCoachRecords: (state, action) => {
      state.coachRecords = action.payload;
    },
    setCoachId: (state, action) => {
      state.coachId = action.payload;
    },
    setCreatedSession: (state, action) => {
      state.createSession = action.payload;
    },
    setAllSession: (state, action) => {
      state.allSession = action.payload;
    },
    setAllCallLogs: (state, action) => {
      state.allCallLogs = action.payload;
    },
    setBillingTab: (state, action) => {
      state.billingTab = action.payload;
    },
    setBillingAgainData: (state, action) => {
      state.billingAgainData = action.payload;
    },
    setGetRTMBilling: (state, action) => {
      state.getRTMBilling = action.payload;
    },
    setAddCallLog: (state, action) => {
      state.addCallLog = action.payload;
    }
  },
});

export const {
  startSession,
  pauseSession,
  setTime,
  resetSession,
  startLoading,
  setError,
  setBillingAllRecords,
  setCoachId,
  setBillingSummary,
  setBillingStatus,
  setCptReports,
  setBillingCoachRecords,
  setCreatedSession,
  setAllSession,
  setAllCallLogs,
  setBillingTab,
  setBillingAgainData,
  setGetRTMBilling,
  setAddCallLog,
  setCreatedBillStatus
} = billingSlice.actions;

export default billingSlice.reducer;
