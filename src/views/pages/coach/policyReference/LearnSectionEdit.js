import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Button, Checkbox } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from 'react';
import TextAreaAutosize from '../../../../Components/TextAreaAutosize';
import { useUpdateLearnMutation } from '../../../../redux/apis/learn_api';
import { validateRequired, validateArrayNotEmpty } from "../../../../utils/inputValidation";
import { base_url } from "../../../../global/global";
import { useSelector } from "react-redux";

const   LearnSectionEdit = ({ selectedRow, setEditCanva, id, categoryVideoList, bodyPartList, errors, setErrors }) => {
  const [updateLearn, { isSuccess, isLoading }] = useUpdateLearnMutation();
  const [btnLearnDisable, setBtnLearnDisable] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const actorType = useSelector((state) => state?.user?.userType);
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
    addVideo: false,
    learnThumbnail: "",
  });

  useEffect(() => {
    setBtnLearnDisable(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (selectedRow) {
      setLearnFormData({
        title: selectedRow?.title || "",
        subtitle: selectedRow?.sub_title || "",
        bodyText: selectedRow?.body_text || "",
        body_part: selectedRow?.body_part || [],
        footerText: selectedRow?.footer_text || "",
        ctaLabelText: selectedRow?.cta_label || "",
        videoTitle: selectedRow?.video_title || "",
        description: selectedRow?.description || "",
        videoURL: selectedRow?.video_url || "",
        addFooter: selectedRow?.add_footer || false,
        addVideo: selectedRow?.add_video || false,
        learnThumbnail: selectedRow?.thumbnail || "",
      });
      setThumbnailPreview(selectedRow?.thumbnail ? base_url + selectedRow.thumbnail : null);
      setErrors({});
    } else {
      setLearnFormData({
        title: "",
        subtitle: "",
        bodyText: "",
        body_part: [],
        footerText: "",
        ctaLabelText: "",
        videoTitle: "",
        description: "",
        videoURL: "",
        addFooter: false,
        addVideo: false,
        learnThumbnail: "",
      });
      setThumbnailPreview(null);
      setErrors({});
    }
  }, [selectedRow]);

  useEffect(() => {
    if (isSuccess) {
      setEditCanva(false);
    }
  }, [isSuccess]);

  const learnHandleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    const updatedFormData = { ...learnFormData, [name]: newValue };
    setLearnFormData(updatedFormData);

    // Clear the error for this field if it's being changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    const alwaysRequiredFields = ["title"];
    const videoFields = ["videoTitle", "videoURL", "description"];
    const isVideoEnabled = name === "addVideo" ? newValue : updatedFormData.addVideo;
    const isFooterEnabled = name === "addFooter" ? newValue : updatedFormData.addFooter;

    const newErrors = {};

    if (alwaysRequiredFields.includes(name)) {
      const error = validateRequired(newValue);
      if (error) newErrors[name] = error;
    }

    if (name === "body_part") {
      // Only validate body_part if array length is 0 or 1
      const error = value.length <= 1 ? validateArrayNotEmpty(value) : "";
      newErrors.body_part = error;
    }

    if (isVideoEnabled && videoFields.includes(name)) {
      const error = validateRequired(newValue);
      if (error) newErrors[name] = error;
    }

    if (name === "addVideo" && !newValue) {
      newErrors.videoURL = "";
      newErrors.description = "";
      newErrors.requiredField = "";
      newErrors.learnThumbnail = "";
    }

    // Footer validation logic
    if (isFooterEnabled) {
      // Clear errors when fields have values
      if (name === "footerText" && value.trim() !== "") {
        newErrors.footerText = "";
      }
      if (name === "ctaLabelText" && value.trim() !== "") {
        newErrors.ctaLabelText = "";
      }

      // Validate only if the field is being changed or has an existing error
      if ((name === "footerText" || errors.footerText) && updatedFormData.footerText.trim() === "") {
        newErrors.footerText = "Footer Text is required";
      }
      if ((name === "ctaLabelText" || errors.ctaLabelText) && updatedFormData.ctaLabelText.trim() === "") {
        newErrors.ctaLabelText = "CTA Label Text is required";
      }
    }

    if (name === "addFooter") {
      if (!newValue) {
        // Clear footer-related errors when footer is disabled
        newErrors.ctaLabelText = "";
        newErrors.footerText = "";
      } else {
        // When enabling footer, validate the fields immediately
        if (updatedFormData.footerText.trim() === "") {
          newErrors.footerText = "Footer Text is required";
        }
        if (updatedFormData.ctaLabelText.trim() === "") {
          newErrors.ctaLabelText = "CTA Label Text is required";
        }
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLearnFormData(prev => ({
        ...prev,
        learnThumbnail: file
      }));

      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);

      // Clean up previous object URL if it was from a file upload
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }

      setErrors(prev => ({
        ...prev,
        learnThumbnail: validateRequired(file)
      }));
    }
  };

  const handleLearnSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // ❗ Block submission if addVideo is not true
    if (!learnFormData.addVideo) {
      setErrors({ requiredField: "Please check 'Add a Video' before submitting." });
      setTimeout(() => {
        setErrors({ requiredField: "" });
      }, 3000);
      return;
    }

    // Validate required fields
    const titleError = validateRequired(learnFormData.title);
    if (titleError) newErrors.title = titleError;

    // Only validate body_part if array length is 0 or 1
    const bodyPartError = learnFormData.body_part.length <= 1 ? validateArrayNotEmpty(learnFormData.body_part) : "";
    if (bodyPartError) newErrors.body_part = bodyPartError;

    // Validate footer fields if footer is enabled
    if (learnFormData.addFooter) {
      if (learnFormData.footerText.trim() === "") {
        newErrors.footerText = "Footer Text is required";
      }
      if (learnFormData.ctaLabelText.trim() === "") {
        newErrors.ctaLabelText = "CTA Label Text is required";
      }
    }
    // Validate video fields
    const videoTitleError = validateRequired(learnFormData.videoTitle);
    if (videoTitleError) newErrors.videoTitle = videoTitleError;

    const videoURLError = validateRequired(learnFormData.videoURL);
    if (videoURLError) newErrors.videoURL = videoURLError;

    const descriptionError = validateRequired(learnFormData.description);
    if (descriptionError) newErrors.description = descriptionError;

    // Validate thumbnail if it's a new file (not the existing URL)
    if (learnFormData.addVideo && typeof learnFormData.learnThumbnail !== 'string') {
      const thumbnailError = validateRequired(learnFormData.learnThumbnail);
      if (thumbnailError) newErrors.learnThumbnail = thumbnailError;
    }

    // Stop on error
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    // Create FormData for file upload
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

      // Append file if it's a new file, otherwise append the URL
      if (learnFormData.learnThumbnail instanceof File) {
        formData.append('thumbnail', learnFormData.learnThumbnail);
      } else {
        formData.append('thumbnail', learnFormData.learnThumbnail);
      }
    }

    updateLearn({
      data: formData,
      id: selectedRow?._id,
      status: "Edit"
    });
  };

  const onCancel = () => {
    setErrors({});
    setEditCanva(false);
    if (selectedRow) {
      setLearnFormData({
        title: selectedRow.title,
        subtitle: selectedRow.sub_title,
        bodyText: selectedRow.body_text,
        body_part: selectedRow.body_part,
        footerText: selectedRow.footer_text,
        ctaLabelText: selectedRow.cta_label,
        videoTitle: selectedRow.video_title,
        description: selectedRow.description,
        videoURL: selectedRow.video_url,
        addFooter: selectedRow.add_footer,
        addVideo: selectedRow.add_video,
        learnThumbnail: selectedRow.thumbnail,
      });
      setThumbnailPreview(selectedRow.thumbnail ? base_url + selectedRow.thumbnail : null);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
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

      <div className="row pt-3">
        <div className="col-md-12">
          <label className="rv-label-newpractice py-2">Body Text</label>
          <TextAreaAutosize
            className="form-control px-3 py-2 shadow-none"
            style={{ border: '1px solid #DEE2E6' }}
            aria-label="minimum height"
            minRows={3}
            name="bodyText"
            value={learnFormData.bodyText}
            onChange={learnHandleChange}
          />
        </div>
      </div>

      <div className="row pt-3">
        <div className="col-md-6">
          <label className="rv-label-newpractice py-2">Body Part *</label>
          <Autocomplete
            multiple
            options={bodyPartList}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            value={learnFormData.body_part || []}
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
                <div className="row pt-4">
                  <div className="col-md-6 mb-3">
                    <label>Thumbnail *</label>
                    <div className="d-flex align-items-center gap-3 mt-2">
                      <Button
                        variant="outlined"
                        component="label"
                        sx={{ textTransform: "none" }}
                      >
                        {learnFormData.learnThumbnail instanceof File
                          ? learnFormData.learnThumbnail.name
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
                          src={thumbnailPreview.startsWith('blob:')
                            ? thumbnailPreview
                            : thumbnailPreview}
                          alt="Thumbnail preview"
                          height={100}
                          style={{ maxWidth: '100px', objectFit: 'contain' }}
                        />
                      )}
                    </div>
                    {errors?.learnThumbnail && (
                      <div className="text-danger mt-2">{errors?.learnThumbnail}</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* General requiredField error */}
      {errors?.requiredField && (
        <div className="text-danger mt-3 text-start">{errors.requiredField}</div>
      )}

      {/* Buttons */}
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
          disabled={btnLearnDisable}
          onClick={handleLearnSubmit}
        >
          Update
        </button>
      </div>
    </form>
  );
};

export default LearnSectionEdit;