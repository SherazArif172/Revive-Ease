import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { customStylesCreateBilling } from "../../../../Components/DataTable/CustomStyle";
import BackArrow from "../../../../assets/icons/backArrow.png";
import Sorticon from "../../../../assets/icons/sort.png";
import { useGetCreatedBillStatusQuery } from "../../../../redux/apis/billing_api";
import { formatDateOnly } from "../../../../utils/dateUtils";


const BilledStatus = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const billingNumberStatus = state._id;
    const patient_id = state?.coachModule === true ? state?.patient_id?._id : state.patient_id;
    // eslint-disable-next-line no-unused-vars
    const { data, isLoading: loading } = useGetCreatedBillStatusQuery({ patient_id: patient_id, billing_id: billingNumberStatus });

    const billedSessions = useSelector((state) => state?.allBilling?.createdBillStatus);
    // eslint-disable-next-line no-unused-vars
    const [error, setError] = useState(null);

    // Calculate max date as one month ago
    const maxMonth = new Date();
    maxMonth.setMonth(maxMonth.getMonth() - 1);

    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        return `${hours} hr ${minutes} min ${seconds} sec`;
    };

    const invoiceNumber = billedSessions?.billing?.invoiceNumber || "N/A";
    const paymentDate = billedSessions?.billing?.payment_received_date
        ? formatDateOnly(billedSessions?.billing?.payment_received_date, "MM/dd/yyyy")
        : "N/A";
    const paymentComments = billedSessions?.billing?.payment_comments || "N/A";
    const billingComments = billedSessions?.billing?.billing_comments || "N/A";

    const columns = [
        {
            name: "Session   Date",
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
    ];

    const handleBack = () => {
        navigate(-1);
    };

    const sessions = billedSessions?.sessions ?? data?.data?.sessions;
    const count = billedSessions?.count ?? data?.data?.count;
    const patient = billedSessions?.patient ?? data?.data?.patient;
    const billing = billedSessions?.billing ?? data?.data?.billing;

    const isEmptySessions = Array.isArray(sessions) && sessions.length === 0 && count === 0;
    const hasBillingData = billing != null;

    const getNoDataComponent = () => {
        if (!hasBillingData) {
            return "No billed sessions found";
        }
        if (isEmptySessions) {
            const transmissionDays = billing?.dataTransmissionLoginDays ?? "_";
            if (patient?.is98975Assigned) {
                return `Patient at least 2 Logins for 98975 and data transmission days are ${transmissionDays}`;
            }
            return `Patient data transmission days are ${transmissionDays}`;
        }
        return "No billed sessions found";
    };

    return (
        <div className="main-container">
            <div className="d-flex justify-content-between">
                <div className="font-color">

                    <div className="pointer px-2 mt-3" onClick={handleBack}>
                        <img loading="lazy" src={BackArrow} height={16} width={9.6} alt="Back Arrow" />
                        <strong className="px-2">Billing Details</strong>
                    </div>
                </div>
            </div>
            <div className="mt-3">
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : (
                    <>
                        <div className="mb-3 ">
                            <div><strong>Invoice Number :</strong> {invoiceNumber}</div>
                            <div><strong>Billing Comments :</strong> {billingComments}</div>
                            {state?.coachModule === true ? "" : <> <div><strong>Payment Received Date :</strong> {paymentDate}</div>
                                <div><strong>Payment Comments :</strong> {paymentComments}</div></>}
                        </div>

                        <DataTable
                            columns={columns}
                            customStyles={customStylesCreateBilling}
                            data={sessions ?? []}
                            highlightOnHover
                            sortIcon={<img loading="lazy" src={Sorticon} alt="Sort" />}
                            noDataComponent={getNoDataComponent()}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default BilledStatus;