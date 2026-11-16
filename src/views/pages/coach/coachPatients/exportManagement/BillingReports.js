import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DataTable from "react-data-table-component";
import customStyles from "../../../../../Components/DataTable/CustomStyle";
import Sorticon from "../../../../../assets/icons/sort.png";
import { useDispatch, useSelector } from "react-redux";
import { setBillingSummary } from "../../../../../redux/reducers/billingReducer";
import { useGetBillingSummaryByPatientQuery } from "../../../../../redux/apis/billing_api";
import DownloadPDF from "./DownloadPDF";
import BlockKeyboardInput from "../../../../../utils/BlockKeyboardInput";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Format billing_month (YYYY-MM) as month name. No Date/timezone — "2025-11" always shows November.
function getMonthNameFromBillingMonth(billingMonth) {
  if (!billingMonth) return "-";
  const str = `${billingMonth}`.trim();
  const dash = str.indexOf("-");
  if (dash === -1) return "-";
  const month = parseInt(str.slice(dash + 1), 10);
  if (month < 1 || month > 12) return "-";
  return MONTH_NAMES[month - 1];
}

const BillingReports = () => {
  const patientId = useSelector((state) => state.allPatients.patient.patientData._id);
  const patientData = useSelector((state) => state?.allPatients?.patient?.patientData);

  const billingSummary = useSelector((state) => state.allBilling.billingSummary);

  const [selectedTempDate, setSelectedTempDate] = useState("");
  const dispatch = useDispatch();
  // Calculate max date as one month ago
  const maxMonth = new Date();
  maxMonth.setMonth(maxMonth.getMonth());

  const { data, isLoading: billingSummaryLoading } = useGetBillingSummaryByPatientQuery({
    patient_id: patientId,
    month_Filter: selectedTempDate,
  }, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (data?.data) {
      const transformedData = data.data.map(item => ({
        ...item,
        totalTimeSpentSeconds: item.totaloveralltime ? item.totaloveralltime : item.totalTimeSpentSeconds,
        patient: {
          ...item.patient,
          // Ensure all patient fields are properly mapped
          Email: item.patient?.email || item.patient?.Email,
          coach_email_count: item.patient?.coach_email_count || [],
          messageCount: item.patient?.messageCount || 0,
          customize_keys: item.patient?.customize_keys || []
        }
      }));
      dispatch(setBillingSummary(transformedData));
    }
  }, [data, dispatch]);

  const countCPTCodes = () => {
    if (!Array.isArray(billingSummary) || billingSummary.length === 0) return {};

    const cptCount = {};
    billingSummary.forEach((record) => {
      if (record.status && Array.isArray(record.cptCodes) && record.cptCodes.length > 0) {
        record.cptCodes.forEach((code) => {
          cptCount[code] = (cptCount[code] || 0) + 1;
        });
      }
    });

    return cptCount;
  };

  const cptSummary = countCPTCodes();

  const cptSummaryArray = Object.entries(cptSummary).map(([code, count]) => ({
    cptCode: code,
    count: count,
  }));

  const columns = [
    {
      name: "Invoice No.",
      selector: (row) => row.invoiceNumber,
      sortable: true,
    },
    {
      name: "Status",
      sortable: true,
      cell: (row) => (
        <>
          {row.status === "Billed" || row.status === "Payment Received" ? (
            <div className="active-btn">Billed</div>
          ) : (
            <div className="inactive-btn">Not-Billed</div>
          )}
        </>
      ),
    },
    {
      name: "Billing Month",
      selector: (row) => row?.billing_month,
      cell: (row) => getMonthNameFromBillingMonth(row?.billing_month),
      sortable: true,
    },
    {
      name: "Time Spent",
      selector: (row) => row.totaloveralltime,
      sortable: true,
    },
    {
      name: "CPT Codes",
      selector: (row) =>
        row?.cptCodes?.length ? [...new Set(row?.cptCodes)].join(", ") : "N/A",
      sortable: true,
      cell: (row) => {
        // Count occurrences of each CPT code
        const countOccurrences = (arr) => {
          const counts = {};
          arr.forEach(code => {
            counts[code] = (counts[code] || 0) + 1;
          });
          return counts;
        };

        // Format the counts into "code-count" pairs
        const formatCodes = (codes) => {
          if (!Array.isArray(codes)) return "-";

          const counts = countOccurrences(codes);
          return Object.entries(counts)
            .map(([code, count]) => `${code} (${count})`)
            .join(", ");
        };

        return (
          <div className="d-flex" data-tag="allowRowEvents">
            <div aria-hidden="true">
              {row?.cptCodes ? formatCodes(row?.cptCodes) : "-"}
            </div>
          </div>
        );
      },
      grow: 2
    },
    {
      name: "Action",
      cell: (row) => {
        const normalizedPatient = {
          ...patientData,
          providerName: patientData?.providerName || patientData?.provider,
          Email: patientData?.email || patientData?.Email || '[Patient Email]',
          coach_email_count: row.patient?.coach_email_count || [],
          messageCount: row.patient?.messageCount || 0,
          customize_keys: row.patient?.customize_keys || [],
          created_at: row.patient?.created_at || patientData.createdAt,
          approved_at: row.patient?.approved_at || patientData.approved_at
        };

        return (
          <DownloadPDF
            selectedCPTs={row.cptCodes}
            patient={normalizedPatient}
            firstRecord={{
              ...row,
              totaloveralltime: row.totalTimeSpentSeconds,
              total_monitoring_time: row.totalmonitoringtime || 'N/A',
              totalSyncCalls: row.totalSyncCalls || 0,
              video_duration_minutes: row.video_duration_minutes || 0,
              loginDaysCount: row.loginDaysCount || 0,
              taskDaysUsedFor98977: row.taskDaysUsedFor98977 || 'N/A'
            }}
            btnFlag={true}
          />
        );
      },
    },
  ];

  const handleDateChange = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const formattedMonth = `${year}-${month}`;
      setSelectedTempDate(formattedMonth);
    } else {
      setSelectedTempDate("");
    }
  };

  return (
    <>
      <div className="mb-3">
        <label className="rv-label-newpractice py-2">Date Range</label>
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <div className="mt-2 me-3">
            <DatePicker
              customInput={<BlockKeyboardInput />}
              selected={selectedTempDate}
              onChange={(date) => handleDateChange(date)}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              maxDate={maxMonth}
              className="form-control input-dt shadow"
              placeholderText="Select month"
              isClearable
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="new-container">
          <div className="row g-3">
            {cptSummaryArray.length > 0 ? (
              cptSummaryArray.map((item, index) => (
                <div key={index} className="col-md-3 col-sm-6">
                  <div className="p-3 billing-report-container shadow-8">
                    <div className="">Billed Last Month</div>
                    <div className="pt-1 flex-items-between">
                      <span>
                        <h4 className="fw-bold">{item.count}</h4>
                      </span>
                      <span>CPT Code: {item.cptCode}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">No CPT codes billed last month.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <DataTable
          className="t-body-border"
          columns={columns}
          progressPending={billingSummaryLoading}
          data={
            Array.isArray(billingSummary)
              ? billingSummary.filter((record) => record.status === "Billed" || record.status === "Payment Received")
              : []
          }
          customStyles={customStyles}
          responsive={true}
          sortIcon={<img loading="lazy" src={Sorticon} alt="Sort Icon" />}
        />
      </div>
    </>
  );
};

export default BillingReports;
