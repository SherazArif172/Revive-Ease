import React, { useEffect, useState } from "react";
import { CModal, CModalBody, CModalTitle } from "@coreui/react";
import { useApprovePendingPatientMutation } from "../../redux/apis/allPatient_api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

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



const DiagnosisModal = ({ diagnosisModal, onClose, selectedRowId }) => {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [prefilledValue, setPrefilledValue] = useState("");
  const userType = useSelector((state) => state?.user?.userType);
  const id = useSelector((state) => state?.user?.id);
  // eslint-disable-next-line no-unused-vars
  const [approvePendingPatient, { isSuccess: diagnosis_add }] =
    useApprovePendingPatientMutation();

  useEffect(() => {
    if (diagnosis_add) {
      if(prefilledValue ?  toast.success("Diagnosis Updated Successfully!"):  toast.success("Diagnosis Added Successfully!"));
      onClose();
    }
  }, [diagnosis_add]);

  useEffect(() => {
    if (selectedRowId && selectedRowId.diagnosis) {
      setSelectedDiagnosis(selectedRowId.diagnosis);
      setPrefilledValue(true);
    }
  }, [selectedRowId , prefilledValue]);

  const handleSubmit = () => {
    if (!selectedDiagnosis) {
      setErrMsg("Please select  diagnosis");
      setTimeout(() => {
        setErrMsg("");
      }, 3000);
      return;
    }
    const payload = {
      add_Diagnosis: selectedDiagnosis,
      actorId: id,
      actorType: userType
    };
    approvePendingPatient({ id: selectedRowId?._id, payload: payload });
  };

  return (
    <CModal
      alignment="center"
      visible={diagnosisModal}
      onClose={onClose}
      onHide={onClose}
      aria-labelledby="VerticallyCenteredExample"
    
    >
      <div className="d-flex justify-content-center CModalHeader">
        <CModalTitle className="text-white">Associate Diagnosis</CModalTitle>
      </div>

      <CModalBody className="main-modal-body">
        <div>
          <div className="content-modal" style={{width : "460px"}}>
            <div className="my-2 pb-2">
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

            <select
              className="form-select form-control-input"
              onChange={(e) => setSelectedDiagnosis(e.target.value)}
              value={selectedDiagnosis}
             
            >
              <option value="">Select Diagnosis</option>
              {/* {step 3} */}
              {diagnosisList?.map((item, index) => {
                return (
                  <option key={index} value={item}>
                    {item}
                  </option>
                );
              })}
            </select>
          </div>
          <br />
          <div className="d-flex justify-content-center col-md-12">
            <button className="modal-close" onClick={onClose}>
              Cancel
            </button>
            <button className="modal-assign ms-3" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </CModalBody>
    </CModal>
  );
};

export default DiagnosisModal;
