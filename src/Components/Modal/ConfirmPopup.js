import React from "react";
import { CModal } from "@coreui/react";
import "./ConfirmPopup.scss";

/**
 * Small centred popup used for "Mark the selected ... ?" confirmations and their success messages.
 * mode: "confirm" shows Cancel + Yes, "success" shows a single Close button.
 * variant: "danger" (red Yes, used by Flag) or "orange" (used by Ready for Billing).
 */
const ConfirmPopup = ({
  visible,
  message,
  mode = "confirm",
  variant = "danger",
  onCancel,
  onConfirm,
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
  closeLabel = "Close",
}) => (
  <CModal
    alignment="center"
    backdrop="static"
    keyboard={false}
    visible={visible}
    // No onClose here: CoreUI fires it whenever the modal hides, which would
    // undo the confirm -> success step. Buttons drive all state changes.
    className={`rv-confirm-popup rv-confirm-popup--${variant} rv-confirm-popup--${mode}`}
  >
    <div className="rv-confirm-card">
      <p className="rv-confirm-text">{message}</p>
      <div className="rv-confirm-actions">
        {mode === "confirm" ? (
          <>
            <button type="button" className="rv-confirm-btn rv-confirm-btn--outline" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button type="button" className="rv-confirm-btn rv-confirm-btn--fill" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </>
        ) : (
          <button type="button" className="rv-confirm-btn rv-confirm-btn--outline" onClick={onCancel}>
            {closeLabel}
          </button>
        )}
      </div>
    </div>
  </CModal>
);

export default ConfirmPopup;
