import { useEffect, useState, useRef } from "react";
import Camera from "../../../../assets/icons/camera.png";
import { CButton, CCloseButton, CModal, CModalBody, CModalFooter, CModalTitle } from "@coreui/react";
import { usAutomaticCalidation, validateEmail, validateRequired } from "../../../../utils/inputValidation";
import { useGetAllProvierListQuery } from "../../../../redux/apis/provider_api";
import { State, City } from "country-state-city";

import { toast } from "react-toastify";
import Avatar from "react-avatar-edit";
import { dataURLtoBlob, getFileExtension } from "../../../../utils/PercentageHandler";
import { base_url } from "../../../../global/global";
import { useSelector } from "react-redux";

const UpdateUser = ({ setEditModal, editModal, toggle, togglerConfirm, toggleConfirm, toggler, handleEditModal, state, updateUser, isUpdateUserSuccess, refetch, userData }) => {
  const userType = useSelector((state) => state?.user?.userType);
  const id = useSelector((state) => state?.user?.id);
  // eslint-disable-next-line no-unused-vars
  const { data: getAllProvider } = useGetAllProvierListQuery();
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [usStates, setUsStates] = useState([]);
  const [visible, setVisible] = useState(false);
  const [imgCrop, setImgCrop] = useState(false);
  const [criteria, setCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const fileUploadRef = useRef(null);
  const [showValidation, setShowValidation] = useState({
    password: false,
    confirmPassword: false,
  });
  const [cities, setCities] = useState([]);
  const [formValues, setFormValues] = useState({
    title: "Mr.",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    cellNumber: "",
    address_line_1: "",
    city: "",
    state: "",
    zipCode: "",
    provider: "",
    password: "",
    confirmPassword: "",
    avatar: null,
    actorId: id,
    actorType: userType
  });
 
  useEffect(() => {
    if (userData && editModal === true) {
      setFormValues({
        title: userData?.title,
        firstName: userData?.first_name,
        middleName: userData?.middle_name,
        lastName: userData?.last_name,
        email: userData?.email,
        cellNumber: userData?.cell_number,
        address_line_1: userData?.address_line_1,
        city: userData?.city,
        state: userData?.state,
        zipCode: userData?.zip_code,
        provider: userData?.provider,
        avatar: `${base_url + userData?.profile_img}`,
        actorId: id,
        actorType: userType
      });
    }


  }, [state, editModal]);

  const onCrop = (croppedImageURL) => {
    setImgCrop(croppedImageURL);
  };

  const onClose = () => {
    setImgCrop(null);
  };

  const saveImg = () => {
    if (imgCrop) {
      setFormValues((prev) => ({ ...prev, avatar: imgCrop }));
      setVisible(false);
    }
  };

  useEffect(() => {
    const states = State?.getStatesOfCountry("US");
    setUsStates(states);
  }, [formValues]);

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

  useEffect(() => {
    if (isUpdateUserSuccess) {
      refetch();
      setCriteria({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
      });
      setEditModal(false);
      setFormValues({
        password: "",
        confirmPassword: "",

      });
      toast?.success('User Profile Updated Successfully');
    }
  }, [isUpdateUserSuccess]);

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "title":
      case "firstName":
      case "lastName":
        error = validateRequired(value);
        break;
      case "email":
        error = validateEmail(value) || validateRequired(value);
        break;
      case "cellNumber": {
        const validation = usAutomaticCalidation(value);
        error = validation.error;
        break;
      }
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    if (e.target && e.target?.files) {
      const uploadedFile = e.target?.files[0];
      const cachedURL = URL.createObjectURL(uploadedFile);
      setImgCrop(cachedURL);
    }
  
    const { name, value } = e.target;

    if (name === "password") {
      checkStrength(value);
    }

    let newValue = value;
    let error = null;

    if (name === "cellNumber") {
      const { formattedValue, error: validationError } = usAutomaticCalidation(value);
      newValue = formattedValue;
      error = validateRequired(newValue) || validationError;
    } else {
      error = validateField(name, value);
    }

    setFormValues({ ...formValues, [name]: newValue }); // ✅ set formatted value
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };
  

  const handleCityChange = (e) => {
    const city = e.target.value;
    setFormValues((prevData) => ({
      ...prevData,
      city,
    }));
    validateField("city", city);
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    handleChange(e);
    if (stateCode) {
      const stateCities = City?.getCitiesOfState("US", stateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  };

  const handleSubmit = () => {
    // First validate phone number separately
    const phoneValidation = usAutomaticCalidation(formValues.cellNumber);
    if (!phoneValidation.isValid) {
      setErrors(prev => ({
        ...prev,
        cellNumber: phoneValidation.error
      }));
      setError('Please provide a valid phone number');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    const requiredFields = ['firstName', 'lastName'];
    const newErrors = {};

    requiredFields.forEach(field => {
      const error = validateRequired(formValues[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError('Please fill in all required fields');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    if (formValues?.zipCode) {
      const zipRegex = /^\d{5}$/; // Ensures exactly 5 digits
      if (!zipRegex.test(formValues.zipCode)) {
        setError("ZIP Code must be in the format 12345.");
        setTimeout(() => {
          setError('');
        }, 3000);
        return;
      }
    }
    if (formValues?.password || formValues?.confirmPassword) {
      if (!formValues?.confirmPassword) {
        setError('confirm Password is required');
        setTimeout(() => {
          setError('');
        }, 3000);
        return;
      }
      if (formValues?.password !== formValues?.confirmPassword) {
        setError('Password and Confirm password do not match');
        setTimeout(() => {
          setError('');
        }, 3000);
        return;
      } else if (formValues?.password === '') {
        setError('Password is required');
        setTimeout(() => {
          setError('');
        }, 3000);
        return;
      } else if (formValues?.confirmPassword === '') {
        setError('confirmPassword is required');
        setTimeout(() => {
          setError('');
        }, 3000);
        return;
      }

      const passwordCriteria = {
        length: formValues?.password?.length >= 8,
        uppercase: /[A-Z]/.test(formValues?.password),
        lowercase: /[a-z]/.test(formValues?.password),
        number: /\d/.test(formValues?.password),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formValues?.password),
      };
      const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
      if (!isPasswordValid) {
        setError("Password does not meet all criteria");
        setTimeout(() => {
          setError("");
        }, 3000);
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", formValues?.title || "");
    formData.append("first_name", formValues?.firstName || "");
    formData.append("middle_name", formValues?.middleName || "");
    formData.append("last_name", formValues?.lastName || "");
    formData.append("password", formValues?.password || "");
    formData.append("email", formValues?.email || "");
    formData.append("cell_number", phoneValidation.formattedValue || "");
    formData.append("address_line_1", formValues?.address_line_1 || "");
    formData.append("zip_code", formValues?.zipCode || "");
    formData.append("state", formValues?.state || "");
    formData.append("city", formValues?.city || "");
    formData.append("actorId", id);
    formData.append("actorType", userType);

    if (formValues?.avatar) {
      if (typeof formValues?.avatar === "string" && formValues?.avatar.startsWith("data:image")) {
        const blob = dataURLtoBlob(formValues.avatar);
        if (blob) {
          const fileExtension = getFileExtension(blob?.type);
          formData.append("profile_img", blob, `profile.${fileExtension}`);
        } else {
          console.error("Failed to convert avatarURL to Blob.");
        }
      } else {
        console.error("Invalid avatarURL format:", formData.avatar);
      }
    }
    updateUser({ updateData: formData, userId: state?._id });
    handleEditModal();
  };

  return (
    <>
      <CModal
        size="xl"
        alignment="center"
        visible={editModal}
        onClose={() => setEditModal(false)}
        aria-labelledby="VerticallyCenteredExample"
        backdrop='static'
      >
        <div className="d-flex justify-content-between header-title-edit px-4 my-2">
          <CModalTitle className="title-edit">
            Update Personal Details
            <span className="ms-2">
              {error ? (
                <span
                  className="mt-4 ml-5 text-center rg-err"
                  style={{ fontSize: 14 }}
                >
                  {error}
                </span>
              ) : (
                ""
              )}
            </span>
          </CModalTitle>
          <CCloseButton
            className="text-reset modal-close-cross"
            onClick={() => {
              setEditModal(false);
              setErrors({});
              setCriteria({
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                specialChar: false,

              });
              setFormValues({
                password: "",
                confirmPassword: "",

              });
            }}
          />
        </div>
        <hr className="my-0 mx-4" />
        <CModalBody>
          <div className="modal-body-container">
            <div className="row my-4 mx-3">
              <div className="col-md-2 col-3 d-flex  position-relative">
                <img loading="lazy"
                  src={formValues?.avatar}
                  alt="Avatar"
                  className="img-wrap rounded-circle"
                />
                <div className="camera-badge position-absolute pointer">
                  <label htmlFor="avatarInput">
                    <img loading="lazy"
                      src={Camera}
                      onClick={() => { setVisible(true); }}
                      alt="Camera Icon"
                      className="rounded-circle"
                    />
                  </label>
                </div>
              </div>

              <div className="col-md-10 col-9">
                <div className="row  mx-3">
                  <div className="col-12 col-md-2">
                    <label className="label-edit">Title *</label>
                    <select
                      name="title"
                      value={formValues?.title}
                      defaultValue={formValues?.title}
                      className="form-select form-control-input mt-1"
                      onChange={handleChange}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                    </select>
                    {errors?.title && (
                      <span className="text-danger mt-2">{errors?.title}</span>
                    )}
                  </div>{" "}
                  <div className="col-md-10 d-flex gap-4">
                    <div className="col-12 col-md">
                      <label className="label-edit">First Name *</label>
                      <input
                        name="firstName"
                        type="text"
                        className="form-control form-control-input mt-1"
                        placeholder="First name"
                        value={formValues?.firstName}
                        defaultValue={formValues?.firstName}
                        onChange={handleChange}
                      />
                      {errors?.firstName && (
                        <span className="text-danger mt-2">{errors?.firstName}</span>
                      )}
                    </div>{" "}
                    <div className="col-12 col-md">
                      <label className="label-edit">Middle Name *</label>
                      <input
                        name="middleName"
                        type="text"
                        className="form-control form-control-input mt-1"
                        placeholder="Middle name"
                        value={formValues?.middleName}
                        defaultValue={formValues?.middleName}
                        onChange={handleChange}
                      />
                      {errors?.middleName && (
                        <span className="text-danger mt-4">
                          {errors?.middleName}
                        </span>
                      )}
                    </div>{" "}
                    <div className="col-12 col-md">
                      <label className="label-edit">Last Name *</label>
                      <input
                        name="lastName"
                        type="text"
                        className="form-control form-control-input mt-1"
                        placeholder="Last name"
                        value={formValues?.lastName}
                        defaultValue={formValues?.lastName}
                        onChange={handleChange}
                      />
                      {errors?.lastName && (
                        <span className="text-danger mt-2">
                          {errors?.lastName}
                        </span>
                      )}
                    </div>


                  </div>

                </div>
                <div className="row my-4 mx-3">
                  <div className="col-12 col-md-4">
                    <label className="label-edit">Email *</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control form-control-input mt-1"
                      placeholder="Email"
                      value={formValues?.email}
                      defaultValue={formValues?.email}
                      onChange={handleChange}
                      disabled
                    />
                    {errors?.email && (
                      <span className="text-danger mt-2">{errors?.email}</span>
                    )}
                  </div>{" "}
                  <div className="col-12 col-md-4">
                    <label className="label-edit">Cell Number *</label>
                    <input
                      name="cellNumber"
                      type="text"
                      className="form-control form-control-input mt-1"
                      placeholder="Cell Number"
                      value={formValues?.cellNumber}
                      defaultValue={formValues?.cellNumber}
                      onChange={handleChange}
                    />
                    {errors?.cellNumber && (
                      <span className="text-danger mt-2">
                        {errors?.cellNumber}
                      </span>
                    )}
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="label-edit">Address Line 1</label>
                    <input
                      name="address_line_1"
                      type="text"
                      className="form-control form-control-input mt-1"
                      placeholder="Address Line 1"
                      value={formValues?.address_line_1}
                      defaultValue={formValues?.address_line_1}
                      onChange={handleChange}
                    />
                    {errors?.address_line_1 && (
                      <span className="text-danger mt-2">
                        {errors?.address_line_1}
                      </span>
                    )}
                  </div>
                </div>
                <div className="row my-4 mx-3">
                  <div className="col-12 col-md-4">
                    <label className="label-edit">State</label>
                    <select
                      name="state"
                      type="text"
                      className="form-select form-control-input mt-1"
                      placeholder="state"
                      value={formValues?.state}
                      defaultValue={formValues?.state}
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

                    {errors?.state && (
                      <span className="text-danger mt-2">{errors?.state}</span>
                    )}
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="label-edit">City</label>
                    <select
                      name="city"
                      type="text"
                      className="form-select form-control-input mt-1"
                      placeholder="city"
                      value={formValues?.city}
                      defaultValue={formValues?.city}
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

                    {errors?.city && (
                      <span className="text-danger mt-2">{errors?.city}</span>
                    )}
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="label-edit">ZipCode</label>
                    <input
                      name="zipCode"
                      type="number"
                      maxLength={formValues?.zipCode?.length === 5}
                      className="form-control form-control-input mt-1"
                      placeholder=""
                      value={formValues?.zipCode}
                      defaultValue={formValues?.zipCode}
                      onChange={handleChange}
                    />
                    {errors?.zipCode && (
                      <span className="text-danger mt-2">
                        {errors?.zipCode}
                      </span>
                    )}
                  </div>{" "}
                </div>

                <div className="row my-4 mx-3">
                  <div className="col-12 col-md-6">
                    <label className="label-edit">Password</label>
                    <input
                    autoComplete="off"
                      name="password"
                      type="new-password"
                      className="form-control form-control-input mt-1"
                      placeholder=""
                      id="rv-password"
                      value={formValues?.password}
                      defaultValue={formValues?.password}
                      onChange={handleChange}
                      onFocus={() =>
                        setShowValidation((prev) => ({
                          ...prev,
                          password: true,
                        }))
                      }
                      onBlur={() =>
                        setShowValidation((prev) => ({
                          ...prev,
                          password: false,
                        }))
                      }
                    />
                    <p
                      id="rg-eye"
                      style={{ marginLeft: "91%", marginTop: "-38px" }}
                      onClick={() => {
                        let rgpassword = document.getElementById("rv-password");
                        if (rgpassword?.type === "password") {
                          document.getElementById("rv-password").type = "text";
                        } else {
                          document.getElementById("rv-password").type =
                            "password";
                        }
                      }}
                    >
                      {toggle ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={toggler}
                          width="22"
                          height="22"
                          fill="currentColor"
                          className="bi bi-eye"
                          viewBox="0 0 16 16"
                          style={{
                            color: "#d1d1d1",
                          }}
                          id="rg-login-svg"
                        >
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={toggler}
                          width="22"
                          height="22"
                          className="bi bi-eye"
                          viewBox="0 0 24 24"
                          style={{
                            color: "#d1d1d1",
                          }}
                          id="rg-login-svg"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M4.707 3.293a1 1 0 0 0-1.414 1.414l1.67 1.671C3.23 7.716 1.889 9.538 1.07 11.636a1 1 0 0 0 0 .728C2.803 16.806 6.884 20 12 20c1.935 0 3.73-.459 5.31-1.276l1.983 1.983a1 1 0 0 0 1.414-1.414l-2.501-2.501a.968.968 0 0 0-.038-.038l-3.328-3.328l-.011-.012a1.252 1.252 0 0 0-.012-.011l-4.22-4.22a.841.841 0 0 0-.023-.023L7.245 5.83a.999.999 0 0 0-.038-.037l-2.5-2.5Zm4.585 7.414a3 3 0 0 0 4.001 4.001l-4-4.001Zm1.554-4.64C11.222 6.022 11.606 6 12 6c4.074 0 7.38 2.443 8.919 6c-.34.787-.768 1.52-1.271 2.184a1 1 0 1 0 1.594 1.208a12.599 12.599 0 0 0 1.69-3.028a1 1 0 0 0 0-.728C21.197 7.194 17.116 4 12 4c-.47 0-.932.027-1.386.08a1 1 0 0 0 .232 1.986Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </p>
                    {showValidation?.password && (
                      <div className="password-validation" >
                        <ul className="list-unstyled mt-3" >
                          <li
                            style={{ color: criteria.length ? "green" : "red" }}
                          >
                            {criteria.length ? "✓" : "✗"} Minimum 8 characters
                          </li>
                          <li
                            style={{
                              color: criteria.uppercase ? "green" : "red",
                            }}
                          >
                            {criteria.uppercase ? "✓" : "✗"} At least 1
                            uppercase letter
                          </li>
                          <li
                            style={{
                              color: criteria.lowercase ? "green" : "red",
                            }}
                          >
                            {criteria.lowercase ? "✓" : "✗"} At least 1
                            lowercase letter
                          </li>
                          <li
                            style={{ color: criteria.number ? "green" : "red" }}
                          >
                            {criteria.number ? "✓" : "✗"} At least 1 number
                          </li>
                          <li
                            style={{
                              color: criteria.specialChar ? "green" : "red",
                            }}
                          >
                            {criteria.specialChar ? "✓" : "✗"} At least 1
                            special character
                          </li>
                        </ul>
                      </div>
                    )}
                    {/* {showValidation?.password && (
                      <ul className="list-unstyled mt-3">
                        <li
                          style={{ color: criteria.length ? "green" : "red" }}
                        >
                          {criteria.length ? "✓" : "✗"} Minimum 8 characters
                        </li>
                        <li
                          style={{
                            color: criteria.uppercase ? "green" : "red",
                          }}
                        >
                          {criteria.uppercase ? "✓" : "✗"} At least 1
                          uppercase letter
                        </li>
                        <li
                          style={{
                            color: criteria.lowercase ? "green" : "red",
                          }}
                        >
                          {criteria.lowercase ? "✓" : "✗"} At least 1
                          lowercase letter
                        </li>
                        <li
                          style={{ color: criteria.number ? "green" : "red" }}
                        >
                          {criteria.number ? "✓" : "✗"} At least 1 number
                        </li>
                        <li
                          style={{
                            color: criteria.specialChar ? "green" : "red",
                          }}
                        >
                          {criteria.specialChar ? "✓" : "✗"} At least 1
                          special character
                        </li>
                      </ul>
                    )} */}
                  </div>{" "}
                  <div className="col-12 col-md-6">
                    <label className="label-edit">Confirm Password </label>
                    <input
                    autoComplete="off"
                      name="confirmPassword"
                      type="new-password"
                      className="form-control form-control-input mt-1"
                      placeholder=""
                      id="rv-confirm-password"
                      value={formValues?.confirmPassword}
                      defaultValue={formValues?.confirmPassword}
                      onChange={handleChange}
                    />
                    <p
                      id="rg-eye"
                      style={{ marginLeft: "91%", marginTop: "-38px" }}
                      onClick={() => {
                        let rgpassword = document.getElementById("rv-confirm-password");
                        if (rgpassword?.type === "password") {
                          document.getElementById("rv-confirm-password").type = "text";
                        } else {
                          document.getElementById("rv-confirm-password").type =
                            "password";
                        }
                      }}
                    >
                      {toggleConfirm ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={togglerConfirm}
                          width="22"
                          height="22"
                          fill="currentColor"
                          className="bi bi-eye"
                          viewBox="0 0 16 16"
                          style={{
                            color: "#d1d1d1",
                          }}
                          id="rg-login-svg"
                        >
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={togglerConfirm}
                          width="22"
                          height="22"
                          className="bi bi-eye"
                          viewBox="0 0 24 24"
                          style={{
                            color: "#d1d1d1",
                          }}
                          id="rg-login-svg"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M4.707 3.293a1 1 0 0 0-1.414 1.414l1.67 1.671C3.23 7.716 1.889 9.538 1.07 11.636a1 1 0 0 0 0 .728C2.803 16.806 6.884 20 12 20c1.935 0 3.73-.459 5.31-1.276l1.983 1.983a1 1 0 0 0 1.414-1.414l-2.501-2.501a.968.968 0 0 0-.038-.038l-3.328-3.328l-.011-.012a1.252 1.252 0 0 0-.012-.011l-4.22-4.22a.841.841 0 0 0-.023-.023L7.245 5.83a.999.999 0 0 0-.038-.037l-2.5-2.5Zm4.585 7.414a3 3 0 0 0 4.001 4.001l-4-4.001Zm1.554-4.64C11.222 6.022 11.606 6 12 6c4.074 0 7.38 2.443 8.919 6c-.34.787-.768 1.52-1.271 2.184a1 1 0 1 0 1.594 1.208a12.599 12.599 0 0 0 1.69-3.028a1 1 0 0 0 0-.728C21.197 7.194 17.116 4 12 4c-.47 0-.932.027-1.386.08a1 1 0 0 0 .232 1.986Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className=" col-md-12 mt-4">
            <div className="row pt-2">
              <div className="col-md-12 text-end">
                <button
                  className=" rv-reset-cancel mt-4"
                  onClick={() => {
                    setEditModal(false);
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-save ms-2 text-white"
                  onClick={() => handleSubmit()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
          <br />
        </CModalBody>
      </CModal>
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
              onChange={handleChange}
              hidden
            />
            <Avatar
              onCrop={onCrop}
              onCloe={onClose}
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

    </>
  );
};

export default UpdateUser;
