import { CAvatar } from "@coreui/react";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PhoneIcon from "../../../../assets/icons/call.png";
import BackArrow from "../../../../assets/icons/backArrow.png";
import MessageIcon from "../../../../assets/icons/message-orange.png";
import Billing from "./Billing";
import CurrentJourney from "./CurrentJourney";
import PatientInfo from "./PatientInfo";
import ExportManage from "./exportManagement/ExportManage";
import Log from "./Log";
import PatientEngagement from "./PatientEngagement";
import Communication from "./Communication";
import {
  useAssignCoachProviderToPatientMutation,
  useGetAllPatientQuery,
  useGetPatientByIdQuery,
} from "../../../../redux/apis/allPatient_api";
import { useDispatch, useSelector } from "react-redux";
import ContactEmail from "./ContactEmail";
import { base_url } from "../../../../global/global";
import PatientCallCanvas from "./PatientCallCanva";
import MyCoachNote from "./MyCoachNote";
import EscalationForm from "../coachPatients/EscalationForm";
import Outcome from "../coachPatients/OutcomeCoach";

const CoachPatientDetail = () => {
  const userType = useSelector((state) => state.user.userType);
  const showViewOnly = userType === "admin" || userType === "sub admin" || userType === "clinic admin";
  const hideBilling = userType === "sub admin";

  // Conditionally import Timer and coach actions for non-admin users
  let Timer = null;
  let setInCoachPatient = null;
  let setPausePlay = null;

  if (!showViewOnly) {
    Timer = require("./Timer").default;
    const coachActions = require("../../../../redux/reducers/coachReducer");
    setInCoachPatient = coachActions.setInCoachPatient;
    setPausePlay = coachActions.setPausePlay;
  }

  const patientData = useSelector(
    (state) => state?.allPatients?.patient?.patientData
  );
  const coachIfExist = patientData?.coach?.id ? patientData.coach?._id : null;
  const activeBillingTab = useSelector(
    (state) => state?.allBilling?.billingTab
  );

  const isCallLogAdd = useSelector((state) => state?.allBilling?.addCallLog);
  const callTime = patientData?.last_call?.duration;
  const { state: locationState } = useLocation();
  const patient_id = locationState?._id || locationState?.patientId;

  // Use a ref to track the current patient ID
  const currentPatientIdRef = useRef(patient_id);

  const [contactCanva, setContactCanva] = useState(false);
  const [PatientCallCanva, setPatientCallCanva] = useState(false);
  const [notesSubTab, setNotesSubTab] = useState("Coach Notes");
  const [currentTab, setCurrentTab] = useState(
    locationState?.openChat
      ? "Communication"
      : locationState?.openMDNotes
        ? "My Coach Note" // "Notes" tab's actual value is "My Coach Note"
        : activeBillingTab === true && userType !== "sub admin"
          ? "Billing"
          : "Patient Info"
  );

  useEffect(() => {
    if (locationState?.openMDNotes) {
      setNotesSubTab("MD Notes");
      setCurrentTab("My Coach Note"); // ensure the Notes tab is selected
    }
  }, [locationState?.openMDNotes]);

  const handleNotesSubTabChange = (event, newValue) => {
    setNotesSubTab(newValue);
  };

  const user_id = useSelector((state) => state?.user?.id);
  const actorType = useSelector((state) => state?.user?.userType);

  const [billingId, setBillingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [escalationForm, setEscalationForm] = useState(false);
  const assignedtasks = useSelector(
    (state) => state?.allPatients?.patient?.pagination?.assignedTasks
  );
  const assignedTaskJourney = useSelector(
    (state) => state?.allPatients?.patient?.pagination?.assignedTaskJourney
  );

  const [esclatePatient, { isSuccess: esclatePatientSuccess }] = useAssignCoachProviderToPatientMutation();

  const observedDivRef = useRef(null);
  const resizingDelayTimer = useRef(null);

  const isInCoachPatient = useSelector(
    (state) => state?.allCoach?.isInCoachPatient
  );
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    called_on: new Date(),
    duration: "",
    chart_notes: "",
    personal_notes: "",
  });

  const { refetch, isLoading: patientDetailLoading } = useGetPatientByIdQuery({
    id: patient_id,
    patientInfoTab: "patientInfo",
    page: currentPage,
    rowsPerPage: rowsPerPage,
    currentTab: currentTab === "Current Journey" ? "Current Journey" : "Approved",
    graphType: "Login_data",
    actorId: user_id,
    actorType: actorType,
  });

  const first_names = patientData?.first_name;
  const middle_names = patientData?.middle_name;
  const last_names = patientData?.last_name;

  const { refetch: patientRefetch, isLoading: getAllPatientIsLoading } = useGetAllPatientQuery();

  const profile_pic = patientData?.profile_img;

  const dispatch = useDispatch();

  // Get coach_id from patient data
  const coach_id = patientData?.coach?._id || null;

  // Reset billing ID when patient changes
  useEffect(() => {
    if (currentPatientIdRef.current !== patient_id) {
      setBillingId(null);
      currentPatientIdRef.current = patient_id;
    }
  }, [patient_id]);

  useEffect(() => {
    return () => {
      if (setPausePlay) {
        dispatch(setPausePlay(true));
      }
    };
  }, [dispatch]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      clearTimeout(resizingDelayTimer.current);
      resizingDelayTimer.current = setTimeout(() => {
        if (observedDivRef.current) {
          // This is intentionally left empty since we don't need containerWidth
        }
      }, 100);
    });

    if (observedDivRef.current) {
      observer.observe(observedDivRef.current);
    }

    return () => {
      if (observer && observedDivRef.current)
        observer.unobserve(observedDivRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentPage > 0 && rowsPerPage > 0) {
      refetch();
    }
  }, [currentPage, rowsPerPage, currentTab]);

  // When navigating from notifications or switching patients, ensure Communication tab opens
  useEffect(() => {
    if (locationState?.openChat || locationState?.chatId) {
      setCurrentTab("Communication");
    }
  }, [locationState?.openChat, locationState?.chatId]);

  // Update billing ID only when patient data is for the current patient
  useEffect(() => {
    if (patientData && patientData._id === patient_id && patientData?.session_ids && patientData.session_ids[0]?._id) {
      setBillingId(patientData.session_ids[0]._id);
    } else {
      setBillingId(null);
    }
  }, [patientData, patient_id]);

  const handleTabChange = (event, newValue) => {
    setRowsPerPage(10);
    setCurrentPage(1); // Reset to first page when switching tabs
    setCurrentTab(newValue);
    if (newValue !== "My Coach Note") {
      setNotesSubTab("Coach Notes");
    }
  };

  const navigate = useNavigate();

  const handleBack = () => navigate(-1);

  useEffect(() => {
    if (isCallLogAdd === true) {
      refetch();
    }
  }, [isCallLogAdd]);

  const formatDuration = (seconds) => {
    if (!seconds) return "00:00:00";
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const onClose = () => {
    setEscalationForm(false);
    setContactCanva(false);
    setPatientCallCanva(false);
    setErrors({});
    setFormData({ called_on: new Date(), duration: "", remark: "" });
  };

  return (
    <>
      <div ref={observedDivRef} className="main-container mt-3">
        <div className="d-flex ps-3 bg-white user-sm-container">
          <div className="d-flex justify-content-between w-100">
            <div className="d-flex align-items-center">
              <div className="pointer px-2" onClick={handleBack}>
                <img
                  loading="lazy"
                  src={BackArrow}
                  height={16}
                  width={9.6}
                  alt="Back Arrow"
                />
              </div>

              <div className="d-flex align-items-center">
                <CAvatar
                  textColor="white"
                  className="ms-2"
                  src={`${base_url + profile_pic}`}
                ></CAvatar>
              </div>

              <div className="profile-name">{`${last_names ? last_names : ""} ${middle_names ? middle_names : ""
                } ${first_names ? first_names : ""}`}</div>

              {!showViewOnly && (
                <div>
                  <button
                    className="add-escalation flex-items-start "
                    onClick={() => setEscalationForm(true)}
                  >
                    Escalate
                  </button>
                </div>
              )}
            </div>

            {!showViewOnly && (
              <div className="d-flex align-items-center gap-2 mx-3">
                <div className="me-3">
                  {billingId && patient_id && coach_id && (
                    <Timer
                      key={`timer-${patient_id}-${billingId}`}
                      sessionId={billingId}
                      patientId={patient_id}
                      coachId={coach_id}
                      isInCoachPatient={isInCoachPatient}
                      setInCoachPatient={setInCoachPatient}
                    />
                  )}
                </div>
                <div
                  className=" pointer "
                  onClick={() => setPatientCallCanva(true)}
                >
                  <div>
                    <img
                      loading="lazy"
                      src={PhoneIcon}
                      height={14}
                      width={14}
                    />{" "}
                    <span className="fs-14 fw-bold roboto font-orange">
                      Call {first_names}
                    </span>
                  </div>
                  <div className="any">
                    Last call:{" "}
                    {callTime ? formatDuration(callTime) : "No Calls"}
                  </div>
                </div>
                <span
                  id=""
                  className="mx-2"
                  style={{ height: "30px", border: " 1px solid #DDDDDD" }}
                ></span>
                <button
                  onClick={() => setContactCanva(true)}
                  type="button"
                  className="btn round-border-orange pointer fs-16 fw-bold roboto font-orange d-flex align-items-center gap-2"
                >
                  <img
                    loading="lazy"
                    src={MessageIcon}
                    height={20}
                    width={21}
                    className="img-fluid"
                    alt="Message"
                  />
                  <span className="d-none d-sm-inline">Contact</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <TabContext value={currentTab}>
            <Box>
              <TabList
                className=""
                onChange={handleTabChange}
                aria-label="lab API tabs example"
              >
                <Tab label="Patient Info" value="Patient Info" />
                <Tab label="Journey" value="Current Journey" />
                <Tab label="Patient Engagement " value="Patient Engagement" />
                {!showViewOnly && (
                  <Tab label="Communication" value="Communication" />
                )}
                {!hideBilling && <Tab label="Billing" value="Billing" />}
                <Tab label="Log" value="Log" />
                <Tab label="Export Management" value="Export Management" />
                <Tab label="Notes" value="My Coach Note" />
                <Tab label="Outcome" value="Outcome" />
              </TabList>
            </Box>
            <TabPanel value="Patient Info">
              <PatientInfo
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                totalAssignTasks={assignedtasks}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalAssignedTaskPages={assignedtasks?.totalAssignedTaskPages}
                patientId={patient_id}
                state={patientData}
                getAllPatientIsLoading={getAllPatientIsLoading}
                detailRefetch={refetch}
                patientRefetch={patientRefetch}
                showViewOnly={showViewOnly}
              />
            </TabPanel>
            <TabPanel value="Current Journey">
              <CurrentJourney
                currentTab={currentTab}
                patientData={patientData}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                currentPage={currentPage}
                getAllPatientIsLoading={getAllPatientIsLoading}
                setCurrentPage={setCurrentPage}
                assignedTaskJourney={assignedTaskJourney}
              />
            </TabPanel>
            <TabPanel value="Patient Engagement">
              <PatientEngagement
                patientId={patient_id}
                tab={"patientEngagement"}
                refetch
              />
            </TabPanel>
            <TabPanel value="Communication">
              <Communication state={locationState} />
            </TabPanel>
            {!hideBilling && (
              <TabPanel value="Billing">
                <Billing
                  patientId={patient_id}
                  state={patientData}
                  showViewOnly={showViewOnly}
                  coachIfExist={coachIfExist}
                />
              </TabPanel>
            )}
            <TabPanel value="Log">
              <Log
                patientId={patient_id}
                patientData={patientData}
                patientDetailLoading={patientDetailLoading}
              />
            </TabPanel>
            <TabPanel value="Export Management">
              <ExportManage />
            </TabPanel>
            <TabPanel value="My Coach Note">
              <MyCoachNote
                patientId={patient_id}
                activeSubTab={notesSubTab}
                onSubTabChange={handleNotesSubTabChange}
              />
            </TabPanel>
            <TabPanel value="Outcome">
              <Outcome  patientId={patient_id} refetch={refetch} />
            </TabPanel>
          </TabContext>
        </div>
      </div>
      {!showViewOnly && (
        <>
          <ContactEmail
            setContactCanva={setContactCanva}
            contactCanva={contactCanva}
            patientData={patientData}
            onClose={onClose}
            errors={errors}
            setErrors={setErrors}
          />
          <PatientCallCanvas
            billingId={billingId}
            patientId={patient_id}
            PatientCallCanva={PatientCallCanva}
            setPatientCallCanva={setPatientCallCanva}
            onClose={onClose}
            errors={errors}
            setErrors={setErrors}
            formData={formData}
            setFormData={setFormData}
            patientCreatedAt={patientData?.createdAt || patientData?.created_at}
          />
        </>
      )}

      <EscalationForm
        esclatePatient={esclatePatient}
        esclatePatientSuccess={esclatePatientSuccess}
        escalationForm={escalationForm}
        patient_id={patient_id}
        coach_id={coach_id}
        provider_id={patientData?.provider?._id}
        onClose={onClose}
      />
    </>
  );
};

export default CoachPatientDetail;