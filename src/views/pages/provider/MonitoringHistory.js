import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Sorticon from "../../../assets/icons/sort.png";
import { customStylesMonitoringHistory } from "../../../Components/DataTable/CustomStyle";
import { columnsMonitoringHistory } from "../../../Components/DataTable/commonColumn";
import DeleteModal from "../../../Components/Modal/DeleteModal";
import { useDeleteMonitoringHistoryMutation } from "../../../redux/apis/md_notes_api";
import { TablePagination } from "@mui/material";

const MonitoringHistory = ({ isLoadingPatientData ,messageData, refetch,page,handleChangePagess,rowsPerPages,handleChangeRowsPerPagess,msgPagination }) => {

  const [rowData, setRowData] = useState();
  const [deleteModal, setDeleteModal] = useState(false);

  const [deleteMonitoringHistory, {isSuccess}] = useDeleteMonitoringHistoryMutation();

  const column = columnsMonitoringHistory({setDeleteModal, setRowData});

  useEffect(() => {
    if(isSuccess){
      setDeleteModal(false);
      refetch();
    }
  }, [isSuccess]);

  const onClose = () => {
    setDeleteModal(false);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    deleteMonitoringHistory(rowData?._id);
  };

  return (
    <>
      <div>
        <DataTable
          columns={column}
          data={messageData?.coach_to_mdreport}
          progressPending = {isLoadingPatientData}           
          customStyles={customStylesMonitoringHistory}
          responsive={true}
          sortIcon={
            <>
              <img loading="lazy" src={Sorticon} />
            </>
          }
        />
        <DeleteModal
          content={"Do you want to delete this?"}
          deleteModal={deleteModal}
          onClose={onClose}
          onConfirm={handleDelete}
        />
      </div>  
      {msgPagination?.coachToMdreport?.totalRecords > 0 ?
      <div
          className="mt-3 "
          style={{ display: "flex", flexDirection: "row", justifyContent: "end" }}
        >
          <TablePagination
            component="div"
            count={msgPagination?.coachToMdreport?.totalRecords} 
            page={page - 1}
            onPageChange={handleChangePagess}
            rowsPerPage={rowsPerPages}
            onRowsPerPageChange={handleChangeRowsPerPagess}
            rowsPerPageOptions={[5, 10, 15, 20]}
          />
        </div> 
        : null } 


    </>
  );
};

export default MonitoringHistory;
