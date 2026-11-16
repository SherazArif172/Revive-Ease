import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import {
  useAssignTaskMutation,
  useGetCategoriesQuery,
} from "../../../../redux/apis/patient_coach_api";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";
import { convertLocalDateToUTC, parseUTCDateString } from "../../../../utils/dateUtils";

const AssignedTaskEditCanva = ({
  editAssignTask,
  setEditAssignTaskCanva,
  rowEditData,
  patientId,
  detailRefetch,
  onClose,
  actorType,
  actorId
}) => {
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    taskCategory: "",
    video_url: "",
    date: null,
    actorId: "",
    actorType: "",
  });

  const { data: videosData } = useGetCategoriesQuery(
    { category: formData.taskCategory },
    { skip: !formData.taskCategory }
  );

  const videosArray = useMemo(() => videosData?.data || [], [videosData]);

  const taskOptions = useMemo(
    () => [
      { value: "", label: "Select Category" },
      { value: "Relax", label: "Relax" },
      { value: "Activity", label: "Activity" },
      { value: "Learn", label: "Learn" },
    ],
    []
  );

  const [
    updateAssignedTask,
    {
      isSuccess: assignedTaskSuccess,
      isLoading: editAssignLoading,
      isError: editAssignError,
    },
  ] = useAssignTaskMutation();

  useEffect(() => {
    if (assignedTaskSuccess) {
      setBtnDisabled(false);
      setEditAssignTaskCanva(false);
      setFormData({ taskCategory: "", video_url: "", date: null });
      detailRefetch();
    }
    if (editAssignLoading) setBtnDisabled(true);
    if (editAssignError) setBtnDisabled(false);
  }, [assignedTaskSuccess, editAssignLoading, editAssignError]);



  useEffect(() => {
    if (rowEditData !== null) {
      // Parse UTC date from backend
      const parsedDate = rowEditData?.date ? parseUTCDateString(rowEditData.date) : null;
      setFormData({
        taskCategory: rowEditData?.category_name || "",
        video_url: rowEditData?.video_url || "",
        date: parsedDate || "",
        actorId: rowEditData?.actorId || "",
        actorType: rowEditData?.actorType || "",
      });
    }
  }, [rowEditData, editAssignTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      video_url: name === "taskCategory" ? "" : prev.video_url,
      id: "",
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
    if (!formData.taskCategory) newErrors.taskCategory = "Category is required.";
    if (!formData.video_url) newErrors.video_url = "Video is required.";
    if (!formData.date) newErrors.date = "Date is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateFields()) {
      setTimeout(() => setErrors({}), 3000);
      return;
    }

    // Send date & time in UTC so backend stores correct moment (same as assign task)
    const utcDateString = convertLocalDateToUTC(formData.date, true);
    if (!utcDateString) {
      setErrors({ date: "Invalid date selected." });
      return;
    }

    const payload = {
      assignedTask: {
        task_id: rowEditData?._id,
        actorId: actorId,
        actorType: actorType,
        update: {
          date: utcDateString,
          category_name: formData?.taskCategory,
          video_url: formData?.video_url,

        },
      },
    };
    updateAssignedTask({ data: payload, id: patientId });
  };

  return (
    <div>
      <COffcanvas
        className="ps-3 pe-3 offcanvas_add_user_auto py-3"
        backdrop="static"
        placement="bottom"
        visible={editAssignTask}
        onClose={onClose}
        onHide={onClose}
      >
        <COffcanvasHeader>
          <COffcanvasTitle className="pt-4">
            Edit Assign Task
          </COffcanvasTitle>
          <CCloseButton
            className="text-reset modal-close-cross"
            onClick={() => {
              setEditAssignTaskCanva(false);
              setFormData({});
            }}
          />
        </COffcanvasHeader>
        <COffcanvasBody>
          <form>
            <div className="row align-items-end">
              {/* Date */}
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
                      // Store date with time (current time) - same as assign task
                      const now = new Date();
                      const dateWithCurrentTime = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        now.getHours(),
                        now.getMinutes(),
                        now.getSeconds()
                      );
                      setFormData((prev) => ({ ...prev, date: dateWithCurrentTime }));
                      setErrors((prev) => ({ ...prev, date: "" }));
                    } else {
                      setFormData((prev) => ({ ...prev, date: null }));
                    }
                  }}
                  isClearable
                />
                <div style={{ height: "18px" }}>
                  {errors.date && (
                    <small className="text-danger">{errors.date}</small>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="col">
                <label className="rv-label-newpractice py-2">Category *</label>
                <select
                  name="taskCategory"
                  className={`form-select form-control-input ${errors.taskCategory ? "is-invalid" : ""
                    }`}
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
                  {errors.taskCategory && (
                    <small className="text-danger">
                      {errors.taskCategory}
                    </small>
                  )}
                </div>
              </div>

              {/* Video */}
              <div className="col">
                <label className="rv-label-newpractice py-2">Video *</label>
                <select
                  name="video_url"
                  className={`form-select form-control-input ${errors.video_url ? "is-invalid" : ""
                    }`}
                  value={formData.video_url}
                  onChange={handleVideoChange}
                  disabled={!formData.taskCategory}
                >
                  <option value="">Select Video</option>
                  {videosArray.map((video) => (
                    <option key={video._id} value={video.video_url}>
                      {video.title}
                    </option>
                  ))}
                </select>
                <div style={{ height: "18px" }}>
                  {errors.video_url && (
                    <small className="text-danger">{errors.video_url}</small>
                  )}
                </div>
              </div>
            </div>


            <div className="row pt-4">
              <div className="col-md-12 text-end">
                <button
                  type="button"
                  className="rv-reset-cancel mt-4"
                  onClick={() => {
                    setEditAssignTaskCanva(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={btnDisabled}
                  onClick={handleSubmit}
                  className="btn add-practs-btn fw-bold mx-2"
                >
                  Assign
                </button>
              </div>
            </div>
          </form>
        </COffcanvasBody>
      </COffcanvas>
    </div>
  );
};

export default AssignedTaskEditCanva;
