import { CModal, CModalBody, CModalTitle } from "@coreui/react";
import { Box, Tab, TablePagination } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Filter from "../../../../assets/icons/filter.png";
import Sorticon from "../../../../assets/icons/sort.png";
import { columnsClinicDetailAdmin } from "../../../../Components/DataTable/commonColumn";
import { customStylesCoachPatients } from "../../../../Components/DataTable/CustomStyle";
import FilterCanvas from "../../../../Components/DataTable/FilterCanva";
import { useGetAllPatientQuery } from "../../../../redux/apis/allPatient_api";
import { useCreateSessionMutation } from "../../../../redux/apis/billing_api";
import { useUpdateRoleMutation } from "../../../../redux/apis/role_api";
import { setBillingTab } from "../../../../redux/reducers/billingReducer";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";
import FilterComponent from "../../../../utils/FilterComponent";
import DiagnosisModal from "../../../../Components/Modal/DiagnosisModal";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { convertLocalDateToUTC } from "../../../../utils/dateUtils";
import AddPatient from "../../admin/patients/AddPatient";
import ConfirmPopup from "../../../../Components/Modal/ConfirmPopup";
import AddIcon from "../../../../assets/icons/plus.png";
import FlagIcon from "../../../../assets/icons/flag.png";

const CoachPatient = () => {
  const [activeTab, setActiveTab] = useState("My Patients");
  const [filterText, setFilterText] = useState("");
  const [filter, setFilter] = useState({
    first_name: "",
    userId: "",
    userName: "",
    coachName: "",
    diagnosis: "",
    insurance: "",
    provider: "",
    registrationDateFrom: "",
    registrationDateTo: "",
    last_name: "",
    coachNotAssigned: false,
  });

  const coachList = useSelector((state) => state?.allCoach);
  const id = useSelector((state) => state?.user?.id);
  const userType = useSelector((state) => state?.user?.userType);
  const [sendQuestionary, { isSuccess: sendQuestionarySuccess }] = useUpdateRoleMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [questionaryModal, setQuestionaryModal] = useState(false);
  const [rowData, setRowData] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [pagination, setPagination] = useState({
    rowsPerPage: 10,
    currentPage: 1,
  });
  const [visible, setVisible] = useState(false);
  const QUESTIONNAIRE_OPTIONS = [
    "ODI",
    "Quick DASH",
    "OKS",
    "FAAM",
    "OHS",
    "NDI",
    "PCS",
    "PROMIS Fatigue",
    "PROMIS Global",
  ];
  const [diagnosisModal, setDiagnosisModal] = useState(false);
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [note, setNote] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [addPatientModal, setAddPatientModal] = useState(false);
  // Flag flow: select rows -> Flag -> confirm -> success
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [clearSelection, setClearSelection] = useState(false);
  const [flagStep, setFlagStep] = useState(null); // null | "confirm" | "success"

  const [tempFilter, setTempFilter] = useState({
    registrationDateFrom: null,
    registrationDateTo: null,
    status: "",
    userId: "",
    userName: "",
    first_name: "",
    diagnosis: "",
    provider: "",
    insurance: "",
    last_name: "",
    coachNotAssigned: false,
  });

  const [sortConfig, setSortConfig] = useState({
    field: "",
    direction: "asc",
  });

  const { data: allPatientsData, isLoading: allPatientsLoading, refetch: refetchPatients } = useGetAllPatientQuery(
    {
      filterText: filterText,
      filter: filter,
      coachId: id,
      page: 1,
      rowsPerPage: 1000,
      currentTab: "Approved",
      sortField: sortConfig.field,
      sortDirection: sortConfig.direction,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [createSession, { isLoading }] = useCreateSessionMutation();

  useEffect(() => {
    dispatch(setBillingTab(false));
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset to first page when switching tabs
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  useEffect(() => {
    if (sendQuestionarySuccess) {
      setQuestionaryModal(false);
      toast.success("Questionnaire sent successfully!");
      setSelectedDate(null);
      setSelectedQuestionnaires([]);
      setNote("");
    }
  }, [sendQuestionarySuccess]);

  const getAllPatients = useMemo(() => {
    return allPatientsData?.approved?.data || [];
  }, [allPatientsData]);
  const getFilteredData = useMemo(() => {
    if (activeTab === "My Patients") {
      return getAllPatients.filter(patient => !patient.iswatchlisted);
    } else {
      return getAllPatients.filter(patient => patient.iswatchlisted === true);
    }
  }, [getAllPatients, activeTab]);

  const paginatedData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.rowsPerPage;
    const endIndex = startIndex + pagination.rowsPerPage;
    return getFilteredData.slice(startIndex, endIndex);
  }, [getFilteredData, pagination.currentPage, pagination.rowsPerPage]);

  const currentTabTotalRecords = getFilteredData.length;

  const handleClear = () => {
    setTempFilter({
      first_name: "",
      userId: "",
      userName: "",
      coachName: "",
      diagnosis: "",
      insurance: "",
      provider: "",
      registrationDateFrom: null,
      registrationDateTo: null,
      coachNotAssigned: false,
    });

    setFilter({
      userId: "",
      userName: "",
      coachName: "",
      diagnosis: "",
      insurance: "",
      provider: "",
      registrationDateFrom: "",
      registrationDateTo: "",
      coachNotAssigned: false,
    });

    setSelectedDate(null);
    setSelectedQuestionnaires([]);
    setNote("");
  };

  const handleNavigateRowClick = async (row) => {
    if (isLoading) return;

    try {
      const response = await createSession({
        patient_id: row._id,
        coach_id: id,
      }).unwrap();

      navigate("/coachPatientDetail", {
        state: { ...row, billing_id: response?.session_id },
      });
    } catch (error) {
      console.log("Failed to create billing record. Please try again.");
    }
  };

  const handleSort = (column, sortDirection) => {
    const sortField = column.sortField || column.selector;
    setSortConfig({ field: sortField, direction: sortDirection });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setPagination({
      rowsPerPage: newRowsPerPage,
      currentPage: 1,
    });
  };

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTempFilter((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleApplyFilter = () => {
    setFilter(tempFilter);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setVisible(false);
  };

  const handleDateChange = (name, date) => {
    setTempFilter((prev) => {
      const updatedFilter = {
        ...prev,
        [name]: date,
      };

      if (name === "registrationDateFrom" && date && !prev.registrationDateTo) {
        updatedFilter.registrationDateTo = new Date();
      }

      return updatedFilter;
    });
  };

  const handleFilterTextChange = (e) => {
    const value = e.target.value;
    setFilterText(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const onClose = () => {
    setQuestionaryModal(false);
    setSelectedDate(null);
    setSelectedQuestionnaires([]);
    setNote("");
    setSelectedRowId(null);
    setDiagnosisModal(false);
  };

  const onConfirm = () => {
    if (!selectedQuestionnaires.length || !selectedDate) {
      setErrMsg("Please select both an outcome and a date.");
      setTimeout(() => {
        setErrMsg("");
      }, 3000);
      return;
    }

    const requiredFromPatient = selectedQuestionnaires;
    // Convert local date to UTC for backend (include time if needed)
    const utcDateString = convertLocalDateToUTC(selectedDate, true);
    
    if (!utcDateString) {
      setErrMsg("Invalid date selected.");
      setTimeout(() => {
        setErrMsg("");
      }, 3000);
      return;
    }

    let payload = {
      sendquestion: {
        patient_id: rowData?._id,
        actorId: id,
        actorType: userType,
        requiredFromPatient: requiredFromPatient,
        date: utcDateString, // UTC ISO string
        note: note || "",
      },
    };
    sendQuestionary({ payload: payload, id: id });
  };

  const handleDiagnosisModal = (row) => {
    setSelectedRowId(row);
    setDiagnosisModal(true);
  };

  const columns = columnsClinicDetailAdmin({
    handleNavigateRowClick,
    setQuestionaryModal,
    setRowData,
    handleDiagnosisModal,
    sortField: sortConfig.field,
    sortDirection: sortConfig.direction,
  });

  const handleQuestionnaireChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedQuestionnaires(
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 250,
        width: 250,
      },
    },
  };

  const getPlaceholder = () => {
    return "Search Patient by name & email";
  };

  return (
    <>
      <div className="main-container mt-4">
        {/* Header with title + search + filter aligned */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <h6 className="m-0">
            <strong className="title-color fs-18">List of Patients</strong>
          </h6>

          <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
            <FilterComponent
              placeholder={getPlaceholder()}
              onFilter={handleFilterTextChange}
              filterText={filterText}
            />
            <button
              className="btn filter-btn d-flex align-items-center"
              onClick={() => setVisible(true)}
            >
              <img
                loading="lazy"
                src={Filter}
                height={14}
                width={12.26}
                alt="Filter Icon"
              />
              <span className="ms-2">Filters</span>
            </button>
            <button
              type="button"
              className="add-practice flex-items-center"
              style={{ flexShrink: 0, whiteSpace: "nowrap" }}
              onClick={() => setAddPatientModal(true)}
            >
              <img loading="lazy" src={AddIcon} height={14} width={14} alt="" />
              <span className="ms-2">Add New</span>
            </button>
            <button
              type="button"
              className="coach-flag-btn"
              onClick={() => {
                if (!selectedPatients.length) {
                  toast.info("Select at least one patient to flag.");
                  return;
                }
                setFlagStep("confirm");
              }}
            >
              <img loading="lazy" src={FlagIcon} height={12} width={12} alt="" />
              <span>Flag</span>
            </button>
          </div>
        </div>

        <TabContext value={activeTab}>
          <Box>
            <TabList onChange={handleTabChange} aria-label="patient tabs">
              <Tab
                label="My Patients"
                value="My Patients"
                className="bold"
              />
              <Tab
                label="My Watchlist"
                value="Watchlist"
                className="bold"
               
              />
            </TabList>
          </Box>

          {/* My Patients Tab */}
          <TabPanel value="My Patients">
            <div className="mt-2">
              <DataTable
                onSort={handleSort}
                sortServer
                defaultSortAsc={false}
                highlightOnHover
                pointerOnHover
                columns={columns}
                selectableRows
                selectableRowsHighlight
                onSelectedRowsChange={({ selectedRows }) => setSelectedPatients(selectedRows)}
                clearSelectedRows={clearSelection}
                data={paginatedData}
                progressPending={allPatientsLoading}
                customStyles={customStylesCoachPatients}
                responsive={true}
                onRowClicked={(row) => handleNavigateRowClick(row)}
                sortIcon={<img loading="lazy" src={Sorticon} alt="Sort Icon" />}
              />
            </div>

            {getFilteredData?.length > 0 && (
              <div
                className="mt-3 mb-5"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "end",
                }}
              >
                <TablePagination
                  component="div"
                  count={currentTabTotalRecords}
                  page={pagination.currentPage - 1}
                  onPageChange={handlePageChange}
                  rowsPerPage={pagination.rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 15, 20]}
                />
              </div>
            )}
          </TabPanel>

          {/* Watchlist Tab */}
          <TabPanel value="Watchlist">
            <div className="mt-2">
              <DataTable
                onSort={handleSort}
                sortServer
                defaultSortAsc={false}
                highlightOnHover
                pointerOnHover
                columns={columns}
                selectableRowsHighlight
                data={paginatedData}
                progressPending={allPatientsLoading}
                customStyles={customStylesCoachPatients}
                responsive={true}
                onRowClicked={(row) => handleNavigateRowClick(row)}
                sortIcon={<img loading="lazy" src={Sorticon} alt="Sort Icon" />}
              />
            </div>

            {getFilteredData?.length > 0 && (
              <div
                className="mt-3 mb-3"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "end",
                }}
              >
                <TablePagination
                  component="div"
                  count={currentTabTotalRecords}
                  page={pagination.currentPage - 1}
                  onPageChange={handlePageChange}
                  rowsPerPage={pagination.rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 15, 20]}
                />
              </div>
            )}
          </TabPanel>
        </TabContext>
      </div>


      <FilterCanvas
        handleDateChange={handleDateChange}
        visible={visible}
        tempFilter={tempFilter}
        setVisible={setVisible}
        handleClear={handleClear}
        filter={filter}
        setFilter={setFilter}
        handleInputChange={handleFilterChange}
        handleCheckboxChange={handleFilterChange}
        handleApplyFilter={handleApplyFilter}
        coachList={coachList}
        onclose={() => {
          setVisible(false);
        }}
      />
      <DiagnosisModal
        onClose={onClose}
        diagnosisModal={diagnosisModal}
        selectedRowId={selectedRowId}
      />
      <CModal
        alignment="center"
        visible={questionaryModal}
        onClose={onClose}
        aria-labelledby="VerticallyCenteredExample"
      >
        <div className="d-flex justify-content-center CModalHeader">
          <CModalTitle className="text-white">Send Questionnaire</CModalTitle>
        </div>
        <CModalBody className="main-modal-body">
          <div>
            {errMsg ? (
              <span
                className="my-3 ml-5 text-center rg-err"
                style={{ fontSize: 14 }}
              >
                {errMsg}
              </span>
            ) : (
              ""
            )}
            <div className="bold fs-16 roboto title-register mt-2">
              {"Select the outcome you want to assign to the patient"}
            </div>
            <br />

            {/* Outcome Selection Field */}
            <div className="row g-2 mb-3 px-5 text-start">
              <label htmlFor="outcome-select" className="form-label text-left">
                Outcome  <span
                  className="text-danger"
                >
                  *
                </span>
              </label>
              <FormControl sx={{ width: 400 }}>
                <Select
                  className="form-control-inp mb-2"
                  multiple
                  displayEmpty
                  value={selectedQuestionnaires}
                  onChange={handleQuestionnaireChange}
                  input={<OutlinedInput />}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <span >Select Outcome</span>;
                    }
                    return selected.join(', ');
                  }}
                  MenuProps={MenuProps}
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  {QUESTIONNAIRE_OPTIONS.map((name) => (
                    <MenuItem key={name} value={name}>
                      <Checkbox checked={selectedQuestionnaires.includes(name)} />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Date Selection Field */}
            <div className="row mb-3 px-5 text-start">
              <div className="col-12">
                <label htmlFor="questionnaire-date" className="form-label text-left">
                  Date <span
                    className="text-danger"
                  >
                    *
                  </span>
                </label>
                <DatePicker
                  customInput={<BlockKeyboardInput />}
                  className="form-control input-dt shadow form-control-inp"
                  placeholderText="Select Date"
                  dateFormat="MM/dd/yyyy"
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  minDate={new Date()}
                  isClearable
                  showYearDropdown
                  scrollableYearDropdown
                />
              </div>
            </div>

            {/* Note Field */}
            <div className="row mb-3 px-5 text-start">
              <div className="col-12">
                <label htmlFor="questionnaire-note" className="form-label text-left">
                  Notes
                </label>
                <input
                  className="form-control form-control-input-shadow"
                  value={note}
                  onChange={handleNoteChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-center col-md-12">
              <button className="modal-close" onClick={onClose}>
                Close
              </button>
              <button
                style={{ backgroundColor: "#F88200" }}
                className="modal-close ms-3 text-white"
                onClick={onConfirm}
              >
                Send
              </button>
            </div>
          </div>
        </CModalBody>
      </CModal>
      <AddPatient
        visible={addPatientModal}
        setVisible={setAddPatientModal}
        refetch={refetchPatients}
      />
      <ConfirmPopup
        visible={flagStep === "confirm"}
        variant="danger"
        message="Mark the selected patients as flagged?"
        onCancel={() => setFlagStep(null)}
        onConfirm={() => setFlagStep("success")}
      />
      <ConfirmPopup
        visible={flagStep === "success"}
        mode="success"
        variant="danger"
        message="Selected patient were successfully marked as flagged."
        onCancel={() => {
          setFlagStep(null);
          setSelectedPatients([]);
          setClearSelection((v) => !v);
        }}
      />
    </>
  );
};

export default CoachPatient;