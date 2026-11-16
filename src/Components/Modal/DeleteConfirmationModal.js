import { CModal, CModalBody } from '@coreui/react';
import React from 'react';

const DeleteConfirmationModal = ({content, onClose, confirmationModal}) => {
    return (
        <div>
            <>
                <CModal
                    alignment="center"
                    visible={confirmationModal}
                    onClose={onClose}
                    aria-labelledby="VerticallyCenteredExample"
                >
                    <CModalBody className="main-modal-body">
                        <div>
                            <div className="content-modal ">{content && content}</div>
                            <br />

                            <div className="d-flex justify-content-center col-md-12">
                                <button
                                    className="modal-close"
                                    onClick={onClose}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </CModalBody>
                </CModal>
            </>
        </div>
    );
};

export default DeleteConfirmationModal;