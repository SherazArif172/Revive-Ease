import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";

import DatePicker from "react-datepicker";
// import { useSelector } from "react-redux";
import { useSelector } from "react-redux";
import { useGetAllClinicQuery } from "../../redux/apis/clinic_api";
import BlockKeyboardInput from "../../utils/BlockKeyboardInput";



const diagnosisList = [
  "Chronic Fatigue Syndrome",
  "Complex Regional Pain Syndrome",
  "Elbow/Wrist Pain",
  "Fibromyalgia",
  "Generalized Pain",
  "Knee Pain",
  "Low Back Pain",
  "Neck Pain",
  "Osteoarthritis",
  "Post-op Hip Pain",
  "Post-op Knee Pain",
  "Post-op Shoulder Pain",
  "Post-op Spine Surgery Pain",
  "Radiculopathy",
  "Rheumatoid Arthritis",
  "Shoulder Pain",
  "Spondylosis",
  "Other"
];

const diagnosisListSort = diagnosisList.sort();





const ReportFiterCanva = ({
  filterCanva,
  onClose,
  handleApplyFilter,
  handleDateChange,
  handleInputChange,
  tempFilter,
  handleClear
}) => {
  const id = useSelector((state) => state.user?.id);



  const clinicListing = useSelector((state) => state?.allClinics?.AllClinics?.data);

  // Get coach data from Redux store
  const coachList = useSelector((state) => state?.allCoach?.coach);
  

  
   // eslint-disable-next-line no-unused-vars 
  const { refetch: clinicRefetch } = useGetAllClinicQuery({
    page: 1,
    rowsPerPage: 1000 ,
    sortOrder : "asc",
    sortBy : "clinic_name",
    revive_admin_id: id
  });



  return (
    <>
      <COffcanvas
        className="ps-3 pe-3 pt-3 offcanvas_filter"
        backdrop="static"
        placement="end"
        visible={filterCanva}
        onHide={onClose}
      >
        <COffcanvasHeader>
          <COffcanvasTitle>Filters</COffcanvasTitle>
          <CCloseButton
            className="text-reset modal-close-cross"
            onClick={onClose}
          />
        </COffcanvasHeader>
        <COffcanvasBody>
          <div
            className="d-flex justify-content-between flex-column"
            style={{ height: "100%" }}
          >
            <div>
              {/* Month Picker */}
              <div className="  ">
                <p className="mb-2 fs-16 fw-bold text-black">Select Month</p>
                <div className="form-group has-search-right">
                  <DatePicker
                    customInput={<BlockKeyboardInput />}
                    className="form-control input-dt shadow"
                    selected={tempFilter?.selectedMonth}
                    onChange={(date) => handleDateChange(date)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    placeholderText="Select Month"
                    maxDate={new Date()}
                  />
                </div>
              </div>

              {/* Clinic Name Dropdown */}
              <div className="form-group has-search-right mt-2">
                <select
                  className="form-select form-control-input"
                  name="clinic_id"
                  value={tempFilter?.clinic_id || ""}
                  onChange={handleInputChange}
                >
                  <option value="">Select Clinic</option>
                  {clinicListing && clinicListing.map((clinic, index) => (
                    <option key={index} value={clinic?.clinic_id}>
                      {clinic?.clinic_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coach Name Dropdown */}
              <div className="form-group has-search-right mt-2">
                <select
                  className="form-select form-control-input"
                  name="coachName"
                  value={tempFilter?.coachName || ""}
                  onChange={handleInputChange}
                >
                  <option value="">Select Coach</option>
                  {coachList && coachList.map((coach, index) => (
                    <option key={index} value={`${coach?.last_name} ${coach?.middle_name} ${coach?.first_name}`}>
                      {coach?.last_name} {coach?.middle_name} {coach?.first_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Diagnosis Name Dropdown */}
              <div className="form-group has-search-right mt-2">
                <select
                  className="form-select form-control-input"
                  name="diagnosis"
                  value={tempFilter?.diagnosis || ""}
                  onChange={handleInputChange}
                >
                  <option value="">Select Diagnosis</option>
                  {diagnosisListSort.map((diagnosis) => (
                    <option key={diagnosis} value={diagnosis}>
                      {diagnosis}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="col-12">
              <div className="d-grid">
                <button
                  onClick={() => {
                    handleClear();
                  }}
                  className="shadow-none reset-apply-btn fw-bold"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    onClose();
                    handleApplyFilter();
                  }}
                  className="shadow-none filter-apply-btn mt-4"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </COffcanvasBody>
      </COffcanvas>
    </>
  );
};

export default ReportFiterCanva;
