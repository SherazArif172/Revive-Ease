import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import DatePicker from "react-datepicker";
import { useNavigate, useLocation } from "react-router-dom";
import customStyles from "../../../Components/DataTable/CustomStyle";
import BackArrow from "../../../assets/icons/backArrow.png";
import flag from "../../../assets/icons/Vector.png";
import statsDown from "../../../assets/icons/statsDown.png";
import statsUp from "../../../assets/icons/statsUp.png";
import BlockKeyboardInput from "../../../utils/BlockKeyboardInput";
import { useAssignCoachProviderToPatientMutation, useGetSignOffPatientsQuery, useUpdatePatientSignOffMutation } from "../../../redux/apis/allPatient_api";
import { useSelector } from "react-redux";
import PaginationComponent from "../../../utils/Pagination";
import { toast } from "react-toastify";
import { useGetAllProvierListQuery } from "../../../redux/apis/provider_api";
import { useNotifications } from "../../../Components/header/Notifications";
const SignOffListing = () => {

  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [showProviderCommentsCanvas, setShowProviderCommentsCanvas] = useState(false);
  const [showReviewCanvas, setShowReviewCanvas] = useState(false);
  const [providerComments, setProviderComments] = useState("");
  const [selectedPatientForReview, setSelectedPatientForReview] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // Current date
  const [selectedProvider, setSelectedProvider] = useState("");
  const [isProviderLoading, setIsProviderLoading] = useState(false);
  const user = useSelector((state) => state?.user);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const clinic_id = user?.profileData?.clinic_id;

  const actorType = useSelector((state) => state?.user?.userType);

  const [charCount, setCharCount] = useState(0);
  const MAX_CHAR_LIMIT = 150;
  const { refetchEscalationNotifications } = useNotifications();

  // Add this handler function
  const handleProviderCommentsChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHAR_LIMIT) {
      setProviderComments(value);
      setCharCount(value.length);
    }
  };
  // Format selectedMonth to MM-YYYY format
  const formatMonthForAPI = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
    const year = date.getFullYear();
    return `${month}-${year}`;
  };

  // eslint-disable-next-line no-unused-vars
  const [signOffApi, { isSuccess: assignCoachProviderToPatientSuccess }] = useAssignCoachProviderToPatientMutation();

  // eslint-disable-next-line no-unused-vars
  const { data: getAllProvider, refetch: providerRefetch, isLoading: providerApiLoading } = useGetAllProvierListQuery(clinic_id ? clinic_id : undefined, {
    skip: !clinic_id, // Skip the query if clinic_id is not available
    refetchOnMountOrArgChange: true
  });

  const providerList = useSelector((state) => state?.allProvider?.provider?.data);

  // Effect to refetch provider data when clinic_id becomes available
  useEffect(() => {
    if (clinic_id && user?.userType === "clinic admin") {
      providerRefetch();
    }
  }, [clinic_id, user?.userType, providerRefetch]);

  // Create query params based on user type
  const queryParams = {
    month: formatMonthForAPI(selectedMonth),
    page,
    rowsPerPage,
    provider_name: selectedProvider
  };

  // Add provider_id or clinic_id based on user type
  if (user?.userType === "provider") {
    queryParams.provider_id = user.id;
  } else if (user?.userType === "clinic admin") {
    queryParams.clinic_id = user?.profileData?.clinic_id;
  }

  // eslint-disable-next-line no-unused-vars
  const { data: signOffPatients, isLoading: signOffListingLoading, refetch } = useGetSignOffPatientsQuery(queryParams, { refetchOnMountOrArgChange: true });

  const signOffList = useSelector(state => state?.allPatients?.signOffPatients?.data);

  // eslint-disable-next-line no-unused-vars
  const [updatePatientSignOff, { isSuccess: updatePatientSignOffSuccess, reset: resetUpdatePatientSignOff }] = useUpdatePatientSignOffMutation();

  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (selectedMonth) {
      refetch();
    }

  }, [selectedMonth]);

  useEffect(() => {
    if (selectedProvider !== undefined) {
      setIsProviderLoading(true);
      refetch().finally(() => {
        setIsProviderLoading(false);
      });
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (updatePatientSignOffSuccess) {
      toast.success("Patient sign-off updated successfully!");
      refetch();
      refetchEscalationNotifications();
      resetUpdatePatientSignOff();
    }
  }, [updatePatientSignOffSuccess, refetch, refetchEscalationNotifications, resetUpdatePatientSignOff]);



  const sortedPatients = React.useMemo(() => {
    if (!signOffList?.patients) return [];

    return [...signOffList.patients].sort((a, b) => {
      const getEscalationDate = (patient) => {
        // All backend dates are UTC
        if (patient.latestEscalation?.createdAt) {
          return new Date(patient.latestEscalation.createdAt);
        }
        if (patient.signOffRequests?.[0]?.createdAt) {
          return new Date(patient.signOffRequests[0].createdAt);
        }
        return new Date(0);
      };

      const dateA = getEscalationDate(a);
      const dateB = getEscalationDate(b);

      // Compare UTC timestamps
      return dateB.getTime() - dateA.getTime();
    });
  }, [signOffList?.patients]);


  useEffect(() => {
    const focusPatientId = location?.state?.focusPatientId;

    if (!focusPatientId || !signOffList?.patients) {
      console.error('No focus patient ID or patient data available');
      return;
    }


    console.log('Available patients:', signOffList.patients.map(p => ({
      _id: p._id,
      patient_id: p.patient_id,
      name: p.name
    })));

    const target = signOffList.patients.find(p =>
      p._id === focusPatientId ||
      p.patient_id === focusPatientId
    );

    if (target) {
      setSelectedPatientForReview(target);
      setShowReviewCanvas(true);

      navigate(location.pathname, {
        replace: true,
        state: { ...location.state, focusPatientId: undefined }
      });
    }
  }, [location?.state?.focusPatientId, signOffList?.patients, navigate, location.pathname, location.state]);
  const columns = [
    {
      name: 'Patient Name',
      selector: row => row.name,
      sortable: true,
      width: '200px',
      cell: row => (
        <div className="d-flex align-items-center gap-2">
          <span className=" ">
            {row.name}
          </span>
          {row?.latestEscalation?.status === "In Review" && <img src={flag} alt="flag" width="16" height="16" />}
        </div>
      )
    },


    {
      name: 'Pain Score',
      selector: row => row.latestPainScore?.value,
      width: '120px',
      sortable: true,
      cell: row => (
        <div className="d-flex align-items-center gap-2">
          <span className="fs-14 fw-semibold">{row.latestPainScore?.value}</span>
          {row.painScoreComparison && (
            <div className="d-flex align-items-center gap-1">
              <img
                src={row.painScoreComparison.trend === "up" ? statsUp : statsDown}
                alt="trend"
                height={14}
                width={21}
              />
              <span className={row.painScoreComparison.trend === "up" ? "text-success " : "text-danger"}>
                {row.painScoreComparison.percentage}%
              </span>
            </div>
          )}
        </div>
      )
    },

    {
      name: 'Status',
      selector: row => row?.currentMonthProviderDecision,
      width: '150px',
      cell: row => (
        <p className="text-secondary mb-0">
          {row?.currentMonthProviderDecision}
        </p>
      )
    },
    {
      name: 'Sign-Off Comments',
      selector: row => row?.signOffRequests?.comment_to_coach,
      grow: 4,
      cell: row => (
        <p className="text-secondary mb-0">
          {row?.signOffRequests[0]?.comment_to_coach}
        </p>
      )
    },
    {
      name: 'Coach Summary',
      selector: row => row.latestEscalation ? row?.latestEscalation?.comment_to_provider : row?.latestCoachReport?.description,
      grow: 4,
      cell: row => (
        <p className="text-secondary mb-0">
          {row.latestEscalation ? row?.latestEscalation?.comment_to_provider : row.latestCoachReport?.description}
        </p>
      )
    },

    {
      name: 'Action',
      width: '120px',
      cell: (row) => (
        <span
          className="fw-bold"
          style={{ cursor: "pointer", textDecoration: "underline", color: "#007E9E" }}
          onClick={() => handleReviewClick(row)}
        >
          Review
        </span>
      )
    }
  ];


  const handleRowSelected = React.useCallback(state => {
    setSelectedRows(state.selectedRows);
  }, []);

  const getUniquePatients = (patients) => {
    if (!patients || !patients.length) return [];

    const uniquePatientsMap = new Map();
    patients.forEach(row => {
      if (row && row._id && row.patientCoach?._id) {
        uniquePatientsMap.set(row._id, {
          patient_id: row._id,
          requestedBy: row.patientCoach._id
        });
      }
    });

    return Array.from(uniquePatientsMap.values());
  };

  const handleContinueRTM = () => {
    if (selectedRows.length > 0) {
      setShowProviderCommentsCanvas(true);
    }
  };

  const handleDiscontinueRTM = () => {
    if (selectedRows.length > 0) {
      setShowProviderCommentsCanvas(true);
    }
  };

  const handleSaveProviderComments = () => {
    if (!selectedRows.length) {
      return;
    }

    const uniquePatients = getUniquePatients(selectedRows);
    if (!uniquePatients.length) {
      return;
    }

    const continuePayload = {
      patientIds: uniquePatients,
      requestedFrom: user?.id,
      comment_to_coach: providerComments,
      providerDecision: "Continue RTM",
      actorId: user?.id,
      actorType: actorType,
      userType: user?.userType
    };

    updatePatientSignOff(continuePayload);
    setShowProviderCommentsCanvas(false);
    setProviderComments("");
  };

  const handleDiscontinueProviderComments = () => {
    if (!selectedRows.length) {
      return;
    }

    const uniquePatients = getUniquePatients(selectedRows);
    if (!uniquePatients.length) {
      return;
    }

    const discontinuePayload = {
      patientIds: uniquePatients,
      requestedFrom: user?.id,
      comment_to_coach: providerComments,
      providerDecision: "Discontinue RTM",
      actorId: user?.id,
      actorType: actorType,
      userType: user?.userType
    };

    updatePatientSignOff(discontinuePayload);
    setShowProviderCommentsCanvas(false);
    setProviderComments("");
  };

  const handleCancelProviderComments = () => {
    setShowProviderCommentsCanvas(false);
    setProviderComments("");
  };

  const handleReviewClick = (patient) => {
    setSelectedPatientForReview(patient);
    setShowReviewCanvas(true);
  };

  const handleCloseReviewCanvas = () => {
    setShowReviewCanvas(false);
    setSelectedPatientForReview(null);
    setProviderComments("");
  };

  const handleReviewContinueRTM = () => {
    if (!selectedPatientForReview) {
      return;
    }

    if (!selectedPatientForReview._id || !selectedPatientForReview.patientCoach?._id) {
      return;
    }

    const continuePayload = {
      patientIds: [{
        patient_id: selectedPatientForReview._id,
        requestedBy: selectedPatientForReview.patientCoach._id
      }],
      requestedFrom: user?.id,
      comment_to_coach: providerComments,
      providerDecision: "Continue RTM",
      actorId: user?.id,
      actorType: actorType,
      userType: user?.userType
    };

    updatePatientSignOff(continuePayload);

    // Close canvas and reset state
    setShowReviewCanvas(false);
    setSelectedPatientForReview(null);
    setProviderComments("");
  };

  const handleReviewDiscontinueRTM = () => {
    if (!selectedPatientForReview) {
      return;
    }

    if (!selectedPatientForReview._id || !selectedPatientForReview.patientCoach?._id) {
      return;
    }

    const discontinuePayload = {
      patientIds: [{
        patient_id: selectedPatientForReview._id,
        requestedBy: selectedPatientForReview.patientCoach._id
      }],
      requestedFrom: user?.id,
      comment_to_coach: providerComments,
      providerDecision: "Discontinue RTM",
      actorId: user?.id,
      actorType: actorType,
      userType: user?.userType
    };

    updatePatientSignOff(discontinuePayload);

    // Close canvas and reset state
    setShowReviewCanvas(false);
    setSelectedPatientForReview(null);
    setProviderComments("");
  };

  const contextActions = React.useMemo(() => {
    const handleDelete = () => {
      if (window.confirm(`Are you sure you want to delete:\r ${selectedRows.map(r => r.name)}?`)) {
        setToggleCleared(!toggleCleared);
      }
    };
    return (
      <button
        key="delete"
        onClick={handleDelete}
        className="btn btn-danger"
      >
        Delete
      </button>
    );
  }, [selectedRows, toggleCleared]);

  const maxMonth = new Date(); // Allow current month to be selectable

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <div className="px-2 pointer" onClick={handleBack}>
          <img
            loading="lazy"
            src={BackArrow}
            height={16}
            width={9.6}
            alt="Back Arrow"

          />
          <strong className="px-2">Back</strong>
        </div>
        <div className="d-flex align-items-center gap-3">
          {/* Provider Selection - Only visible to clinic admin */}
          {user?.userType === "clinic admin" && (
            <>
              <label className="rv-label-newpractice mb-0 fw-bold">Select Provider</label>
              <div className="form-group has-search-right mt-2">
                <select
                  style={{ width: "200px" }}
                  className="form-select form-control-input"
                  name="provider"
                  value={selectedProvider}
                  disabled={isProviderLoading}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                >
                  <option value="">All Providers</option>
                  {providerList && providerList.map((provider, index) => (
                    <option key={index} value={`${provider?.last_name} ${provider?.middle_name} ${provider?.first_name}`}>
                      {provider?.last_name} {provider?.middle_name?.charAt(0)?.toUpperCase()} {provider?.first_name}
                    </option>
                  ))}
                </select>
              </div>

            </>
          )}

          <label className="rv-label-newpractice mb-0 fw-bold">Select Month</label>
          <div className="form-group has-search-right mb-0">
            <DatePicker
              customInput={<BlockKeyboardInput />}
              selected={selectedMonth}
              onChange={(date) => {
                // If date is null (cleared), set to current month
                if (date === null) {
                  setSelectedMonth(new Date());
                } else {
                  setSelectedMonth(date);
                }
              }}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              className="form-control input-dt shadow"
              maxDate={maxMonth}
              placeholderText="Select month"
              isClearable
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={sortedPatients}
          selectableRows
          progressPending={signOffListingLoading || isProviderLoading}
          onSelectedRowsChange={handleRowSelected}
          clearSelectedRows={toggleCleared}
          customStyles={customStyles}
          contextActions={user?.userType === "provider" ? contextActions : undefined}
          highlightOnHover
          responsive
        />
      </div>
      <PaginationComponent
        totalRecords={signOffList?.pagination?.totalRecords}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />

      {/* Action Buttons - Only show for providers */}

      <div className="d-flex justify-content-end gap-3 mt-4">
        <button
          className="btn-bg-orange-color"
          disabled={selectedRows.length === 0}
          onClick={handleDiscontinueRTM}
        >
          Discontinue RTM
        </button>
        <button
          className="btn-bg-green-color"
          disabled={selectedRows.length === 0}
          onClick={handleContinueRTM}
        >
          Continue RTM
        </button>
      </div>



      {/* Provider Comments Canvas */}
      <COffcanvas
        className="ps-3 pe-3 pb-2 offcanvas_add_user_auto"
        backdrop='static'
        placement="bottom"
        visible={showProviderCommentsCanvas}
        onHide={handleCancelProviderComments}
      >
        <COffcanvasHeader>
          <COffcanvasTitle className="pt-4">
            Provider Comments
          </COffcanvasTitle>
          <CCloseButton
            className="text-reset modal-close-cross"
            onClick={handleCancelProviderComments}
          />
        </COffcanvasHeader>

        <COffcanvasBody>
          <div className="mb-3">
            <textarea
              className="form-control"
              rows="5"
              placeholder="Enter comments here"
              value={providerComments}
              onChange={handleProviderCommentsChange}
              style={{ border: "2px solid #D9D9D9" }}
              maxLength={MAX_CHAR_LIMIT}
            />
            <div className="text-end mt-1">
              <small className={charCount === MAX_CHAR_LIMIT ? "text-danger" : "text-muted"}>
                {charCount}/{MAX_CHAR_LIMIT} characters
              </small>
            </div>

          </div>

          <div className="row pt-4">
            <div className="col-md-12 text-end">
              <button
                className="btn-bg-orange-color me-2"
                onClick={handleDiscontinueProviderComments}

              >
                Discontinue RTM
              </button>
              <button
                className="btn-bg-green-color"
                onClick={handleSaveProviderComments}

              >
                Continue RTM
              </button>
            </div>
          </div>
        </COffcanvasBody>
      </COffcanvas>


      {/* Review Canvas */}
      <COffcanvas
        className="ps-3 pe-3 pb-2 offcanvas_add_user_auto"
        backdrop='static'
        placement="bottom"
        visible={showReviewCanvas}
        onHide={handleCloseReviewCanvas}
      >
        <COffcanvasHeader>
          <COffcanvasTitle className="pt-4">
            Escalation Case Review
          </COffcanvasTitle>
          <CCloseButton
            className="text-reset modal-close-cross"
            onClick={handleCloseReviewCanvas}
          />
        </COffcanvasHeader>

        <COffcanvasBody>
          {selectedPatientForReview && (
            <>
              <div className="row escaltion-summary">
                <div className="col-md-4">
                  <label className="form-label">Patient Name</label>
                  <div className="d-flex align-items-center gap-2">
                    <span>{selectedPatientForReview.name}</span>
                    {selectedPatientForReview?.latestEscalation?.status === "In Review" && <img src={flag} alt="flag" width="16" height="16" />}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Pain Trend</label>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-14 fw-semibold">{selectedPatientForReview.latestPainScore?.value}</span>
                    {selectedPatientForReview.painScoreComparison && (
                      <div className="d-flex align-items-center gap-1">
                        <img
                          src={selectedPatientForReview.painScoreComparison.trend === "up" ? statsUp : statsDown}
                          alt="trend"
                          height={14}
                          width={21}
                        />
                        <span className={selectedPatientForReview.painScoreComparison.trend === "up" ? "text-success" : "text-danger"}>
                          {selectedPatientForReview.painScoreComparison.percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Engagement</label>
                  <div>
                    Engagement
                  </div>
                </div>
              </div>

              <div className="row my-4">
                <div className="col-md-6">
                  <label className="form-label">Coach Summary</label>
                  <div
                    className="rounded p-3"
                    style={{
                      minHeight: "140px",
                      maxHeight: "200px",
                      backgroundColor: "#f8f9fa",
                      border: "2px solid #D9D9D9",
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                    }}
                  >
                    <p className="text-secondary mb-0">
                      {selectedPatientForReview?.latestEscalation
                        ? selectedPatientForReview.latestEscalation.comment_to_provider
                        : selectedPatientForReview?.latestCoachReport?.report_name || "No summary available"}
                    </p>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Provider Comments</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Enter your comments here"
                    value={providerComments}
                    onChange={handleProviderCommentsChange}
                    style={{
                      border: "2px solid #D9D9D9",
                      resize: "vertical",
                      maxHeight: "200px",
                      overflowY: "auto",
                      wordWrap: "break-word",
                    }}
                    maxLength={MAX_CHAR_LIMIT}
                  />
                  <div className="text-end mt-1">
                    <small className={charCount === MAX_CHAR_LIMIT ? "text-danger" : "text-muted"}>
                      {charCount}/{MAX_CHAR_LIMIT} characters
                    </small>
                  </div>
                </div>
              </div>


              <div className="row">
                <div className="col-md-12 text-end">
                  <button
                    className="btn-bg-orange-color me-2"
                    onClick={handleReviewDiscontinueRTM}

                  >
                    Discontinue RTM
                  </button>
                  <button
                    className="btn-bg-green-color"
                    onClick={handleReviewContinueRTM}

                  >
                    Continue RTM
                  </button>
                </div>
              </div>
            </>
          )}
        </COffcanvasBody>
      </COffcanvas>

    </>
  );
};

export default SignOffListing;
