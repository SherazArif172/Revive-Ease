import React from "react";
import { CModal, CModalBody } from "@coreui/react";

const MarkModal = ({ showModal, onClose, content, onConfirm, color, matchCondition, }) => {
  return (
    <>
      <CModal
        backdrop="static"
        alignment="center"
        visible={showModal}
        onClose={onClose}
        size="sm"

      >
        <CModalBody className="main-modal-body ">
          <div>
            <p className="text-center roboto fw-bold font-gray mb-3">{content}</p>

            <div className="d-flex justify-content-center col-md-12 ">
              <button className="modal-marked-close  fs-16 bg-white " onClick={onClose}>
                Close
              </button>
              {matchCondition ? null : <button
                style={{ backgroundColor: color }}
                className="modal-marked-close  ms-3 text-white border-0"
                onClick={onConfirm}
              >
                Yes
              </button>}

            </div>
          </div>
        </CModalBody>
      </CModal>
    </>
  );
};

export default MarkModal;
