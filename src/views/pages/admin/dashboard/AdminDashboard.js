import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ReportFiterCanva from "../../../../Components/DataTable/ReportFiterCanva";
import { useGetCptSummaryQuery, useGetReportAnalyticsQuery } from "../../../../redux/apis/report_analytics_api";
import { useGetAllCoachQuery } from "../../../../redux/apis/allCoach_api";
import { useGetClinicQuery } from "../../../../redux/apis/clinic_api";
import PaginationComponent from "../../../../utils/Pagination";
import SearchIcon from "../../../../assets/icons/figma/search.svg";
import FilterIcon from "../../../../assets/icons/figma/filter.svg";
import SortIcon from "../../../../assets/icons/figma/sort.svg";
import YoutubeIcon from "../../../../assets/icons/figma/youtube.svg";
import "./AdminDashboard.scss";

const EMPTY_FILTER = { clinic_id: "", coachName: "", diagnosis: "" };

const formatMonth = (date) => {
  const d = date || new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

const withFilters = (params, filter) => {
  const out = { ...params };
  Object.keys(filter).forEach((k) => {
    if (filter[k]) out[k] = filter[k];
  });
  return out;
};

const matches = (row, keys, text) =>
  !text || keys.some((k) => String(row[k] ?? "").toLowerCase().includes(text.toLowerCase()));

// Table styled exactly like the Figma dashboard tables (header #027FA3, 45px rows).
const DashboardTable = ({ columns, rows, loading }) => {
  const [sort, setSort] = useState({ key: null, dir: 1 });

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    return [...rows].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      if (typeof x === "number" && typeof y === "number") return (x - y) * sort.dir;
      return String(x ?? "").localeCompare(String(y ?? "")) * sort.dir;
    });
  }, [rows, sort]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }));

  return (
    <div className="ad-table">
      <div className="ad-table-row ad-table-head">
        {columns.map((c) => (
          <button type="button" key={c.key} className="ad-th" onClick={() => toggleSort(c.key)}>
            <span>{c.name}</span>
            <img src={SortIcon} alt="" />
          </button>
        ))}
      </div>
      <div className="ad-table-body">
        {loading ? (
          <div className="ad-empty">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="ad-empty">No Data Found</div>
        ) : (
          sorted.map((row, i) => (
            <div className="ad-table-row" key={row._id || i}>
              {columns.map((c) => (
                <div className="ad-td" key={c.key} title={String(row[c.key] ?? "")}>
                  {row[c.key]}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, variant = "metric", icon }) => (
  <div className={`ad-card ad-card--${variant}`}>
    {icon && <img src={icon} alt="" />}
    <div className="ad-card-text">
      <span className="ad-card-label">{label}</span>
      <span className="ad-card-value">{value}</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const actorId = useSelector((state) => state.user?.id);
  const actorType = useSelector((state) => state.user?.userType);

  const [searchText, setSearchText] = useState("");
  const [filterCanva, setFilterCanva] = useState(false);
  const [tempFilter, setTempFilter] = useState({ selectedMonth: new Date(), ...EMPTY_FILTER });
  const [appliedFilter, setAppliedFilter] = useState(EMPTY_FILTER);
  const [appliedMonth, setAppliedMonth] = useState(new Date());
  const [clinicPage, setClinicPage] = useState(1);
  const [clinicLimit, setClinicLimit] = useState(10);
  const [coachPage, setCoachPage] = useState(1);
  const [coachLimit, setCoachLimit] = useState(10);

  // Same data sources as Reports & Analytics.
  useGetAllCoachQuery();
  useGetClinicQuery();
  const { isFetching: listLoading } = useGetReportAnalyticsQuery(
    withFilters({ clinicPage, clinicLimit, coachPage, coachLimit, actorId, actorType }, appliedFilter),
    { refetchOnMountOrArgChange: true }
  );
  const { isFetching: cptLoading } = useGetCptSummaryQuery(
    withFilters({ month: formatMonth(appliedMonth), actorId, actorType }, appliedFilter),
    { refetchOnMountOrArgChange: true }
  );

  const reportList = useSelector((state) => state?.reportNanlticsListing?.reportListing);
  const cptSummary = useSelector((state) => state?.reportNanlticsListing?.cptSummaryList);

  const cptRows = (cptSummary?.data || []).map((item) => ({
    _id: item.cptCode,
    cptCode: item.cptCode,
    pending: item.counts?.find((c) => c.status === "Pending")?.count || 0,
    billed: item.counts?.find((c) => c.status === "Billed" || c.status === "Payment Received")?.count || 0,
  }));

  const clinicRows = (reportList?.clinic_provider_patients || []).map((r) => ({
    _id: r._id,
    clinic: r.clinic_name,
    provider: r?.provider?.name === "No Provider Assigned" ? "-" : r?.provider?.name,
    patients: r.patient_count,
  }));

  const coachRows = (reportList?.coach_patients || []).map((r) => ({
    _id: r._id,
    coach: r.coach_name,
    patients: r.patient_count,
  }));

  const engagement = cptSummary?.patientEngagement || {};
  const engagementCards = [
    { label: "Patients Logged In", value: engagement.totalLogins || 0 },
    { label: "Total Minutes Watched (mins)", value: Math.round((engagement.totalVideoWatchDuration || 0) / 60) },
    { label: "Average Time Video Watched (mins)", value: engagement.totalVideosWatched || 0 },
    { label: "Total Videos Watched (Per Patient)", value: Math.round(engagement.averageVideosWatchedPerWatchingPatient || 0) },
  ];
  const videos = (cptSummary?.topWatchedVideos || []).slice(0, 5);
  const calls = cptSummary?.callStatistics || {};

  const handleApplyFilter = () => {
    if (tempFilter.selectedMonth) setAppliedMonth(tempFilter.selectedMonth);
    setAppliedFilter({
      clinic_id: tempFilter.clinic_id,
      coachName: tempFilter.coachName,
      diagnosis: tempFilter.diagnosis,
    });
    setClinicPage(1);
    setCoachPage(1);
  };

  const handleClear = () => {
    const now = new Date();
    setTempFilter({ selectedMonth: now, ...EMPTY_FILTER });
    setAppliedMonth(now);
    setAppliedFilter(EMPTY_FILTER);
  };

  const clinicTotal = reportList?.pagination?.clinic?.totalRecords || 0;
  const coachTotal = reportList?.pagination?.coach?.totalRecords || 0;

  return (
    <>
      <div className="admin-dashboard">
        <div className="ad-header">
          <p className="ad-title">Total Patients</p>
          <div className="ad-header-actions">
            <label className="ad-search">
              <input
                type="search"
                placeholder="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoComplete="off"
              />
              <img src={SearchIcon} alt="" />
            </label>
            <button type="button" className="ad-filter-btn" onClick={() => setFilterCanva(true)}>
              <img src={FilterIcon} alt="" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <DashboardTable
          loading={cptLoading}
          columns={[
            { key: "cptCode", name: "CPT Code" },
            { key: "pending", name: "Pending Billing" },
            { key: "billed", name: "Billed" },
          ]}
          rows={cptRows.filter((r) => matches(r, ["cptCode"], searchText))}
        />

        <div className="ad-section">
          <p className="ad-title">Patient Engagement</p>
          <div className="ad-card-grid">
            {engagementCards.map((c) => (
              <StatCard key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
        </div>

        <div className="ad-section">
          <p className="ad-title">Most Watched Video (Top 5)</p>
          <div className="ad-card-grid">
            {cptLoading ? (
              <span className="ad-loading">Loading...</span>
            ) : videos.length ? (
              videos.map((v, i) => (
                <StatCard key={v._id || i} variant="video" icon={YoutubeIcon} label={v.title} value={v.watchCount} />
              ))
            ) : (
              <span className="ad-loading">No Data Found</span>
            )}
          </div>
        </div>

        <p className="ad-title w-100">More Info</p>
        <div className="ad-card-grid ad-card-grid--info w-100">
          <StatCard variant="info" label="Number of Calls" value={calls.totalCalls || 0} />
          <StatCard
            variant="info"
            label="Total Time Spent on Calls (minutes)"
            value={Math.round((calls.totalCallTime || 0) / 60)}
          />
        </div>

        <div className="w-100">
          <DashboardTable
            loading={listLoading}
            columns={[
              { key: "clinic", name: "Clinic" },
              { key: "provider", name: "Provider" },
              { key: "patients", name: "Total Patients" },
            ]}
            rows={clinicRows.filter((r) => matches(r, ["clinic", "provider"], searchText))}
          />
          {clinicTotal > clinicLimit && (
            <PaginationComponent
              totalRecords={clinicTotal}
              page={clinicPage}
              rowsPerPage={clinicLimit}
              handleChangePage={(e, p) => setClinicPage(p + 1)}
              handleChangeRowsPerPage={(e) => {
                setClinicLimit(parseInt(e.target.value, 10));
                setClinicPage(1);
              }}
            />
          )}
        </div>

        <div className="w-100">
          <DashboardTable
            loading={listLoading}
            columns={[
              { key: "coach", name: "Coach" },
              { key: "patients", name: "Total Patients" },
            ]}
            rows={coachRows.filter((r) => matches(r, ["coach"], searchText))}
          />
          {coachTotal > coachLimit && (
            <PaginationComponent
              totalRecords={coachTotal}
              page={coachPage}
              rowsPerPage={coachLimit}
              handleChangePage={(e, p) => setCoachPage(p + 1)}
              handleChangeRowsPerPage={(e) => {
                setCoachLimit(parseInt(e.target.value, 10));
                setCoachPage(1);
              }}
            />
          )}
        </div>
      </div>

      <ReportFiterCanva
        filterCanva={filterCanva}
        onClose={() => setFilterCanva(false)}
        handleDateChange={(date) => setTempFilter((p) => ({ ...p, selectedMonth: date }))}
        handleInputChange={(e) => setTempFilter((p) => ({ ...p, [e.target.name]: e.target.value }))}
        handleApplyFilter={handleApplyFilter}
        handleClear={handleClear}
        tempFilter={tempFilter}
      />
    </>
  );
};

export default AdminDashboard;
