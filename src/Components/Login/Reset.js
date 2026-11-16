import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "../../redux/apis/login_api";

const Reset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get("email");
  const [email, setEmail] = React.useState(emailFromQuery || "");
  const [errMsg, setErrMsg] = React.useState("");

  const [ resetPassword, {isSuccess , isError} ] = useResetPasswordMutation();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    }
  };

  useEffect(() => {
    if(isSuccess){
      navigate("/reset");
    }

    if(isError){
      setErrMsg("Invalid User, As No User Exit");
      setTimeout(() => {        
        setErrMsg("");
        return false;
      }, 3000);
    }
  }, [isSuccess , isError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email === "") {
      setErrMsg("Email is required");
      setTimeout(() => {
        setErrMsg("");
      }, 3000);
      return false;
    }
    let payload = {
      email: email,
      screenType: "other"
    };
    resetPassword(payload);
  };

  return (
    <>
   <div className="login-wrapper ">
              <div className="text-center pb-4">
                <h2 className="login-title ">Reset Your Password </h2>
                <p>
                  Please provide your email and we’ll send a link to reset your
                  password.
                </p>
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

              <form action="#!">
                <div className="">
                  <label className="sr-only sr-onlys"> Email </label>

                  <input
                    type="email"
                    name="email"
                    value={email}
                    id="email"
                    className="form-control"
                    placeholder="Email"
                    onChange={handleOnChange}
                  />
                </div>

                <div className="col-12">
                  <div className="d-grid">
                    <button
                      onClick={handleSubmit}
                      className="shadow-none rg-btn-dark mt-4"
                    >
                      Submit
                    </button>{" "}
                    <button
                      onClick={() => {
                        navigate('/');
                      }}
                      className=" rv-reset-cancel mt-4"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
    </>
  );
};

export default Reset;
