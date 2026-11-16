import { CCloseButton, COffcanvasHeader, COffcanvasTitle } from "@coreui/react";
import { Checkbox, Button } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { default as React, useEffect, useState } from "react";
import TextAreaAutosize from "../../../../Components/TextAreaAutosize";
import { validateRequired, validateArrayNotEmpty } from "../../../../utils/inputValidation";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { useSelector } from "react-redux";

const LearnSection = ({
  learnFormData,
  addLearn,
  setLearnFormData,
  id,
  setCreateCanva,
  learnSuccess,
  learnLoading,
  bodyPartList,
  categoryVideoList,
  errors,
  setErrors,
}) => {
  const [btnDisable, setBtnDisable] = useState(false);
  const actorType = useSelector((state) => state?.user?.userType);
  useEffect(() => {
    setBtnDisable(learnLoading);
  }, [learnLoading]);

  useEffect(() => {
    if (learnSuccess) {
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
        learnThumbnail: "",
        thumbnailPreview: null,
      });
    }
    setCreateCanva(false);
  }, [learnSuccess]);

  const learnHandleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    const updatedFormData = { ...learnFormData, [name]: newValue };
    setLearnFormData(updatedFormData);

    // Clear the error for this field if it's being changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    const videoFields = ["videoTitle", "videoURL", "description"];
    const isVideoEnabled = name === "addVideo" ? newValue : updatedFormData.addVideo;
    const isFooterEnabled = name === "addFooter" ? newValue : updatedFormData.addFooter;

    const newErrors = {};

    // Only validate title if it's the field being changed or if there's already an error
    if (name === "title" || errors.title) {
      const titleError = validateRequired(updatedFormData.title);
      if (titleError) newErrors.title = titleError;
    }

    // Only validate body_part if it's the field being changed or if there's already an error
    if (name === "body_part" || errors.body_part) {
      const bodyPartError = validateArrayNotEmpty(updatedFormData.body_part);
      if (bodyPartError) newErrors.body_part = bodyPartError;
    }

    if (isVideoEnabled && videoFields.includes(name)) {
      const error = validateRequired(newValue);
      newErrors[name] = error;
    }

    // Validate footer fields when footer is enabled
    if (isFooterEnabled) {
      if (name === "footerText" || errors.footerText) {
        const footerTextError = validateRequired(updatedFormData.footerText);
        if (footerTextError) newErrors.footerText = footerTextError;
      }

      if (name === "ctaLabelText" || errors.ctaLabelText) {
        const ctaLabelError = validateRequired(updatedFormData.ctaLabelText);
        if (ctaLabelError) newErrors.ctaLabelText = ctaLabelError;
      }
    }

    if (name === "addFooter") {
      if (!newValue) {
        // Clear footer-related errors when footer is disabled
        newErrors.ctaLabelText = "";
        newErrors.footerText = "";
      } else {
        // When enabling footer, validate the fields immediately
        newErrors.footerText = validateRequired(updatedFormData.footerText);
        newErrors.ctaLabelText = validateRequired(updatedFormData.ctaLabelText);
      }
    }

    if (name === "addVideo" && !newValue) {
      newErrors.videoURL = "";
      newErrors.description = "";
      newErrors.requiredField = "";
      newErrors.learnThumbnail = "";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
  };

  const handleLearnSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    // ❗ Must select addVideo checkbox
    if (!learnFormData.addVideo) {
      setErrors({ requiredField: "Please check 'Add a Video' before submitting." });
      setTimeout(() => {
        setErrors({ requiredField: "" });
      }, 3000);
      return;
    }

    // Validate main fields
    const titleError = validateRequired(learnFormData.title);
    if (titleError) newErrors.title = titleError;

    // Validate footer fields if footer is enabled
    if (learnFormData.addFooter) {
      const footerTextError = validateRequired(learnFormData.footerText);
      if (footerTextError) newErrors.footerText = footerTextError;

      const ctaLabelError = validateRequired(learnFormData.ctaLabelText);
      if (ctaLabelError) newErrors.ctaLabelText = ctaLabelError;
    }

    // Only validate body_part if array length is 0 or 1
    const bodyPartError = learnFormData.body_part.length <= 1 ? validateArrayNotEmpty(learnFormData.body_part) : "";
    if (bodyPartError) newErrors.body_part = bodyPartError;

    // Validate video fields
    const videoTitleError = validateRequired(learnFormData.videoTitle);
    if (videoTitleError) newErrors.videoTitle = videoTitleError;

    const videoURLError = validateRequired(learnFormData.videoURL);
    if (videoURLError) newErrors.videoURL = videoURLError;

    const descriptionError = validateRequired(learnFormData.description);
    if (descriptionError) newErrors.description = descriptionError;

    const thumbnailError = validateRequired(learnFormData.learnThumbnail);
    if (thumbnailError) newErrors.learnThumbnail = thumbnailError;

    // If any errors, show them
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    // const payload = {
    //   user_id: id,
    //   title: learnFormData.title,
    //   sub_title: learnFormData.subtitle,
    //   body_text: learnFormData.bodyText,
    //   body_part: learnFormData.body_part,
    //   sub_page: learnFormData.subPage,
    //   add_footer: learnFormData.addFooter,
    //   footer_text: learnFormData.addFooter ? learnFormData.footerText : "",
    //   cta_label: learnFormData.addFooter ? learnFormData.ctaLabelText : "",
    //   add_video: learnFormData.addVideo,
    //   video_title: learnFormData.videoTitle,
    //   description: learnFormData.description,
    //   video_url: learnFormData.videoURL,
    //   thumbnail: learnFormData.learnThumbnail,
    // };

    const formData = new FormData();
    formData.append('user_id', id);
    formData.append('actorType', actorType);
    formData.append('title', learnFormData.title);
    formData.append('sub_title', learnFormData.subtitle);
    formData.append('body_text', learnFormData.bodyText);
    (learnFormData.body_part || []).forEach((bp) =>
      formData.append("body_part[]", bp)
    );
    formData.append('add_footer', learnFormData.addFooter);
    formData.append('add_video', learnFormData.addVideo);

    if (learnFormData.addFooter) {
      formData.append('footer_text', learnFormData.footerText);
      formData.append('cta_label', learnFormData.ctaLabelText);
    }

    if (learnFormData.addVideo) {
      formData.append('video_title', learnFormData.videoTitle);
      formData.append('description', learnFormData.description);
      formData.append('video_url', learnFormData.videoURL);
      // Append the thumbnail file
      if (learnFormData.learnThumbnail) {
        formData.append('thumbnail', learnFormData.learnThumbnail);
      }
    }

    addLearn(formData);
  };

  const oncloseFunc = () => {
    setErrors({});
    setCreateCanva(false);
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
      learnThumbnail: "",
      thumbnailPreview: null,
    });
  };

  return (
    <>
      <COffcanvasHeader className="static-header">
        <COffcanvasTitle>
          Add Learn
          <span className="ms-2">
            {errors?.requiredField && (
              <span className="mt-4 ml-5 text-center rg-err" style={{ fontSize: 14 }}>
                {errors.requiredField}
              </span>
            )}
          </span>
        </COffcanvasTitle>
        <CCloseButton className="text-reset modal-close-cross" onClick={() => setCreateCanva(false)} />
      </COffcanvasHeader>

      <form className="mt-4 ps-3">
        {/* Title + SubTitle */}
        <div className="row content-container">
          <div className="col">
            <label className="rv-label-newpractice py-2">Title *</label>
            <input
              type="text"
              className="form-control form-control-input"
              name="title"
              value={learnFormData.title}
              onChange={learnHandleChange}
            />
            {errors?.title && <div className="text-danger mt-1">{errors.title}</div>}
          </div>
          <div className="col">
            <label className="rv-label-newpractice py-2">Sub-Title <span className="any">(if any)</span></label>
            <input
              type="text"
              className="form-control form-control-input"
              name="subtitle"
              value={learnFormData.subtitle}
              onChange={learnHandleChange}
            />
          </div>
        </div>

        {/* Body Text */}
        <div className="row pt-3">
          <div className="col-md-12">
            <label className="rv-label-newpractice py-2">Body Text</label>
            <TextAreaAutosize
              className="form-control px-3 py-2 shadow-none"
              style={{ border: "1px solid #DEE2E6" }}
              minRows={3}
              name="bodyText"
              value={learnFormData.bodyText}
              onChange={learnHandleChange}
            />
          </div>
        </div>

        {/* Body Part */}
        <div className="row pt-5">
          <div className="col-md-6">
            <label className="rv-label-newpractice py-2">Body Part *</label>
            <Autocomplete
              multiple
              options={bodyPartList}
              disableCloseOnSelect
              getOptionLabel={(option) => option}
              value={learnFormData.body_part}
              onChange={(e, newValue) => {
                const syntheticEvent = {
                  target: {
                    name: "body_part",
                    value: newValue,
                  },
                };
                learnHandleChange(syntheticEvent);
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    checked={selected}
                  />
                  {option}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select"
                  error={!!errors.body_part}
                />
              )}
            />
            {errors?.body_part && <div className="text-danger mt-1">{errors.body_part}</div>}
          </div>
        </div>

        {/* Footer Section */}
        <div className="card-wrapper me-3 mt-5">
          <div className="row">
            <div className="col">
              <Checkbox
                name="addFooter"
                checked={learnFormData.addFooter}
                onChange={learnHandleChange}
                sx={{ color: "#04470C" }}
              />
              <strong>Add a Footer</strong>
            </div>
            {learnFormData.addFooter && (
              <div className="row pt-2">
                <div className="col">
                  <label className="rv-label-newpractice py-2">Footer Text</label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    name="footerText"
                    value={learnFormData.footerText}
                    onChange={learnHandleChange}
                  />
                  {errors?.footerText && <div className="text-danger mt-1">{errors.footerText}</div>}
                </div>
                <div className="col">
                  <label className="rv-label-newpractice py-2">CTA Label Text</label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    name="ctaLabelText"
                    value={learnFormData.ctaLabelText}
                    onChange={learnHandleChange}
                  />
                  {errors?.ctaLabelText && <div className="text-danger mt-1">{errors.ctaLabelText}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Section */}
        <div className="card-wrapper mt-5">
          <div className="row">
            <div className="col">
              <Checkbox
                name="addVideo"
                checked={learnFormData.addVideo}
                onChange={learnHandleChange}
                sx={{ color: "#04470C" }}
              />
              <strong>Add a Video</strong>
            </div>
            {learnFormData.addVideo && (
              <>
                <div className="row pt-2">
                  <div className="col">
                    <label className="rv-label-newpractice py-2">Video Title *</label>
                    <input
                      type="text"
                      className="form-control form-control-input"
                      name="videoTitle"
                      value={learnFormData.videoTitle}
                      onChange={learnHandleChange}
                    />
                    {errors?.videoTitle && <div className="text-danger mt-1">{errors.videoTitle}</div>}
                  </div>
                </div>
                <div className="row pt-2">
                  <div className="col">
                    <label className="rv-label-newpractice py-2">Video URL *</label>
                    <select
                      className="form-select form-control-input"
                      name="videoURL"
                      value={learnFormData.videoURL}
                      onChange={learnHandleChange}
                    >
                      <option value="">Select</option>
                      {categoryVideoList.map((option, index) => (
                        <option key={index} value={option.video_url}>
                          {option.video_url}
                        </option>
                      ))}
                    </select>
                    {errors?.videoURL && <div className="text-danger mt-1">{errors.videoURL}</div>}
                  </div>
                  <div className="col">
                    <label className="rv-label-newpractice py-2">Description *</label>
                    <input
                      type="text"
                      className="form-control form-control-input"
                      name="description"
                      value={learnFormData.description}
                      onChange={learnHandleChange}
                    />
                    {errors?.description && <div className="text-danger mt-1">{errors.description}</div>}
                  </div>
                </div>
                {/* Thumbnail Section */}
                <div className="row pt-4">
                  <div className="col-md-6 mb-3">
                    <label>Thumbnail *</label>
                    <div className="d-flex align-items-center gap-3 mt-2">
                      <Button
                        variant="outlined"
                        component="label"
                        sx={{ textTransform: "none" }}
                      >
                        {learnFormData?.learnThumbnail?.name || "Choose File"}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setLearnFormData((prev) => ({
                                ...prev,
                                learnThumbnail: file,
                                thumbnailPreview: URL.createObjectURL(file),
                              }));
                              const error = validateRequired(file);
                              setErrors((prev) => ({
                                ...prev,
                                learnThumbnail: error,
                              }));
                            }
                          }}
                        />
                      </Button>
                      {learnFormData.learnThumbnail && (
                        <img
                          height={100}
                          src={
                            learnFormData.thumbnailPreview ||
                            (typeof learnFormData.learnThumbnail === "string"
                              ? learnFormData.learnThumbnail
                              : "")
                          }
                          alt="Thumbnail preview"
                        />
                      )}
                    </div>
                    {errors?.learnThumbnail && (
                      <div className="text-danger mt-2">{errors?.learnThumbnail}</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="col-md-12 pt-2 text-end">
          <button className="rv-reset-cancel mt-4" type="button" onClick={oncloseFunc}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn add-section-btn ms-2"
            onClick={handleLearnSubmit}
            disabled={btnDisable}
          >
            Add
          </button>
        </div>
      </form>
    </>
  );
};

export default LearnSection;