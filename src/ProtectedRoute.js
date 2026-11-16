import React from "react";
import { useSelector } from "react-redux";
// eslint-disable-next-line no-unused-vars
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  // eslint-disable-next-line no-unused-vars
  const { token, autoLoginAttempted } = useSelector((state) => state?.user);

  // Show loading while auto-login is being attempted
  if (!autoLoginAttempted) {
    return (
      <div className="pt-3 text-center">
        <div className="sk-spinner sk-spinner-pulse"></div>
      </div>
    );
  }

  // TEMP: auth check disabled to preview dashboard pages
  // return token ? element : <Navigate to="/" replace />;
  return element;
};

export default ProtectedRoute;
