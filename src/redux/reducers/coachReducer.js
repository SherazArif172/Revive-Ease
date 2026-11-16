import { createSlice } from "@reduxjs/toolkit";

const initialState = { 
    coach:[],
    user: [],
    template: [],
    alertLog: [],
    myCoachingNotes: [],
    isInCoachPatient: false,
    isPausePlay: true
};

const allCoachSlice = createSlice({
    name: 'coach',
    initialState,
    reducers: {
        setCoachs: (state, action) => {
            state.coach = action.payload;
        },      
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setTemplate: (state, action) => {
            state.template = action.payload;
        }, 
        setCoachAlertLog: (state, action) => {
            state.alertLog = action.payload;
        },  
        setMyCoachingNotes: (state, action) => {
            state.myCoachingNotes = action.payload;
        },
        setInCoachPatient: (state, action) => {
            state.isInCoachPatient = action.payload;
        },
        setPausePlay: (state, action) => {
            state.isPausePlay = action.payload;
        },
    },
});
export const { setPausePlay, setInCoachPatient, setCoachs, setUser, setTemplate, setCoachAlertMessage, setCoachAlertLog, setMyCoachingNotes } = allCoachSlice.actions;
export default allCoachSlice.reducer;
   