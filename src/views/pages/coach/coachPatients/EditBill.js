import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useGetBillingAgainQuery, useReCreateBillingMutation, useReUpdateSessionMutation } from '../../../../redux/apis/billing_api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { customStylesCreateBilling } from '../../../../Components/DataTable/CustomStyle';
import Sorticon from "../../../../assets/icons/sort.png";
import { CCloseButton, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, COffcanvas, COffcanvasBody, COffcanvasHeader, COffcanvasTitle } from "@coreui/react";
import Edit from "../../../../assets/icons/edit.png";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setBillingTab } from '../../../../redux/reducers/billingReducer';
import BackArrow from "../../../../assets/icons/backArrow.png";
import DeleteModal from '../../../../Components/Modal/DeleteModal';
import { formatDate, formatDateOnly } from '../../../../utils/dateUtils';

const EditBill = () => {

    const reduxPatientId = useSelector((state) => state?.allPatients?.patient?.patientData?._id);

    const reduxBillingAgainData = useSelector((state) => state?.allBilling?.billingAgainData);
    // const billingAgain = useSelector((state) => state?.allBilling?.billingAgainData?.selectedSessions);
    const locationState = useLocation().state;
    // Get patientId from navigation state if available, otherwise use Redux
    const patientId = locationState?.patientId || reduxPatientId;
    // Get billing_id from navigation state (could be the state value directly or in an object)
    const billingId = locationState?.billingId || (typeof locationState === 'string' ? locationState : null) || locationState;
    const actorType = useSelector((state) => state?.user?.userType);
    const actorId = useSelector((state) => state?.user?.id);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [editModal, openEditModal] = useState(false);
    const [rowData, setRowData] = useState(null);
    const [confirmModal, setConfirmModal] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [btnDisable, setBtnDisable] = useState(true);
    const [formData, setFormData] = useState({
        total_time: 0,
        call_time: 0,
        additional_time: 0,
    });
    const [billComments, setBillComments] = useState("");


    const selectedSessions = reduxBillingAgainData?.selectedSessions ?? [];
    const readyToBillSessions = reduxBillingAgainData?.readyToBillSessions ?? [];
    const billingAgain = [...selectedSessions, ...readyToBillSessions].sort(
        (a, b) => new Date(a?.date) - new Date(b?.date)
    );
    const patientCptBillable = reduxBillingAgainData?.patientCptBillable === true;
    const noCoachSessionsButBillable = billingAgain.length === 0 && patientCptBillable;
    useEffect(() => {
        if (rowData) {
            setFormData({
                total_time: rowData.total_time || "0",
                call_time: rowData.call_time || "0",
                additional_time: rowData.additional_time || "0",
            });
        }
    }, [rowData]);

    // Load bill comments from billing data when available (cancelledBill from getretry response)
    useEffect(() => {
        const comments = reduxBillingAgainData?.cancelledBill?.billing_comments ?? reduxBillingAgainData?.billing_comments ?? reduxBillingAgainData?.billing?.billing_comments ?? "";
        setBillComments(comments || "");
    }, [reduxBillingAgainData]);

    // eslint-disable-next-line no-unused-vars
    const { data: billingAgainData, refetch } = useGetBillingAgainQuery(
        { patient_id: patientId, billing_id: billingId },
        { skip: !patientId }
    );
    const [reUpdateSession, { isSuccess }] = useReUpdateSessionMutation();
    const [reCreateBilling, { isSuccess: reCreateSuccess }] = useReCreateBillingMutation();

    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        return `${hours} hr ${minutes} min ${seconds} sec`;
    };

    useEffect(() => {
        if (isSuccess) {
            openEditModal(false);
            refetch();
        }
    }, [isSuccess]);

    useEffect(() => {
        dispatch(setBillingTab(true));
    }, []);
    const onClose = () => {
        setConfirmModal(false);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([]);
        } else {
            const allIds = (billingAgain || []).map((row) => row?._id);
            setSelectedRows(allIds);
        }
        setSelectAll(!selectAll);
    };

    const handleRowSelect = (id) => {
        const updatedSelectedRows = selectedRows.includes(id)
            ? selectedRows.filter((rowId) => rowId !== id)
            : [...selectedRows, id];
        setSelectedRows(updatedSelectedRows);
        const allSelected = (billingAgain || []).length > 0 &&
            (billingAgain || []).every((row) => updatedSelectedRows.includes(row?._id));
        setSelectAll(allSelected);
    };


    // Disable Submit when no row selected; enable when at least one row selected OR no coach sessions but patient billable
    useEffect(() => {
        const canSubmit = selectedRows.length > 0 || noCoachSessionsButBillable;
        setBtnDisable(!canSubmit);
    }, [selectedRows, noCoachSessionsButBillable]);

    useEffect(() => {
        if (reCreateSuccess) {
            setConfirmModal(false);
            refetch();
            navigate(-1);
        }
    }, [reCreateSuccess , setConfirmModal]);

    const columns = [
        {
            name: (
                <input
                    type="checkbox"
                    className="ms-2"
                    checked={
                        (billingAgain || []).length > 0 &&
                        (billingAgain || []).every((row) => selectedRows.includes(row?._id))
                    }
                    onChange={handleSelectAll}
                />
            ),
            selector: (row) => (
                <input
                    type="checkbox"
                    checked={selectedRows.includes(row?._id)}
                    onChange={() => handleRowSelect(row?._id)}
                    className="me-1"
                />
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true
        },
        { name: "Start Date", selector: (row) => row?.date ? formatDateOnly(row?.date, "MM/dd/yyyy") : "N/A", sortable: true },
        { name: "Monitoring", selector: (row) => formatTime(row?.total_time), sortable: true },
        { name: "Calling", selector: (row) => formatTime(row?.call_time), sortable: true },
        { name: "Additional Resources", selector: (row) => formatTime(row?.additional_time), sortable: true },
        { name: "Total Hours", selector: (row) => formatTime(row?.call_time + row?.total_time + row?.additional_time), sortable: true },
        {
            name: "Action",
            button: true,
            cell: (row) => (
                <div>
                    <CDropdown variant="" direction="dropstart">
                        <CDropdownToggle size="sm">
                            <FontAwesomeIcon
                                icon={faEllipsis}
                                rotation={90}
                                size="lg"
                                style={{ color: "#04470C" }}
                            />
                        </CDropdownToggle>
                        <CDropdownMenu>
                            <CDropdownItem
                                onClick={() => { openEditModal(true); setRowData(row); }}
                            >
                                <img loading="lazy" src={Edit} className="me-2" alt="Edit" />
                                Edit
                            </CDropdownItem>
                        </CDropdownMenu>
                    </CDropdown>
                </div>
            ),
        },
    ];


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

    const handleSubmit = async () => {
        let payload = {
            session_id: rowData?._id,
            total_time: formData?.total_time > 0 ? formData.total_time : 0,
            call_time: formData?.call_time > 0 ? formData.call_time : 0,
            additional_time: formData?.additional_time > 0 ? formData.additional_time : 0,
            actorId: actorId,
            actorType: actorType,
        };
        reUpdateSession({ patientId: patientId, billing_id: billingId, data: payload });
    };

    const BillingSubmit = () => {
        setConfirmModal(true);
    };

    const BillingSubmitConfirm = () => {
        const sessionIds = selectedRows.length > 0
            ? selectedRows
            : (billingAgain || []).map((row) => row?._id);
        const payload = {
            patient_id: patientId,
            billing_id: billingId,
            actorId,
            actorType,
            sessionIds,
            sessionStatus: "Session Submitted",
            billing_comments: billComments?.trim() || undefined,
        };
        reCreateBilling(payload);
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <>
            <div className="d-flex justify-content-between mt-3">
                <div className="font-color">
                    <h6 className="pointer px-2" onClick={handleBack}>
                        <img loading="lazy" src={BackArrow} height={16} width={9.6} alt="Back Arrow" />
                        <strong className="ms-3">Edit Billing</strong>
                    </h6>
                </div>
                <button className="btn add-practice w-auto px-5 mb-2" disabled={btnDisable} onClick={BillingSubmit}>Submit for billing</button>
            </div>
            <div className="mt-3">
                <label className="fw-bold fs-16 me-3">Monthly Billing Summary</label>
                <textarea
                    className="form-control mt-1"
                    placeholder="Enter billing comments for the bill"
                    value={billComments}
                    onChange={(e) => setBillComments(e.target.value)}
                    rows={3}
                />
            </div>
            <div className="mt-2">
                <DataTable
                    columns={columns}
                    customStyles={customStylesCreateBilling}
                    data={billingAgain}
                    highlightOnHover
                    sortIcon={<img loading="lazy" src={Sorticon} alt="Sort" />}
                    noDataComponent={
                        noCoachSessionsButBillable ? (
                            <div className="text-center py-4 text-muted">Patient Session is Available but No Coach Session</div>
                        ) : (
                            <div className="text-center py-4 text-muted">There are no records to display</div>
                        )
                    }
                />
            </div>
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
                                        <p><b>Total Hours</b></p>
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
            <DeleteModal
                content={
                    noCoachSessionsButBillable && selectedRows.length === 0
                        ? "There is No Coach Session You Still want to Create Bill"
                        : "Do you really want to submit for billing?"
                }
                deleteModal={confirmModal}
                onClose={onClose}
                onConfirm={BillingSubmitConfirm}
                createBillingConfirmTag={true}
            />
        </>
    );
};

export default EditBill;