import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import billingSlice from './reducers/billingReducer';
import reportNanalyticsSlice from './reducers/reportAnalyticsReducer';
import { patientSlice } from './apis/allPatient_api';
import allPatientSlice from './reducers/patientReducer';
import allProviderSlice from './reducers/providerReducers';
import allCoachSlice from './reducers/coachReducer';
import patientUseFullResourcesSlice from './reducers/patientUseFullResourcesSlice';
import userReducer from './reducers/userReducer';
import { roleSlice } from './apis/role_api';
import { providerSlice } from './apis/provider_api';
import { coachSlice } from './apis/allCoach_api';
import { chillSlice } from './apis/chill_api';
import { activitySlice } from './apis/activity_api';
import { learnSlice } from './apis/learn_api';
import { tipsSlice } from './apis/tips_api';
import { clinicSlice } from './apis/clinic_api';
import addClinics from '../redux/reducers/clinicReducer';
import { billingPoliciesSlice } from './apis/billingRtm_api';
import { RTMguidelinesSlice } from './apis/guidelinesRtm_api';
import { loginSlice } from './apis/login_api';
import { trainingResourcesSlice } from './apis/trainingResources_api';
import { coachPatientSlice } from './apis/patient_coach_api';
import { mdNotesSlice } from './apis/md_notes_api';
import { billingApi } from './apis/billing_api';
import { notificationApi } from './apis/notification_api';
import { base_url } from '../global/global';
import { reportAnalyticsSlice } from './apis/report_analytics_api';
// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'allPatients'],
};

const appReducer  = combineReducers({
  user: userReducer, // User slice is persisted
  allBilling: billingSlice,
  reportNanlticsListing : reportNanalyticsSlice,
  allPatients: allPatientSlice,
  allProvider: allProviderSlice,
  allCoach: allCoachSlice,
  allClinics: addClinics,
  allPatientUseFullResources: patientUseFullResourcesSlice,
  [patientSlice.reducerPath]: patientSlice.reducer,
  [roleSlice.reducerPath]: roleSlice.reducer,
  [providerSlice.reducerPath]: providerSlice.reducer,
  [coachSlice.reducerPath]: coachSlice.reducer,
  [patientSlice.reducerPath]: patientSlice.reducer,
  [roleSlice.reducerPath]: roleSlice.reducer,
  [chillSlice.reducerPath]: chillSlice.reducer,
  [activitySlice.reducerPath]: activitySlice.reducer,
  [reportAnalyticsSlice.reducerPath]: reportAnalyticsSlice.reducer,
  [learnSlice.reducerPath]: learnSlice.reducer,
  [tipsSlice.reducerPath]: tipsSlice.reducer,
  [clinicSlice.reducerPath]: clinicSlice.reducer,
  [billingPoliciesSlice.reducerPath]: billingPoliciesSlice.reducer,
  [RTMguidelinesSlice.reducerPath]: RTMguidelinesSlice.reducer,
  [loginSlice.reducerPath]: loginSlice.reducer,
  [trainingResourcesSlice.reducerPath]: trainingResourcesSlice.reducer,
  [coachPatientSlice.reducerPath]: coachPatientSlice.reducer,
  [mdNotesSlice.reducerPath]: mdNotesSlice.reducer,
  [billingApi.reducerPath]: billingApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
});

// Root reducer with logout handling
const rootReducer = (state, action) => {
if (action.type === "auth/logout") {
  storage.removeItem("persist:root"); // Clear persisted storage
  return appReducer(undefined, action); // Reset state
}
return appReducer(state, action);
};


// Persist the root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
reducer: persistedReducer,
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
    },
  }).concat(patientSlice.middleware).concat(roleSlice.middleware).concat(providerSlice.middleware).concat(coachSlice.middleware).concat(chillSlice.middleware).concat(activitySlice.middleware).concat(reportAnalyticsSlice.middleware).concat(learnSlice.middleware).concat(tipsSlice.middleware).concat(clinicSlice.middleware).concat(billingPoliciesSlice.middleware).concat(RTMguidelinesSlice.middleware).concat(loginSlice.middleware).concat(trainingResourcesSlice.middleware).concat(coachPatientSlice.middleware).concat(mdNotesSlice.middleware).concat(billingApi.middleware).concat(notificationApi.middleware), devTools: base_url === `https://reviveapi.tactionclients.com/` || `http://localhost:7003/`, 


});

// Create the persistor for rehydration
const persistor = persistStore(store);

setupListeners(store.dispatch);
export { store, persistor };