import React, { useState } from "react";
// import MoreVertIcon from "@material-ui/icons/MoreVert";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { useSelector } from "react-redux";
import BillingReports from "./BillingReports";
import MDReports from "./MDReports";
import CoachReports from "./CoachReports";

const ExportManage = () => {
  const userType = useSelector((state) => state?.user?.userType);
  const hideBillingReports = userType === "sub admin";
  const [currentTab, setCurrentTab] = useState("MD Reports");
  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <>
    <div className="default-container ps-3 mt-3  bg-white">
        <div className="  ">
          <TabContext value={currentTab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                className="salman"
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab
                  label="MD Reports"
                  value="MD Reports"
                  className="no-bg-tabs fs-16  font-color"
                />
                {!hideBillingReports && (
                  <Tab
                    label="Billing Reports"
                    value="Billing Reports"
                    className="no-bg-tabs fs-16  font-color"
                  />
                )}
                <Tab
                  label="Coach Report"
                  value="Coach Report"
                  className="no-bg-tabs fs-16  font-color"
                />  
              </TabList>
            </Box>
            <TabPanel value="MD Reports">
              <MDReports />
            </TabPanel>
            {!hideBillingReports && (
              <TabPanel value="Billing Reports">
                <BillingReports/>
              </TabPanel>
            )}
            <TabPanel value="Coach Report">
              <CoachReports />
            </TabPanel>
          </TabContext>
        </div>
      </div>
    </>
  );
};

export default ExportManage;

