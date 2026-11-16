import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from "@coreui/react";
import { faEllipsis, faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import UserIcon from "../../assets/icons/User.png";
import Copy from "../../assets/icons/copy.png";
import Download from "../../assets/icons/download.png";
import Edit from "../../assets/icons/edit.png";
import Diagnose from "../../assets/icons/nurse.png";
import CheckIcon from "../../assets/icons/check.png";
import Sorticon from "../../assets/icons/sort.png";
import DeleteIcon from "../../assets/icons/trash-2.png";
import { formatDate, formatDateOnly } from "../../utils/dateUtils";
import ActionCell from "./ActionCell";

export const createColumns = (
  handleDelete,
  setDetails,
  setIsEditMode,
  setEditId,
  setCreateModal,
  userType,
  handleStatusChange,
  handleDownload
) => {
  const columns = [
    {
      name: "Document Name",
      selector: (row) => row.document_name,
      cell: (row) => (
        <span title={row?.document_name}>
          {row?.document_name?.length > 20
            ? `${row?.document_name?.substring(0, 20)}...`
            : row?.document_name}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Description",
      selector: (row => row.description),
      cell: (row) => (
        <span title={row?.description}>
          {row?.description?.length > 20
            ? `${row?.description?.substring(0, 40)}...`
            : row?.description}
        </span>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Body Text",
      selector: (row => row.body_text),
      cell: (row) => (
        <span title={row?.body_text}>
          {row?.body_text?.length > 20
            ? `${row?.body_text?.substring(0, 20)}...`
            : row?.body_text}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Created By",
      selector: (row => row.created_by),
      cell: (row) => (
        <span title={row?.created_by}>
          {row?.created_by?.length > 20
            ? `${row?.created_by?.substring(0, 20)}...`
            : row?.created_by}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Doc. Name",
      selector: (row => row.file_original_name),
      sortable: true,
      cell: (row) => (
        <span
          style={{
            cursor: "pointer",
            color: "#007bff",
          }}
          className="reset-password"
          onClick={() => handleDownload && handleDownload(row)}
        >
          {row?.file_original_name.split(".")[0]}
        </span>
      ),
    },
    {
      name: "Status",
      sortable: true,
      selector: (row => row.status),
      cell: (row) => (
        <>
          {row?.status === "active" ? (
            <div className="active-btn">Active</div>
          ) : (
            <div className="inactive-btn">Inactive</div>
          )}
        </>
      ),
    },
    {
      name: "Created At",
      selector: (row) => row.createdAt,
      cell: (row) => (
        <span title={row?.createdAt}>
          {formatDate(row?.createdAt)}
        </span>
      ),
      sortable: true,
    },
  ];

  if (userType !== "coach") {
    columns.push({
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
              <CDropdownItem onClick={() => handleStatusChange(row)}>{row?.status === "active" ? "De-activate" : "Activate"}</CDropdownItem>
              {row?.status === 'active' ?
                <CDropdownItem
                  onClick={() => {
                    setDetails(row);
                    setIsEditMode(true);
                    setEditId(row?._id);
                    setCreateModal(true);
                  }}
                ><img loading="lazy" src={Edit} className="me-2" />
                  Edit
                </CDropdownItem> : null}
              <CDropdownItem onClick={() => handleDelete(row)} > <img src={DeleteIcon} className="me-2" /> Delete</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </div>
      ),
    });
  }

  return columns;
};

export const createColumnsPatientUsefull = (handleDelete, handleEdit, type, userType, handleStatusChange) => {
  const columns = [
    {
      name: "Title",
      selector: (row => row.title),
      cell: (row) => (
        <span title={row?.title} >
          {row?.title?.length > 60
            ? `${row?.title?.substring(0, 60)}...`
            : row?.title}
        </span>
      ),
      sortable: true,
      grow: 1,
    },
    ...(type !== "tips" ? [{
      name: "Body Part",
      selector: (row => row.body_part),
      cell: (row) => {
        const bodyPartText = row?.body_part?.join(", ") || "";
        return (
          <span title={bodyPartText}>
            {bodyPartText.length > 20
              ? `${bodyPartText.substring(0, 60)}`
              : bodyPartText}
          </span>
        );
      },
      sortable: true,
      grow: 2,
    }] : []),

    ...(type !== "tips"
      ? [{
        name: "Description",
        selector: (row => row.description),
        cell: (row) => (
          <span title={row?.description}>
            {row?.description?.length > 20
              ? `${row?.description?.substring(0, 40)}...`
              : row?.description}
          </span>
        ),
        sortable: true,
        grow: 2,
      }]
      : [{
        name: "Body Text",
        selector: (row => row.body_text),
        cell: (row) => (
          <span title={row?.body_text}>
            {row?.body_text?.length > 20
              ? `${row?.body_text?.substring(0, 40)}...`
              : row?.body_text}
          </span>
        ),
        sortable: true,
        grow: 2,
      }]
    ),


    {
      name: "Created At",
      selector: (row) => row.created_on || row.createdAt,
      cell: (row) => (
        <span title={row?.created_on || row?.createdAt}>
          {formatDate(row?.created_on || row?.createdAt)}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Created By",
      selector: (row => row.created_by),
      cell: (row) => (
        <span title={row?.created_by}>
          {row?.created_by?.length > 20
            ? `${row?.created_by?.substring(0, 20)}...`
            : row?.created_by}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Status",
      sortable: true,
      selector: (row => row.status),
      cell: (row) => (
        <>
          {row?.status === "active" ? (
            <div className="active-btn">Active</div>
          ) : (
            <div className="inactive-btn">Inactive</div>
          )}
        </>
      ),
    },
  ];

  if (userType !== "coach") {
    columns.push({
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
              <CDropdownItem onClick={() => handleStatusChange(row, type)}>{row?.status === "active" ? "De-activate" : "Activate"}</CDropdownItem>

              {row?.status === 'active' ? <CDropdownItem onClick={() => handleEdit(row, type)}><img loading="lazy" src={Edit} className="me-2" />Edit</CDropdownItem> : null}

              <CDropdownItem onClick={() => handleDelete(row, type)}> <img src={DeleteIcon} className="me-2" />
                Delete</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </div>
      ),
    });
  }

  return columns;
};

export const createColumnsPatient = ({
  isApproved,
  currentTab,
  handleApproveModal,
  handleAssignModal,
  handleDeleteModal,
  handleActivateModal,
  userType,
  handleEditModal,
  handleDiagnosisModal,
}) => [
    {
      name: (
        <span
          style={{ cursor: 'pointer', userSelect: 'none' }}

        >
          Name
        </span>
      ),
      sortField: "last_name",
      selector: "last_name", // <-- string for sorting
      cell: row => (
        <div title={row?.first_name} data-tag="allowRowEvents">
          {`${row.last_name || ""} ${row.middle_name?.charAt(0)?.toUpperCase() || ""} ${row.first_name || ""}`}

        </div>
      ),
      sortable: true,
    },
    {
      name: (
        <span
          style={{ cursor: 'pointer', userSelect: 'none' }}

        >
          Email
        </span>
      ),
      sortField: "email",
      selector: "email", // <-- string for sorting
      cell: row => (
        <span title={row?.email} data-tag="allowRowEvents">
          {row?.email?.length > 20 ? `${row?.email?.substring(0, 20)}...` : row?.email}
        </span>
      ),
      sortable: true,
    },
    {
      name: (
        <span
          style={{ cursor: 'pointer', userSelect: 'none' }}

        >
          Gender
        </span>
      ),
      sortField: "gender",
      selector: "gender", // <-- string for sorting
      cell: row => (
        <span title={row?.gender} data-tag="allowRowEvents">
          {row?.gender?.charAt(0)?.toUpperCase() + row?.gender?.slice(1)}
        </span>
      ),
      sortable: true,
    },
    {
      name: (
        <span
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          Date Of Birth
        </span>
      ),
      selector: "date_of_birth", // <-- string for sorting
      sortField: "date_of_birth",
      cell: row => (
        <span title={row?.date_of_birth} data-tag="allowRowEvents">
          {formatDate(row?.date_of_birth)}
        </span>
      ),
      sortable: true,
    },
    ...(currentTab === "Approved" ? [
      {
        name: (
          <span
            style={{ cursor: 'pointer', userSelect: 'none' }}

          >
            Diagnosis
          </span>
        ),
        sortField: "diagnosis",
        selector: "diagnosis", // <-- string for sorting
        cell: row => (
          <span title={row?.diagnosis} data-tag="allowRowEvents">
            {row?.diagnosis?.length > 20 ? `${row?.diagnosis?.substring(0, 20)}...` : row?.diagnosis}
          </span>
        ),
        sortable: true,
      }
    ] : []),
    ...(isApproved
      ? [
        {
          name: (
            <span
              style={{ cursor: 'pointer', userSelect: 'none' }}

            >
              Coach
            </span>
          ),
          selector: "coach.last_name", // <-- string for sorting
          cell: row => (
            <span title={`${row?.coach?.last_name || ""} ${row?.coach?.middle_name?.charAt(0)?.toUpperCase() || ""} ${row?.coach?.first_name || ""}`} data-tag="allowRowEvents">
              {`${row?.coach?.last_name || ""} ${row?.coach?.middle_name?.charAt(0)?.toUpperCase() || ""} ${row?.coach?.first_name || ""}`}
            </span>
          ),
          sortField: "coach.last_name",
          sortable: true,
        },
        {
          name: (
            <span
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Provider
            </span>
          ),
          selector: "provider.last_name", // <-- string for sorting
          cell: row => (
            <span title={`${row?.provider?.last_name || ""} ${row?.provider?.middle_name?.charAt(0)?.toUpperCase() || ""} ${row?.provider?.first_name || ""}`} data-tag="allowRowEvents">
              {`${row?.provider?.last_name || ""} ${row?.provider?.middle_name?.charAt(0)?.toUpperCase() || ""} ${row?.provider?.first_name || ""}`}
            </span>
          ),
          sortField: "provider.last_name",
          sortable: true,
        },
      ]
      : []),
    {
      name: (
        <span
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          Insurance
        </span>
      ),
      selector: "insurance", // <-- string for sorting
      cell: row => (
        <span title={row?.insurance} data-tag="allowRowEvents">
          {row?.insurance?.length > 20 ? `${row?.insurance?.substring(0, 20)}...` : row?.insurance}
        </span>
      ),
      sortField: "insurance",
      sortable: true,
    },
    {
      name: (
        <span
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          Clinic Name
        </span>
      ),
      selector: "clinic_name", // <-- string for sorting
      cell: row => (
        <span title={row?.clinic_name} data-tag="allowRowEvents">
          {row?.clinic_name?.length > 20 ? `${row?.clinic_name?.substring(0, 20)}...` : row?.clinic_name}
        </span>
      ),
      sortField: "clinic_name",
      sortable: true,
    },
    {
      name: (
        <span
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          Registered On
        </span>
      ),
      selector: "createdAt", // <-- string for sorting
      cell: row => (
        <span title={row?.createdAt} data-tag="allowRowEvents">
          {formatDate(row?.createdAt)}
        </span>
      ),
      sortField: "createdAt",
      sortable: true,
    },
    {
      name: (
        <span
          style={{ cursor: 'pointer', userSelect: 'none' }}

        >
          Status
        </span>
      ),
      selector: "status", // <-- string for sorting
      sortField: "status",
      cell: row => {
        return (
          <span title={row?.status} data-tag="allowRowEvents">
            {row?.status === "inactive" ? (
              <div className="inactive-btn">Inactive</div>
            ) : row?.status === "pending" ? (
              <div className="pending-btn">Pending</div>
            ) : (
              <div className="active-btn">Active</div>
            )}
          </span>
        );
      },
      sortable: true,
    },
    {
      name: "Action",
      button: true,
      cell: (row) =>

        <ActionCell
          tab={currentTab}
          row={row}
          userType={userType}
          handleApproveModal={handleApproveModal}
          handleAssignModal={handleAssignModal}
          handleDeleteModal={handleDeleteModal}
          handleEditModal={handleEditModal}
          handleDiagnosisModal={handleDiagnosisModal}
          handleActivateModal={handleActivateModal}
        />


    },
  ];

export const createColumnsPatientProvider = ({
  isApproved,
  currentTab,
  handleApproveModal,
  handleAssignModal,
  handleDeleteModal,
  updatePatientCanva,
  navigateMypatientDetail
}) => [
    {
      name: "Name",
      sortable: true,
      selector: (row) => row.status,
      cell: (row) => (
        <div className="d-flex " data-tag="allowRowEvents">
          <img loading="lazy" src={UserIcon} className="me-2 " alt="User" />
          <div aria-hidden="true">{`${row.first_name} ${row.last_name}`}</div>
        </div>
      ),
    },
    {
      name: "Email ID",
      selector: (row) => (
        <span title={row?.email}>
          {row?.email?.length > 20
            ? `${row?.email?.substring(0, 20)}...`
            : row?.email}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Gender",
      selector: (row) => row?.gender?.charAt(0)?.toUpperCase() + row?.gender?.slice(1),
      sortable: true,
    },
    ...(isApproved
      ? [
        {
          name: "Coach",
          selector: (row) =>
            `${row?.coach?.first_name || ""} ${row?.coach?.last_name || ""}`,
          sortable: true,
        },
      ]
      : []),
    {
      name: "Provider",
      selector: (row) =>
        `${row?.provider?.first_name || ""} ${row?.provider?.last_name || ""}`,
      sortable: true,
    },
    {
      name: "Insurance",
      selector: (row) => row?.insurance,
      sortable: true,
    },
    {
      name: "Registered On",
      selector: (row) =>
        formatDate(row?.createdAt || row?.createdAt, "MM/dd/yyyy"),
      sortable: true,
    },
    {
      name: "Clinic Name",
      selector: (row) => row?.clinic_name,
      sortable: true,
    },
    {
      name: "User ID", // Added new column
      selector: (row) => row.patient_id,
      sortable: true,
      cell: (row) => (
        <div
          onClick={(e) => navigateMypatientDetail(e, row._id)}
          style={{ cursor: 'pointer' }}
          className="d-flex " data-tag="allowRowEvents">
          <div aria-hidden="true" >{row.patient_id}</div>
        </div>
      ),
    },
    {
      name: "Action",
      button: true,
      cell: (row) => (
        <ActionCell
          tab={currentTab}
          row={row}
          handleApproveModal={handleApproveModal}
          handleAssignModal={handleAssignModal}
          handleDeleteModal={handleDeleteModal}
          updatePatientCanva={isApproved ? updatePatientCanva : undefined}
        />
      ),
    },
  ];

// Provider > My Patients. `pending` switches the row menu to "Approve" for the Pending Approval tab.
export const columnsApproved = ({ handleDiagnosisModal, handleApproveModal, pending = false }) => [
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }} >
        Patient ID
      </span>
    ),
    id: 'patient_id',
    sortField: 'patient_id',
    selector: (row) => row.patient_id,
    cell: (row) => row?.patient_id,
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }} >
        Name
      </span>
    ),
    id: 'last_name',
    sortField: 'last_name',
    selector: (row) => row.last_name,
    cell: (row) => `${row?.last_name ? row?.last_name : ""} ${row?.middle_name ? row?.middle_name?.charAt(0)?.toUpperCase() : ""} ${row?.first_name ? row?.first_name : ""}`,
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }} >
        Product
      </span>
    ),
    id: 'product',
    sortField: 'product',
    selector: (row) => row?.product || (/migraine/i.test(row?.diagnosis || "") ? "Migraine App" : "Pain App"),
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }} >
        Gender
      </span>
    ),
    id: 'gender',
    sortField: 'gender',
    selector: (row) => row?.gender?.charAt(0)?.toUpperCase() + row?.gender?.slice(1),
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }} >
        Diagnosis
      </span>
    ),
    id: 'diagnosis',
    sortField: 'diagnosis',
    selector: (row) => row?.diagnosis,
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }} >
        Coach
      </span>
    ),
    id: 'coach.last_name',
    sortField: 'coach.last_name',
    selector: (row) => `${row?.coach?.last_name ? row?.coach?.last_name : ""} ${row?.coach?.middle_name ? row?.coach?.middle_name?.charAt(0)?.toUpperCase() : ""} ${row?.coach?.first_name ? row?.coach?.first_name : ""}`,
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }} >
        Insurance
      </span>
    ),
    id: 'insurance',
    sortField: 'insurance',
    selector: (row) => row?.insurance,
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }} >
        Registered On
      </span>
    ),
    id: 'createdAt',
    sortField: 'createdAt',
    selector: (row) => formatDate(row?.createdAt || row?.createdAt, "MM/dd/yyyy"),
    sortable: true,
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
            {pending ? (
              <CDropdownItem onClick={() => handleApproveModal(row)}>
                <img loading="lazy" src={CheckIcon} className="me-2" alt="Approve" />
                Approve
              </CDropdownItem>
            ) : (
              <CDropdownItem onClick={() => handleDiagnosisModal(row)}>
                <img loading="lazy" src={Diagnose} className="me-2" alt="Diagnose" />
                Associate Diagnosis
              </CDropdownItem>
            )}
          </CDropdownMenu>
        </CDropdown>
      </div>
    ),
  },

];

