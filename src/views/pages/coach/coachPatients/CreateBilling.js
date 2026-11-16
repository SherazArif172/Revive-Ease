import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from "@coreui/react";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { customStylesCreateBilling } from "../../../../Components/DataTable/CustomStyle";
import DeleteModal from "../../../../Components/Modal/DeleteModal";
import BackArrow from "../../../../assets/icons/backArrow.png";
import Edit from "../../../../assets/icons/edit.png";
import Sorticon from "../../../../assets/icons/sort.png";
import { useCreateBillingMutation, useGetAllSessionQuery } from "../../../../redux/apis/billing_api";
import { setBillingTab } from "../../../../redux/reducers/billingReducer";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";
import { formatDateOnly } from "../../../../utils/dateUtils";
import CreateBillingEdit from "./CreateBillingEdit";

const CreateBilling = () => {
    const allSessionData = useSelector((state) => state?.allBilling?.allSession) || {};
    const billingSession = Array.isArray(allSessionData?.sessions) ? allSessionData.sessions : [];
    const totalSessions = allSessionData?.total_sessions ?? 0;
    const patientCptBillable = allSessionData?.patientCptBillable === true;
    const patient_id = useSelector((state) => state?.allPatients?.patient?.patientData?._id);
    const coachId = useSelector((state) => state?.user?.id);
    const actorType = useSelector((state) => state?.user?.userType);
    const actorId = useSelector((state) => state?.user?.id);
    const { state } = useLocation();
    const [rowData, setRowData] = useState(null);
    const [editModal, openEditModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedTempDate, setSelectedTempDate] = useState("");
    const navigate = useNavigate();

    // Calculate max date as one month ago
    const maxMonth = new Date();
    maxMonth.setMonth(maxMonth.getMonth() - 1);

    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [btnDisable, setBtnDisable] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [billingComments, setBillingComments] = useState("");

    const dispatch = useDispatch();

    // By default fetch all sessions; when month filter is applied, refetch with sMonth
    // eslint-disable-next-line no-unused-vars
    const { data: allBillingSessions, refetch } = useGetAllSessionQuery(
        selectedMonth ? { patient_id: state, sMonth: selectedMonth } : { patient_id: state },
        { skip: !state }
    );
    const [createBilling, { isSuccess: createBillingSuccess, isLoading: createBillingLoading, isError: createBillingError }] = useCreateBillingMutation();
    const approvedDateRaw = useSelector((state) => state?.allPatients?.patient?.patientData?.createdAt);

    console.log("approvedDateRaw", approvedDateRaw);
    // First day of approved month – user cannot select a month before the approved month
    const minDate = approvedDateRaw ? (() => {
        const d = new Date(approvedDateRaw);
        return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), 1);
    })() : null;

    // Refetch when patient or month filter changes
    useEffect(() => {
        if (state || selectedMonth || patient_id) {
            refetch();
        }
    }, [state, selectedMonth, patient_id]);

    useEffect(() => {
        if (createBillingSuccess) {
            refetch();
            setBtnDisable(false);
            navigate(-1);
        }
        if (createBillingLoading) {
            setBtnDisable(false);
        }
        if (createBillingError) {
            setBtnDisable(false);
        }
    }, [createBillingSuccess, createBillingLoading, createBillingError]);

    // Patient IDs where we can bill with patient sessions only (no coach sessions required)
    const PATIENT_BILL_WITHOUT_COACH_SESSIONS = ["98975", "98977", "98985"];

    // No coach sessions but API says patient is CPT billable – allow submit
    const noCoachSessionsButBillable = totalSessions === 0 && patientCptBillable;

    // Disable Submit when no month selected or no billing comments; enable when month + billing comments + (selected rows OR special patient IDs OR no coach sessions but patientCptBillable)
    useEffect(() => {
        const hasMonth = !!selectedMonth;
        const hasBillingComments = !!billingComments?.trim();
        const hasSelectedRows = selectedRows.length > 0;
        const canBillWithoutCoachSessions = state && PATIENT_BILL_WITHOUT_COACH_SESSIONS.includes(String(state));
        const canSubmit = hasMonth && hasBillingComments && (hasSelectedRows || canBillWithoutCoachSessions || noCoachSessionsButBillable);
        setBtnDisable(!canSubmit);
    }, [selectedMonth, billingComments, selectedRows, state, noCoachSessionsButBillable]);

    useEffect(() => {
        dispatch(setBillingTab(true));
    }, []);

    // Clear selections and billing comments when no month is selected
    useEffect(() => {
        if (!selectedMonth) {
            setSelectedRows([]);
            setSelectAll(false);
            setBillingComments("");
        }
    }, [selectedMonth]);

    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        return `${hours} hr ${minutes} min ${seconds} sec`;
    };
    // Rows that belong to the selected month (only when a month is selected)
    const eligibleRows = selectedMonth
        ? (billingSession?.filter((row) => {
            const rowDate = new Date(row?.date);
            const [y, m] = selectedMonth.split("-").map(Number);
            return rowDate.getFullYear() === y && rowDate.getMonth() === m - 1;
        }) || [])
        : [];

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([]);
        } else {
            const eligibleDates = eligibleRows.map((row) => row?.date);
            setSelectedRows(eligibleDates);
        }
        setSelectAll(!selectAll);
    };

    const handleRowSelect = (date) => {
        if (!selectedMonth) return;
        let updatedSelectedRows = selectedRows.includes(date)
            ? selectedRows.filter((rowDate) => rowDate !== date)
            : [...selectedRows, date];

        const eligibleRowDates = eligibleRows.map((row) => row?.date);
        setSelectedRows(updatedSelectedRows);

        const allSelected = eligibleRowDates.length > 0 && eligibleRowDates.every((d) => updatedSelectedRows.includes(d));
        setSelectAll(allSelected);
    };

    const handleTempSubmit = () => {
        if (selectedTempDate) {
            const year = selectedTempDate.getFullYear();
            const month = String(selectedTempDate.getMonth() + 1).padStart(2, '0');
            const formattedMonth = `${year}-${month}`;
            setSelectedMonth(formattedMonth);
        } else {
            setSelectedMonth("");
        }
    };

    const columns = [
        {
            name: (
                <input
                    type="checkbox"
                    className="ms-2"
                    checked={
                        eligibleRows.length > 0 &&
                        eligibleRows.every((row) => selectedRows.includes(row?.date))
                    }
                    onChange={handleSelectAll}
                    disabled={!selectedMonth}
                />
            ),
            selector: (row) => {
                const isInSelectedMonth = eligibleRows.some((r) => r?.date === row?.date);

                return (
                    <input
                        type="checkbox"
                        checked={selectedRows.includes(row?.date)}
                        onChange={() => handleRowSelect(row?.date)}
                        className="me-1"
                        disabled={!selectedMonth || !isInSelectedMonth}
                    />
                );
            },
            ignoreRowClick: true,
            allowOverflow: true,
            button: true
        },
        {
            name: "Start Date",
            selector: (row) =>
                row?.date ? formatDateOnly(row?.date, "MM/dd/yyyy") : "N/A",
            sortable: true
        },
        {
            name: "Monitoring",
            selector: (row) => formatTime(row?.total_time),
            sortable: true
        },
        {
            name: "Calling",
            selector: (row) => formatTime(row?.call_time),
            sortable: true
        },
        {
            name: "Additional Resources",
            selector: (row) => formatTime(row?.additional_time),
            sortable: true
        },
        {
            name: "Total Hours",
            selector: (row) =>
                formatTime(
                    row?.call_time + row?.total_time + row?.additional_time
                ),
            sortable: true
        },
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
                                onClick={() => {
                                    openEditModal(true);
                                    setRowData(row);
                                }}
                            >
                                <img loading="lazy" src={Edit} className="me-2" alt="Edit" />
                                Edit
                            </CDropdownItem>
                        </CDropdownMenu>
                    </CDropdown>
                </div>
            )
        }
    ];

    const deleteModalTrue = () => {
        setConfirmModal(true);
    };

    const onClose = () => {
        setConfirmModal(false);
    };
    const BillingSubmit = async () => {
        if (!selectedMonth || !billingComments?.trim()) return;
        let payload = {
            coach_id: coachId,
            billing_month: selectedMonth,
            billing_comments: billingComments.trim(),
            selected_session_dates: selectedRows,
            actorId: actorId,
            actorType: actorType,
        };
        try {
            await createBilling({ patient_id: patient_id, data: payload });
            setSelectedRows([]);
            setSelectAll(false);
            setBillingComments("");
        } catch (error) {
            console.error("Error submitting billing:", error);
        }
    };
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <>
            <div className="d-flex justify-content-between">
                <div className="main-container mt-4">
                    <div className="d-flex justify-content-between">
                        <div className="font-color">
                            <h6 className="pointer px-2" onClick={handleBack}>
                                <img loading="lazy" src={BackArrow} height={16} width={9.6} alt="Back Arrow" />
                                <strong className="ms-3">Create Billing</strong>
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-items-between flex-row" >
                <div>
                    <div className="d-flex justify-content-between">
                        <label className=" fw-bold fs-16 me-3 mt-3">Select month to create billing</label>
                        <div className="mt-2 me-3">
                            <DatePicker
                                minDate={minDate}
                                maxDate={maxMonth}
                                customInput={<BlockKeyboardInput />}
                                selected={selectedTempDate}
                                onChange={(date) => {
                                    setSelectedTempDate(date);

                                    if (date === null) {
                                        setSelectedMonth("");
                                        refetch();
                                    }
                                }}
                                dateFormat="MMMM yyyy"
                                showMonthYearPicker
                                className="form-control input-dt shadow"
                                placeholderText="Select month"
                                isClearable
                            />
                        </div>
                        <div>
                            <button className="btn btn-save text-white mt-2" onClick={handleTempSubmit}>Search</button>
                        </div>
                    </div>
                </div>
                <div>
                    <button className="btn add-practice w-auto px-5 mt-2" disabled={btnDisable === true} onClick={deleteModalTrue}>Submit for billing</button>
                </div>
                
            </div>

            <div className="mt-3">
                <label className="fw-bold fs-16 me-3">Monthly Billing Summary<span className="text-danger">*</span></label>
                <textarea
                    className="form-control mt-1"
                    placeholder="Enter billing comments for the bill"
                    value={billingComments}
                    onChange={(e) => setBillingComments(e.target.value)}
                    disabled={!selectedMonth}
                    rows={3}
                />
            </div>

            <div className="mt-2">
                <DataTable
                    columns={columns}
                    customStyles={customStylesCreateBilling}
                    data={billingSession}
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
            <CreateBillingEdit
                openEditModal={openEditModal}
                editModal={editModal}
                rowData={rowData}
            />

            <DeleteModal
                content={
                    noCoachSessionsButBillable && selectedRows.length === 0
                        ? "There is No Coach Session You Still want to Create Bill"
                        : "Do you really want to submit for billing?"
                }
                deleteModal={confirmModal}
                onClose={onClose}
                onConfirm={BillingSubmit}
                createBillingConfirmTag={true}
            />
        </>
    );
};

export default CreateBilling;
