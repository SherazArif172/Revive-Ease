import React from "react";
import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";

const diagnosisList = [
  "Chronic Fatigue Syndrome",
  "Complex Regional Pain Syndrome",
  "Elbow/Wrist Pain",
  "Fibromyalgia",
  "Generalized Pain",
  "Knee Pain",
  "Low Back Pain",
  "Neck Pain",
  "Osteoarthritis",
  "Pinched Nerve – Neck (Cervical Radiculopathy)",
  "Pinched Nerve – Low Back (Lumbar Radiculopathy)",
  "Post-op Hip Pain",
  "Post-op Knee Pain",
  "Post-op Shoulder Pain",
  "Post-op Spine Surgery Pain",
  "Rheumatoid Arthritis",
  "Shoulder Pain",
  "Spondylosis",
  "Other"
];


const TaskTemplateOffcanvas = ({
  isOpen,
  onClose,
  isEditMode,
  formData,
  formErrors,
  handleInputChange,
  handleSubmit,
  clearForm,
}) => {
  const title = isEditMode ? "Edit Template" : "Create Template";
  const submitButtonText = isEditMode ? "Update" : "Save";

  return (
    <COffcanvas
      className="ps-3 pe-3 offcanvas_add_user_auto"
      backdrop="static"
      placement="bottom"
      visible={isOpen}
      onHide={() => {
        onClose();
        clearForm();
      }}
    >
      <COffcanvasHeader>
        <COffcanvasTitle className="pt-4 offcanvas-title">
          {title}
        </COffcanvasTitle>
        <CCloseButton
          className="text-reset modal-close-cross"
          onClick={() => {
            clearForm();
            onClose();
          }}
        />
      </COffcanvasHeader>

      <COffcanvasBody>
        <div className="row">
          <div className="col-md-4">
            <label className="mb-2 fw-semibold">Template Name *</label>
            <input
              type="text"
              className="form-control form-control-input"
              placeholder="Enter Template Name"
              name="template_name"
              onChange={handleInputChange}
              value={formData?.template_name}
            />
            <div className="error-space">
              {formErrors?.template_name && (
                <p className="text-danger mt-2 mb-0">
                  {formErrors.template_name}
                </p>
              )}
            </div>
          </div>

          <div className="col-md-4">
            <label className="mb-2 fw-semibold">Diagnosis *</label>
            <select
              className="form-select form-control-input"
              name="diagnosis"
              onChange={handleInputChange}
              value={formData?.diagnosis}
              disabled={isEditMode}
            >
              {isEditMode ? null : (
                <option value="" disabled>
                  Select
                </option>
              )}
              {!diagnosisList.includes(formData?.diagnosis) && formData?.diagnosis ? (
                <option value={formData.diagnosis} disabled>
                  {formData.diagnosis}
                </option>
              ) : null}
              {diagnosisList.map((part) => (
                <option key={part} value={part}>
                  {part}
                </option>
              ))}
            </select>
            <div className="error-space">
              {formErrors?.diagnosis && !isEditMode && (
                <p className="text-danger mt-2 mb-0">{formErrors.diagnosis}</p>
              )}
            </div>
          </div>

          <div className="col-md-4">
            <label className="mb-2 fw-semibold">Pain Score Range *</label>
            <div className="d-flex gap-2">
              <select
                name="pain_score_min"
                className="form-select form-control-input"
                onChange={handleInputChange}
                value={formData?.pain_score_min}
              >
                {isEditMode ? null : (
                  <option value="" disabled>
                    Select
                  </option>
                )}
                {[...Array(11).keys()].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <span className="mt-2">To</span>
              <select
                name="pain_score_max"
                className="form-select form-control-input"
                onChange={handleInputChange}
                value={formData?.pain_score_max}
              >
                {isEditMode ? null : (
                  <option value="" disabled>
                    Select
                  </option>
                )}
                {[...Array(11).keys()].map((num) => (
                  <option
                    key={num}
                    value={num}
                    disabled={
                      formData?.pain_score_min !== "" &&
                      num < parseInt(formData?.pain_score_min)
                    }
                  >
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <div className="error-space">
              {formErrors?.pain_score_range && (
                <p className="text-danger mt-2 mb-0">
                  {formErrors.pain_score_range}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-4">
            <label className="mb-2 fw-semibold">No. of Days *</label>
            <input
              type="text"
              className="form-control form-control-input"
              placeholder="Enter No. of Days"
              name="no_of_days"
              onChange={handleInputChange}
              value={formData?.no_of_days}
              disabled={isEditMode}
            />
            <div className="error-space">
              {formErrors?.no_of_days && !isEditMode && (
                <p className="text-danger mt-2 mb-0">{formErrors.no_of_days}</p>
              )}
            </div>
          </div>

          <div className="col-md-4">
            <label className="mb-2 fw-semibold">Activity *</label>
            <select
              name="activity"
              className="form-select form-control-input"
              onChange={handleInputChange}
              value={formData?.activity}
              disabled={isEditMode}
            >
              {isEditMode ? null : (
                <option value="" disabled>
                  Select
                </option>
              )}
              {[...Array(100).keys()].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <div className="error-space">
              {formErrors?.activity && !isEditMode && (
                <p className="text-danger mt-2 mb-0">{formErrors.activity}</p>
              )}
            </div>
          </div>

          <div className="col-md-4">
            <label className="mb-2 fw-semibold">Relaxation *</label>
            <select
              name="relaxation"
              className="form-select form-control-input"
              onChange={handleInputChange}
              value={formData?.relaxation}
              disabled={isEditMode}
            >
              {isEditMode ? null : (
                <option value="" disabled>
                  Select
                </option>
              )}
              {[...Array(11).keys()].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <div className="error-space">
              {formErrors?.relaxation && !isEditMode && (
                <p className="text-danger mt-2 mb-0">{formErrors.relaxation}</p>
              )}
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-4">
            <label className="mb-2 fw-semibold">Learning *</label>
            <select
              name="learning"
              className="form-select form-control-input"
              onChange={handleInputChange}
              value={formData?.learning}
              disabled={isEditMode}
            >
              {isEditMode ? null : (
                <option value="" disabled>
                  Select
                </option>
              )}
              {[...Array(11).keys()].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <div className="error-space">
              {formErrors?.learning && !isEditMode && (
                <p className="text-danger mt-2 mb-0">{formErrors.learning}</p>
              )}
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-12 text-end">
            <button
              className="rv-reset-cancel mt-4"
              onClick={() => {
                onClose();
                clearForm();
              }}
            >
              Cancel
            </button>
            <button className="btn add-practs-btn ms-2" onClick={handleSubmit}>
              {submitButtonText}
            </button>
          </div>
        </div>
      </COffcanvasBody>
    </COffcanvas>
  );
};

export default TaskTemplateOffcanvas;
