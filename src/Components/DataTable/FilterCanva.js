import React  from "react";
import {
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CCloseButton,
} from "@coreui/react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import BlockKeyboardInput from "../../utils/BlockKeyboardInput";
import { useGetAllProvierListQuery } from "../../redux/apis/provider_api";

// Diagnosis list copied from TaskTemplateOffcanvas.js
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
  "Pinched Nerve – Neck (Cervical Radiculopathy)",
  "Pinched Nerve – Low Back (Lumbar Radiculopathy)",
  "Post-op Hip Pain",
  "Post-op Knee Pain",
  "Post-op Shoulder Pain",
  "Post-op Spine Surgery Pain",
  "Rheumatoid Arthritis",
  "Shoulder Pain",
  "Spondylosis",
  "Other"
];

const diagnosisListSort = diagnosisList.sort((a, b) => {
  if (a === "Other") return 1;
  if (b === "Other") return -1;
  return a.localeCompare(b);
});

const FilterCanvas = ({
  visible,
  setVisible,
  handleInputChange,
  handleCheckboxChange,
  handleApplyFilter,
  handleDateChange,
  tempFilter,
  handleClear,
  currentTab,
  onclose,
  clinic_id
}) => {

  const coachList = useSelector((state) => state?.allCoach?.coach);
  // eslint-disable-next-line no-unused-vars
  const { data: getAllProvider } = useGetAllProvierListQuery(clinic_id || null, {
    // Only call API when canvas is visible
    skip: !visible, 
    refetchOnMountOrArgChange: true
  });
  const providerList = useSelector((state) => state?.allProvider?.filteredProviderByClinics?.data);

  console.log("providerList", providerList);
  const userType = useSelector((state) => state?.user?.userType);

  return (
    <COffcanvas
      className="ps-3 pe-3 pt-3 offcanvas_filter"
      backdrop="static"
      placement="end"
      visible={visible}
      // onShow={() => handleClear()}
      onHide={onclose}
    >
      <COffcanvasHeader>
        <COffcanvasTitle>Filters</COffcanvasTitle>
        <CCloseButton
          className="text-reset modal-close-cross"
          onClick={() => {
            setVisible(false);
          }}
        />
      </COffcanvasHeader>
      <COffcanvasBody>
        <div
          className="d-flex justify-content-between flex-column"
          style={{ height: "100%" }}
        >
          <div>
            <div>

              <div className="form-group has-search-right mt-2">
                <input
                  type="text"
                  className="form-control form-control-input"
                  name="userName"
                  placeholder="Name"
                  value={tempFilter?.userName}
                  onChange={handleInputChange}
                />
              </div>
              {/* Diagnosis Field (Dropdown) */}
              <div className="form-group has-search-right mt-2">
                <select
                  className="form-select form-control-input"
                  name="diagnosis"
                  value={tempFilter?.diagnosis}
                  onChange={handleInputChange}
                >
                  <option value="">Select Diagnosis</option>
                  {diagnosisListSort.map((diagnosis) => (
                    <option key={diagnosis} value={diagnosis}>{diagnosis}</option>
                  ))}
                </select>
              </div>
              {userType === "provider" ? null : (
                <div className="form-group has-search-right mt-2">
                  <select
                    className="form-select form-control-input"
                    name="provider"
                    value={tempFilter?.provider}
                    onChange={handleInputChange}
                  >
                    <option value="">Provider Name</option>
                    {providerList && providerList.map((provider, index) => (
                      <option key={index} value={`${provider?.last_name} ${provider?.middle_name} ${provider?.first_name}`}>
                        {provider?.last_name} {provider?.middle_name?.charAt(0)?.toUpperCase()} {provider?.first_name}
                      </option>
                    ))}
                  </select>
                </div>
              )
              }

              {currentTab == "Approved" || userType === "provider" ?
                <div className="form-group has-search-right mt-2">
                  <select
                    className="form-select form-control-input"
                    name="coachName"
                    value={tempFilter?.coachName}
                    onChange={handleInputChange}
                  >
                    <option value="">Coach Name</option>
                    {coachList && coachList.map((coach, index) => (
                      <option key={index} value={`${coach?.last_name} ${coach?.middle_name} ${coach?.first_name}`}>
                        {coach?.last_name} {coach?.middle_name} {coach?.first_name}
                      </option>
                    ))}
                  </select>
                </div> : null}
              {/* Insurance Field (Dropdown) */}
              <div className="form-group has-search-right mt-2">
                <select
                  className="form-select form-control-input"
                  name="insurance"
                  value={tempFilter?.insurance}
                  onChange={handleInputChange}
                >
                  <option value="">Select Insurance</option>
                  <option value="Medicare (Original, Parts A & B)">Medicare (Original, Parts A & B)</option>
                  <option value="Medicare Advantage (Part C)">Medicare Advantage (Part C)</option>
                  <option value="Blue Cross Blue Shield (BCBS of Georgia)">Blue Cross Blue Shield (BCBS of Georgia) (Georgia)</option>
                  <option value="Aetna / Cigna / Humana / UnitedHealthcare">Aetna / Cigna / Humana / UnitedHealthcare</option>
                  <option value="Medicaid (Georgia: Amerigroup, CareSource, Peach State, WellCare)">Medicaid (Georgia: Amerigroup, CareSource, Peach State, WellCare)</option>
                  <option value="Other / Self-Pay">Other / Self-Pay</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <p className="title-register mb-2 ">Registration Date</p>
              <div className="form-group has-search-right">
                <DatePicker
                  customInput={<BlockKeyboardInput />}
                  className="form-control input-dt shadow"
                  placeholderText="From"
                  dateFormat="MM/dd/yyyy"
                  selected={tempFilter?.registrationDateFrom}
                  onChange={(date) =>
                    handleDateChange("registrationDateFrom", date)
                  }
                  selectsStart
                  startDate={tempFilter?.registrationDateFrom}
                  endDate={tempFilter?.registrationDateTo}
                  maxDate={new Date()}
                  popperPlacement="top-start"
                />
              </div>
              <div className="form-group has-search-right mt-2">
                <DatePicker
                  customInput={<BlockKeyboardInput />}
                  className="form-control input-dt shadow"
                  placeholderText="To"
                  dateFormat="MM/dd/yyyy"
                  selected={tempFilter?.registrationDateTo}
                  onChange={(date) =>
                    handleDateChange("registrationDateTo", date)
                  }
                  selectsEnd
                  startDate={tempFilter?.registrationDateFrom}
                  endDate={tempFilter?.registrationDateTo}
                  maxDate={new Date()}
                  minDate={tempFilter?.registrationDateFrom}
                  popperPlacement="top-start"
                />
              </div>
            </div>
            {currentTab == "Approved" ?
              <div className="mt-2">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="coachNotAssigned"
                      checked={tempFilter?.coachNotAssigned}
                      defaultChecked={tempFilter?.coachNotAssigned}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Coach Not assigned"
                />
              </div> : null}
          </div>
          <div className="col-12">
            <div className="d-grid">
              <button
                onClick={() => {
                  handleClear();
                }}
                className="shadow-none reset-apply-btn  fw-bold"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setVisible(false);
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
  );
};

export default FilterCanvas;