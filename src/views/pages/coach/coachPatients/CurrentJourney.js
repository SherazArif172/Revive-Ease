import { TablePagination } from "@mui/material";
import React from "react";
import DataTable from "react-data-table-component";
import { customStylesJourney } from "../../../../Components/DataTable/CustomStyle";
import { columnsJourney } from "../../../../Components/DataTable/commonColumn";
import Sorticon from "../../../../assets/icons/sort.png";

const CurrentJourney = ({ getAllPatientIsLoading, assignedTaskJourney, currentTab, patientData, rowsPerPage, setRowsPerPage, currentPage, setCurrentPage }) => {
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage + 1);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    handlePageChange(null, 0);
  };

  const columns = columnsJourney();
 
  return (
    <>
      <div className="default-container ps-3 mt-3  bg-white">
        <div className="mb-3 ">
          <div className="tab-head pt-2">{currentTab}</div>
        </div>

        <div className="">
          <DataTable
            columns={columns}
            data={patientData?.assignedTaskJourney}
            customStyles={customStylesJourney}
            progressPending={getAllPatientIsLoading}
            responsive={true}
            sortIcon={
              <>
                <img loading="lazy" src={Sorticon} />
              </>
            }
          />
          
          {assignedTaskJourney?.totalRecords > 0 ?
            <div
              className="mt-3 mb-5"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "end",
              }}
            >
              <TablePagination
                component="div"
                count={assignedTaskJourney?.totalRecords}
                page={currentPage - 1}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 15, 20]}
              />
            </div> : null}
        </div>
      </div>
    </>
  );
};

export default CurrentJourney;
