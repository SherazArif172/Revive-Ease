import React from "react";

import DataTable from "react-data-table-component";
import ApproveModal from "../../../Components/Modal/ApproveModal";
import AssignModal from "../../../Components/Modal/AssignModal";
import DeleteModal from "../../../Components/Modal/DeleteModal";
import Sorticon from "../../../assets/icons/sort.png";
import { progressComponent } from "../../../Components/DataTable/DataTableUtils";
import PaginationComponent from "../../../utils/Pagination";
import ApprovelConfirmationModal from "../../../Components/Modal/ApprovelConfirmationModal";
import { useGetAllProvierListQuery } from "../../../redux/apis/provider_api";

const PendingPatient = ({
  isPatientLoading,
  loading,
  filteredItems,
  filteredPendingItems,
  subHeaderComponentMemo,
  approveModalConfirm,
  setApproveModalConfirm,
  columns,
  sortField,
  sortDirection,
  handleSort,
  rowsPerPage, page, handleChangePage, handleChangeRowsPerPage, customStyles, selectedRowClinicId }) => {
  const [deleteModal, setDeleteModal] = React.useState(false);
  const [approveModal, setApproveModal] = React.useState(false);
  const [assignModal, setAssignModal] = React.useState(false);
  const [approveModalContent, setApproveModalContent] = React.useState(
    "Do you want to Approve this Patient?"
  );

  const [localSortConfig, setLocalSortConfig] = React.useState({
    field: sortField,
    direction: sortDirection
  });

  const handleLocalSort = (column, sortDirection) => {
    const field = column.selector;
    setLocalSortConfig({ field, direction: sortDirection });

    // Only call the parent sort handler if the sort actually changed
    if (field !== sortField || sortDirection !== localSortConfig.direction) {
      handleSort(field, sortDirection);
    }
  };
  const onClose = () => {
    setDeleteModal(false);
    setApproveModal(false);
    setApproveModalConfirm(false);
    setTimeout(() => {
      setApproveModalContent("Do you want to Approve this Patient?");
    }, 1000);
  };


  // Only fetch when clinic id is present; refetch on id change
  // eslint-disable-next-line no-unused-vars
  const { data: getAllProvider, refetch: providerRefetch } = useGetAllProvierListQuery(selectedRowClinicId, { skip: !selectedRowClinicId, refetchOnMountOrArgChange: true });
  React.useEffect(() => {
    if (selectedRowClinicId) providerRefetch();
  }, [selectedRowClinicId, providerRefetch]);

  const handleDeleteConfirm = () => {
    setDeleteModal(false);
  };

  const handleApprovalConfirm = () => {
    setApproveModalContent("Patient approved successfully.");
  };

  const handleAssignConfirm = () => {
    setAssignModal(false);
  };

  return (
    <>
      <div className="mt-2">

        {loading ? (
          progressComponent()
        ) :
          <DataTable
            columns={columns}
            data={filteredItems}
            progressPending={isPatientLoading}
            customStyles={customStyles}
            subHeaderComponent={subHeaderComponentMemo}
            responsive={true}
            sortServer
            onSort={handleLocalSort}
            defaultSortFieldId={sortField}
          defaultSortAsc={sortDirection === 'asc'}
            sortIcon={
              <>
                <img loading="lazy" src={Sorticon} />
              </>
            }
          />

        }
      </div>
      <PaginationComponent
        totalRecords={filteredPendingItems?.totalRecord}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />

      {/* ////////////////////////////////////////////////////////////     Approve Modal                       ////////////////////////////////////////////////////////////////////////////// */}

      <ApproveModal
        approveModal={approveModal}
        onConfirm={handleApprovalConfirm}
        content={approveModalContent}
        onClose={onClose}
      />
      <ApprovelConfirmationModal
        confirmationModal={approveModalConfirm}
        content={"Patient Approved Successfully."}
        onClose={onClose}
      />
      {/* ////////////////////////////////////////////////////////////                   Assign Modal                       //////////////////////////////////////////////////////////// */}

      <AssignModal
        onClose={onClose}
        onConfirm={handleAssignConfirm}
        assignModal={assignModal}
      />
      {/* ////////////////////////////////////////////////////////////     Delete Modal                       ////////////////////////////////////////////////////////////////////////////// */}

      <DeleteModal
        onClose={onClose}
        onConfirm={handleDeleteConfirm}
        deleteModal={deleteModal}
        content="Do you really want to Delete this Patient?"
      />
    </>
  );
};

export default PendingPatient;
