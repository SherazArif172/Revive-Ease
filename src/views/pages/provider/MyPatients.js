import React, { useEffect, useState } from "react";
import Filter from "../../../assets/icons/filter.png";
import FilterComponent from "../../../utils/FilterComponent";
import ApprovedPatient from "./ApprovedPatient";
import { useNavigate } from "react-router-dom";
import ApproveModal from "../../../Components/Modal/ApproveModal";
import AssignModal from "../../../Components/Modal/AssignModal";
import DeleteModal from "../../../Components/Modal/DeleteModal";
import { useApprovePendingPatientMutation, useGetAllPatientQuery, useGetWatchListedPatientsQuery } from "../../../redux/apis/allPatient_api";
import { useSelector } from "react-redux";
import customStyles, { customStylesProvider } from "../../../Components/DataTable/CustomStyle";
import { columnsApproved } from "../../../Components/DataTable/commonColumn";
import FilterCanvas from "../../../Components/DataTable/FilterCanva";
import { useGetCoachAlerLogQuery } from "../../../redux/apis/patient_coach_api";
import { formatDate } from "../../../utils/dateUtils";
import MonthlyReview from "./MonthlyReview";
import DataTable from "react-data-table-component";
import Sorticon from "../../../assets/icons/sort.png";
import RightArrow from "../../../assets/icons/chevron-right.png";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import DiagnosisModal from "../../../Components/Modal/DiagnosisModal";
import { TabContext, TabList } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import AddPatient from "../admin/patients/AddPatient";
import AddIcon from "../../../assets/icons/plus.png";


