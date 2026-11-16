import {
  CBreadcrumb,
  CBreadcrumbItem,
  CModal,
  CModalBody,
  CModalTitle,
} from "@coreui/react";
import {
  validateRequired,
  validateEmail,
  validateLength,
  usAutomaticCalidation,
  validateSelectOption,
} from "../../../../utils/inputValidation";
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Filter from "../../../../assets/icons/filter.png";
import Addbutton from "../../../../assets/icons/plus.png";
import Sorticon from "../../../../assets/icons/sort.png";
import Copy from "../../../../assets/icons/copy.png";
import routeConfig from "../../../../routes";
import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import { Badge } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import FilterComponent from "../../../../utils/FilterComponent";
import SelectProvider from "./SelectProvider";
import ViewSelectedProvider from "./ViewSelectedProvider";
import {
  useGetClinicRecordQuery,
  useDeleteClinicUserMutation,
  useUpdateClinicUserMutation,
  useAddClinicUserMutation,
} from "../../../../redux/apis/clinic_api";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import PaginationComponent from "../../../../utils/Pagination";
import AddUserConfirmationModal from "./AddUserConfirmationModal";
import { customStylesClinicDetails } from "../../../../Components/DataTable/CustomStyle";
import AddNewProvider from "./AddNewProvider";
import { columnsClinicDetails } from "../../../../Components/DataTable/commonColumn";
import DeleteModal from "../../../../Components/Modal/DeleteModal";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";
import PatientEdit from "../patients/PatientEdit";

