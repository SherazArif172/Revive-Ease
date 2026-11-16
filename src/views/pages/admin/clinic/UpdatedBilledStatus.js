import { CModal, CModalBody, CModalTitle } from '@coreui/react';
import { saveAs } from "file-saver";
import JSZip from "jszip";
import React, { useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import BillingFilterCanvas from '../../../../Components/DataTable/BillingFilterCanvas';
import { customStylesBilledStatus } from '../../../../Components/DataTable/CustomStyle';
import { columnBilledStatus } from '../../../../Components/DataTable/commonColumn';
import TextAreaAutosize from '../../../../Components/TextAreaAutosize';
import Filter from "../../../../assets/icons/filter.png";
import Sorticon from "../../../../assets/icons/sort.png";
import {
  useGetBillingReportStatusQuery,
  useUpdatePaymentStatusMutation,
  useUpdateStatusMutation
} from '../../../../redux/apis/billing_api';
import PaginationComponent from '../../../../utils/Pagination';
import { convertLocalDateToUTC, formatDate } from '../../../../utils/dateUtils';
import { generatePDF, generatePDFBuffer } from '../../coach/coachPatients/exportManagement/DownloadPDF';
import PaymentReceivedModal from './PaymentReceivedModal';


const UpdatedBilledStatus = () => {
  const clinicId = useSelector((state) => state?.user?.userData?.clinic_id);
  const billedStatus = useSelector((state) => state?.allBilling?.billingStatus);
  const actorType = useSelector((state) => state?.user?.userType);
  const actorId = useSelector((state) => state?.user?.id);
  const [rowData, setRowData] = useState(null);
  const [changeStatusModal, setChangeStatusModal] = useState(false);
  const [paymentReceivedModal, setPaymentReceivedModal] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cancelRemark, setCancelRemark] = useState("");
  const [page, setPage] = useState(1);
  const [paymentDate, setPaymentDate] = useState(null);
  const [paymentComments, setPaymentComments] = useState("");

  // Filter states
  const [filterVisible, setFilterVisible] = useState(false);
  const [tempFilter, setTempFilter] = useState({
    selectedMonth: null,
    status: ""
  });
  const [appliedFilter, setAppliedFilter] = useState({
    selectedMonth: null,
    status: ""
  });


  // New state for checkbox functionality
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [bulkPaymentModal, setBulkPaymentModal] = useState(false);
  const [bulkPaymentDate, setBulkPaymentDate] = useState(null);
  const [bulkPaymentComments, setBulkPaymentComments] = useState("");
  const [bulkApproveModal, setBulkApproveModal] = useState(false);
  const [bulkCancelModal, setBulkCancelModal] = useState(false);
  const [bulkCancelRemark, setBulkCancelRemark] = useState("");

  const fileInputRef = useRef();

  const rolesDefined = actorType === "clinic admin" ? clinicId : actorType === "admin" ? "all" : null;

  // eslint-disable-next-line no-unused-vars
  const { data, refetch, isLoading: isBilledPatientListLoading } = useGetBillingReportStatusQuery({
    clinic_id: rolesDefined,
    billingPage: page,
    billingLimit: rowsPerPage,
    status: appliedFilter.status,
    billingMonth: appliedFilter.selectedMonth,
  }, { refetchOnMountOrArgChange: true });

  const [updateStatus] = useUpdateStatusMutation();
  const [updatePaymentStatus, {
    isSuccess: paymentSuccess,
    isLoading: paymentUpdateLoading,
  }] = useUpdatePaymentStatusMutation();

  const navigate = useNavigate();

  useEffect(() => {

    if (paymentSuccess) {
      setPaymentReceivedModal(false);
      setBulkPaymentModal(false);
      refetch();
    }
  }, [paymentSuccess]);

  // Handle row selection for checkboxes
  const handleRowSelected = React.useCallback(state => {
    setSelectedRows(state.selectedRows);
  }, []);

  // Function to determine if a row should be disabled for selection
  const isRowSelectable = (row) => {
    // Return true if the row should be disabled:
    // 1. If status is not "Pending" (for approve flow)
    // 2. If status is "Billed" and has payment_received_date (for payment flow)
    return (row.status !== "Pending" && row.status !== "Billed") ||
      (row.status === "Billed" && row.payment_received_date);
  };

  // Function to check if payment receive button should be enabled
  const isPaymentReceiveEnabled = () => {
    // Enable only if all selected rows have "Billed" status
    return selectedRows.length > 0 && selectedRows.every(row => row.status === "Billed");
  };

  // Function to check if approve button should be enabled
  const isApproveEnabled = () => {
    // Enable only if all selected rows have "Pending" status
    return selectedRows.length > 0 && selectedRows.every(row => row.status === "Pending");
  };

  // Function to check if cancel button should be enabled
  const isCancelEnabled = () => {
    // Enable only if all selected rows have "Pending" status
    return selectedRows.length > 0 && selectedRows.every(row => row.status === "Pending");
  };

  // Handle bulk approve (Move to Billed)
  const handleBulkApprove = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one record");
      return;
    }

    // Double check that all selected rows are in "Pending" status
    if (!selectedRows.every(row => row.status === "Pending")) {
      toast.error("Only records with Pending status can be approved");
      return;
    }

    setBulkApproveModal(true);
  };


  // Handle confirmed bulk approve
  const handleConfirmedBulkApprove = async () => {


    try {
      const payload = {
        status: "Billed",
        billing_id: selectedRows.map((row) => row._id),
        actorId: actorId,
        actorType: actorType,
      };
      await updateStatus(payload);

      setSelectedRows([]);
      setToggleCleared(!toggleCleared);
      setBulkApproveModal(false);
      refetch();
    } catch (error) {
      toast.error(error?.error?.data?.message || "Failed to update some records");
    }
  };

  // Handle bulk payment receive
  const handleBulkPaymentReceive = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one record");
      return;
    }
    setBulkPaymentModal(true);
  };

  // Handle bulk payment submission
  const handleBulkPaymentSubmit = async () => {
    if (!bulkPaymentDate) {
      toast.error("Payment date is required");
      return;
    }
    const invalidRows = selectedRows.filter((row) => {
      const billingCreatedAt = new Date(row.billed_at);
      const selectedDate = new Date(bulkPaymentDate);

      const billingDateOnly = new Date(
        billingCreatedAt.getFullYear(),
        billingCreatedAt.getMonth(),
        billingCreatedAt.getDate()
      );
      const selectedDateOnly = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );

      return selectedDateOnly < billingDateOnly;
    });

    if (invalidRows.length > 0) {
      toast.error("Payment date cannot precede billing date.");
      return;
    }

    try {
      // Convert local date to UTC for backend (date-only, no time)
      const utcDateString = convertLocalDateToUTC(bulkPaymentDate, false);
      
      if (!utcDateString) {
        toast.error("Invalid payment date selected.");
        return;
      }
      
      const payload = {
        billing_id: selectedRows.map((row) => row._id),
        payment_received_date: utcDateString, // UTC ISO string
        payment_comments: bulkPaymentComments || null,
        actorId: actorId,
        actorType: actorType,
      };
      await updatePaymentStatus(payload).unwrap();

      setBulkPaymentModal(false);
      setBulkPaymentDate(null);
      setBulkPaymentComments("");
      setSelectedRows([]);
      setToggleCleared(!toggleCleared);
      refetch();
    } catch (error) {
      toast.error("Failed to update payment details for some records");
    }
  };

  // Handle bulk cancel
  const handleBulkCancel = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one record");
      return;
    }

    // Double check that all selected rows are in "Pending" status
    if (!selectedRows.every(row => row.status === "Pending")) {
      toast.error("Only records with Pending status can be cancelled");
      return;
    }

    setBulkCancelModal(true);
  };

  // Handle confirmed bulk cancel
  const handleConfirmedBulkCancel = async () => {
    if (!bulkCancelRemark) {
      toast.error("Cancellation remark is required");
      return;
    }

    try {
      const payload = {
        status: "Cancelled",
        billing_id: selectedRows.map((row) => row._id),
        cancellation_remark: bulkCancelRemark,
        actorId: actorId,
        actorType: actorType,
      };
      await updateStatus(payload);

      setBulkCancelModal(false);
      setBulkCancelRemark("");
      setSelectedRows([]);
      setToggleCleared(!toggleCleared);
      refetch();
    } catch (error) {
      toast.error(error?.error?.data?.message || "Failed to cancel some records");
    }
  };

  const onConfirm = () => {
    let payload = {
      status: rowData?.status === "MoveToBilled" ? "Billed" : "Cancelled",
      billing_id: [rowData?.row?._id],
      actorId: actorId,
      actorType: actorType,
    };

    if (rowData?.status === "Cancelled") {
      if (!cancelRemark) {
        toast.error("Cancellation remark is required");
        return;
      }
      payload.cancellation_remark = cancelRemark;
    }

    updateStatus(payload);
    setChangeStatusModal(false);
  };

  const handlePaymentReceived = async () => {
    if (!paymentDate) {
      return;
    }

    try {
      // Convert local date to UTC for backend (date-only, no time)
      const utcDateString = convertLocalDateToUTC(paymentDate, false);
      
      if (!utcDateString) {
        toast.error("Invalid payment date selected.");
        return;
      }
      
      const payload = {
        billing_id: [rowData?._id],
        payment_received_date: utcDateString, // UTC ISO string
        payment_comments: paymentComments || null,
        actorId: actorId,
        actorType: actorType,
      };

      await updatePaymentStatus(payload).unwrap();
    } catch (error) {
      toast.error(error.data?.message || "Failed to update payment details");
    }
  };

  const navigateUserDetail = (row) => {
    navigate("/bill-status", { state: row });
  };


  const handleBulkPDFDownload = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one record to download");
      return;
    }

    const zip = new JSZip();

    for (const row of selectedRows) {
      const normalizedPatient = {
        ...row.patient,
        providerName: row.patient?.providerName || row.patient?.provider,
        Email: row.patient?.email || row.patient?.Email || '[Patient Email]',
        coach_email_count: row.patient?.coach_email_count || [],
        messageCount: row.patient?.messageCount || 0,
        customize_keys: row.patient?.customize_keys || [],
        created_at: row.patient?.created_at || row.patient?.createdAt,
        approved_at: row.patient?.approved_at || row.patient?.approved_at
      };
      const pdfBuffer = generatePDFBuffer({
        selectedCPTs: row.cptCodes,
        patient: normalizedPatient,
        firstRecord: {
          ...row,
          uniqueDays: row.uniqueDays || 'N/A',
          // Use totaloveralltime from API (already in minutes if provided),
          // fall back to totalTimeSpentSeconds to avoid breaking older data.
          totaloveralltime: row.totaloveralltime ?? row.totalTimeSpentSeconds,
          total_monitoring_time: row.totalmonitoringtime || 'N/A',
          totalSyncCalls: row.totalSyncCalls || 0,
          video_duration_minutes: row.video_duration_minutes || 0,
          loginDaysCount: row.loginDaysCount || 0,
          billing_comments: row.billing_comments || 'N/A',
        }
      });
      const patientName = normalizedPatient?.first_name || "Patient";
      const invoiceNumber = row.invoiceNumber || row._id || `Report_${Date.now()}`;
      const fileName = `${patientName}_${invoiceNumber}_Report.pdf`;
      zip.file(fileName, pdfBuffer);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `BillingReports_${formatDate(new Date(), "MM-dd-yyyy")}.zip`);
  };

  const column = columnBilledStatus({
    setChangeStatusModal,
    setRowData,
    setPaymentReceivedModal,
    navigateUserDetail,
    handleDownloadPDF: (row) => {
      const normalizedPatient = {
        ...row.patient,
        providerName: row.patient?.providerName || row.patient?.provider,
        Email: row.patient?.email || row.patient?.Email || '[Patient Email]',
        coach_email_count: row.patient?.coach_email_count || [],
        messageCount: row.patient?.messageCount || 0,
        customize_keys: row.patient?.customize_keys || [],
        created_at: row.patient?.created_at || row.patient.createdAt,
        approved_at: row.patient?.approved_at || row.patient.approved_at
      };
      return (
        <button
          className="btn download-pdf fw-bold mx-2"
          onClick={() => generatePDF({
            selectedCPTs: row.cptCodes,
            patient: normalizedPatient,
            firstRecord: {
              ...row,
              // Use totaloveralltime from API (already in minutes if provided),
              // fall back to totalTimeSpentSeconds to avoid breaking older data.
              totaloveralltime: row.totaloveralltime ?? row.totalTimeSpentSeconds,
              total_monitoring_time: row.totalmonitoringtime || 'N/A',
              totalSyncCalls: row.totalSyncCalls || 0,
              video_duration_minutes: row.video_duration_minutes || 0,
              loginDaysCount: row.loginDaysCount || 0,
              taskDaysUsedFor98977: row.taskDaysUsedFor98977 || 'N/A',
              billing_comments: row.billing_comments || 'N/A',
            }
          })}
          disabled={!row.cptCodes || row.cptCodes.length === 0}
        >
          Download as PDF
        </button>
      );
    }
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Filter handler functions
  const handleDateChange = (name, date) => {
    setTempFilter(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleStatusChange = (status) => {
    setTempFilter(prev => ({
      ...prev,
      status: status
    }));
  };

  const handleApplyFilter = () => {
    setAppliedFilter(tempFilter);
    setPage(1); // Reset to first page when applying filters
    // No need to call refetch() here as the query will automatically refetch when appliedFilter changes
  };

  const handleClearFilter = () => {
    setTempFilter({
      selectedMonth: null,
      status: ""
    });
    setAppliedFilter({
      selectedMonth: null,
      status: ""
    });
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    // You can handle the selected files here (e.g., upload, preview, etc.)
    console.log('Selected files:', files);
  };

  return (
    <>
      <div className="d-flex justify-content-between mt-4">
        <div className="font-color">
          <h6>
            <strong>Billing Reports</strong>
          </h6>
        </div>
        <div className="me-3 mb-2 d-flex align-items-center">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.doc,.docx,.csv,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*"
            onChange={handleFileChange}
          />
          <button
            className="btn filter-btn d-flex align-items-center"
            onClick={() => setFilterVisible(true)}
          >
            <img loading="lazy" src={Filter} height={14} width={12.26} alt="filter" />
            <span className="ms-2">Filters</span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        <DataTable
          columns={column}
          data={billedStatus?.billingRecords}
          customStyles={customStylesBilledStatus}
          responsive={true}
          sortIcon={<img loading="lazy" src={Sorticon} alt="sort" />}
          selectableRows
          onSelectedRowsChange={handleRowSelected}
          clearSelectedRows={toggleCleared}
          highlightOnHover
          selectableRowsDisabled={isRowSelectable}
          progressPending={isBilledPatientListLoading}
        />

        {actorType !== "clinic admin" && (
          <>
            {/* Bulk Approve Confirmation Modal */}
            <CModal
              alignment="center"
              visible={bulkApproveModal}
              onClose={() => setBulkApproveModal(false)}
            >
              <div className="d-flex justify-content-center CModalHeader">
                <CModalTitle className="text-white">
                  Submit Bills
                </CModalTitle>
              </div>
              <CModalBody className="main-modal-body">
                <div>
                  <div className="content-modal">
                    {`Do you want to submit ${selectedRows.length} bill(s)?`}
                  </div>

                  <div className="d-flex justify-content-center col-md-12 mt-3">
                    <button
                      className="modal-close"
                      onClick={() => setBulkApproveModal(false)}
                    >
                      Close
                    </button>
                    <button
                      className="modal-assign ms-3"
                      onClick={handleConfirmedBulkApprove}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </CModalBody>
            </CModal>
          </>
        )}

        {/* Bulk Cancel Confirmation Modal */}
        <CModal
          alignment="center"
          visible={bulkCancelModal}
          onClose={() => setBulkCancelModal(false)}
        >
          <div className="d-flex justify-content-center CModalHeader">
            <CModalTitle className="text-white">
              Cancel Bills
            </CModalTitle>
          </div>
          <CModalBody className="main-modal-body">
            <div>
              <div className="content-modal">
                {`Do you want to cancel ${selectedRows.length} bill(s)?`}
              </div>

              <div className="my-4">
                <TextAreaAutosize
                  className="form-control form-control-input shadow border-0 mt-3"
                  placeholder="Cancellation remarks *"
                  value={bulkCancelRemark}
                  onChange={(e) => setBulkCancelRemark(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-center col-md-12 mt-3">
                <button
                  className="modal-close"
                  onClick={() => setBulkCancelModal(false)}
                >
                  Close
                </button>
                <button
                  className="modal-assign ms-3"
                  onClick={handleConfirmedBulkCancel}
                >
                  Submit
                </button>
              </div>
            </div>
          </CModalBody>
        </CModal>

        <PaginationComponent
          totalRecords={billedStatus?.totalBilling}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
        />

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <button
            className={`btn add-practs-btn fw-bold mx-2`}
            disabled={selectedRows.length === 0}
            onClick={handleBulkPDFDownload}
          >
            Download PDF ({selectedRows.length})
          </button>
          {actorType !== "clinic admin" && (
            <>
              <button
                className="btn-bg-cancel-color"
                disabled={!isCancelEnabled()}
                onClick={handleBulkCancel}

              >
                Cancel Bill ({selectedRows.length})
              </button>
              <button
                className="btn-bg-green-color"
                disabled={!isApproveEnabled()}
                onClick={handleBulkApprove}
              >
                Approve ({selectedRows.length})
              </button>
            </>
          )}
          <button
            className="btn-bg-orange-color"
            disabled={!isPaymentReceiveEnabled()}
            onClick={handleBulkPaymentReceive}
          >
            Payment Received ({selectedRows.length})
          </button>
        </div>

        {/* Billed/Cancelled Status Modal */}
        <CModal
          alignment="center"
          visible={changeStatusModal}
          onClose={() => setChangeStatusModal(false)}
        >
          <div className="d-flex justify-content-center CModalHeader">
            <CModalTitle className="text-white">
              {rowData?.status === "MoveToBilled" ? "Submit Bill" : "Cancel Bill"}
            </CModalTitle>
          </div>
          <CModalBody className="main-modal-body">
            <div>
              <div className="content-modal">
                {`Do you want to ${rowData?.status === "MoveToBilled" ? "submit" : "cancel"} the Bill?`}
              </div>

              {rowData?.status === "Cancelled" && (
                <div className="my-4">
                  <TextAreaAutosize
                    className="form-control form-control-input shadow border-0 mt-3"
                    placeholder="Cancellation remarks *"
                    onChange={(e) => setCancelRemark(e.target.value)}
                  />
                </div>
              )}

              <div className="d-flex justify-content-center col-md-12 mt-3">
                <button
                  className="modal-close"
                  onClick={() => setChangeStatusModal(false)}
                >
                  Close
                </button>
                <button
                  className="modal-assign ms-3"
                  onClick={onConfirm}
                >
                  {rowData?.status === "MoveToBilled" ? "Submit" : "Cancel"}
                </button>
              </div>
            </div>
          </CModalBody>
        </CModal>

        {/* Individual Payment Received Modal */}
        <PaymentReceivedModal
          visible={paymentReceivedModal}
          onClose={() => {
            setPaymentReceivedModal(false);
            setPaymentDate(null);
            setPaymentComments("");
          }}
          onSubmit={handlePaymentReceived}
          isLoading={paymentUpdateLoading}
          paymentDate={paymentDate}
          setPaymentDate={setPaymentDate}
          paymentComments={paymentComments}
          setPaymentComments={setPaymentComments}
        />

        {/* Bulk Payment Received Modal */}
        <PaymentReceivedModal
          visible={bulkPaymentModal}
          onClose={() => {
            setBulkPaymentModal(false);
            setBulkPaymentDate(null);
            setBulkPaymentComments("");
          }}
          onSubmit={handleBulkPaymentSubmit}
          isLoading={paymentUpdateLoading}
          paymentDate={bulkPaymentDate}
          setPaymentDate={setBulkPaymentDate}
          paymentComments={bulkPaymentComments}
          setPaymentComments={setBulkPaymentComments}
          title={`Payment Receive for ${selectedRows.length} Record(s)`}
        />
      </div>


      <BillingFilterCanvas
        visible={filterVisible}
        setVisible={setFilterVisible}
        handleApplyFilter={handleApplyFilter}
        handleDateChange={handleDateChange}
        handleStatusChange={handleStatusChange}
        tempFilter={tempFilter}
        handleClear={handleClearFilter}
        onclose={() => setFilterVisible(false)}
        appliedFilter={appliedFilter}
      />
    </>
  );
};

export default UpdatedBilledStatus;
