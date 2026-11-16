import { CCloseButton, COffcanvas, COffcanvasBody, COffcanvasHeader, COffcanvasTitle } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import TextAreaAutosize from "../../../../Components/TextAreaAutosize";
import { useSelector } from 'react-redux';
import { useSendEmailMutation } from '../../../../redux/apis/patient_coach_api';
import { validateEmail, validateLength, validateRequired } from '../../../../utils/inputValidation';

const ContactEmail = ({ setContactCanva, contactCanva, patientData , onClose , setErrors , errors}) => {
  const coachEmail = useSelector((state) => state?.user?.email);
  const actorType = useSelector((state) => state?.user?.userType);
  const actorId = useSelector((state) => state?.user?.id);
  const [btnDisable, setBtnDisable] = useState(false);
  const [formData, setFormData] = useState({
    to: patientData?.email || '',
    cc: '',
    subject: '',
    message: '',
  });

  const [sendEmail, { isSuccess, isError, isLoading }] = useSendEmailMutation();

  useEffect(() => {
    if (isSuccess) {
      setBtnDisable(false);
      setFormData({ to: '' || '', cc: '', subject: '', message: '' });
      setContactCanva(false);
    }
    if(isError){
      setBtnDisable(false);
    }
    if(isLoading){
      setBtnDisable(true);
    }
  }, [isSuccess, patientData?.email, isLoading, isError]);

  useEffect(() => {
    if (patientData?.email) {
      setFormData((prevData) => ({
        ...prevData,
        to: patientData?.email,
      }));
    }
  }, [patientData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    let error = null;
    if (name === 'to') error = validateRequired(value) || validateEmail(value);
    if (name === 'cc') error = value ? validateEmail(value) : null;
    if (name === 'subject') error = validateLength(value, 5, 100);
    if (name === 'message') error = validateRequired(value);

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const validationErrors = {};

    validationErrors.to = validateRequired(formData?.to) || validateEmail(formData?.to);
    validationErrors.cc = formData?.cc && validateEmail(formData?.cc);
    validationErrors.subject = validateLength(formData?.subject, 5, 100);
    validationErrors.message = validateRequired(formData?.message);

    setErrors(validationErrors);

    return Object.values(validationErrors).every((error) => !error);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const payload = {
        coach_email: coachEmail,
        to: formData.to,
        cc: formData.cc,
        subject: formData.subject,
        message: formData.message,
        actorId: actorId,
        actorType: actorType,
      };
      sendEmail(payload);
    }
  };

  return (
    <div>
      <COffcanvas
        className="ps-3 pe-3 pt-3 offcanvas_filter"
        backdrop="static"
        placement="end"
        visible={contactCanva}
        onClose = {onClose}
        onHide = {onClose}
      >
        <COffcanvasHeader>
          <COffcanvasTitle>Contact</COffcanvasTitle>
          <CCloseButton
            className="text-reset modal-close-cross"
            onClick={() => {setContactCanva(false); setFormData({cc: '', subject: '', message: '' });}}
          />
        </COffcanvasHeader>

        <COffcanvasBody className="d-flex flex-column justify-content-between">
          <div>
            <div>
              <label className="rv-label-newpractice py-2">To</label>
              <input
                type="text"
                name="to"
                className="form-control form-control-input shadow border-0"
                value={formData?.to}
                onChange={handleChange}
              />
              {errors?.to && <p className="text-danger mt-2">{errors?.to}</p>}
            </div>
            <div className="pt-3">
              <label className="rv-label-newpractice py-2">CC</label>
              <input
                type="text"
                name="cc"
                className="form-control form-control-input shadow border-0"
                value={formData?.cc}
                onChange={handleChange}
              />
              {errors?.cc && <p className="text-danger mt-2">{errors?.cc}</p>}
            </div>
            <div className="pt-3">
              <label className="rv-label-newpractice py-2">Subject</label>
              <input
                type="text"
                name="subject"
                className="form-control form-control-input shadow border-0"
                value={formData?.subject}
                onChange={handleChange}
              />
              {errors?.subject && <p className="text-danger mt-2">{errors?.subject}</p>}
            </div>
            <div className="fw-bold pt-4 mt-3">
              <p className="title-register">Message</p>
              <div>
                <TextAreaAutosize
                  name="message"
                  className="form-control form-control-input shadow border-0 mt-3"
                  value={formData?.message}
                  placeholder="Type your message here......"
                  onChange={handleChange}
                />
              </div>
              {errors?.message && <p className="text-danger fw-light mt-2">{errors?.message}</p>}
            </div>
          </div>
          <div className="col-12 mt-3">
            <div className="d-flex gap-3">
              <button
                onClick={() => {setContactCanva(false); setFormData({ to : '',cc: '', subject: '', message: '' }); 
                setErrors({});      
              }}
                className="shadow-none fw-bold btn-cancel-user-orange bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={btnDisable === true}
                className="shadow-none btn-save-default-width border-0"
              >
                Send
              </button>
            </div>
          </div>
        </COffcanvasBody>
      </COffcanvas>
    </div>
  );
};

export default ContactEmail;