const ClinicDetail = () => {
  const onclose = () => {
    setVisible(false);
    setAddNewUser(false);
    setCloneUser(false);
    setUpdateUser(false);
    setEditPatientModal(false);
    setSelectedPatientRow(null);
    setErrors({
      md_type: "",
      first_name: "",
      last_name: "",
      city: "",
      state: "",
      zipCode: "",
      cell_number: "",
      userName: "",
      password: "",
      confirmPassword: "",
      email: "",
      webAddress: "",
      userType: "",
      passwordMatch: "",
    });
  };

  const [filterText, setFilterText] = useState("");
  const [visible, setVisible] = useState(false);
  const [addNewUser, setAddNewUser] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalPatient, setDeleteModalPatient] = useState(false);
  const [ressignModal, setRessignModal] = useState(false);
  const [reassignForm, setReassignForm] = useState({
    coach_id: "",
    provider_id: "",
  });
  const [ressignTigger, setRessignTigger] = useState(false);
  const userType = useSelector((state) => state?.user?.userType);
  const [updateUser, setUpdateUser] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    md_type: "",
    middle_name: "",
    email: "",
    cell_number: "",
    gender: "",
    userType: "provider",
  });
  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    md_type: "",
    city: "",
    state: "",
    zipCode: "",
    cell_number: "",
    userName: "",
    password: "",
    confirmPassword: "",
    email: "",
    webAddress: "",
    userType: "",
    passwordMatch: "",
  });
  const [cloneUser, setCloneUser] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [editPatientModal, setEditPatientModal] = useState(false);
  const [selectedPatientRow, setSelectedPatientRow] = useState(null);
  const [filter, setFilter] = useState({
    filterText: "",
    status: "",
    startDate: "",
    endDate: "",
    userType: ""
  });
  const location = useLocation();
  const [edit, setEdit] = useState(null);
  const [tempFilter, setTempFilter] = useState({
    startDate: null,
    endDate: null,
    status: "",
    userType: ""
  });
  const [btnDisable, setBtnDisable] = useState(false);
  const clinic_name = location?.state?.clinic_name;
  const id = location.state?.clinic_id;
  const revive_admin_id = useSelector((state) => state.user?.id);
  const clinicRecord = useSelector((state) => state?.allClinics?.ClinicRecord);
  const clinic = useSelector((state) => state?.allClinics?.ClinicRecord?.data);

  // eslint-disable-next-line no-unused-vars
  const { data: getRecord, refetch,
    isLoading: isClinicDetailLoading,
  } = useGetClinicRecordQuery({
    id,
    filter: filter,
    filterText: filterText,
    page: page,
    rowsPerPage: rowsPerPage,
  });
  const [deleteClinicUser, { data, isSuccess: isDeleteSuccess }] =
    useDeleteClinicUserMutation();
  const [
    addClinicUser,
    {
      isLoading: isAddProviderLoading,
      isSuccess: isAddSuccess,
      isError: AddProviderError,
      error,
    },
  ] = useAddClinicUserMutation();
  const [updateClinicUser, { isSuccess: updateClincUser }] =
    useUpdateClinicUserMutation();
  // eslint-disable-next-line no-unused-vars


  const address = clinicRecord?.data?.address_line_1 || "";
  const userNameHeader = clinicRecord?.data?.userName || "";
  const cellNumberHeader = clinicRecord?.data?.cell_number || "";
  const emailHeader = clinicRecord?.data?.email || "";
  const clinicNameHeader = clinicRecord?.data?.clinic_name || "";
  const cityHeader = clinicRecord?.data?.city || "";
  const stateHeader = clinicRecord?.data?.state || "";
  const zipcodeHeader = clinicRecord?.data?.zip_code || "";
  const scanClinicLink = clinicRecord?.data?.scanClinicLink || "";

  useEffect(() => {
    if (isAddProviderLoading) {
      setBtnDisable(true);
    }
    if (isAddSuccess) {
      setBtnDisable(false);
    }
    if (AddProviderError) {
      setBtnDisable(false);
    }
  }, [AddProviderError, isAddProviderLoading, AddProviderError]);

  useEffect(() => {
    setErrMsg(error?.data?.message);
    if (error?.data?.message) {
      setTimeout(() => {
        setErrMsg("");
      }, 3000);
    }
  }, [error]);

  useEffect(() => {
    if (page > 0 || rowsPerPage) {
      refetch();
    }
  }, [rowsPerPage, page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  useEffect(() => {
    if (updateClincUser) {
      if (edit?.userType === "Patient") {
        toast?.success("Patient updated successfully!");
      } else {
        toast?.success("Provider updated successfully!");
      }
    }
  }, [updateClincUser]);

  useEffect(() => {
    if (isAddSuccess) {
      setUserModal(true);
      handleClose();
      setAddNewUser(false);
      setCloneUser(false);
    }
  }, [isAddSuccess, AddProviderError]);

  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case "md_type":
        error = validateSelectOption(value);
        break;
      case "first_name":
        error = validateRequired(value) || validateLength(value, 2, 50);
        break;

      case "last_name":
        error = validateRequired(value);
        break;
      case "email":
        error = validateRequired(value) || validateEmail(value);
        break;
      case "cell_number": {
        const { formattedValue, error: validationError } =
          usAutomaticCalidation(value);
        value = formattedValue;
        error = validateRequired(value) || validationError;
        break;
      }
      default:
        break;
    }
    return error;
  };
  const handleValidation = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateClinic = () => {
    try {
      if (handleValidation()) {
        const payload = {
          clinic_id: id,
          md_type: formData.md_type,
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_name: formData?.middle_name,
          cell_number: formData.cell_number,
          actorId: revive_admin_id,
          actorType: userType
        };
        const reponses = updateClinicUser({
          updateData: payload,
          userId: edit?.object_id || edit?._id,
        });
        if (reponses) {
          setUpdateUser(false);
        }
      }
    } catch (error) {
      console.error("Error updating clinic user:", error);
    }
  };

  const handleClear = () => {
    setFormData({
      first_name: "",
      last_name: "",
      md_type: "",
      middle_name: "",
      email: "",
      cell_number: "",
      gender: "",
      userType: "provider",
    });
  };

  const handleClose = () => {
    setAddNewUser(false);
    setFormData({
      first_name: "",
      last_name: "",
      md_type: "",
      middle_name: "",
      email: "",
      cell_number: "",
      gender: "",
      userType: "provider",
    });
    setErrors("");
  };

  useEffect(() => {
    if (filter || filterText) {
      refetch();
    }
  }, [filter, filterText]);

  const { adminRoutes, providerRoutes } = routeConfig;
  const filterPlaceholder = "Search";
  const selectedRoutes = userType === "Admin" ? adminRoutes : providerRoutes;
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const segmentNames = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const matchedRoute = selectedRoutes.find((route) => route.path === path);
    let routeName = matchedRoute
      ? matchedRoute.name
      : segment.charAt(0).toUpperCase() + segment.slice(1);
    if (path === "/clinics" && index === 0) {
      routeName = "List of Clinics";
    } else if (path === "/clinics/clinicDetail" && index === 1) {
      routeName = "Clinic Detail";
    }
    return matchedRoute && matchedRoute.badge ? (
      <>
        {routeName}{" "}
        <Badge eolor="primary" pill>
          {matchedRoute.badge}
        </Badge>
      </>
    ) : (
      routeName
    );
  });

  const subHeaderComponentMemo = "";
  const filteredItems = clinicRecord?.data?.data?.clinic_data?.filter(
    (item) =>
      item.first_name &&
      item.last_name &&
      `${item.first_name} ${item.last_name}`
        .toLowerCase()
        .includes(filterText.toLowerCase())
  );

  const confirmDeleteUser = () => {
    setRessignModal(true);
  };

  const confirmDeletePatient = () => {
    deleteClinicUser({ id: edit?._id, actorId: revive_admin_id, actorType: userType });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!handleValidation()) return;

    try {
      const userPayload = {
        md_type: formData.md_type,
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name,
        email: formData.email,
        cell_number: formData.cell_number,
        userType: formData?.userType
          ? formData.userType.charAt(0).toLowerCase() +
          formData.userType.slice(1)
          : "provider",
        clinic_id: id,
        actorId: revive_admin_id,
        actorType: userType
      };

      await addClinicUser(userPayload);
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
    let error = null;

    if (name === "cell_number") {
      const { formattedValue, error: validationError } =
        usAutomaticCalidation(value);
      newValue = formattedValue;
      error = validateRequired(newValue) || validationError;
    } else {
      error = validateField(name, value);
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: newValue,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const onChangeSelect = (e) => {
    const { name, value } = e.target;
    setReassignForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (isDeleteSuccess && edit?.userType === "Provider") {
      setRessignTigger(true);
    } else if (isDeleteSuccess && edit?.userType === "Patient") {
      setDeleteModalPatient(false);
    }
  }, [isDeleteSuccess]);

  const ressignHandler = () => {
    let payload = {
      new_assignee_id: reassignForm?.provider_id
    };
    deleteClinicUser({ id: edit?.object_id || edit?._id, reassigId: payload, actorId: revive_admin_id, actorType: userType });
  };

  const handleOnClear = () => {
    setFilter({
      filterText: "",
      status: "",
      startDate: "",
      endDate: "",
      userType: ""
    });
    setTempFilter({
      startDate: null,
      endDate: null,
      status: "",
      userType: ""
    });
  };
  const handleDateChange = (name, date) => {
    setTempFilter((prev) => {
      const updatedFilter = {
        ...prev,
        [name]: date,
      };

      if (name === "startDate" && date && !prev.endDate) {
        updatedFilter.endDate = new Date();
      }

      return updatedFilter;
    });
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilter((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const closeRessign = () => {
    setDeleteModal(false);
    setRessignModal(false);
    setRessignTigger(false);
    setDeleteModalPatient(false);
  };

  const handleApplyFilter = () => {
    setFilter(tempFilter);
    setVisible(false);
  };

  const handleEditClick = (row) => {
    if (row?.userType === "Patient") {
      setSelectedPatientRow(row);
      setEditPatientModal(true);
    } else {
      setUpdateUser(true);
      setFormData(row);
      setEdit(row);
    }
  };

  const columns = columnsClinicDetails({
    clinic,
    setCloneUser,
    setFormData,
    setUpdateUser,
    setEdit,
    setDeleteModal,
    setDeleteModalPatient,
    handleEditClick,
  });
  const tableData =
    filteredItems?.length > 0
      ? filteredItems
      : clinicRecord?.data?.clinic_data || [];
  return (
    <>
      <div className="main-container mt-3 p-2">
        <div>
          <CBreadcrumb>
            {pathSegments.map((segment, index) => {
              const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
              const isLastSegment = index === pathSegments.length - 1;
              return (
                <CBreadcrumbItem key={path} active={isLastSegment}>
                  {isLastSegment ? (
                    segmentNames[index] || segment
                  ) : (
                    <NavLink to={path}>
                      {segmentNames[index] || segment}
                    </NavLink>
                  )}
                </CBreadcrumbItem>
              );
            })}
          </CBreadcrumb>
        </div>
        <div className="container-fluidic ps-3 pt-4 bg-white ">
          <h4>
            <strong>{clinicNameHeader || "Loading..."}</strong>
          </h4>
          <div className="row g-3 d-flex justify-content-between col-md-12  ">
            <div className="col-md-2 col-sm-6 py-2">
              <label className="label-headerinfo">Name</label>
              <div className="text-truncate">{userNameHeader} </div>
            </div>
            <div className="col-md-2 col-sm-6 py-2">
              <label className="label-headerinfo">Email</label>
              <div className="text-truncate">{emailHeader}</div>
            </div>
            <div className="col-md-2 col-sm-6 py-2">
              <label className="label-headerinfo">Cell Number</label>
              <div className="text-truncate">{cellNumberHeader}</div>
            </div>
            <div className="col-md-2 col-sm-6 py-2">
              <label className="label-headerinfo">Address</label>
              <div className="text-truncate">
                {clinicRecord?.data?.address_line_1
                  ? `${address} ${cityHeader}, ${stateHeader}, ${zipcodeHeader}`
                  : ""}
              </div>
            </div>
            <div className="col-md-2 col-sm-6 py-2">
              <label className="label-headerinfo">Clinic Code</label>
              <div className="text-truncate">
                {`${clinicRecord?.data?.clinic_id}`}
              </div>
            </div>  
            <div className="col-md-2 col-sm-6 py-2">
              <label className="label-headerinfo">Link</label>
              <div className="d-flex align-items-center gap-2">
                {scanClinicLink ? (
                  <NavLink
                    to={scanClinicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-truncate"
                    style={{ maxWidth: "150px", color: "#2890AF" }}
                  >
                    {scanClinicLink}
                  </NavLink>
                ) : (
                  <span>—</span>
                )}
                {scanClinicLink && (
                  <button
                    className="btn p-0 border-0 bg-transparent"
                    title="Copy link"
                    onClick={() => {
                      navigator.clipboard.writeText(scanClinicLink);
                      toast.success("Link copied!");
                    }}
                  >
                    <img src={Copy} alt="Copy" height={16} width={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <div
            className="d-flex flex-wrap align-items-center justify-content-between mx-2"
            style={{ width: "600px" }}
          >
            <div>
              <FilterComponent
                placeholder={filterPlaceholder}
                onFilter={(e) => setFilterText(e.target.value)}
                filterText={filterText}
              />
            </div>
            <div>
              <button
                className="btn filter-btn"
                onClick={() => setVisible(true)}
              >
                <img loading="lazy" src={Filter} height={14} width={12.26} />{" "}
                <span>&nbsp;Filters</span>
              </button>
            </div>
            <div>
              <button
                className="add-user border-0"
                onClick={() => {
                  setAddNewUser(true);
                  handleClear();
                }}
                disabled={clinic?.status === "inactive"}
              >
                <img
                  loading="lazy"
                  src={Addbutton}
                  height={14}
                  width={14}
                  className="ms-1"
                />{" "}
                <span>&nbsp;Add Provider</span>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <DataTable
            columns={columns}
            data={tableData}
            progressPending={isClinicDetailLoading}
            customStyles={customStylesClinicDetails}
            subHeaderComponent={subHeaderComponentMemo}
            responsive={true}
            sortIcon={<img loading="lazy" src={Sorticon} />}
          />
        </div>
        <PaginationComponent
          totalRecords={clinicRecord?.totalRecords}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
        />
        <>
          <COffcanvas
            className="ps-3 pe-3 pt-3 offcanvas_filter"
            backdrop="static"
            placement="end"
            visible={visible}
          >
            <COffcanvasHeader>
              <COffcanvasTitle className="">Filters</COffcanvasTitle>
              <CCloseButton
                className="text-reset modal-close-cross"
                onClick={() => {
                  setVisible(false);
                }}
              />
            </COffcanvasHeader>
            <COffcanvasBody className="d-flex justify-content-between flex-column">
              <div>
                <p className="title-register">Registration Date</p>
                <div className="form-group has-search-right">
                  <DatePicker
                    customInput={<BlockKeyboardInput />}
                    className="form-control input-dt shadow"
                    placeholderText="From"
                    dateFormat="MM/dd/yyyy"
                    selected={tempFilter.startDate}
                    onChange={(date) => handleDateChange("startDate", date)}
                    selectsStart
                    startDate={tempFilter.startDate}
                    endDate={tempFilter.endDate}
                    maxDate={new Date()} // Disable future dates
                  />
                </div>
                <div className="form-group has-search-right mt-4">
                  <DatePicker
                    customInput={<BlockKeyboardInput />}
                    className="form-control input-dt shadow"
                    placeholderText="To"
                    dateFormat="MM/dd/yyyy"
                    selected={tempFilter?.endDate}
                    onChange={(date) => handleDateChange("endDate", date)}
                    selectsEnd
                    startDate={tempFilter?.startDate}
                    endDate={tempFilter?.endDate}
                    minDate={tempFilter?.startDate}
                    maxDate={new Date()}
                  />
                </div>

                <div>
                  <p className="title-register mt-4">Status</p>
                  <div className="ms-4">
                    <p>
                      <input
                        type="radio"
                        name="status"
                        id="all"
                        value=""
                        checked={tempFilter?.status === ""}
                        onChange={handleFilterChange}
                      />
                      <label htmlFor="all">All</label>
                    </p>
                    <p>
                      <input
                        type="radio"
                        name="status"
                        id="active"
                        value="active"
                        checked={tempFilter?.status === "active"}
                        onChange={handleFilterChange}
                      />
                      <label htmlFor="active">Active</label>
                    </p>
                    <p>
                      <input
                        type="radio"
                        name="status"
                        id="inactive"
                        value="inactive"
                        checked={tempFilter?.status === "inactive"}
                        onChange={handleFilterChange}
                      />
                      <label htmlFor="inactive">Inactive</label>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="title-register mt-4">User Type</p>
                  <div className="ms-4">
                    <p>
                      <input
                        type="radio"
                        name="userType"
                        id="provider"
                        value="provider"
                        checked={tempFilter?.userType === "provider"}
                        onChange={handleFilterChange}
                      />
                      <label htmlFor="provider">Provider</label>
                    </p>
                    <p>
                      <input
                        type="radio"
                        name="userType"
                        id="patient"
                        value="patient"
                        checked={tempFilter?.userType === "patient"}
                        onChange={handleFilterChange}
                      />
                      <label htmlFor="patient">Patient</label>
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="d-grid">
                  <button
                    onClick={() => {
                      handleOnClear();
                    }}
                    className="shadow-none reset-apply-btn  fw-bold"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApplyFilter}
                    className="shadow-none filter-apply-btn mt-4 fw-bold"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </COffcanvasBody>
          </COffcanvas>
        </>
      </div>
      <AddNewProvider
        setAddNewUser={setAddNewUser}
        addNewUser={addNewUser}
        clinic_name={clinic_name}
        onclose={onclose}
        errMsg={errMsg}
        formData={formData}
        handleUserChange={handleUserChange}
        errors={errors}
        handleAddUser={handleAddUser}
        setUserModal={setUserModal}
        handleClose={handleClose}
        isAddProviderLoading={isAddProviderLoading}
        isAddSuccess={isAddSuccess}
        AddProviderError={AddProviderError}
      />
      <AddUserConfirmationModal
        setUserModal={setUserModal}
        setAddNewUser={setAddNewUser}
        userModal={userModal}
        type={"Provider"}
      />
      <DeleteModal
        onClose={closeRessign}
        deleteModal={
          edit?.userType === "Provider" ? deleteModal : deleteModalPatient
        }
        content={
          edit?.userType === "Provider"
            ? "Do you really want to delete this Provider?"
            : "Do you really want to delete this Patient?"
        }
        onConfirm={
          edit?.userType === "Provider"
            ? confirmDeleteUser
            : confirmDeletePatient
        }
      />
      <>
        <CModal
          alignment="center"
          visible={ressignModal}
          onClose={() => setRessignModal(false)}
          aria-labelledby="VerticallyCenteredExample"
        >
          <div className="d-flex justify-content-center CModalHeader">
            <CModalTitle className="text-white">Reassign</CModalTitle>
          </div>
          <CModalBody className="main-modal-body">
            <div className="main-modal">
              {!ressignTigger ? (
                <SelectProvider
                  id={id}
                  onChangeSelect={onChangeSelect}
                  ressignHandler={ressignHandler}
                  setRessignModal={setRessignModal}
                  deletedRowData={edit?.object_id}
                />
              ) : (
                <ViewSelectedProvider
                  type={"provider"}
                  closeRessign={closeRessign}
                  data={data}
                />
              )}
            </div>
          </CModalBody>
        </CModal>
      </>
      <PatientEdit
        selectedRowId={selectedPatientRow}
        editModal={editPatientModal}
        setEditModal={setEditPatientModal}
        refetch={refetch}
        onclose={() => {
          setEditPatientModal(false);
          setSelectedPatientRow(null);
        }}
      />
      <>
        <COffcanvas
          className="ps-3 pe-3  offcanvas_add_user"
          backdrop="static"
          placement="bottom"
          visible={updateUser}
          onHide={onclose}
        >
          <COffcanvasHeader className="">
            <COffcanvasTitle className="pt-4 offcanvas-title">
              Update Provider{" "}
              <span className="clinic-title-canva fs-12">{clinic_name}</span>
              {
                <span
                  className=""
                  style={{ color: "red", fontSize: "15px", fontWeight: "700" }}
                >
                  {errMsg}
                </span>
              }
            </COffcanvasTitle>
            <CCloseButton
              className="text-reset modal-close-cross"
              onClick={() => onclose() }
            />
          </COffcanvasHeader>
          <COffcanvasBody>
            <div>
              <div className="row ">
                <div className="col col-md-2 ">
                  <label className="p-2">Type *</label>
                  <select
                    type="text"
                    className="form-select form-control-input"
                    placeholder=""
                    name="md_type"
                    value={formData?.md_type}
                    defaultValue={formData?.md_type}
                    onChange={handleUserChange}
                  >
                    <option value="">Select</option>
                    <option value="MD">MD</option>
                    <option value="NP">NP</option>
                    <option value="PA">PA</option>
                    <option value="DO">DO</option>

                  </select>
                  {errors?.md_type && (
                    <p className="text-danger mt-2">{errors?.md_type}</p>
                  )}
                </div>
             
                
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="first_name"
                    value={formData?.first_name}
                    onChange={handleUserChange}
                    defaultValue={formData?.first_name}
                  />
                  {errors?.first_name && (
                    <p className="text-danger mt-2">{errors?.first_name}</p>
                  )}
                </div>
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="middle_name"
                    value={formData?.middle_name}
                    onChange={handleUserChange}
                  />
                </div>
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleUserChange}
                  />
                  {errors?.last_name && (
                    <p className="text-danger mt-2">{errors?.last_name}</p>
                  )}
                </div>
              </div>
              <div className="row pt-5">
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Email *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="email"
                    value={formData.email}
                    onChange={handleUserChange}
                    disabled
                  />
                  {errors?.email && (
                    <p className="text-danger mt-2">{errors?.email}</p>
                  )}
                </div>
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Cell Number *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="cell_number"
                    value={formData.cell_number}
                    onChange={handleUserChange}
                  />
                  {errors?.cell_number && (
                    <p className="text-danger mt-2">{errors?.cell_number}</p>
                  )}
                </div>
              </div>
              <div className="row pt-5">
                <div className="col-md-6">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    User Type
                  </label>
                  <select
                    type="text"
                    disabled
                    className="form-select form-control-input"
                    name="userType"
                    value={formData?.userType || "Provider"}
                  >
                    <option value="Provider">Provider</option>
                  </select>
                  {errors?.userType && (
                    <p className="text-danger mt-2">{errors?.userType}</p>
                  )}
                </div>
              </div>
              <div className="row pt-2">
                <div className="col-md-12 text-end">
                  <button
                    className="rv-reset-cancel mt-4"
                    onClick={() => onclose()}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn add-practs-btn ms-2"
                    onClick={updateClinic}
                    onClose={() => setUserModal(false)}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </COffcanvasBody>
        </COffcanvas>
      </>
      <>
        <COffcanvas
          className="ps-3 pe-3  offcanvas_add_user"
          backdrop="static"
          placement="bottom"
          visible={cloneUser}
          onHide={onclose}
        >
          <COffcanvasHeader className="">
            <COffcanvasTitle className="pt-4 offcanvas-title">
              Clone Provider{" "}
              <span className="ms-2">
                {errMsg ? (
                  <span
                    className="mt-4 ml-5 text-center rg-err"
                    style={{ fontSize: 14 }}
                  >
                    {errMsg}
                  </span>
                ) : (
                  ""
                )}
              </span>
            </COffcanvasTitle>
            <CCloseButton
              className="text-reset modal-close-cross"
              onClick={() => setCloneUser(false)}
            />
          </COffcanvasHeader>
          <COffcanvasBody>
            <div>
              <div className="row">
                <div className="col col-md-2 ">
                  <label className="p-2">Type *</label>
                  <select
                    type="text"
                    className="form-select form-control-input"
                    placeholder=""
                    name="md_type"
                    value={formData?.md_type}
                    defaultValue={formData?.md_type}
                    onChange={handleUserChange}
                  >
                    <option value="">Select</option>
                    <option value="MD">MD</option>
                    <option value="NP">NP</option>
                    <option value="PA">PA</option>
                    <option value="DO">DO</option>

                  </select>
                  {errors?.md_type && (
                    <p className="text-danger mt-2">{errors?.md_type}</p>
                  )}
                </div>{" "}
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="first_name"
                    value={formData.first_name}
                    defaultValue={formData?.first_name}
                    onChange={handleUserChange}
                  />
                  {errors?.first_name && (
                    <p className="text-danger mt-2">{errors?.first_name}</p>
                  )}
                </div>
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="middle_name"
                    value={formData?.middle_name}
                    onChange={handleUserChange}
                  />
                </div>
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleUserChange}
                  />
                  {errors?.last_name && (
                    <p className="text-danger mt-2">{errors?.last_name}</p>
                  )}
                </div>
              </div>
              <div className="row pt-5">
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Email *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="email"
                    value={formData?.email}
                    defaultValue={formData?.email}
                    onChange={handleUserChange}
                  />
                  {errors?.email && (
                    <p className="text-danger mt-2">{errors?.email}</p>
                  )}
                </div>
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Cell Number *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="cell_number"
                    value={formData.cell_number}
                    onChange={handleUserChange}
                  />
                  {errors?.cell_number && (
                    <p className="text-danger mt-2">{errors?.cell_number}</p>
                  )}
                </div>
              </div>
              <div className="row pt-5">
                <div className="col-md-6">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    User Type
                  </label>
                  <select
                    type="text"
                    className="form-select form-control-input"
                    name="userType"
                    disabled
                    value={
                      formData?.userType
                        ? formData.userType.charAt(0).toLowerCase() +
                        formData.userType.slice(1)
                        : ""
                    }
                    onChange={handleUserChange}
                  >
                    <option value="provider">Provider</option>
                  </select>
                </div>
              </div>

              <div className="row pt-2">
                <div className="col-md-12 text-end">
                  <button
                    className="rv-reset-cancel mt-4"
                    onClick={() => setCloneUser(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn add-practs-btn ms-2"
                    onClick={handleAddUser}
                    onClose={() => setUserModal(false)}
                    disabled={btnDisable === true}
                  >
                    Clone
                  </button>
                </div>
              </div>
            </div>
          </COffcanvasBody>
        </COffcanvas>
      </>
    </>
  );
};

export default ClinicDetail;
