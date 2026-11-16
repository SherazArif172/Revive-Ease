import React from "react";
import { useNavigate } from "react-router-dom";
import Success from "../../assets/icons/successImg.png";
const Changed = () => {
  const navigate = useNavigate();

  const navigateToLogin = () => {
 
    navigate("/");
  };

  return (
    <>
     <div>
     <div className="text-center mt-3 pt-5 pb-2">
                <img loading="lazy" src={Success} />

                <p className="para-reset 2 py-3 ">
                  Your password has been changed successfully.
                </p>
              </div>
              <div className="col-12 pt-1">
                <div className="d-grid">
                  <button
                    onClick={() => {
                      navigateToLogin();
                      // navigate(`/admin/login`);
                    }}
                    className="shadow-none rg-btn-dark mt-4"
                  >
                    Login
                  </button>
                </div>
              </div>
      </div>
    </>
  );
};

export default Changed;
