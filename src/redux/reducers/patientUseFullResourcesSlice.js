import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    chillData: [],
    activityData: [],
    learnData: [],
    tipsData: [],
    billingPolicies: [],
    rtmGuidelines: [],
    trainingResources: [],
    categoryData:[]
};

const patientUseFullResourcesSlice = createSlice({
  name: 'patientUseFullResources',
  initialState,
  reducers: {
    setChill: (state, action) => {
      state.chillData = action.payload;
    },
    setActivity: (state, action) => {
      state.activityData = action.payload;
    },
    setLearn: (state, action) => {
      state.learnData = action.payload;
    },
    setTips: (state, action) => {
      state.tipsData = action.payload;
    },
    setBillingPolicies: (state, action) => {
      state.billingPolicies = action.payload;
    },
    setRtmGuidelines: (state, action) => {
      state.rtmGuidelines = action.payload;
    },
    setTrainingResources: (state, action) => {
      state.trainingResources = action.payload;
    },
    setCategoryData: (state, action) => {
      state.categoryData = action.payload;
    }
  },
});

export const { setChill, setActivity, setLearn, setTips, setBillingPolicies, setRtmGuidelines, setTrainingResources, setCategoryData } = patientUseFullResourcesSlice.actions;

export default patientUseFullResourcesSlice.reducer;
