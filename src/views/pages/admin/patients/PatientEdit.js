import React, { useEffect, useState } from "react";
import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import { useUpdateClinicUserMutation } from "../../../../redux/apis/clinic_api";
import { State, City } from "country-state-city";
import {
  usAutomaticCalidation,
  validateLength,
  validateRequired,

  validateSelectOption,

  validateZipCode,
} from "../../../../utils/inputValidation";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";
import { useSelector } from "react-redux";
import { formatDate } from "../../../../utils/dateUtils";

const PatientEdit = ({ selectedRowId, editModal, setEditModal, refetch, onclose }) => {
  const [usStates, setUsStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [btnDisable, setBtnDisable] = useState(false);
  const userType = useSelector((state) => state?.user?.userType);
  const id = useSelector((state) => state?.user?.id);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cellNumber: "",
    gender: "",
    insurance: "",
    addressLine1: "",
    Occupation: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    dob: null,
    actorId: id,
    actorType: userType
  });
  const [formErrors, setFormErrors] = useState({});
  const stateCode = selectedRowId?.state;

  const [updatePatient, { data: patientData, isLoading: updatePatientLoading, isSuccess: updatePatientSuccess }] = useUpdateClinicUserMutation();

  useEffect(() => {
    if (selectedRowId) {
      setFormData({
        firstName: selectedRowId?.first_name || "",
        lastName: selectedRowId?.last_name || "",
        email: selectedRowId?.email || "",
        cellNumber: selectedRowId?.cell_number || "",
        gender: selectedRowId?.gender || "",
        addressLine1: selectedRowId?.address_line_1 || "",
        Occupation: selectedRowId?.occupation || "",
        addressLine2: selectedRowId?.address_line2 || "",
        city: selectedRowId?.city || "",
        state: selectedRowId?.state || "",
        zipCode: selectedRowId?.zip_code || "",
        insurance: selectedRowId?.insurance || "",
        dob: selectedRowId?.date_of_birth,
        actorId: id,
        actorType: userType
      });
    }
  }, [selectedRowId]);

  useEffect(() => {
    if (updatePatientSuccess) {
      setBtnDisable(false);
      refetch();
      setEditModal(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        cellNumber: "",
        gender: "",
        insurance: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        occupation: "",
        dob: "",
        actorId: id,
        actorType: userType
      });
      toast?.success(patientData?.message);
    }
    if (updatePatientLoading) {
      setBtnDisable(true);
    }
  }, [updatePatientSuccess, updatePatientLoading]);

  useEffect(() => {
    const states = State?.getStatesOfCountry("US");
    setUsStates(states);
  }, [formData]);

  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case "firstName":
        error = validateRequired(value) || validateLength(value, 2, 50);
        break;
      case "lastName":
        error = validateRequired(value) || validateLength(value, 2, 50);
        break;
      case "addressLine1":
        error = validateRequired(value) || validateLength(value, 5, 100);
        break;

      case "state":
        error = validateSelectOption(value, "Select State");
        break;
      case "zipCode":
        error = validateRequired(value) || validateZipCode(value);
        break;
      case "cellNumber": {
        const { formattedValue, error: validationError } = usAutomaticCalidation(value);
        value = formattedValue;
        error = validateRequired(value) || validationError;
        break;
      }
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
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


    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleDateChange = (date) => {
    const adjustToLocal = (date) =>
      date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000) : null;

    if (date) {
      const adjustedDate = adjustToLocal(date);
      const formattedDate = formatDate(adjustedDate, "MM/dd/yyyy");

      setFormData({
        ...formData,
        dob: formattedDate,
      });
    }
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;

    // Update form data
    setFormData(prev => ({
      ...prev,
      state: stateCode,
      city: "" // Reset city when state changes
    }));

    // Validate immediately
    const error = validateSelectOption(stateCode, "Select State");
    setFormErrors(prev => ({
      ...prev,
      state: error
    }));

    // Load cities for the selected state
    if (stateCode && stateCode !== "Select State") {
      const stateCities = City?.getCitiesOfState("US", stateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  };

  useEffect(() => {
    if (stateCode) {
      const stateCities = City?.getCitiesOfState("US", stateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [stateCode]);

  const handleCityChange = (e) => {
    const city = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      city,
    }));
    validateField("city", city);
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      const payload = {
        first_name: formData?.firstName,
        last_name: formData?.lastName,
        middle_name: formData?.middleName,
        email: formData?.email,
        cell_number: formData?.cellNumber,
        gender: formData?.gender,
        address_line_1: formData?.addressLine1,
        city: formData?.city,
        state: formData?.state,
        zip_code: formData?.zipCode,
        occupation: formData?.Occupation,
        insurance: formData?.insurance,
        date_of_birth: formData?.dob,
        actorId: id,
        actorType: userType
      };
      updatePatient({ updateData: payload, userId: selectedRowId?._id || selectedRowId?.object_id });
    }
  };

  return (
    <div>
      <COffcanvas
        className="ps-3 pe-3 offcanvas_add"
        backdrop="static"
        placement="bottom"
        visible={editModal}
        onHide={onclose}
      >
        <COffcanvasHeader>
          <COffcanvasTitle className="pt-4 offcanvas-title">Update Patient</COffcanvasTitle>
          <CCloseButton
            className="text-reset modal-close-cross"
            onClick={() => {
              setEditModal(false);
              setFormErrors({});
            }}
          />
        </COffcanvasHeader>

        <COffcanvasBody>
          <form>
            <div className="row">
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData?.firstName}
                  onChange={handleChange}
                  className="form-control form-control-input"
                  required
                />
                {formErrors?.firstName && (
                  <p className="text-danger mt-2">{formErrors?.firstName}</p>
                )}
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData?.middleName}
                  onChange={handleChange}
                  className="form-control form-control-input"
                  required
                />
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData?.lastName}
                  onChange={handleChange}
                  className="form-control form-control-input"
                  required
                />
                {formErrors?.lastName && (
                  <p className="text-danger mt-2">{formErrors?.lastName}</p>
                )}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData?.email}
                  onChange={handleChange}
                  className="form-control form-control-input"
                  required
                  disabled
                />
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  Cell Number *
                </label>
                <input
                  type="text"
                  name="cellNumber"
                  value={formData?.cellNumber}
                  onChange={handleChange}
                  className="form-control form-control-input"
                  required
                />
                {formErrors?.cellNumber && (
                  <p className="text-danger mt-2">{formErrors?.cellNumber}</p>
                )}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">Gender *</label>
                <select
                  name="gender"
                  value={formData?.gender || ""}
                  onChange={handleChange}
                  className="form-select form-control-input"
                  required
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">Insurance</label>
                {
                  // alert(formData?.insurance)
                }
                <select

                  name="insurance"
                  onChange={handleChange}
                  className="form-select form-control-input"
                >
                  <option value=""> Select Insurance</option>
                  <option value="Medicare (Original, Parts A & B)" selected={formData?.insurance == 'Medicare (Original, Parts A & B)' ? true : false}>
                    {" "}
                    Medicare (Original, Parts A & B)
                  </option>
                  <option value="Medicare Advantage (Part C)" selected={formData?.insurance == 'Medicare Advantage (Part C)' ? true : false}>
                    {" "}
                    Medicare Advantage (Part C)
                  </option>
                  <option value="Blue Cross Blue Shield (BCBS of Georgia)" selected={formData?.insurance == 'Blue Cross Blue Shield (BCBS of Georgia)' ? true : false}>
                    {" "}
                    Blue Cross Blue Shield (BCBS of Georgia){" "}
                  </option>
                  <option value="Aetna / Cigna / Humana / UnitedHealthcare" selected={formData?.insurance == 'Aetna / Cigna / Humana / UnitedHealthcare' ? true : false}>
                    {" "}
                    Aetna / Cigna / Humana / UnitedHealthcare{" "}
                  </option>
                  <option value="Medicaid (Georgia: Amerigroup, CareSource, Peach State, WellCare)" selected={formData?.insurance == 'Medicaid (Georgia: Amerigroup, CareSource, Peach State, WellCare)' ? true : false}>
                    {" "}
                    Medicaid (Georgia: Amerigroup, CareSource, Peach State, WellCare){" "}
                  </option>          
                  <option value="Other / Self-Pay" selected={formData?.insurance == 'Other / Self-Pay' ? true : false}>Other / Self-Pay</option>
                </select>
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">Occupation</label>
                <input
                  type="text"
                  name="Occupation"
                  value={formData?.Occupation}
                  onChange={handleChange}
                  className="form-control form-control-input"
                />
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  Date Of Birth
                </label>
                <DatePicker
                  customInput={<BlockKeyboardInput />}
                  selected={formData?.dob}
                  onChange={handleDateChange}
                  className="form-control form-control-input"
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select a date"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  showMonthDropdown
                  dropdownMode="select"
                  maxDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 18)
                    )
                  }
                />
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData?.addressLine1}
                  onChange={handleChange}
                  className="form-control form-control-input"
                />
                {formErrors?.addressLine1 && (
                  <p className="text-danger mt-2">{formErrors?.addressLine1}</p>
                )}
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">State *</label>
                <select
                  type="text"
                  className="form-select form-control-input"
                  name="state"
                  value={formData?.state}
                  onChange={handleStateChange}
                >
                  <option> Select State</option>
                  {usStates.map((state) => {
                    return (
                      <option key={state?.isoCode} value={state?.isoCode}>
                        {state.name}
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
                  className="form-select form-control-input"
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
              <div className="col-md-6">
                <label className="rv-label-newpractice py-2">Zip Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData?.zipCode}
                  onChange={handleChange}
                  className="form-control form-control-input"
                  required
                />
                {formErrors?.zipCode && (
                  <p className="text-danger mt-2">{formErrors?.zipCode}</p>
                )}
              </div>
            </div>
            <div className="row pt-4">
              <div className="col-md-12 text-end">
                <button
                  className=" rv-reset-cancel mt-4"
                  onClick={() => {
                    setEditModal(false);
                    setFormErrors({});
                    refetch();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn add-practs-btn ms-2"
                  onClick={handleFormSubmit}
                  disabled={btnDisable === true}
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        </COffcanvasBody>
      </COffcanvas>
    </div>
  );
};

export default PatientEdit;
