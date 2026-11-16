import React from "react";
import { useNavigate } from "react-router-dom";
import Message from "../../assets/icons/messagesend.png";

const ResetSend = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="login-wrapper ">
        <div className="text-center mt-3 pt-5 pb-2">
          <img loading="lazy" src={Message} />
          <p className="para-reset ps-2 pt-3">
            Please check your email for instructions on resetting your password.
            If it's not visible in your inbox, please check your spam folder.
          </p>
        </div>
        <div className="col-12">
          <div className="d-grid">
            <button
              onClick={() => {
                navigate("/");
              }}
              className=" rv-reset-cancel"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetSend;
