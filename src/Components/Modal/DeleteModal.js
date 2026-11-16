import { CModal, CModalBody, CModalTitle } from "@coreui/react";
import React from "react";

const DeleteModal = ({ onClose, deleteModal, content, onConfirm, createBillingConfirmTag }) => {
  return (
    <>
      <CModal
        alignment="center"
        visible={deleteModal}
        onClose={onClose}
        onHide={onClose}
        aria-labelledby="VerticallyCenteredExample"
      >
        <div className="d-flex justify-content-center CModalHeader">
          <CModalTitle className="text-white">{createBillingConfirmTag ? "Confirmation !" : "Delete"}</CModalTitle>
        </div>
        <CModalBody className="main-modal-body">
          <div>
            <div className="content-modal ">{content && content}</div>
            <br />

            <div className="d-flex justify-content-center col-md-12">
              <button
                className="modal-close"
                onClick={onClose}
              >
                Close
              </button>
              <button

                className="modal-assign ms-3 "
                onClick={onConfirm}
              >
                {createBillingConfirmTag ? "Submit" : "Delete"}

              </button>
            </div>
          </div>
        </CModalBody>
      </CModal>
    </>
  );
};

export default DeleteModal;
