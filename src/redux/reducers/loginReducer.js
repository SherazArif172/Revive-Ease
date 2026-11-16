import { createSlice } from "@reduxjs/toolkit";

const initialState={
    login:[],
    updateProfile:[]
};

const allLoginSlice=createSlice({
    name:'login',
    initialState,
    reducers:{
        setLogin:(state,action)=>{
          state.login=action.payload;
        },
        setUpdateProfile:(state,action)=>{
          state.updateProfile=action.payload;
        },
        setLogout: () => {
          return initialState; 
      }
    }
});
export  const {setLogin,setUpdateProfile, setLogout}=allLoginSlice.actions;
export default allLoginSlice.reducer;