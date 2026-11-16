import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import { useEffect, useState } from "react";
import {
  useAddClinicUserMutation,
  useUpdateClinicUserMutation,
} from "../../../../redux/apis/clinic_api";
import { State, City } from "country-state-city";
import {
  usAutomaticCalidation,
  validateRequired,
  validateZipCode,
} from "../../../../utils/inputValidation";
import { toast } from "react-toastify";
import AddUserConfirmationModal from "../clinic/AddUserConfirmationModal";
import { getToken } from "firebase/messaging";
import { messaging } from "../../../../firebase/confiq";
import { useSelector } from "react-redux";
const UserEdit = ({
  editModel,
  setEditModal,
  rowData,
  refetch,
  action,
  setAction,
  onclose, formData, setFormData
}) => {
  const [usStates, setUsStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [btnDisable, setBtnDisable] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [cloneCoachConfirmation, setCloneCoachConfirmation] = useState(false);
  const stateCode = rowData?.state;
  const userType = useSelector((state) => state?.user?.userType);
  const id = useSelector((state) => state?.user?.id);
  const [updateClinicUser, { isLoading: editCoachLoading, isSuccess, data: userData }] = useUpdateClinicUserMutation();
  const [addCoach, { isLoading: addCoachLoading, isSuccess: addCoachSuccess, error }] = useAddClinicUserMutation();
  const userMessage = userData?.message;

  useEffect(() => {
    setBtnDisable(false);
    setErrorMsg(error?.data?.message);
    if (error?.data?.message) {
      setTimeout(() => {
        setErrorMsg("");
      }, 3000);
    }
  }, [error]);

  useEffect(() => {
    if (rowData) {
      setFormData({
        first_name: rowData.first_name,
        last_name: rowData.last_name,
        middle_name: rowData.middle_name,
        userType: rowData.userType,
        cell_number: rowData.cell_number,
        email: rowData.email,
        gender: rowData.gender,
        address_line_1: rowData?.address_line_1,
        state: rowData?.state,
        city: rowData?.city,
        zipCode: rowData?.zip_code,
      });
    }
  }, [rowData]);

  useEffect(() => {
    if (isSuccess) {
      setBtnDisable(false);
      setEditModal(false);
      refetch();
      setFormData({
        first_name: "",
        last_name: "",
        middle_name: "",
        cell_number: "",
      });
      toast?.success(userMessage);
    }
    if (editCoachLoading) {
      setBtnDisable(true);
    }
  }, [isSuccess, editCoachLoading]);

  useEffect(() => {
    if (addCoachSuccess) {
      setBtnDisable(false);
      setEditModal(false);
      setAction(false);
      refetch();
      setCloneCoachConfirmation(true);
    }
    if (addCoachLoading) {
      setBtnDisable(true);
    }
  }, [addCoachSuccess, addCoachLoading]);

  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case "first_name":
      case "last_name":
      case "address_line_1":
      case "email":
      case "gender":
      case "state":
        error = validateRequired(value);
        break;
      case "zipCode":
        error = validateRequired(value) || validateZipCode(value);
        break;
      case "cell_number": {
        const { formattedValue, error: validationError } =
          usAutomaticCalidation(value);
        value = formattedValue;
        error = validateRequired(value) || validationError;
        break;
      }
      default:
        break;
    }
    return error;
  };

  useEffect(() => {
    if (stateCode) {
      const stateCities = City?.getCitiesOfState("US", stateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [stateCode]);

  useEffect(() => {
    const states = State?.getStatesOfCountry("US");
    setUsStates(states);
  }, [formData]);

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    handleUserChange(e);
    if (stateCode) {
      const stateCities = City?.getCitiesOfState("US", stateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      city,
    }));
    validateField("city", city);
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let error = null;

    if (name === "cell_number") {
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

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleValidation = () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (action === true) {
      if (handleValidation()) {

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

        let payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_name: formData.middle_name,
          gender: formData.gender,
          address_line_1: formData.address_line_1,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          cell_number: formData.cell_number,
          email: formData.email,
          userType: "coach",
          fcmToken: fcmToken || null,
          actorId: id,
          actorType: userType
        };
        addCoach(payload);
      }
    } else {
      if (handleValidation()) {
        let payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_name: formData.middle_name,
          userType: formData?.userType,
          cell_number: formData?.cell_number.toString(),
          gender: formData?.gender,
          address_line_1: formData?.address_line_1,
          state: formData?.state,
          city: formData?.city,
          zip_code: formData?.zipCode,
          actorId: id,
          actorType: userType
        };
        updateClinicUser({ updateData: payload, userId: rowData?._id });
      }
    }
  };

  return (
    <>
      <COffcanvas
        className="ps-3 pe-3  offcanvas_add_user"
        backdrop="static"
        placement="bottom"
        visible={editModel}
        onHide={onclose}
      >
        <COffcanvasHeader className="">
          <COffcanvasTitle className="pt-4 offcanvas-title">
            {action === true ? "Clone" : "Update"}{" "}
            {rowData?.userType === "coach" ? "Coach" : "Provider"}
            {errorMsg ? (
              <span
                className="mt-4 ml-5 text-center rg-err ms-3"
                style={{ fontSize: 14 }}
              >
                {errorMsg}
              </span>
            ) : (
              ""
            )}
          </COffcanvasTitle>
          <CCloseButton
            className="text-reset modal-close-cross"
            onClick={() => {
              setEditModal(false);
              setFormErrors({});
              setAction(false);
            }}
          />
        </COffcanvasHeader>

        <COffcanvasBody>
          <div>
            <div className="row ">
              <div className="col">
                <label htmlFor="formGroupExampleInput" className="p-2">
                  First Name *
                </label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  placeholder=""
                  name="first_name"
                  value={formData?.first_name}
                  onChange={handleUserChange}
                />
                {formErrors?.first_name && (
                  <p className="text-danger mt-2">{formErrors?.first_name}</p>
                )}
              </div>
              <div className="col">
                <label htmlFor="formGroupExampleInput" className="p-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  placeholder=""
                  name="middle_name"
                  value={formData?.middle_name}
                  onChange={handleUserChange}
                />
              </div>
              <div className="col">
                <label htmlFor="formGroupExampleInput" className="p-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  placeholder=""
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleUserChange}
                />
                {formErrors?.last_name && (
                  <p className="text-danger mt-2">{formErrors?.last_name}</p>
                )}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label htmlFor="formGroupExampleInput" className="p-2">
                  Email *
                </label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  placeholder=""
                  name="email"
                  value={formData?.email}
                  onChange={handleUserChange}
                  disabled={action != true}
                />
                {formErrors?.email && (
                  <p className="text-danger mt-2">{formErrors?.email}</p>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="formGroupExampleInput" className="p-2">
                  Gender *
                </label>
                <select
                  className="form-select form-control-input"
                  name="gender"
                  value={formData?.gender}
                  onChange={handleUserChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {formErrors?.gender && (
                  <p className="text-danger mt-2">{formErrors?.gender}</p>
                )}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label htmlFor="formGroupExampleInput" className="p-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  placeholder=""
                  name="address_line_1"
                  value={formData?.address_line_1}
                  onChange={handleUserChange}
                />
                {formErrors?.address_line_1 && (
                  <p className="text-danger mt-2">
                    {formErrors?.address_line_1}
                  </p>
                )}
              </div>
              <div className="col-md-6">
                <label className="rv-label-newpractice py-2">State *</label>
                <select
                  type="text"
                  className="form-control form-control-input"
                  name="state"
                  value={formData?.state}
                  onChange={handleStateChange}
                >
                  <option> Select State</option>
                  {usStates?.map((state) => {
                    return (
                      <option key={state?.isoCode} value={state?.isoCode}>
                        {state?.name}
                      </option>
                    );
                  })}
                </select>
                {formErrors?.state && (
                  <p className="text-danger mt-2">{formErrors?.state}</p>
                )}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">City</label>
                <select
                  type="text"
                  className="form-control form-control-input"
                  name="city"
                  value={formData?.city}
                  onChange={handleCityChange}
                >
                  <option>Select City</option>
                  {cities?.map((city) => {
                    return (
                      <option key={city?.name} value={city?.name}>
                        {city?.name}
                      </option>
                    );
                  })}
                  ;
                </select>
              </div>
              <div className="col">
                <label htmlFor="formGroupExampleInput" className="p-2">
                  Zip Code *
                </label>
                <input
                  type="number"
                  className="form-control form-control-input"
                  placeholder=""
                  name="zipCode"
                  value={formData?.zipCode}
                  onChange={handleUserChange}
                />
                {formErrors?.zipCode && (
                  <p className="text-danger mt-2">{formErrors?.zipCode}</p>
                )}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label htmlFor="formGroupExampleInput" className="p-2">
                  Cell Number *
                </label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  placeholder=""
                  name="cell_number"
                  value={formData?.cell_number}
                  onChange={handleUserChange}
                />
                {formErrors?.cell_number && (
                  <p className="text-danger mt-2">{formErrors?.cell_number}</p>
                )}
              </div>
              <div className="col">
                <label htmlFor="formGroupExampleInput" className="p-2">
                  User Type
                </label>
                <select
                  type="text"
                  className="form-select form-control-input"
                  name="userType"
                  value={formData?.userType}
                  onChange={handleUserChange}
                  disabled
                >
                  <option value="">Select user type</option>
                  <option value="coach">Coach</option>
                  <option value="provider">Provider</option>
                </select>
              </div>
            </div>
            <div className="row pt-2 mt-4">
              <div className="col-md-12 text-end">
                <button
                  className=" rv-reset-cancel mt-4"
                  type="button"
                  onClick={() => {
                    setEditModal(false);
                    setFormErrors({});
                    setAction(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn add-practs-btn ms-2"
                  onClick={(e) => {
                    handleSubmit(e);
                  }}
                  disabled={btnDisable === true}
                >
                  {action === true ? "Clone" : "Update"}
                </button>
              </div>
            </div>
          </div>
        </COffcanvasBody>
      </COffcanvas>
      <AddUserConfirmationModal userModal={cloneCoachConfirmation} setUserModal={setCloneCoachConfirmation} type={"Coach"} action={"clone"} />
    </>
  );
};

export default UserEdit;
