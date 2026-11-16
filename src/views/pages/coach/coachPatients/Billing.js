import {
  CCloseButton,
  CModal,
  CModalBody,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Dateicon from "../../../../assets/icons/calendar-new.png";
import Sorticon from "../../../../assets/icons/sort.png";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetBillingAssignedCptQuery } from "../../../../redux/apis/billing_api";
import { formatDate ,formatDateOnly } from "../../../../utils/dateUtils";
import { customStylesBillingWithCpt } from "../../../../Components/DataTable/CustomStyle";
import Edit from "../../../../assets/icons/edit.png";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";
import ConfirmPopup from "../../../../Components/Modal/ConfirmPopup";
import { toast } from "react-toastify";

const Billing = ({ patientId, showViewOnly, coachIfExist }) => {
  const isCallLogAdd = useSelector((state) => state?.allBilling?.addCallLog);
  const pauseTimer = useSelector((state) => state?.allCoach?.isPausePlay);
  const coach_id = useSelector((state) => state?.user?.id);
  const userType = useSelector((state) => state?.user?.userType);
  const passCoachId = coachIfExist ? coachIfExist : coach_id;
  const canEditBill = userType === "coach";
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [timerPauseModal, setTimerPauseModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [startDate, setStartDate] = useState(null);
  const [payloadStartDate, setPayloadStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [payloadEndDate, setPayloadEndDate] = useState(null);
  // Ready for Billing flow: select Pending rows -> Ready for Billing -> confirm -> success
  const [selectedBills, setSelectedBills] = useState([]);
  const [clearSelection, setClearSelection] = useState(false);
  const [readyStep, setReadyStep] = useState(null); // null | "confirm" | "success"
  const [readyIds, setReadyIds] = useState([]); // rows marked in this session

  // Build query object conditionally
  const queryParams = {
    patient_id: patientId, 
    coach_id: passCoachId
  };
  
  if (payloadStartDate) {
    queryParams.startDate = formatDate(payloadStartDate, "yyyy-MM-dd");
  }
  
  if (payloadEndDate) {
    queryParams.endDate = formatDate(payloadEndDate, "yyyy-MM-dd");
  }

  // eslint-disable-next-line no-unused-vars
  const { data: billData, refetch, isLoading } = useGetBillingAssignedCptQuery(queryParams, { refetchOnMountOrArgChange: true });
  const billingData = useSelector((state) => state?.allBilling?.allCallLogs);
  useEffect(() => {
    if (patientId) {
      refetch();
    }
  }, [patientId, refetch]);

  useEffect(() => {
    if (pauseTimer === false || isCallLogAdd === true) {
      const timer = setTimeout(() => {
        refetch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pauseTimer, isCallLogAdd, refetch]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    if (!start && !end) {
      setPayloadStartDate(null);
      setPayloadEndDate(null);
      setStartDate(null);
      setEndDate(null);
    } else {
      setStartDate(start);
      setEndDate(end);
    }
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours} hr ${minutes} min ${seconds} sec`;
  };

  const columns = [
    {
      name: "Billing ID",
      selector: (row) => row?.invoiceNumber || "Unbilled",
      cell: (row) => {
        const isUnbilled = !row?.invoiceNumber;
        return (
          <div
            className={`d-flex align-items-center gap-2 ${isUnbilled ? '' : 'reset-password'}`}
            onClick={isUnbilled ? undefined : (e) => navigateUserDetail(e, row)}
            style={{
              cursor: isUnbilled ? 'default' : 'pointer'
            }}
          >
            <span className={`status-dot ${getStatusColor(row?.status)}`}></span>
            {row?.invoiceNumber || "Unbilled"}
          </div>
        );
      },
      sortable: true,
      grow: 2,
    },
    { name: "Start Date", selector: (row) => formatDateOnly(row?.monitoringStartDate, "MM/dd/yyyy"), sortable: true },
    { name: "Monitoring", selector: (row) => formatTime(row.total_monitoring_time), sortable: true, width: " 140px" },
    { name: "Calling", selector: (row) => formatTime(row.total_calling_time), sortable: true, width: " 140px" },
    { name: "Additional Resources", selector: (row) => formatTime(row?.total_additional_time), sortable: true, width: " 140px" },
    { name: "Total Hours", selector: (row) => formatTime(row.total_calling_time + row.total_monitoring_time + row?.total_additional_time), sortable: true, width: " 140px" },
    {
      name: "CPT Assigned",
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
      name: "Status",
      selector: (row) => row?.status,
      cell: (row) => <span title={row?.status}>{row?.status}</span>,
      sortable: true,
      wrap: true,
      minWidth: "160px"
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "dot-pending";
      case "Ready to Bill":
        return "dot-success";
      case "Billed":
        return "dot-primary";
        case "Payment Received":
          return "dot-primary";
      case "Cancelled":
        return "dot-danger";
      default:
        return "dot-default";
    }
  };

  const handleNavigate = (e) => {
    e.preventDefault();
    if (pauseTimer === true) {
      setTimerPauseModal(true);
    }
    else {
      navigate("/createBilling", { state: patientId });
      setTimerPauseModal(false);
    }
  };

  const navigateUserDetail = (e, row) => {
    e.preventDefault();
    navigate("/bill-status", {
      state: {
        ...row,
        coachModule: true
      }
    });
    setTimerPauseModal(false);
  };

  const handleEditClick = (data) => {
    navigate("/edit-billing", { state: data?._id });
  };

  const handleDateSearch = () => {
    setPayloadStartDate(startDate);
    setPayloadEndDate(endDate);
  };

  const onCloseModal = () => {
    setTimerPauseModal(false);
  };

  const billingRows = (billingData?.billingList || []).map((row) =>
    readyIds.includes(row?._id) ? { ...row, status: "Ready to Bill" } : row
  );

  const handleReadyClick = () => {
    if (!selectedBills.length) {
      toast.info("Select at least one pending billing.");
      return;
    }
    setReadyStep("confirm");
  };

  const handleReadyConfirm = () => {
    setReadyIds((prev) => [...new Set([...prev, ...selectedBills.map((b) => b?._id)])]);
    setReadyStep("success");
  };

  const handleReadyClose = () => {
    setReadyStep(null);
    setSelectedBills([]);
    setClearSelection((v) => !v);
  };

  const filteredData = billingRows.filter((session) => {
    if (selectedStatus === "All") return true;
    if (selectedStatus === "BilledOrPayment") {
      return session?.status === "Billed" || session?.status === "Payment Received";
    }
    return session?.status === selectedStatus;
  });

  return (
    <>
      <div className="default-container ps-3 mt-3 bg-white">
        <div className="d-flex flex-column col p-3 border-0">
          {/* Status Tabs */}
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-sm fw-bold px-3 font-color"
              style={selectedStatus === "All" ? { backgroundColor: "#D9ECDB" } : null}
              onClick={() => setSelectedStatus("All")}
            >
              All
            </button>
            <div
              className="btn btn-sm fw-bold px-3 font-color"
              onClick={() => setSelectedStatus("Pending")}
              style={selectedStatus === "Pending" ? { backgroundColor: "#D9ECDB" } : null}
            >
              <span className="dot dot-pending"></span> Pending
            </div>
            <div
              className="btn btn-sm fw-bold px-3 font-color"
              onClick={() => setSelectedStatus("Ready to Bill")}
              style={selectedStatus === "Ready to Bill" ? { backgroundColor: "#D9ECDB" } : null}
            >
              <span className="dot dot-success"></span> Ready to Bill
            </div>
            <div
              className="btn btn-sm fw-bold px-3 font-color"
              onClick={() => setSelectedStatus("BilledOrPayment")}
              style={selectedStatus === "BilledOrPayment" ? { backgroundColor: "#D9ECDB" } : null}
            >
              <span className="dot dot-primary"></span> Billed & Payment Received
            </div>
            <div
              className="btn btn-sm fw-bold px-3 font-color"
              onClick={() => setSelectedStatus("Cancelled")}
              style={selectedStatus === "Cancelled" ? { backgroundColor: "#D9ECDB" } : null}
            >
              <span className="dot dot-danger"></span> Cancelled
            </div>
          </div>
          {!showViewOnly && (
            <div className="row">
              <div className="col d-flex justify-content-end gap-2">
                {canEditBill && (
                  <button
                    className="btn add-practice w-auto px-4"
                    onClick={handleReadyClick}
                  >
                    Ready for Billing
                  </button>
                )}
                <button
                  className="btn add-practice w-auto px-5 "
                  onClick={handleNavigate}
                >
                  Create Billing
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="rv-label-newpractice py-2">Date Range</label>
          </div>
          <div className="d-flex col-4 form-group has-search-right mt-0">
            <DatePicker
              customInput={<BlockKeyboardInput />}
              className="form-control input-dt"
              placeholderText="Select Date Range"
              dateFormat="MM/dd/yyyy"
              selectsRange
              maxDate={new Date()}
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              isClearable
            />
            <div className="ms-2 mt-0">
              <button
                className="border-0 add-practice"
                style={{
                  height: "45px"
                }}
                onClick={handleDateSearch}
              > <b>
                  Search </b>
              </button>
            </div>
          </div>
        </div>
        <div>
          <DataTable
            className="custom-data-table-billing"
            columns={columns}
            data={filteredData}
            customStyles={customStylesBillingWithCpt}
            progressPending={isLoading}
            responsive={true}
            sortIcon={<img loading="lazy" src={Sorticon} />}
            selectableRows={canEditBill && !showViewOnly}
            selectableRowDisabled={(row) => row?.status !== "Pending"}
            onSelectedRowsChange={({ selectedRows }) => setSelectedBills(selectedRows)}
            clearSelectedRows={clearSelection}
            expandableRows
            expandableRowDisabled={(row) => row?.status !== "Cancelled"}  // Only allow expanding for "Cancelled" status
            expandableRowsComponent={({ data }) => {
              // Only show expandable content for Cancelled status
              if (data?.status !== "Cancelled") {
                return null; // Return null to hide the expandable content
              }

              return (
                <div className="mt-2 ms-5 p-2">
                  <p className="text-muted fw-medium mb-0">
                    <div className="d-flex justify-content-between">
                      <div>
                        {data?.cancellation_remark ? (
                          <>
                            <span className="fw-bold text-danger">Cancellation Remark:</span>{" "}
                            {data.cancellation_remark}
                          </>
                        ) : (
                          <span className="text-muted">No cancellation remark available</span>
                        )}
                      </div>
                      {canEditBill && (
                        <div className="pe-5">
                          <button
                            className="btn btn-link"
                            onClick={() => handleEditClick(data)}
                          >
                            <img loading="lazy" src={Edit} alt="Edit" /> Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </p>
                </div>
              );
            }}
          />

        </div>
      </div>
      <COffcanvas
        className="ps-3 pe-3 pt-3 offcanvas_filter"
        backdrop="static"
        placement="end"
        visible={visible}
      >
        <COffcanvasHeader>
          <COffcanvasTitle>Filters</COffcanvasTitle>
          <CCloseButton
            className="text-reset modal-close-cross"
            onClick={() => setVisible(false)}
          />
        </COffcanvasHeader>

        <COffcanvasBody>
          <div>
            <p className="title-register">Registration Date</p>
            <div className="form-group has-search-right">
              <div className="form-control-feedback">
                <img loading="lazy" src={Dateicon} />
              </div>
              <input type="text" className="form-control input-dt" placeholder="From" />
            </div>
          </div>
          <div className="form-group has-search-right mt-4">
            <div className="form-control-feedback">
              <img loading="lazy" src={Dateicon} />
            </div>
            <input type="text" className="form-control input-dt" placeholder="To" />
          </div>
        </COffcanvasBody>
      </COffcanvas>
      <>
        <CModal
          backdrop="static"
          alignment="center"
          visible={timerPauseModal}
          onClose={onCloseModal}
          size="sm"

        >
          <CModalBody className="main-modal-body ">
            <div>
              <p className="text-center roboto fw-bold font-gray mb-3">{"Pause the timer before submitting !"}</p>

              <div className="d-flex justify-content-center col-md-12 ">
                <button className="modal-marked-close  fs-14 bg-white " onClick={onCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </CModalBody>
        </CModal>
      </>
      <ConfirmPopup
        visible={readyStep === "confirm"}
        variant="orange"
        message="Mark the selected Items as ready for billing?"
        onCancel={() => setReadyStep(null)}
        onConfirm={handleReadyConfirm}
      />
      <ConfirmPopup
        visible={readyStep === "success"}
        mode="success"
        variant="orange"
        message="Selected items were successfully marked as ready for billing."
        onCancel={handleReadyClose}
      />
    </>
  );
};

export default Billing;