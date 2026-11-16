import { CCloseButton, COffcanvas, COffcanvasBody, COffcanvasHeader, COffcanvasTitle } from '@coreui/react';
import React, { useState, useEffect } from 'react';
import { useUpdateSessionMutation } from '../../../../redux/apis/billing_api';
import { useSelector } from 'react-redux';
import { formatDate } from '../../../../utils/dateUtils';

const CreateBillingEdit = ({ openEditModal, editModal, rowData }) => {
    
    const patientId = useSelector((state) => state.allPatients?.patient?.patientData?._id);
    const actorType = useSelector((state) => state?.user?.userType);
    const actorId = useSelector((state) => state?.user?.id);
    const [formData, setFormData] = useState({
        total_time: 0,
        call_time: 0,
        additional_time: 0,
    });

    const [updateSession, { isSuccess }] = useUpdateSessionMutation();

    useEffect(() => {
        if (rowData) {
            setFormData({
                total_time: rowData.total_time || "0",
                call_time: rowData.call_time || "0",
                additional_time: rowData.additional_time || "0",
            });
        }
    }, [rowData]);

    useEffect(() => {
        if (isSuccess) {
            openEditModal(false);
        }
    }, [isSuccess]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
    
        // Ensure the value contains only positive integers or is empty
        if (/^[1-9]\d*$|^$/.test(value)) {
            const numericValue = value === "" ? "" : Number(value) * 60;
            setFormData((prevData) => ({
                ...prevData,
                [name]: numericValue
            }));
        }
    };    

    const handleSubmit = () => {
        let payload = {
            session_id: rowData?._id,
            total_time: formData?.total_time > 0 ? formData.total_time : 0,
            call_time: formData?.call_time > 0 ? formData.call_time : 0,
            additional_time: formData?.additional_time > 0 ? formData.additional_time : 0,
            actorId: actorId,
            actorType: actorType,
        };
        updateSession({ patientId: patientId, data: payload });
    };

    return (
        <div>
            <COffcanvas
                className="ps-3 pe-3 default_offcanvas_add"
                backdrop="static"
                placement="bottom"
                visible={editModal}
                style={{ height: "auto" }}
            >
                <COffcanvasHeader>
                    <COffcanvasTitle className="pt-4">Details</COffcanvasTitle>
                    <CCloseButton className="text-reset modal-close-cross" onClick={() => openEditModal(false)} />
                </COffcanvasHeader>
                <COffcanvasBody style={{ overflowX: "hidden" }}>
                    <div className="container-fluid">
                        <div className="mb-3">
                            <h6 className='mb-3'>
                                <b>Session Date:</b> {formatDate(rowData?.date, "MM/dd/yyyy")}
                            </h6>
                            <div className="col-md-12 d-flex bg-light grey rounded mt-2 p-3">
                                <div className="col-md-3 d-flex flex-column align-items-start">
                                    <p><b>Monitoring</b></p>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="total_time"
                                        min="0"
                                        value={formData?.total_time ? Math.floor(formData.total_time / 60) : ""}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => {
                                            if (
                                              e.key.length === 1 &&
                                              !/[0-9]/.test(e.key)
                                            ) {
                                              e.preventDefault();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="col-md-3 d-flex flex-column align-items-start mx-3">
                                    <p><b>Calling</b></p>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="call_time"
                                        min="0"
                                        value={formData?.call_time ? Math.floor(formData.call_time / 60) : ""}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => {
                                            if (
                                              e.key.length === 1 &&
                                              !/[0-9]/.test(e.key)
                                            ) {
                                              e.preventDefault();
                                            }
                                        }}
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <div className="col-md-3 d-flex flex-column align-items-start mx-3">
                                    <p><b>Additional resources</b></p>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="additional_time"
                                        min="0"
                                        value={formData?.additional_time ? Math.floor(formData.additional_time / 60) : ""}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => {
                                            if (
                                              e.key.length === 1 &&
                                              !/[0-9]/.test(e.key)
                                            ) {
                                              e.preventDefault();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="col-md-3 d-flex flex-column align-items-start mx-3">
                                    <p><b>Total Time</b></p>
                                     <p>
                                        {Math.floor(
                                            ((parseInt(formData?.additional_time) || 0) +
                                                (parseInt(formData?.call_time) || 0) +
                                                (parseInt(formData?.total_time) || 0)) / 60
                                        )} Minutes
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="row pt-4">
                            <div className="col-md-12 text-end">
                                <button className="rv-reset-cancel mt-4" onClick={() => openEditModal(false)}>Cancel</button>
                                <button className="btn add-practs-btn ms-2" onClick={handleSubmit}>Save</button>
                            </div>
                        </div>
                    </div>
                </COffcanvasBody>
            </COffcanvas>
        </div>
    );
};

export default CreateBillingEdit;
