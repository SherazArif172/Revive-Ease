import {
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileModal from "../Modal/ProfileModal";
import { useDispatch, useSelector } from "react-redux";
import { persistor } from "../../redux/store";
import { useGetProfileDetailsByIdQuery } from "../../redux/apis/patient_coach_api";
import { clearRememberMeData } from "../../utils/cookieUtils";

const AppHeaderDropdown = ({ setAvatarURL, avatarURL }) => {
  const navigate = useNavigate();
  const actorType = useSelector((state) => state.user?.userType);
  const actorId = useSelector((state) => state.user?.id);
  const [profileModal, setProfileModal] = useState(false);
  const dispatch = useDispatch();
  const [criteria, setCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [showValidation, setShowValidation] = useState({
    password: false,
    confirmPassword: false,
  });
  const [formData, setFormData] = useState({
    title: '',
    md_type: "",
    first_name: '',
    last_name: '',
    middle_name: '',
    password: '',
    profile_img: '',
    userName: "",
    actorType: null,
    actorId: null
  });
  const [checked, setChecked] = useState({
    alertChecked: false,
    notificationChecked: false,
  });

  const loginDataId = useSelector((state) => state?.user?.id);
  const { refetch } = useGetProfileDetailsByIdQuery(loginDataId, {
    skip: !loginDataId,
  });

  useEffect(() => {
    if (actorId && actorType) {
      setFormData({
        actorId: actorId,
        actorType: actorType
      });
    }
  }, [actorId, actorType]);

  useEffect(() => {
    if (loginDataId) {
      refetch();
    }
  }, [loginDataId]);

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
  const closeModal = () => {
    setProfileModal(false);
    setCriteria({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      specialChar: false,
    });
    setFormData({
      password: "",
      confirmPassword: "",
      avatarURL: avatarURL,
    });
  };

  const logoutHandler = () => {
    localStorage.clear();
    clearRememberMeData(); // Clear remember me cookies
    dispatch({ type: "auth/logout" }); // Reset Redux store
    persistor.purge();
    navigate("/");
  };

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
          <FontAwesomeIcon icon={faAngleDown} />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownItem
            onClick={() => {
              setProfileModal(true);
            }}
            className="title-color mt-2"
          >
            Profile
          </CDropdownItem>
          <CDropdownDivider />
          <CDropdownItem className="title-color" onClick={logoutHandler}>
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      <ProfileModal
        checked={checked}
        checkStrength={checkStrength}
        onCloseModal={closeModal}
        profileModal={profileModal}
        setAvatarURL={setAvatarURL}
        avatarURL={avatarURL}
        criteria={criteria}
        setCriteria={setCriteria}
        showValidation={showValidation}
        formData={formData}
        setFormData={setFormData}
        setShowValidation={setShowValidation}
        setChecked={setChecked}
        setProfileModal={setProfileModal}
      />
    </>
  );
};

export default AppHeaderDropdown;
