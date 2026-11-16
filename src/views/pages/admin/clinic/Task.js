import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Addbutton from "../../../../assets/icons/plus.png";
import Sorticon from "../../../../assets/icons/sort.png";
import { customStylesTask } from "../../../../Components/DataTable/CustomStyle";
import { columnsTask } from "../../../../Components/DataTable/commonColumn";
import {
  useAddTemplateMutation,
  useCloneTemplateMutation,
  useDeleteTemplateMutation,
  useGetAllTemplateQuery,
  useTemplateUpdateMutation,
} from "../../../../redux/apis/patient_coach_api";
import { useSelector } from "react-redux";
import DeleteModal from "../../../../Components/Modal/DeleteModal";
import PaginationComponent from "../../../../utils/Pagination";
import { useNavigate } from "react-router-dom";
import { validateRequired, validateRequiredNumeric } from "../../../../utils/inputValidation";
import TaskTemplateOffcanvas from "./TaskTemplateOffcanvas";

const Task = () => {
  const navigate = useNavigate();
  const template = useSelector((state) => state?.allCoach?.template);
  const actorType = useSelector((state) => state.user?.userType);
  console.log("actorTypessssssssssssss",actorType);
  const actorId = useSelector((state) => state.user?.id);
  const [toggleAdd, settoggleAdd] = useState(false);
  const [toggleEdit, setToggleEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [rowData, setRowData] = useState();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    template_name: "",
    diagnosis: "",
    pain_score_min: "",
    pain_score_max: "",
    no_of_days: "",
    activity: "",
    relaxation: "",
    learning: "",
  });

  const clearForm = () => {
    setFormData({
      template_name: "",
      diagnosis: "",
      pain_score_min: "",
      pain_score_max: "",
      no_of_days: "",
      activity: "",
      relaxation: "",
      learning: "",
    });
    setFormErrors({});
  };

  const { isLoading, refetch } = useGetAllTemplateQuery(
    { page, rowsPerPage, actorId: actorId, actorType: actorType },
    { refetchOnMountOrArgChange: true }
  );
  const [cloneTemplate, { isSuccess: isCloneSuccess }] = useCloneTemplateMutation();
  const [addTemplate, { isSuccess: isAddSuccess, data: addedTemplateData }] = useAddTemplateMutation();
  const [updateTemplate, { isSuccess: isUpdateSuccess }] =
    useTemplateUpdateMutation();
  const [deleteTemplate, { isSuccess: isDeleteSuccess }] =
    useDeleteTemplateMutation();

  useEffect(() => {
    if (isAddSuccess && addedTemplateData) {
      clearForm();
      onclose();
      refetch();
      navigate("/task-details", { state: addedTemplateData });
    }
    if (isDeleteSuccess) {
      setDeleteModal(false);
      onclose();
      refetch();
    }
    if (isCloneSuccess) {
      onclose();
      refetch();
    }
  }, [isAddSuccess, isDeleteSuccess, isCloneSuccess, addedTemplateData, navigate]);

  useEffect(() => {
    if (isUpdateSuccess) {
      clearForm();
      setToggleEdit(false);
      refetch();
    }
  }, [isUpdateSuccess]);

  const togglleAdd = () => {
    settoggleAdd(!toggleAdd);
  };

  const onClose = () => {
    setDeleteModal(false);
    setRowData(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case "template_name":
      case "diagnosis":
        error = validateRequired(value);
        break;
      case "pain_score_range":
        // Combined validation for pain score range
        if (formData?.pain_score_min === "" || formData?.pain_score_max === "") {
          error = "Pain score range is required";
        }
        break;
      case "no_of_days":
      case "relaxation":
      case "activity":
      case "learning":
        error = validateRequiredNumeric(value);
        break;
      default:
        break;
    }
    return error;
  };

  // eslint-disable-next-line no-unused-vars
  const handleValidation = () => {
    const newErrors = {};
    
    // Fields that are disabled in edit mode
    const disabledInEditMode = ["diagnosis", "no_of_days", "activity", "relaxation", "learning"];
    
    // Validate pain score range as a combined field
    const painScoreError = validateField("pain_score_range", null);
    if (painScoreError) {
      newErrors["pain_score_range"] = painScoreError;
    }
    
    Object.keys(formData).forEach((key) => {
      // Skip pain score individual fields as we handle them as a range
      if (key === "pain_score_min" || key === "pain_score_max") {
        return;
      }
      
      // Skip validation for disabled fields in edit mode
      if (toggleEdit && disabledInEditMode.includes(key)) {
        return;
      }
      
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let error = null;

    let newValue = value;

    // Allow only digits (0–9) in "no_of_days"
    if (name === "no_of_days") {
      newValue = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Fields that are disabled in edit mode
    const disabledInEditMode = ["diagnosis", "no_of_days", "activity", "relaxation", "learning"];
    
    // Handle pain score range validation
    if (name === "pain_score_min" || name === "pain_score_max") {
      // Update the form data first, then validate the range
      const updatedFormData = { ...formData, [name]: newValue };
      const painScoreError = updatedFormData.pain_score_min === "" || updatedFormData.pain_score_max === "" 
        ? "Pain score range is required" 
        : null;
      
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        pain_score_range: painScoreError,
        // Clear individual field errors
        pain_score_min: null,
        pain_score_max: null,
      }));
    } else {
      // Don't validate disabled fields in edit mode
      if (!(toggleEdit && disabledInEditMode.includes(name))) {
        error = validateField(name, newValue);
      }

      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!handleValidation()) {
      setTimeout(() => {
        setFormErrors({});
      }, 3000);
      return;
    }


    const editpayload = {
      template_name: formData?.template_name,
      pain_score: {
        from: Number(formData?.pain_score_min),
        to: Number(formData?.pain_score_max),
      },
      actorId: actorId,
      actorType: actorType
    };

    let payload = {
      template_name: formData?.template_name,
      diagnosis: formData?.diagnosis,
      pain_score: {
        from: Number(formData?.pain_score_min),
        to: Number(formData?.pain_score_max),
      },
      task_days: Number(formData?.no_of_days),
      task_activity_days: Number(formData?.activity),
      task_relaxation_days: Number(formData?.relaxation),
      task_learning_days: Number(formData?.learning),
      actorId: actorId,
      actorType: actorType
    };

    if (toggleEdit) {
      updateTemplate({ id: editId, data: editpayload });
    } else {
      addTemplate(payload);
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setFormData({
      template_name: row.template_name,
      diagnosis: row?.diagnosis,
      pain_score_min: row.pain_score?.from,
      pain_score_max: row.pain_score?.to,
      no_of_days: row.task_days,
      activity: row.task_activity_days,
      relaxation: row.task_relaxation_days,
      learning: row.task_learning_days || "",
    });
    setToggleEdit(true);
  };

  const handleDelete = () => {
    let payload = {
      actorId: actorId,
      actorType: actorType,
    };
    deleteTemplate({ id: rowData?._id, body: payload });
  };

  const onclose = () => {
    settoggleAdd(false);
  };

  const navigateUserDetail = (row) => {
    navigate("/task-details", { state: row });
  };

  const handleClone = async (row) => {
    const templateId = row?._id;
    await cloneTemplate({ templateId, actorId, actorType });
  };
  const columns = columnsTask({
    setDeleteModal,
    setRowData,
    handleEdit,
    navigateUserDetail,
    handleClone, 
    actorType
  });



  return (
    <>
      <div className="main-container mt-4">
        <div className="d-flex justify-content-between">
          <div className="font-color">
            <h6>
              <strong>Journey Templates</strong>
            </h6>
          </div>
          <div className="d-flex flex-wrap align-items-center justify-content-between mx-2">
            <div className="mb-2">
              <button
                className="add-practice flex-items-center "
                onClick={() => togglleAdd()}
              >
                <img loading="lazy" src={Addbutton} height={14} width={14} />
                <span className="ms-2">Add New</span>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <DataTable
            columns={columns}
            data={template?.data}
            progressPending={isLoading}
            customStyles={customStylesTask}
            responsive={true}
            sortIcon={<img loading="lazy" src={Sorticon} />}
          />
        </div>
        <PaginationComponent
          totalRecords={template?.pagination?.totalRecords}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>
      <TaskTemplateOffcanvas
        isOpen={toggleAdd || toggleEdit}
        onClose={() => {
          if (toggleEdit) {
            setToggleEdit(false);
          } else {
            onclose();
          }
        }}
        isEditMode={toggleEdit}
        formData={formData}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        clearForm={clearForm}
      />
      <DeleteModal
        content={"Do you want to delete this template?"}
        onClose={onClose}
        deleteModal={deleteModal}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default Task;
