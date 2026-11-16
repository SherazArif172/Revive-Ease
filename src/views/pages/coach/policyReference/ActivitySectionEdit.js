import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { default as React, useEffect, useState } from "react";
import { useUpdateActivityMutation } from "../../../../redux/apis/activity_api";
import {
  validateArrayNotEmpty,
  validateRequired,
} from "../../../../utils/inputValidation";
import { base_url } from "../../../../global/global";
import { useGetCategoryVideoQuery } from "../../../../redux/apis/chill_api";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";

const ActivitySectionEdit = ({
  selectedRow,
  setEditCanva,
  id,
  categoryVideoList,
  bodyPartList,
  errors,
  setErrors,
}) => {
  const [updateActivity, { isSuccess, isLoading }] =
    useUpdateActivityMutation();
  const [btnEditActivityDisable, setBtnActivityDisable] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const actorType = useSelector((state) => state?.user?.userType);
  const [activityFormData, setActivityFormData] = useState({
    title: "",
    body_part: [],
    videoURL: "",
    embeddedCode: "",
    description: "",
    additionalText: "",
    quotedText: "",
    quickTip: "",
  });
  // eslint-disable-next-line no-unused-vars
  const { data: videoList, isError } = useGetCategoryVideoQuery(
    activityFormData?.body_part
      ? { category: "Activity", body_part: activityFormData.body_part }
      : skipToken,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (isLoading) {
      setBtnActivityDisable(true);
    } else {
      setBtnActivityDisable(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (selectedRow) {
      setActivityFormData({
        title: selectedRow.title,
        body_part: selectedRow.body_part,
        videoURL: selectedRow.video_url,
        thumbnail: selectedRow.thumbnail,
        description: selectedRow.description,
        additionalText: selectedRow.additional_body_text,
        quotedText: selectedRow.quoted_text,
        quickTip: selectedRow.quick_tip,
      });
      setThumbnailPreview(
        selectedRow.thumbnail ? base_url + selectedRow.thumbnail : null
      );
      setErrors({});
    } else {
      setActivityFormData({
        title: "",
        body_part: [],
        videoURL: "",
        thumbnail: "",
        description: "",
        additionalText: "",
        quotedText: "",
        quickTip: "",
      });
      setErrors({});
    }
  }, [selectedRow]);

  useEffect(() => {
    if (isSuccess) {
      setEditCanva(false);
    }
  }, [isSuccess]);

  const activityHandleChange = (e) => {
    const { name, value } = e.target;
    setActivityFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    let error = "";
    if (name === "body_part") {
      error = validateArrayNotEmpty(value);
    } else if (
      ["title", "videoURL", "description", "thumbnail"].includes(name)
    ) {
      error = validateRequired(value);
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setActivityFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }));

      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);

      // Clean up previous object URL if it was from a file upload
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }

      setErrors((prev) => ({
        ...prev,
        thumbnail: validateRequired(file),
      }));
    }
  };

  const handleActivitySubmit = (e) => {
    e.preventDefault();
    const requiredFields = [
      "title",
      "videoURL",
      "body_part",
      "description",
      "thumbnail",
    ];
    let hasError = false;
    let tempErrors = {};

    requiredFields.forEach((field) => {
      const value = activityFormData[field];
      const error =
        field === "body_part"
          ? validateArrayNotEmpty(value)
          : validateRequired(value);
      if (error) {
        hasError = true;
        tempErrors[field] = error;
      }
    });

    if (hasError) {
      setErrors({
        ...errors,
        ...tempErrors,
        requiredField: "Please fill all mandatory fields.",
      });
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, requiredField: "" }));
      }, 2000);
      return;
    }

    const formDataPayload = new FormData();
    formDataPayload.append("user_id", id);
    formDataPayload.append("actorType", actorType);
    formDataPayload.append("title", activityFormData?.title);
    // Send body_part as repeated form fields to match create API shape
    (activityFormData?.body_part || []).forEach((bp) =>
      formDataPayload.append("body_part[]", bp)
    );
    formDataPayload.append("video_url", activityFormData?.videoURL);

    // Append file if it's a new file, otherwise append the URL
    if (activityFormData.thumbnail instanceof File) {
      formDataPayload.append("thumbnail", activityFormData.thumbnail);
    } else {
      formDataPayload.append("thumbnail", activityFormData.thumbnail);
    }

    formDataPayload.append("description", activityFormData?.description);
    formDataPayload.append(
      "additional_body_text",
      activityFormData?.additionalText
    );
    formDataPayload.append("quoted_text", activityFormData?.quotedText);
    formDataPayload.append("quick_tip", activityFormData?.quickTip);

    updateActivity({
      data: formDataPayload,
      id: selectedRow?._id,
      status: "Edit",
    });
  };

  const onCancel = () => {
    setErrors({});
    if (selectedRow) {
      setActivityFormData({
        title: selectedRow.title,
        body_part: selectedRow.body_part,
        videoURL: selectedRow.video_url,
        thumbnail: selectedRow.thumbnail,
        description: selectedRow.description,
        additionalText: selectedRow.additional_body_text,
        quotedText: selectedRow.quoted_text,
        quickTip: selectedRow.quick_tip,
      });
      setThumbnailPreview(
        selectedRow.thumbnail ? base_url + selectedRow.thumbnail : null
      );
    }
    setEditCanva(false);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  return (
    <form>
      <div className="row">
        <div className="col">
          <label className="rv-label-newpractice py-2">Title *</label>
          <input
            type="text"
            className="form-control form-control-input"
            name="title"
            value={activityFormData?.title}
            defaultValue={activityFormData?.title}
            onChange={activityHandleChange}
          />
          {errors?.title && (
            <div className="text-danger mt-3">{errors?.title}</div>
          )}
        </div>
        <div className="col">
          <label className="rv-label-newpractice py-2">Body Part *</label>
          <Autocomplete
            multiple
            options={bodyPartList}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            value={activityFormData?.body_part || []}
            onChange={(e, newValue) => {
              setActivityFormData((prev) => ({
                ...prev,
                body_part: newValue,
              }));
              const error =
                newValue.length === 0 ? validateArrayNotEmpty(newValue) : "";
              setErrors((prev) => ({
                ...prev,
                body_part: error,
              }));
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
            <div className="text-danger mt-3">{errors?.body_part}</div>
          )}
        </div>
      </div>
      <div className="row pt-5">
        <div className="col">
          <label className="rv-label-newpractice py-2">Video URL *</label>
          <select
            className="form-select form-control-input"
            name="videoURL"
            onChange={activityHandleChange}
            value={activityFormData?.videoURL}
          >
            <option value="">Select</option>
            {categoryVideoList.map((option, index) => (
              <option key={index} value={option.video_url}>
                {option.title} 
              </option>
            ))}
          </select>

          {errors?.videoURL && (
            <div className="text-danger mt-3">{errors?.videoURL}</div>
          )}
        </div>
        <div className="col">
          <label className="rv-label-newpractice py-2">Description *</label>
          <input
            type="text"
            className="form-control form-control-input"
            name="description"
            value={activityFormData?.description}
            defaultValue={activityFormData?.description}
            onChange={activityHandleChange}
          />
          {errors?.description && (
            <div className="text-danger mt-3">{errors?.description}</div>
          )}
        </div>
      </div>

      {/* Thumbnail Section */}
      <div className="row pt-5">
        <div className="col-md-6">
          <label className="rv-label-newpractice py-2">Thumbnail *</label>
          <div className="d-flex align-items-center gap-3 mt-2">
            <Button
              variant="outlined"
              component="label"
              sx={{ textTransform: "none" }}
            >
              {activityFormData?.thumbnail instanceof File
                ? activityFormData?.thumbnail.name
                : "Choose File"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Button>

            {thumbnailPreview && (
              <img
                src={
                  thumbnailPreview.startsWith("blob:")
                    ? thumbnailPreview
                    : thumbnailPreview
                }
                alt="Thumbnail preview"
                height={100}
                style={{ maxWidth: "100px", objectFit: "contain" }}
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
            <span className="any">Step guide on how to perform activitys</span>
          </label>
          <input
            type="text"
            className="form-control form-control-chill"
            name="additionalText"
            value={activityFormData?.additionalText}
            defaultValue={activityFormData?.additionalText}
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
            value={activityFormData?.quotedText}
            defaultValue={activityFormData?.quotedText}
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
            value={activityFormData?.quickTip}
            defaultValue={activityFormData?.quickTip}
            onChange={activityHandleChange}
          />
        </div>
      </div>
      <div className="col-md-12 pt-2 text-end">
        <button
          type="button"
          className="btn cncl-patient-btn"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn add-section-btn ms-2"
          onClick={handleActivitySubmit}
          disabled={
            errors?.title ||
            errors?.videoURL ||
            errors?.thumbnail ||
            errors?.body_part ||
            errors?.description ||
            btnEditActivityDisable === true
          }
        >
          Update
        </button>
      </div>
    </form>
  );
};

export default ActivitySectionEdit;
