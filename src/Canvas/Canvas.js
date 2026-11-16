//////////////////////////////canvas.js////////////////////////////////////////////////////////////
import React, { useState } from "react";
import { base_url } from "../global/global";
import { NavLink } from "react-router-dom";
// import {ProgressBar} from 'react-bootstrap';
function Canvas({
  addClinicResponse,
  COffcanvas,
  errClass,
  onclose,
  addNewClinic,
  COffcanvasHeader,
  COffcanvasTitle,
  errMsg,
  CCloseButton,
  closeClinic,
  COffcanvasBody,
  showQRCode,
  clientID,
  formData,
  Copy,
  closeScanner,
  handleOnchange,
  toggleConfirm,
  togglerConfirm,
  handleAddAndContinue,
  toggle,
  toggler,
  handleStateChange,
  usStates,
  cities,
  handleCityChange,
  errors,
  criteria,
  showValidation,
  setShowValidation,
  isSubmitted,
  btnDisabled,
  downloadQRCode,
  qrCodePath
}) {

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (clientID) {
      navigator.clipboard.writeText(clientID) 
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000); 
        })
        .catch(() => alert("Failed to copy code!"));
    }
  };
  return (
    <COffcanvas
      className="ps-3 pe-3  offcanvas_add"
      backdrop='static'
      placement="bottom"
      visible={addNewClinic}
      onHide={onclose}
    >
      <COffcanvasHeader>
        <COffcanvasTitle className="pt-4">
          Add Clinic Details
        </COffcanvasTitle>
        <COffcanvas></COffcanvas>

        <CCloseButton
          className="text-reset modal-close-cross"
          onClick={() => closeClinic()}
        />
      </COffcanvasHeader>

      <COffcanvasBody>
        {showQRCode && clientID ? (
          <div>
            <div className="container d-flex justify-content-center align-items-center ">
              <div className="text-center">
                <h3>QR Code Details</h3>
                {qrCodePath ? (
                  <img
                    src={base_url + qrCodePath}
                    alt="QR Code"
                    style={{ width: "260px", height: "260px" }}
                    className="my-4"
                  />
                ) : (
                  <div style={{ width: "260px", height: "260px" }} className="my-4 d-flex align-items-center justify-content-center">
                    <span>Loading QR Code...</span>
                  </div>
                )}
                <div className="fw-bold qr-code-body mb-2">
                  Clinic Code:{" "}
                  <span className="qr-code ms-4">
                    {clientID}
                      <img loading="lazy"
                        className="ms-2 pointer"
                        src={Copy}
                        onClick={handleCopy}
                        alt="Copy"
                        style={{ cursor: "pointer", transition: "0.3s" }}
                      />
                  </span>
                  <span>{isCopied && <span className="text-success ms-2">Copied!</span>}</span>
                </div>
                <div className="fw-bold mb-2">OR</div>
                <div className="fw-bold">
                  Link:{" "}
                  <NavLink
                    to={`${base_url}scan-clinic/${clientID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", textDecoration: "underline" }}
                  >
                    {base_url}scan-clinic/{clientID}
                    </NavLink>
                </div>
              </div>
            </div>
            <div className="col-md-12 text-end">
              <button
                className="btn fw-bold add-practs-btn  text-white  me-2"
                onClick={() => downloadQRCode && downloadQRCode({ clinicId : addClinicResponse?.newClinic?._id , clinicCode : addClinicResponse?.newClinic?.clinic_id  })}
              >
                Download QR
              </button>
              <button
                className="btn add-practs-btn ms-2"
                onClick={closeScanner}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form autoComplete="off">
            <div className="row ">
              <div className="col">
                <label className="rv-label-newpractice py-2">Name *</label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleOnchange}
                />
                {errors?.clinicName && (
                  <p className="text-danger mt-2">{errors?.clinicName}</p>
                )}
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleOnchange}
                />
                {errors?.addressLine && (
                  <p className="text-danger mt-2">{errors?.addressLine}</p>
                )}
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
                {errors?.state && (
                  <p className="text-danger mt-2">{errors?.state}</p>
                )}
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
                  name="zipCode"
                  value={formData.zipCode}
                  maxLength={5}
                  onChange={handleOnchange}
                />
                {errors?.zipCode && (
                  <p className="text-danger mt-2">{errors?.zipCode}</p>
                )}
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  Contact Number *
                </label>
                <input
                  type="text"
                  maxLength="17"
                  className="form-control form-control-input"
                  name="cellNumber"
                  value={formData.cellNumber}
                  onChange={handleOnchange}
                />
                {errors?.cellNumber && (
                  <p className="error">
                    {<span style={{ color: "red" }}>{errors?.cellNumber}</span>}
                  </p>
                )}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">Email *</label>
                <input
                  type="text"
                  className={`form-control form-control-input  ${errClass ? "field-err" : ""
                    } `}
                  name="email"
                  value={formData.email}
                  onChange={handleOnchange}
                  autoComplete="off"
                />
                {errors?.email && (
                  <p className="text-danger mt-2">{errors?.email}</p>
                )}
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  Web Address *
                </label>
                <input
                  type="text"
                  className="form-control form-control-input"
                  name="webAddress"
                  value={formData.webAddress}
                  onChange={handleOnchange}
                />
                {errors?.webAddress && (
                  <p className="text-danger mt-2">{errors?.webAddress}</p>
                )}
              </div>
            </div>
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">User Type *</label>
                <select
                  className="form-control form-control-input"
                  name="userType"
                  value={formData?.userType}
                  onChange={handleOnchange}
                  disabled
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
                {errors?.userName && (
                  <p className="text-danger mt-2">{errors?.userName}</p>
                )}
              </div>
            </div>{" "}
            <div className="row pt-5">
              <div className="col">
                <label className="rv-label-newpractice py-2">Password *</label>
                <input
                  type={toggle ? "text" : "password"}
                  className={`form-control form-control-input`}
                  name="password"

                  id="rv-password"
                  value={formData?.password}
                  onChange={handleOnchange}
                  onFocus={() =>
                    setShowValidation((prev) => ({ ...prev, password: true }))
                  }
                  onBlur={() =>
                    setShowValidation((prev) => ({ ...prev, password: false }))
                  }
                  autoComplete="new-password"
                />
                <p
                  id="rg-eye"
                  style={{ marginLeft: "96%", marginTop: "-36px" }}
                  onClick={() => {
                    let rgpassword = document.getElementById("rv-password");
                    if (rgpassword?.type === "password") {
                      document.getElementById("rv-password").type = "text";
                    } else {
                      document.getElementById("rv-password").type = "password";
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
                {isSubmitted && errors.password && (
                  <p className="text-danger mt-2">{errors.password}</p>
                )}
                {showValidation?.password && (
                  <ul className="list-unstyled">
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
                )

                }
                {errMsg && (
                  <p className="text-danger mt-2">{errMsg}</p>
                )}
              </div>
              <div className="col">
                <label className="rv-label-newpractice py-2">
                  Confirm Password *
                </label>
                <input
                autoComplete="new-password"
                  type={toggleConfirm ? "text" : "password"}
                  className="form-control form-control-input"
                  id="rv-confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleOnchange}

                />
                <p
                  id="rg-eye"
                  style={{ marginLeft: "96%", marginTop: "-36px" }}
                  onClick={togglerConfirm}
                >
                  {toggleConfirm ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
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
                {errors?.confirmPassword && (
                  <p className="error">
                    {
                      <p className="text-danger mt-2">
                        {errors?.confirmPassword}
                      </p>
                    }
                  </p>
                )}
              </div>
            </div>
            <div className="row pt-4">
              <div className="col-md-12 text-end">
                <button className=" rv-reset-cancel mt-4" type="button" onClick={closeClinic}>
                  Cancel
                </button>
                <button
                  disabled={btnDisabled === true}
                  className="btn add-practs-btn ms-2"
                  onClick={handleAddAndContinue}
                >
                  Add & Continue
                </button>
              </div>
            </div>
          </form>
        )}
      </COffcanvasBody>
    </COffcanvas>
  );
}

export default Canvas;
