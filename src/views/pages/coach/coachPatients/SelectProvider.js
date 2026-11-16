import React from "react";

const SelectProvider = ({onChangeSelect,setRessignModal,ressignHandler}) => {
  return (
    <>
      <div className="content-modal text-start">
        Please select the alternate Provider.
      </div>
      <select
        onChange={onChangeSelect}
        className="form-select form-select-lg mb-2 mt-3"
        id="modal-select"
        aria-label=".form-select-lg example"
      >
        <option selected value="">
          Select Provider
        </option>
        <option value="Arnold Wilson" name="1">
          Arnold Wilson
        </option>
        <option value="Jack Thomas" name="2">
          Jack Thomas
        </option>
        <option value="Nicomen" name="3">
          Nicomen
        </option>
      </select>

      <div className="note-modal text-start">
        Note: the provider selected from the above dropdown will be from the
        same practice.
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
          style={{ backgroundColor: "#04470C" }}
          className="modal-assign ms-3 "
          onClick={() => {
            ressignHandler();
          }}
        >
          Reassign
        </button>
      </div>
    </>
  );
};

export default SelectProvider;