export const columnsPending = ({ currentTab, handleApproveModal, navigateMypatientDetail }) => [
  {
    name: "User ID",
    selector: (row) => row.patient_id,
    cell: (row) => (
      <div
        onClick={(e) => navigateMypatientDetail(e, row._id)}
        className="d-flex"
        data-tag="allowRowEvents"
      >
        <div aria-hidden="true">{row?.patient_id}</div>
      </div>
    ),
    sortable: true,
  },
  {
    name: "Name",
    selector: (row) => row.last_name,
    sortable: true,
    cell: (row) => (
      <div className="d-flex" data-tag="allowRowEvents">
        <div aria-hidden="true">{`${row?.first_name} ${row?.last_name}`}</div>
      </div>
    ),
  },
  {
    name: "Gender",
    selector: (row) => row?.gender?.charAt(0)?.toUpperCase() + row?.gender?.slice(1),
    sortable: true,
  },
  {
    name: "Coach",
    selector: (row) => `${row?.coach?.first_name ? row?.coach?.first_name : "-"} ${row?.coach?.last_name ? row?.coach?.last_name : ""}`,
    sortable: true,
  },
  {
    name: "Insurance",
    selector: (row) => row?.insurance,
    sortable: true,
  },
  {
    name: "Registered On",
    selector: (row) => formatDate(row?.createdAt || row?.createdAt, "MM/dd/yyyy"),
    sortable: true,
  },
  {
    name: "Last Active On",
    selector: (row) => formatDate(row?.lastLoginDate, "MM/dd/yyyy, hh:mm a"),
    sortable: true,
  },
  {
    name: "Action",
    button: true,
    cell: (row) => (
      <ActionCell
        tab={currentTab}
        row={row}
        handleApproveModal={handleApproveModal}
        pendingPatient={"true"}
      />
    ),
  },
];

