import React, { useState } from "react";
// import MoreVertIcon from "@material-ui/icons/MoreVert";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import RTM from "./RTM";
import PatientUseful from "./PatientUseful";

const PolicyReference = () => {
  const [currentTab, setCurrentTab] = useState("RTM");
  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <div className="default-container ps-3 mt-4 bg-white ">
        <TabContext value={currentTab}>
          <Box
            sx={{ borderBottom: 1, borderColor: "divider" }}
            className="salmanss"
          >
            <TabList
              className="salman"
              onChange={handleChange}
              aria-label="lab API tabs example"
            >
              <Tab
                label="RTM"
                value="RTM"
                className="no-bg-tabs fs-16  font-color"
              />
              <Tab
                label="Patient Useful Resources "
                value="Patient Useful Resources"
                className="no-bg-tabs fs-16  font-color"
              />
            </TabList>
          </Box>
          <TabPanel value="RTM">
            <RTM />
          </TabPanel>
          <TabPanel value="Patient Useful Resources">
            <PatientUseful />
          </TabPanel>
        </TabContext>
      </div>
    </>
  );
};

export default PolicyReference;
