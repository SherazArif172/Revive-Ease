import React, { useState } from "react";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import ClinicalLog from "./ClinicalLogs";
import AlertLog from "./AlertLog";

const Log = ({patientId, patientData , patientDetailLoading}) => {
  const patient_id=patientId;
  const [currentTab , setCurrentTab] = useState("Clinical Log");
  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <div className="default-container ps-3 mt-3  bg-white">
        <div className="   ">
          <TabContext value={currentTab}  >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="salmanss">
              <TabList
                className="salman"
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab label="Clinical Log" value="Clinical Log"  className="no-bg-tabs fs-16  font-color capitalize-tab"/>
                <Tab label="Alert Log " value="Active Log"  className="no-bg-tabs fs-16  font-color capitalize-tab"/>
              </TabList>
            </Box>
            <TabPanel value="Clinical Log">
             <ClinicalLog patientId={patient_id} patientData = {patientData} patientDetailLoading = {patientDetailLoading}/>  
            </TabPanel>
            <TabPanel value="Active Log">
              <AlertLog patientData={patientData}/>
            </TabPanel>
          </TabContext>
        </div>
      </div>
    </>
  );
};
export default Log;