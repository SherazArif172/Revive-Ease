import React, { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { setUserData } from "../../redux/reducers/userReducer";
import { useLoginMutation } from "../../redux/apis/login_api";
import { getToken } from "firebase/messaging";
import { messaging } from "../../firebase/confiq";
import { 
  setRememberMeData, 
  clearRememberMeData, 
  setRememberMeCredentials,
  getRememberedCredentials,
  clearRememberMeCredentials
} from "../../utils/cookieUtils";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [errClass, setErrClass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const speficiedRole = ["admin", "sub admin", "coach", "provider", "clinic admin"];
  const [login, { data: loginData, isSuccess: loginSuccess }] = useLoginMutation();
  const userType = loginData?.data?.user?.userType;
  const userData = loginData?.data?.user;

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedCredentials = getRememberedCredentials();
    if (rememberedCredentials.email) {
      setEmail(rememberedCredentials.email);
      setPassword(rememberedCredentials.password);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (loginData) {
      const userDataPayload = {
        email: loginData?.data?.user?.email,
        userType: userType,
        token: loginData?.token,
        id: loginData?.data?.user?._id,
        userData: userData,
        fcmToken: loginData?.data?.user?.fcmToken,
        isRemembered: rememberMe
      };
      
      dispatch(setUserData(userDataPayload));

      // Store remember me data if checkbox is checked
      if (rememberMe) {
        setRememberMeData(userDataPayload);
      } else {
        clearRememberMeData();
      }
    }
  }, [loginData, rememberMe, dispatch, userType, userData]);

  useEffect(() => {
    if (loginSuccess) {
      const userToken = loginData?.token;
      const user = loginData?.data?.user;
      const userType = user?.userType;
      const fcmToken = user?.fcmToken;
      const firstLogin = user?.firstLogin; 
      const existingUser = speficiedRole.includes(userType);
      localStorage.setItem("token", userToken);
      localStorage.setItem("fcmToken", fcmToken);

      if (firstLogin && (user?.userType === "coach" || user?.userType === "provider")) {
        navigate("/change-password" , {         
            state: { userId: user?._id },
        }); 
        return; 
      }

      if (userToken && userType && existingUser) {
        switch (userType) {
          case "admin":
            navigate("/clinics");
            break;
          case "sub admin":
            navigate("/clinics");
            break;
          case "coach":
            navigate("/coachPatients");
            break;
          case "provider":
            navigate("/mypatients");
            break;
          case "clinic admin":
            navigate("/patients");
            break;
          default:
            break;
        }
      }
    }
  }, [loginData, loginSuccess, navigate, speficiedRole]);

  const handleError = (message) => {
    setErrMsg(message);
    setErrClass(true);
    setTimeout(() => {
      setErrMsg("");
      setErrClass(false);
    }, 3000);
    return false;
  };

  const toggler = () => {
    setToggle(!toggle);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email === '' || password === '') {
      handleError("Both fields are required*");
      return;
    }
    const emailValidate = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/;
    if (!emailValidate.test(email)) {
      handleError("Please enter a valid email address *");
      return;
    }

    // Handle remember me for credentials pre-fill (before login attempt)
    if (rememberMe) {
      setRememberMeCredentials(email, password);
    } else {
      clearRememberMeCredentials();
    }

    let fcmToken = null;
    if (messaging && Notification.permission === "granted") {
      try {
        fcmToken = await getToken(messaging, {
          vapidKey: process.env.REACT_APP_VAPID_KEY,
        });
      } catch (err) {
        console.warn("Error getting FCM token:", err);
      }
    }

    let payload = {
      email: email,
      password: password,
      screenType: "web",
      fcmToken: fcmToken || null,
    };
    login(payload);
  };

  const handleResetPassword = () => {
    navigate(`/reset-password?email=${email}`);
  };

  return (
    <>
      <div>
        <div className="text-center pb-4">
          <h2 className="login-title ">Login</h2>
          <p>Please enter your email and password to log in.</p>
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
        <form>
          <div className="">
            <label className="sr-only sr-onlys">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              id="email"
              className={`form-control ${errClass ? "field-err" : ""} `}
              placeholder="Email"
              onChange={handleOnChange}
            />
          </div>
          <div className="form-group mt-3 pt-2">
            <label htmlFor="password" className="sr-only sr-onlys">
              Password
            </label>
            <div className="d-flex">
              <input
                type={toggle ? "text" : "password"}
                value={password}
                name="password"
                id="rg-password"
                className={`form-control ${errClass ? "field-err" : ""} `}
                placeholder="Password"
                onChange={handleOnChange}
              />
              <p
                id="rg-eye"
                style={{
                  marginLeft: "-40px",
                  marginTop: "10px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  let rgpassword = document.getElementById("rg-password");
                  if (rgpassword?.type === "password") {
                    document.getElementById("rg-password").type = "text";
                  } else {
                    document.getElementById("rg-password").type = "password";
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check ">
              <input
                className="form-check-input shadow-none rg-customeck"
                type="checkbox"
                checked={rememberMe} // ✅ Fix: Use "checked" instead of "value"
                onChange={() => setRememberMe(!rememberMe)}
                id="flexCheckChecked"
              />
              <label
                className="form-check-label rg-remember"
                htmlFor="flexCheckChecked"
              >
                Remember Me
              </label>
            </div>

            <div onClick={handleResetPassword} className="reset-password">
              Reset Password
            </div>
          </div>
          <div className="col-12">
            <div className="d-grid">
              <button
                onClick={handleSubmit}
                className="rg-btn-dark roboto mt-4"
              >
                Login
              </button>
            </div>
          </div>
          <p className="login-wrapper-footer-text mt-4 text-center">
            {userType === "Provider" ? (
              <>Need to signup? </>
            ) : (
              <> Need help?{""} </>
            )}
            Please contact the system administrator.
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;