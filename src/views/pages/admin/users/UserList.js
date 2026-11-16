import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Filter from "../../../../assets/icons/filter.png";
import Sorticon from "../../../../assets/icons/sort.png";
import { useNavigate } from "react-router-dom";
import FilterComponent from "../../../../utils/FilterComponent";
import { customStylesUser } from "../../../../Components/DataTable/CustomStyle";
import { useGetAllUserQuery } from "../../../../redux/apis/allCoach_api";
import { useSelector } from "react-redux";
import DeleteModal from "../../../../Components/Modal/DeleteModal";
import { useDeleteClinicUserMutation } from "../../../../redux/apis/clinic_api";
import UserEdit from "./UserEdit";
import { columnsUserList } from "../../../../Components/DataTable/commonColumn";
import UserFilter from "./UserFilter";
import Addbutton from "../../../../assets/icons/plus.png";
import AddCoach from "./AddCoach";
import PaginationComponent from "../../../../utils/Pagination";
import SelectProvider from "../clinic/SelectProvider";
import ViewSelectedProvider from "../clinic/ViewSelectedProvider";
import { CModal, CModalBody, CModalTitle } from "@coreui/react";

const User = () => {
  const userListing = useSelector((state) => state?.allCoach?.user);

  const navigate = useNavigate();
  const [filterText, setFilterText] = useState("");
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState(false);
  const [deletedRowData, setDeletRowData] = useState(null);
  const [ressignModal, setRessignModal] = useState(false);
  const [reassignForm, setReassignForm] = useState({
    coach_id: "",
    provider_id: "",
  });
  const [ressignTigger, setRessignTigger] = useState(false);
  const [editModel, setEditModal] = useState(null);
  const [rowData, seteditedRowData] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addCoachModal, setAddCoachModal] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tempFilter, setTempFilter] = useState({
    startDate: null,
    endDate: null,
    status: "",
    userType: "",
  });
  const [filter, setFilter] = useState({
    startDate: null,
    endDate: null,
    status: "",
    userType: "",
  });
  const [sortBy, setSortBy] = useState("registered_on");
  const [sortOrder, setSortOrder] = useState("desc");
  const actorType = useSelector((state) => state.user?.userType);
  const actorId = useSelector((state) => state.user?.id);

  // eslint-disable-next-line no-unused-vars
  const {    data: user,
    refetch,
    isLoading: isUserlistLoading,
  } = useGetAllUserQuery(
    {
      searchText: filterText,
      filter: filter,
      page: page,
      rowsPerPage: rowsPerPage,
      sortBy,
      sortOrder,
    },
    {
      // Ensure data refetches when navigating back with the same params.
      refetchOnMountOrArgChange: true,
    }
  );
  // eslint-disable-next-line no-unused-vars
  const [deleteUser, { data, isSuccess: isSuccessDelete }] =
    useDeleteClinicUserMutation();
  const [formData, setFormData] = useState({
    first_name: rowData?.first_name || "",
    last_name: rowData?.last_name || "",
    middle_name: rowData?.middle_name || "",
    userType: rowData?.userType || "",
    email: rowData?.email,
    cell_number: rowData?.cell_number || "",
    gender: rowData?.gender || "",
    address_line_1: rowData?.address_line_1 || "",
    state: rowData?.state || "",
    city: rowData?.city || "",
    zipCode: rowData?.zip_code || "",
  });

  useEffect(() => {
    if (isSuccessDelete) {
      setRessignTigger(true);
      refetch();
    }
  }, [isSuccessDelete, refetch]);

  const onClose = () => {
    setDeleteModal(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (field, date) => {
    setTempFilter((prev) => {
      const updatedFilter = {
        ...prev,
        [field]: date,
      };

      // If startDate is being set and endDate is null, set endDate to today
      if (field === "startDate" && date && !prev.endDate) {
        updatedFilter.endDate = new Date();
      }

      return updatedFilter;
    });
  };

  const handleApplyFilter = () => {
    setFilter(tempFilter);
    setPage(1); // Reset to first page when applying filters
    setVisible(false);
  };

  const handleClearFilter = () => {
    setTempFilter({
      startDate: null,
      endDate: null,
      status: "",
      userType: "",
    });
    setFilter({
      startDate: null,
      endDate: null,
      status: "",
      userType: "",
    });
    setPage(1); // Reset to first page when clearing filters
  };

  const onclose = () => {
    setEditModal(false);
    setVisible(false);
    setAddCoachModal(false);
    setFormData({
      first_name: rowData?.first_name || "",
      last_name: rowData?.last_name || "",
      middle_name: rowData?.middle_name || "",
      email: rowData?.email || "",
      userType: rowData?.userType || "",
      cell_number: rowData?.cell_number || "",
      gender: rowData?.gender || "",
      address_line_1: rowData?.address_line_1 || "",
      state: rowData?.state || "",
      city: rowData?.city || "",
      zipCode: rowData?.zip_code || "",
    });
  };

  const navigateUserDetail = (row) => {
    navigate("/users/userDetail", { state: row });
  };

  const handleSort = (column, sortDirection) => {
    const sortField = column.sortField || column.selector;
    // Prevent setting empty sortBy - keep default if sortField is empty/undefined
    if (sortField) {
      setSortBy(sortField);
      setSortOrder(sortDirection);
      setPage(1); // Reset to first page when sorting changes
    }
  };
  // Use columnsUserList with sorting props
  const columns = React.useMemo(
    () =>
      columnsUserList({
        navigateUserDetail,
        setEditModal,
        seteditedRowData,
        setDeleteModal,
        setDeletRowData,
        setAction,
      }),
    [
      navigateUserDetail,
      setEditModal,
      seteditedRowData,
      setDeleteModal,
      setDeletRowData,
      setAction,
    ]
  );

  const deleteConfirmHandler = () => {
    setRessignModal(true);
  };

  const closeRessign = () => {
    setDeleteModal(false);
    setRessignModal(false);
    setRessignTigger(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const onChangeSelect = (e) => {
    const { name, value } = e.target;
    setReassignForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const ressignHandler = () => {
    let payload = {
      new_assignee_id:
        deletedRowData?.userType == "provider"
          ? reassignForm?.provider_id
          : reassignForm?.coach_id,
    };
    deleteUser({
      id: deletedRowData?._id,
      reassigId: payload,
      actorId: actorId,
      actorType: actorType,
    });
  };

  return (
    <>
      <div className="main-container mt-4">
        <div className="d-flex justify-content-between">
          <div className="font-color">
            <h6>
              <strong>Users</strong>
            </h6>
          </div>
          <div className="d-flex flex-wrap align-items-center justify-content-between mx-3">
            <div className="flex-grow-1 me-3 mb-2">
              <FilterComponent
                placeholder={"Search User by name & email"}
                onFilter={(e) => {
                  setFilterText(e.target.value);
                  setPage(1); // Reset to first page when search text changes
                }}
                filterText={filterText}
              />
            </div>
            <div className="mb-2">
              <button
                className="btn filter-btn d-flex align-items-center"
                onClick={() => {
                  setVisible(true);
                }}
              >
                <img loading="lazy" src={Filter} height={14} width={12.26} />
                <span className="ms-2">Filters</span>
              </button>
            </div>
            <div className="mb-2 ms-3">
              <button
                className="add-practice flex-items-center "
                onClick={() => setAddCoachModal(true)}
              >
                <img loading="lazy" src={Addbutton} height={14} width={14} />
                <span className="ms-2">Add Coach</span>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <div>
            <DataTable
              columns={columns}
              data={userListing?.data}
              progressPending={isUserlistLoading}
              customStyles={customStylesUser}
              highlightOnHover
              pointerOnHover
              responsive
              onRowClicked={(row) => navigateUserDetail(row)}
               defaultSortFieldId="registered_on"
              onSort={handleSort}
              sortServer
              sortIcon={<img loading="lazy" src={Sorticon} alt="Sort icon" />}
              defaultSortAsc={false}
            />
          </div>
          <PaginationComponent
            totalRecords={userListing?.pagination?.totalRecords}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </div>
      </div>
      <AddCoach
        addCoachModal={addCoachModal}
        setAddCoachModal={setAddCoachModal}
        refetch={refetch}
        onclose={onclose}
      />
      <UserFilter
        visible={visible}
        setVisible={setVisible}
        tempFilter={tempFilter}
        handleClearFilter={handleClearFilter}
        handleDateChange={handleDateChange}
        handleFilterChange={handleFilterChange}
        handleApplyFilter={handleApplyFilter}
        onclose={onclose}
      />
      <DeleteModal
        deleteModal={deleteModal}
        onClose={onClose}
        content={"Do you really want to delete this User ?"}
        onConfirm={deleteConfirmHandler}
      />
      <UserEdit
        setEditModal={setEditModal}
        editModel={editModel}
        rowData={rowData}
        refetch={refetch}
        action={action}
        setAction={setAction}
        onclose={onclose}
        formData={formData}
        setFormData={setFormData}
      />
      <>
        <CModal
          alignment="center"
          visible={ressignModal}
          onClose={() => setRessignModal(false)}
          aria-labelledby="VerticallyCenteredExample"
        >
          <div className="d-flex justify-content-center CModalHeader">
            <CModalTitle className="text-white">Reassign</CModalTitle>
          </div>
          <CModalBody className="main-modal-body">
            <div className="main-modal">
              {!ressignTigger ? (
                <SelectProvider
                  id={deletedRowData?.clinic_id}
                  type={deletedRowData?.userType}
                  deletedRowData={deletedRowData?._id}
                  onChangeSelect={onChangeSelect}
                  ressignHandler={ressignHandler}
                  setRessignModal={setRessignModal}
                />
              ) : (
                <ViewSelectedProvider
                  type={deletedRowData?.userType}
                  closeRessign={closeRessign}
                  data={data}
                />
              )}
            </div>
          </CModalBody>
        </CModal>
      </>
    </>
  );
};

export default User;
