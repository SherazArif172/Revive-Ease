import React from "react";
import {
  AppContent,
  AppSidebar,
  AppHeader,
} from "./Index";
import { useSelector } from "react-redux";

const DefaultLayout = () => {

  const userType = useSelector((state) => state.user.userType);
  return (
    <div>
      {userType !== "provider"   ?  <AppSidebar /> :""}
      <div className="wrapper d-flex flex-column min-vh-100  bg-light">
        <AppHeader/>
        <div className="flex-grow-1 px-3" >
          <AppContent />  
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
