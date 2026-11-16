import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import { TablePagination } from "@mui/material";
import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import Addbutton from "../../../../assets/icons/plus.png";
import Sorticon from "../../../../assets/icons/sort.png";
import { createColumnsPatientUsefull } from "../../../../Components/DataTable/commonColumn";
import { customStylesChill } from "../../../../Components/DataTable/CustomStyle";
import DeleteModal from "../../../../Components/Modal/DeleteModal";
import {
  useAddActivityMutation,
  useDeleteActivityMutation,
  useGetAllActivityQuery,
  useUpdateActivityMutation,
} from "../../../../redux/apis/activity_api";
import {
  useAddChillMutation,
  useDeleteChillMutation,
  useGetAllChillQuery,
  useUpdateChillMutation,
  useGetCategoryVideoQuery
} from "../../../../redux/apis/chill_api";
import {
  useAddLearnMutation,
  useDeleteLearnMutation,
  useGetAllLearnQuery,
  useUpdateLearnMutation,
} from "../../../../redux/apis/learn_api";
import {
  useAddTipsMutation,
  useDeleteTipsMutation,
  useGetAllTipsQuery,
  useUpdateTipsMutation
} from "../../../../redux/apis/tips_api";
import ActivitySection from "./ActivitySection";
import ActivitySectionEdit from "./ActivitySectionEdit";
import ChillSection from "./ChillSection";
import ChillSectionEdit from "./ChillSectionEdit";
import LearnSection from "./LearnSection";
import LearnSectionEdit from "./LearnSectionEdit";
import TipsSection from "./TipsSection";
import TipsSectionEdit from "./TipsSectionEdit";
import { skipToken } from "@reduxjs/toolkit/query";



