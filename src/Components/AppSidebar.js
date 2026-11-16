import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { CSidebar, CSidebarBrand, CSidebarNav } from "@coreui/react";

import { AppSidebarNav } from "./AppSidebarNav";

import SimpleBar from "simplebar-react";

import "simplebar-react/dist/simplebar.min.css";
import clinicNavigation from "../_clinicnav";

// sidebar nav config
import navigation from "../_nav";
import coachNavigation from "../_coachNav";
import RVLogo from "../assets/brand/logo/revive_ease_white.png";

const AppSidebar = () => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const userType = useSelector((state) => state.user.userType);
  const sidebarShow = useSelector((state) => state.sidebarShow);



  // Sub admin uses admin nav but without Billing Reports
  const adminNavFiltered = navigation?.filter((item) => item.to !== "/updateBilledStatus") ?? [];
  const userNavigation =
    userType === "admin"
      ? navigation
      : userType === "sub admin"
        ? adminNavFiltered
        : userType === "coach"
          ? coachNavigation
          : userType === "clinic admin"
            ? clinicNavigation
            : null;



  return (
    <CSidebar
      position="fixed"  
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: "set", sidebarShow: visible });
      }}
    >
      <CSidebarBrand className="d-none d-md-flex" to="/"> 
        <span className="sidebar-header me-4">
          <img loading="lazy" src={RVLogo} alt="Logo" width={130} height={70} />
        </span>
      </CSidebarBrand>

      <CSidebarNav>
        <SimpleBar className="">
          <AppSidebarNav items={userNavigation} />
        </SimpleBar>
      </CSidebarNav>
    </CSidebar>
  );
};

export default React.memo(AppSidebar);

