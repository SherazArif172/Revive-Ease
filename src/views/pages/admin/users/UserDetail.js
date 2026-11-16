import {
  CBreadcrumb,
  CBreadcrumbItem,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import React, { useState, useRef } from "react";
import Alex from "../../../../assets/icons/alex.png";
import BackArrow from "../../../../assets/icons/backArrow.png";
import Edit from "../../../../assets/icons/edit.png";
import MessageIcon from "../../../../assets/icons/message.png";
import { Badge } from "@mui/material";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Avatar from "react-avatar-edit";
import useSelectedRole from "../../../../SelectedRole";
import { useUpdateClinicUserMutation } from "../../../../redux/apis/clinic_api";
import UpdateUser from "./UpdateUser";
import { useGetAllUserQuery } from "../../../../redux/apis/allCoach_api";
import { useSelector } from "react-redux";
import { base_url } from "../../../../global/global";

const UserDetail = () => {
  const { state } = useLocation();
  const user_id = state?._id;

  const [visible, setVisible] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [toggleConfirm, setToggleConfirm] = useState(false);
  const [avatarURL, setAvatarURL] = useState(Alex);
  const fileUploadRef = useRef(null);
  const routes = useSelectedRole();
  const [imgCrop, setImgCrop] = useState(false);
  const [updateUser, { isSuccess: isUpdateUserSuccess }] = useUpdateClinicUserMutation();
  // eslint-disable-next-line no-unused-vars
  const { data: user, refetch } = useGetAllUserQuery({ searchText: "", filter: "", page: 1, rowsPerPage: 10});

  const userData = useSelector((state) => {
    return state?.allCoach?.user?.data?.find((item) => {
      return item?._id === user_id;
    });
  });

  const handleChanges = (e) => {
    if (e.target && e.target?.files) {
      const uploadedFile = e.target?.files[0];
      const cachedURL = URL.createObjectURL(uploadedFile);
      setImgCrop(cachedURL);
    }
  };
  const onCrop = (view) => {
    setImgCrop(view);
  };

  const onClose = () => {
    setImgCrop(null);
  };
  const saveImg = () => {
    if (imgCrop) {
      const newImage = { imgCrop };
      setAvatarURL(newImage?.imgCrop);
      setVisible(false);
    }
  };
  const toggler = () => {
    setToggle(!toggle);
  };
  const togglerConfirm = () => {
    setToggleConfirm(!toggleConfirm);
  };
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => navigate("/users");

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const segmentNames = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const matchedRoute = routes.find((route) => route.path === path);

    const routeName = matchedRoute
      ? matchedRoute.name
      : segment.charAt(0).toUpperCase() + segment.slice(1);
    return matchedRoute && matchedRoute.badge ? (
      <>
        {routeName}{" "}
        <Badge eolor="primary" pill>
          {matchedRoute.badge}
        </Badge>
      </>
    ) : (
      routeName
    );
  });

  const handleEditModal = () => {
    setEditModal(true);
  };

  return (
    <>
      <div className="main-container mt-3">
        <div>
          <CBreadcrumb>
            {pathSegments.map((segment, index) => {
              const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
              const isLastSegment = index === pathSegments.length - 1;
              return (
                <CBreadcrumbItem key={path} active={isLastSegment}>
                  {isLastSegment ? (
                    segmentNames[index] || segment
                  ) : (
                    <NavLink to={path}>
                      {segmentNames[index] || segment}
                    </NavLink>
                  )}
                </CBreadcrumbItem>
              );
            })}
          </CBreadcrumb>
        </div>
        <div className="d-flex ps-3 py-3 bg-white user-sm-container">
          <div className="pointer px-2" onClick={handleBack}>
            <img loading="lazy" className="" src={BackArrow} height={16} width={9.6} />
          </div>
          <div>
            <img loading="lazy"
              src={base_url + state?.profile_img}
              width={32}
              height={32}
              className="rounded-circle ms-2"
            />
          </div>
          <div className="profile-name">{`${state?.last_name} ${state?.middle_name.charAt(0).toUpperCase()} ${state?.first_name}`}</div>{" "}
          <span className="mx-2 divider">|</span>{" "}
          <div>
            <img loading="lazy" src={MessageIcon} height={12} width={18} />{" "}
            <span className="fs-14 divider">{state?.email}</span>
          </div>
        </div>
        <div className="detail-container ps-3 mt-4 bg-white">
          <div>
            <strong>Personal Data</strong>
            {userData?.status === 'active' ? <span
              onClick={() => {
                handleEditModal(true);
              }}
            >
              {" "}
              <img loading="lazy" src={Edit} className="ps-2 py-1 pb-1 pointer" />
            </span> : null}
          </div>
          <div className="card-wrapper me-3 mt-3">
            <div className="row">
              <div className="col-12 col-md-6">
                <div className="d-flex justify-content-between">
                  <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                    First Name
                  </label>
                  <div className="text-truncate col-7">
                    {userData?.first_name ? userData?.first_name : "-"}
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                    Middle Name
                  </label>
                  <div className="text-truncate col-7">
                    {userData?.middle_name ? userData?.middle_name : "-"}
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                    Last Name
                  </label>
                  <div className="text-truncate col-7">
                    {userData?.last_name ? userData?.last_name : "-"}
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                    Email
                  </label>
                  <div className="text-truncate col-7">
                    {userData?.email ? userData?.email : "-"}
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="d-flex justify-content-between">
                  <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                    Phone Number
                  </label>
                  <div className="text-truncate col-7">
                    {userData?.cell_number ? userData?.cell_number : "-"}
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                    Address
                  </label>
                  <div className="text-truncate col-7">
                    {userData?.address_line_1 ? userData?.address_line_1 : "-"}
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <label className="label-headerinfo col-5 col-md-4 col-lg-3 ps-2 py-1">
                    ZipCode
                  </label>
                  <div className="text-truncate col-7">
                    {userData?.zip_code ? userData?.zip_code : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UpdateUser
        editModal={editModal}
        userData={userData}
        setEditModal={setEditModal}
        setVisible={setVisible}
        toggle={toggle}
        toggler={toggler}
        handleEditModal={handleEditModal}
        isUpdateUserSuccess={isUpdateUserSuccess}
        avatarURL={avatarURL}
        state={state}
        refetch={refetch}
        toggleConfirm={toggleConfirm}
        togglerConfirm={togglerConfirm}
        updateUser={updateUser}
      />
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
              onChange={handleChanges}
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
            <CButton className=" rv-reset-cancel mt-4" type="button" onClick={() => setVisible(false)}>
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

export default UserDetail;