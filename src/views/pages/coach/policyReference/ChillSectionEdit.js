import { Button } from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useUpdateChillMutation } from "../../../../redux/apis/chill_api";
import { validateArrayNotEmpty, validateRequired } from "../../../../utils/inputValidation";
import { base_url } from "../../../../global/global";
import { useSelector } from "react-redux";

const ChillSectionEdit = ({ 
  selectedRow, 
  id, 
  setEditCanva, 
  categoryVideoList, 
  bodyPartList, 
  errors, 
  setErrors 
}) => {
  const [btnDisableChill, setBtnDisableChill] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [updateChill, { isSuccess, isLoading }] = useUpdateChillMutation();
  const actorType = useSelector((state) => state?.user?.userType);
  const [formData, setFormData] = useState({
    chillTitle: "",
    body_part: [],
    chillVideoUrl: "",
    chillThumbnail: "",
    description: "",
  });

  useEffect(() => {
    setBtnDisableChill(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        chillTitle: selectedRow?.title || "",
        body_part: selectedRow?.body_part || [],
        chillVideoUrl: selectedRow?.video_url || "",
        chillThumbnail: selectedRow?.thumbnail || "",
        description: selectedRow?.description || "",
      });
      setThumbnailPreview(selectedRow?.thumbnail ? base_url + selectedRow.thumbnail : null);
      setErrors({});
    }
  }, [selectedRow]);

  useEffect(() => {
    if (isSuccess) {
      setEditCanva(false);
    }
  }, [isSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = ["chillTitle", "chillVideoUrl", "description"].includes(name) 
      ? validateRequired(value) 
      : "";
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        chillThumbnail: file
      }));
      
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      
      // Clean up previous object URL if it was from a file upload
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      
      setErrors(prev => ({
        ...prev,
        chillThumbnail: validateRequired(file)
      }));
    }
  };

  const handleSubmitChill = (e) => {
    e.preventDefault();

    const updatedErrors = {
      chillTitle: validateRequired(formData.chillTitle),
      chillThumbnail: validateRequired(formData.chillThumbnail),
      chillVideoUrl: validateRequired(formData.chillVideoUrl),
      description: validateRequired(formData.description),
      body_part: validateArrayNotEmpty(formData.body_part),
    };

    setErrors(updatedErrors);

    if (Object.values(updatedErrors).some(error => error)) {
      return;
    }

    const formDataPayload = new FormData();
    formDataPayload.append("user_id", id);
    formDataPayload.append("actorType", actorType);
    formDataPayload.append("title", formData.chillTitle);
    formDataPayload.append("description", formData.description);
    formDataPayload.append("video_url", formData.chillVideoUrl);
    
    // Append file if it's a new file, otherwise append the URL
    if (formData.chillThumbnail instanceof File) {
      formDataPayload.append("thumbnail", formData.chillThumbnail);
    } else {
      formDataPayload.append("thumbnail", formData.chillThumbnail);
    }
    
    formData.body_part.forEach(bp => formDataPayload.append("body_part[]", bp));

    updateChill({ 
      data: formDataPayload, 
      id: selectedRow?._id, 
      status: "Edit" 
    });
  };

  const onCancel = () => {
    setErrors({});
    setEditCanva(false);
    if (selectedRow) {
      setFormData({
        chillTitle: selectedRow.title,
        body_part: selectedRow.body_part,
        chillVideoUrl: selectedRow.video_url,
        chillThumbnail: selectedRow.thumbnail,
        description: selectedRow.description,
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
    <div>
      {/* Title & Body Part */}
      <div className="row">
        <div className="col">
          <label>Title *</label>
          <input
            type="text"
            className="form-control form-control-input"
            name="chillTitle"
            value={formData.chillTitle}
            onChange={handleChange}
          />
          {errors?.chillTitle && <div className="text-danger mt-3">{errors.chillTitle}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label>Body Part *</label>
          <Autocomplete
            multiple
            options={bodyPartList}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            value={formData.body_part}
            onChange={(e, newValue) => {
              setFormData(prev => ({ ...prev, body_part: newValue }));
              setErrors(prev => ({ ...prev, body_part: validateArrayNotEmpty(newValue) }));
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
          {errors?.body_part && <div className="text-danger mt-3">{errors.body_part}</div>}
        </div>
      </div>

      {/* Video URL & Description */}
      <div className="row pt-5">
        <div className="col">
          <label>Video URL *</label>
          <select
            className="form-select form-control-input"
            name="chillVideoUrl"
            value={formData.chillVideoUrl}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {categoryVideoList.map((option, index) => (
              <option key={index} value={option.video_url}>
                {option.video_url} ({option.video_duration})
              </option>
            ))}
          </select>
          {errors?.chillVideoUrl && <div className="text-danger mt-3">{errors.chillVideoUrl}</div>}
        </div>

        <div className="col">
          <label>Description *</label>
          <input
            type="text"
            className="form-control form-control-input"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          {errors?.description && <div className="text-danger mt-3">{errors.description}</div>}
        </div>
      </div>

      {/* Thumbnail */}
      <div className="row pt-5">
        <div className="col-md-6">
          <label>Thumbnail *</label>
          <div className="d-flex align-items-center gap-3 mt-2">
            <Button
              variant="outlined"
              component="label"
              sx={{ textTransform: "none" }}
            >
              {formData.chillThumbnail instanceof File 
                ? formData.chillThumbnail.name 
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
          {errors?.chillThumbnail && <div className="text-danger mt-3">{errors.chillThumbnail}</div>}
        </div>
      </div>

      {/* Buttons */}
      <div className="col-md-12 pt-2 text-end">
        <button
          className="btn cncl-patient-btn"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn add-section-btn ms-2"
          onClick={handleSubmitChill}
          disabled={
            Object.values(errors).some(error => error) ||
            btnDisableChill
          }
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default ChillSectionEdit;