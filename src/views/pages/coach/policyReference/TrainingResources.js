import React from 'react';
import { CCloseButton, COffcanvas, COffcanvasBody, COffcanvasHeader, COffcanvasTitle } from '@coreui/react';
import TextAreaAutosize from '../../../../Components/TextAreaAutosize';
import { validateRequired } from '../../../../utils/inputValidation';
import { Button } from "@mui/material";

const TrainingResources = ({ btnDisableTR, onclose, setErrors, errors, createCanvatrainingResources, setTrainingResourcesDetails, setCreateCanvatrainingResources, trainingResourceDetails, handleTrainingResourcesSubmit, isEditMode }) => {

  const handleInputTrainingResources = (e) => {
    const {name, value} = e.target;
    setTrainingResourcesDetails({
      ...trainingResourceDetails,
      [name]: value,
    });

    if (name === 'document_name') {
      const error = validateRequired(value);
      setErrors({ ...errors, document_name: error });
    }
  };

  return (
    <div>
        <COffcanvas
          className="ps-3 pe-3  default_offcanvas_add"
          backdrop="static"
          placement="bottom"
          visible={createCanvatrainingResources}
          style={{ height: "auto" }}
          onHide={onclose}
        >
          <COffcanvasHeader className="">
            <COffcanvasTitle className="pt-4">{isEditMode ===true ? "Update Training Resources" : "Create Training Resource"}
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
              onClick={() => setCreateCanvatrainingResources(false)}
            />
          </COffcanvasHeader>

          <COffcanvasBody>
            <div>
              <div className="row ">
                <div className="col">
                  <label htmlFor="formGroupExampleInput">Document Name *</label>
                  <input
                    type="text"
                    name="document_name"
                    className="form-control form-control-input"
                    onChange={handleInputTrainingResources}
                    value={trainingResourceDetails?.document_name}
                  />
                  {errors?.document_name && <div className="text-danger mt-3">{errors?.document_name}</div>}
                </div>
                <div className="col">
                  <label htmlFor="formGroupExampleInput">Description</label>
                  <input
                    type="text"
                    name="description"
                    className="form-control form-control-input"
                    onChange={handleInputTrainingResources}
                    value={trainingResourceDetails?.description}
                  />
                </div>
              </div>

              <div className="row pt-5">
                <div className="col-md-12">
                  <label htmlFor="userType">Body Text</label>
                  <TextAreaAutosize
                      type="text"
                      name="body_text"
                      className="form-control form-control-input"
                      style={{ border: '1px solid #DEE2E6' }}
                      onChange={handleInputTrainingResources}
                      value={trainingResourceDetails?.body_text}
                  />
                </div>
              </div>

              <div className="row pt-4">
                <div className="col-md-12">
                  <label>Upload Files (Image, PDF, DOC, CSV, XLSX)</label>
                  <div className="d-flex align-items-center gap-3 mt-2">
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ textTransform: "none" }}
                    >
                      {trainingResourceDetails?.file ? "Change File" : "Choose File"}
                      <input
                        id="training-resource-file-input"
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.csv,.xls,.xlsx"
                        hidden
                        onChange={e => {
                          setTrainingResourcesDetails({
                            ...trainingResourceDetails,
                            file: e.target.files[0],
                          });
                          setErrors({ ...errors, file: null });
                        }}
                      />
                    </Button>
                    {trainingResourceDetails.file && (
                      <span className="badge bg-secondary ms-2">{trainingResourceDetails.file.name}</span>
                    )}
                   
                    {isEditMode ? trainingResourceDetails.file_original_name : null}
                    {!trainingResourceDetails.file && trainingResourceDetails.existingFile && (
                      <a
                        href={`/${trainingResourceDetails.existingFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ms-2"
                      >
                        {trainingResourceDetails.existingFile.split('/').pop()}
                        
                      </a>
                    )}
                  </div>
                  {errors?.file && <div className="text-danger mt-2">{errors.file}</div>}
                </div>
              </div>

              <div className="row pt-2">
                <div className="col-md-12 text-end">
                  <button
                    className="rv-reset-cancel mt-4" type="button"
                    onClick={() => {setCreateCanvatrainingResources(false); setErrors({});}}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn add-section-btn ms-2"
                    onClick={handleTrainingResourcesSubmit}
                    disabled={errors?.document_name || btnDisableTR === true}
                  >
                    {isEditMode ===true ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </COffcanvasBody>
        </COffcanvas>
    </div>
  );
};

export default TrainingResources;