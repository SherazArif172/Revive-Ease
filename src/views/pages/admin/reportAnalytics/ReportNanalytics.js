import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import Filter from "../../../../assets/icons/filter.png";
import Sorticon from "../../../../assets/icons/sort.png";
import YouTube from "../../../../assets/icons/youtube.png";
import customStyles from "../../../../Components/DataTable/CustomStyle";
import ReportFiterCanva from "../../../../Components/DataTable/ReportFiterCanva";
import { useGetClinicQuery } from "../../../../redux/apis/clinic_api";
import { useGetCptSummaryQuery, useGetReportAnalyticsQuery } from "../../../../redux/apis/report_analytics_api";
// import FilterComponent from "../../../../utils/FilterComponent";
import PaginationComponent from "../../../../utils/Pagination";
import { useGetAllCoachQuery } from "../../../../redux/apis/allCoach_api";

const ReportNanalytics = () => {
  // const [filterText, setFilterText] = useState("");
  const [filterCanva, setFilterCanva] = useState(false);
  const [clinicPage, setClinicPage] = useState(1);
  const [clinicLimit, setClinicLimit] = useState(10);
  const [coachPage, setCoachPage] = useState(1);
  const [coachLimit, setCoachLimit] = useState(10);
  const [appliedMonth, setAppliedMonth] = useState(null); // New state for applied month
  const [isFilterLoading, setIsFilterLoading] = useState(false); // Loading state for filter operations
  const [tempFilter, setTempFilter] = useState({
    selectedMonth: null,
    clinic_id: "",
    coachName: "",
    diagnosis: ""
  });
  const [appliedFilter, setAppliedFilter] = useState({
    clinic_id: "",
    coachName: "",
    diagnosis: ""
  });
  const actorId = useSelector((state) => state.user?.id);
  const actorType = useSelector((state) => state.user?.userType);
  // Set default current month in selectedMonth state and appliedMonth
  React.useEffect(() => {
    const currentDate = new Date();
    setTempFilter(prev => ({ ...prev, selectedMonth: currentDate }));
    setAppliedMonth(currentDate); // Set applied month to current month initially
  }, []);


  // Get month for CPT Summary query - use applied month only
  const getFormattedMonth = () => {
    if (appliedMonth) {
      const date = appliedMonth;
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${year}`;
    }
    // Fallback to current month if no applied month
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = currentDate.getFullYear();
    return `${currentMonth}-${currentYear}`;
  };
  
   // Fetch coach and clinic data
   // eslint-disable-next-line no-unused-vars
   const { data : coachListing } = useGetAllCoachQuery();

  // Build filter parameters for APIs
  const getFilterParams = () => {
    const params = {
      clinicPage,
      clinicLimit,
      coachPage,
      coachLimit,
      actorId: actorId,
      actorType: actorType
    };

    // Add filter values if they exist
    if (appliedFilter.clinic_id) {
      params.clinic_id = appliedFilter.clinic_id;
    }
    if (appliedFilter.coachName) {
      params.coachName = appliedFilter.coachName;
    }
    if (appliedFilter.diagnosis) {
      params.diagnosis = appliedFilter.diagnosis;
    }
    return params;
  };

  const getCptSummaryParams = () => {
    const params = { 
      month: getFormattedMonth() ,
      actorId: actorId,
      actorType: actorType
    };

    // Add filter values if they exist
    if (appliedFilter.clinic_id) {
      params.clinic_id = appliedFilter.clinic_id;
    }
    if (appliedFilter.coachName) {
      params.coachName = appliedFilter.coachName;
    }
    if (appliedFilter.diagnosis) {
      params.diagnosis = appliedFilter.diagnosis;
    }

    return params;
  };

  // eslint-disable-next-line no-unused-vars
  const { reportAanaltics , isLoading : clinicLoading , refetch : reportAnalyticsRefetch} = useGetReportAnalyticsQuery(
    getFilterParams(), 
    { refetchOnMountOrArgChange: true }
  );
   // eslint-disable-next-line no-unused-vars
   const { cptSummary, refetch: refetchCptSummary , isLoading : cptLoading } = useGetCptSummaryQuery(
    getCptSummaryParams(), 
    { 
      skip: false, 
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true // Refetch when network reconnects
    }
  );

  // eslint-disable-next-line no-unused-vars
  const { data, refetch: clinicListRefetch, isLoading: isClinicListingLoading } = useGetClinicQuery();





  const reportListData = useSelector(
    (state) => state?.reportNanlticsListing?.reportListing
  );
  const cptSummaryData = useSelector((state) => state?.reportNanlticsListing?.cptSummaryList?.data);
  const mostWatchedVideos = useSelector((state) => state?.reportNanlticsListing?.cptSummaryList?.topWatchedVideos);
  const callStatistics = useSelector((state) => state?.reportNanlticsListing?.cptSummaryList?.callStatistics);
  // patientEngagement
  const patientEngagement = useSelector((state) => state?.reportNanlticsListing?.cptSummaryList?.patientEngagement);

  // Clinic pagination handlers
  const handleClinicChangePage = (event, newPage) => {
    setClinicPage(newPage + 1); // MUI pagination is 0-based, but API expects 1-based
  };

  const handleClinicChangeRowsPerPage = (event) => {
    setClinicLimit(parseInt(event.target.value, 10));
    setClinicPage(1); // Reset to first page when changing rows per page
  };

  // Coach pagination handlers
  const handleCoachChangePage = (event, newPage) => {
    setCoachPage(newPage + 1); // MUI pagination is 0-based, but API expects 1-based
  };

  const handleCoachChangeRowsPerPage = (event) => {
    setCoachLimit(parseInt(event.target.value, 10));
    setCoachPage(1); // Reset to first page when changing rows per page
  };

  // Sample data - replace with actual API data
  // const totalPatientsData = [
  //   { cptCode: "98775", pending: 5, billed: 75 },
  //   { cptCode: "98977", pending: 3, billed: 65 },
  //   { cptCode: "98980", pending: 5, billed: 345 },
  //   { cptCode: "98981", pending: 99, billed: 50 },
  // ];

  const transformedData = cptSummaryData && cptSummaryData.map(item => {
    const pendingObj = item.counts.find(count => count.status === "Pending");
    const billedObj = item.counts.find(count => count.status === "Billed" || count.status === "Payment Received");

    return {
      cptCode: item.cptCode,
      pending: pendingObj ? pendingObj.count : 0,
      billed: billedObj ? billedObj.count : 0
    };
  });

  // Transform patientEngagement data for UI display
  const patientEngagementData = patientEngagement ? [
    {
      metric: "Total Logins",
      value: patientEngagement.totalLogins || 0,
      color: "#17a2b8"
    },
    {
      metric: "Total Minutes Watched (mins)",
      value: Math.round((patientEngagement.totalVideoWatchDuration || 0) / 60),
      color: "#fd7e14"
    },
    {
      metric: "Average Time Video Watched (mins)",
      value: patientEngagement.totalVideosWatched || 0,
      color: "#28a745"
    },
    {
      metric: "Total Videos Watched (Per Patient)",
      value: Math.round(patientEngagement.averageVideosWatchedPerWatchingPatient) || 0,
      color: "#28a745",
    },
  ] : [];


  // const mostWatchedVideos = [
  //   { rank: 1, title: "Relaxing Video-Mp4", views: 60, color: "#17a2b8" },
  //   { rank: 2, title: "2-4-8 Calming Video-Mp4", views: 300, color: "#17a2b8" },
  //   { rank: 3, title: "Daily Stretching-Mp4", views: 5, color: "#28a745" },
  //   { rank: 4, title: "Daily Stretching-Mp4", views: 5, color: "#17a2b8" },
  //   { rank: 5, title: "Daily Stretching-Mp4", views: 5, color: "#17a2b8" },
  // ];

  const totalPatientsColumns = [
    {
      name: "CPT Code",
      selector: (row) => row.cptCode,
      sortable: true,
      width: "33%",
    },
    {
      name: "Pending Billing",
      selector: (row) => row.pending,
      sortable: true,
      width: "33%",
    },
    {
      name: "Billed",
      selector: (row) => row.billed,
      sortable: true,
      width: "34%",
    },
  ];

  const clinicColumns = [
    {
      name: "Clinic",
      selector: (row) => row.clinic_name,
      sortable: true,
      width: "33%",
    },
    {
      name: "Provider",
      selector: (row) => {
        return `${row?.provider?.name === "No Provider Assigned" ? "-" : row?.provider?.name}`;
      },

      sortable: true,
      width: "33%",
    },
    {
      name: "Total Patients",
      selector: (row) => row.patient_count,
      sortable: true,
      width: "34%",
    },
  ];

  const coachColumns = [
    {
      name: "Coach",
      selector: (row) => row.coach_name,
      sortable: true,
      width: "50%",
    },
    {
      name: "Total Patients",
      selector: (row) => row.patient_count,
      sortable: true,
      width: "50%",
    },
  ];

  const onClose = () => {
    setFilterCanva(false);
  };

  const handleDateChange = (date) => {
    setTempFilter(prev => ({ ...prev, selectedMonth: date }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempFilter(prev => ({ ...prev, [name]: value }));
  };


  const handleApplyFilter = () => {
    // Apply filter logic here

    // Set loading state
    setIsFilterLoading(true);

    // Update appliedMonth if a month is selected
    if (tempFilter.selectedMonth) {
      setAppliedMonth(tempFilter.selectedMonth);
    }

    // Update applied filters
    const newAppliedFilter = {
      clinic_id: tempFilter.clinic_id,
      coachName: tempFilter.coachName,
      diagnosis: tempFilter.diagnosis
    };
    
    setAppliedFilter(newAppliedFilter);
    
    // Use setTimeout to ensure state is updated before refetching
    setTimeout(() => {
      // Refetch APIs and handle loading state
      Promise.all([
        reportAnalyticsRefetch(),
        refetchCptSummary()
      ]).finally(() => {
        setIsFilterLoading(false);
      });
    }, 100);
  };

  const handleClear = () => {
    const currentDate = new Date();
    setTempFilter({
      selectedMonth: currentDate,
      clinic_id: "",
      coachName: "",
      diagnosis: ""
    });
    setAppliedMonth(currentDate); // Reset applied month to current month
    
    // Reset applied filters
    setAppliedFilter({
      clinic_id: "",
      coachName: "",
      diagnosis: ""
    });

    // Set loading state
    setIsFilterLoading(true);

    // Use setTimeout to ensure state is updated before refetching
    setTimeout(() => {
      Promise.all([
        reportAnalyticsRefetch(),
        refetchCptSummary()
      ]).finally(() => {
        setIsFilterLoading(false);
      });
    }, 100);
  };

  return (
    <>
      <div className="main-container mt-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center ">
          <div className="my-3 fs-18">
            <strong>Reports & Analytics</strong>
          </div>
          <div className="d-flex align-items-center">
            {/* <div className="me-3">
              <FilterComponent
                placeholder="Search"
                onFilter={(e) => setFilterText(e.target.value)}
                filterText={filterText}
              />
            </div> */}
            <button
              className="btn filter-btn d-flex align-items-center"
              onClick={() => setFilterCanva(true)}
            >
              <img
                loading="lazy"
                src={Filter}
                height={14}
                width={12.26}
                alt="Filter Icon"
              />
              <span className="ms-2">Filters</span>
            </button>
          </div>
        </div>

        {/* Total Patients Section */}

        <div className="my-2">
          <DataTable
            columns={totalPatientsColumns}
            data={transformedData || []}
            customStyles={customStyles}
            progressPending={cptLoading || isFilterLoading}
            responsive

            sortIcon={<img loading="lazy" src={Sorticon} />}
          />
        </div>

        {/* Patient Engagement Section */}

        <div className="default-container ps-3 mt-3 bg-white">
          <div className=" my-3 fs-18">
            <strong>Patient Engagement</strong>
          </div>
          {(cptLoading || isFilterLoading) ? (
            <div className="text-center fs-18 py-4">Loading...</div>
          ) : patientEngagementData?.length > 0 ? (
            <div className="row">
              {patientEngagementData.map((item, index) => (
                <div key={index} className="col-md-4">
                  <div
                    className="User-dashboard-card my-2"
                    style={{ borderLeft: `7px solid #e68045` }}
                  >
                    <div className="card-block bg-white shadow rounded p-3 d-flex align-items-center h-100">
                      <div className="d-flex w-100 flex-items-between">
                        <div className="fw-bold ps-2">{item.metric}</div>
                        <div className="fw-bold ps-2 font-color">
                          {item?.value}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center fs-18 py-4">No patient engagement data available</div>
          )}
        </div>

        <div className="default-container ps-3 mt-3 bg-white">
          <div className="d-flex justify-content-between align-items-center my-3">
            <div className="fs-18">
              <strong>Most Watched Video (Top 5)</strong>
            </div>

          </div>
          {(cptLoading || isFilterLoading) ? (
            <div className="text-center fs-18 py-4">Loading...</div>
          ) : mostWatchedVideos?.length > 0 ? (
            <div className="row">
              {mostWatchedVideos.map((item) => (
                <div className="col-md-4">
                  <div
                    className="User-dashboard-card rounded my-2"
                    style={{ border: `1px solid #027FA3` }}
                  >
                    <div className="card-block bg-white shadow rounded p-3 d-flex align-items-center h-100">
                      <div className="d-flex w-100 flex-items-between">
                        <div className="">
                          <img
                            loading="lazy"
                            src={YouTube}
                            height={24}
                            width={26}
                            alt="YouTube Icon"
                          />

                          <span className="fw-bold px-2"> {item.title}</span>
                        </div>
                        <div className="fw-bold ps-2 font-color">
                          {item?.watchCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center fs-18">No Data Found</div>
          )}

        </div>

        {/* More Info Section */}
        <div className="ps-3 my-3 fs-18">
          <strong>More Info</strong>
        </div>
        <div className="default-container ps-3 mt-3 bg-white">
          {(cptLoading || isFilterLoading) ? (
            <div className="text-center fs-18 py-4">Loading...</div>
          ) : callStatistics && callStatistics?.totalCalls > 0 ? (
            <div className="row">
              <div className="col-md-4">
                <div
                  className="User-dashboard-card my-2"
                  style={{ borderLeft: `7px solid #e68045` }}
                >
                  <div className="card-block bg-white shadow rounded p-3 d-flex align-items-center h-100">
                    <div className="d-flex w-100 flex-items-between">
                      <div className="fw-bold ps-2">Number of Calls</div>
                      <div className="fw-bold ps-2 font-color">{callStatistics?.totalCalls}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div
                  className="User-dashboard-card my-2"
                  style={{ borderLeft: `7px solid #e68045` }}
                >
                  <div className="card-block bg-white shadow rounded p-3 d-flex align-items-center h-100">
                    <div className="d-flex w-100 flex-items-between">
                      <div className="fw-bold ps-2">
                        Total Time Spent on Calls (minutes)
                      </div>
                      <div className="fw-bold ps-2 font-color">
                        {Math.round((callStatistics?.totalCallTime || 0) / 60)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center fs-18 py-4">No calls</div>
          )}
        </div>

        {/* Clinic Section */}
        <div className="my-3">
          <DataTable
            columns={clinicColumns}
            data={reportListData?.clinic_provider_patients || []}
            customStyles={customStyles}
            progressPending={clinicLoading || isFilterLoading}
            responsive

            sortIcon={<img loading="lazy" src={Sorticon} />}
          />
          <PaginationComponent
            totalRecords={reportListData?.pagination?.clinic?.totalRecords}
            page={clinicPage}
            rowsPerPage={clinicLimit}
            handleChangePage={handleClinicChangePage}
            handleChangeRowsPerPage={handleClinicChangeRowsPerPage}
          />
        </div>

        <div className="my-3">
          <DataTable
            columns={coachColumns}
            data={reportListData?.coach_patients || []}
            customStyles={customStyles}
            responsive
            progressPending={clinicLoading || isFilterLoading}


            sortIcon={<img loading="lazy" src={Sorticon} />}
          />
          <PaginationComponent
            totalRecords={reportListData?.pagination?.coach?.totalRecords}
            page={coachPage}
            rowsPerPage={coachLimit}
            handleChangePage={handleCoachChangePage}
            handleChangeRowsPerPage={handleCoachChangeRowsPerPage}
          />
        </div>
      </div>

      <ReportFiterCanva
        filterCanva={filterCanva}
        onClose={onClose}
        handleDateChange={handleDateChange}
        handleInputChange={handleInputChange}
        handleApplyFilter={handleApplyFilter}
        handleClear={handleClear}
        tempFilter={tempFilter}
      />
    </>
  );
};

export default ReportNanalytics;