export const columnsCoachPatient = [
  {
    name: "Patient ID",
    selector: (row) => row?.title,
    sortable: true,
  },
  {
    name: "Registered On",
    selector: (row) => row?.year,
    sortable: true,
  },
  {
    name: "Patient Name",
    selector: (row) => row?.title,
    sortable: true,
  },
  {
    name: "Doctor",
    selector: (row) => row?.year,
    sortable: true,
  },
  {
    name: "Time Spent",
    // selector: (row) => row?.title,
    sortable: true,
  },

  {
    name: "Approval",
    selector: (row) => row.approved,
    sortable: true,
    cell: (row) => {
      return (
        <p>
          {row?.approved ? (
            <div className="active-btn">Approved</div>
          ) : (
            <div className="inactive-btn ">Pending</div>
          )}
        </p>
      );
    },
  },
  {
    name: "Last Active ",
    selector: (row) => row.year,
    sortable: true,
  },

  {
    name: "Action",
    button: true,
    cell: () => (
      <div className="">
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
            <CDropdownItem>
              Clone
            </CDropdownItem>
            <CDropdownItem>
              Edit
            </CDropdownItem>
            <CDropdownItem>
              Delete
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>
    ),
  },
];

export const columnsUserList = ({
  navigateUserDetail,
  setEditModal,
  seteditedRowData,
  setDeleteModal,
  setDeletRowData,
  setAction,

}) => [
    {
      name: "Name",
      selector: (row) => row.last_name,
      sortField: 'last_name',
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <img loading="lazy" src={UserIcon} className="me-3" />
          <div
            className="transition pointer"
            onClick={() => navigateUserDetail(row)}
          >
            {`${row?.md_type ? `${row.md_type}.` : ""}`}
            {`${row?.last_name || ""} ${row?.middle_name?.charAt(0)?.toUpperCase() || ""} ${row?.first_name || ""}`}
          </div>
        </div>
      ),
    },
    {
      name: "Email ID",
      selector: (row) => row.email,
      sortField: 'email',
      sortable: true,
      cell: (row) => (
        <span
          className="pointer"
          title={row?.email}
          onClick={() => navigateUserDetail(row)}
        >
          {row?.email?.length > 20 ? `${row?.email?.substring(0, 20)}...` : row?.email}
        </span>
      ),
    },
    {
      name: "Assign Practices",
      selector: (row) => row.clinic_name || row.assignedClinicNames?.[0] || "",
      sortField: 'clinic_name',
      sortable: true,
      cell: (row) => {
        const clinics = row?.assignedClinicNames?.length
          ? row.assignedClinicNames
          : row?.clinic_name
            ? [row.clinic_name]
            : [];

        const displayName = clinics[0] || "-";
        const extraCount = clinics.length > 1 ? ` +${clinics.length - 1}` : "";
        const tooltipText = clinics.join(", ");

        return (
          <div
            title={tooltipText}
            className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] pointer"
            onClick={() => navigateUserDetail(row)}
          >
            {displayName}
            <span style={{ color: "#2F80ED" }}>{extraCount}</span>
          </div>
        );
      },
    },
    {
      name: " User Type",
      selector: (row) => row?.userType?.charAt(0)?.toUpperCase() + row?.userType?.slice(1),
      sortField: 'userType',
      sortable: true,
    },
    {
      name: "Registered On",
      id: 'registered_on',
      selector: (row) => formatDate(row?.registered_on, "MM/dd/yyyy"),
      sortField: 'registered_on',
      sortable: true,
    },
    {
      name: "Last Active On",
      selector: (row) => formatDate(row?.lastLoginDate, "MM/dd/yyyy, hh:mm a"),
      sortField: 'lastLoginDate',
      sortable: true,
      grow: 2
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortField: 'status',
      sortable: true,
      cell: (row) => (
        row?.status === "inactive"
          ? <div className="inactive-btn">Inactive</div>
          : <div className="active-btn">Active</div>
      ),
    },
    {
      name: "Action",
      button: true,
      cell: (row) => (
        row?.status === "active" && (
          <div className="">
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
                {row?.userType === "coach" && (
                  <CDropdownItem
                    onClick={() => {
                      setEditModal(true);
                      seteditedRowData(row);
                      setAction(true);
                    }}
                  >
                    <img loading="lazy" src={Copy} className="me-2" />
                    Clone
                  </CDropdownItem>
                )}
                <CDropdownItem
                  onClick={() => {
                    setEditModal(true);
                    seteditedRowData(row);
                  }}
                >
                  <img loading="lazy" src={Edit} className="me-2" />
                  Edit
                </CDropdownItem>
                <CDropdownItem
                  onClick={() => {
                    setDeleteModal(true);
                    setDeletRowData(row);
                  }}

                >
                  <img src={DeleteIcon} className="me-2" />
                  Delete
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </div>
        )
      ),
    },
  ];

