import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetAllProvierListQuery } from "../../../../redux/apis/provider_api";
import { useGetAllCoachQuery } from "../../../../redux/apis/allCoach_api";
import { toast } from "react-toastify";

const SelectProvider = ({ onChangeSelect, setRessignModal, ressignHandler, id, type, deletedRowData }) => {

  const providerList = useSelector((state) => state?.allProvider?.provider?.data);
  const coachList = useSelector((state) => state?.allCoach?.coach);

  // eslint-disable-next-line no-unused-vars
  const { data: getAllProvider, refetch } = useGetAllProvierListQuery(id);
  // eslint-disable-next-line no-unused-vars
  const { data: getAllCoach } = useGetAllCoachQuery();

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id]);

  const filteredCoachList = coachList?.filter((coach) => coach?._id !== deletedRowData);
  const filteredProviderList = providerList?.filter((provider) => provider?._id !== deletedRowData);

  const handleReassignClick = () => {
    if (type === "coach") {
      if (!filteredCoachList?.length) {
        toast.error("No coaches available for reassignment.");
        return;
      }
    } else {
      if (!filteredProviderList?.length) {
        toast.error("No providers available for reassignment.");
        return;
      }
    }

    const selectElement = document.getElementById("modal-select");
    if (selectElement && !selectElement.value) {
      toast.error(`Please select a ${type === "coach" ? "coach" : "provider"} before reassigning.`);
      return;
    }

    try {
      ressignHandler();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Something went wrong while reassigning.";
      toast.error(message);
    }
  };

  return (
    <>
      <div className="content-modal text-start">
        {`Please select the alternate ${type === "coach" ? "Coach" : "Provider"}.`}
      </div>
      {type === "coach" ? null :
        <select
          className="form-select form-select-lg mb-2 mt-3"
          name="provider_id"
          id="modal-select"
          aria-label=".form-select-lg example"
          onChange={onChangeSelect}
        >
          <option value="">Select Provider</option>
          {filteredProviderList && filteredProviderList?.map((provider, index) => (
            <option key={index} value={provider?._id}>
              {provider?.first_name}{" "}{provider?.last_name}
            </option>
          ))}
        </select>}
      {type === "coach" ?
        <select
          className="form-select form-select-lg mb-2 mt-3"
          name="coach_id"
          id="modal-select"
          aria-label=".form-select-lg example"
          onChange={onChangeSelect}
        >
          <option value="">Select Coach</option>
          {filteredCoachList && filteredCoachList?.map((coach, index) => (
            <option key={index} value={coach?._id}>
              {coach?.first_name}{" "}{coach?.last_name}
            </option>
          ))}
        </select> : null}
      <div className="note-modal text-start">
        {`Note: the ${type === "coach" ? "coach" : "provider"} selected from the above dropdown will be from the
        same practice.`}
      </div>
      <br />

      <div className="d-flex justify-content-center col-md-12">
        <button
          className="modal-close"
          onClick={() => {
            setRessignModal(false);
          }}
        >
          Close
        </button>
        <button
          className="modal-assign ms-3"
          onClick={handleReassignClick}
        >
          Reassign
        </button>
      </div>
    </>
  );
};

export default SelectProvider;
