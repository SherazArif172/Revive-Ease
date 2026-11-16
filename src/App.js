import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DefaultLayout from "./Components/Layout/Defaultlayout";
import ChangePassword from "./Components/Login/ChangePassword";
import Changed from "./Components/Login/Changed";
import Reset from "./Components/Login/Reset";
import ResetMessage from "./Components/Login/ResetSend";
import ProtectedRoute from "./ProtectedRoute";
import { setRememberedUserData, setAutoLoginAttempted, setUserData } from "./redux/reducers/userReducer";
import { MOCK_ENABLED, mockUser, getMockRole } from "./mocks";

const MOCK_HOME = { admin: "/clinics", "sub admin": "/clinics", coach: "/coachPatients", provider: "/mypatients" };
import { getRememberMeData } from "./utils/cookieUtils";
// eslint-disable-next-line no-unused-vars
const Login = React.lazy(() => import("./Components/Login/Login"));
const DefaultLogin = React.lazy(() =>
  import("./Components/Login/DefaultLogin")
);
import { NotificationProvider } from "./Components/header/Notifications"; 

const LoadingSpinner = () => (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { token, autoLoginAttempted } = useSelector((state) => state.user);

  // TEMP: seed a fake logged-in user for dummy-data preview
  useEffect(() => {
    if (MOCK_ENABLED) {
      const u = mockUser();
      localStorage.setItem("token", u.token);
      dispatch(setUserData(u));
      dispatch(setAutoLoginAttempted(true));
    }
  }, [dispatch]);

  // Auto-login effect
  useEffect(() => {
    if (!token && !autoLoginAttempted) {
      const rememberedData = getRememberMeData();
      
      if (rememberedData) {
        // Set user data from remembered cookies
        dispatch(setRememberedUserData(rememberedData));
        
        // Also set localStorage for compatibility
        localStorage.setItem("token", rememberedData.token);
        if (rememberedData.fcmToken) {
          localStorage.setItem("fcmToken", rememberedData.fcmToken);
        }
      }
      
      // Mark auto-login as attempted
      dispatch(setAutoLoginAttempted(true));
    }
  }, [dispatch, token, autoLoginAttempted]);

  return (
      <NotificationProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<DefaultLogin />}>
                {/* TEMP: login disabled, "/" goes straight to dashboard */}
                {/* <Route index element={<Login />} /> */}
                <Route index element={<Navigate to={MOCK_HOME[getMockRole()] || "/patients"} replace />} />
                <Route path="reset-password" element={<Reset />} />
                <Route path="reset" element={<ResetMessage />} />
                <Route path="change-password/:id?" element={<ChangePassword />} />
                <Route path="changed" element={<Changed />} />
              </Route>
              <Route
                path="*"
                element={<ProtectedRoute element={<DefaultLayout />} />}
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
  );
}

export default App;
