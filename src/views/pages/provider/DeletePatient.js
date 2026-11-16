import React from "react";
import DataTable from "react-data-table-component";
import Sorticon from "../../../assets/icons/sort.png";
import PaginationComponent from "../../../utils/Pagination";

const DeletedPatient = ({
    isPatientLoading,
    filteredDeletedItems,
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

    return (
        <div className="flex flex-column">
            <div className="mt-2">
                <DataTable
                    columns={columns}
                    data={filteredItems || []}
                    customStyles={customStyles}
                    progressPending={isPatientLoading}
                    highlightOnHover={pointerShow === true ? true : false}
                    pointerOnHover={pointerShow === true ? true : false}
                    onRowClicked={pointerShow === true ? (row) => navigateMypatientDetail(row) : undefined}
                    subHeaderComponent={subHeaderComponentMemo}
                    responsive={true}
                    sortServer
                    onSort={(column, sortDirection) => {
                        handleSort(column.selector, sortDirection);
                    }}
                    defaultSortFieldId={sortField}
                    defaultSortAsc={sortDirection === 'asc'}
                    sortIcon={<img loading="lazy" src={Sorticon} alt="sort" />}
                    noDataComponent={
                        <div className="p-5">
                            <h6 className="text-center">No Inactive Patients Found</h6>
                        </div>
                    }
                />
            </div>
            {filteredDeletedItems?.totalRecord > 0 && (
                <PaginationComponent
                    className="mb-5"
                    totalRecords={filteredDeletedItems?.totalRecord}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
            )}
        </div>
    );
};

export default DeletedPatient;