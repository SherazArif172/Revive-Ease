import { CModal, CModalBody, CModalTitle } from '@coreui/react';
import React from 'react';

const StatusModal = ({statusModal, onConfirm, content, onClose}) => {
    return (
        <div>    
            <>
            <CModal
                alignment="center"
                visible={statusModal}
                onClose={onClose}
                aria-labelledby="VerticallyCenteredExample"
            >
                <div className="d-flex justify-content-center CModalHeader">
                    <CModalTitle className="text-white">Delete</CModalTitle>
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
                                style={{ backgroundColor: "#F88200" }}
                                className="modal-close ms-3 text-white"
                                onClick={onConfirm}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </CModalBody>
            </CModal>
        </></div>
    );
};

export default StatusModal;