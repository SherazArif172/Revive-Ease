import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import React, { useEffect, useState } from "react";

const AddNewProvider = ({
  onclose,
  errorMsg,
  isAddProviderLoading,
  isAddSuccess,
  AddProviderError,
  setAddNewUser,
  addNewUser,
  clinic_name,
  errMsg,
  formData,
  handleUserChange,
  errors,
  handleAddUser,
  setUserModal,
  handleClose,
}) => {
  const [errorMessage, setErrorMsg] = useState("");
  const [btnDisable, setBtnDisable] = useState(false);

  useEffect(() => {
    if (isAddProviderLoading) {
      setBtnDisable(true);
    } else if (isAddSuccess) {
      setBtnDisable(false);
    } else if (AddProviderError) {
      setBtnDisable(false);
    }
  }, [isAddProviderLoading, isAddSuccess, AddProviderError]);

  useEffect(() => {
    setErrorMsg(errorMsg);
    if (errorMsg) {
      setTimeout(() => {
        setErrorMsg("");
      }, 3000);
    }
  }, [errorMsg]);

  return (
    <div>
      <>
        <COffcanvas
          className="ps-3 pe-3  offcanvas_add_user"
          backdrop="static"
          placement="bottom"
          visible={addNewUser}
          onHide={onclose}
        >
          <COffcanvasHeader className="">
            <COffcanvasTitle className="pt-4 offcanvas-title">
              Add New Provider{" "}
              <span className="clinic-title-canva fs-12">{clinic_name}</span>
              <span className="ms-2">
                {errMsg ? (
                  <span
                    className="mt-4 ml-5 text-center rg-err"
                    style={{ fontSize: 14 }}
                  >
                    {errMsg}
                  </span>
                ) : (
                  ""
                )}
              </span>
              {errorMessage ? (
                <span
                  className="mt-4 ml-5 text-center rg-err"
                  style={{ fontSize: 14 }}
                >
                  {"Provider with this email already exists."}
                </span>
              ) : (
                ""
              )}
            </COffcanvasTitle>
            <CCloseButton
              className="text-reset modal-close-cross"
              onClick={handleClose}
            />
          </COffcanvasHeader>
          <COffcanvasBody>
            <div>
              <div className="row ">
                <div className="col col-md-2 ">
                  <label className="p-2">Type *</label>
                  <select
                    type="text"
                    className="form-select form-control-input"
                    placeholder=""
                    name="md_type"
                    value={formData?.md_type}
                    defaultValue={formData?.md_type}
                    onChange={handleUserChange}
                  >
                    <option value="">Select</option>
                    <option value="MD">MD</option>
                    <option value="NP">NP</option>
                    <option value="PA">PA</option>
                    <option value="DO">DO</option>

                  </select>
                  {errors?.md_type && (
                    <p className="text-danger mt-2">{errors?.md_type}</p>
                  )}
                </div>{" "}
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
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
                  {errors?.first_name && (
                    <p className="text-danger mt-2">{errors?.first_name}</p>
                  )}
                </div>
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
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
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="last_name"
                    value={formData?.last_name}
                    onChange={handleUserChange}
                  />
                  {errors?.last_name && (
                    <p className="text-danger mt-2">{errors?.last_name}</p>
                  )}
                </div>
              </div>
              <div className="row pt-5">
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Email *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="email"
                    value={formData.email}
                    onChange={handleUserChange}
                  />
                  {errors?.email && (
                    <p className="text-danger mt-2">{errors?.email}</p>
                  )}
                </div>
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Cell Number *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="cell_number"
                    value={formData.cell_number}
                    onChange={handleUserChange}
                  />
                  {errors?.cell_number && (
                    <p className="text-danger mt-2">{errors?.cell_number}</p>
                  )}
                </div>
              </div>
              <div className="row pt-5">
                <div className="col-md-6">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    User Type *
                  </label>
                  <select
                    type="text"
                    className="form-select form-control-input"
                    name="userType"
                    value="provider"
                    onChange={handleUserChange}
                    disabled
                  >
                    <option value={"provider"}>Provider</option>
                  </select>
                </div>
              </div>

              <div className="row pt-2">
                <div className="col-md-12 text-end">
                  <button
                    className=" rv-reset-cancel mt-4"
                    type="button"
                    onClick={() => {
                      setAddNewUser(false);
                      handleClose();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn add-practs-btn ms-2"
                    onClick={handleAddUser}
                    onClose={() => {
                      setUserModal(false);
                      handleClose();
                    }}
                    disabled={btnDisable === true}
                  >
                    Add Provider
                  </button>
                </div>
              </div>
            </div>
          </COffcanvasBody>
        </COffcanvas>
      </>
    </div>
  );
};

export default AddNewProvider;