export const columnsMDNotes = ({
  setDeleteModal,
  setRowData,
  setMdNotesCanva,
  setEdit,
}) => [
    {
      name: "Task Name",
      selector: (row) => row?.task_name || "",
      sortable: true,
      cell: (row) => (
        <span title={row?.task_name}>
          {row?.task_name?.length > 20
            ? `${row?.task_name?.substring(0, 20)}...`
            : row?.task_name}
        </span>
      ),
    },
    {
      name: "Note Description",
      selector: (row) => row?.description || "",
      sortable: true,
      cell: (row) => (
        <span title={row?.description}>
          {row?.description?.length > 120
            ? `${row?.description?.substring(0, 120)}...`
            : row?.description}
        </span>
      ),
      grow: 3,
    },
    {
      name: "Created At",
      selector: (row) => new Date(row?.created_on),
      sortable: true,
      cell: (row) => formatDate(row?.created_on, "MM/dd/yyyy"),
    },
    {
      name: "Action",
      button: true,
      cell: (row) => (
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
                setMdNotesCanva(true);
                setRowData(row);
                setEdit(true);
              }}
            >
              <img loading="lazy" src={Edit} className="me-2" />
              Edit
            </CDropdownItem>
            <CDropdownItem
              onClick={() => {
                setDeleteModal(true);
                setRowData(row);
              }}
            >
              <img src={DeleteIcon} className="me-2" />
              Delete
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      ),
    },
  ];


