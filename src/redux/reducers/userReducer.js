import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: null,
  userType: null,
  token: null,
  id: null,
  userData: null,
  user_id: null,
  profileData: null,
  fcmToken: null,
  isRemembered: false,
  autoLoginAttempted: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const { email, userType, token, id, userData, user_id, fcmToken, isRemembered } = action.payload;
      state.email = email;
      state.userType = userType;
      state.token = token;
      state.id = id;
      state.user_id = user_id;
      state.userData = userData;
      state.fcmToken = fcmToken;
      state.isRemembered = isRemembered || false;
    },
    setRememberedUserData: (state, action) => {
      const { email, userType, token, id, userData, fcmToken } = action.payload;
      state.email = email;
      state.userType = userType;
      state.token = token;
      state.id = id;
      state.userData = userData;
      state.fcmToken = fcmToken;
      state.isRemembered = true;
    },
    setAutoLoginAttempted: (state, action) => {
      state.autoLoginAttempted = action.payload;
    },
    setProfileData: (state, action) => {
      state.profileData = action.payload;
    },   
    logout: () => {
      return initialState;
    },
  },
});

export const { setUserData, setRememberedUserData, setAutoLoginAttempted, logout, setProfileData } = userSlice.actions;
export default userSlice.reducer;
