import React, { useState } from "react";
import DataTable from "react-data-table-component";
import Sorticon from "../../../../assets/icons/sort.png";
import Edit from "../../../../assets/icons/edit.png";
import FilterComponent from "../../../../utils/FilterComponent";
import customStyles from "../../../../Components/DataTable/CustomStyle";
import { useGetCallLogsQuery } from "../../../../redux/apis/billing_api";
import { useSelector } from "react-redux";
import PaginationComponent from "../../../../utils/Pagination";
import { formatDate } from "../../../../utils/dateUtils";
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from "@coreui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import PatientCallCanvas from "../coachPatients/PatientCallCanva";

const CallLog = () => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editCanvaVisible, setEditCanvaVisible] = useState(false);
  const [selectedCallLog, setSelectedCallLog] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    called_on: new Date(),
    duration: "",
    chart_notes: "",
    personal_notes: "",
  });
  const callLogs = useSelector((state) => state?.allBilling?.allCallLogs);
  const coach_id = useSelector((state) => state?.user?.id);

  const handleEditClick = (row) => {
    setSelectedCallLog(row);
    setFormData({
      called_on: row?.called_on ? new Date(row.called_on) : new Date(),
      duration: row?.duration != null ? String(Math.floor(row.duration / 60)) : "",
      chart_notes: row?.chart_notes || "",
      personal_notes: row?.personal_notes || "",
    });
    setErrors({});
    setEditCanvaVisible(true);
  };

  const handleCloseEditCanva = () => {
    setEditCanvaVisible(false);
    setSelectedCallLog(null);
    setFormData({ called_on: new Date(), duration: "", chart_notes: "", personal_notes: "" });
    setErrors({});
  };

  // eslint-disable-next-line no-unused-vars 
  const { data, isLoading, error } = useGetCallLogsQuery({
    coach_id: coach_id,
    searchText: searchText,
    page: page,
    limit: rowsPerPage,
  }, { refetchOnMountOrArgChange: true});

  // API returns duration in seconds
  const formatTime = (timeInSeconds) => {
    const total = Math.round(Number(timeInSeconds)) || 0;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return `${hours} hr ${minutes} min ${seconds} sec`;
  };

  const columns = [
    { name: "User ID", selector: (row) => row?.patient_custom_id, sortable: true },
    { name: "Patient Name", selector: (row) => row?.patient_name, sortable: true },
    { name: "Called On", selector: (row) => formatDate(row?.called_on, "MM/dd/yyyy hh:mm a"), sortable: true },
    { name: "Duration", selector: (row) => formatTime(row?.duration), sortable: true },
    { name: "Chart Notes", selector: (row) => row?.chart_notes, sortable: true, cell: (row) => (
      <span title={row?.chart_notes}>
        {row?.chart_notes}
      </span>
    ) },
    { name: "Personal Notes", selector: (row) => row?.personal_notes, sortable: true, cell: (row) => (
      <span title={row?.personal_notes}>
        {row?.personal_notes}
      </span>
    ) },
    {
      name: "Action",
      button: true,
      cell: (row) =>
        row?.session_status === "Ready to Bill" || row?.session_status === "Cancelled" ? (
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
              <CDropdownItem onClick={() => handleEditClick(row)}>
                <img loading="lazy" src={Edit} className="me-2" alt="Edit" />
                Edit
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        ) : (
          "-"
        ),
      ignoreRowClick: true,
      width: "100px",
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  return (
    <div className="default-container ps-3 mt-4 bg-white">
      <div className="d-flex justify-content-between">
        <h6>
          <strong className="title-color fs-18">Call Log</strong>
        </h6>
        <div className="d-flex flex-wrap align-items-center mx-2">
          <div className="flex-grow-1 me-3 mb-2">
            <FilterComponent
              placeholder="Search by patient name"
              onFilter={(e) => setSearchText(e.target.value)}
              filterText={searchText}
            />
          </div>
        </div>
      </div>
      {isLoading ? (
        <p>Loading call logs...</p>
      ) : error ? (
        <p>Error fetching call logs.</p>
      ) : (
        <div className="mt-2">
          <DataTable
            columns={columns}
            data={callLogs?.data}
            customStyles={customStyles}
            progressPending={isLoading}
            responsive={true}
            sortIcon={<img loading="lazy" src={Sorticon} alt="Sort Icon" />}
          />
          
          <PaginationComponent
            totalRecords={callLogs?.totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </div>
      )}

      <PatientCallCanvas
        PatientCallCanva={editCanvaVisible}
        setPatientCallCanva={(v) => {
          if (!v) handleCloseEditCanva();
        }}
        billingId={selectedCallLog?.billing_id}
        patientId={selectedCallLog?.patient_id}
        onClose={handleCloseEditCanva}
        errors={errors}
        setErrors={setErrors}
        formData={formData}
        setFormData={setFormData}
        editCallLog={selectedCallLog}
      />
    </div>
  );
};

export default CallLog;