export const columnsClinic = ({ funcNavigate, openEditClinic, handleUpdateClinicStatus, handleDownloadQRcode }) => [
  {
    name: 'Clinic Name',
    selector: row => row?.clinic_name,
    sortable: true,
    sortField: 'clinic_name', // Add this to identify the field for server sorting
    cell: (row) => (
      <div className="d-flex transition pointer" onClick={() => funcNavigate(row)}>
        {row?.clinic_name}
      </div>
    ),
  },
  {
    name: 'No Of Patients',
    selector: row => row?.number_of_clients,
    sortable: true,
    sortField: 'number_of_clients',
  },
  {
    name: 'No Of Providers',
    selector: row => row?.number_of_provider,
    sortable: true,
    sortField: 'number_of_provider',
  },
  {
    name: 'Registered On',
    id: 'registered_on',
    selector: row => formatDate(row?.registered_on),
    sortable: true,
    sortField: 'registered_on',
  },
  {
    name: 'Status',
    selector: row => row.status,
    sortable: true,
    sortField: 'status',
    cell: (row) => (
      row?.status === "active"
        ? <div className="active-btn">Active</div>
        : <div className="inactive-btn">Inactive</div>
    ),
  },

  {
    name: "Action",
    button: true,
    cell: (row) => {
      return <div className="">
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
              onClick={() => { handleDownloadQRcode && handleDownloadQRcode(row); }}
            >
              <img loading="lazy" src={Download} alt="download" className="me-2" height={17} />
              Download QR
            </CDropdownItem>
            {row?.status === "active" ? <CDropdownItem
              onClick={() => { openEditClinic(row, "Edit"); }}
            >
              <img loading="lazy" src={Edit} className="me-2" />
              Edit
            </CDropdownItem> : null}
            <CDropdownItem
              onClick={() => { handleUpdateClinicStatus(row); }}
            >
              <img src={DeleteIcon} className="me-2" />
              {row?.status === "active" ? "Inactive" : "Active"}
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>;
    }
  },
];

export const columnsMonitoringHistory = ({ setDeleteModal, setRowData }) => [
  {
    name: "Report Name",
    selector: (row) => row?.report_name || "",
    sortable: true,
    grow: 1,
    cell: (row) => (
      <span title={row?.report_name}>
        {row?.report_name?.length > 120
          ? `${row?.report_name?.substring(0, 120)}...`
          : row?.report_name}
      </span>
    ),
  },
  {
    name: "Comment",
    selector: (row) => row?.description || "",
    sortable: true,
    grow: 3,
    cell: (row) => (
      <span title={row?.description}>
        {row?.description?.length > 120
          ? `${row?.description?.substring(0, 120)}...`
          : row?.description}
      </span>
    ),
  },
  {
    name: "Created At",
    selector: (row) => new Date(row?.created_on),
    sortable: true,
    cell: (row) => formatDate(row?.created_on, "MM/dd/yyyy"),
  },
  {
    name: "Action",
    button: true,
    cell: (row) => (
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
              setDeleteModal(true);
              setRowData(row);
            }}
          >
            <img src={DeleteIcon} className="me-2" />
            Delete
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    ),
  },
];

export const columnsJourney = () => [
  {
    name: "Date",
    selector: (row) => {
      const dateValue = row?.date || row?.watched_at;
      if (!dateValue) return "NA";
      try {
        return formatDate(dateValue, "MM/dd/yyyy");
      } catch {
        return "NA";
      }
    },
    sortable: true,
  },
  {
    name: "Category Name",
    selector: (row) =>
      row?.category_name
        ? row?.category_name.charAt(0).toUpperCase() + row?.category_name.slice(1)
        : "NA",
    sortable: true,
  },
  {
    name: "Video",
    selector: (row) => (
      <span title={row?.title}>
        {row?.title?.length > 45
          ? `${row?.title.substring(0, 45)}...`
          : row?.title || "NA"}
      </span>
    ),
    sortable: true,
    grow: 2,
  },
  { 
    name: "Description",
    selector: (row) => (
      <span title={row?.description}>
        {row?.description?.length > 45
          ? `${row?.description.substring(0, 45)}...`
          : row?.description || "NA"}
      </span>
    ),
    sortable: true,
    grow: 2,
  },
  {
    name: "Duration",
    selector: (row) => row?.video_duration || "Rest Day",
    sortable: true,
  },
  {
    name: "Status",
    cell: (row) => {
      if (row?.isCompletedVideo) {
        return <div className="active-btn">Completed</div>;
      }

      if (row?.title === "Rest Day") {
        return <div style={{ paddingLeft: "10px" }}>Rest Day</div>;
      }

      return (
        <div className={row?.value ? "active-btn" : "inactive-btn"}>
          {row?.value ? "Completed" : "Not Done"}
        </div>
      );
    },
    sortable: true,
  },
];


