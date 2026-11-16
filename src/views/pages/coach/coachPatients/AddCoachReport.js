import {
    CCloseButton,
    COffcanvas,
    COffcanvasBody,
    COffcanvasHeader,
    COffcanvasTitle,
} from "@coreui/react";
import { useState, useEffect } from "react";
import { useAddCoachReportsMutation } from "../../../../redux/apis/patient_coach_api";
import { validateRequired } from "../../../../utils/inputValidation";

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_REPORT_NAME_LENGTH = 100;

const AddCoachReport = ({
    setAddCoachCanva,
    patientId,
    addCoachCanva,
}) => {
    const [
        AddCoachReports,
        {
            isSuccess: addCoachReports,
            isLoading: addCoachLoading,
            isError: addCoachError,
        },
    ] = useAddCoachReportsMutation();

    const [btnDisabled, setBtnDisabled] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        patient_id: "",
        report_name: "",
        description: "",
    });

    const validateForm = () => {
        const newErrors = {};

        // Validate report_name
        const reportNameError = validateRequired(formData.report_name);
        if (reportNameError) {
            newErrors.report_name = reportNameError;
        } else if (formData.report_name.length > MAX_REPORT_NAME_LENGTH) {
            newErrors.report_name = `Report cannot exceed ${MAX_REPORT_NAME_LENGTH} characters`;
        }

        // Validate description
        const descriptionError = validateRequired(formData.description);
        if (descriptionError) {
            newErrors.description = descriptionError;
        } else if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
            newErrors.description = `Comment cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
        }

        setErrorsWithTimeout(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const setErrorsWithTimeout = (newErrors) => {
        setErrors(newErrors);

        // Clear errors after 3 seconds if there are any
        if (Object.keys(newErrors).length > 0) {
            setTimeout(() => {
                setErrors({});
            }, 3000);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (errors[name]) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: "",
            }));
        }

        if (name === "description" && value.length > MAX_DESCRIPTION_LENGTH) {
            setErrors({
                ...errors,
                description: `Comment cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
            });
            setTimeout(() => setErrors({}), 3000);
            return;
        }

        if (name === "report_name" && value.length > MAX_REPORT_NAME_LENGTH) {
            setErrors({
                ...errors,
                report_name: `Report cannot exceed ${MAX_REPORT_NAME_LENGTH} characters`,
            });
            setTimeout(() => setErrors({}), 3000);
            return;
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleAddReport = (e) => {
        e.preventDefault();

        // Validate the entire form
        const isValid = validateForm();
        if (!isValid) return;

        const payload = {
            patient_id: patientId,
            report_name: formData?.report_name.trim(),
            description: formData?.description.trim(),
        };
        AddCoachReports(payload);
    };

    const handleCancel = () => {
        setAddCoachCanva(false);
        setFormData({
            patient_id: "",
            report_name: "",
            description: "",
        });
        setErrors({});
    };

    useEffect(() => {
        if (addCoachReports) {
            setBtnDisabled(false);
            setAddCoachCanva(false);
            setFormData({
                patient_id: "",
                report_name: "",
                description: "",
            });
            setErrors({});
        }
        if (addCoachLoading) {
            setBtnDisabled(true);
        }
        if (addCoachError) {
            setBtnDisabled(false);
        }
    }, [addCoachReports, addCoachLoading, addCoachError, setAddCoachCanva]);

    useEffect(() => {
        if (addCoachCanva) {
            setFormData({
                patient_id: "",
                report_name: "",
                description: "",
            });
            setErrors({});
        }
    }, [addCoachCanva]);

    return (
        <>
            <COffcanvas
                className="ps-3 pe-3 offcanvas_add_user"
                backdrop="static"
                placement="bottom"
                visible={addCoachCanva}
                onHide={handleCancel}
                onClose={handleCancel}
            >
                <COffcanvasHeader>
                    <COffcanvasTitle className="pt-4">
                        Add Coach Report
                    </COffcanvasTitle>
                    <CCloseButton
                        className="text-reset modal-close-cross"
                        onClick={handleCancel}
                    />
                </COffcanvasHeader>

                <COffcanvasBody>
                    <form onSubmit={handleAddReport}>
                        {/* Report Name */}
                        <div className="row">
                            <div className="col">
                                <label className="p-2">Report Name *</label>
                                <input
                                    type="text"
                                    className="form-control form-control-input"
                                    placeholder="Enter report name"
                                    name="report_name"
                                    value={formData?.report_name}
                                    onChange={handleInputChange}
                                />
                                {errors.report_name && (
                                    <div className="text-danger mt-2">
                                        {errors.report_name}
                                    </div>
                                )}
                                <div
                                    className={`form-text text-end ${formData.report_name.length >= MAX_REPORT_NAME_LENGTH
                                        ? "text-danger"
                                        : "text-muted"
                                        }`}
                                >
                                    {formData.report_name.length}/{MAX_REPORT_NAME_LENGTH} characters
                                </div>
                            </div>
                        </div>

                        <div className="col mt-4">
                            <label className="p-2">Comment *</label>
                            <textarea
                                className="form-control form-control-input"
                                placeholder="Enter your comment"
                                name="description"
                                value={formData?.description}
                                onChange={handleInputChange}
                                rows={4}
                            />
                            {errors.description && (
                                <div className="text-danger mt-2">
                                    {errors.description}
                                </div>
                            )}
                            <div
                                className={`form-text text-end ${formData.description.length >= MAX_DESCRIPTION_LENGTH
                                    ? "text-danger"
                                    : "text-muted"
                                    }`}
                            >
                                {formData.description.length}/{MAX_DESCRIPTION_LENGTH} characters
                            </div>
                        </div>

                        <div className="row pt-4">
                            <div className="col-md-12 text-end">
                                <button
                                    type="button"
                                    className="rv-reset-cancel mt-4"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn add-practs-btn fw-bold mx-2 mt-1"
                                    disabled={btnDisabled}
                                >
                                    {btnDisabled ? "Adding..." : "Add"}
                                </button>
                            </div>
                        </div>
                    </form>
                </COffcanvasBody>
            </COffcanvas>
        </>
    );
};

export default AddCoachReport;
