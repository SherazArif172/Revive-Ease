import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import React, { useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import customStyles from "../../../../Components/DataTable/CustomStyle";
import { columnsTaskStatus } from "../../../../Components/DataTable/commonColumn";
import DeleteModal from "../../../../Components/Modal/DeleteModal";
import Appointment from "../../../../assets/icons/appointment.png";
import Dateicon from "../../../../assets/icons/calendar-new.png";
import Addbutton from "../../../../assets/icons/plusorange.png";
import Sorticon from "../../../../assets/icons/sort.png";
import { useDeleteTaskMutation } from "../../../../redux/apis/patient_coach_api";
import { useUpdateRoleMutation } from "../../../../redux/apis/role_api";
import { convertLocalDateToUTC, formatDate, formatDateOnly } from "../../../../utils/dateUtils";
import AddCoachReport from "./AddCoachReport";
import AssignTaskCanvas from "./AssignNewTaskCoach";
import AssignTemplate from "./AssignTemplate";
import AssignedTaskEditCanva from "./AssignedTaskEditCanva";
import AlertCanva from "./SendAlertCanva";
import UpdatePatientProfile from "./UpdatePatientProfile";
// import { toast } from "react-toastify";
import { TablePagination } from "@mui/material";
import { base_url } from "../../../../global/global";
import { setBillingTab } from "../../../../redux/reducers/billingReducer";
import CoachNote from "./CoachNote";
import InitialDetails from "./InitialDetails";

const PatientInfo = ({
  showViewOnly,
  patientId,
  state,
  getAllPatientIsLoading,
  detailRefetch,
  patientRefetch,
  currentPage,
  setCurrentPage,
  totalAssignTasks,
  setRowsPerPage,
  rowsPerPage,
}) => {
  const id = useSelector((state) => state?.user?.id);
  const actorType = useSelector((state) => state?.user?.userType);
  const currentPainScore = useSelector(
    (state) =>
      state?.allPatients?.patient?.patientData?.total_pain_score[0]?.value
  );
  // const currentPainScoreDate = useSelector(
  //   (state) =>
  //     state?.allPatients?.patient?.patientData?.total_pain_score[0]?.date
  // );
  const lastPainScore = useSelector(
    (state) =>
      state?.allPatients?.patient?.patientData?.total_pain_score[1]?.value
  );
  const lastPainScoreDate = useSelector(
    (state) =>
      state?.allPatients?.patient?.patientData?.total_pain_score[1]?.date
  );
  // const InitialPainScore = useSelector(
  //   (state) =>
  //     state?.allPatients?.patient?.patientData?.total_pain_score?.[state?.allPatients?.patient?.patientData?.total_pain_score.length - 1]?.value ?? 0
  // );
  const InitialPainScore = useSelector(
    (state) =>
      state?.allPatients?.patient?.patientData?.initials?.calculated_initial_pain ?? null
  );

  const patientDatas = useSelector(
    (state) => state?.allPatients?.patient?.patientData
  );

  const onClose = () => {
    setImgCrop(null);
    setSendAlertCanva(false);
    setVisible(false);
    setAssignCanva(false);
    setAssignTemplateModel(false);
    setAddCoachCanva(false);
    setEditModal(setEditModal);
    setEditAssignTaskCanva(false);
    setDeleteModal(false);
    setEditModal(false);
    setAddCoachNoteModal(false);
    setError(null);
  };

  const dispatch = useDispatch();
  const [nextAppointment, setNextAppointment] = useState(() =>
    patientDatas?.next_appointment_date
      ? new Date(patientDatas?.next_appointment_date)
      : null
  );
  const [tempDate, setTempDate] = useState();
  const [sendAlertCanva, setSendAlertCanva] = useState(false);
  const [visible, setVisible] = useState(false);
  const [assignCanva, setAssignCanva] = useState(false);
  const [addCoachNoteModal, setAddCoachNoteModal] = useState(false);
  const [assignTemplateModel, setAssignTemplateModel] = useState(false);
  const [addCoachCanva, setAddCoachCanva] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editAssignTask, setEditAssignTaskCanva] = useState(false);
  const [rowEditData, setRowEditData] = useState(null);
  const [avatarURL, setAvatarURL] = useState(null);
  const [btnDisable, setBtnDisable] = useState(false);
  const fileUploadRef = useRef(null);
  const [imgCrop, setImgCrop] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(false);
  const [usStates, setUsStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [errClass, setErrClass] = React.useState(false);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState("Basic Info");
  const [formData, setFormData] = useState({
    title: "Mr.",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    cell_number: "",
    address_line_1: "",
    city: "",
    state: "",
    zip_code: "",
    password: "",
    confirm_password: "",
    avatarURL: null,
    date_of_birth: "",
    insurance: "",
    occupation: "",
  });
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage + 1);
  };
  useEffect(() => {
    if (currentPage > 0) {
      // detailRefetch();
    }
  }, [currentPage]);

  useEffect(() => {
    dispatch(setBillingTab(false));
  }, []);

  useEffect(() => {
    if (patientDatas?.next_appointment_date) {
      setNextAppointment(new Date(patientDatas?.next_appointment_date));
    } else {
      setNextAppointment(null);
    }
  }, [patientDatas?.next_appointment_date]);
  const patientData = useSelector(
    (state) => state?.allPatients?.patient?.patientData
  );
  const [deleteTask, { isSuccess: isDeleteSuccess }] = useDeleteTaskMutation();
  // eslint-disable-next-line no-unused-vars
  const [updateAppointmentDate, { isSuccess: appointmentDateSuccess }] =
    useUpdateRoleMutation();
  // eslint-disable-next-line no-unused-vars
  const [
    updateRole,
    {
      isSuccess: updateProfileSuccess,
      isError: updateProfileError,
      isLoading: updateProfileLoading,
    },
  ] = useUpdateRoleMutation();

  useEffect(() => {
    if (appointmentDateSuccess) {
      detailRefetch();
      setTempDate(null);
    }
  }, [appointmentDateSuccess]);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    handlePageChange(null, 0);
  };

  useEffect(() => {
    if (updateProfileSuccess) {
      setBtnDisable(false);
      detailRefetch();
      patientRefetch();
      setEditModal(false);
      setFormData({
        title: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        cell_number: "",
        address_line_1: "",
        city: "",
        state: "",
        zip_code: "",
        password: "",
        confirm_password: "",
        avatarURL: null,
        date_of_birth: "",
        insurance: "",
        occupation: "",
      });
      setUsStates([]);
      setCities([]);
    }
    if (updateProfileError) {
      setBtnDisable(false);
    }
    if (updateProfileLoading) {
      setBtnDisable(true);
    }
  }, [updateProfileSuccess, updateProfileLoading, updateProfileError]);

  const handleChanges = async (e) => {
    if (e.target?.files?.[0]) {
      const uploadedFile = e.target.files[0];
      setImgCrop(URL.createObjectURL(uploadedFile));
      setFormData((prev) => ({
        ...prev,
        avatarURL: uploadedFile,
      }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  useEffect(() => {
    if (isDeleteSuccess) {
      setDeleteModal(false);
      detailRefetch();
    }
  }, [isDeleteSuccess]);

  const deleteModalTrue = (row) => {
    setDeleteModal(true);
    setDeleteId(row?._id);
  };

  const confirmDeleteUser = () => {
    const payload = {
      task_id: deleteId,
      actorId: id,
      actorType: actorType,
    };
    deleteTask({ payload: payload, id: patientId });
  };

  const handleEditModal = () => {
    setEditModal(true);
  };

  useEffect(() => {
    if (patientData !== null && editModal === true) {
      setFormData({
        title: patientData?.title,
        first_name: patientData?.first_name,
        middle_name: patientData?.middle_name,
        last_name: patientData?.last_name,
        email: patientData?.email,
        cell_number: patientData?.cell_number,
        address_line_1: patientData?.address_line_1,
        zip_code: patientData?.zip_code,
        state: patientData?.state,
        city: patientData?.city,
        date_of_birth: patientData?.date_of_birth,
        insurance: patientData?.insurance,
        occupation: patientData?.occupation,
        avatarURL: `${base_url + patientData?.profile_img}`,
      });
    }
  }, [patientData, editModal]);

  const closeReportCanva = () => {
    setAddCoachCanva(false);
  };
  const closeCanvasTemplate = () => {
    setAssignTemplateModel(false);
  };

  const onCrop = (view) => {
    setImgCrop(view);
  };

  const onFocus = () => {
    setErrClass(true);
  };
  const onBlur = () => {
    setErrClass(false);
  };

  const saveImg = () => {
    if (imgCrop && typeof imgCrop === "string") {
      setAvatarURL(imgCrop);
      setFormData((prev) => ({ ...prev, avatarURL: imgCrop }));
      setVisible(false);
    }
  };

  const applyDate = () => {
    setNextAppointment(tempDate);
    
    // Use selected date with current time, then convert to UTC for backend
    const now = new Date();
    const dateWithCurrentTime = new Date(
      tempDate.getFullYear(),
      tempDate.getMonth(),
      tempDate.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );
    const utcDateString = convertLocalDateToUTC(dateWithCurrentTime, true);
    
    if (!utcDateString) {
      console.error("Invalid date:", tempDate);
      return;
    }
    
    let payload = {
      appointment: {
        patient_id: patientId,
        appointmentdate: utcDateString, // UTC ISO string with time
        actorId: id,
        actorType: actorType,
      },
    };
    updateAppointmentDate({ payload: payload, id: id });
  };

  const openAssignedTaskCanva = (row) => {
    setEditAssignTaskCanva(true);
    setRowEditData(row);
  };

  const columns = columnsTaskStatus({ deleteModalTrue, openAssignedTaskCanva });
  const [openPicker, setOpenPicker] = useState(false);

  return (
    <>
      <div className="default-container ps-3 mt-3  bg-white">
        <div className="new-container">
          <div className="row g-2">
            <div className="col-md-6 col-sm-6">
              <div className="p-3 patient-info-container h-100">
                <div className="fw-bold mb-2">Pain Score</div>
                <div className="d-flex justify-content-between">
                  <div>
                    <div>
                      Initial Score: <span className="font-theme-color">{InitialPainScore ?? 0}</span>
                    </div>
                  </div>

                  <div>
                    <div>
                      Current Score: <span className="font-theme-color">{currentPainScore ?? 0}</span>
                    </div>
                  </div>

                  <div>
                    <div>
                      Last Score: <span className="font-theme-color">{lastPainScore ?? 0}</span>
                    </div>
                    <small className="text-muted">
                      {lastPainScoreDate ? (
                        <>
                          Calculated on:{" "}
                          {formatDate(lastPainScoreDate, "MM/dd/yyyy")}
                        </>
                      ) : null}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-3 patient-info-container" style={{ height: "125px" }}>
                <div className="fw-bold d-flex justify-content-between align-items-center">
                  <div className="fw-bold">Next Appointment</div>
                  {actorType === "coach" && (
                    <img
                      loading="lazy"
                      src={Appointment}
                      alt="Edit Appointment"
                      height={16}
                      style={{ cursor: "pointer" }}
                      onClick={() => setOpenPicker(true)}
                    />
                  )}
                </div>

                <div className="pt-1 d-flex align-items-center">
                  <img
                    loading="lazy"
                    src={Dateicon}
                    alt="Date Icon"
                    height={18}
                    className="me-2"
                  />

                  <DatePicker
                    selected={tempDate || nextAppointment}
                    onChange={(date) => {
                      setTempDate(date);
                      setOpenPicker(false);
                    }}
                    dateFormat="MM/dd/yyyy"
                    minDate={new Date()}
                    open={openPicker}
                    onClickOutside={() => setOpenPicker(false)}
                    popperPlacement="bottom-start"
                    popperClassName="no-overlap-datepicker"
                    customInput={
                      <span className="text-truncate" style={{ cursor: "pointer" }}>
                        {tempDate || nextAppointment
                          ? formatDateOnly(tempDate || nextAppointment, "MM/dd/yyyy")
                          : "_ _/_ _/_ _ _ _"}
                      </span>
                    }
                  />
                </div>
                {tempDate && (
                  <div className="d-flex justify-content-end mt-2">
                    <button
                      className="book-appointment w-auto px-2"
                      onClick={applyDate}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-3 patient-info-container h-100">
                <div className="fw-bold mb-2">Last Active on</div>
                <div className="d-flex align-items-center">
                  {state?.lastLoginDate && (
                    <>
                      <img
                        loading="lazy"
                        src={Dateicon}
                        alt="Date Icon"
                        height={18}
                        className="me-2"
                      />
                      <span className="text-truncate">
                        {formatDate(state?.lastLoginDate, "MM/dd/yyyy hh:mm a")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr />
        <div className="">
          <TabContext value={currentTab}>
            <Box>
              <TabList
                className=""
                onChange={handleTabChange}
                aria-label="lab API tabs example"
              >
                <Tab label="Basic Info" value="Basic Info" />
                <Tab label="Initial Details" value="Initial Details" />
              </TabList>
            </Box>
            <TabPanel value="Basic Info">
              <div className="card-wrapper  mt-3">
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="d-flex justify-content-between">
                      <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                        Name
                      </label>
                      <div className="text-truncate col-7">
                        {patientData?.first_name || patientData?.last_name
                          ? `${patientData?.last_name || ""} ${patientData?.middle_name || ""
                            } ${patientData?.first_name || ""}`.trim()
                          : "-"}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between">
                      <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                        Gender
                      </label>
                      <div className="text-truncate col-7">
                        {patientDatas?.gender
                          ? patientDatas?.gender.charAt(0).toUpperCase() +
                          patientDatas?.gender.slice(1)
                          : "-"}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                        Email
                      </label>
                      <div className="text-truncate col-7">
                        {patientDatas?.email ? patientDatas?.email : "-"}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                        Insurance
                      </label>
                      <div className="text-truncate col-7">{`${patientDatas?.insurance ? patientDatas?.insurance : "-"
                        }`}</div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                        Approved on
                      </label>
                      <div className="text-truncate col-7">
                        {patientDatas?.approved_at
                          ? formatDate(
                            patientDatas?.approved_at,
                            "MM/dd/yyyy"
                          )
                          : "-"}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                        Diagnosis
                      </label>
                      <div className="text-truncate col-7">
                        {patientDatas?.diagnosis}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="d-flex justify-content-between">
                      <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                        Phone Number
                      </label>
                      <div className="text-truncate col-7">
                        {patientDatas?.cell_number
                          ? patientDatas?.cell_number
                          : "-"}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                        Address
                      </label>
                      <div className="text-truncate col-7">
                        {patientDatas?.address_line_1
                          ? patientDatas?.address_line_1
                          : "-"}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                        Provider Name
                      </label>
                      <div className="text-truncate col-7">
                        {`${patientDatas?.provider?.last_name
                          ? patientDatas?.provider?.last_name
                          : "-"
                          } ${patientDatas?.provider?.middle_name
                            ? patientDatas?.provider?.middle_name
                            : ""
                          } ${patientDatas?.provider?.first_name
                            ? patientDatas?.provider?.first_name
                            : ""
                          }`}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                        Date of birth
                      </label>
                      <div className="text-truncate col-7">{`${patientDatas?.date_of_birth
                        ? patientDatas?.date_of_birth
                        : ""
                        }`}</div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                        Occupation
                      </label>
                      <div className="text-truncate col-7">{`${patientDatas?.occupation ? patientDatas?.occupation : ""
                        }`}</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="Initial Details">
              <InitialDetails patientData={patientDatas} />
            </TabPanel>
          </TabContext>
        </div>

        <hr className="my-0  my-3" />
        <div className="main-container mt-4">
          {!showViewOnly && (
            <div className="d-flex justify-content-between">
              <div>
                <h6>
                  <strong>Assigned Task</strong>
                </h6>
              </div>
              <div className="d-flex flex-wrap align-items-center justify-content-between mx-2">
                <div className="ms-2 mb-2 d-flex ">
                  <button
                    className="add-button-orange-order w-auto px-3 "
                    onClick={() => setAssignCanva(true)}
                  >
                    <img
                      loading="lazy"
                      src={Addbutton}
                      height={14}
                      width={14}
                      alt="Add Icon"
                    />
                    <span className="ms-2 font-orange">Assign New Task</span>
                  </button>
                </div>
                <div className="ms-2 mb-2 d-flex ">
                  <button
                    className="add-button-orange-order w-auto px-3 "
                    onClick={() => setAssignTemplateModel(true)}
                  >
                    <img
                      loading="lazy"
                      src={Addbutton}
                      height={14}
                      width={14}
                      alt="Add Icon"
                    />
                    <span className="ms-2">Assign Journey Template</span>
                  </button>
                </div>
                <div className="ms-2 mb-2 d-flex ">
                  <button
                    className="add-button-orange-order w-auto px-3 "
                    onClick={() => setAddCoachNoteModal(true)}
                  >
                    <img
                      loading="lazy"
                      src={Addbutton}
                      height={14}
                      width={14}
                      alt="Add Icon"
                    />
                    <span className="ms-2">My Coach Note</span>
                  </button>
                </div>
                <div className="ms-2 mb-2 d-flex ">
                  <button
                    className="add-button-orange-order w-auto px-3 "
                    onClick={() => setAddCoachCanva(true)}
                  >
                    <img
                      loading="lazy"
                      src={Addbutton}
                      height={14}
                      width={14}
                      alt="Add Icon"
                    />
                    <span className="ms-2"> Add Coach Report</span>
                  </button>
                </div>
                <div className="mb-2 ms-2">
                  <button
                    type="button"
                    className="flag-btn"
                    onClick={() => setSendAlertCanva(true)}
                  >
                    <span className="">Send Alert</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-2">
            <div>
              <DataTable
                columns={columns}
                data={state?.assignedTask}
                progressPending={getAllPatientIsLoading}
                customStyles={customStyles}
                sortIcon={
                  <>
                    <img loading="lazy" src={Sorticon} />
                  </>
                }
              />
              {totalAssignTasks?.totalRecords > 0 ? (
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
                    count={totalAssignTasks?.totalRecords}
                    page={currentPage - 1}
                    onPageChange={handlePageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 15, 20]}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <UpdatePatientProfile
        btnDisable={btnDisable}
        formData={formData}
        visible={visible}
        cities={cities}
        usStates={usStates}
        editModal={editModal}
        avatarURL={avatarURL}
        fileUploadRef={fileUploadRef}
        handleChanges={handleChanges}
        onFocus={onFocus}
        onBlur={onBlur}
        onCrop={onCrop}
        saveImg={saveImg}
        setEditModal={setEditModal}
        setVisible={setVisible}
        onClose={onClose}
        handleEditModal={handleEditModal}
        errClass={errClass}
        patientData={patientData}
        setUsStates={setUsStates}
        setCities={setCities}
        setFormData={setFormData}
        updateRole={updateRole}
        patientId={patientId}
      />
      <DeleteModal
        content={"Do you really want to delete this Task?"}
        deleteModal={deleteModal}
        onConfirm={confirmDeleteUser}
        onClose={onClose}
      />
      <AssignTaskCanvas
        assignCanva={assignCanva}
        Dateicon={Dateicon}
        patientId={patientId}
        refetch={detailRefetch}
        onClose={onClose}
      />
      <AssignedTaskEditCanva
        editAssignTask={editAssignTask}
        setEditAssignTaskCanva={setEditAssignTaskCanva}
        rowEditData={rowEditData}
        patientId={patientId}
        detailRefetch={detailRefetch}
        onClose={onClose}
        actorId={id}
        actorType={actorType}
      />
      <AddCoachReport
        patientId={patientId}
        addCoachCanva={addCoachCanva}
        setAddCoachCanva={setAddCoachCanva}
        closeReportCanva={closeReportCanva}
        Dateicon={Dateicon}
        onClose={onClose}
      />
      <AssignTemplate
        assignTemplateCanva={assignTemplateModel}
        closeCanvas={closeCanvasTemplate}
        onClose={onClose}
        refetch={detailRefetch}
        patientId={patientId}
      />
      <AlertCanva
        sendAlertCanva={sendAlertCanva}
        setSendAlertCanva={setSendAlertCanva}
        state={state}
        onClose={onClose}
        error={error}
        setError={setError}
      />
      <CoachNote
        addCoachNoteModal={addCoachNoteModal}
        onclose={onClose}
        patientId={patientId}
        actorType={actorType}
        actorId={id}
      />
    </>
  );
};

export default PatientInfo;
