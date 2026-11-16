import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  provider: [],
  MDNotes: [],
  filteredProviderByClinics: []
};

const allProviderSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {
    setProvider: (state, action) => {
      state.provider = action.payload;
    },
    setMDNotes: (state, action) => {
      state.MDNotes = action.payload;
    },
    setFilteredProviderByClinics: (state, action) => {
      state.filteredProviderByClinics = action.payload;
    },
  },
});

export const { setProvider, setMDNotes, setFilteredProviderByClinics } = allProviderSlice.actions;

export default allProviderSlice.reducer;