export const columnsTask = ({ setDeleteModal, setRowData, handleEdit, navigateUserDetail, handleClone, actorType }) => [
  {
    name: "Template Name",
    cell: (row) => (
      <span className="reset-password" style={{ cursor: "pointer", fontSize: "13px" }} onClick={() => navigateUserDetail(row)}>
        {row?.template_name}
      </span>
    ),
    selector: (row) => row?.template_name,
    sortable: true
  },
  {
    name: "Diagnosis",
    selector: (row) => row?.diagnosis,
    sortable: true,
  },
  {
    name: "Pain Score Range",
    selector: (row) =>
      row?.pain_score?.from != null && row?.pain_score?.to != null
        ? `${row.pain_score.from} to ${row.pain_score.to}`
        : "N/A",
    sortable: true,
  },
  {
    name: "No. Of Days",
    selector: (row) => Array.isArray(row?.days) ? `${row.days.length} Days` : "0 Days",
    sortable: true,
  },
  {
    name: "Created By",
    selector: (row) =>  row?.created_by_name && row?.created_by ? `${row?.created_by} - (${row?.created_by_name})` : "NA",
    sortable: true,
  },
  {
    name: "Action",
    button: true,
    cell: (row) => (
      <div className="">
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
            <CDropdownItem onClick={() => handleClone(row)}
            >
              <img loading="lazy" src={Copy} className="me-2" alt="Clone" />
              Clone
            </CDropdownItem>
            <CDropdownItem onClick={() => handleEdit(row)} >
              <img loading="lazy" src={Edit} className="me-2" />
              Edit
            </CDropdownItem>
            {actorType === "admin" && (
              <CDropdownItem onClick={() => { setDeleteModal(true); setRowData(row); }}>
                <img src={DeleteIcon} className="me-2" />
                Delete
              </CDropdownItem>
            )} 
          </CDropdownMenu>
        </CDropdown>
      </div>
    ),
  },
];

// const formatDateRange = (row) => {
//   const startDate = new Date(row.date_range.start_date);
//   const endDate = new Date(row.date_range.end_date);

//   // Adjust end_date to UTC midnight to avoid local timezone shift
//   const normalizedEndDate = new Date(endDate.setUTCHours(0, 0, 0, 0));

//   return `${format(startDate, "MM/dd/yyyy")} - ${format(normalizedEndDate, "MM/dd/yyyy")}`;
// };

export const columnsTaskStatus = ({ deleteModalTrue, openAssignedTaskCanva }) => [
  {
    name: "Date",
    // selector : (row) => row.date,
    selector: (row) => formatDate(row?.date, "MM/dd/yyyy"),
    sortable: true,
  },
  {
    name: "Category Name",
    selector: (row) => row?.category_name
      ? row?.category_name?.charAt(0)?.toUpperCase() + row?.category_name?.slice(1)
      : "",
    sortable: true,
  },
  {
    name: "Video",
    selector: (row) => (
      <span title={row?.title}>
        {row?.title?.length > 20
          ? `${row?.title?.substring(0, 45)}...`
          : row?.title}
      </span>
    ),
    sortable: true,
    grow: 2

  },
  {
    name: "Description",
    selector: (row) => (
      <span title={row?.description}>
        {row?.description?.length > 20
          ? `${row?.description?.substring(0, 45)}...`
          : row?.description}
      </span>
    ),
    sortable: true,
    grow: 2
  },
  {
    name: "Duration",
    selector: (row) => row?.video_duration,
    sortable: true,
  },
  {
    name: "Assigned On",
    selector: (row) => formatDate(row?.assigned_on, "MM/dd/yyyy"),
    sortable: true,
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
            <CDropdownItem onClick={() => openAssignedTaskCanva(row)}>
              <img loading="lazy" src={Edit} className="me-2" />
              Edit
            </CDropdownItem>
            <CDropdownItem onClick={() => deleteModalTrue(row)} >
              <img src={DeleteIcon} className="me-2" />
              Delete
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>
    ),
  },
];

export const columnsClinicDetails = ({ setCloneUser, setFormData, setUpdateUser, setEdit, setDeleteModal, setDeleteModalPatient, handleEditClick }) => [
  {
    name: "User ID",
    selector: (row) => row?.user_id,
    sortable: true,
  },
  {
    name: "Name",
    selector: (row) => {
      const mdType = row?.md_type ? `${row.md_type}.` : "";
      const lastName = row?.last_name || "";
      const middleInitial = row?.middle_name?.charAt(0)?.toUpperCase() || "";
      const firstName = row?.first_name || "";

      return `${mdType} ${lastName} ${middleInitial} ${firstName}`.trim();
    },

    sortable: true,
  },
  {
    name: "User Type",
    selector: (row) => row?.userType,
    sortable: true,
  },
  {
    name: "Registered On",
    selector: (row) => formatDate(row?.createdAt, "MM/dd/yyyy"),
    sortable: true,
  },
  {
    name: "Status",
    selector: (row) => row.status,
    sortable: true,
    cell: (row) => {
      return (
        <>
          {row?.status === "inactive" ? (
            <div className="inactive-btn ">Inactive</div>
          ) : (row?.status === "active" ? (
            <div className="active-btn">Active</div>) : (<div className="pending-btn">Pending</div>)
          )}
        </>
      );
    },
  },
  {
    name: "Action",
    button: true,
    cell: (row) => (
      <div className="">
        {row?.status === "active" || row?.status === "pending" ? <>
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
              {(row?.userType === 'Coach' || row?.userType === 'Provider' && (
                <CDropdownItem
                  onClick={() => {
                    setCloneUser(true);
                    setFormData(row);
                  }}
                >
                  <img loading="lazy" src={Copy} className="me-2" alt="Clone" />
                  Clone
                </CDropdownItem>
              ))}

              <CDropdownItem
                onClick={() => {
                  if (handleEditClick) {
                    handleEditClick(row);
                  } else {
                    setUpdateUser(true);
                    setFormData(row);
                    setEdit(row);
                  }
                }}
              >
                <img loading="lazy" src={Edit} className="me-2" alt="Edit" />
                Edit
              </CDropdownItem>
              <CDropdownItem

                onClick={() => {
                  if (row?.userType === "Provider") {
                    setDeleteModal(true);
                  } else if (row?.userType === "Patient") {
                    setDeleteModalPatient(true);
                  }
                  setEdit(row);
                }}
              >
                <img src={DeleteIcon} className="me-2" />
                Delete
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown> </> : null}
      </div>
    ),
  },
];

