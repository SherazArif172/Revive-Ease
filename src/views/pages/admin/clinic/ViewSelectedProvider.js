import React from "react";

const ViewSelectedProvider = ({closeRessign, data, type }) => {
  return (
    <>
      <div className="content-modal">
        {` The Old ${type === "coach" ? "Coach" : "Provider"} has been Deleted And Users Were Reassigned To The New
          ${type === "coach" ? "Coach" : "Provider"}.`}
      </div>
      <div className="d-flex justify-content-center my-3">
        <div className="choosed-provider">
          <strong>{type === "coach" ? "Coach" : "Provider"}</strong> {data?.newAssignee}
        </div>
      </div>

      <div className="d-flex justify-content-center col-md-12">
        <button
          className="modal-close"
          onClick={() => {
            closeRessign();
          }}
        >
          Close
        </button>
      </div>
    </>
  );
};

export default ViewSelectedProvider;
