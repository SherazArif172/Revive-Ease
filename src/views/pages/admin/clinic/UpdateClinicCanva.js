import React, { useEffect, useState } from 'react';
import { State, City } from 'country-state-city';
import { CCloseButton, COffcanvas, COffcanvasBody, COffcanvasHeader, COffcanvasTitle } from '@coreui/react';
import { usAutomaticCalidation, validateLength, validateRequired, validateZipCode, validateEmail } from '../../../../utils/inputValidation';
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const UpdateClinicCanva = ({ setCurrentAction, onclose, closeClinic, editClinic, errClass, clinicEditRowData, refetch, updateClinicPatient, clinicUpdateSuccess, clinicUpdateLoading, clinicUpdateError }) => {
  const userType = useSelector((state) => state?.user?.userType);
  const id = useSelector((state) => state?.user?.id);
  const [usStates, setUsStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [btnDisable, setBtnDisable] = useState(false);
  const stateCode = clinicEditRowData?.state;
  const [formData, setFormData] = useState({
    clinicName: "",
    address_line_1: "",
    city: "",
    state: "",
    zip_code: "",
    cellNumber: "",
    userName: "",
    email: "",
    webAddress: "",
    userType: "clinic admin",
    actorId: id,
    actorType: userType
  });

  const [errors, setErrors] = useState({
    clinicName: "",
    address_line_1: "",
    city: "",
    state: "",
    zip_code: "",
    cellNumber: "",
    userName: "",
    email: "",
    webAddress: "",
    actorId: id,
    actorType: userType
  });

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case 'clinicName':
        error = validateRequired(value) || validateLength(value, 2, 50);
        break;
      case 'webAddress':
        error = validateRequired(value);
        break;
      case 'state':
        error = validateRequired(value);
        break;
      case "userName":
        error = validateRequired(value);
        break;
      case "cellNumber": {
        const { formattedValue, error: validationError } = usAutomaticCalidation(value);
        value = formattedValue;
        error = validateRequired(value) || validationError;
        break;
      }
      case 'zip_code':
        error = validateRequired(value) || validateZipCode(value);
        break;
      case 'address_line_1':
        error = validateRequired(value) || validateLength(value, 5, 100);
        break;
      case 'email':
        error = validateRequired(value) || validateEmail(value);
        break;
      default:
        break;
    }

    return error;
  };

  useEffect(() => {
    if (clinicUpdateLoading) {
      setBtnDisable(true);
    }
    if (clinicUpdateSuccess) {
      setBtnDisable(false);
    }
    if (clinicUpdateError) {
      setBtnDisable(false);
    }
  }, [clinicUpdateError, clinicUpdateLoading, clinicUpdateSuccess]);

  useEffect(() => {
    if (clinicEditRowData !== null && editClinic === true) {
      setFormData({
        clinicName: clinicEditRowData?.clinic_name,
        address_line_1: clinicEditRowData?.address_line_1,
        city: clinicEditRowData?.city,
        state: clinicEditRowData?.state,
        zip_code: clinicEditRowData?.zip_code,
        cellNumber: clinicEditRowData?.cell_number,
        userName: clinicEditRowData?.userName,
        email: clinicEditRowData?.email,
        webAddress: clinicEditRowData?.web_address,
        userType: "clinic admin",
        actorId: id,
        actorType: userType
      });
    }
  }, [clinicEditRowData, editClinic]);

  useEffect(() => {
    if (clinicUpdateSuccess) {
      setFormData({});
      setErrors({});
      closeClinic();
      setCities([]);
      refetch();
    }
  }, [clinicUpdateSuccess]);

  useEffect(() => {
    if (stateCode && editClinic === true) {
      const stateCities = City?.getCitiesOfState('US', stateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [stateCode, editClinic]);

  useEffect(() => {
    const states = State?.getStatesOfCountry('US');
    setUsStates(states);
  }, [formData]);

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    handleOnchange(e);
    if (stateCode) {
      const stateCities = City?.getCitiesOfState('US', stateCode);
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
  };

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let error = null;

    if (name === "cellNumber") {

      const { formattedValue, error: validationError } = usAutomaticCalidation(value);
      newValue = formattedValue;
      error = validateRequired(newValue) || validationError;
    } else {
      error = validateField(name, value);
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: newValue,
    }));


    setErrors((prevErrors) => ({
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCurrentAction("update");
    if (handleValidation()) {
      let payload = {
        clinic_name: formData?.clinicName,
        address_line_1: formData?.address_line_1,
        city: formData?.city,
        state: formData?.state,
        zip_code: formData?.zip_code,
        cell_number: formData?.cellNumber,
        email: formData?.email,
        web_address: formData?.webAddress,
        userName: formData?.userName,
        actorId: id,
        actorType: userType
      };
      try {
        await updateClinicPatient({ payload: payload, id: clinicEditRowData?._id }).unwrap();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to update clinic");
      }
    }
  };

  return (
    <COffcanvas
      className="ps-3 pe-3  offcanvas_add"
      backdrop="static"
      placement="bottom"
      visible={editClinic}
      onHide={onclose}
    >
      <COffcanvasHeader>
        <COffcanvasTitle className="pt-4 offcanvas-title">
          Update Clinic Details
        </COffcanvasTitle>

        <CCloseButton
          className="text-reset modal-close-cross"
          onClick={() => {
            closeClinic(); setErrors({}); setCities([]); setUsStates([]); setFormData({
              clinicName: "",
              address_line_1: "",
              city: "",
              state: "",
              zip_code: "",
              cellNumber: "",
              userName: "",
              email: "",
              webAddress: "",
              actorId: id,
              actorType: userType
            });
          }}
        />
      </COffcanvasHeader>

      <COffcanvasBody>
        <div>
          <form autoComplete="off">
            <div className="row ">
              <div className="col">
                <label className="rv-label-newpractice py-2">Clinic Name *</label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  name="clinicName"
                  value={formData?.clinicName}
                  onChange={handleOnchange}
                />
                {errors?.clinicName && (<p className="text-danger mt-2">{errors?.clinicName}</p>)}
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  name="address_line_1"
                  value={formData?.address_line_1}
                  onChange={handleOnchange}
                />
                {errors?.address_line_1 && (<p className="text-danger mt-2">{errors?.address_line_1}</p>)}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">State *</label>
                <select
                  type="text"
                  className="form-control form-control-input"
                  name="state"
                  value={formData?.state}
                  onChange={handleStateChange}
                >
                  <option> Select State</option>
                  {usStates.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {errors?.state && (<p className="text-danger mt-2">{errors?.state}</p>)}
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">City</label>
                <select
                  className="form-control form-control-input"
                  name="city"
                  value={formData?.city || ""}
                  onChange={handleCityChange}
                >
                  <option value="">Select City</option>
                  {cities?.map((city) => (
                    <option key={city?.name} value={city?.name}>
                      {city?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">Zip Code *</label>
                <input
                  type="number"
                  className="form-control form-control-input"
                  name="zip_code"
                  value={formData?.zip_code}
                  onChange={handleOnchange}
                />
                {errors?.zip_code && (<p className="text-danger mt-2">{errors?.zip_code}</p>)}
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  Cell Number *
                </label>
                <input
                  type="text "
                  maxLength="17"
                  className={`form-control form-control-input ${errors?.cellNumber ? "is-invalid" : ""
                    }`}
                  name="cellNumber"
                  value={formData?.cellNumber}
                  onChange={handleOnchange}
                />
                {errors?.cellNumber && (<p className="text-danger mt-2">{errors?.cellNumber}</p>)}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">Email *</label>
                <input
                  type="text"
                  className={`form-control form-control-input  ${errClass ? "field-err" : ""}`}
                  name="email"
                  value={formData?.email || ""}
                  onChange={handleOnchange}
                />
                {errors?.email && (<p className="text-danger mt-2">{errors?.email}</p>)}
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  Web Address *
                </label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  name="webAddress"
                  value={formData?.webAddress}
                  onChange={handleOnchange}
                />
                {errors?.webAddress && (<p className="text-danger mt-2">{errors?.webAddress}</p>)}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">User Type *</label>
                <select
                  className="form-select form-control-input"
                  name="userType"
                  disabled
                  value={formData?.userType}
                  onChange={handleOnchange}
                >
                  <option>Clinic Admin</option>
                </select>
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">User Name *</label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  name="userName"
                  value={formData?.userName}
                  onChange={handleOnchange}
                />
                {errors?.userName && (<p className="text-danger mt-2">{errors?.userName}</p>)}
              </div>
            </div>{" "}
            <div className="row pt-4">
              <div className="col-md-12 text-end">
                <button className=" rv-reset-cancel mt-4"
                  type='button'
                  onClick={() => {
                    closeClinic(); setErrors({}); setCities([]); setUsStates([]); setFormData({
                      clinicName: "",
                      address_line_1: "",
                      city: "",
                      state: "",
                      zip_code: "",
                      cellNumber: "",
                      userName: "",
                      email: "",
                      webAddress: "",
                      actorId: id,
                      actorType: userType
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn add-practs-btn ms-2"
                  onClick={handleSubmit}
                  disabled={btnDisable === true}
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        </div>
      </COffcanvasBody>
    </COffcanvas>
  );
};

export default UpdateClinicCanva;