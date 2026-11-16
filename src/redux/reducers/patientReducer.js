import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patients: [],
  patient: [],
  clinic_id: [],
  patientsGraph: [],
  signOffPatients : [],
  allAuditLogs: [],
  closeWatchList:[]
};

const allPatientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setPatients: (state, action) => {
      state.patients = action.payload;
    },
    setPatientsById:(state, action)=>{
      state.patient = action.payload;
    },
    setClinicId:(state, action)=>{
      state.clinic_id = action.payload;
    },
    setAllPatientsGraph: (state, action)=>{
      state.patientsGraph = action.payload;
    },
    setSignOffPatients: (state, action)=>{
      state.signOffPatients = action.payload;
    },
    setAllAuditLogs: (state, action) => {
      state.allAuditLogs = action.payload;
    },
    setCloseWatchList: (state, action) => {
      state.closeWatchList = action.payload;
    }
  },
});

export const { setPatients, setPatientsById, setClinicId, setAllPatientsGraph , setSignOffPatients, setAllAuditLogs , setCloseWatchList} = allPatientSlice.actions;

export default allPatientSlice.reducer;
