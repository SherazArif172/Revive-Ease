import { CCloseButton, COffcanvas, COffcanvasBody, COffcanvasTitle } from '@coreui/react';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import BlockKeyboardInput from '../../../utils/BlockKeyboardInput';

const NewEscalation = ({ mdFormCanva, onClose }) => {

    const [form, setForm] = useState({
        weekEnding: "",
        patientName: "",
        coachReviewed: "",
        issueIdentified: "",
        actionTaken: "",
        comments: "",
        reviewedBy: "",
        reviewDate: "",
    });

    const handleChange = ({ target }) =>
        setForm((prev) => ({ ...prev, [target.name]: target?.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div>
            <>
                <COffcanvas
                    className="ps-3 pe-3 pt-3 offcanvas_add_user"
                    backdrop="static"
                    placement="bottom"
                    visible={mdFormCanva}
                    onClose={onClose}
                >
                    <div className="d-flex justify-content-between header-title-edit px-4 my-2">
                        <COffcanvasTitle className="offcanvas-title">
                            <h5 className="fw-bold">MD Sign-Off Form (Escalation Cases)</h5>
                        </COffcanvasTitle>
                        <CCloseButton
                            className="text-reset modal-close-cross"
                            onClick={onClose}
                        />
                    </div>
                    <hr className="my-0"/>
                    <COffcanvasBody>
                        <div className="row">
                            <div className="col-md-12 col-9">
                                <div className="row  mx-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold">Week Ending</label>
                                        <DatePicker
                                            customInput={<BlockKeyboardInput/>}
                                            selected={form.weekEnding}
                                            onChange={(date) =>
                                                setForm((prev) => ({ ...prev, weekEnding: date }))}
                                            className="form-control input-dt"
                                            placeholderText="Select date"
                                            dateFormat="MM/dd/yyyy"
                                            required
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold">Patient Name</label>
                                        <input
                                            type="text"
                                            name="patientName"
                                            className="form-control form-control-input"
                                            placeholder="Enter patient name"
                                            value={form.patientName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>{" "}
                                    <div className='d-flex mt-4'>
                                        <label className="form-label fw-semibold mb-2">
                                            Coach Summary Reviewed?
                                        </label>
                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="coachReviewed"
                                                id="coachYes"
                                                value="Yes"
                                                checked={form.coachReviewed === "Yes"}
                                                onChange={handleChange}
                                                required
                                            />
                                            <label className="form-check-label" htmlFor="coachYes">
                                                Yes
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="coachReviewed"
                                                id="coachNo"
                                                value="No"
                                                checked={form.coachReviewed === "No"}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="coachNo">
                                                No
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row my-4 mx-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold">Issue Identified</label>
                                        <select
                                            className="form-select form-control-input mt-1"
                                            name="issueIdentified"
                                            value={form.issueIdentified}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select issue</option>
                                            <option value="Pain Flare">Pain Flare</option>
                                            <option value="Vitals Concern">Vitals Concern</option>
                                            <option value="Fall Risk">Fall Risk</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>{" "}
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold">Action Taken</label>
                                        <select
                                            className="form-select form-control-input mt-1"
                                            name="actionTaken"
                                            value={form.actionTaken}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select action</option>
                                            <option value="Continue RTM">Continue RTM</option>
                                            <option value="Refer to MD">Refer to MD</option>
                                            <option value="Call Patient">Call Patient</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row my-4 mx-3">
                                    <div>
                                        <label className="form-label fw-semibold">
                                            Comments (Optional)
                                        </label>
                                        <textarea
                                            className="form-control form-control-input"
                                            name="comments"
                                            rows="3"
                                            placeholder="Enter any additional comments..."
                                            value={form.comments}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="row my-4 mx-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold">Reviewed By</label>
                                        <input
                                            type="text"
                                            name="reviewedBy"
                                            className="form-control form-control-input"
                                            placeholder="Enter reviewer name"
                                            value={form.reviewedBy}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold">Review Date</label>
                                        <DatePicker
 customInput={<BlockKeyboardInput/>}
                                            selected={form.reviewDate}
                                            onChange={(date) =>
                                                setForm((prev) => ({ ...prev, reviewDate: date }))
                                            }
                                            className="form-control input-dt"
                                            placeholderText="Select date"
                                            dateFormat="MM/dd/yyyy"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className=" col-md-12 mt-4">
                            <div className="row pt-2">
                                <div className="col-md-12 text-end">
                                    <button
                                        className=" rv-reset-cancel mt-4"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-save ms-2 text-white me-4"
                                        onClick={handleSubmit}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                        <br />
                    </COffcanvasBody>
                </COffcanvas>
            </>
        </div>
    );
};

export default NewEscalation;