import { CSVLink } from "react-csv";
import { formatDate } from "../../../../../utils/dateUtils";

const DownloadCSV = ({ selectedCPTs, firstRecord, patient }) => {
  if (!firstRecord || Object.keys(firstRecord).length === 0) {
    return <button className="btn disabled fw-bold mx-2">No Data</button>;
  }


  // Common data for all reports
  const commonData = {
    patientName: `${patient?.last_name || ""} ${patient?.middle_name || ""}${patient?.first_name || ""}`,
    providerName: `${patient?.providerName?.last_name || ""} ${patient?.providerName?.middle_name || ""} ${patient?.providerName?.first_name || ""}`,
    monthOfService: formatDate(`${firstRecord?.billing_month}-01`, "MMMM"),
    applicationUsed: "Revive, a chronic pain management platform (mobile app)"
  };

  // Generate data for each CPT code
  const generateReportData = (cptCode) => {
    switch (cptCode) {
      case "98975":
        return [
          ["Remote Therapeutic Monitoring (RTM) Documentation - Initial Set-Up and Patient Education (CPT Code: 98975)", ""],
          ["Patient:", commonData.patientName],
          ["Assigned Provider:", commonData.providerName],
          ["Set-Up Date:", formatDate(patient?.created_at)],
          ["Patient Activation Date:", formatDate(patient?.created_at)],
          ["Application Used:", commonData.applicationUsed],
          ["Patient Information:", ""],
          ["Email:", patient?.Email || "[Patient Email]"],
          ["Instructions Provided:", ""],
          ["", "Specific Instructions for login to the account via instant message and email."],
          ["", "Detailed setup instructions included written education, verbal education, and automated messaging."],
          ["", "Guidance on initial data input into the software."],
          ["Device Set-Up:", ""],
          ["", "Application configuration and synchronization with patient's health records."],
          ["", "Initial test to ensure accurate data collection and transmission."],
          ["Monitoring Period:", `At least 16 days following the first patient interaction on ${formatDate(patient?.created_at)}`]
        ];

      case "98977":
        return [
          ["Cost of Musculoskeletal Monitoring Device (CPT Code: 98977)", ""],
          ["Month of Service:", commonData.monthOfService],
          ["Monitoring Period:", `${firstRecord?.taskDaysUsedFor98977 || 0} Day's`],
          ["Total Logins:", `${firstRecord?.loginDaysCount || 0} Day's`],
          ["Responses Collected:", ""],
          ...(patient?.customize_keys?.length > 0
            ? patient.customize_keys.map(key => ["", key])
            : [["", "No responses collected"]]),
          ["Number of Activities Completed:", `${firstRecord?.video_duration_minutes || 0} Minutes`],
          ["Device Provided:", ""],
          ["Name:", commonData.applicationUsed]
        ];

      case "98980": {
        const totalOverallMinutes98980 = firstRecord?.totaloveralltime || 0;
        // Match PDF phrasing/spacing: "total of  51 minutes"
        const overallTimeText98980 = `total of  ${totalOverallMinutes98980} minutes`;
        const baseRows = [
          ["Monitoring and Interactive Communication (CPT Code: 98980)", ""],
          ["Month of Service:", commonData.monthOfService],
          ["Overall Total Time:", overallTimeText98980],
          ["Monitoring Time:", (firstRecord?.totalmonitoringtime || 0)],
          ["Internal Messaging:", `${patient?.messageCount || 0}`],
          ["Education Guidance Provided:", "Exercise routines and pain management techniques"],
          ["Synchronous Conversations:", `${firstRecord?.totalSyncCalls || 0}`],
          [""],
          ["Synchronous Call History", ""]
        ];

        const callEntries = [];

        firstRecord?.callDetails?.forEach((session) => {
          if (session.call_logs?.length > 0) {
            session.call_logs.forEach((log) => {
              callEntries.push(["Date:", formatDate(log.called_on)]);
              callEntries.push(["Duration:", `${Math.floor(log.duration / 60)} minutes`]);
              callEntries.push(["Summary:", log.remark || "No summary provided"]);
              callEntries.push(["", ""]); // spacer row
            });
          } else if (session.call_time > 0) {
            callEntries.push(["Date:", formatDate(session.session_date)]);
              callEntries.push(["Duration:", `${Math.floor(session.call_time / 60)} minutes`]);
              callEntries.push(["Summary:", "No specific call log available"]);
              callEntries.push(["", ""]);
          }
        });

        return [...baseRows, ...callEntries];
      }

      case "98981":
        return [
          ["Extra 20-Minutes Monitoring (CPT Code: 98981)", ""],
          ["Month of Service:", commonData.monthOfService],
          ["Total Extra Time:", firstRecord?.cptReport?.find(c => c.code === "98981")?.criteria || "Not specified"],
          ["Units Billed:", firstRecord?.cptReport?.find(c => c.code === "98981")?.units || 0]
        ];

      case "98979": {
        const totalOverallMinutes98979 = firstRecord?.totaloveralltime || 0;
        // Match PDF phrasing/spacing: "total of  51 minutes"
        const overallTimeText98979 = `total of  ${totalOverallMinutes98979} minutes`;
        const baseRows = [
          ["Monitoring 10-19 Min (CPT Code: 98979)", ""],
          ["Month of Service:", commonData.monthOfService],
          ["Overall Total Time:", overallTimeText98979],
          ["Monitoring Time:", (firstRecord?.totalmonitoringtime || 0)],
          ["Internal Messaging:", `${patient?.messageCount || 0}`],
          ["Education Guidance Provided:", "Exercise routines and pain management techniques"],
          ["Synchronous Conversations:", `${firstRecord?.totalSyncCalls || 0}`],
          [""],
          ["Synchronous Call History", ""]
        ];

        const callEntries = [];

        firstRecord?.callDetails?.forEach((session) => {
          if (session.call_logs?.length > 0) {
            session.call_logs.forEach((log) => {
              callEntries.push(["Date:", formatDate(log.called_on)]);
              callEntries.push(["Duration:", `${Math.floor(log.duration / 60)} minutes`]);
              callEntries.push(["Summary:", log.remark || "No summary provided"]);
              callEntries.push(["", ""]); // spacer row
            });
          } else if (session.call_time > 0) {
            callEntries.push(["Date:", formatDate(session.session_date)]);
            callEntries.push(["Duration:", `${Math.floor(session.call_time / 60)} minutes`]);
            callEntries.push(["Summary:", "No specific call log available"]);
            callEntries.push(["", ""]);
          }
        });

        return [...baseRows, ...callEntries];
      }

      case "98985":
        return [
          ["Data Transmission (2-15 days) (CPT Code: 98985)", ""],
          ["Month of Service:", commonData.monthOfService],
          ["Task Days in Last 30 Days:", (() => {
            const criteria = firstRecord?.cptReport?.find(c => c.code === "98985")?.criteria;
            if (!criteria) return "Not specified";
            const match = criteria.match(/:\s*(\d+)/);
            return match ? match[1] : "Not specified";
          })()],
          ["Monitoring Period:", "2-15 days of data transmission out of 30 days"],
          ["Total Logins:", `${firstRecord?.loginDaysCount || 0} Day's`],
          ["Responses Collected:", ""],
          ...(patient?.customize_keys?.length > 0
            ? patient.customize_keys.map(key => ["", key])
            : [["", "No responses collected"]]),
          ["Number of Activities Completed:", `${firstRecord?.video_duration_minutes || 0} Minutes`],
          ["Device Provided:", ""],
          ["Name:", commonData.applicationUsed]
        ];

      default:
        return [];
    }
  };

  const uniqueCPTs = firstRecord?.cptReport
    ?.filter(cpt => selectedCPTs.includes(cpt.code))
    ?.map(cpt => cpt.code) || [];

  // Combine all selected CPT reports with separators
  const csvData = uniqueCPTs.reduce((acc, cptCode, index) => {
    const reportData = generateReportData(cptCode);
    if (reportData.length > 0 && index > 0) {
      acc.push([""], [""]); // Add empty rows between reports
    }
    return [...acc, ...reportData];
  }, []);

  const isDisabled = selectedCPTs?.length === 0;

  return (
    <CSVLink
      data={csvData}
      filename={`MD_Report_${formatDate(new Date(), "yyyyMMdd_HHmmss")}.csv`}
      className={`btn add-practs-btn fw-bold flex-items-center mx-2 ${isDisabled ? "disabled" : ""
        }`}
      onClick={(event) => {
        if (isDisabled) {
          event.preventDefault();
        }
      }}
    >
      <i className="fas fa-file-csv me-2"></i> Download as CSV
    </CSVLink>
  );
};

export default DownloadCSV;