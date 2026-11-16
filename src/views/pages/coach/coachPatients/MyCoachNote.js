import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useGetMyCoachingNotesQuery, useUpdateRoleMutation } from "../../../../redux/apis/role_api";
import { useSelector } from "react-redux";
import Sorticon from "../../../../assets/icons/sort.png";
import { customStylesMyNotes } from "../../../../Components/DataTable/CustomStyle";
import { columnMyPatientNotes, columnsProviderNotes } from "../../../../Components/DataTable/commonColumn";
import DeleteModal from "../../../../Components/Modal/DeleteModal";
import { toast } from "react-toastify";
import { TablePagination } from "@mui/material";
import { Box, Tab } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { useGetPatientSignoffEscalationsQuery } from "../../../../redux/apis/md_notes_api";

const MyCoachNote = ({ patientId, activeSubTab, onSubTabChange }) => {

    const myNotes = useSelector((state) => state?.allCoach?.myCoachingNotes);
    const id = useSelector((state) => state?.user?.id);
    const userType = useSelector((state) => state?.user?.userType);
    const [deleteModal, deleteModalTrue] = useState(false);
    const [rowData, setRowdata] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const tab = activeSubTab || "Coach Notes";

    const handleTabChange = (event, newValue) => {
        if (onSubTabChange) {
            onSubTabChange(event, newValue);
        }
    };

    // Provider Notes state for MD Notes tab
    const [providerPage, setProviderPage] = useState(1);
    const [providerRowsPerPage, setProviderRowsPerPage] = useState(10);
    // Fetch provider notes for MD Notes tab
    const { data: providerNotesData, isLoading: isLoadingProviderNotes } = useGetPatientSignoffEscalationsQuery({ patient_id: patientId, page: providerPage, limit: providerRowsPerPage });

    // eslint-disable-next-line no-unused-vars
    const { data: myCoachingNote, refetch, isLoading: isMyCoachingNotes } = useGetMyCoachingNotesQuery({ patientId: patientId, page: currentPage, limit: rowsPerPage });
    const [deleteMyNote, { isSuccess, isError }] = useUpdateRoleMutation();

    useEffect(() => {
        if (patientId) {
            refetch();
        }
    }, [patientId]);

    useEffect(() => {
        if (isSuccess) {
            onclose();
            refetch();
        }
        if (isError) {
            toast.error("Failed to Add Note!");
        }
    }, [isError, isSuccess]);

    const handlePageChange = (event, newPage) => {
        setCurrentPage(newPage + 1);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        handlePageChange(null, 0);
    };

    const columns = columnMyPatientNotes({ setRowdata, deleteModalTrue });

    const onclose = () => {
        deleteModalTrue(false);
    };

    const confirmDelete = (e) => {
        e.preventDefault();
        let payload = {
            isMyCoachingNotes: {
                delete_note_id: rowData?._id,
                actorId: id,
                actorType: userType
            }
        };
        deleteMyNote({ id: patientId, payload: payload });
    };

    return (
        <div className="default-container ps-3 mt-3 bg-white">
            <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="salmanss">
                    <TabList
                        className="salman"
                        onChange={handleTabChange}
                        aria-label="lab API tabs example"
                    >
                        <Tab label="Coach Notes" value="Coach Notes" className="no-bg-tabs fs-16 font-color capitalize-tab" />
                        <Tab label="MD Notes" value="MD Notes" className="no-bg-tabs fs-16 font-color capitalize-tab" />
                    </TabList>
                </Box>
                <TabPanel value="Coach Notes">
                    <DataTable
                        className="mt-3 mb-5"
                        columns={columns}
                        data={myNotes?.data}
                        progressPending={isMyCoachingNotes}
                        customStyles={customStylesMyNotes}
                        responsive={true}
                        sortIcon={<img loading="lazy" src={Sorticon} />}
                    />
                    {myNotes?.totalRecords > 0 ?
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
                                count={myNotes?.totalRecords}
                                page={currentPage - 1}
                                onPageChange={handlePageChange}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                rowsPerPageOptions={[5, 10, 15, 20]}
                            />
                        </div> : null}
                </TabPanel>
                <TabPanel value="MD Notes">
                    <DataTable
                        className="mt-3 mb-5"
                        columns={columnsProviderNotes()}
                        data={providerNotesData?.data?.signOffRequests || []}
                        progressPending={isLoadingProviderNotes}
                        customStyles={customStylesMyNotes}
                        responsive={true}
                        sortIcon={<img loading="lazy" src={Sorticon} />}
                    />
                    {providerNotesData?.data?.pagination?.totalSignoffs > 0 ?
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
                                count={providerNotesData?.data?.pagination?.totalSignoffs}
                                page={providerPage - 1}
                                onPageChange={(_, newPage) => setProviderPage(newPage + 1)}
                                rowsPerPage={providerRowsPerPage}
                                onRowsPerPageChange={e => { setProviderRowsPerPage(parseInt(e.target.value, 10)); setProviderPage(1); }}
                                rowsPerPageOptions={[5, 10, 15, 20]}
                            />
                        </div> : null}
                </TabPanel>
            </TabContext>
            <DeleteModal
                onClose={onclose}
                deleteModal={deleteModal}
                content={"Do you really want to delete this Note?"}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default MyCoachNote;

