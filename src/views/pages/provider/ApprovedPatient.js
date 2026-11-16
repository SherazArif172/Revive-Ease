import React, { useState } from "react";
import DataTable from "react-data-table-component";
import Sorticon from "../../../assets/icons/sort.png";
import PaginationComponent from "../../../utils/Pagination";

const ApprovedPatient = ({
  handleNavigateRowClick,
  isPatientLoading,
  filteredApprovedItems,
  filteredItems,
  subHeaderComponentMemo,
  columns,
  customStyles,
  rowsPerPage,
  page,
  handleChangePage,
  handleChangeRowsPerPage,
  pointerShow,
  navigateMypatientDetail,
  handleSort,
  sortField,
  sortDirection,
}) => {

  const [localSortConfig, setLocalSortConfig] = useState({
    field: sortField,
    direction: sortDirection
  });

  const handleLocalSort = (column, sortDirection) => {
    const field = column.sortField || column.id || column.selector;
    setLocalSortConfig({ field, direction: sortDirection });

    // Only call the parent sort handler if the sort actually changed
    if (field !== sortField || sortDirection !== localSortConfig.direction) {
      handleSort(field, sortDirection);
    }
  };

  return (
    <div className="flex flex-column">
      <div className="mt-2">
        <DataTable
          columns={columns}
          data={filteredItems}
          sortServer
          onSort={handleLocalSort}
          customStyles={customStyles}
          progressPending={isPatientLoading}
          highlightOnHover
          pointerOnHover
          onRowClicked={
            pointerShow === true
              ? (row) => navigateMypatientDetail(row)
              : (row) => handleNavigateRowClick(row)
          }
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
          defaultSortFieldId={sortField}
          defaultSortAsc={sortDirection === 'asc'}
          sortIcon={<img loading="lazy" src={Sorticon} />}
        />
      </div>
      <PaginationComponent
        className="mb-5"
        totalRecords={filteredApprovedItems?.totalRecord}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default ApprovedPatient;