const formatTime = (timeInSeconds) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  return `${hours} hr ${minutes} min ${seconds} sec`;
};
export const columnsClinicDetailAdmin = ({ setQuestionaryModal, setRowData, sortField, handleDiagnosisModal }) => [
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }} >
        Patient ID{sortField === 'patient_id'}
      </span>
    ),
    selector: (row) => row?.patient_id,
    sortField: 'patient_id',
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }} >
        Registered On{sortField === 'createdAt'}
      </span>
    ),
    selector: (row) => formatDate(row?.createdAt || row?.createdAt, "MM/dd/yyyy"),
    sortField: 'createdAt',
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }}   >
        Patient Name{sortField === 'last_name'}
      </span>
    ),
    selector: (row) => `${row?.last_name || ""} ${row?.middle_name?.charAt(0)?.toUpperCase() || ""} ${row?.first_name || ""}`,
    sortField: 'last_name',
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }} >
        Diagnosis
      </span>
    ),
    id: 'diagnosis',
    sortField: 'diagnosis',
    selector: (row) => row?.diagnosis,
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }}  >
        Provider{sortField === 'provider.last_name'}
      </span>
    ),
    selector: (row) => `${row?.provider?.last_name ? row?.provider?.last_name : ""} ${row?.provider?.middle_name ? row?.provider?.middle_name?.charAt(0)?.toUpperCase() : ""} ${row?.provider?.first_name ? row?.provider?.first_name : ""}`,
    sortField: 'provider.last_name',
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }}  >
        Time Spent{sortField === 'sessions.total_time_spend'}
      </span>
    ),
    selector: (row) => {
      const timeSpent = row?.sessions?.total_time_spend;
      return timeSpent ? formatTime(timeSpent) : "N/A";
    },
    sortField: 'sessions.total_time_spend',
    sortable: true,
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }}  >
        Approval{sortField === 'status'}
      </span>
    ),
    selector: (row) => row.status,
    sortField: 'status',
    sortable: true,
    cell: (row) => {
      return (<div>
        {row?.status == "active" ? (
          <div className="active-btn  mt-3">Approved</div>
        ) : (
          <div
            className="inactive-btn mt-3"
          >
            Inactive
          </div>
        )}
      </div>
      );
    },
  },
  {
    name: (
      <span style={{ cursor: 'pointer', userSelect: 'none' }}  >
        Last Active {sortField === 'lastLoginDate'}
      </span>
    ),
    selector: (row) =>
      formatDate(
        row?.lastLoginDate || row?.lastLoginDate,
        "MM/dd/yyyy"
      ),
    sortField: 'lastLoginDate',
    sortable: true,
  },
  {
    name: "Action",
    button: true,
    cell: (row) => (
      <div className="">
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
                setQuestionaryModal(true);
                setRowData(row);
              }}
            >
              <FontAwesomeIcon icon={faShare} className="me-2 text-success" />
              Send Questionnaire
            </CDropdownItem>
            <CDropdownItem onClick={() => handleDiagnosisModal(row)}>
              <img loading="lazy" src={Diagnose} className="me-2" alt="Diagnose" />
              Associate Diagnosis
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>
    ),
  },
];

