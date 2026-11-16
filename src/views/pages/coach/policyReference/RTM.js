import React, { useEffect, useState } from "react";
import customStyles, { customStylesBilling } from "../../../../Components/DataTable/CustomStyle";
import { useDeleteBillingPolicyMutation, useGetAllBillingPoliciesQuery, usePostBillingPoliciesMutation, useUpdateBillingPoliciesMutation, useDownloadBillingPolicyFileMutation } from "../../../../redux/apis/billingRtm_api";
import { useSelector } from "react-redux";
import DeleteModal from "../../../../Components/Modal/DeleteModal";
import { useDeleteRTMGuideLinesMutation, useGetAllRTMGuidelinesQuery, usePostRtmGuideLinesMutation, useUpdateGuideLinesMutation } from "../../../../redux/apis/guidelinesRtm_api";
import { useAddTrainingResourcesMutation, useDeleteTrainingResourcesMutation, useGetAllTrainingResourcesQuery, useUpdateTrainingResourcesMutation } from "../../../../redux/apis/trainingResources_api";
import BillingPoliciesSection from "./billingPoliciesSection";
import RTMGuidelinesSection from "./RTMGuidelinesSection";
import TrainingResources from "./TrainingResources";
import { createColumns } from "../../../../Components/DataTable/commonColumn";
import Section from "../../../../Components/DataTable/Section";
import { TroubleshootOutlined } from "@mui/icons-material";

