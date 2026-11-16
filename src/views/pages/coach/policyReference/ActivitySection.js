import { CCloseButton, COffcanvasHeader, COffcanvasTitle } from "@coreui/react";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  validateArrayNotEmpty,
  validateRequired,
} from "../../../../utils/inputValidation";

const ActivitySection = ({
  setCreateCanva,
  activityFormData,
  setActivityFormData,
  addActivity,
  id,
  addActivitySuccess,
  addActivityLoading,
  bodyPartList,
  categoryVideoList,
  errors,
  setErrors,
  userType
}) => {
  const [btnDisable, setBtnDisable] = useState(false);

  useEffect(() => {
    setBtnDisable(addActivityLoading);
  }, [addActivityLoading]);

  useEffect(() => {
    if (addActivitySuccess) {
      setActivityFormData({
        title: "",
        body_part: [],
        videoURL: "",
        description: "",
        additionalText: "",
        quotedText: "",
        quickTip: "",
        thumbnail: "",
        thumbnailPreview: null
      });
      setCreateCanva(false);
    }
  }, [addActivitySuccess]);

  const activityHandleChange = (e) => {
    const { name, value } = e.target;

    setActivityFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    let error = "";
    if (name === "body_part") {
      error = validateArrayNotEmpty(value);
    } else if (["title", "videoURL", "description", "thumbnail"].includes(name)) {
      error = validateRequired(value);
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setActivityFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
      
      setErrors(prev => ({
        ...prev,
        thumbnail: validateRequired(file)
      }));
    }
  };

  const handleActivitySubmit = (e) => {
    e.preventDefault();


    
    const updatedErrors = {
      title: validateRequired(activityFormData.title),
      videoURL: validateRequired(activityFormData.videoURL),
      body_part: validateArrayNotEmpty(activityFormData.body_part),
      description: validateRequired(activityFormData.description),
      thumbnail: validateRequired(activityFormData.thumbnail)
    };

    setErrors(updatedErrors);

    if (Object.values(updatedErrors).some(error => error)) {
      return;
    }

    const formDataPayload = new FormData();
    formDataPayload.append("user_id", id);
    formDataPayload.append("actorType", userType);
    formDataPayload.append("title", activityFormData.title);
    formDataPayload.append("description", activityFormData.description);
    formDataPayload.append("video_url", activityFormData.videoURL);
    
    // Handle both file and string thumbnail
    if (activityFormData.thumbnail instanceof File) {
      formDataPayload.append("thumbnail", activityFormData.thumbnail);
    } else {
      formDataPayload.append("thumbnail", activityFormData.thumbnail);
    }
    
    activityFormData.body_part.forEach(bp => 
      formDataPayload.append("body_part[]", bp)
    );
    formDataPayload.append("additional_body_text", activityFormData.additionalText);
    formDataPayload.append("quoted_text", activityFormData.quotedText);
    formDataPayload.append("quick_tip", activityFormData.quickTip);

    addActivity(formDataPayload);
  };

  const oncloseFunc = () => {
    setErrors({});
    setCreateCanva(false);
    setActivityFormData({
      title: "",
      body_part: [],
      videoURL: "",
      description: "",
      additionalText: "",
      quotedText: "",
      quickTip: "",
      thumbnail: "",
      thumbnailPreview: null
    });
  };

  return (
    <>
      <COffcanvasHeader className="static-header">
        <COffcanvasTitle>
          Add Move
          {errors?.requiredField && (
            <span className="ms-2 mt-4 text-danger" style={{ fontSize: 14 }}>
              {errors?.requiredField}
            </span>
          )}
        </COffcanvasTitle>
        <CCloseButton
          className="text-reset modal-close-cross"
          onClick={oncloseFunc}
        />
      </COffcanvasHeader>
      
      <div className="mt-4 ps-3 p-3">
        <div className="row content-container">
          <div className="col-md-6">
            <label className="rv-label-newpractice py-2">Title *</label>
            <input
              type="text"
              className="form-control form-control-input"
              name="title"
              value={activityFormData.title}
              onChange={activityHandleChange}
            />
            {errors?.title && (
              <div className="text-danger mt-3">{errors.title}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="rv-label-newpractice py-2">Body Part *</label>
            <Autocomplete
              multiple
              options={bodyPartList}
              disableCloseOnSelect
              getOptionLabel={(option) => option}
              value={activityFormData.body_part}
              onChange={(e, newValue) => {
                activityHandleChange({
                  target: {
                    name: "body_part",
                    value: newValue
                  }
                });
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select"
                  error={!!errors?.body_part}
                />
              )}
            />
            {errors?.body_part && (
              <div className="text-danger mt-3">{errors.body_part}</div>
            )}
          </div>
        </div>

        <div className="row pt-5">
          <div className="col-md-6">
            <label className="rv-label-newpractice py-2">Video URL *</label>
            <select
              className="form-select form-control-input"
              name="videoURL"
              value={activityFormData.videoURL}
              onChange={activityHandleChange}
            >
              <option value="">Select</option>
              {categoryVideoList.map((option, index) => (
                <option key={index} value={option.video_url}>
                  {option.title}
                </option>
              ))}
            </select>
            {errors?.videoURL && (
              <div className="text-danger mt-3">{errors.videoURL}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="rv-label-newpractice py-2">Description *</label>
            <input
              type="text"
              className="form-control form-control-input"
              name="description"
              value={activityFormData.description}
              onChange={activityHandleChange}
            />
            {errors?.description && (
              <div className="text-danger mt-3">{errors.description}</div>
            )}
          </div>
        </div>

        {/* Thumbnail Section - Added similar to ChillSection */}
        <div className="row pt-5">
          <div className="col-md-6">
            <label className="rv-label-newpractice py-2">Thumbnail *</label>
            <div className="d-flex align-items-center gap-3 mt-2">
              <Button
                variant="outlined"
                component="label"
                sx={{ textTransform: "none" }}
              >
                {activityFormData.thumbnail instanceof File 
                  ? activityFormData.thumbnail.name 
                  : "Choose File"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              
              {activityFormData.thumbnailPreview && (
                <img 
                  src={activityFormData.thumbnailPreview} 
                  alt="Thumbnail preview" 
                  height={100}
                  style={{ maxWidth: '100px', objectFit: 'contain' }}
                />
              )}
            </div>
            {errors?.thumbnail && (
              <div className="text-danger mt-3">{errors.thumbnail}</div>
            )}
          </div>
        </div>

        <div className="row pt-5">
          <div className="col">
            <label className="rv-label-newpractice py-2">
              Additional Body Text{" "}
              <span className="any">Step guide on how to perform activity</span>
            </label>
            <input
              type="text"
              className="form-control form-control-chill"
              name="additionalText"
              value={activityFormData.additionalText}
              onChange={activityHandleChange}
            />
          </div>
        </div>

        <div className="row pt-5">
          <div className="col">
            <label className="rv-label-newpractice py-2">
              Quoted Text <span className="any">(if any)</span>
            </label>
            <input
              type="text"
              className="form-control form-control-chill"
              name="quotedText"
              value={activityFormData.quotedText}
              onChange={activityHandleChange}
            />
          </div>
        </div>

        <div className="row pt-5">
          <div className="col">
            <label className="rv-label-newpractice py-2">
              Quick Tip <span className="any">(if any)</span>
            </label>
            <input
              type="text"
              className="form-control form-control-chill"
              name="quickTip"
              value={activityFormData.quickTip}
              onChange={activityHandleChange}
            />
          </div>
        </div>

        <div className="col-md-12 pt-2 text-end">
          <button
            type="button"
            className="rv-reset-cancel mt-4"
            onClick={oncloseFunc}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn add-section-btn ms-2"
            onClick={handleActivitySubmit}
            disabled={
              errors?.title ||
              errors?.videoURL ||
              errors?.body_part ||
              errors?.description ||
              errors?.thumbnail ||
              btnDisable
            }
          >
            Add
          </button>
        </div>
      </div>
    </>
  );
};

export default ActivitySection;