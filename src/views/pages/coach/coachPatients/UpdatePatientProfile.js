import React, { useEffect, useState } from "react";
import { State, City } from 'country-state-city';
import {
  CButton,
  CCloseButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalTitle,
} from "@coreui/react";
import Avatar from "react-avatar-edit";
import Camera from "../../../../assets/icons/camera.png";
import DatePicker from "react-datepicker";
import { usAutomaticCalidation, validateRequired, validateZipCode } from "../../../../utils/inputValidation";
import { dataURLtoBlob, getFileExtension } from "../../../../utils/PercentageHandler";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";
import { useSelector } from "react-redux";
import { formatDate } from "../../../../utils/dateUtils";

const UpdatePatientProfile = ({
  visible,
  editModal,
  fileUploadRef,
  handleChanges,
  onCrop,
  saveImg,
  setEditModal,
  setVisible,
  onClose,
  formData,
  usStates,
  cities,
  error,
  btnDisable,
  patientData,
  setCities,
  setUsStates,
  setFormData,
  updateRole,
  patientId
}) => {

  const insuranceOptions = [
    "Medicare (Original, Parts A & B)",
    "Medicare Advantage (Part C)",
    "Blue Cross Blue Shield (BCBS of Georgia)",
    "Aetna / Cigna / Humana / UnitedHealthcare",
    "Medicaid (Georgia: Amerigroup, Peach State, CareSource, WellCare)",
    "Other / Self-Pay"
  ];
  const userType = useSelector((state) => state?.user?.userType);
  const id = useSelector((state) => state?.user?.id);
  const [formErrors,setFormErrors] = useState({});

  const handleProfileChange = (e) => {
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
        case "zip_code":
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

  const stateCode = patientData?.state;

  useEffect(() => {
    if (stateCode && editModal === true) {
      const stateCities = City?.getCitiesOfState('US', stateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [stateCode, editModal]);

  useEffect(() => {
    const states = State?.getStatesOfCountry('US');
    setUsStates(states);
  }, [formData]);

  const handleDateChange = (date) => {
    if (date) {
      const formattedDate = formatDate(date, "MM/dd/yyyy");

      setFormData({
        ...formData,
        date_of_birth: formattedDate,
      });
    }
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;

    handleProfileChange(e);

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
      city: city,
    }));
  };

    const handleSave = () => {
      if(handleValidation()){
        const formDatas = new FormData();
        formDatas.append("title", formData?.title);
        formDatas.append("first_name", formData?.first_name);
        formDatas.append("middle_name", formData?.middle_name);
        formDatas.append("last_name", formData?.last_name);
        formDatas.append("email", formData?.email);
        formDatas.append("cell_number", formData?.cell_number);
        formDatas.append("address_line_1", formData?.address_line_1);
        formDatas.append("zip_code", formData?.zip_code);
        formDatas.append("state", formData?.state);
        formDatas.append("city", formData?.city);
        formDatas.append("date_of_birth", formData?.date_of_birth);
        formDatas.append("occupation", formData?.occupation);
        formDatas.append("insurance", formData?.insurance);
        formDatas.append("actorId", id);
        formDatas.append("actorType", userType);
  
        if (formData?.avatarURL) {
          if (typeof formData?.avatarURL === "string" && formData?.avatarURL.startsWith("data:image")) {
            const blob = dataURLtoBlob(formData?.avatarURL);
            if (blob) {
              const fileExtension = getFileExtension(blob?.type);
              formDatas.append("profile_img", blob, `profile.${fileExtension}`);
            } else {
              console.error("Failed to convert avatarURL to Blob.");
            }
          } else {
            console.error("Invalid avatarURL format:", formData.avatarURL);
          }
        }   
        updateRole({ payload: formDatas, id: patientId });
      }
    };

  return (
    <div>
      <>
        <CModal
          size="xl"
          alignment="center"
          visible={editModal}
          backdrop="static"
          aria-labelledby="VerticallyCenteredExample"
        >
          <div className="d-flex justify-content-between header-title-edit px-4 my-2">
            <CModalTitle className="title-edit">
              Update Personal Details
            </CModalTitle>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <CCloseButton
              className="text-reset modal-close-cross"
              onClick={() => setEditModal(false)}
            />
          </div>
          <hr className="my-0 mx-4" />

          <CModalBody>
            <div className="modal-body-container">
              <div className="row my-4 mx-3">
                <div className="col-md-2 col-3 d-flex  position-relative">
                  <img loading="lazy"
                    src={formData?.avatarURL}
                    alt="Avatar"
                    className="img-wrap rounded-circle"
                  />
                  <div className="camera-badge position-absolute pointer">
                    <img loading="lazy"
                      src={Camera}
                      alt="Camera Icon"
                      onClick={() => setVisible(true)}
                      className="rounded-circle"
                    />
                  </div>
                </div>
                <div className="col-md-10 col-9">
                  <div className="row  mx-3">
                    <div className="col-12 col-md-2">
                      <label className="label-edit">Title *</label>
                      <select
                        type="text"
                        className="form-select form-control-input mt-1"
                        placeholder=""
                        name="title"
                        onChange={handleProfileChange}
                        value={formData?.title}
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                      </select>
                    </div>{" "}
                    <div className="col-12 col-md">
                      <label className="label-edit">First Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-input mt-1"
                        placeholder=""
                        name="first_name"
                        onChange={handleProfileChange}
                        value={formData?.first_name}
                      />
                      {formErrors?.first_name && (
                        <p className="text-danger mt-2">{formErrors?.first_name}</p>
                      )}
                    </div>{" "}
                    <div className="col-12 col-md">
                      <label className="label-edit">Middle Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-input mt-1"
                        placeholder=""
                        name="middle_name"
                        onChange={handleProfileChange}
                        value={formData?.middle_name}
                      />
                      {formErrors?.middle_name && (
                        <p className="text-danger mt-2">{formErrors?.middle_name}</p>
                      )}
                    </div>{" "}
                    
                    <div className="col-12 col-md">
                      <label className="label-edit">Last Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-input mt-1"
                        placeholder=""
                        name="last_name"
                        onChange={handleProfileChange}
                        value={formData?.last_name}
                      />
                      {formErrors?.last_name && (
                        <p className="text-danger mt-2">{formErrors?.last_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="row my-4 mx-3">
                    <div className="col-12 col-md-4">
                      <label className="label-edit">Email</label>
                      <input
                        type="text"
                        className="form-control form-control-input mt-1"
                        placeholder=""
                        name="email"
                        onChange={handleProfileChange}
                        value={formData?.email}
                        disabled
                      />
                    </div>{" "}
                    <div className="col-12 col-md-4">
                      <label className="label-edit">Cell Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-input mt-1"
                        placeholder=""
                        name="cell_number"
                        onChange={handleProfileChange}
                        value={formData?.cell_number}
                      />
                      {formErrors?.cell_number && (
                        <p className="text-danger mt-2">{formErrors?.cell_number}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="label-edit">Address Line *</label>
                      <input
                        type="text"
                        className="form-control form-control-input mt-1"
                        placeholder=""
                        name="address_line_1"
                        onChange={handleProfileChange}
                        value={formData?.address_line_1}
                      />
                      {formErrors?.address_line_1 && (
                        <p className="text-danger mt-2">{formErrors?.address_line_1}</p>
                      )}
                    </div>
                  </div>
                  <div className="row my-4 mx-3">
                    <div className="col-12 col-md-4">
                      <label className="label-edit">State*</label>
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
                      {formErrors?.state && (
                        <p className="text-danger mt-2">{formErrors?.state}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="label-edit">City</label>
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
                    <div className="col-12 col-md-4">
                      <label className="label-edit">Zip code*</label>
                      <input
                        type="text"
                        className="form-control form-control-input"
                        placeholder=""
                        name="zip_code"
                        onChange={handleProfileChange}
                        value={formData?.zip_code}
                      />
                      {formErrors?.zip_code && (
                        <p className="text-danger mt-2">{formErrors?.zip_code}</p>
                      )}
                    </div>{" "}
                    <div className="col-12 col-md-4 mt-3">
                      <label className="label-edit">Date of birth*</label>
                      <DatePicker
                        customInput={<BlockKeyboardInput/>}
                        selected={formData?.date_of_birth}
                        name="date_of_birth"
                        onChange={handleDateChange}
                        className="form-control form-control-input"
                        dateFormat="MM/dd/yyyy"
                        placeholderText="Select a date"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        showMonthDropdown
                        dropdownMode="select"
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                      />
                    </div>{" "}
                    <div className="col-12 col-md-4 mt-3">
                      <label className="label-edit">Insurance*</label>
                      <select
                        value={formData?.insurance}
                        name="insurance"
                        onChange={handleProfileChange}
                        className="form-select form-control-input"
                      >
                        <option value="">Select Insurance</option>
                        {insuranceOptions.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>{" "}
                    <div className="col-12 col-md-4 mt-3 ">
                      <label className="label-edit">Occupation*</label>
                      <input
                        type="text"
                        className="form-control form-control-input "
                        placeholder=""
                        name="occupation"
                        onChange={handleProfileChange}
                        value={formData?.occupation}
                      />
                    </div>{" "}
                  </div>
                </div>
              </div>
            </div>

            <div className=" col-md-12 mt-4">
              <div className="row pt-2">
                <div className="col-md-12 text-end">
                  <button
                    className="btn btn-cancel-user  "
                    onClick={() => setEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-save ms-2 text-white fw-bold"
                    onClick={handleSave}
                    disabled={btnDisable === true}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
            <br />
          </CModalBody>
        </CModal>
      </>
      <>
        <CModal
          backdrop="static"
          id="register-page"
          alignment="center"
          scrollable
          visible={visible}
          aria-labelledby="ScrollingLongContentExampleLabel2"
        >
          <CModalBody id="register-page">
            <input
              type="file"
              id="file"
              ref={fileUploadRef}
              onChange={handleChanges}
              hidden
            />
            <Avatar
              onCrop={onCrop}
              onClose={onClose}
              name="avatar"
              width="auto"
              height={350}
              border={50}
              color={[255, 255, 255, 0.6]} // RGBA
              scale={1.2}
              rotate={0}
              label="Upload a Photo"
            />
          </CModalBody>
          <CModalFooter className="d-flex justify-content-between">
            <CButton color="primary" onClick={() => setVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={() => saveImg()}>
              Upload
            </CButton>
          </CModalFooter>
        </CModal>
      </>
    </div>
  );
};

export default UpdatePatientProfile;
