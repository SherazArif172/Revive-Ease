import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reportListing: [],
  cptSummaryList : []
};

const reportNanalyticsSlice = createSlice({
  name: "reportNanalytics",
  initialState,
  reducers: {
    setAllReportListing: (state, action) => {
      state.reportListing = action.payload;
    },
    setCptSummaryList: (state, action) => {
      state.cptSummaryList = action.payload;
    },
  },
});

export const { setAllReportListing  , setCptSummaryList} = reportNanalyticsSlice.actions;

export default reportNanalyticsSlice.reducer;