export const columnBilledStatus = ({
  navigateUserDetail,
}) => [
    {
      name: "Billing ID",
      selector: (row) => row.invoiceNumber,
      cell: (row) => (
        <span
          className="reset-password"
          style={{ cursor: "pointer", fontSize: "13px" }}
          onClick={() => navigateUserDetail(row)}
        >
          {row?.invoiceNumber}
        </span>
      ),
      sortable: true
    },
    {
      name: "Name",
      selector: (row) => row.patient_name,
      cell: (row) => (
        <div className="d-flex" data-tag="allowRowEvents">
          <div aria-hidden="true">{`${row?.patient_name}`}</div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Insurance",
      selector: (row) => row.insurance,
      cell: (row) => (
        <div className="d-flex" data-tag="allowRowEvents">
          <div aria-hidden="true">{`${row?.insurance ? row?.insurance : "-"}`}</div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "CPT Codes (Units)",
      selector: (row) => row.cptCodes,
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
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => (
        <div className="d-flex" data-tag="allowRowEvents">
          <div aria-hidden="true">
            {row?.status}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Billing Date",
      selector: (row) => {
        const dateValue =
          row?.status === "Pending"
            ? row?.createdAt
            : row?.status === "Cancelled"
              ? row?.cancelled_at
              : row?.billed_at;
        return dateValue ? formatDate(dateValue, "MM/dd/yyyy") : "-";
      },
      sortable: true,
    },    
    {
      name: "Payment Received Date",
      selector: (row) => row?.payment_received_date ? formatDateOnly(
        row?.payment_received_date || row?.payment_received_date,
        "MM/dd/yyyy"
      ) : "-"
      ,
      sortable: true,
    },
  ];

export const columnMyPatientNotes = ({ deleteModalTrue, setRowdata }) => [
  {
    name: "Notes",
    selector: (row) => row.description,
    grow: 2,
    sortable: true,
  },
  {
    name: "Call Personal Notes / Coach Notes",
    selector: (row) => row.docType,
    grow: 1,
    sortable: true,
  },

  {
    name: "Created On",
    selector: (row) => formatDate(row?.date, "MM/dd/yyyy"),
    sortable: true,
  },
  {
    name: "Action",
    button: true,
    cell: (row) => (
      <div className="">
        {row.docType === "notes" ?
          <>
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
                  onClick={() => { deleteModalTrue(row); setRowdata(row); }}

                >
                  <img src={DeleteIcon} className="me-2" />
                  Delete
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown> </> : "--"}

      </div>
    ),
  },
];

export const columnsProviderNotes = () => [
  {
    name: "Month",
    cell: (row) => row?.month || '-',
    sortable: true,
  },
  {
    name: "Provider Comments",
    cell: (row) => row?.comment_to_coach || '-',
    sortable: true,

  },
  {
    name: "Provider Decision",
    selector: (row) => row.providerDecision || '-',
    sortable: true,
  },
  {
    name: "Requested By",
    selector: (row) => row?.requestedBy?.name || '-',
    sortable: true,
  },
  {
    name: "Created On",
    selector: (row) => row?.createdAt ? formatDate(row?.createdAt, "MM/dd/yyyy") : '-',
    sortable: true,
  },
];


export const CustomSortIcon = ({ column, sortBy, sortOrder, handleSort }) => {
  const isActive = sortBy === column.sortField;
  const direction = isActive && sortOrder === 'asc' ? 'desc' : 'asc';

  return (
    <button
      onClick={e => {
        e.stopPropagation();
        handleSort(column.sortField, direction);
      }}
      style={{
        background: 'none',
        border: 'none',
        padding: '0 5px',
        cursor: 'pointer',
      }}
      tabIndex={-1}
    >
      <img
        src={Sorticon}
        alt="Sort"
        style={{
          width: '16px',
          filter: isActive ? 'none' : 'opacity(0.6)',
          transform: isActive && sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}
      />
    </button>
  );
};

export const auditLogColumns = [
  {
    name: 'User Name',
    selector: row => row.actorId ? `${row.actorId.last_name || ''} ${row.actorId.middle_name?.charAt(0)?.toUpperCase() || ''} ${row.actorId.first_name || ''}`.trim() + `${row.actorId.clinic_name || ''}` : '',
    sortField: 'actorId',
  },
  {
    name: 'User Role',
    selector: row => row.actorType,
    sortField: 'actorType',
  },
  {
    name: 'Module',
    selector: row => row.targetType,
    sortField: 'targetType',
  },
  {
    name: 'Record',
    width: "350px",
    selector: row => {
      const firstName = row?.details?.after?.first_name || '';
      const lastName = row?.details?.after?.last_name || '';
      const clinicName = row?.details?.after?.clinic_name || '';
      const invoiceNumber = row?.details?.after?.successful?.[0]?.data?.invoiceNumber || '';
      const templateName = row?.details?.after?.template_name || '';
      const Chilltitle = row?.details?.after?.title || '';
      const billingPolicy = row?.details?.after?.document_name || '';
      const deleteLearn = row?.details?.before?.title || '';
      const deleteRTM = row?.details?.before?.document_name || '';
      const deleteTask = row?.details?.after?.category_name || '';
      const approval = row?.details?.approval || '';
      const diagnosis = row?.details?.diagnosis || '';
      const taskdetails = row?.details?.category || '';
      const mdNotes = row?.details?.mdNotes || '';
      const monthBilling = row?.details?.after?.invoiceNumber || '';
      const chatMdNOtes = row?.details?.task_name || '';


      const otherData = [
        lastName, firstName, clinicName, invoiceNumber, templateName,
        Chilltitle, billingPolicy, deleteLearn, deleteRTM,
        deleteTask, approval, diagnosis, taskdetails, mdNotes, monthBilling, chatMdNOtes
      ].filter(Boolean).join(' ');

      return otherData
        ? `${row.module} - ${otherData}`.trim()
        : `${row.module}`.trim();
    },
    sortField: 'module',
  },
  {
    name: 'Action',
    selector: row => row.action,
    sortField: 'action',
  },
  {
    name: 'Event Date',
    selector: row => row.timestamp
      ? formatDate(row.timestamp, "MM/dd/yyyy, hh:mm:ss a")
      : "-",
    sortField: 'timestamp',
  }
];

export const EngagemenetMedicineColumns = () => [
  {
    name: 'Date Logged',
    selector: (row) => formatDateOnly(row?.log_date, "MM/dd/yyyy"),
    sortable: true,
  },
  {
    name: 'Medicine Name',
    selector: (row) => Array.isArray(row?.flare_up_medicine)
      ? row.flare_up_medicine.join(", ")
      : row?.flare_up_medicine || "-",
    cell: (row) => {
      const medicines = Array.isArray(row?.flare_up_medicine)
        ? row.flare_up_medicine.join(", ")
        : row?.flare_up_medicine || "-";

      return (
        <div
          title={medicines}
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {medicines}
        </div>
      );
    },
    sortable: true,
  },
  {
    name: 'Use Frequency',
    selector: (row) => row?.Medicine_time || "-",
    sortable: true,
  },
  {
    name: 'Logged Reason',
    selector: (row) => row?.logged,
    sortable: true,
  },
  {
    name: 'Patient Reported Benefit',
    selector: (row) => row.helpful || "-",
    sortable: true,
  },
];


const categoryMap = {
  pain_spike: "Pain Spike",
  factors: "Factor",
};


export const EngagemenetFactorsColumns = () => [
  {
    name: 'Date Logged',
    selector: (row) => formatDate(row?.created_at, "MM/dd/yyyy"),
    sortable: true,
  },
  {
    name: 'Factor',
    selector: (row) => categoryMap[row?.category] || null,
    sortable: true,
  },
  {
    name: 'Type',
    selector: (row) => row?.type || "-",
    sortable: true,
  },
  {
    name: 'Duration',
    selector: (row) => row.duration || "-",
    sortable: true,
  },
  {
    name: 'Mood',
    selector: (row) => row.mood || "-",
    sortable: true,
  },
  {
    name: 'Influenced By',
    selector: (row) => row.influence_by || "-",
    sortable: true,
  },
   {
    name: 'Pain Intensity',
    selector: (row) => row.pain_intensity || "-",
    sortable: true,
  },  

  {
    name: 'Notes',
    selector: (row) => row.note || "-",
     cell: (row) => (
      <span title={row?.note}>
        {row?.note}
      </span>
    ),
    sortable: true,
  },
];