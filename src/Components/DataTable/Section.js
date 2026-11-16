import React from "react";
import DataTable from "react-data-table-component";
import Addbutton from "../../assets/icons/plus.png";
import Sorticon from "../../assets/icons/sort.png";
import PaginationComponent from "../../utils/Pagination";


const Section = ({ title, columns, loading, data, customStyles, onCreateClick, userType, handleChangePage, rowsPerPage, handleChangeRowsPerPage, page }) => (
  <div className="mt-4">
    <div className="d-flex justify-content-between">
      <h6>
        <strong>{title}</strong>
      </h6>
      {
        userType !== "coach" ? (
          <button className="add-bt-wid-def flex-items-center" onClick={onCreateClick}>
            <img loading="lazy" src={Addbutton} height={12} width={14} className="" />
            <span className="ms-1">
              Create New
            </span>
          </button>) : null
      }
    </div>
    <div className="mt-3">
      <DataTable
        columns={columns}
        data={data?.data}
        progressPending={loading}
        customStyles={customStyles}
        responsive
        sortIcon={<img loading="lazy" src={Sorticon} />}
      />
    </div>
    <PaginationComponent
      totalRecords={data?.totalRecords}
      page={page}
      rowsPerPage={rowsPerPage}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    />
  </div>
);

export default Section;
