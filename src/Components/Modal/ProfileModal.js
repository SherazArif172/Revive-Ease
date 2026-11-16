import { CButton, CModal, CModalBody, CModalFooter } from "@coreui/react";
import React, { useEffect, useRef, useState } from "react";
import Avatar from "react-avatar-edit";
import { useSelector } from "react-redux";
import Camera from "../../assets/icons/camera.png";
import User from "../../assets/icons/user-profile.png";
import { base_url } from "../../global/global";
import { useDownloadQRCodeMutation } from "../../redux/apis/clinic_api";
import { useGetProfileDetailsByIdQuery } from "../../redux/apis/patient_coach_api";
import { useUpdateRoleMutation } from "../../redux/apis/role_api";
import { dataURLtoBlob, getFileExtension } from "../../utils/PercentageHandler";
import { validateLength, validateRequired } from "../../utils/inputValidation";

const ProfileModal = ({
  avatarURL,
  setAvatarURL,
  profileModal,
  setProfileModal,
  onCloseModal,
  criteria,
  checkStrength,
  showValidation,
  setShowValidation,
  formData,
  setFormData,
}) => {
  const getProfileData = useSelector((state) => state?.user?.profileData);


  const userType = useSelector((state) => state?.user?.userType);

  const clinicObjectIDInProvider = getProfileData?.clinicObjectID;
  const id = getProfileData?._id;
  const fileUploadRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [imgCrop, setImgCrop] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorUsername, setErrorsUsername] = useState({});
  const [toggleConfirm, setToggleConfirm] = useState(false);
  const [error, setError] = useState("");

  // eslint-disable-next-line no-unused-vars
  const { getProfileDetailsById, refetch } = useGetProfileDetailsByIdQuery(id, {
    skip: !id,
  });
  const [updateRole, { isSuccess, isLoading, isError }] =
    useUpdateRoleMutation();

  // eslint-disable-next-line no-unused-vars
  const [downloadQRCode] = useDownloadQRCodeMutation();



  useEffect(() => {
    if (isSuccess && id) {
      refetch();
      setProfileModal(false);
      setBtnDisable(false);
      setErrors({});
    }
    if (isLoading) {
      setBtnDisable(true);
    }
    if (isError) {
      setBtnDisable(false);
    }
  }, [isSuccess, isError, isLoading]);

  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case "first_name":
      case "last_name":
        error = validateRequired(value) || validateLength(value, 2, 50);
        break;
      default:
        break;
    }
    return error;
  };

  const validateFieldUsername = (name, value) => {
    let error = null;
    switch (name) {
      case "userName":
        error = validateRequired(value) || validateLength(value, 2, 50);
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
  const handleValidationUsername = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateFieldUsername(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrorsUsername(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    if (e.target.name === "userName") {
      if (e.target && e.target?.files) {
        const uploadedFile = e.target?.files[0];
        const cachedURL = URL.createObjectURL(uploadedFile);
        setImgCrop(cachedURL);
      }

      const { name, value } = e.target;
      if (name === "password") {
        checkStrength(value);
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      setErrorsUsername((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    } else {
      if (e.target && e.target?.files) {
        const uploadedFile = e.target?.files[0];
        const cachedURL = URL.createObjectURL(uploadedFile);
        setImgCrop(cachedURL);
      }

      const { name, value } = e.target;
      if (name === "password") {
        checkStrength(value);
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }
  };

  const onCrop = (croppedImageURL) => {
    setImgCrop(croppedImageURL);
  };

  const onClose = () => {
    setImgCrop(null);
  };

  const saveImg = () => {
    if (imgCrop) {
      setAvatarURL(imgCrop);
      setFormData((prev) => ({ ...prev, avatarURL: imgCrop }));
      setVisible(false);
    }
  };
  const toggler = () => {
    setToggle(!toggle);
  };

  const togglerConfirm = () => {
    setToggleConfirm(!toggleConfirm);
  };

  // const handleToggleChange = (event, type) => {
  //   setChecked((prevState) => ({
  //     ...prevState,
  //     [type]: event.target.checked,
  //   }));
  // };

  const handleDownloadQRcode = () => {
    downloadQRCode({
      clinicId: userType === "provider"
        ? clinicObjectIDInProvider
        : id,
      clinicCode: getProfileData?.clinic_id,
    });

  };

  useEffect(() => {
    if (getProfileData !== null && profileModal === true) {
      setFormData((prev) => ({
        ...prev,
        title: getProfileData.title,
        md_type: getProfileData.md_type,
        first_name: getProfileData.first_name,
        last_name: getProfileData.last_name,
        middle_name: getProfileData.middle_name,
        userName: getProfileData.userName,
        avatarURL: getProfileData?.profile_img,
        actorId: id,
        actorType: userType
      }));
    }
  }, [getProfileData, profileModal]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (
      userType === "admin" ||
      userType === "sub admin" ||
      userType === "coach" ||
      userType === "provider"
    ) {
      if (handleValidation()) {
        if (formData?.password || formData?.confirmPassword) {
          if (!formData?.confirmPassword) {
            setError("confirm Password is required");
            setTimeout(() => {
              setError("");
            }, 3000);
            return;
          }

          if (formData?.password !== formData?.confirmPassword) {
            setError("Confirm password does not match");
            setTimeout(() => {
              setError("");
            }, 3000);
            return;
          }
          const passwordCriteria = {
            length: formData?.password?.length >= 8,
            uppercase: /[A-Z]/.test(formData?.password),
            lowercase: /[a-z]/.test(formData?.password),
            number: /\d/.test(formData?.password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData?.password),
          };

          // Check if all criteria are met
          const isPasswordValid =
            Object.values(passwordCriteria).every(Boolean);
          if (!isPasswordValid) {
            setError("Password does not meet all criteria");
            setTimeout(() => {
              setError("");
            }, 3000);
            return;
          }
        }
        const formDatas = new FormData();

        formDatas.append("title", formData?.title || "");
        formDatas.append("md_type", formData?.md_type || "");

        formDatas.append("password", formData?.password || "");
        formDatas.append("email", formData?.email || "");
        formDatas.append("first_name", formData?.first_name || "");
        formDatas.append("last_name", formData?.last_name || "");
        formDatas.append("middle_name", formData?.middle_name || "");
        formDatas.append("actorType", userType);
        formDatas.append("actorId", id);

        if (formData?.avatarURL) {
          if (
            typeof formData.avatarURL === "string" &&
            formData.avatarURL.startsWith("data:image")
          ) {
            const blob = dataURLtoBlob(formData.avatarURL);
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
        updateRole({ id, payload: formDatas });
      }
    } else {
      if (handleValidationUsername()) {
        if (formData?.password || formData?.confirmPassword) {
          if (!formData?.confirmPassword) {
            setError("confirm Password is required");
            setTimeout(() => {
              setError("");
            }, 3000);
            return;
          }

          if (formData?.password !== formData?.confirmPassword) {
            setError("Confirm password does not match");
            setTimeout(() => {
              setError("");
            }, 3000);
            return;
          }
          const passwordCriteria = {
            length: formData?.password?.length >= 8,
            uppercase: /[A-Z]/.test(formData?.password),
            lowercase: /[a-z]/.test(formData?.password),
            number: /\d/.test(formData?.password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData?.password),
          };

          // Check if all criteria are met
          const isPasswordValid =
            Object.values(passwordCriteria).every(Boolean);
          if (!isPasswordValid) {
            setError("Password does not meet all criteria");
            setTimeout(() => {
              setError("");
            }, 3000);
            return;
          }
        }
        const formDatas = new FormData();

        formDatas.append("title", formData?.title || "");
        formDatas.append("password", formData?.password || "");
        formDatas.append("email", formData?.email || "");
        formDatas.append("userName", formData?.userName || "");
        formDatas.append("actorType", userType);
        formDatas.append("actorId", id);

        if (formData?.avatarURL) {
          if (
            typeof formData.avatarURL === "string" &&
            formData.avatarURL.startsWith("data:image")
          ) {
            const blob = dataURLtoBlob(formData.avatarURL);
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
        updateRole({ id, payload: formDatas });
      }
    }
  };

  return (
    <>
      <>
        <CModal
          size="lg"
          alignment="center"
          visible={profileModal}
          onClose={() => {
            onCloseModal();
            setErrors({});
          }}
          backdrop="static"
          aria-labelledby="VerticallyCenteredExample"
        >
          <hr className="my-0 mx-4 " />
          <div
            className="mx-4 d-flex "
            style={{ marginBottom: "-10px", marginTop: "10px" }}
          >
            <img loading="lazy" src={User} height={18} width={18}></img>
            <div className="profile-basic px-2">Basic User Details</div>
          </div>
          <CModalBody>
            <div className="modal-body-container mt-1">
              <div className="row my-4 ">
                <div className="col-md-2 col-3 d-flex  position-relative ">
                  <img
                    loading="lazy"
                    src={avatarURL}
                    alt="Avatar"
                    width={200}
                    height={200}
                    className="img-wrap rounded-circle mx-3"
                  />
                  <div className="profile-badge position-absolute pointer">
                    <img
                      loading="lazy"
                      src={Camera}
                      alt="Camera Icon"
                      onClick={() => {
                        setVisible(true);
                      }}
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
                        value={formData?.title}
                        defaultValue={formData?.title}
                        onChange={handleChange}
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                      </select>
                    </div>{" "}
                    {userType === "clinic admin" ? (
                      <>
                        <div className="col-12 col-md">
                          <label className="label-edit">Username *</label>
                          <input
                            type="text"
                            className="form-control form-control-input mt-1"
                            placeholder=""
                            name="userName"
                            value={formData?.userName}
                            defaultValue={formData?.userName}
                            onChange={handleChange}
                          />
                          {errorUsername?.userName && (
                            <p className="text-danger mt-2">
                              {errorUsername?.userName}
                            </p>
                          )}
                        </div>
                        <div className="col-12 col-md-3">
                          <label className="label-edit">
                            {" "}
                            <strong>Clinic Code</strong>
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-input mt-1"
                            defaultValue={getProfileData?.clinic_id}
                            disabled
                          />
                          {errorUsername?.userName && (
                            <p className="text-danger mt-2">
                              {errorUsername?.userName}
                            </p>
                          )}
                        </div>
                        <div className="row">
                          <div className="col-12 col-md-6 mt-3">
                            <label className="label-edit ">Email</label>
                            <input
                              className="form-control form-control-input"
                              defaultValue={getProfileData?.email}
                              disabled
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="d-flex col-10 gap-4">
                          {userType === "clinic admin" ? (
                            <>
                              <div className="col-12 col-md-3">
                                <label className="">Prefix *</label>
                                <select
                                  type="text"
                                  className="form-select form-control-input"
                                  placeholder=""
                                  name="md_type"
                                  value={formData?.md_type}
                                  defaultValue={formData?.md_type}
                                  onChange={handleChange}
                                >
                                  <option value="">Select</option>
                                  <option value="MD">MD</option>
                                  <option value="NP">NP</option>
                                  <option value="PA">PA</option>
                                  <option value="DO">DO</option>
                                </select>
                                {errors?.md_type && (
                                  <p className="text-danger mt-2">
                                    {errors?.md_type}
                                  </p>
                                )}
                              </div>{" "}
                            </>
                          ) : (
                            ""
                          )}
                          <div className="col-12 col-md">
                            <label className="label-edit">First Name *</label>
                            <input
                              type="text"
                              className="form-control form-control-input mt-1"
                              placeholder=""
                              name="first_name"
                              value={formData?.first_name}
                              onChange={handleChange}
                            />
                            {errors?.first_name && (
                              <p className="text-danger mt-2">
                                {errors?.first_name}
                              </p>
                            )}
                          </div>{" "}
                          <div className="col-12 col-md">
                            <label className="label-edit">Middle Name</label>
                            <input
                              type="text"
                              className="form-control form-control-input mt-1"
                              placeholder=""
                              name="middle_name"
                              value={formData?.middle_name}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-12 col-md">
                            <label className="label-edit">Last Name *</label>
                            <input
                              type="text"
                              className="form-control form-control-input mt-1"
                              placeholder=""
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleChange}
                            />
                            {errors?.last_name && (
                              <p className="text-danger mt-2">
                                {errors?.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="row mx-3 mt-4">
                    <div className="col-12 col-md-6">
                      <label className="label-edit">Password</label>

                      <input
                        type={toggle ? "text" : "password"}
                        className="form-control form-control-input mt-1"
                        placeholder=""
                        name="password"
                        id="rv-password"
                        onChange={handleChange}
                        value={formData?.password}
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
                        style={{ marginLeft: "88%", marginTop: "-38px" }}
                        onClick={() => {
                          let rgpassword =
                            document.getElementById("rv-password");
                          if (rgpassword?.type === "password") {
                            document.getElementById("rv-password").type =
                              "text";
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
                        <div className="password-validation">
                          <ul className="list-unstyled mt-3">
                            <li
                              style={{
                                color: criteria.length ? "green" : "red",
                              }}
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
                              style={{
                                color: criteria.number ? "green" : "red",
                              }}
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
                    </div>{" "}
                    <div className="col-12 col-md-6">
                      <label className="label-edit">Confirm Password</label>
                      <input
                        type={toggleConfirm ? "text" : "password"}
                        className="form-control form-control-input mt-1"
                        placeholder=""
                        id="rv-confirm-password"
                        name="confirmPassword"
                        onChange={handleChange}
                        value={formData?.confirmPassword}
                      />
                      <p
                        id="rg-eye"
                        style={{ marginLeft: "88%", marginTop: "-38px" }}
                        onClick={() => {
                          let rgpassword = document.getElementById(
                            "rv-confirm-password"
                          );
                          if (rgpassword?.type === "new-password") {
                            document.getElementById(
                              "rv-confirm-password"
                            ).type = "text";
                          } else {
                            document.getElementById(
                              "rv-confirm-password"
                            ).type = "password";
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
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <div className="any mt-3">
                      Password must have at least 8 characters, including
                      number, an uppercase and symbol.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {userType === "clinic admin" || userType === "provider" ? (
              <div className="row mx-3 mt-4">
                <div className="col-12 col-md-6">
                  <strong className="bold ">QR Code</strong>
                  <div className="d-flex flex-column mt-2">
                    <img
                      src={base_url + getProfileData?.qrCode}
                      alt="Clinic QR Code"
                      style={{ maxWidth: "200px", height: "auto" }}
                    />
                    <button
                      type="button"
                      className="btn fw-bold btn-save ms-2 text-white mt-3"
                      onClick={handleDownloadQRcode}
                      style={{ width: "fit-content" }}
                    >
                      <i className="fas fa-download"></i>
                      Download QR Code
                    </button>
                  </div>
                </div>
              </div>
            ) : null}


            <div className=" col-md-12 mt-4">
              <div className="row pt-2">
                <div className="col-md-12 text-end">
                  <button
                    className="btn btn-cancel-user "
                    onClick={() => {
                      onCloseModal();
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn fw-bold btn-save ms-2 text-white"
                    onClick={(e) => handleSave(e)}
                    disabled={btnDisable === true}
                  >
                    Save
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

export default ProfileModal;
