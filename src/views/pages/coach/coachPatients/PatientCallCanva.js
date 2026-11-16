import {
    CCloseButton,
    COffcanvas,
    COffcanvasBody,
    COffcanvasHeader,
    COffcanvasTitle,
} from '@coreui/react';
import React, { useEffect, useRef } from 'react';
import { useAddCallLogMutation, useUpdateCallLogMutation } from '../../../../redux/apis/billing_api';
import DatePicker from 'react-datepicker';
import { useDispatch, useSelector } from 'react-redux';
import { startOfMonth } from 'date-fns';
import { setAddCallLog } from '../../../../redux/reducers/billingReducer';
import BlockKeyboardInput from '../../../../utils/BlockKeyboardInput';
import { formatDate } from '../../../../utils/dateUtils';

const PatientCallCanvas = ({
    PatientCallCanva,
    setPatientCallCanva,
    billingId,
    onClose,
    patientId,
    errors,
    setErrors,
    formData,
    setFormData,
    editCallLog = null,
    patientCreatedAt = null,
}) => {
    const isEditMode = Boolean(editCallLog?.call_log_id);
    const coachId = useSelector((state) => state?.user?.id);
    const dispatch = useDispatch();
    const actorType = useSelector((state) => state?.user?.userType);
    const actorId = useSelector((state) => state?.user?.id);

    const [addCallLog, { isSuccess: addSuccess }] = useAddCallLogMutation();
    const [updateCallLog, { isSuccess: updateSuccess, reset: resetUpdateCallLog }] = useUpdateCallLogMutation();
    const justOpenedForEditRef = useRef(false);

    // When opening canvas for edit: reset mutation and mark that we just opened (so success effect doesn't close it)
    useEffect(() => {
        if (PatientCallCanva && isEditMode) {
            resetUpdateCallLog();
            justOpenedForEditRef.current = true;
        }
    }, [PatientCallCanva, isEditMode, resetUpdateCallLog]);

    useEffect(() => {
        if (addSuccess && !isEditMode) {
            setPatientCallCanva(false);
            dispatch(setAddCallLog(true));
        }
    }, [addSuccess, isEditMode]);

    // Only close on update success when we didn't just open (avoids closing on stale success from previous update)
    useEffect(() => {
        if (updateSuccess && isEditMode) {
            if (justOpenedForEditRef.current) {
                justOpenedForEditRef.current = false;
            } else {
                setPatientCallCanva(false);
                dispatch(setAddCallLog(true));
            }
        }
    }, [updateSuccess, isEditMode]);

    const validateForm = () => {
        let newErrors = {};
        if (!formData.called_on) newErrors.called_on = 'Called On is required.';
        if (!formData.duration) newErrors.duration = 'Duration is required.';
        if (!formData.chart_notes.trim()) newErrors.chart_notes = 'Chart Notes is required.';
        if (!formData.personal_notes.trim()) newErrors.personal_notes = 'Personal Notes is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        const formattedCalledOn = new Date(formData.called_on).toISOString();
        const durationInMinutes = parseInt(formData.duration, 10) || 0;

        if (isEditMode && editCallLog?.session_id && editCallLog?.call_log_id) {
            const updatePayload = {
                patient_id: editCallLog.patient_id,
                session_id: editCallLog.session_id,
                call_log_id: editCallLog.call_log_id,
                called_on: formattedCalledOn,
                duration: durationInMinutes,
                chart_notes: formData?.chart_notes,
                personal_notes: formData?.personal_notes,
            };
            dispatch(setAddCallLog(false));
            updateCallLog({ coach_id: coachId, payload: updatePayload });
        } else {
            const addPayload = {
                called_on: formattedCalledOn,
                duration: durationInMinutes,
                patient_id: patientId,
                coach_id: coachId,
                chart_notes: formData?.chart_notes,
                personal_notes: formData?.personal_notes,
                actorId: actorId,
                actorType: actorType,
            };
            dispatch(setAddCallLog(false));
            addCallLog({ billingId: billingId, payload: addPayload });
        }

        setPatientCallCanva(false);
        setFormData({ called_on: new Date(), duration: '', chart_notes: '', personal_notes: '' });
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    return (
        <COffcanvas
            className="ps-3 pe-3 default_offcanvas_add" style={{ height: '55%' }}
            backdrop="static"
            placement="bottom"
            visible={PatientCallCanva}
            onClose={onClose}
            onHide={onClose}
        >
            <COffcanvasHeader>
                <COffcanvasTitle className="pt-4 text-black">
                    {isEditMode ? "Edit Call Log" : "Add Call Log"}
                </COffcanvasTitle>
                <CCloseButton
                    className="text-reset modal-close-cross"
                    onClick={() => {
                        setPatientCallCanva(false);
                        setFormData({ called_on: new Date(), duration: '', chart_notes: '', personal_notes: '' });
                        setErrors({});
                    }}
                />
            </COffcanvasHeader>
            <COffcanvasBody>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col">
                            <label className="rv-label-newpractice py-2">
                                <b>Called On</b>
                            </label>
                            {isEditMode ? (
                                <div className="form-control form-control-input bg-light" style={{ lineHeight: '2' }}>
                                    {formatDate(formData.called_on, 'MM/dd/yyyy')}
                                </div>
                            ) : (
                                <DatePicker
                                    customInput={<BlockKeyboardInput/>}
                                    selected={formData.called_on}
                                    onChange={(date) => {
                                        setFormData({ ...formData, called_on: date });
                                        setErrors({ ...errors, called_on: '' });
                                    }}
                                    className="form-control "
                                    dateFormat="MM/dd/yyyy"
                                    maxDate={new Date()}
                                    minDate={patientCreatedAt ? new Date(patientCreatedAt) : startOfMonth(new Date())}
                                    dropdownMode="select"
                                     popperPlacement="bottom-center"
                    popperClassName="bottom-center no-overlap-datepicker"
                                    
                                />
                            )}
                            {errors.called_on && (
                                <div className="text-danger">{errors.called_on}</div>
                            )}
                        </div>

                        <div className="col">
                            <label className="rv-label-newpractice py-2">
                                <b>Duration (minutes) *</b>
                            </label>
                            <input
                                type="number"
                                min="0"
                                onKeyDown={(e) => {
                                    if (
                                      e.key.length === 1 &&
                                      !/[0-9]/.test(e.key)
                                    ) {
                                      e.preventDefault();
                                    }
                                }}
                                name="duration"
                                className="form-control form-control-input"
                                placeholder="Minutes"
                                value={formData?.duration}
                                onChange={handleInputChange}
                            />
                            {errors.duration && (
                                <div className="text-danger">{errors.duration}</div>
                            )}
                        </div>

                        <div className="col">
                            <label className="rv-label-newpractice py-2">
                                <b>Chart Notes *</b>
                            </label>
                            <input
                                type="text"
                                name="chart_notes"
                                className="form-control form-control-input"
                                value={formData.chart_notes}
                                onChange={handleInputChange}
                            />
                            {errors.chart_notes && (
                                <div className="text-danger">{errors.chart_notes}</div>
                            )}
                        </div>
                    </div>

                    <div className="row pt-3">
                        <div className="col-4">
                            <label className="rv-label-newpractice py-2">
                                <b>Personal Notes *</b>
                            </label>
                            <input
                                type="text"
                                name="personal_notes"
                                className="form-control form-control-input"
                                value={formData.personal_notes}
                                onChange={handleInputChange}
                            />
                            {errors.personal_notes && (
                                <div className="text-danger">{errors.personal_notes}</div>
                            )}
                        </div>
                    </div>

                    <div className="row pt-4">
                        <div className="col-md-12 text-end">
                            <button
                                type="button"
                                className="rv-reset-cancel mt-4"
                                onClick={() => {
                                    setPatientCallCanva(false);
                                    setFormData({ called_on: new Date(), duration: '', chart_notes: '', personal_notes: '' });
                                    setErrors({});
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn add-practs-btn-save fw-bold mx-2"
                            >
                                {isEditMode ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </form>
            </COffcanvasBody>
        </COffcanvas>
    );
};

export default PatientCallCanvas;
