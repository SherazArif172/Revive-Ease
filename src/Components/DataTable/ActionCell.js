import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import DeleteIcon from "../../assets/icons/trash-2.png";
import Check from "../../assets/icons/check.png";
import Edit from "../../assets/icons/edit.png";
import Diagnose from "../../assets/icons/nurse.png";
import UserPlus from "../../assets/icons/user-plus.png";

const ActionCell = ({
  row,
  handleApproveModal,
  handleAssignModal,
  handleDeleteModal,
  tab,
  pendingPatient,
  handleEditModal,
  userType,
  handleDiagnosisModal,
  handleActivateModal,
}) => (
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
      {/* Activate option for inactive/deleted records */}
      {(tab === "Deleted" || row.status === "inactive") && (
        <CDropdownItem onClick={() => handleActivateModal(row)}>
          <img loading="lazy" src={Check} className="me-2" alt="Activate" />
          Activate
        </CDropdownItem>
      )}

      {/* Regular options for active records */}
      {(!tab || tab !== "Deleted") && row.status !== "inactive" && (
        <>
          {tab === "Approved" && (
            <CDropdownItem onClick={() => handleDiagnosisModal(row)}>
              <img loading="lazy" src={Diagnose} className="me-2" alt="Diagnose" />
              Associate Diagnosis
            </CDropdownItem>
          )}

          {tab === "Pending Approval" && (
            <CDropdownItem onClick={() => handleApproveModal(row)}>
              <img loading="lazy" src={Check} className="me-2" alt="Approve" />
              Approve
            </CDropdownItem>
          )}

          {tab !== "Pending Approval" && (
            <CDropdownItem onClick={() => handleAssignModal(row)}>
              <img loading="lazy" src={UserPlus} className="me-2" alt="Assign" />
              {userType === "clinic admin"
                ? "Assign Provider"
                : "Assign Provider & Coach"}
            </CDropdownItem>
          )}

          {pendingPatient !== "true" && (
            <>
              <CDropdownItem onClick={() => handleEditModal(row)}>
                <img loading="lazy" src={Edit} className="me-2" alt="Edit" />
                Edit
              </CDropdownItem>
              <CDropdownItem

                onClick={() => handleDeleteModal(row)}

              >
                <img src={DeleteIcon} className="me-2" alt="Delete" />
                Inactive
              </CDropdownItem>
            </>
          )}
        </>
      )}
    </CDropdownMenu>
  </CDropdown>
);

export default ActionCell;