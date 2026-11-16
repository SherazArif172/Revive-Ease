import { CModal, CModalBody, CModalTitle } from "@coreui/react";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";

const PaymentReceivedModal = ({
    visible,
    onClose,
    onSubmit,
    isLoading,
    paymentDate,
    setPaymentDate,
    paymentComments,
    setPaymentComments,
    title = "Payment Received" // Default title if not provided
}) => {
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (!paymentDate || !paymentComments) {
            setError("Both fields are required");
            return;
        }
        setError("");
        onSubmit();
    };

    return (
        <CModal
            alignment="center"
            visible={visible}
            size="md"
            onClose={onClose}
            backdrop="static"
        >
            <div className="d-flex justify-content-center CModalHeader">
                <CModalTitle className="text-white">
                    {title}
                </CModalTitle>
            </div>
            <CModalBody className="main-modal-body">
                <div style={{ width: "400px" }}>
                    {error && (
                        <div className="text-danger mb-2 text-center">
                            {error}
                        </div>
                    )}
                    <div className="text-start">
                        <div className="form-group has-search-right my-3">
                            <label className="rv-label-newpractice py-2">
                                Payment Received Date *
                            </label>
                            <DatePicker
                                customInput={<BlockKeyboardInput />}
                                className="form-control input-dt shadow"
                                onChange={(date) => setPaymentDate(date)}
                                selected={paymentDate}
                                dateFormat="MM/dd/yyyy"
                                placeholderText="Select Date"
                                maxDate={new Date()}
                            />
                        </div>

                        <div className="my-3">
                            <label className="rv-label-newpractice py-2">
                                Payment Comments *
                            </label>
                            <textarea
                                className="form-control form-control-input"
                                rows="3"
                                value={paymentComments}
                                onChange={(e) => setPaymentComments(e.target.value)}
                                placeholder="Enter payment comments"
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-center col-md-12 py-3">
                        <button 
                            className="modal-close" 
                            onClick={() => { 
                                onClose(); 
                                setError(""); 
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="modal-assign ms-3"
                            disabled={isLoading}
                            onClick={handleSubmit}
                        >
                            {isLoading ? "Processing..." : "Mark as Paid"}
                        </button>
                    </div>
                </div>
            </CModalBody>
        </CModal>
    );
};

export default React.memo(PaymentReceivedModal);
