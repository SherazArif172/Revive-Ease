import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PasswordChecklist from "react-password-checklist";
import { useParams } from "react-router-dom";
import { useChangePasswordMutation } from "../../redux/apis/login_api";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const userId = location.state?.userId;

  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [toggle, setToggle] = useState(false);
  const [toggleConfirm, setToggleConfirm] = useState(false);
  const [errClass, SetErrClass] = useState(false);
  const [errConfirm, setErrConfirm] = useState(false);

  const [changePassword, { isSuccess }] = useChangePasswordMutation();

  const toggler = () => {
    setToggle(!toggle);
  };
  const togglerConfirm = () => {
    setToggleConfirm(!toggleConfirm);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPass") {
      setConfirmPass(value);
    }
  };

  useEffect(() => {
    if (!id && !userId) {
      navigate("/"); 
    }
  }, [id, userId, navigate]);
  
  useEffect(() => {
    if (isSuccess) {
      navigate('/changed');
    }
  }, [isSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const minLength = confirmPass.length >= 8;
    const hasCapital = /[A-Z]/.test(confirmPass);
    const hasNumber = /\d/.test(confirmPass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(confirmPass);
    if (password === "" || confirmPass === "") {
      setErrMsg("Please complete both password fields*");
      SetErrClass(true);
      setTimeout(() => {
        setErrMsg("");
        SetErrClass(false);
      }, 3000);
      return false;
    } else if (!minLength || !hasCapital || !hasNumber || !hasSpecialChar) {
      setErrMsg("Password does not meet the required criteria");
      SetErrClass(true);
      setTimeout(() => {
        setErrMsg("");
        SetErrClass(false);
      }, 3000);
      return false;
    } else if (password !== confirmPass) {
      setErrMsg('New password and confirm password do not match');
      setTimeout(() => {
        setErrMsg("");
        SetErrClass(false);
        setErrConfirm(false);
      }, 1000);
      return;
    }
    const payload = {
      password: password,
    };
    changePassword({ payload: payload, id: id  || userId });
  };

  const onFocus = () => {
    SetErrClass(true);
  };

  const onBlur = () => {
    SetErrClass(false);
  };
  const onConfirmFocus = () => {
    setErrConfirm(true);
  };
  const onConfirmBlur = () => {
    setErrConfirm(false);
  };
  return (
    <>
      <div className="text-center pb-4">
        <h2 className="login-title ">Reset Your Password</h2>
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
      </div>

      <form className="">
        <div className="form-group mt-2 pt-2">
          <label htmlFor="password" className="sr-only sr-onlys">
            New Password
          </label>
          <div className="d-flex">
            <input
              value={password}
              type={toggle ? "text" : "password"}
              name="password"
              id="rv-password"
              className={`form-control ${errClass ? "field-err" : ""} `}
              placeholder="Password"
              onChange={handleOnChange}
              onFocus={onConfirmFocus}
              onBlur={onConfirmBlur}
              autoComplete="password"
            />
            <p
              id="rg-eye"
              style={{
                marginLeft: "-40px",
                marginTop: "10px",
                cursor: "pointer",
              }}
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
          </div>
        </div>

        <div className="form-group mt-3 pt-2">
          <label htmlFor="password" className="sr-only sr-onlys">
            Confirm Password
          </label>
          <div className="d-flex">
            <input
              value={confirmPass}
              type={toggleConfirm ? "text" : "password"}
              name="confirmPass"
              id="rv-confirm-password"
              className={`form-control ${errClass ? "field-err" : ""} `}

              placeholder="Confirm Password"
              onChange={handleOnChange}
              autoComplete="new_password"
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <p
              id="rg-eye"
              style={{
                marginLeft: "-40px",
                marginTop: "10px",
                cursor: "pointer",
              }}
              onClick={() => {
                let rgpassword = document.getElementById(
                  "rv-confirm-password"
                );
                if (rgpassword?.type === "password") {
                  document.getElementById("rv-confirm-password").type =
                    "text";
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
        {errConfirm && (
          <>
            {confirmPass === "" ? (
              null
            ) : password !== confirmPass ? (
              <div>
                <p className="err-msg-confirm">
                  New password and confirm password do not match
                </p>
              </div>
            ) : null}
          </>
        )}
        {errClass ? (
          <>
            <div className="mt-4">
              <strong>Your password must:</strong>
            </div>

            <PasswordChecklist
              className="password-checklist py-1"
              rules={["minLength", "capital", "number", "specialChar"]}
              minLength={8}
              value={confirmPass}
              messages={{
                minLength: "Be at least 8 characters",
                capital: "Include at least one uppercase letter",
                specialChar: "Include at least one symbol",
                number: "Include at least one number",
              }}
            />
          </>
        ) : (
          ""
        )}

        <div className="col-12">
          <div className="d-grid">
            <button
              onClick={handleSubmit}
              className="shadow-none rg-btn-dark mt-4"
              type="submit"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default ChangePassword;