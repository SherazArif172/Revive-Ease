import { CCloseButton, COffcanvasHeader, COffcanvasTitle } from "@coreui/react";
import React, { useEffect, useState } from "react";
import {
  validateRequired,
  validateArrayNotEmpty,
} from "../../../../utils/inputValidation";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { Button } from "@mui/material";

const ChillSection = ({
  formData,
  setFormData,
  setCreateCanva,
  addChill,
  id,
  chillSuccess,
  chillLoading,
  categoryVideoList,
  bodyPartList,
  errors,
  setErrors,
  userType
}) => {
  const [btnDisable, setBtnDisable] = useState(false);

  useEffect(() => {
    if (chillLoading) {
      setBtnDisable(true);
    } else {
      setBtnDisable(false);
    }
  }, [chillLoading]);

  useEffect(() => {
    if (chillSuccess) {
      setFormData({
        chillTitle: "",
        description: "",
        chillVideoUrl: "",
        chillThumbnail: "",
        body_part: [],
        thumbnailPreview: null,
      });
    }
    setCreateCanva(false);
  }, [chillSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateRequired(value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmitChill = (e) => {
    e.preventDefault();

    const bodyPartError = validateArrayNotEmpty(formData?.body_part || []);
    const chillTitleError = validateRequired(formData?.chillTitle);
    const chillThumbnailError = validateRequired(formData?.chillThumbnail);
    const chillVideoUrlError = validateRequired(formData?.chillVideoUrl);
    const descriptionError = validateRequired(formData?.description);

    setErrors({
      chillTitle: chillTitleError,
      chillThumbnail: chillThumbnailError,
      body_part: bodyPartError,
      chillVideoUrl: chillVideoUrlError,
      description: descriptionError,
    });

    if (
      chillTitleError ||
      chillThumbnailError ||
      bodyPartError ||
      chillVideoUrlError ||
      descriptionError
    ) {
      setErrors((prev) => ({
        ...prev,
        requiredField: "All required fields must be filled",
      }));
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, requiredField: "" }));
      }, 2000);
      return;
    }

    const formDataPayload = new FormData();
    formDataPayload.append("user_id", id);
    formDataPayload.append("title", formData.chillTitle);
    formDataPayload.append("description", formData.description);
    formDataPayload.append("video_url", formData.chillVideoUrl);
    formDataPayload.append("thumbnail", formData.chillThumbnail);
    formDataPayload.append("actorId", id);
    formDataPayload.append("actorType", userType);
    (formData.body_part || []).forEach((bp) =>
      formDataPayload.append("body_part[]", bp)
    );

    addChill(formDataPayload);
  };

  const oncloseFunc = () => {
    setErrors({});
    setCreateCanva(false);
    setFormData({
      chillTitle: "",
      description: "",
      chillVideoUrl: "",
      chillThumbnail: "",
      body_part: [],
    });
  };

  return (
    <>
      <COffcanvasHeader className="pt-2">
        <COffcanvasTitle>
          Add Relax
          <span className="ms-2">
            {errors?.requiredField && (
              <span
                className="mt-4 ml-5 text-center rg-err"
                style={{ fontSize: 14 }}
              >
                {errors?.requiredField}
              </span>
            )}
          </span>
        </COffcanvasTitle>
        <CCloseButton
          className="text-reset modal-close-cross"
          onClick={() => setCreateCanva(false)}
        />
      </COffcanvasHeader>

      <div className="p-3">
        {/* Title & Body Part */}
        <div className="row">
          <div className="col-md-6">
            <label className="rv-label-newpractice">Title *</label>
            <input
              type="text"
              className="form-control form-control-input"
              name="chillTitle"
              onChange={handleChange}
              value={formData?.chillTitle}
            />
            {errors?.chillTitle && (
              <div className="text-danger mt-3">{errors?.chillTitle}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="rv-label-newpractice">Body Part *</label>
            <Autocomplete
              multiple
              options={bodyPartList}
              disableCloseOnSelect
              getOptionLabel={(option) => option}
              value={formData.body_part || []}
              onChange={(e, newValue) => {
                setFormData((prev) => ({ ...prev, body_part: newValue }));
                const error = validateArrayNotEmpty(newValue);
                setErrors((prev) => ({ ...prev, body_part: error }));
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
                  in
                  error={!!errors?.body_part}
                />
              )}
            />
            {errors?.body_part && (
              <div className="text-danger mt-2">{errors?.body_part}</div>
            )}
          </div>
        </div>

        {/* Video URL & Description */}
        <div className="row pt-4">
          <div className="col-md-6">
            <label>Video URL *</label>
            <select
              className="form-select form-control-input"
              name="chillVideoUrl"
              onChange={handleChange}
              value={formData?.chillVideoUrl}
            >
              <option value="">Select</option>
              {categoryVideoList.map((option, index) => (
                <option key={index} value={option.video_url}>
                  {option.video_url}
                </option>
              ))}
            </select>
            {errors?.chillVideoUrl && (
              <div className="text-danger mt-2">{errors?.chillVideoUrl}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label>Description *</label>
            <input
              type="text"
              className="form-control form-control-input"
              name="description"
              onChange={handleChange}
              value={formData?.description}
            />
            {errors?.description && (
              <div className="text-danger mt-2">{errors?.description}</div>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        <div className="row pt-4">
          <div className="col-md-6 mb-3">
            <label>Thumbnail *</label>
            <div className="d-flex align-items-center gap-3 mt-2">
              <Button
                variant="outlined"
                component="label"
                sx={{ textTransform: "none" }}
              >
                {formData?.chillThumbnail?.name || "Choose File"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData((prev) => ({
                        ...prev,
                        chillThumbnail: file,
                        thumbnailPreview: URL.createObjectURL(file),
                      }));
                      const error = validateRequired(file);
                      setErrors((prev) => ({
                        ...prev,
                        chillThumbnail: error,
                      }));
                    }
                  }}
                />
              </Button>
              {formData.chillThumbnail && (
                <img
                  height={100}
                  src={
                    formData.thumbnailPreview ||
                    (typeof formData.chillThumbnail === "string"
                      ? formData.chillThumbnail
                      : "")
                  }
                  alt="Thumbnail preview"
                />
              )}
            </div>
            {errors?.chillThumbnail && (
              <div className="text-danger mt-2">{errors?.chillThumbnail}</div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="text-end ">
          <button
            className="rv-reset-cancel "
            type="button"
            onClick={() => {
              oncloseFunc();
            }}
          >
            Cancel
          </button>
          <button
            className="btn add-section-btn ms-2 "
            onClick={handleSubmitChill}
            disabled={
              errors?.chillTitle ||
              errors?.chillThumbnail ||
              errors?.body_part ||
              errors?.chillVideoUrl ||
              errors?.description ||
              btnDisable === true
            }
          >
            Add
          </button>
        </div>
      </div>
    </>
  );
};

export default ChillSection;
