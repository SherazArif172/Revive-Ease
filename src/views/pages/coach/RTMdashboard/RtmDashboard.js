import React, { useEffect, useState } from "react";
import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import DatePicker from "react-datepicker";
import FilterComponent from "../../../../utils/FilterComponent";
import Qaz from "../../../../assets/icons/Qaz.png";
// import Fill from "../../../../assets/icons/Fill.png";
import userimg from "../../../../assets/icons/User.png";
import { useSelector } from "react-redux";
import {
  useGetAllSessionQuery,
  useGetRTMbillingQuery,
} from "../../../../redux/apis/billing_api";
import { formatDate } from "../../../../utils/dateUtils";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";

const RtmDashboard = () => {


  const [createCanva, setCreateCanva] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const actorType = useSelector((state) => state?.user?.userType);
  // const actorId = useSelector((state) => state?.user?.id);
  const coachId = useSelector((state) => state?.user?.id);
  const rtmData = useSelector((state) => state?.allBilling?.getRTMBilling);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("most_recent");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const patientSessions = useSelector((state) =>
    state?.allBilling?.allSession?.sessions?.length > 0
      ? state.allBilling.allSession?.sessions
      : []
  );

  // eslint-disable-next-line no-unused-vars
  const { data,
    isLoading: loading,
    isError,
    refetch,
  } = useGetRTMbillingQuery(
    {
      coach_id: coachId,
      searchText: searchText,
      sortOption: sortOption,
      fromDate: dateRange?.startDate ? formatDate(dateRange.startDate, "yyyy-MM-dd") : undefined,
      toDate: dateRange?.endDate ? formatDate(dateRange.endDate, "yyyy-MM-dd") : undefined,
    },
    { skip: !coachId }
  );

  // eslint-disable-next-line no-unused-vars
  const { data: allBillingSessions, refetch: allBillingSessionsRefetch } =
    useGetAllSessionQuery(
      {
        patient_id: selectedBilling?.patient_id?._id,
      },
      { skip: !selectedBilling?.patient_id?._id }
    );

  useEffect(() => {
    if (searchText?.length > -1 || dateRange || sortOption.length > -1) {
      refetch();
    }
  }, [searchText, dateRange, sortOption]);

  useEffect(() => {
    if (selectedBilling) {
      allBillingSessionsRefetch();
    }
  }, [selectedBilling]);

  const statusCounts = {
    "Ready to Bill": rtmData?.count?.readyToBill,
    Pending: rtmData?.count?.pending,
    Billed: rtmData?.count?.billed,
  };

  const statusOptions = [
    { label: "Ready to Bill", value: "Ready to Bill", color: "green" },
    { label: "Pending", value: "Pending", color: "#fd7e14" },
    { label: "Billed", value: "Billed", color: "#929292" },
  ];

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  const openDetailsModal = (billing) => {
    setSelectedBilling(billing);
    setCreateCanva(true);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleDateChange = (selectedDateRange) => {
    const [start, end] = selectedDateRange;
    setDateRange({
      startDate: start,
      endDate: end,
    });
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const onClose = () => {
    setCreateCanva(false);
  };

  const capitalizeFirst = (s = "") => {
    return s ? s.charAt(0).toUpperCase() : "";
  };

  return (
    <div>
      <div className="col-12 d-flex flex-column  mb-3 mt-4 gap-3">
        <h5 style={{ color: "green", margin: 0 }}>
          <b>RTM Dashboard</b>
        </h5>
        <div className="w-100 w-md-auto d-flex justify-content-start justify-content-md-end">
          <div
            style={{
              position: "relative",
              display: "inline-block",
              width: "100%",
              maxWidth: "300px",
            }}
          >
            <DatePicker
              customInput={<BlockKeyboardInput />}
              className="form-control input-dt"
              placeholderText="Select Date Range"
              dateFormat="MM/dd/yyyy"
              selectsRange
              startDate={dateRange?.startDate}
              endDate={dateRange?.endDate}
              onChange={handleDateChange}
              maxDate={new Date()}
              isClearable
            />
          </div>
        </div>
      </div>
      <div className="row mb-3 justify-content-center text-left g-2 g-md-3">
        {statusOptions?.map(({ label, value, color }) => (
          <div key={value} className="col-lg-4 col-md-6 col-sm-12 col-12">
            <div className="card card-inverse h-100">
              <div
                className="card-block rounded"
                style={{ backgroundColor: color, minHeight: "5em", height: "auto" }}
              >
                <h6 className="text-white m-2 mb-1" style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}>
                  <b>{label}</b>
                </h6>
                <h1
                  className="display-6 text-white text-end me-2 me-md-4 mb-2"
                  style={{ fontSize: "clamp(18px, 3vw, 20px)" }}
                >
                  <b>{statusCounts[value]}</b>
                </h1>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-3">
        <div className="font-color" />
        <div className="d-flex flex-column flex-sm-row flex-wrap align-items-stretch  w-md-auto gap-2">
          <div className="">
            <FilterComponent
              filterText={searchText}
              onFilter={handleSearch}
              placeholder="Search"
            />
          </div>
          <div className="mb-2 mb-sm-0 position-relative">
            <button
              className="filter-btn d-flex align-items-center"
              onClick={toggleDropdown}
            >
              <span className="me-2">Sortby</span>
              <img loading="lazy" src={Qaz} alt="" height={14} width={14} />
            </button>
            {isDropdownOpen && (
              <div className="custom-dropdown dropdown-menu show position-absolute mt-1" style={{ zIndex: 1000, right: 0 }}>
                <button
                  className="dropdown-item"
                  onClick={() => handleSortChange("most_recent")}
                >
                  Most Recent
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleSortChange("A-Z")}
                >
                  A-Z
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleSortChange("Z-A")}
                >
                  Z-A
                </button>
              </div>
            )}
          </div>
          {/* <div className="me-3 mb-2">
            <button className="btn filter-btn d-flex align-items-center">
              <img loading="lazy" src={Fill} alt="" height={14} width={12.26} />
              <span className="ms-2">Filters</span>
            </button>
          </div> */}
        </div>
      </div>
      <div className="default-container border-gray">
        <div className="row text-left my-2 g-2 g-md-3">
          {loading ? (
            <div className="col-12">
              <p className="noDataFound text-center py-4">Loading...</p>
            </div>
          ) : isError ? (
            <div className="col-12">
              <p className="noDataFound text-center py-4">Error fetching data.</p>
            </div>
          ) : rtmData?.data?.length === 0 ? (
            <div className="col-12">
              <p className="noDataFound text-center py-4">No data found.</p>
            </div>
          ) : (
            rtmData?.data?.map((billing, index) => {
              const statusColor =
                statusOptions?.find((opt) => opt?.value === billing?.status)
                  ?.color || "#e68045";
              const firstName = billing?.patient_id?.first_name ?? "";
              const middleNameRaw = billing?.patient_id?.middle_name ?? "";
              const lastName = billing?.patient_id?.last_name ?? "";
              const middleName =
                middleNameRaw.length > 0
                  ? middleNameRaw.charAt(0).toUpperCase()
                  : "";
              const patientName =
                `${lastName} ${middleName} ${firstName}`.trim();

              return (
                <div
                  key={index}
                  className="col-xl-4 col-lg-6 col-md-6 col-sm-12 col-12"
                  style={{ cursor: "pointer" }}
                  onClick={() => openDetailsModal(billing)}
                >
                  <div
                    className="User-dashboard-card my-2"
                    style={{ borderLeft: `7px solid ${statusColor}` }}
                  >
                    <div className="card-block bg-white shadow rounded p-3 d-flex align-items-center h-100" style={{ minHeight: "65px" }}>
                      <div className="d-flex flex-column flex-md-row w-100 justify-content-between align-items-start align-items-md-center gap-2">
                        <div className="d-flex align-items-center flex-grow-1 min-w-0" style={{ maxWidth: "100%" }}>
                          <span className="pe-2 flex-shrink-0">
                            <img
                              loading="lazy"
                              src={userimg}
                              alt={patientName}
                              className="img-fluid"
                              style={{ height: "18px", width: "auto", maxWidth: "18px" }}
                            />
                          </span>
                          <span className="fw-bold ps-2 text-truncate" style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)", maxWidth: "100%" }}>
                            {patientName}
                          </span>
                        </div>
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-end text-start text-md-end gap-1 gap-md-2 flex-shrink-0">
                          <span style={{ color: "darkgreen", fontSize: "clamp(0.8rem, 1.8vw, 0.95rem)", whiteSpace: "nowrap" }}>
                            {formatTime(billing?.overall_total_time_spent)}
                          </span>
                          <span className="divider d-none d-md-inline" style={{ fontSize: "clamp(0.75rem, 1.6vw, 0.875rem)" }}>
                            <span>
                              {billing.status === "Pending"
                                ? formatDate(
                                  billing.createdAt,
                                  "MM/dd/yyyy"
                                )
                                : billing.status === "Billed"
                                  ? formatDate(
                                    billing.billed_at,
                                    "MM/dd/yyyy"
                                  )
                                  : billing.status === "Ready to Bill"
                                    ? formatDate(
                                      billing.billed_at,
                                      "MM/dd/yyyy"
                                    )
                                    : ""}
                            </span>
                          </span>
                          <span className="d-md-none" style={{ fontSize: "clamp(0.75rem, 1.6vw, 0.875rem)", color: "#777777" }}>
                            {billing.status === "Pending"
                              ? formatDate(
                                billing.createdAt,
                                "MM/dd/yyyy"
                              )
                              : billing.status === "Billed"
                                ? formatDate(
                                  billing.billed_at,
                                  "MM/dd/yyyy"
                                )
                                : billing.status === "Ready to Bill"
                                  ? formatDate(
                                    billing.billed_at,
                                    "MM/dd/yyyy"
                                  )
                                  : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <COffcanvas
        className="ps-3 pe-3 default_offcanvas_add"
        backdrop="static"
        placement="bottom"
        visible={createCanva}
        onHide={() => onClose()}
        style={{ height: "auto" }}
      >
        <COffcanvasHeader>
          <COffcanvasTitle className="pt-4">Billing Details</COffcanvasTitle>
          <CCloseButton
            className="text-reset modal-close-cross"
            onClick={() => setCreateCanva(false)}
          />
        </COffcanvasHeader>

        <COffcanvasBody style={{ overflowX: "hidden" }}>
          {selectedBilling && (
            <div className="container-fluid">
              <div className="mb-3">
                <h6>
                  <b>Patient Name:</b>{" "}
                  {`${selectedBilling?.patient_id?.last_name ?? ""
                    } ${capitalizeFirst(
                      selectedBilling?.patient_id?.middle_name
                    )} ${selectedBilling?.patient_id?.first_name ?? ""}`.trim()}
                </h6>
                {selectedBilling.billing_month ? (
                  <h6>
                    <b>Billing Month:</b>{" "}
                    {formatDate(
                      selectedBilling?.billing_month,
                      "MMMM yyyy"
                    )}
                  </h6>
                ) : null}
                {selectedBilling?.billed_at ? (
                  <h6>
                    <b>Billing On:</b>{" "}
                    {formatDate(selectedBilling?.billed_at, "MMMM yyyy")}
                  </h6>
                ) : null}

                <h6>
                  <b>Status:</b>{" "}
                  <span
                    style={{
                      color: statusOptions?.find(
                        (opt) => opt?.value === selectedBilling?.status
                      )?.color,
                    }}
                  >
                    {selectedBilling?.status}
                  </span>
                </h6>
                {selectedBilling?.status === "Ready to Bill" ? (
                  <>
                    {patientSessions.map((session, index) => (
                      <div className="mt-4" key={index}>
                        <div className="row align-items-end">
                          <div className="col">
                            <p>
                              <b>Monitoring Time:</b>
                            </p>

                            <p>
                              {formatDate(session?.date, "MM/dd/yyyy")}
                            </p>
                          </div>
                          <div className="col">
                            <p>
                              <b>Monitoring Time:</b>
                            </p>
                            <p>{formatTime(session?.total_time)}</p>
                          </div>
                          <div className="col">
                            <p>
                              <b>Calling Time:</b>
                            </p>
                            <p>{formatTime(session?.call_time)}</p>
                          </div>
                          <div className="col">
                            <p>
                              <b>Additional Time:</b>
                            </p>
                            <p>{formatTime(session?.additional_time)}</p>
                          </div>
                          <div className="col">
                            <p>
                              <b>Total Time</b>
                            </p>
                            <p>
                              {Math.floor(session?.total_hours / 60) + " Minutes"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="mt-4">
                    <div className="row">
                      <div className="col">
                        <p>
                          <b>Monitoring Time:</b>
                        </p>
                        <p>
                          {formatTime(selectedBilling?.total_monitoring_time)}
                        </p>
                      </div>
                      <div className="col">
                        <p>
                          <b>Calling Time:</b>
                        </p>
                        <p>{formatTime(selectedBilling?.total_calling_time)}</p>
                      </div>
                      <div className="col">
                        <p>
                          <b>Additional Time:</b>
                        </p>
                        <p>
                          {formatTime(selectedBilling?.total_additional_time)}
                        </p>
                      </div>
                      <div className="col">
                        <p>
                          <b>Total Time</b>
                        </p>
                        <p>
                          {Math.floor(
                            (selectedBilling?.overall_total_time_spent || 0) / 60
                          ) + " Minutes"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </COffcanvasBody>
      </COffcanvas>
    </div>
  );
};

export default RtmDashboard;
