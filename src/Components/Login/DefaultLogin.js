import React from "react";
import { Outlet } from "react-router-dom";

const DefaultLogin = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-sm-6 col-md-6 intro-section">
          <div className="brand-wrapper">
          </div>
        </div>

        <div className="col-sm-6 col-md-6 form-section">
          <div className="login-wrapper">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultLogin;
