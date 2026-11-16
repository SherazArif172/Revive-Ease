import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import Filter from "../../../../assets/icons/filter.png";
import Addbutton from "../../../../assets/icons/plus.png";
import FilterComponent from "../../../../utils/FilterComponent";
import Copy from "../../../../assets/icons/copy.png"; 
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import Canvas from "../../../../Canvas/Canvas";
import {
  useAddClinicMutation,
  useGetClinicQuery,
  useSaveQRCodeMutation,
  useUpdateClinicMutation,
  useUpdateClinicStatusMutation,
  useDownloadQRCodeMutation
} from "../../../../redux/apis/clinic_api";
import { customStylesClinic } from "../../../../Components/DataTable/CustomStyle";
import { columnsClinic } from "../../../../Components/DataTable/commonColumn";
import { State, City } from "country-state-city";
import {
  usAutomaticCalidation,
  validateEmail,
  validateLength,
  validateRequired,
  validateZipCode,
} from "../../../../utils/inputValidation";
import UpdateClinicCanva from "./UpdateClinicCanva";
import StatusModal from "../../../../../src/Components/Modal/StatusModal";
import PaginationComponent from "../../../../utils/Pagination";
import { toast } from "react-toastify";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";
import { getToken } from 'firebase/messaging';
import { messaging } from '../../../../firebase/confiq';
import Sorticon from "../../../../assets/icons/sort.png";


