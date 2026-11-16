import { createSlice } from "@reduxjs/toolkit";
const initialState={
    clinics:[],
    clinicListing: [],
    ClinicRecord:[],
    AllClinics : []
};
const addClinics= createSlice({
    name:'clinics',
    initialState,
    reducers:
    {
        setClinicsListing:(state,action)=>{
            state.clinicListing=action.payload;
        },
        setClinicRecord:(state,action)=>{
        state.ClinicRecord=action.payload;
        },
        setAllClinics:(state,action)=>{
            state.AllClinics=action.payload;
            },
    }
});

  export const {setClinicsListing,setClinicRecord , setAllClinics}=addClinics.actions;

  export default addClinics.reducer;