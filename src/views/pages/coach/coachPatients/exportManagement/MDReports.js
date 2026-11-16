import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetCptReportsQuery } from "../../../../../redux/apis/billing_api";
// import jsPDF from "jspdf";
import DownloadPDF from "./DownloadPDF";
import { formatDate } from "../../../../../utils/dateUtils";
import DownloadCSV from "./DownloadCSV";
import { CSpinner } from "@coreui/react/dist/esm";

const MDReports = () => {
  const patientId = useSelector(
    (state) => state?.allPatients?.patient?.patientData?._id
  );
  const { data, isLoading } = useGetCptReportsQuery({ patient_id: patientId});

  const [selectedCPTs, setSelectedCPTs] = useState([]);

  if (isLoading) {
    return (
      <div className="flex-items-center my-5">
        <CSpinner color="success" />
      </div>);
  }

  const billingSummary = data?.data || [];
  const existCPTSlast = data?.data;
  const existCPTSlastIndex = existCPTSlast[existCPTSlast?.length - 1];
  const existCPTS = existCPTSlastIndex?.cptCodes;
  //
  // Extract first billing record for display
  const firstRecord = billingSummary[billingSummary?.length - 1] || {};
  const patient = firstRecord?.patient || {};
  const provider = patient?.providerName || {};



  const handleCheckboxChange = (cptCode) => {
    setSelectedCPTs((prevSelected) =>
      prevSelected.includes(cptCode)
        ? prevSelected.filter((code) => code !== cptCode)
        : [...prevSelected, cptCode]
    );
  };

  const handleSelectAll = () => {
    if (selectedCPTs?.length === existCPTS?.length) {
      setSelectedCPTs([]); // Deselect all if already selected
    } else {
      setSelectedCPTs(existCPTS || []); // Select all
    }
  };

  const handleClear = () => {
    setSelectedCPTs([]); // Deselect all if already selected
  };

  return (
    <>
      {existCPTS === undefined || existCPTS?.length < 1 ? (
        <span className="flex-items-center mt-4">No Billed Session</span>
      ) : (
        <div className="default-container">
          <div className="row">
            <>
              <div className="col-6">
                <h6 className="text-MD fw-bold">
                  Remote Therapeutic Monitoring (RTM) Documentation
                </h6>
                <p>Select one or more Reports to update</p>
                <div className="d-flex">
                  <input
                    className="mt-1"
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "15px",
                    }}
                    type="checkbox"
                    checked={selectedCPTs?.length === existCPTS?.length}
                    onChange={handleSelectAll}
                  />
                  <div>Select All</div>
                </div>
              </div>
              <div
                className="col-12 mt-2"
                style={{ border: "1px solid #CCCCCC" }}
              ></div>
            </>

            {existCPTS?.includes("98975") && (
              <>
                <div className="d-flex mt-4">
                  <input
                    className="mt-1"
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "15px",
                    }}
                    type="checkbox"
                    checked={selectedCPTs.includes("98975")}
                    onChange={() => handleCheckboxChange("98975")}
                  />
                  <div className="">
                    Initial Set-Up and Patient Education (CPT Code: 98975)
                  </div>
                </div>
                <form>
                  <div className="mt-3">
                    <div className="form-group">
                      <label className="md-report-label">Patient:</label>
                      <span>
                        {" "}
                        {patient.last_name} {patient.middle_name} {patient.first_name}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="md-report-label pe-2">
                        Assigned Provider:
                      </label>
                      <span>
                        {""}
                        {provider.last_name} {provider.middle_name} {provider.first_name}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="md-report-label pe-2">
                        Set-Up Date:
                      </label>
                      <span className="pe-2">
                        {""}
                        {formatDate(patient?.created_at, "MM/dd/yyyy")}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="md-report-label pe-2">
                        Patient Activation Date:
                      </label>
                      <span>
                        {""}
                        {formatDate(patient?.created_at, "MM/dd/yyyy")}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="md-report-label pe-2">
                        Application Used:
                      </label>
                      <span>
                        Revive, a chronic pain management platform (mobile app)
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="md-report-label pe-2">
                        Patient Information:
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="md-report-label pe-2">Email:</label>
                      <span>{patient.Email || "[Patient Email]"}</span>
                    </div>
                    <div className="form-group">
                      <label className="md-report-label pe-2">
                        Instructons Provided:
                      </label>
                      <p>
                        Specific Instructions for login to the account via
                        instant message and email.
                        <p>
                          Detailed setup instructions included written
                          eductation,verbal education,and automated messaging.
                          <p>
                            Guidance on initial data input into the software.
                          </p>
                        </p>
                      </p>
                    </div>
                    <div className="form-group">
                      <label className="md-report-label pe-2">
                        Device Set-Up:
                      </label>
                      <p>
                        <p>
                          Application configuration and synchronization with
                          patient's health records.
                          <p>
                            initial test to ensure accurate data collection and
                            transmission.
                            <p>
                              <lablel>Monitoring Period:</lablel>
                              At least 16 days following the first patient
                              interaction on{" "}
                              {formatDate(
                                patient?.created_at,
                                "MM/dd/yyyy"
                              )}
                            </p>
                          </p>
                        </p>
                      </p>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>

          {existCPTS?.includes("98977") && (
            <>
              <div className="d-flex mt-4">
                <input
                  className="mt-1"
                  style={{ width: "20px", height: "20px", marginRight: "15px" }}
                  type="checkbox"
                  checked={selectedCPTs.includes("98977")}
                  onChange={() => handleCheckboxChange("98977")}
                />
                <div className="">
                  Cost of Musculoskeletal Monitoring Device (CPT Code: 98977)
                </div>
              </div>
              <form>
                <div className="mt-3">
                  <div className="form-group">
                    <label className="md-report-label">Month of Service:</label>
                    {billingSummary && (
                      <span>
                        {formatDate(`${firstRecord?.billing_month}-01`, "MMMM")}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="md-report-label">
                      Monitoring Period:
                    </label>
                    <span> {firstRecord.taskDaysUsedFor98977} Day's</span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label">Total Logins:</label>
                    <span> {firstRecord.loginDaysCount} Day's</span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label">
                      Responses Collected:
                    </label>{" "}
                    {patient?.customize_keys &&
                      patient?.customize_keys?.length > 0 ? (
                      <ul className="pe-none">
                        {patient?.customize_keys?.map((key, index) => (
                          <li key={index}>{key}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No responses collected</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="md-report-label">
                      Number of Activities Completed:
                    </label>
                    <span> {firstRecord.video_duration_minutes} Minutes</span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Device Provided:
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">Name:</label>
                    <span>Revive, a chronic pain management platform (mobile app)</span>
                  </div>
                </div>
              </form>
            </>
          )}

          {existCPTS?.includes("98980") && (
            <>
              <div className="d-flex mt-4">
                <input
                  className="mt-1"
                  style={{ width: "20px", height: "20px", marginRight: "15px" }}
                  type="checkbox"
                  checked={
                    selectedCPTs.includes("98980")
                  }
                  onChange={() =>
                    handleCheckboxChange("98980")
                  }
                />
                <div className="">
                  Monitoring and Interactive Communication (CPT Code: 98980)
                </div>
              </div>
              <form>
                <div className="mt-3">
                  <div className="form-group">
                    <label className="md-report-label">Month of Service:</label>
                    {billingSummary && (
                      <span>
                        {formatDate(`${firstRecord.billing_month}-01`, "MMMM")}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Overall Total Time in <span>{formatDate(`${firstRecord.billing_month}-01`, "MMMM")}</span>   :
                    </label>
                    {billingSummary && (
                      <span>
                        {""}
                        {firstRecord?.totaloveralltime || 0}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Monitoring Time:
                    </label>
                    <span>
                      {firstRecord?.totalmonitoringtime || 0}
                    </span>
                  </div>
                  
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Internal Messaging:
                    </label>
                    <span>{patient.messageCount}</span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Education Guidance Provided:
                    </label>
                    <span>
                      Exercise routines and pain management techniques
                    </span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Synchronous Conversations:
                    </label>
                    <span> {firstRecord?.totalSyncCalls}</span>
                  </div>
                  {firstRecord?.callDetails?.length > 0 && (
                    <div className="mt-4">
                      <h6 className="fw-bold">Synchronous Call Details:</h6>
                      {firstRecord.callDetails.flatMap((session) => {
                        if (session.call_logs?.length > 0) {
                          return session.call_logs.map((log, i) => (
                            <div key={log._id || i} className="border rounded p-3 mb-3">
                              <div><strong>Date:</strong> {formatDate(log.called_on, "MM/dd/yyyy")}</div>
                              <div><strong>Duration:</strong> {Math.floor(log.duration / 60)} minutes</div>
                              <div><strong>Summary:</strong> {log.chart_notes}</div>
                            </div>
                          ));
                        } else {
                          return (
                            <div key={session.session_id} className="border rounded p-3 mb-3 text-muted">
                              <div><strong>Date:</strong> {formatDate(session.session_date, "MM/dd/yyyy")}</div>
                              <div><strong>Duration:</strong> {Math.floor(session.call_time / 60)} minutes</div>
                              <div><strong>Summary:</strong> No specific call Remark available</div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              </form>
            </>
          )}
          {existCPTS?.includes("98981") && (
            <>
              <div className="d-flex mt-4">
                <input
                  className="mt-1"
                  style={{ width: "20px", height: "20px", marginRight: "15px" }}
                  type="checkbox"
                  checked={selectedCPTs.includes("98981")}
                  onChange={() => handleCheckboxChange("98981")}
                />
                <div className="">
                  Extra 20-Minutes Monitoring (CPT Code: 98981)
                </div>
              </div>
              <form>
                <div className="mt-3">
                  <div className="form-group">
                    <label className="md-report-label">Month of Service:</label>
                    <span>{formatDate(`${firstRecord.billing_month}-01`, "MMMM")}</span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">Total Extra Time:</label>
                    <span>
                      {
                        firstRecord?.cptReport?.find(c => c.code === "98981")?.criteria
                        || "Not specified"
                      }
                    </span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">Units Billed:</label>
                    <span>
                      {firstRecord?.cptReport?.find(c => c.code === "98981")?.units || 0}
                    </span>
                  </div>
                </div>
              </form>
            </>
          )}

          {existCPTS?.includes("98979") && (
            <>
              <div className="d-flex mt-4">
                <input
                  className="mt-1"
                  style={{ width: "20px", height: "20px", marginRight: "15px" }}
                  type="checkbox"
                  checked={selectedCPTs.includes("98979")}
                  onChange={() => handleCheckboxChange("98979")}
                />
                <div className="">
                  Monitoring 10-19 Min (CPT Code: 98979)
                </div>
              </div>
              <form>
                <div className="mt-3">
                  <div className="form-group">
                    <label className="md-report-label">Month of Service:</label>
                    {billingSummary && (
                      <span>
                        {formatDate(`${firstRecord?.billing_month}-01`, "MMMM")}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Overall Total Time in <span>{formatDate(`${firstRecord.billing_month}-01`, "MMMM")}</span>   :
                    </label>
                    {billingSummary && (
                      <span>
                        {""}
                        {firstRecord?.totaloveralltime || 0}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Monitoring Time:
                    </label>
                    <span>
                      {firstRecord?.totalmonitoringtime || 0}
                    </span>
                  </div>
                 
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Internal Messaging:
                    </label>
                    <span>{patient.messageCount}</span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Education Guidance Provided:
                    </label>
                    <span>
                      Exercise routines and pain management techniques
                    </span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Synchronous Conversations:
                    </label>
                    <span> {firstRecord?.totalSyncCalls}</span>
                  </div>
                  {firstRecord?.callDetails?.length > 0 && (
                    <div className="mt-4">
                      <h6 className="fw-bold">Synchronous Call Details:</h6>
                      {firstRecord.callDetails.flatMap((session) => {
                        if (session.call_logs?.length > 0) {
                          return session.call_logs.map((log, i) => (
                            <div key={log._id || i} className="border rounded p-3 mb-3">
                              <div><strong>Date:</strong> {formatDate(log.called_on, "MM/dd/yyyy")}</div>
                              <div><strong>Duration:</strong> {Math.floor(log.duration / 60)} minutes</div>
                              <div><strong>Summary:</strong> {log?.chart_notes}</div>
                            </div>
                          ));
                        } else {
                          return (
                            <div key={session.session_id} className="border rounded p-3 mb-3 text-muted">
                              <div><strong>Date:</strong> {formatDate(session.session_date, "MM/dd/yyyy")}</div>
                              <div><strong>Duration:</strong> {Math.floor(session.call_time / 60)} minutes</div>
                              <div><strong>Summary:</strong> No specific call Remark available</div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              </form>
            </>
          )}

          {existCPTS?.includes("98985") && (
            <>
              <div className="d-flex mt-4">
                <input
                  className="mt-1"
                  style={{ width: "20px", height: "20px", marginRight: "15px" }}
                  type="checkbox"
                  checked={selectedCPTs.includes("98985")}
                  onChange={() => handleCheckboxChange("98985")}
                />
                <div className="">
                  Data Transmission (2-15 days) (CPT Code: 98985)
                </div>
              </div>
              <form>
                <div className="mt-3">
                  <div className="form-group">
                    <label className="md-report-label">Month of Service:</label>
                    {billingSummary && (
                      <span>
                        {formatDate(`${firstRecord?.billing_month}-01`, "MMMM")}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="md-report-label">
                      Task Days in Last 30 Days:
                    </label>
                    <span>
                      {
                        (() => {
                          const criteria = firstRecord?.cptReport?.find(c => c.code === "98985")?.criteria;
                          if (!criteria) return "Not specified";
                          // Extract number after colon (e.g., "Task days in last 30 days: 5" -> 5)
                          const match = criteria.match(/:\s*(\d+)/);
                          return match ? ` ${match[1]}` : "Not specified";
                        })()
                      }
                    </span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label">
                      Monitoring Period:
                    </label>
                    <span> 
                      {
                        firstRecord?.cptReport?.find(c => c.code === "98985")?.description 
                        || "2-15 days of data transmission out of 30 days"
                      }
                    </span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label">Total Logins:</label>
                    <span> {firstRecord.loginDaysCount} Day's</span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label">
                      Responses Collected:
                    </label>{" "}
                    {patient?.customize_keys &&
                      patient?.customize_keys?.length > 0 ? (
                      <ul className="pe-none">
                        {patient?.customize_keys?.map((key, index) => (
                          <li key={index}>{key}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No responses collected</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="md-report-label">
                      Number of Activities Completed:
                    </label>
                    <span> {firstRecord.video_duration_minutes} Minutes</span>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">
                      Device Provided:
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="md-report-label pe-2">Name:</label>
                    <span>Revive, a chronic pain management platform (mobile app)</span>
                  </div>
                </div>
              </form>
            </>
          )}
          {(existCPTS?.includes("98975") ||
            existCPTS?.includes("98977") ||
            existCPTS?.includes("98980") ||
            existCPTS?.includes("98981") ||
            existCPTS?.includes("98979") ||
            existCPTS?.includes("98985")) && (
              <div className="d-flex justify-content-end mt-3">
                <button className=" rv-reset-cancel" onClick={handleClear}>
                  Cancel
                </button>
                <DownloadPDF
                  selectedCPTs={selectedCPTs}
                  patient={patient}
                  firstRecord={firstRecord}
                />
                <DownloadCSV
                  selectedCPTs={selectedCPTs}
                  firstRecord={firstRecord}
                  patient={patient}
                />
              </div>
            )}
        </div>
      )}
    </>
  );
};

export default MDReports;
