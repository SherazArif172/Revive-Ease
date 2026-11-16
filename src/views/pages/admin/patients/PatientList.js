import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import React, { useEffect, useState } from "react";
import ApproveModal from "../../../../Components/Modal/ApproveModal";
import AssignModal from "../../../../Components/Modal/AssignModal";
import DeleteModal from "../../../../Components/Modal/DeleteModal";
import Filter from "../../../../assets/icons/filter.png";
import FilterComponent from "../../../../utils/FilterComponent";
import ApprovedPatient from "../../provider/ApprovedPatient";
import PendingPatient from "../../provider/PendingPatient";
import DeletedPatient from "../../provider/DeletePatient";
import { useApprovePendingPatientMutation, useAssignCoachProviderToPatientMutation, useGetAllPatientQuery, useActivatePatientMutation } from "../../../../redux/apis/allPatient_api";
import { useSelector } from "react-redux";
import { customStylesPatient } from "../../../../Components/DataTable/CustomStyle";
import { createColumnsPatient } from "../../../../Components/DataTable/commonColumn";
import FilterCanvas from "../../../../Components/DataTable/FilterCanva";
import { useDeleteClinicUserMutation } from "../../../../redux/apis/clinic_api";
import PatientEdit from "./PatientEdit";
import AddPatient from "./AddPatient";
import AddIcon from "../../../../assets/icons/plus.png";
import DeleteConfirmationModal from "../../../../Components/Modal/DeleteConfirmationModal";
import { toast } from "react-toastify";
import DiagnosisModal from "../../../../Components/Modal/DiagnosisModal";
import { useNavigate } from "react-router-dom";
// import debounce from "lodash/debounce";
const PatientList = () => {
  const navigate = useNavigate();
  const userType = useSelector((state) => state?.user?.userType);
  const clinicCode = useSelector((state) => state?.user?.userData?.clinic_id);
  const filteredApprovedItems = useSelector((state) => state?.allPatients?.patients?.approved);
  const filteredPendingItems = useSelector((state) => state?.allPatients?.patients?.pending);
  const filteredDeletedItems = useSelector((state) => state?.allPatients?.patients?.deleted);
  const id = useSelector((state) => state?.user?.id);

  const [currentTab, setCurrentTab] = useState("Approved");
  const [filterText, setFilterText] = useState("");
  const [visible, setVisible] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [approveModalConfirm, setApproveModalConfirm] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [diagnosisModal, setDiagnosisModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [addPatientModal, setAddPatientModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedRow, selectedRowData] = useState(null);
  const [selectedRowClinicId, setClininIdData] = useState(null);
  // const [errmsg, setErrMsg] = useState(false);
  const [approveModalContent, setApproveModalContent] = useState("Do you want to Approve this Patient?");
  const [approvalError, setApprovalError] = useState("");
  const subHeaderComponentMemo = "";
  const [pagination, setPagination] = useState({
    rowsPerPage: 10,
    currentPage: 1,
  });
  const [formData, setFormData] = useState({
    coach_id: "",
    provider_id: "",
  });
  const [tempFilter, setTempFilter] = useState({
    first_name: "",
    userId: "",
    userName: "",
    coachName: "",
    provider: "",
    insurance: "",
    diagnosis: "",
    registrationDateFrom: null,
    registrationDateTo: null,
    coachNotAssigned: false,
    providerRadio: false,
    diagnosisActive: false,
    insuranceActive: false
  });
  const [filter, setFilter] = useState({
    first_name: "",
    userId: "",
    userName: "",
    coachName: "",
    provider: "",
    insurance: "",
    diagnosis: "",
    registrationDateFrom: "",
    registrationDateTo: "",
    coachNotAssigned: false,
    providerRadio: false,
    diagnosisActive: false,
    insuranceActive: false
  });

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        provider_id: selectedRow?.provider?._id,
        coach_id: selectedRow?.coach?._id,
      });
    }
  }, [selectedRow]);

  const onclose = () => {
    setVisible(false);
    setEditModal(false);
    refetch();
  };
  const [sortConfig, setSortConfig] = useState({
    field: '',
    direction: 'asc'
  });

  // const handleSort = useCallback(
  //   debounce((field, direction) => {
  //     setSortConfig({ field, direction });
  //   }, 300),
  //   []
  // );

  const handleSort = (fieldOrColumn, sortDirection) => {
    const sortField =
      typeof fieldOrColumn === 'string'
        ? fieldOrColumn
        : fieldOrColumn?.sortField || fieldOrColumn?.selector || fieldOrColumn?.id || '';
    setSortConfig({ field: sortField, direction: sortDirection });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Cleanup is only needed if `handleSort` is debounced. Since it's a plain
  // function now, there is nothing to cancel. If you reintroduce debounce,
  // add back the cancel call here.

  // eslint-disable-next-line no-unused-vars
  const { data: getPatientLists, refetch, isLoading: isPatientLoading } = useGetAllPatientQuery({
    filterText: filterText,
    filter: filter,
    clinic_id: clinicCode,
    page: pagination?.currentPage,
    rowsPerPage: pagination?.rowsPerPage,
    currentTab: currentTab,
    sortField: sortConfig.field,
    sortDirection: sortConfig.direction
  }, {
    // Remove refetchOnMountOrArgChange to prevent double calls
    refetchOnMountOrArgChange: true
  });
  const [assignCoachProviderToPatient, { isSuccess: assignCoachProviderToPatientSuccess }] = useAssignCoachProviderToPatientMutation();


  const [activatePatient, { isSuccess: patientActivatedSuccess }] = useActivatePatientMutation();
  const [approvePendingPatient, { isSuccess: approvedSuccess }] = useApprovePendingPatientMutation();
  const [deletePatient, { isSuccess: isPatientDelete }] = useDeleteClinicUserMutation();



  useEffect(() => {
    if (approvedSuccess) {
      setApproveModal(false);
      setApproveModalConfirm(true);
      setFormData({
        coach_id: "",
        provider_id: "",
      });
    }

    if (patientActivatedSuccess) {
      toast.success("Patient is Activated successfully!");

    }
  }, [approvedSuccess, patientActivatedSuccess]);

  useEffect(() => {
    if (assignCoachProviderToPatientSuccess) {
      if (userType === "clinic admin") {
        toast.success("Provider assigned successfully!");
      }
      else {
        toast.success("Coach and provider assigned successfully!");
      }
    }

  }, [assignCoachProviderToPatientSuccess]);

  useEffect(() => {
    if (currentTab === "Pending Approval") {
      setPagination({
        rowsPerPage: 10,
        currentPage: 1
      });
    }
  }, [currentTab]);

  useEffect(() => {
    if (isPatientDelete) {
      setDeleteModal(false);
      setDeleteConfirmationModal(true);
      refetch();
    }
  }, [isPatientDelete]);

  const onClose = () => {
    setSelectedRowId(null);
    setDeleteConfirmationModal(false);
    setDeleteModal(false);
    setApproveModal(false);
    setAssignModal(false);
    setDiagnosisModal(false);
    setApprovalError("");
    setTimeout(() => {
      setApproveModalContent("Do you want to Approve this Patient?");
    }, 1000);
  };
  const handleApplyFilter = () => {
    // Only include relevant fields in the filter
    setFilter({
      ...tempFilter,
      provider: tempFilter.provider, // should be provider _id from dropdown
      insurance: tempFilter.insurance, // should be insurance value from dropdown
      diagnosis: tempFilter.diagnosis, // should be diagnosis value from dropdown
    });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page when applying filters
    setVisible(false);
  };
  const handleActivateModal = (patient) => {
    const payload = {
      patientActivate: true,
      actorId: id,
      actorType: userType
    };
    activatePatient({ payload: payload, patientId: patient?._id });

  };

  const handleDeleteModal = (rowId) => {
    setSelectedRowId(rowId);
    setDeleteModal(true);
  };
  const handleDeleteConfirm = () => {
    deletePatient({ id: selectedRowId?._id, actorId: id, actorType: userType });
    setDeleteModal(false);
    setSelectedRowId(null);
  };

  const handleApprovalConfirm = () => {
    const provider_id = formData?.provider_id ? formData?.provider_id : selectedRow?.provider?._id;
    const coach_id = formData?.coach_id ? formData?.coach_id : selectedRow?.coach?._id;

    if (userType === "clinic admin" && !provider_id) {
      setApprovalError("Provider is required before approval");
      setTimeout(() => {
        setApprovalError("");
      }, 3000);
      return;

    }

    if ((userType === "admin" || userType === "sub admin") && (!provider_id || !coach_id)) {
      setApprovalError("Both provider and coach is required before approval");
      setTimeout(() => {
        setApprovalError("");
      }, 3000);
      return;
    }

    let payloadAdminApprove = {
      approvePatient: {
        approval: "approved",
        provider_id: provider_id,
        coach_id: coach_id,
        actorId: id,
        actorType: userType
      }
    };

    let payloadClinicAdminApprove = {
      approvePatient: {
        approval: "approved",
        provider_id: provider_id,
        actorId: id,
        actorType: userType
      }
    };

    approvePendingPatient({
      id: selectedRowId,
      payload: (userType === "admin" || userType === "sub admin") ? payloadAdminApprove : payloadClinicAdminApprove,
    });
  };
  const handleAssignModal = (rowId) => {
    setSelectedRowId(rowId._id);
    selectedRowData(rowId);
    setClininIdData(rowId?.clinic_id);
    setAssignModal(true);
  };

  const handleApproveModal = (rowId) => {
    setSelectedRowId(rowId._id);
    setApproveModal(true);
    setClininIdData(rowId?.clinic_id);
  };
  const handleAssignConfirm = () => {
    let payloadAdmin = {
      assignCoachProvider: {
        provider_id: formData?.provider_id ? formData?.provider_id : selectedRow?.provider?._id,
        coach_id: formData?.coach_id ? formData?.coach_id : selectedRow?.coach?._id,
        actorId: id,
        actorType: userType
      }
    };
    let payloadClinicAdmin = {
      assignCoachProvider: {
        provider_id: formData?.provider_id ? formData?.provider_id : selectedRow?.provider?._id,
        actorId: id,
        actorType: userType
      }
    };
    assignCoachProviderToPatient({ payload: (userType === "admin" || userType === "sub admin") ? payloadAdmin : payloadClinicAdmin, patientId: selectedRowId });
    setAssignModal(false);
    setSelectedRowId(null);
  };


  const handleDateChange = (name, date) => {
    // Defer state update to avoid ResizeObserver loop when calendar month
    // prev/next is clicked (react-datepicker resize + layout in same frame).
    const applyUpdate = () => {
      setTempFilter((prev) => {
        const updatedFilter = {
          ...prev,
          [name]: date,
        };

        // If startDate is being set and endDate is null, set endDate to today
        if (name === "registrationDateFrom" && date && !prev.registrationDateTo) {
          updatedFilter.registrationDateTo = new Date();
        }

        return updatedFilter;
      });
    };
    if (typeof window.requestAnimationFrame === "function") {
      requestAnimationFrame(applyUpdate);
    } else {
      setTimeout(applyUpdate, 0);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setFilterText("");
    handleClear();
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempFilter((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditModal = (row) => {
    setSelectedRowId(row);
    setEditModal(true);
  };

  const handleDiagnosisModal = (row) => {
    setSelectedRowId(row);
    setDiagnosisModal(true);
  };

  const columnsApproved = createColumnsPatient({
    isApproved: true,
    currentTab,
    handleApproveModal,
    handleAssignModal,
    handleDeleteModal,
    userType,
    handleEditModal,
    handleDiagnosisModal,

  });

  const columnsPending = createColumnsPatient({
    isApproved: false,
    currentTab,
    handleApproveModal,
    handleAssignModal,
    handleDeleteModal,
    userType,
    handleEditModal,

  });

  const columnsDeleted = createColumnsPatient({
    isApproved: false,
    currentTab: "Deleted",
    handleApproveModal,
    handleAssignModal,
    handleDeleteModal,
    userType,
    handleEditModal,
    handleActivateModal,

  });

  const handleClear = () => {
    setTempFilter({
      first_name: "",
      userId: "",
      userName: "",
      coachName: "",
      provider: "",
      insurance: "",
      diagnosis: "",
      registrationDateFrom: null,
      registrationDateTo: null,
      coachNotAssigned: false,
      providerRadio: false,
      diagnosisActive: false,
      insuranceActive: false
    }),
      setFilter({
        userId: "",
        userName: "",
        coachName: "",
        provider: "",
        insurance: "",
        diagnosis: "",
        registrationDateFrom: "",
        registrationDateTo: "",
        coachNotAssigned: false,
        providerRadio: false,
        diagnosisActive: false,
        insuranceActive: false
      });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page when clearing filters
  };

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

  const handleNavigateRowClick = (row) => {
    const route = (userType === "admin" || userType === "sub admin")
      ? "/admin/patient-detail"
      : userType === "clinic admin"
      ? "/clinic/patient-detail"
      : "/patient-detail"; // fallback

    // Defer navigation so the DataTable's ResizeObserver can finish (avoids
    // "ResizeObserver loop completed with undelivered notifications").
    setTimeout(() => {
      try {
        navigate(route, { state: { ...row } });
      } catch (error) {
        console.log("Please try again.");
      }
    }, 0);
  };

  return (
    <>
      <div className="main-container mt-4">
        <div className="d-flex justify-content-between">
          <div className="font-color">
            <h6>
              <strong>Patients</strong>
            </h6>
          </div>
          <div className="d-flex flex-wrap align-items-center justify-content-between mx-2">
            <div className="flex-grow-1 me-3 mb-2">
              <FilterComponent
                placeholder={"Search Patient by name & email"}
                onFilter={(e) => {
                  setFilterText(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page when search text changes
                }}
                filterText={filterText}
              />
            </div>
            <div className="me-3 mb-2">
              <button
                className="btn filter-btn d-flex align-items-center"
                onClick={() => setVisible(true)}
              >
                <img loading="lazy" src={Filter} height={14} width={12.26} />
                <span className="ms-2">Filters</span>
              </button>
            </div>
            {(userType === "admin" || userType === "sub admin") && (
              <div className="mb-2">
                <button
                  className="add-practice flex-items-center"
                  onClick={() => setAddPatientModal(true)}
                >
                  <img loading="lazy" src={AddIcon} height={14} width={14} alt="" />
                  <span className="ms-2">Add New</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className=" mt-2 ">
          <TabContext value={currentTab}>
            <Box>
              <TabList
                className=""
                onChange={handleTabChange}
                aria-label="lab API tabs example"
              >
                <Tab label="Approved" value="Approved" />
                <Tab label="Pending Approval " value="Pending Approval" />
                <Tab label="Inactive" value="Deleted" />
              </TabList>
            </Box>
            <TabPanel value="Approved">
              {currentTab && currentTab === "Approved" && (
                <ApprovedPatient
                  columns={columnsApproved}
                  customStyles={customStylesPatient}
                  subHeaderComponentMemo={subHeaderComponentMemo}
                  filteredItems={filteredApprovedItems?.data}
                  page={pagination?.currentPage}
                  rowsPerPage={pagination?.rowsPerPage}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                  setFilterText={setFilterText}
                  filterText={filterText}
                  filteredApprovedItems={filteredApprovedItems}
                  isPatientLoading={isPatientLoading}
                  handleNavigateRowClick={handleNavigateRowClick}
                  handleSort={handleSort}
                  sortField={sortConfig.field}
                  sortDirection={sortConfig.direction}

                />
              )}
            </TabPanel>
            <TabPanel value="Pending Approval">
              {currentTab && currentTab === "Pending Approval" && (
                <PendingPatient
                  columns={columnsPending}
                  customStyles={customStylesPatient}
                  subHeaderComponentMemo={subHeaderComponentMemo}
                  page={pagination?.currentPage}
                  rowsPerPage={pagination?.rowsPerPage}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                  filteredItems={filteredPendingItems?.data}
                  setFilterText={setFilterText}
                  filterText={filterText}
                  filteredPendingItems={filteredPendingItems}
                  approveModalConfirm={approveModalConfirm}
                  setApproveModalConfirm={setApproveModalConfirm}
                  isPatientLoading={isPatientLoading}
                  handleSort={handleSort}
                  sortField={sortConfig.field}
                  sortDirection={sortConfig.direction}

                />
              )}
            </TabPanel>
            <TabPanel value="Deleted">
              {currentTab && currentTab === "Deleted" && (
                <DeletedPatient
                  columns={columnsDeleted}
                  customStyles={customStylesPatient}
                  subHeaderComponentMemo={subHeaderComponentMemo}
                  filteredItems={filteredDeletedItems?.data}
                  page={pagination?.currentPage}
                  rowsPerPage={pagination?.rowsPerPage}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                  setFilterText={setFilterText}
                  filterText={filterText}
                  filteredDeletedItems={filteredDeletedItems}
                  isPatientLoading={isPatientLoading}
                  handleSort={handleSort}
                  sortField={sortConfig.field}
                  sortDirection={sortConfig.direction}
                />
              )}
            </TabPanel>
          </TabContext>
        </div>


        <FilterCanvas
          handleDateChange={handleDateChange}
          tempFilter={tempFilter}
          handleApplyFilter={handleApplyFilter}
          visible={visible}
          setVisible={setVisible}
          filter={filter}
          setFilter={setFilter}
          handleInputChange={handleFilterChange}
          handleCheckboxChange={handleFilterChange}
          handleClear={handleClear}
          getPatientList={currentTab === "Approved" ? filteredApprovedItems : filteredPendingItems}
          currentTab={currentTab}
          onclose={onclose}
          clinic_id={clinicCode}
        />


      </div>
      <ApproveModal
        selectedRowId={selectedRowId}
        approveModal={approveModal}
        onConfirm={handleApprovalConfirm}
        content={approveModalContent}
        onClose={onClose}
        setFormData={setFormData}
        formData={formData}
        selectedRow={selectedRow}
        selectedRowClinicId={selectedRowClinicId}
        errorMsg={approvalError}


      />
      <AssignModal
        selectedRowId={selectedRowId}
        onClose={onClose}
        onConfirm={handleAssignConfirm}
        assignModal={assignModal}
        setFormData={setFormData}
        formData={formData}
        selectedRowClinicId={selectedRowClinicId}
        selectedRow={selectedRow}
      />
      <PatientEdit
        selectedRowId={selectedRowId}
        editModal={editModal}
        setEditModal={setEditModal}
        onclose={onclose}
        refetch={refetch}
      />
      <AddPatient
        visible={addPatientModal}
        setVisible={setAddPatientModal}
        refetch={refetch}
      />
      <DeleteConfirmationModal
        confirmationModal={deleteConfirmationModal}
        content={"The Patient Deleted Successfully."}
        onClose={onClose}

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
    </>
  );
};

export default PatientList;
