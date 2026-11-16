import { CModal, CModalBody, CModalTitle } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { useGetAllTemplateQuery } from "../../../../redux/apis/patient_coach_api";
import { useSelector } from "react-redux";
import { useUpdateClinicUserMutation } from "../../../../redux/apis/clinic_api";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";
import { convertLocalDateToUTC } from "../../../../utils/dateUtils";

const AssignModal = ({ onClose, assignTemplateCanva, refetch }) => {
  const templateList = useSelector((state) => state?.allCoach?.template?.data);
  const patientId = useSelector(
    (state) => state?.allPatients?.patient?.patientData?._id
  );
  const actorType = useSelector((state) => state.user?.userType);
  const actorId = useSelector((state) => state.user?.id);
  const [templateId, setTemplateId] = useState(null);
  const [btnDisabled, setBtnDisabled] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [templateDate, setTemplateDate] = useState(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return today;
  });


  // eslint-disable-next-line no-unused-vars
  const { data: taskTamplates } = useGetAllTemplateQuery({
    page: 1,
    rowsPerPage: 100,
    patient_id: patientId,
    actorId: actorId,
    actorType: actorType
  }, {
    refetchOnMountOrArgChange: false,
  });
  const [
    updateTemplate,
    {
      isSuccess: updateUserRoleSuccess,
      isLoading: updateTemplateLoading,
      isError: updateTemplateError,
    },
  ] = useUpdateClinicUserMutation();

  const modalClose = () => {
    onClose();
    setTemplateDate(null);
  };

  useEffect(() => {
    if (updateUserRoleSuccess) {
      setBtnDisabled(false);
      modalClose();
      refetch();
      toast?.success("Journey task assigned successfully!");
      setTemplateDate(null);
    }
    if (updateTemplateLoading) {
      setBtnDisabled(true);
    }
    if (updateTemplateError) {
      setBtnDisabled(false);
    }
  }, [updateUserRoleSuccess, updateTemplateLoading, updateTemplateError]);

  const handleSubmit = () => {
    if (!templateId || !templateDate) {
      setErrMsg("Please select both a template and a date.");
      setTimeout(() => {
        setErrMsg("");
      }, 3000);
      return; // Stop execution
    }

    // Convert local date to UTC for backend (date-only, no time)
    const utcDateString = convertLocalDateToUTC(templateDate, false);
    
    if (!utcDateString) {
      setErrMsg("Invalid date selected.");
      setTimeout(() => {
        setErrMsg("");
      }, 3000);
      return;
    }

    const payload = {
      assignedTemplate: {
        template_id: templateId,
        date: utcDateString, // UTC ISO string
        actorId: actorId,
        actorType: actorType
      },
    };

    updateTemplate({ updateData: payload, userId: patientId });
  };

  return (
    <>
      <CModal
        alignment="center"
        visible={assignTemplateCanva}
        size="md"
        onClose={modalClose}
        backdrop={true}
      >
        <div className="d-flex justify-content-center CModalHeader">
          <CModalTitle className="text-white">
            Assign Journey Template
          </CModalTitle>
        </div>
        <CModalBody className="main-modal-body">


          <div style={{ width: "400px" }}>
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
            <div className="text-start">

              <div className="my-3">
                <label className="rv-label-newpractice py-2">
                  Select Template *
                </label>

                <select
                  className="form-select form-control-input"
                  onChange={(e) => setTemplateId(e.target.value)}
                >
                  <option value=""> {templateList?.length > 0 ? "Select Template" : "No Template Found"}</option>
                  {/* {step 3} */}
                  {templateList?.map((task, index) => {
                    return (
                      <option key={index} value={task?._id}>
                        {task?.template_name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group has-search-right">
                <label className="rv-label-newpractice py-2 ">Date *</label>

                <DatePicker
                  customInput={<BlockKeyboardInput />}
                  className="form-control input-dt shadow"
                  onChange={(date) => {
                    if (!date) {
                      setTemplateDate(null);
                      return;
                    }
                    const normalizedDate = new Date(date);
                    normalizedDate.setHours(12, 0, 0, 0); // keep same calendar day across timezones
                    setTemplateDate(normalizedDate);
                  }}
                  selected={templateDate}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select Date"
                  minDate={new Date()}
                />
              </div>
            </div>

            <div className="d-flex justify-content-center col-md-12 py-3">
              <button className="modal-close" onClick={modalClose}>
                Close
              </button>
              <button
                className="modal-assign  ms-3 "
                disabled={btnDisabled === true}
                onClick={handleSubmit}
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
