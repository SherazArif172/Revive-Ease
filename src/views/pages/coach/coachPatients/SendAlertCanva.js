import { CCloseButton, COffcanvas, COffcanvasBody, COffcanvasHeader, COffcanvasTitle } from "@coreui/react";
import TextAreaAutosize from "../../../../Components/TextAreaAutosize";
import { useSelector } from "react-redux";
import { useSendAlertMsgMutation } from "../../../../redux/apis/patient_coach_api";
import { useEffect, useState } from "react";
import { useGetAllProvierListQuery } from "../../../../redux/apis/provider_api";

const AlertCanva = ({ sendAlertCanva, setSendAlertCanva, state, onClose, error, setError }) => {

    const coach_id = useSelector((state) => state?.user?.id);
    const patientData = useSelector((state) => state?.allPatients?.patient?.patientData);
    const [btnDisabled, setBtnDisabled] = useState(false);

    const [skip, setSkip] = useState(true);
    const [formData, setFormData] = useState({
        message: "",
        patient_id: "",
        provider_id: ""
    });
    const [checkboxState, setCheckboxState] = useState({
        sendToPatient: false,
        sendToProvider: false
    });

    // eslint-disable-next-line no-unused-vars
    const { data: providerData } = useGetAllProvierListQuery(state?.clinic_id, { skip: skip });
    const [sendAlertMsg, { isSuccess, isLoading: sendAlertLoading, isError: sendAlertError }] = useSendAlertMsgMutation();

    const resetForm = () => {
        setFormData({
            message: "",
            patient_id: "",
            provider_id: "",
        });
        setCheckboxState({
            sendToPatient: false,
            sendToProvider: false
        });
    };

    useEffect(() => {
        if (state?.clinic_id) {
            setSkip(false);
        }
    }, [state?.clinic_id]);

    useEffect(() => {
        if (patientData) {
            setFormData((prev) => ({
                ...prev,
                patient_id: patientData?._id || "",
                provider_id: patientData?.provider?._id || ""
            }));
        }
    }, [patientData]);

    useEffect(() => {
        if (isSuccess) {
            setBtnDisabled(false);
            setSendAlertCanva(false);
            resetForm();
        }
        if (sendAlertLoading) {
            setBtnDisabled(true);
        }
        if (sendAlertError) {
            setBtnDisabled(true);
        }
    }, [isSuccess, sendAlertLoading, sendAlertError]);

    const MAX_MESSAGE_LENGTH = 150;

    const handleMessageChanged = (e) => {
        const { name, value } = e.target;

        if (value.length <= MAX_MESSAGE_LENGTH) {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
            setError("");
        } else {
            setError(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
            setTimeout(() => {
                setError("");
            }, 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (formData?.message === "") {
            setError("Message is required *");
            return;
        }

        // Validate at least one checkbox is selected
        if (!checkboxState?.sendToPatient && !checkboxState?.sendToProvider) {
            setError("Either Patient or Provider must be selected *");
            setTimeout(() => setError(""), 3000);
            return;
        }

        const payload = {
            coach_id: coach_id,
            message: formData?.message,
            patient_id: patientData?._id || "",
            provider_id: patientData?.provider?._id || "",
            sendToPatient: checkboxState?.sendToPatient || false,
            sendToProvider: checkboxState?.sendToProvider || false
        };

        try {
            const response = await sendAlertMsg(payload).unwrap();
            console.log("Alert Sent:", response);
            // Add success handling here if needed
        } catch (error) {
            console.error("Error sending alert:", error);
            setError("Failed to send alert. Please try again.");
            setTimeout(() => setError(""), 3000);
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setCheckboxState((prevState) => ({
            ...prevState,
            [name]: checked
        }));
    };

    return (
        <>
            <COffcanvas
                className="ps-3 pe-3 pt-3 offcanvas_filter"
                backdrop="static"
                placement="end"
                visible={sendAlertCanva}
                onClose={onClose}
                onHide={onClose}
            >
                <COffcanvasHeader>
                    <COffcanvasTitle className="">Alert</COffcanvasTitle>
                    <CCloseButton
                        className="text-reset modal-close-cross"
                        onClick={() => {
                            setSendAlertCanva(false);
                            resetForm();
                        }}
                    />
                </COffcanvasHeader>

                <COffcanvasBody className="d-flex flex-column justify-content-between">
                    <div>
                        <div className="fw-bold">
                            <p className="title-register">Message *</p>
                            <div>
                                <TextAreaAutosize
                                    name="message"
                                    value={formData.message}
                                    onChange={handleMessageChanged}
                                    className="form-control"
                                    placeholder="Enter your message"
                                />


                                <small
                                    className={
                                        formData.message.length > MAX_MESSAGE_LENGTH ? "text-danger" : "text-muted"
                                    }
                                >
                                    {formData.message.length}/{MAX_MESSAGE_LENGTH} characters
                                </small>
                            </div>
                            {error && <p className="text-danger fw-light mt-2">{error}</p>}
                        </div>
                        <div className="my-2 pt-4">
                            <p className="title-register">Receiver *</p>
                            <div className="col-12">
                                <div className="form-check">
                                    <input
                                        className="form-check-input shadow-none rg-customeck"
                                        name="sendToPatient"
                                        type="checkbox"
                                        checked={checkboxState.sendToPatient}
                                        id="patientCheckbox"
                                        onChange={handleCheckboxChange}
                                    />
                                    <label className="form-check-label" htmlFor="patientCheckbox">
                                        {`${patientData?.first_name} ${patientData?.last_name} ${"(Patient)"}`}
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input shadow-none rg-customeck"
                                        name="sendToProvider"
                                        type="checkbox"
                                        checked={checkboxState.sendToProvider}
                                        id="providerCheckbox"
                                        onChange={handleCheckboxChange}
                                    />
                                    <label className="form-check-label" htmlFor="providerCheckbox">
                                        {`${patientData?.provider?.first_name} ${patientData?.provider?.last_name} ${"(Provider)"}`}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 mt-3">
                        <div className="d-flex">
                            <button
                                onClick={() => {
                                    setSendAlertCanva(false);
                                    resetForm();
                                }}
                                className="shadow-none btn-cancel-user-alert bg-white me-2 "
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="shadow-none btn-save-default-width border-0"
                                disabled={btnDisabled === true}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </COffcanvasBody>
            </COffcanvas>
        </>
    );
};

export default AlertCanva;