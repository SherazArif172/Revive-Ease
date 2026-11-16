import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Sorticon from "../../../assets/icons/sort.png";
import { customStylesMdNotes } from "../../../Components/DataTable/CustomStyle";
import { columnsMDNotes } from "../../../Components/DataTable/commonColumn";
import DeleteModal from "../../../Components/Modal/DeleteModal";
import { useDeleteMdNotesMutation } from "../../../redux/apis/md_notes_api";
import { TablePagination } from "@mui/material";

const MDNotes = ({isLoadingPatientData , mdNotesData, refetch, setMdNotesCanva, setRowData, rowData, setEdit, page, rowsPerPages, handleChangePagess, handleChangeRowsPerPagess, pagination }) => {

  const [deletedModel, setDeleteModal] = useState(false);

  const [deleteMdNotes, { isSuccess: deleletMdNotesSuccess }] = useDeleteMdNotesMutation();
  const columns = columnsMDNotes({ setDeleteModal, setRowData, setMdNotesCanva, setEdit });

  useEffect(() => {
    if (deleletMdNotesSuccess) {
      refetch();
      setDeleteModal(false);
    }
  }, [deleletMdNotesSuccess]);

  const onClose = () => {
    setDeleteModal(false);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    deleteMdNotes(rowData?._id);
  };

  return (
    <>
      <div>
        <DataTable
          columns={columns}
          data={mdNotesData}
          progressPending = {isLoadingPatientData} 
          customStyles={customStylesMdNotes}
          responsive={true}
          sortIcon={
            <>
              <img loading="lazy" src={Sorticon} />
            </>
          }
        />
        <DeleteModal
          deleteModal={deletedModel}
          content={"Do you want to delete this note?"}
          onClose={onClose}
          onConfirm={handleDelete}
        />
      </div>
      {pagination?.mdnotes?.totalRecords > 0 ?
        <div
          className="mt-3 "
          style={{ display: "flex", flexDirection: "row", justifyContent: "end" }}
        >
          <TablePagination
            component="div"
            count={pagination?.mdnotes?.totalRecords}
            page={page - 1}
            onPageChange={handleChangePagess}
            rowsPerPage={rowsPerPages}
            onRowsPerPageChange={handleChangeRowsPerPagess}
            rowsPerPageOptions={[5, 10, 15, 20]}
          />
        </div> : null}
    </>
  );
};

export default MDNotes;