const RTM = () => {

  const id = useSelector((state) => state?.user?.id);
  const userType = useSelector((state) => state?.user?.userType);
  const billingpolicyList = useSelector((state) => state?.allPatientUseFullResources?.billingPolicies);
  const rtmGuidelineList = useSelector((state) => state?.allPatientUseFullResources?.rtmGuidelines);
  const trainingResourceList = useSelector((state) => state?.allPatientUseFullResources?.trainingResources);

  const [createCanva, setCreateCanva] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const [btnDisableRtm, setBtnDisableRtm] = useState(false);
  const [btnDisableTR, setBtnDisableTR] = useState(false);
  const [createCanvaRTMGuidelines, setCreateCanvaRTMGuidelines] = useState(false);
  const [createCanvatrainingResources, setCreateCanvatrainingResources] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [errors, setErrors] = useState({});
  const [pagination, setPagination] = useState({
    billing: { page: 1, rowsPerPage: 10 },
    rtm: { page: 1, rowsPerPage: 10 },
    training: { page: 1, rowsPerPage: 10 },
  });

  const [billingDetails, setBillingDetails] = useState({
    document_name: "",
    description: "",
    body_text: "",
    file: null,
    actorType: userType
  });
  const [rtmGuidelinesDetails, setRtmGuidelinesDetails] = useState({
    document_name: "",
    description: "",
    body_text: "",
    file: null,
    actorType: userType
  });
  const [trainingResourceDetails, setTrainingResourcesDetails] = useState({
    document_name: "",
    description: "",
    body_text: "",
    file: null,
    actorType: userType
  });

  // eslint-disable-next-line no-unused-vars
  const { data: billingPolicies, isLoading: billingPoliciesLoading } = useGetAllBillingPoliciesQuery({ page: pagination?.billing?.page, rowsPerPage: pagination?.billing?.rowsPerPage, actorId: id, actorType: userType }, { refetchOnMountOrArgChange: true });
  const [addbillingpolicy, { isSuccess: billingSuccess, isLoading: billingLoading, error: billingError }] = usePostBillingPoliciesMutation();
  const [updateBillingpolicy] = useUpdateBillingPoliciesMutation();
  const [deleteBillingPolicy] = useDeleteBillingPolicyMutation();
  const [downloadBillingPolicyFile] = useDownloadBillingPolicyFileMutation();

  // eslint-disable-next-line no-unused-vars
  const { data: rtmGuidelines, isLoading: rtmGuidelineLoading } = useGetAllRTMGuidelinesQuery({ page: pagination?.rtm?.page, rowsPerPage: pagination?.rtm?.rowsPerPage, actorId: id, actorType: userType }, { refetchOnMountOrArgChange: TroubleshootOutlined });
  const [addRtmGuidelines, { isSuccess: rtmSuccess, isError: rtmError, isLoading: rtmLoading }] = usePostRtmGuideLinesMutation();
  const [updateGuideLines] = useUpdateGuideLinesMutation();
  const [deleteRTMGuideLines] = useDeleteRTMGuideLinesMutation();

  // eslint-disable-next-line no-unused-vars
  const { data: trainingresource, isLoading: trainingresourceLoading } = useGetAllTrainingResourcesQuery({ page: pagination?.training?.page, rowsPerPage: pagination?.training?.rowsPerPage, actorId: id, actorType: userType }, { refetchOnMountOrArgChange: true });
  const [postTrainingResources, { isSuccess: trainingResourcesSuccess, isError: trainingResourcesError, isLoading: trainingResourcesLoading }] = useAddTrainingResourcesMutation();
  const [updateTrainingResources] = useUpdateTrainingResourcesMutation();
  const [deleteTrainingResources] = useDeleteTrainingResourcesMutation();

  const updateButtonState = (loading, error, success, setBtnDisable) => {
    if (loading) {
      setBtnDisable(true);
    } else {
      setBtnDisable(false);
    }
  };

  useEffect(() => {
    updateButtonState(billingLoading, billingError, billingSuccess, setBtnDisable);
  }, [billingError, billingSuccess, billingLoading]);

  useEffect(() => {
    updateButtonState(rtmLoading, rtmError, rtmSuccess, setBtnDisableRtm);
  }, [rtmError, rtmSuccess, rtmLoading]);

  useEffect(() => {
    updateButtonState(trainingResourcesLoading, trainingResourcesError, trainingResourcesSuccess, setBtnDisableTR);
  }, [trainingResourcesError, trainingResourcesSuccess, trainingResourcesLoading]);

  const handleChangePage = (section) => (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      [section]: { ...prev[section], page: newPage + 1 },
    }));
  };

  const handleChangeRowsPerPage = (section) => (event) => {
    setPagination((prev) => ({
      ...prev,
      [section]: { ...prev[section], rowsPerPage: parseInt(event.target.value, 10), page: 1 },
    }));
  };

  const handleDownload = (row, type) => {
    if (row?._id && row?.file) {
      const fileName = row?.file_original_name || row?.document_name || `document_${row._id}`;
      downloadBillingPolicyFile({
        object_ID: row._id,
        fileName: fileName,
        type: type
      });
    }
  };

  const trainingResourceColumns = createColumns(
    (row) => handleDelete(row, "training_resources"),
    setTrainingResourcesDetails,
    setIsEditMode,
    setEditId,
    setCreateCanvatrainingResources,
    userType,
    (row) => handleStatusChange(row, "training_resources"),
    (row) => handleDownload(row, "trainingresource")
  );

  const rtmGuidelineColumn = createColumns(
    (row) => handleDelete(row, "rtm"),
    setRtmGuidelinesDetails,
    setIsEditMode,
    setEditId,
    setCreateCanvaRTMGuidelines,
    userType,
    (row) => handleStatusChange(row, "rtm"),
    (row) => handleDownload(row, "rtmguidelines")
  );

  const billingColumns = createColumns(
    (row) => handleDelete(row, "billing"),
    setBillingDetails,
    setIsEditMode,
    setEditId,
    setCreateCanva,
    userType,
    (row) => handleStatusChange(row, "billing"),
    (row) => handleDownload(row, "billingpolicy")
  );

  const handleBillingSubmit = (e) => {
    e.preventDefault();
    if (!billingDetails?.document_name) {
      setErrors({ requiredField: "All required fields must be filled" });
      setTimeout(() => {
        setErrors({ requiredField: "" });
      }, 2000);
      return;
    }

    let formData = new FormData();
    formData.append("user_id", id);
    formData.append("actorType", userType);
    formData.append("document_name", billingDetails?.document_name);
    formData.append("description", billingDetails?.description || "");
    formData.append("body_text", billingDetails?.body_text || "");
    if (billingDetails.file) {
      formData.append("file", billingDetails.file);
    }
    if (isEditMode) {
      updateBillingpolicy({ payload: formData, id: editId, flag: "Edit" });
    } else {
      addbillingpolicy(formData);
    }

    // Reset form and state
    setCreateCanva(false);
    setBillingDetails({
      document_name: "",
      description: "",
      body_text: "",
      file: null,
      actorType: userType
    });
    setIsEditMode(false);
    setEditId(null);
  };

  const handleGuidelinesSubmit = (e) => {
    e.preventDefault();
    if (!rtmGuidelinesDetails?.document_name) {
      setErrors({ requiredField: "All required fields must be filled" });
      setTimeout(() => {
        setErrors({ requiredField: "" });
      }, 2000);
      return;
    }
    let formData = new FormData();
    formData.append("user_id", id);
    formData.append("actorType", userType);
    formData.append("document_name", rtmGuidelinesDetails?.document_name);
    formData.append("description", rtmGuidelinesDetails?.description || "");
    formData.append("body_text", rtmGuidelinesDetails?.body_text || "");
    if (rtmGuidelinesDetails.file) {
      formData.append("file", rtmGuidelinesDetails.file);
    }

    if (isEditMode) {
      updateGuideLines({ payload: formData, id: editId, flag: "Edit" });
    } else {
      addRtmGuidelines(formData);
    }

    // Reset form and state
    setCreateCanvaRTMGuidelines(false);
    setRtmGuidelinesDetails({
      document_name: "",
      description: "",
      body_text: "",
      file: null,
      actorType: userType
    });
    setIsEditMode(false);
    setEditId(null);
  };

  const handleTrainingResourcesSubmit = (e) => {
    e.preventDefault();
    if (!trainingResourceDetails?.document_name) {
      setErrors({ requiredField: "All required fields must be filled" });
      setTimeout(() => {
        setErrors({ requiredField: "" });
      }, 2000);
      return;
    }
    let formData = new FormData();
    formData.append("user_id", id);
    formData.append("actorType", userType);
    formData.append("document_name", trainingResourceDetails?.document_name);
    formData.append("description", trainingResourceDetails?.description || "");
    formData.append("body_text", trainingResourceDetails?.body_text || "");
    if (trainingResourceDetails.file) {
      formData.append("file", trainingResourceDetails.file);
    }

    if (isEditMode) {
      updateTrainingResources({ payload: formData, id: editId, flag: "Edit" });
    } else {
      postTrainingResources(formData);
    }

    // Reset form and state
    setCreateCanvatrainingResources(false);
    setTrainingResourcesDetails({
      document_name: "",
      description: "",
      body_text: "",
      file: null,
      actorType: userType
    });
    setIsEditMode(false);
    setEditId(null);
  };

  const handleDelete = (row, entityType) => {
    const entityName = entityType === "billing" ? "billing policy" : entityType === "rtm" ? "RTM guideline" : entityType === "training_resources" ? "Training Resources" : null;
    const confirmHandler = () => {
      if (entityType === "billing") {
        confirmDeleteBillingPolicy(row._id);
      } else if (entityType === "rtm") {
        confirmDeleteRTMGuideline(row._id);
      } else if (entityType === "training_resources") {
        confirmDeleteTrainingResources(row._id);
      }
    };
    setSelectedRow({
      content: `Are you sure you want to delete the ${entityName} "${row?.document_name}"?`,
      confirmHandler,
    });
    setIsDeleteModalOpen(true);
  };

  const handleStatusChange = (row, type) => {
    if (type === "billing") {
      let payload = {
        status: row?.status === "active" ? "inactive" : "active"
      };
      updateBillingpolicy({ payload: payload, id: row?._id, flag: "status" });
    }
    if (type === "rtm") {
      let payload = {
        status: row?.status === "active" ? "inactive" : "active"
      };
      updateGuideLines({ payload: payload, id: row?._id, flag: "status" });
    }
    if (type === "training_resources") {
      let payload = {
        status: row?.status === "active" ? "inactive" : "active"
      };
      updateTrainingResources({ payload: payload, id: row?._id, flag: "status" });
    }
  };

  const confirmDeleteBillingPolicy = (rowId) => {
    deleteBillingPolicy({ id: rowId, actorId: id, actorType: userType });
    setIsDeleteModalOpen(false);
    setSelectedRow(null);
  };

  const confirmDeleteRTMGuideline = (rowId) => {
    deleteRTMGuideLines({ id: rowId, actorId: id, actorType: userType });
    setIsDeleteModalOpen(false);
    setSelectedRow(null);
  };

  const confirmDeleteTrainingResources = (rowId) => {
    deleteTrainingResources({ id: rowId, actorId: id, actorType: userType });
    setIsDeleteModalOpen(false);
    setSelectedRow(null);
  };

  const onclose = () => {
    setCreateCanva(false);
    setCreateCanvaRTMGuidelines(false);
    setCreateCanvatrainingResources(false);
    setErrors({});
  };
  return (
    <>
      <Section
        title="Billing Policies"
        columns={billingColumns}
        data={billingpolicyList}
        customStyles={customStyles}
        userType={userType}
        loading={billingPoliciesLoading}
        handleChangePage={handleChangePage("billing")}
        rowsPerPage={pagination?.billing?.rowsPerPage}
        handleChangeRowsPerPage={handleChangeRowsPerPage("billing")}
        page={pagination?.billing?.page}
        onCreateClick={() => {
          setCreateCanva(true);
          setIsEditMode(false);
          setBillingDetails({ document_name: "", description: "", body_text: "", file: null });
        }}
      />
      <Section
        title="RTM Guidelines"
        columns={rtmGuidelineColumn}
        data={rtmGuidelineList}
        customStyles={customStylesBilling}
        userType={userType}
        loading={rtmGuidelineLoading}
        handleChangePage={handleChangePage("rtm")}
        rowsPerPage={pagination?.rtm?.rowsPerPage}
        handleChangeRowsPerPage={handleChangeRowsPerPage("rtm")}
        page={pagination?.rtm?.page}
        onCreateClick={() => {
          setCreateCanvaRTMGuidelines(true);
          setIsEditMode(false);
          setRtmGuidelinesDetails({ document_name: "", description: "", body_text: "", file: null });
        }}
      />
      <Section
        title="Training Resources"
        columns={trainingResourceColumns}
        data={trainingResourceList}
        customStyles={customStylesBilling}
        userType={userType}
        loading={trainingresourceLoading}
        handleChangePage={handleChangePage("training")}
        rowsPerPage={pagination?.training?.rowsPerPage}
        handleChangeRowsPerPage={handleChangeRowsPerPage("training")}
        page={pagination?.training?.page}
        onCreateClick={() => {
          setCreateCanvatrainingResources(true);
          setIsEditMode(false);
          setTrainingResourcesDetails({ document_name: "", description: "", body_text: "", file: null });
        }}
      />
      <>
        <BillingPoliciesSection
          createCanva={createCanva}
          setCreateCanva={setCreateCanva}
          setBillingDetails={setBillingDetails}
          billingDetails={billingDetails}
          errors={errors}
          setErrors={setErrors}
          handleBillingSubmit={handleBillingSubmit}
          isEditMode={isEditMode}
          onclose={onclose}
          btnDisable={btnDisable}
          userType={userType}
        />
        <RTMGuidelinesSection
          handleGuidelinesSubmit={handleGuidelinesSubmit}
          setCreateCanvaRTMGuidelines={setCreateCanvaRTMGuidelines}
          createCanvaRTMGuidelines={createCanvaRTMGuidelines}
          errors={errors}
          setErrors={setErrors}
          setRtmGuidelinesDetails={setRtmGuidelinesDetails}
          rtmGuidelinesDetails={rtmGuidelinesDetails}
          isEditMode={isEditMode}
          onclose={onclose}
          btnDisableRtm={btnDisableRtm}
          userType={userType}
        />
        <TrainingResources
          createCanvatrainingResources={createCanvatrainingResources}
          setCreateCanvatrainingResources={setCreateCanvatrainingResources}
          setTrainingResourcesDetails={setTrainingResourcesDetails}
          errors={errors}
          setErrors={setErrors}
          trainingResourceDetails={trainingResourceDetails}
          handleTrainingResourcesSubmit={handleTrainingResourcesSubmit}
          isEditMode={isEditMode}
          onclose={onclose}
          btnDisableTR={btnDisableTR}
          userType={userType}
        />
        <DeleteModal
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={selectedRow?.confirmHandler}
          deleteModal={isDeleteModalOpen}
          content={selectedRow?.content}
          isEditMode={isEditMode}
        />
      </>
    </>
  );
};

export default RTM;