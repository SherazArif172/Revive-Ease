import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Sorticon from "../../../../../assets/icons/sort.png";
import { customStylesCoachReport } from "../../../../../Components/DataTable/CustomStyle";
import { useGetPatientByIdQuery } from "../../../../../redux/apis/allPatient_api";
import { useSelector } from "react-redux";
import { useDeleteMonitoringHistoryMutation } from "../../../../../redux/apis/md_notes_api";
import DeleteModal from "../../../../../Components/Modal/DeleteModal";
import { columnsMonitoringHistory } from "../../../../../Components/DataTable/commonColumn";
import { TablePagination } from "@mui/material";

const CoachReports = () => {

  const coachReport = useSelector((state) => state?.allPatients?.patient?.patientData);
  const paginationCoachReport = useSelector((state) => state?.allPatients?.patient?.pagination);
  const patientId = useSelector((state) => state?.allPatients?.patient?.patientData?._id);

  const [rowData, setRowData] = useState();
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // eslint-disable-next-line no-unused-vars
  const { data: patientDatas, refetch } = useGetPatientByIdQuery({ id: patientId, graphType: "Login_data", page: currentPage, rowsPerPage: rowsPerPage, currentTab: "coach_report" });
  const [deleteMonitoringHistory, { isSuccess }] = useDeleteMonitoringHistoryMutation();

  const column = columnsMonitoringHistory({ setDeleteModal, setRowData });

  useEffect(() => {
    if (isSuccess) {
      setDeleteModal(false);
      refetch();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (patientId) {
      refetch();
    }
  }, [patientId]);

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage + 1);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    handlePageChange(null, 0);
  };

  const onClose = () => {
    setDeleteModal(false);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    deleteMonitoringHistory(rowData?._id);
  };

  return (
    <>
      <div className="py-2">
        <DataTable
          className=""
          customStyles={customStylesCoachReport}
          columns={column}
          data={coachReport?.coach_to_mdreport}
          sortable
          sortIcon={
            <>
              <img loading="lazy" src={Sorticon} />
            </>
          }
        />
        {paginationCoachReport?.coachToMdreport?.totalRecords > 0 ?
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
              count={paginationCoachReport?.coachToMdreport?.totalRecords}
              page={currentPage - 1}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 15, 20]}
            />
          </div> : null}
        <DeleteModal
          content={"Do you want to delete this?"}
          deleteModal={deleteModal}
          onClose={onClose}
          onConfirm={handleDelete}
        />

      </div>

    </>
  );
};

export default CoachReports;

