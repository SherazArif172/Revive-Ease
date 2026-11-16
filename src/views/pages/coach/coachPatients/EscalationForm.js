import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import React, { useState, useEffect } from "react";
import TextAreaAutosize from "../../../../Components/TextAreaAutosize";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const EscalationForm = ({
  esclatePatient,
  esclatePatientSuccess,
  escalationForm,
  onClose,
  patient_id,
  coach_id,
  provider_id,

}) => {
  const [actionsTaken, setActionsTaken] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = useSelector((state) => state?.user?.id);
  const userType = useSelector((state) => state?.user?.userType);

  // Handle success state
  useEffect(() => {
    if (esclatePatientSuccess) {
      toast.success("Patient Escalated Successfully!");
      setActionsTaken("");
      setError("");
      setIsSubmitting(false);
      onClose();
    }
  }, [esclatePatientSuccess]);

  const MAX_CHAR_LIMIT = 500;

  const handleChange = (e) => {
    const value = e.target.value;

    if (value.length <= MAX_CHAR_LIMIT) {
      setActionsTaken(value);
      setError("");
    } else {
      setError(`Maximum ${MAX_CHAR_LIMIT} characters allowed.`);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSubmit = async () => {
    if (!actionsTaken.trim()) {
      setError("Please enter actions taken");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        isEscalation: {
          escalatedBy: coach_id,
          escalatedTo: provider_id,
          comment_to_provider: actionsTaken.trim(),
          actorId: id,
          actorType: userType,
        }
      };

      await esclatePatient({ payload, patientId: patient_id });
    } catch (err) {
      setError("Failed to escalate. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setActionsTaken("");
    setError("");
    onClose();
  };

  return (
    <COffcanvas
      className="ps-3 pe-3 pb-2 mt-4 offcanvas_add_user_auto"
      backdrop="static"
      placement="bottom"
      visible={escalationForm}
      onHide={onClose}
    >
      <COffcanvasHeader className="">
        <COffcanvasTitle className="pt-2">Escalate to Provider</COffcanvasTitle>
        <CCloseButton
          className="text-reset modal-close-cross"
          onClick={handleCancel}
        />
      </COffcanvasHeader>

      <COffcanvasBody>
        <div className="container-fluid">
          <div className="mb-3">
            <label className="form-label">Actions Taken *</label>

            <TextAreaAutosize
              value={actionsTaken}
              onChange={handleChange}
              placeholder="Enter comments here"
              minRows={2}
              style={{
                width: "100%",
                border: `2px solid ${error ? "#dc3545" : "#D9D9D9"}`,
                borderRadius: "0.375rem",
                padding: "0.375rem 0.75rem",
              }}
            />
            {error && <div className="text-danger mt-1 small">{error}</div>}
            <div
              className={`form-text text-end ${actionsTaken.length >= MAX_CHAR_LIMIT ? "text-danger" : "text-muted"
                }`}
            >
              {actionsTaken.length}/{MAX_CHAR_LIMIT} characters
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              className="shadow-none btn-cancel-user bg-white"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="modal-assign bold"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Escalating..." : "Escalate to Provider"}
            </button>
          </div>
        </div>
      </COffcanvasBody>
    </COffcanvas>
  );
};

export default EscalationForm;