const MyPatients = () => {

  const [currentTab, setCurrentTab] = useState("Approved");
  const [addPatientModal, setAddPatientModal] = useState(false);
  const getPatientList = useSelector((state) =>
    currentTab === "Approved" ? state?.allPatients?.patients?.approved : state?.allPatients?.patients?.pending
  );
  const alertMessage = useSelector((state) => state?.allCoach?.alertLog?.alertData);
  const coachList = useSelector((state) => state?.allCoach?.coach);
  const id = useSelector((state) => state?.user?.id);
  const actorType = useSelector((state) => state.user?.userType);
  const [filterText, setFilterText] = useState("");
  const [filterCanvas, setFilterCanvas] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [monthlyReview, setMonthlyReview] = useState(false);
  const [diagnosisModal, setDiagnosisModal] = useState(false);

  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    rowsPerPage: 10,
    currentPage: 1,
  });

  const [tempFilter, setTempFilter] = useState({
    registrationDateFrom: null,
    registrationDateTo: null,
    coachName: "",
    status: "",
    diagnosis: "",
    insurance: "",
    userId: "",
    userName: "",
    coachNotAssigned: false
  });

  const [filter, setFilter] = useState({
    first_name: "",
    userId: "",
    userName: "",
    coachName: "",
    diagnosis: "",
    insurance: "",
    registrationDateFrom: "",
    registrationDateTo: "",
    coachNotAssigned: false,
  });

  const [sortConfig, setSortConfig] = useState({
    field: '',
    direction: 'asc'
  });

  const handleSort = (field) => {
    let direction = 'asc';
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // eslint-disable-next-line no-unused-vars
  const { data, refetch, isLoading: isPatientLoading } = useGetAllPatientQuery({
    filterText,
    filter,
    providerId: id,
    page: filterText !== "" ? 1 : pagination?.currentPage,
    rowsPerPage: filterText !== "" ? 10 : pagination?.rowsPerPage,
    currentTab,
    sortField: sortConfig.field,
    sortDirection: sortConfig.direction,
  }, {
    refetchOnMountOrArgChange: true
  });
  const [approvePendingPatient, { isSuccess: isSuccessApprove }] = useApprovePendingPatientMutation();
  // eslint-disable-next-line no-unused-vars
  const { data: coachAlertMessage } = useGetCoachAlerLogQuery({ providerId: id });

  // eslint-disable-next-line no-unused-vars
  const { data: watchlistedPatiens, isLoading: watchlistedPatiensLoading } = useGetWatchListedPatientsQuery({ id: id });

  const watchedListArray = useSelector(((state) => state?.allPatients?.closeWatchList?.data));


  const navigateMypatientDetail = (row) => {
    navigate("/mypatients/details", { state: { patient_id: row._id } });
  };

  useEffect(() => {
    if (isSuccessApprove) {
      setApproveModal(false);
      refetch();
    }
  }, [isSuccessApprove]);

  useEffect(() => {
    if (pagination) {
      refetch();
    }
  }, [pagination]);

  const handleClear = () => {
    setTempFilter({
      registrationDateFrom: '',
      registrationDateTo: '',
      coachName: '',
      userId: '',
      diagnosis: "",
      insurance: "",
      userName: '',
      coachNotAssigned: false,
    });
    setFilter({
      userId: "",
      userName: "",
      coachName: "",
      diagnosis: "",
      insurance: "",
      registrationDateFrom: "",
      registrationDateTo: "",
      coachNotAssigned: false,
    });
  };
  useEffect(() => {
    handleClear();
  }, []);

  useEffect(() => {
    if (filterText || filterText === "" || filter) {
      refetch();
    }
  }, [filterText, filter]);

  const onClose = () => {
    setSelectedRowId(null);
    setDeleteModal(false);
    setApproveModal(false);
    setAssignModal(false);
    setMonthlyReview(false);
    setDiagnosisModal(false);
  };

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTempFilter((prevState) => ({

      ...prevState,
      [name]: value,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleDateChange = (name, date) => {
    setTempFilter((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleDeleteModal = (rowId) => {
    setSelectedRowId(rowId);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteModal(false);
    setSelectedRowId(null);
  };

  const handleApproveModal = (rowId) => {
    setSelectedRowId(rowId._id);
    setApproveModal(true);
  };

  const handleApprovalConfirm = () => {
    if (!selectedRowId) return;
    const payload = {
      approvePatient: {
        status: "active",
        actorId: id,
        actorType: actorType
      }
    };
    approvePendingPatient({ id: selectedRowId, payload: payload });
  };

  const handleAssignModal = (rowId) => {
    setSelectedRowId(rowId);
    setAssignModal(true);
  };
  const handleAssignConfirm = () => {
    setAssignModal(false);
    setSelectedRowId(null);
  };

  const handleApplyFilter = () => {
    setFilter(tempFilter);
  };
  const handleDiagnosisModal = (row) => {
    setSelectedRowId(row);
    setDiagnosisModal(true);
  };
  const approvedColumns = columnsApproved({
    pending: currentTab === "Pending Approval",
    handleApproveModal,
    handleAssignModal,
    handleDeleteModal,
    handleDiagnosisModal,
    handleSort,
    sortField: sortConfig.field,
    sortDirection: sortConfig.direction,
  });

  // Watchlist columns with only Name and Location
  const watchlistColumns = [
    {
      name: 'Name',
      selector: (row) => row?.last_name,
      cell: (row) => (
        <div
          className="w-100"
          style={{ cursor: 'pointer' }}
          onClick={() => navigateMypatientDetail(row)}
        >
          {`${row?.last_name ? row?.last_name : ''} ${row?.middle_name ? row?.middle_name?.charAt(0)?.toUpperCase() : ''} ${row?.first_name ? row?.first_name : ''}`}
        </div>
      ),
      sortable: true,

    },
    {
      name: 'Location',
      selector: (row) => row?.city,
      cell: (row) => {
        const loc = row?.address_line_1
          ? `${row?.city || ''}${row?.city && row?.state ? ', ' : ''}${row?.state || ''}${row?.city || row?.state ? ', USA' : ''}`
          : '';
        return (
          <div
            className="d-flex justify-content-between align-items-center w-100"
            style={{ cursor: 'pointer' }}
            onClick={() => navigateMypatientDetail(row)}
          >
            <span>{loc}</span>
            <img src={RightArrow} alt="RightArrow" height={20} className="me-2" />
          </div>
        );
      },
      sortable: true,

    },
  ];



  const handleChangePage = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage + 1,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({
      rowsPerPage: parseInt(event.target.value, 10),
      currentPage: 1,
    });
  };



  const onclose = () => {
    setFilterCanvas(false);
  };

  return (
    <>
      <div className="main-container mt-4">
        <div className="d-flex justify-content-between">
          <div>
            <h6>
              <strong className="title-color">My Patients</strong>
            </h6>
          </div>
          <div className="d-flex flex-wrap align-items-center justify-content-between mx-2">
            <div className="flex-grow-1 me-3 mb-2">
              <FilterComponent
                placeholder={"Search patient by name"}
                onFilter={(e) => setFilterText(e.target.value)}
                filterText={filterText}
              />
            </div>
            <div className="me-3 mb-2">
              <button
                className="btn filter-btn d-flex align-items-center"
                onClick={() => setFilterCanvas(true)}
              >
                <img loading="lazy" src={Filter} height={14} width={12.26} />
                <span className="ms-2">Filters</span>
              </button>
            </div>
            <div className="mb-2">
              <button
                type="button"
                className="add-practice flex-items-center"
                onClick={() => setAddPatientModal(true)}
              >
                <img loading="lazy" src={AddIcon} height={14} width={14} alt="" />
                <span className="ms-2">Add New</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <TabContext value={currentTab}>
        <Box>
          <TabList
            onChange={(e, value) => {
              setCurrentTab(value);
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
            aria-label="My patients tabs"
          >
            <Tab label="Approved" value="Approved" />
            <Tab label="Pending Approval" value="Pending Approval" />
          </TabList>
        </Box>
      </TabContext>
      <div className=" mt-2 ">
        <ApprovedPatient
          customStyles={customStylesProvider}
          columns={approvedColumns}
          filteredItems={getPatientList?.data}
          page={pagination?.currentPage}
          rowsPerPage={pagination?.rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          filteredApprovedItems={getPatientList}
          setFilterText={setFilterText}
          filterText={filterText}
          pointerShow={currentTab === "Approved"}
          handleNavigateRowClick={() => {}}
          navigateMypatientDetail={navigateMypatientDetail}
          isPatientLoading={isPatientLoading}
          handleSort={handleSort}
          sortField={sortConfig.field}
          sortDirection={sortConfig.direction}
        />
      </div>
      <div className="default-container bg-white mt-3">
        <strong className="title-color ">My Close Watchlist</strong>
        <div className="mt-3">
          <DataTable
            columns={watchlistColumns}
            data={watchedListArray}
            customStyles={customStyles}
            sortIcon={<img loading="lazy" src={Sorticon} />}
            highlightOnHover
            pointerOnHover
            onRowClicked={(row) => navigateMypatientDetail(row)}
            progressPending={watchlistedPatiensLoading}
          />

        </div>
      </div>

      <div className="default-container bg-white mt-3">
        <Accordion
          defaultExpanded={false}
          className="rounded-1 accordion-spacing"
        >
          <AccordionSummary
            className="header-reports"
            expandIcon={<ExpandMoreIcon />}
            aria-controls="coach-alerts-content"
            id="coach-alerts-header"
          >
            <Typography variant="h6" className="fw-bold text-white">
              Coach Alert Messages
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="row mt-3 p-2">
              {alertMessage?.map((msg, index) => {
                return (
                  <div key={index} className="col-12 col-sm-6 col-md-4 mb-3">
                    <div
                      className="border-2 h-100 coach-messages"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        borderRadius: "8px",
                        background: "#fff"
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center pt-3">
                        <div className="outcome-card-header-cancat-orange"></div>
                        <div className="main-outcome-div">
                          <strong style={{ color: "#007E9E" }}>
                            {`${msg?.coach_id?.last_name || "-"} 
                      ${msg?.coach_id?.middle_name ? msg.coach_id.middle_name.charAt(0).toUpperCase() : ""} 
                      ${msg?.coach_id?.first_name || ""}`}
                          </strong>
                          <small>
                            {formatDate(msg?.createdAt, "MM/dd/yyyy hh:mm a")}
                          </small>
                        </div>
                      </div>
                      <div>
                        <p className="mt-1 mb-0 ps-3" style={{ fontSize: "14px" }}>
                          {msg?.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      <>
        <FilterCanvas
          visible={filterCanvas}
          setVisible={setFilterCanvas}
          handleDateChange={handleDateChange}
          filter={filter}
          setFilter={setFilter}
          handleApplyFilter={handleApplyFilter}
          handleInputChange={handleFilterChange}
          handleCheckboxChange={handleFilterChange}
          coachList={coachList}
          tempFilter={tempFilter}
          handleClear={handleClear}
          getPatientList={getPatientList}
          onclose={onclose}
        />
      </>
      <ApproveModal
        selectedRowId={selectedRowId}
        approveModal={approveModal}
        onConfirm={handleApprovalConfirm}
        content={"Do you want to Approve this Patient?"}
        onClose={onClose}
      />
      <AssignModal
        onClose={onClose}
        onConfirm={handleAssignConfirm}
        assignModal={assignModal}
      />
      <DeleteModal
        onClose={onClose}
        onConfirm={handleDeleteConfirm}
        deleteModal={deleteModal}
        content="Do you really want to Delete this Patient?"
      />
      <DiagnosisModal
        onClose={onClose}
        diagnosisModal={diagnosisModal}
        selectedRowId={selectedRowId}
      />
      <MonthlyReview
        monthlyReview={monthlyReview}
        onClose={onClose}
      />
      <AddPatient
        visible={addPatientModal}
        setVisible={setAddPatientModal}
        refetch={refetch}
      />
    </>
  );
};

export default MyPatients;