import { CModal, CModalBody, CModalTitle } from "@coreui/react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetAllProvierListQuery } from "../../redux/apis/provider_api";

const ApproveModal = ({ approveModal, content, selectedRowClinicId, setFormData, selectedRow, formData, onClose, onConfirm, selectedRowId, messageData, watchList, errorMsg }) => {

  const providerList = useSelector((state) => state?.allProvider?.provider?.data);
  const coachList = useSelector((state) => state?.allCoach?.coach);
  const userType = useSelector((state) => state?.user?.userType);
  // eslint-disable-next-line no-unused-vars
  const { data: getAllProvider, refetch: providerRefetch } = useGetAllProvierListQuery(selectedRowClinicId, { skip: !selectedRowClinicId, refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (selectedRowClinicId) {
      providerRefetch();
    }
  }, [selectedRowClinicId, providerRefetch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };
  return (
    <>
      <CModal
        alignment="center"
        visible={approveModal}
        onClose={onClose}
        aria-labelledby="VerticallyCenteredExample"
      >
        <div className="d-flex justify-content-center CModalHeader">
          <CModalTitle className="text-white">{watchList === "true" ? "WatchList" : "Approve"}</CModalTitle>
        </div>

        <CModalBody className="main-modal-body">
          <div>
            <div className="content-modal ">{content && content}</div>
            {!watchList ? (<>

              <div className="mt-3 d-flex justify-content-center">
                {errorMsg && (
                  <div className="">
                    <span className="text-center rg-err" style={{ fontSize: "14px", color: 'red' }}>
                      {errorMsg}
                    </span>
                  </div>
                )}
              </div>

              <br />

              <div className="text-start">
                <div className="  ">
                  <label className="rv-label-newpractice py-2">Provider</label>
                  <select
                    className="form-select form-control-input"
                    name="provider_id"
                    value={formData?.provider_id}
                    defaultValue={selectedRow?.provider?._id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Provider</option>
                    {providerList && providerList.map((provider, index) => (
                      <option key={index} value={provider?._id}>
                        {provider?.last_name} {provider?.middle_name.charAt(0).toUpperCase()} {provider?.first_name}
                      </option>
                    ))}
                  </select>
                </div>
                {userType === "clinic admin" ? null :
                  <div>
                    <label className="rv-label-newpractice py-2">Coach</label>
                    <select
                      className="form-select form-control-input"
                      name="coach_id"
                      value={formData?.coach_id}
                      defaultValue={selectedRow?.coach?._id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Coach</option>
                      {coachList && coachList.map((coach, index) => (
                        <option key={index} value={coach?._id}>
                          {coach?.last_name} {coach?.middle_name.charAt(0).toUpperCase()} {coach?.first_name}
                        </option>
                      ))}
                    </select>
                  </div>}
              </div></>

            ) : ""
            }
            <div className="d-flex justify-content-center col-md-12 mt-3">
              <button
                className="modal-close"
                onClick={onClose}>
                Close
              </button>
              {content === "Do you want to add this to watchlist?" || content == "Do you want to Approve this Patient?" ? (
                <button

                  className="modal-assign ms-3 text-white"
                  onClick={() => { onConfirm(selectedRowId); }}
                >
                  {content === "Do you want to add this to watchlist?" ? "Add" : "Approve"}
                </button>
              ) : content === "Do you want to remove this from watchlist?" ? (
                <button

                  className="modal-assign ms-3 text-white"
                  onClick={() => { onConfirm(selectedRowId); }}
                >
                  {messageData?.iswatchlisted === true ? "Remove" : "Add"}
                </button>
              ) : null}
            </div>
          </div>
        </CModalBody>
      </CModal>
    </>
  );
};

export default ApproveModal;
