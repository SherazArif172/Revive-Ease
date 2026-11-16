import { CModal, CModalBody, CModalTitle } from '@coreui/react';
import React from 'react';

const AddUserConfirmationModal = ({setUserModal, userModal, type, action}) => {
    return (
        <div>
            <>
                <CModal
                    alignment="center"
                    visible={userModal}
                    onClose={() => (false)}
                    aria-labelledby="VerticallyCenteredExample"
                >
                    <div className="d-flex justify-content-center CModalHeader">
                        <CModalTitle className="text-white">{type === "Coach" ? "Coach Added" : "Provider Added"}</CModalTitle>
                    </div>
                    <CModalBody className="main-modal-body">
                        <div>
                            <div className="content-modal">
                                {type === "Coach"
                                    ? `Coach ${action === "clone" ? "cloned" : "added"} successfully and the login has been sent on the registered email.`
                                    : "Provider added successfully and the login has been sent on the registered email."}
                            </div>
                            <br />
                            <div className="d-flex justify-content-center mt-2 ">
                                <button
                                    className="modal-close"
                                    onClick={() => {
                                        setUserModal(false);
                                    }}
                                >
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

export default AddUserConfirmationModal;