const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const Clinic = () => {

  const onclose = () => {
    setAddNewClinic(false);
    setEditCanva(false);
    setVisible(false);
  };


  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [addNewClinic, setAddNewClinic] = useState(false);
  const [editClinic, setEditCanva] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [clinicEditRowData, setClinicEditRowData] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [clientID, setClientID] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [qrImage, setQrImage] = useState(null);
  const [qrCodePath, setQrCodePath] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [toggleConfirm, setToggleConfirm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showValidation, setShowValidation] = useState(false);
  const [criteria, setCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const [tempFilter, setTempFilter] = useState({
    startDate: null,
    endDate: null,
    status: "",
  });
  const [formData, setFormData] = useState({
    clinicName: "",
    addressLine: "",
    city: "",
    state: "",
    zipCode: "",
    cellNumber: "",
    userName: "",
    password: "",
    confirmPassword: "",
    email: "",
    webAddress: "",
    userType: "clinic admin",
  });

  const [errors, setErrors] = useState({
    clinicName: "",
    addressLine: "",
    city: "",
    state: "",
    zipCode: "",
    cellNumber: "",
    userName: "",
    password: "",
    confirmPassword: "",
    email: "",
    webAddress: "",
    userType: "",
    passwordMatch: "",
  });
  const [errMsg, setErrMsg] = React.useState("");
  const [errClass, setErrClass] = React.useState(false);
  const filterPlaceholder = "Search by clinic name";
  const [usStates, setUsStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [btnDisabled, setBtnDisabled] = useState(false);

  const [filter, setFilter] = useState({
    filterText: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // eslint-disable-next-line no-unused-vars
  const [saveQRCode, { isSuccess: QrSuccess, isLoading: qrLoading }] = useSaveQRCodeMutation();

  // eslint-disable-next-line no-unused-vars
  const [downloadQRCode] = useDownloadQRCodeMutation();


  const [sortBy, setSortBy] = useState("registered_on");
  const [sortOrder, setSortOrder] = useState("desc");

  const [updateClinicPatient, { isSuccess: clinicUpdateSuccess, isLoading: clinicUpdateLoading, isError: clinicUpdateError }] = useUpdateClinicMutation();
  const [updateClinicStatus, { isSuccess: clinicStatusSuccess }] = useUpdateClinicStatusMutation();
  const id = useSelector((state) => state.user?.id);
  // eslint-disable-next-line no-unused-vars
  const { data: clinicDatas, refetch, isLoading: isClinicListingLoading } = useGetClinicQuery({
    filter,
    page,
    rowsPerPage,
    sortBy,
    sortOrder,
    revive_admin_id: id
  }, { refetchOnMountOrArgChange: true });
  const clinicListing = useSelector((state) => state?.allClinics?.clinicListing);
  const [
    addClinic,
    {
      isSuccess,
      data: addClinicResponse,
      isLoading: addClinicLoading,
    },
  ] = useAddClinicMutation();
  const funcNavigate = (row) => {
    navigate("/clinics/clinicDetail", { state: row });
  };
  const checkStrength = (password) => {
    const updatedCriteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setCriteria(updatedCriteria);
  };

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "clinicName":
        error = validateRequired(value) || validateLength(value, 2, 50);
        break;
      case "webAddress":
        error = validateRequired(value);
        break;
      case "email":
        error = validateRequired(value) || validateEmail(value);
        break;
      case "state":
        error = validateRequired(value);
        break;
      case "userName":
        error = validateRequired(value);
        break;
      case "cellNumber": {
        const { formattedValue, error: validationError } =
          usAutomaticCalidation(value);
        value = formattedValue;
        error = validateRequired(value) || validationError;
        break;
      }
      case "zipCode":
        error = validateRequired(value) || validateZipCode(value);
        break;
      case "addressLine":
        error = validateRequired(value) || validateLength(value, 5, 100);
        break;
      case "password":
        error = validateRequired(value); // Add complexity checks if needed
        break;
      case "confirmPassword":
        error =
          validateRequired(value) ||
          (value !== formData.password ? "Confirm Password does not match" : null);
        break;
      default:
        break;
    }

    return error;
  };

  const handleValidation = () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };




  const fetchStates = () => {
    const states = State?.getStatesOfCountry("US");
    setUsStates(states);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;

    handleOnchange(e);

    if (stateCode) {
      const stateCities = City?.getCitiesOfState("US", stateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filter.status, filter.startDate, filter.endDate]);

  const handleCityChange = (e) => {
    setBtnDisabled(false);
    const city = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      city: city,
    }));
  };

  const handleSearch = debounce((value) => {
    setFilter((prev) => ({
      ...prev,
      filterText: value,
    }));
    // Reset page to 1 when searching
    if (value !== filter.filterText) {
      setPage(1);
    }
  }, 0);
  const onFocus = () => {
    setShowValidation(true);
  };

  const openEditClinic = (row, type) => {
    if (type === "Edit") {
      setClinicEditRowData(row);
      setEditCanva(true);
    } else if (type === "Delete") {
      setClinicEditRowData(row);
      setStatusModal(true);
    }
  };



  const handleDownloadQRcode = (row) => {
    downloadQRCode({ clinicId: row?._id, clinicCode: row?.clinic_id });
  };

  const handleUpdateClinicStatus = (row) => {
    updateClinicStatus({ clinicId: row?.clinic_id, status: row.status === "active" ? "inactive" : "active", revive_admin_id: id });
  };
  const columns = columnsClinic({
    funcNavigate,
    openEditClinic,
    handleUpdateClinicStatus,
    handleDownloadQRcode,

  });
  const handleSort = async (column, sortDirection) => {
    const sortField = column.sortField || column.selector;
    // Prevent setting empty sortBy - keep default if sortField is empty/undefined
    if (sortField) {
      setSortBy(sortField);
      setSortOrder(sortDirection);
      setPage(1);
    }
  };

  const onBlur = () => {
    setErrClass(false);
    setShowValidation(false);
  };
  const handleApplyFilter = () => {
    setFilter(tempFilter);
    setPage(1); // Reset to first page when applying filters
    setVisible(false);
  };

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => setIsCopied(false), 2500);
    }
  }, [isCopied]);

  useEffect(() => {
    if (clinicUpdateSuccess) {
      setStatusModal(false);
      if (currentAction === "update") {
        toast.success("Clinic Updated Successfully!");
      } else if (currentAction === "delete") {
        toast.success("Clinic Deleted Successfully!");
      }
    }
  }, [clinicUpdateSuccess]);
  useEffect(() => {
    if (clinicStatusSuccess) {
      toast.success("Clinic Status Updated Successfully!");
      refetch();
    }
  }, [clinicStatusSuccess]);
  const resetForm = () => {
    setFormData("");
  };

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setBtnDisabled(false);
    let newValue = value;
    let error = null;
    if (name === "cellNumber") {
      const { formattedValue, error: validationError } =
        usAutomaticCalidation(value);
      newValue = formattedValue;
      error = validateRequired(newValue) || validationError;
    } else {
      error = validateField(name, value);
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: newValue,
    }));

    if (isSubmitted) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }

    if (name === "password") {
      checkStrength(value);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setTempFilter((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const closeClinic = () => {
    setAddNewClinic(false);
    setEditCanva(false);
    setFormData({
      clinicName: "",
      addressLine: "",
      city: "",
      state: "",
      zipCode: "",
      cellNumber: "",
      userName: "",
      password: "",
      confirmPassword: "",
      email: "",
      webAddress: "",
      userType: "",
    });
    setErrors("");
    setCriteria({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      specialChar: false,
    });
    setShowQRCode(false);
  };
  const closeScanner = () => {
    setAddNewClinic(false);
    setClientID(null);
    setShowQRCode(false);
  };



  const handleAddAndContinue = async (e) => {
    e.preventDefault();

    if (formData?.password || formData?.confirmPassword) {
      const passwordCriteria = {
        length: formData?.password?.length >= 8,
        uppercase: /[A-Z]/.test(formData?.password),
        lowercase: /[a-z]/.test(formData?.password),
        number: /\d/.test(formData?.password),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData?.password),
      };

      const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
      if (!isPasswordValid) {
        setErrMsg("Password does not meet all criteria");
        setTimeout(() => {
          setErrMsg("");
        }, 3000);
        return;
      }
    }

    try {
      setIsSubmitted(true);
      if (handleValidation()) {
        // Step 1: Request notification permission
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);

        // Step 2: Attempt to get FCM token
        let fcmToken = null;
        if (messaging) {
          try {
            fcmToken = await getToken(messaging, {
              vapidKey: process.env.REACT_APP_VAPID_KEY
            });
          } catch (tokenError) {
            console.error('Error retrieving FCM token:', tokenError);
          }
        }

        // Step 3: Prepare clinic data including FCM token
        const clinicData = {
          clinic_name: formData.clinicName,
          address_line_1: formData.addressLine,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          cell_number: formData.cellNumber,
          email: formData.email,
          web_address: formData.webAddress,
          userType: "clinic admin",
          userName: formData.userName,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          admin_id: id,
          fcmToken: fcmToken || null,
          revive_admin_id: id
        };

        await addClinic(clinicData);
        refetch();
      }
    } catch (error) {
      toast.error(error.message || "Email already exists");
    }
  };


  useEffect(() => {
    if (isSuccess && addClinicResponse) {
      setBtnDisabled(false);
      const clinicID = addClinicResponse?.newClinic?.clinic_id;
      const clinicObjectID = addClinicResponse?.newClinic?._id;

      if (clinicID && clinicObjectID) {
        setClientID(clinicID);
        setShowQRCode(true);

        // Generate QR code image and call saveQRCode API immediately
        setTimeout(async () => {
          try {
            // Create QR code using react-qr-code package
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '-9999px';
            document.body.appendChild(tempContainer);

            // Dynamically import React and ReactDOM
            const React = await import('react');
            const ReactDOM = await import('react-dom/client');

            // Create root and render QR code
            const root = ReactDOM.createRoot(tempContainer);
            const clinicUrl = `https://api.painkare.ai/scan-clinic/${clinicID}`;


            root.render(
              React.createElement(QRCode, {
                value: clinicUrl,
                size: 260,
                level: 'M',
                includeMargin: true
              })
            );

            // Wait for render and convert to image
            setTimeout(async () => {
              const svgElement = tempContainer.querySelector('svg');
              if (svgElement) {
                // Create canvas and convert SVG to image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 260;
                canvas.height = 260;

                const svgData = new XMLSerializer().serializeToString(svgElement);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                const img = new Image();
                img.onload = async () => {
                  // Fill white background
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, 260, 260);

                  // Draw QR code
                  ctx.drawImage(img, 0, 0, 260, 260);

                  // Convert canvas to blob (binary file) directly
                  canvas.toBlob(async (blob) => {
                    if (blob) {
                      // Create File object from blob
                      const file = new File([blob], `clinic-${clinicID}-qr.png`, { type: 'image/png' });

                      // Set QR image state
                      setQrImage(file);

                      // Call saveQRCode API with clinic object ID
                      const qrResponse = await saveQRCode({ clinicId: clinicObjectID, qrCode: file });
                      if (qrResponse?.data?.data?.qrCode) {
                        setQrCodePath(qrResponse.data.data.qrCode);
                      }

                    } else {
                      console.error('Failed to create blob from canvas');
                    }

                    // Cleanup
                    URL.revokeObjectURL(url);
                    root.unmount();
                    document.body.removeChild(tempContainer);
                  }, 'image/png');
                };

                img.onerror = () => {
                  URL.revokeObjectURL(url);
                  root.unmount();
                  document.body.removeChild(tempContainer);
                  console.error('Failed to generate QR code image');
                };

                img.src = url;
              }
            }, 100);
          } catch (error) {
            console.error('Error generating QR code:', error);
          }
        }, 500);

        resetForm();
        setCriteria({
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          specialChar: false,
        });
      }
    }
    if (addClinicLoading) {
      setBtnDisabled(true);
    }
  }, [isSuccess, addClinicResponse, addClinicLoading, saveQRCode]);

  const handleDateChange = (name, date) => {
    setTempFilter((prev) => {
      const updatedFilter = {
        ...prev,
        [name]: date,
      };

      // If startDate is being set and endDate is null, set endDate to today
      if (name === "startDate" && date && !prev.endDate) {
        updatedFilter.endDate = new Date();
      }

      return updatedFilter;
    });
  };

  const toggler = () => {
    setToggle(!toggle);
  };
  const togglerConfirm = () => {
    setToggleConfirm(!toggleConfirm);
  };

  const onClose = () => {
    setStatusModal(false);
  };

  const handleOnClear = () => {
    setFilter({
      filterText: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setTempFilter({
      startDate: null,
      endDate: null,
      status: "",
    });
    setPage(1); // Reset to first page when clearing filters
  };

  const onConfirm = (e) => {
    e.preventDefault();
    setCurrentAction("delete");
    let payload = {
      status: "inactive",
    };
    updateClinicPatient({ payload: payload, id: clinicEditRowData?._id });
  };

  return (
    <>
      <div className="main-container mt-4">
        <div className="d-flex justify-content-between">
          <div className="font-color">
            <h6>
              <strong> List of Clinics</strong>
            </h6>
          </div>
          <div className="d-flex flex-wrap align-items-center justify-content-between mx-2">
            <div className="flex-grow-1 me-3 mb-2">
              <FilterComponent
                placeholder={filterPlaceholder}
                onFilter={(e) => handleSearch(e.target.value)}
                filterText={filter?.filterText}
              />
            </div>
            <div className="me-3 mb-2">
              <button
                className="btn filter-btn d-flex align-items-center"
                onClick={() => setVisible(true)}
              >
                <img loading="lazy" src={Filter} height={14} width={12.26} />
                <span className="ms-2">Filters</span>
              </button>
            </div>
            <div className="mb-2">
              <button
                className="add-practice flex-items-center "
                onClick={() => setAddNewClinic(true)}
              >
                <img loading="lazy" src={Addbutton} height={14} width={14} />
                <span className="ms-2">Add Clinic</span>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2">

          <DataTable
            columns={columns}
            data={clinicListing?.data}
            customStyles={customStylesClinic}
            progressPending={isClinicListingLoading}
            highlightOnHover
            pointerOnHover
            responsive={true}
            onRowClicked={(row) => funcNavigate(row)}
            onSort={handleSort}
            sortServer
            defaultSortFieldId="registered_on"
            defaultSortAsc={false}
            sortIcon={<img loading="lazy" src={Sorticon} />}
          />
        </div>
        <PaginationComponent
          totalRecords={clinicListing?.totalRecords}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>
      <>
        <COffcanvas
          className="ps-3 pe-3 pt-3 offcanvas_filter"
          backdrop="static"
          placement="end"
          visible={visible}
          onHide={onclose}
        >
          <COffcanvasHeader>
            <COffcanvasTitle className="">Filters</COffcanvasTitle>
            <CCloseButton
              className="text-reset modal-close-cross"
              onClick={() => {
                setVisible(false);
              }}
            />
          </COffcanvasHeader>

          <COffcanvasBody className="d-flex justify-content-between flex-column">
            <div>
              <p className="title-register">Registration Date</p>

              <div className="form-group has-search-right">
                <DatePicker
                  customInput={<BlockKeyboardInput />}
                  className="form-control input-dt shadow"
                  placeholderText="From"
                  dateFormat="MM/dd/yyyy"
                  selected={tempFilter.startDate}
                  onChange={(date) => handleDateChange("startDate", date)}
                  selectsStart
                  startDate={tempFilter.startDate}
                  endDate={tempFilter.endDate}
                  maxDate={new Date()} // Disable future dates
                />
              </div>
              <div className="form-group has-search-right mt-4">
                <DatePicker
                  customInput={<BlockKeyboardInput />}
                  className="form-control input-dt shadow"
                  placeholderText="To"
                  dateFormat="MM/dd/yyyy"
                  selected={tempFilter?.endDate}
                  onChange={(date) => handleDateChange("endDate", date)}
                  selectsEnd
                  startDate={tempFilter?.startDate}
                  endDate={tempFilter?.endDate}
                  minDate={tempFilter?.startDate} // Disable dates before start date
                  maxDate={new Date()} // Disable future dates
                />
                <div>
                  <div>
                    <p className="title-register mt-4">Status</p>
                    <div className="ms-4">
                      <p>
                        <input
                          type="radio"
                          name="status"
                          id="all"
                          value=""
                          checked={tempFilter?.status === ""}
                          onChange={handleFilterChange}
                        />
                        <label htmlFor="all">All</label>
                      </p>
                      <p>
                        <input
                          type="radio"
                          name="status"
                          id="active"
                          value="active"
                          checked={tempFilter?.status === "active"}
                          onChange={handleFilterChange}
                        />
                        <label htmlFor="active">Active</label>
                      </p>
                      <p>
                        <input
                          type="radio"
                          name="status"
                          id="inactive"
                          value="inactive"
                          checked={tempFilter?.status === "inactive"}
                          onChange={handleFilterChange}
                        />
                        <label htmlFor="inactive">Inactive</label>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="d-grid">
                <button
                  onClick={() => {

                    handleOnClear();
                  }}
                  className="shadow-none reset-apply-btn  fw-bold"
                >
                  Reset
                </button>

                <button
                  onClick={handleApplyFilter}
                  className="shadow-none filter-apply-btn mt-4 fw-bold"
                >
                  Apply
                </button>
              </div>
            </div>
          </COffcanvasBody>
        </COffcanvas>
      </>

      {/* ///////////////////////////////////////////////////////   Add Practices  OffCanvas       ///////////////////////////////////////////////////////*/}
      <>
        <Canvas
          cities={cities}
          usStates={usStates}
          onFocus={onFocus}
          onBlur={onBlur}
          COffcanvas={COffcanvas}
          addNewClinic={addNewClinic}
          onclose={onclose}
          COffcanvasHeader={COffcanvasHeader}
          COffcanvasTitle={COffcanvasTitle}
          errMsg={errMsg}
          CCloseButton={CCloseButton}
          closeClinic={closeClinic}
          COffcanvasBody={COffcanvasBody}
          showQRCode={showQRCode}
          clientID={clientID}
          QRCode={QRCode}
          setIsCopied={setIsCopied}
          Copy={Copy}
          closeScanner={closeScanner}
          handleCityChange={handleCityChange}
          formData={formData}
          errors={errors}
          handleOnchange={handleOnchange}
          handleStateChange={handleStateChange}
          toggleConfirm={toggleConfirm}
          togglerConfirm={togglerConfirm}
          errClass={errClass}
          handleAddAndContinue={handleAddAndContinue}
          toggle={toggle}
          toggler={toggler}
          isSubmitted={isSubmitted}
          criteria={criteria}
          showValidation={showValidation}
          setShowValidation={setShowValidation}
          btnDisabled={btnDisabled}
          isCopied={isCopied}
          handleDownloadQRcode={handleDownloadQRcode}
          addClinicResponse={addClinicResponse}
          downloadQRCode={downloadQRCode}
          qrCodePath={qrCodePath}
        />
      </>
      <UpdateClinicCanva
        closeClinic={closeClinic}
        onclose={onclose}
        editClinic={editClinic}
        errClass={errClass}
        clinicEditRowData={clinicEditRowData}
        refetch={refetch}
        updateClinicPatient={updateClinicPatient}
        clinicUpdateSuccess={clinicUpdateSuccess}
        clinicUpdateLoading={clinicUpdateLoading}
        clinicUpdateError={clinicUpdateError}
        handleValidation={handleValidation}
        setCurrentAction={setCurrentAction}
      />
      <StatusModal
        statusModal={statusModal}
        onConfirm={onConfirm}
        content={"Do you want to delete this clinic?"}
        onClose={onClose}
      />
    </>
  );
};
export default Clinic;
