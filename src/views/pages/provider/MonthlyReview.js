import React, { useState } from 'react';
import { CCloseButton, COffcanvas, COffcanvasBody, COffcanvasTitle } from '@coreui/react';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DatePicker from 'react-datepicker';

const MonthlyReview = ({ onClose, monthlyReview }) => {

    const initialPatient = {
        name: '',
        painTrend: '→',
        engagement: 'En♠gaged',
        compliance: 'Full',
        continueRTM: 'Yes',
        comments: ''
    };

    const [weekEnding, setWeekEnding] = useState(null);
    const [reviewDate, setReviewDate] = useState(null);
    const [reviewer, setReviewer] = useState('');
    const [patients, setPatients] = useState([initialPatient]);

    const handlePatientChange = (index, field, value) => {
        const updatedPatients = [...patients];
        updatedPatients[index][field] = value;
        setPatients(updatedPatients);
    };

    const addPatient = () => {
        setPatients([...patients, initialPatient]);
    };

    const removePatient = (index) => {
        setPatients(patients.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Monthly Review Submitted!');
    };

    return (
        <div>
            <COffcanvas
                className="ps-3 pe-3 pt-3 offcanvas_add_user"
                backdrop="static"
                placement="bottom"
                visible={monthlyReview}
                onClose={onClose}
            >
                <div className="d-flex justify-content-between header-title-monthlyReview px-4 my-2">
                    <COffcanvasTitle className="offcanvas-title">
                        <h3>Monthly MD Sign-Off Form (Standard Patients)</h3>
                        <h6>(To be completed once every 30 days to document MD review of standard RTM patients)</h6>
                    </COffcanvasTitle>
                    <CCloseButton className="text-reset modal-close-cross" onClick={() => { onClose(); setPatients([initialPatient]); }} />
                </div>
                <hr className="my-0 mt-3" />
                <COffcanvasBody className="overflow-x-hidden">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">Week Ending</label>
                                <DatePicker
                                    selected={weekEnding}            
                                    onChange={setWeekEnding}                
                                    dateFormat="MM/dd/yyyy"
                                    className="form-control input-dt"
                                    isClearable
                                />
                            </div>
                        </div>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="mb-4 mt-4">
                                    <div className="row fw-bold border-bottom pb-2 mb-2">
                                        <div className="col-md-2">Patient Name</div>
                                        <div className="col-md-1">Pain Trend</div>
                                        <div className="col-md-2">Engagement</div>
                                        <div className="col-md-2">Compliance</div>
                                        <div className="col-md-2">Continue RTM</div>
                                        <div className="col-md-3">Comments</div>
                                        <div className="col-md-1"></div>
                                    </div>

                                    {patients?.map((patient, index) => (
                                        <div key={index} className="row align-items-center mb-3">
                                            <div className="col-md-2">
                                                <input
                                                    type="text"
                                                    placeholder="Patient name"
                                                    value={patient?.name}
                                                    onChange={(e) => handlePatientChange(index, 'name', e.target.value)}
                                                    className="form-control form-control-input"
                                                />
                                            </div>
                                            <div className="col-md-1">
                                                <select
                                                    value={patient?.painTrend}
                                                    onChange={(e) => handlePatientChange(index, 'painTrend', e.target.value)}
                                                    className="form-control form-control-input"
                                                >
                                                    <option value="→">→ Stable</option>
                                                    <option value="↑">↑ Up</option>
                                                    <option value="↓">↓ Down</option>
                                                </select>
                                            </div>

                                            <div className="col-md-2">
                                                <select
                                                    value={patient?.engagement}
                                                    onChange={(e) => handlePatientChange(index, 'engagement', e.target.value)}
                                                    className="form-control form-control-input"
                                                >
                                                    <option value="Engaged">Engaged</option>
                                                    <option value="Mild">Mild</option>
                                                    <option value="None">None</option>
                                                </select>
                                            </div>
                                            <div className="col-md-2">
                                                <select
                                                    value={patient?.compliance}
                                                    onChange={(e) => handlePatientChange(index, 'compliance', e.target.value)}
                                                    className="form-control form-control-input"
                                                >
                                                    <option value="Full">Full</option>
                                                    <option value="Partial">Partial</option>
                                                    <option value="None">None</option>
                                                </select>
                                            </div>
                                            <div className="col-md-2">
                                                <select
                                                    value={patient?.continueRTM}
                                                    onChange={(e) => handlePatientChange(index, 'continueRTM', e.target.value)}
                                                    className="form-control form-control-input"
                                                >
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3 d-flex gap-2">
                                                <textarea
                                                    rows={1}
                                                    type="text"
                                                    placeholder="Comments"
                                                    value={patient?.comments}
                                                    onChange={(e) => handlePatientChange(index, 'comments', e.target.value)}
                                                    className="form-control form-control-input"
                                                />
                                                {patients?.length > 1 && index !== 0 ? (
                                                    <DeleteIcon className="d-flex ms-4 pointer mt-3" style={{ color: 'red' }}
                                                        onClick={() => removePatient(index)}
                                                    />) : (
                                                    <AddIcon
                                                        type="button"
                                                        onClick={addPatient}
                                                        className="d-flex ms-4 pointer mt-3" style={{ color: 'white', background: 'orange', borderRadius: "50px" }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">Reviewed By</label>
                                    <input
                                        type="text"
                                        placeholder="Enter reviewer name"
                                        value={reviewer}
                                        onChange={(e) => setReviewer(e.target.value)}
                                        className="form-control form-control-input"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">Review Date</label>
                                    <DatePicker
                                        selected={reviewDate}
                                        onChange={setReviewDate}
                                        dateFormat="MM/dd/yyyy"
                                        className="form-control input-dt"
                                        isClearable
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-end px-3">
                            <button className="rv-reset-cancel mt-4 me-2" onClick={() => { onClose(); setPatients([initialPatient]); }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-save text-white" onClick={handleSubmit}>
                                Submit
                            </button>
                        </div>
                    </div>
                </COffcanvasBody>
            </COffcanvas>
        </div>
    );
};

export default MonthlyReview;