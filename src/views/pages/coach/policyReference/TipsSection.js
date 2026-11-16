import React, { useEffect, useState } from 'react';
import { validateRequired } from '../../../../utils/inputValidation';
import { CCloseButton, COffcanvasHeader, COffcanvasTitle } from '@coreui/react';

const TipsSection = ({ tipsFormData, setTipsFormData, setCreateCanva, addTips, id, tipSuccess, tipLoading,  errors,
  setErrors, userType }) => {

  const [btnDisable, setBtnDisable] = useState(false);
  
    useEffect(() => {
      if(tipLoading){
        setBtnDisable(true);
      }
      else{
        setBtnDisable(false);
      }
    }, [tipLoading]);

  useEffect(() => {
    if(tipSuccess){
      setTipsFormData({
        title: '',
        sub_title: '',
        body_text: ''
      });
    }
    setCreateCanva(false);
  }, [tipSuccess]);

  const tipsHandleChange = (e) => {
    const { name, value } = e.target;
    setTipsFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'title') {
      const error = validateRequired(value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleTipsSubmit = (e) => {
    e.preventDefault();
    if(!tipsFormData?.title){
      setErrors({ ...errors, ["requiredField"]: "All required fields must be filled." });
      setTimeout(() => {
        setErrors({ ...errors, ["requiredField"]: "" });
      }, 2000);
      return;
    }
      let payload = {
        user_id: id,
        title: tipsFormData?.title,
        sub_title: tipsFormData?.sub_title,
        body_text: tipsFormData?.body_text,
        actorType: userType
      };
      addTips(payload);
  };

  return (
      <>
      <COffcanvasHeader className='pt-2'>
        <COffcanvasTitle>
          Add Tip
          <span className="ms-2">
            {errors?.requiredField ? (
              <span
                className="mt-4 ml-5 text-center rg-err"
                style={{ fontSize: 14 }}
              >
                {errors?.requiredField}
              </span>
            ) : (
              ""
            )}
          </span>
        </COffcanvasTitle>
        <CCloseButton
          className="text-reset modal-close-cross"
          onClick={() => {
            setCreateCanva(false);
          }}
        />
      </COffcanvasHeader>
      <div className='ps-3'>
        <div className="row">
          <div className="col">
            <label >Title *</label>
            <input
              type="text"
              name="title"
              className="form-control form-control-input"
              value={tipsFormData?.title}
              defaultValue={tipsFormData?.title}
              onChange={tipsHandleChange}
            />
            {errors?.title && <div className="text-danger mt-3">{errors?.title}</div>}
          </div>
          <div className="col">
            <label htmlFor="documentName">Sub Title</label>
            <input
              type="text"
              name="sub_title"
              className="form-control form-control-input"
              value={tipsFormData?.sub_title}
              defaultValue={tipsFormData?.sub_title}
              onChange={tipsHandleChange}
            />
          </div>
        </div>
        <div className="row pt-4">
          <div className="col-md-12">
            <label htmlFor="userType">Body Text</label>
            <input
              type="text"
              name="body_text"
              className="form-control form-control-input"
              style={{ border: '1px solid #DEE2E6' }}
              value={tipsFormData?.body_text}
              defaultValue={tipsFormData?.body_text}
              onChange={tipsHandleChange}
            />
          </div>
        </div>
        <div className="col-md-12 pt-2 text-end">
          <button className=" rv-reset-cancel mt-4" type="button" onClick={() => {setErrors({}); setCreateCanva(false);}}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn add-section-btn ms-2"
            onClick={handleTipsSubmit}
            disabled={errors?.title || btnDisable === true}
          >
            Add
          </button>
        </div>
      </div>
    </>
  );
}; 

export default TipsSection;

