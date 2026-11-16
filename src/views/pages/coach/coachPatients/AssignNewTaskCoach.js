import React, { useEffect, useState, useMemo } from "react";
import {
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CCloseButton,
} from "@coreui/react";
import {
  useAssignTaskMutation,
  useGetCategoriesQuery,
} from "../../../../redux/apis/patient_coach_api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";
import { convertLocalDateToUTC } from "../../../../utils/dateUtils";
import { useSelector } from "react-redux";

const AssignTaskCanvas = ({ assignCanva, patientId, refetch, onClose }) => {
  const initialFormData = {
    taskCategory: "",
    video_url: "",
    date: null,
    id: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [btnDisabled, setBtnDisabled] = useState(false);
  const userType = useSelector((state) => state?.user?.userType);
  const id = useSelector((state) => state?.user?.id);
  const { data: videosData } = useGetCategoriesQuery(
    {
      category: formData.taskCategory,
    },
    { skip: !formData.taskCategory }
  );

  const [assignTask, { isSuccess, isLoading, isError }] =
    useAssignTaskMutation();

  const videosArray = useMemo(() => videosData?.data || [], [videosData]);

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  useEffect(() => {
    if (isSuccess) {
      setBtnDisabled(false);
      refetch();
      onClose();
      resetForm();
    }
    if (isLoading) setBtnDisabled(true);
    if (isError) setBtnDisabled(false);
  }, [isSuccess, isLoading, isError]);

  const taskOptions = useMemo(
    () => [
      { value: "", label: "Select Category" },
      { value: "Relax", label: "Relax" },
      { value: "Activity", label: "Activity" },
      { value: "Learn", label: "Learn" },
    ],
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      video_url: "", // Reset video_url when category changes
      id: "", // Reset id when category changes
    }));
    if (value) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVideoChange = (e) => {
    const selectedVideo = videosArray.find(
      (v) => v.video_url === e.target.value
    );
    setFormData((prev) => ({
      ...prev,
      video_url: selectedVideo?.video_url || "",
      id: selectedVideo?._id || "",
    }));
    if (e.target.value) {
      setErrors((prev) => ({ ...prev, video_url: "" }));
    }
  };

  const validateFields = () => {
    const newErrors = {};
    ["taskCategory", "video_url", "date"].forEach((field) => {
      if (!formData[field]) newErrors[field] = "This field is required.";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateFields();

    if (!isValid) {
      setTimeout(() => {
        setErrors({});
      }, 3000);
      return;
    }
  
    // Send current date & time in UTC so backend stores correct moment (assigned_on, date, assigned_date)
    const utcDateString = convertLocalDateToUTC(formData.date, true);
    if (!utcDateString) {
      setErrors({ date: "Invalid date." });
      setTimeout(() => setErrors({}), 3000);
      return;
    }

    const payload = {
      assignedTask: {
        category_name: formData.taskCategory,
        video_url: formData.video_url,
        date: utcDateString,
        assigned_date: utcDateString,
        actorId: id,
        actorType: userType
      },
    };

    assignTask({ data: payload, id: patientId });
  };

  return (
<COffcanvas
  className="ps-3 pe-3 offcanvas_add_user_auto py-3"
  backdrop="static"
  placement="bottom"
  visible={assignCanva}
  onClose={resetForm}
  onHide={resetForm}
>
  <COffcanvasHeader>
    <COffcanvasTitle className="pt-4">Assign New Task</COffcanvasTitle>
    <CCloseButton
      className="text-reset modal-close-cross"
      onClick={onClose}
    />
  </COffcanvasHeader>
  <COffcanvasBody>
    <form onSubmit={handleSubmit}>
      <div className="row align-items-end">
        {/* Date Field - time is set to current time when date is selected */}
        <div className="col">
          <label className="rv-label-newpractice py-2">Date *</label>
          <DatePicker
            customInput={<BlockKeyboardInput />}
            className={`form-control input-dt ${errors.date ? "is-invalid" : ""}`}
            placeholderText="Select Date"
            dateFormat="MM/dd/yyyy"
            selected={formData.date}
            minDate={new Date()}
            onChange={(date) => {
              if (date) {
                const now = new Date();
                const dateWithCurrentTime = new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  now.getHours(),
                  now.getMinutes(),
                  now.getSeconds(),
                  now.getMilliseconds()
                );
                setFormData((prev) => ({ ...prev, date: dateWithCurrentTime }));
              } else {
                setFormData((prev) => ({ ...prev, date: null }));
              }
            }}
            isClearable
          />
          <div style={{ height: "18px" }}>
            {errors.date && <small className="text-danger">{errors.date}</small>}
          </div>
        </div>

        {/* Category Field */}
        <div className="col">
          <label className="rv-label-newpractice py-2">Category *</label>
          <select
            name="taskCategory"
            className={`form-select form-control-input ${errors.taskCategory ? "is-invalid" : ""}`}
            value={formData.taskCategory}
            onChange={handleChange}
          >
            {taskOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div style={{ height: "18px" }}>
            {errors.taskCategory && <small className="text-danger">{errors.taskCategory}</small>}
          </div>
        </div>

        {/* Video Field */}
        <div className="col">
          <label className="rv-label-newpractice py-2">Video *</label>
          <select
            name="video_url"
            className={`form-select form-control-input ${errors.video_url ? "is-invalid" : ""}`}
            value={formData.video_url}
            onChange={handleVideoChange}
            disabled={!formData.taskCategory}
          >
            <option value="">Select Video</option>
            {videosArray.map((video_url) => (
              <option key={video_url._id} value={video_url.video_url}>
                {video_url.title}
              </option>
            ))}
          </select>
          <div style={{ height: "18px" }}>
            {errors.video_url && <small className="text-danger">{errors.video_url}</small>}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="row pt-4">
        <div className="col-md-12 text-end">
          <button
            className="rv-reset-cancel mt-4"
            type="button"
            onClick={resetForm}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn add-practs-btn fw-bold mx-2"
            disabled={btnDisabled}
          >
            Assign
          </button>
        </div>
      </div>
    </form>
  </COffcanvasBody>
</COffcanvas>

  );
};

export default AssignTaskCanvas;