const PatientUseful = () => {
  const id = useSelector((state) => state?.user?.id);
  const chillData = useSelector(
    (state) => state?.allPatientUseFullResources?.chillData
  );
  const activityData = useSelector(
    (state) => state?.allPatientUseFullResources?.activityData
  );
  const learnData = useSelector(
    (state) => state?.allPatientUseFullResources?.learnData
  );
  const tipsData = useSelector(
    (state) => state?.allPatientUseFullResources?.tipsData
  );
  const userType = useSelector((state) => state?.user?.userType);

  const categoryVideoList = useSelector(
    (state) => state?.allPatientUseFullResources?.categoryData?.data || []
  );


  const subHeaderComponentMemo = "";
  const [createCanva, setCreateCanva] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editCanva, setEditCanva] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [errors, setErrors] = useState({});
  const [pagination, setPagination] = useState({
    Chill: { page: 1, rowsPerPage: 10 },
    Activity: { page: 1, rowsPerPage: 10 },
    Learn: { page: 1, rowsPerPage: 10 },
    Tips: { page: 1, rowsPerPage: 10 },
  });

  const [formData, setFormData] = useState({
    chillTitle: "",
    body_part: [],
    chillVideoUrl: "",
    chillThumbnail: "",
    description: "",
    thumbnailPreview: null
  });

  const [activityFormData, setActivityFormData] = useState({
    title: "",
    body_part: [],
    videoURL: "",
    description: "",
    additionalText: "",
    quotedText: "",
    quickTip: "",
    thumbnailPreview: null
  });


  const [learnFormData, setLearnFormData] = useState({
    title: "",
    subtitle: "",
    bodyText: "",
    description: "",
    body_part: [],
    footerText: "",
    ctaLabelText: "",
    videoTitle: "",
    videoSubtitle: "",
    videoURL: "",
    addFooter: false,
    addVideo: true,
    thumbnailPreview: null
  });

  const [tipsFormData, setTipsFormData] = useState({
    title: "",
    sub_title: "",
    body_text: "",
  });

  // eslint-disable-next-line no-unused-vars
  const { getChillList, isLoading: isChillLoading } = useGetAllChillQuery({
    page: pagination?.Chill?.page,
    rowsPerPage: pagination?.Chill?.rowsPerPage,
    actorId: id,
    actorType: userType
  }, { refetchOnMountOrArgChange: true });
  const [addChill, { isSuccess: chillSuccess, isLoading: chillLoading }] =
    useAddChillMutation();

  // Map section to category for API call
  const getCategoryForAPI = (section) => {
    if (section === "Relax") return "Chill";
    if (section === "Move") return "Activity";
    if (section === "Learn") return "Learn";
    if (section === "Tips") return "Tips";
    // For edit mode (lowercase)
    if (section === "chill") return "Chill";
    if (section === "activity") return "Activity";
    if (section === "learn") return "Learn";
    if (section === "tips") return "Tips";
    return section.charAt(0).toUpperCase() + section.slice(1);
  };

  // eslint-disable-next-line no-unused-vars
  const { data: videoList, isLoading, isError } = useGetCategoryVideoQuery(
    selectedSection ? { category: getCategoryForAPI(selectedSection), body_part: activityFormData?.body_part } : skipToken, {
    refetchOnMountOrArgChange: false,
  }, { skip: !selectedSection }
  );

  const [deleteChill] = useDeleteChillMutation();
  const [updateChill] = useUpdateChillMutation();

  // eslint-disable-next-line no-unused-vars
  const { getActivityList, isLoading: isActivityLoading } = useGetAllActivityQuery({
    page: pagination?.Activity?.page,
    rowsPerPage: pagination?.Activity?.rowsPerPage,
    actorId: id,
    actorType: userType
  }, { refetchOnMountOrArgChange: true });
  const [deleteActivity] = useDeleteActivityMutation();
  const [
    addActivity,
    { isSuccess: addActivitySuccess, isLoading: addActivityLoading },
  ] = useAddActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();

  // eslint-disable-next-line no-unused-vars
  const { getAllLearn, isLoading: isLearnLoading } = useGetAllLearnQuery({
    page: pagination?.Learn?.page,
    rowsPerPage: pagination?.Learn?.rowsPerPage,
    actorId: id,
    actorType: userType
    }, { refetchOnMountOrArgChange: true });
  const [deleteLearn] = useDeleteLearnMutation();
  const [addLearn, { isSuccess: learnSuccess, isLoading: learnLoading }] =
    useAddLearnMutation();
  const [updateLearn] = useUpdateLearnMutation();

  // eslint-disable-next-line no-unused-vars
  const { getAllTips, isLoading: isTipLoading } = useGetAllTipsQuery({
    page: pagination?.Tips?.page,
    rowsPerPage: pagination?.Tips?.rowsPerPage,
    actorId: id,
    actorType: userType
  }, { refetchOnMountOrArgChange: true });
  const [deleteTips] = useDeleteTipsMutation();
  const [addTips, { isSuccess: tipSuccess, isLoading: tipLoading }] =
    useAddTipsMutation();
  const [updateTips] = useUpdateTipsMutation();



  const bodyPartList = [
    "Any",
    "Head",
    "Neck",
    "Shoulder",
    "Fingers",
    "Hip",
    "Upper Arm",
    "Lower Arm",
    "Elbow",
    "Hand",
    "Upper Back",
    "Lower Back",
    "Upper Leg",
    "Knee",
    "Lower Leg",
    "Foot",
    "Abdomen"
  ];



  const array = ["Relax", "Move", "Learn", "Tips"];

  // Map section names to pagination keys
  const getPaginationKey = (section) => {
    if (section === "Relax") return "Chill";
    if (section === "Move") return "Activity";
    return section; // "Learn" and "Tips" match
  };

  const handleChangePage = (section) => (event, newPage) => {
    const paginationKey = getPaginationKey(section);
    setPagination((prev) => ({
      ...prev,
      [paginationKey]: { ...prev[paginationKey], page: newPage + 1 },
    }));
  };

  const handleChangeRowsPerPage = (section) => (event) => {
    const paginationKey = getPaginationKey(section);
    setPagination((prev) => ({
      ...prev,
      [paginationKey]: {
        ...prev[paginationKey],
        rowsPerPage: parseInt(event.target.value, 10),
        page: 1,
      },
    }));
  };

  const handleEdit = (row, section) => {
    setSelectedSection(section);
    setSelectedData(row);
    setEditCanva(true);
  };


  const handleDelete = (row, entityType) => {
    const confirmHandler = () => {
      if (entityType === "chill") {
        handleDeleteConfirmChill(row._id);
      } else if (entityType === "activity") {
        handleDeleteConfirmActivity(row._id);
      } else if (entityType === "learn") {
        handleDeleteConfirmLearn(row._id);
      } else if (entityType === "tips") {
        handleDeleteConfirmTips(row._id);
      }
    };
    setSelectedRow({
      content: `Are you sure you want to delete the ${entityType} "${row?.title}"?`,
      confirmHandler,
    });
    setDeleteModalOpen(true);
  };

  const onClose = () => {
    setDeleteModalOpen(false);
  };

  const handleStatusChange = (row, entityType) => {
    if (entityType === "chill") {
      let payload = {
        status: row?.status === "active" ? "inactive" : "active",
      };
      updateChill({ data: payload, id: row._id, status: "status" });
    }
    if (entityType === "activity") {
      let payload = {
        status: row?.status === "active" ? "inactive" : "active",
      };
      updateActivity({ data: payload, id: row._id, status: "status" });
    }
    if (entityType === "learn") {
      let payload = {
        status: row?.status === "active" ? "inactive" : "active",
      };
      updateLearn({ data: payload, id: row._id, status: "status" });
    }
    if (entityType === "tips") {
      let payload = {
        status: row?.status === "active" ? "inactive" : "active",
      };
      updateTips({ data: payload, id: row._id, status: "status" });
    }
  };

  const chillColumns = createColumnsPatientUsefull(
    handleDelete,
    handleEdit,
    "chill",
    userType,
    handleStatusChange
  );
  const activityColumns = createColumnsPatientUsefull(
    handleDelete,
    handleEdit,
    "activity",
    userType,
    handleStatusChange
  );
  const learnColumns = createColumnsPatientUsefull(
    handleDelete,
    handleEdit,
    "learn",
    userType,
    handleStatusChange
  );
  const tipsColumns = createColumnsPatientUsefull(
    handleDelete,
    handleEdit,
    "tips",
    userType,
    handleStatusChange
  );

  const handleCreateNewClick = (section) => {
    setSelectedSection(section);
    setTimeout(() => {
      setCreateCanva(true);
    }, 200);


  };

  const handleDeleteConfirmChill = (rowId) => {
    setDeleteModalOpen(false);
    deleteChill({ id: rowId, actorId: id, actorType: userType });
  };

  const handleDeleteConfirmActivity = (rowId) => {
    setDeleteModalOpen(false);
    deleteActivity({ id: rowId, actorId: id, actorType: userType });
  };

  const handleDeleteConfirmLearn = (rowId) => {
    setDeleteModalOpen(false);
    deleteLearn({ id: rowId, actorId: id, actorType: userType });
  };

  const handleDeleteConfirmTips = (rowId) => {
    setDeleteModalOpen(false);
    deleteTips({ id: rowId, actorId: id, actorType: userType });
  };

  const onclose = () => {
    setCreateCanva(false);
    setErrors({});
    setEditCanva(false);
    setFormData({
      chillTitle: "",
      body_part: [],
      chillVideoUrl: "",
      chillThumbnail: "",
      description: "",
      thumbnailPreview: null
    });
    setActivityFormData({
      title: "",
      body_part: [],
      videoURL: "",
      description: "",
      additionalText: "",
      quotedText: "",
      quickTip: "",
      thumbnailPreview: null
    });
    setLearnFormData({
      title: "",
      subtitle: "",
      bodyText: "",
      description: "",
      body_part: [],
      footerText: "",
      ctaLabelText: "",
      videoTitle: "",
      videoSubtitle: "",
      videoURL: "",
      addFooter: false,
      addVideo: false,
      thumbnailPreview: null

    });
    setTipsFormData({
      title: '',
      sub_title: '',
      body_text: ''
    });
  };


  return (
    <>
      {array?.map((section) => {
        const tableData =
          section === "Relax"
            ? chillData?.chills ?? []
            : section === "Move"
              ? activityData?.data ?? []
              : section === "Learn"
                ? learnData?.data ?? []
                : tipsData?.data ?? [];
        return (
          <div className="mt-4" key={section}>
            <div className="d-flex justify-content-between">
              <h6>
                <strong>{section}</strong>
              </h6>
              {userType !== "coach" ? (
                <button
                  className="add-bt-wid-def d-flex align-items-center"
                  onClick={() => handleCreateNewClick(section)}

                >
                  <>
                    <img
                      loading="lazy"
                      src={Addbutton}
                      height={14}
                      width={14}
                      className="ms-1"
                    />
                    <span className="ms-2">Add New</span>
                  </>
                </button>
              ) : null}
            </div>
            <div className="mt-3">
              <DataTable
                columns={
                  section === "Relax"
                    ? chillColumns
                    : section === "Move"
                      ? activityColumns
                      : section === "Learn"
                        ? learnColumns
                        : tipsColumns
                }
                data={tableData}
                progressPending={
                  section === "Relax"
                    ? isChillLoading
                    : section === "Move"
                      ? isActivityLoading
                      : section === "Learn"
                        ? isLearnLoading
                        : isTipLoading
                }
                customStyles={customStylesChill}
                subHeaderComponent={subHeaderComponentMemo}
                responsive
                sortIcon={<img loading="lazy" src={Sorticon} />}
              />
            </div>
            <div
              className="mt-3 mb-5"
              style={{ display: "flex", justifyContent: "end" }}
            >
              {((section === "Move" && activityData?.totalRecords > 0) ||
                (section === "Tips" && tipsData?.totalRecords > 0) ||
                (section === "Relax" && chillData?.totalRecords > 0) ||
                (section === "Learn" && learnData?.totalRecords > 0)) && (
                  <TablePagination
                    component="div"
                    count={
                      section === "Relax"
                        ? chillData?.totalRecords ?? 0
                        : section === "Move"
                          ? activityData?.totalRecords ?? 0
                          : section === "Learn"
                            ? learnData?.totalRecords ?? 0
                            : tipsData?.totalRecords ?? 0
                    }
                    page={(pagination[getPaginationKey(section)]?.page ?? 1) - 1}
                    onPageChange={handleChangePage(section)}
                    rowsPerPage={pagination[getPaginationKey(section)]?.rowsPerPage ?? 10}
                    onRowsPerPageChange={handleChangeRowsPerPage(section)}
                    rowsPerPageOptions={[5, 10, 15, 20 , 50]}
                  />
                )}
            </div>
          </div>
        );
      })}

      <COffcanvas
        className="ps-3 pe-3 pb-5 default_offcanvas_add"
        backdrop="static"
        placement="bottom"
        visible={createCanva}
        style={{ height: "550px" }}
        onHide={onclose}
      >
        <COffcanvasBody>
          <div>
            {selectedSection === "Relax" && (
              <ChillSection
                formData={formData}
                setFormData={setFormData}
                addChill={addChill}
                id={id}
                setCreateCanva={setCreateCanva}
                chillSuccess={chillSuccess}
                chillLoading={chillLoading}
                categoryVideoList={categoryVideoList}
                bodyPartList={bodyPartList}
                errors={errors}
                setErrors={setErrors}
                userType={userType}
              />
            )}
            {selectedSection === "Move" && (
              <ActivitySection
                activityFormData={activityFormData}
                setActivityFormData={setActivityFormData}
                addActivity={addActivity}
                id={id}
                setCreateCanva={setCreateCanva}
                addActivitySuccess={addActivitySuccess}
                addActivityLoading={addActivityLoading}
                categoryVideoList={categoryVideoList}
                bodyPartList={bodyPartList}
                errors={errors}
                setErrors={setErrors}
                userType={userType}
              />
            )}
            {selectedSection === "Learn" && (
              <LearnSection
                learnFormData={learnFormData}
                setLearnFormData={setLearnFormData}
                addLearn={addLearn}
                id={id}
                setCreateCanva={setCreateCanva}
                learnSuccess={learnSuccess}
                learnLoading={learnLoading}
                categoryVideoList={categoryVideoList}
                bodyPartList={bodyPartList}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {selectedSection === "Tips" && (
              <TipsSection
                tipsFormData={tipsFormData}
                id={id}
                setTipsFormData={setTipsFormData}
                addTips={addTips}
                setCreateCanva={setCreateCanva}
                tipSuccess={tipSuccess}
                tipLoading={tipLoading}
                errors={errors}
                setErrors={setErrors}
                userType={userType}
              />
            )}
          </div>
        </COffcanvasBody>
      </COffcanvas>

      <DeleteModal
        onClose={onClose}
        onConfirm={selectedRow?.confirmHandler}
        deleteModal={isDeleteModalOpen}
        content={selectedRow?.content}
      />
      <COffcanvas
        className="ps-3 pe-3 default_offcanvas_edit border"
        backdrop="static"
        placement="bottom"
        visible={editCanva}
        style={{ height: "550px" }}
        onHide={onclose}
      >
        <COffcanvasHeader>
          <COffcanvasTitle className="pt-4">
            Edit {`${selectedSection === "tips" ? "Tip" : selectedSection === "chill" ? "Relax" : selectedSection === "activity" ? "Move" : selectedSection === "learn" ? "Learn" : "Tip"}`}
          </COffcanvasTitle>
          <CCloseButton
            className="text-reset modal-close-cross"
            onClick={() => {
              setEditCanva(false);
              setSelectedData(null);
            }}
          />
        </COffcanvasHeader>
        <COffcanvasBody>
          <div>
            {selectedSection === "chill" && (
              <ChillSectionEdit
                selectedRow={selectedData}
                setEditCanva={setEditCanva}
                id={id}
                categoryVideoList={categoryVideoList}
                bodyPartList={bodyPartList}
                errors={errors}
                setErrors={setErrors}

              />
            )}
            {selectedSection === "activity" && (
              <ActivitySectionEdit
                selectedRow={selectedData}
                setEditCanva={setEditCanva}
                id={id}
                categoryVideoList={categoryVideoList}
                bodyPartList={bodyPartList}
                errors={errors}
                setErrors={setErrors}

              />
            )}
            {selectedSection === "learn" && (
              <LearnSectionEdit
                selectedRow={selectedData}
                setEditCanva={setEditCanva}
                id={id}
                key={selectedData?._id || "new"}
                categoryVideoList={categoryVideoList}
                bodyPartList={bodyPartList}
                errors={errors}
                setErrors={setErrors}



              />
            )}
            {selectedSection === "tips" && (
              <TipsSectionEdit
                selectedRow={selectedData}
                setEditCanva={setEditCanva}
              />
            )}
          </div>
        </COffcanvasBody>
      </COffcanvas>
    </>
  );
};

export default PatientUseful;
