import { CModal, CModalBody, CModalTitle } from "@coreui/react";
import React, { useEffect } from "react";
import { useGetAllProvierListQuery, } from "../../redux/apis/provider_api";
import { useGetAllCoachQuery } from "../../redux/apis/allCoach_api";
import { useSelector } from "react-redux";

const AssignModal = ({ onClose, assignModal, onConfirm, setFormData, formData, selectedRowClinicId, selectedRow }) => {

  const providerList = useSelector((state) => state?.allProvider?.provider?.data);
  const coachList = useSelector((state) => state?.allCoach?.coach);
  const userType = useSelector((state) => state?.user?.userType);

  // eslint-disable-next-line no-unused-vars
  const { data: getAllProvider, refetch: providerRefetch } = useGetAllProvierListQuery(selectedRowClinicId, { skip: !selectedRowClinicId, refetchOnMountOrArgChange: true });
  // eslint-disable-next-line no-unused-vars
  const { data: getAllCoach } = useGetAllCoachQuery();

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
        visible={assignModal}
        onClose={onClose}
        size="md"
      >
        <div className="d-flex justify-content-center CModalHeader">
          <CModalTitle className="text-white">Assign</CModalTitle>
        </div>
        <CModalBody className="main-modal-body">
          <div style={{ width: "400px" }}>
            <p className="text-center fw-bold">
              {userType === "clinic admin" ? "Select the Provider to be assigned." : "Select the Provider and Coach to be assigned."}
            </p>

            <div className="text-start">
              <div className="my-3">
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
            </div>

            <div className="d-flex justify-content-center col-md-12 py-3">
              <button className="modal-close" onClick={onClose}>
                Close
              </button>
              <button

                className="modal-assign ms-3 text-white"
                onClick={onConfirm}
              >
                Assign
              </button>
            </div>
          </div>
        </CModalBody>
      </CModal>
    </>
  );
};

export default AssignModal;
