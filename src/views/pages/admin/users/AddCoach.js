import { CCloseButton, COffcanvas, COffcanvasBody, COffcanvasHeader, COffcanvasTitle } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { State, City } from 'country-state-city';
import { usAutomaticCalidation, validateEmail, validateLength, validateRequired, validateZipCode } from '../../../../utils/inputValidation';
import { useAddClinicUserMutation } from '../../../../redux/apis/clinic_api';
// import { toast } from 'react-toastify';
import AddUserConfirmationModal from '../clinic/AddUserConfirmationModal';
import { getToken } from 'firebase/messaging';
import { messaging } from '../../../../firebase/confiq';
import { useSelector } from 'react-redux';

const AddCoach = ({ addCoachModal, setAddCoachModal, refetch, onclose }) => {

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        email: '',
        gender: '',
        address_line_1: '',
        state: '',
        cell_number: '',
        city: '',
        zipCode: ''
    });
    const [usStates, setUsStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [btnDisable, setBtnDisable] = useState(false);
    const [errors, setErrors] = useState({});
    const [errorMsg, setErrorMsg] = useState("");
    const user = useSelector((state) => state?.user);
    const actorType = useSelector((state) => state?.user?.userType);
    const [addCoachConfirmation, setAddCoachConfirmation] = useState(false);

    const [addCoach, { isLoading: addCoachLoading, isSuccess: addCoachSuccess, error }] = useAddClinicUserMutation();

    useEffect(() => {
        setBtnDisable(false);
        setErrorMsg(error?.data?.message);
        if (error?.data?.message) {
            setTimeout(() => {
                setErrorMsg("");
            }, 3000);
        }
    }, [error]);

    const validateField = (name, value) => {
        let error = null;
        switch (name) {
            case 'first_name':
            case 'last_name':
                error = validateRequired(value) || validateLength(value, 2, 50);
                break;

            case 'email':
                error = validateRequired(value) || validateEmail(value);
                break;

            case 'gender':
            case 'state':
                error = validateRequired(value);
                break;

            case "cell_number": {
                const { formattedValue, error: validationError } =
                    usAutomaticCalidation(value);
                value = formattedValue;
                error = validateRequired(value) || validationError;
                break;
            }

            case 'zipCode':
                error = validateRequired(value) || validateZipCode(value);
                break;

            case 'address_line_1':
                error = validateRequired(value) || validateLength(value, 5, 100);
                break;

            default:
                break;
        }

        return error;
    };

    const handleValidation = () => {
        const newErrors = {};

        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            middle_name: '',
            email: '',
            gender: '',
            state: '',
            address_line_1: '',
            cell_number: '',
            city: '',
            zipCode: ''
        });
    };

    useEffect(() => {
        if (addCoachSuccess) {
            setBtnDisable(false);
            setAddCoachConfirmation(true);
            resetForm();
            setErrors({});
            setAddCoachModal(false);
            refetch();
        }
        if (addCoachLoading) {
            setBtnDisable(true);
        }

    }, [addCoachSuccess, addCoachLoading]);

    // Reset the form each time the drawer opens so stale values (e.g., search text) don't auto-fill.
    useEffect(() => {
        if (addCoachModal) {
            resetForm();
            setErrors({});
            setErrorMsg("");
        }
    }, [addCoachModal]);

    useEffect(() => {
        const states = State?.getStatesOfCountry('US');
        setUsStates(states);
    }, [formData]);

    const handleStateChange = (e) => {
        const stateCode = e.target.value;
        handleChange(e);
        if (stateCode) {
            const stateCities = City?.getCitiesOfState('US', stateCode);
            setCities(stateCities);
        } else {
            setCities([]);
        }
    };

    const handleCityChange = (e) => {
        const city = e.target.value;
        setFormData((prevData) => ({
            ...prevData,
            city,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        let error = null;

        if (name === "cell_number") {
            const { formattedValue, error: validationError } =
                usAutomaticCalidation(value);
            newValue = formattedValue;
            error = validateRequired(newValue) || validationError;
        } else {
            error = validateField(name, value);
        }

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: newValue,
        }));

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!handleValidation()) return;

        try {
            // Step 1: Request notification permission
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);

            // Step 2: Attempt to get FCM token regardless of permission status
            let fcmToken = null;
            if (messaging) {
                try {
                    fcmToken = await getToken(messaging, {
                        vapidKey: process.env.REACT_APP_VAPID_KEY,
                    });
                    console.log('FCM Token:', fcmToken);
                } catch (tokenError) {
                    console.error('Error retrieving FCM token:', tokenError);
                }
            }

            // Step 3: Prepare payload including FCM token (if available)
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                middle_name: formData.middle_name,
                gender: formData.gender,
                address_line_1: formData.address_line_1,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zipCode,
                cell_number: formData.cell_number,
                email: formData.email,
                userType: 'coach',
                fcmToken: fcmToken || null,
                actorId: user?.id,  
                actorType: actorType
            };
            // Step 4: Send to backend
            await addCoach(payload);
        } catch (tokenError) {
            console.error('Error retrieving FCM token:', tokenError);
        }
    };



    return (
        <div>
            <>
                <COffcanvas
                    className="ps-3 pe-3  offcanvas_add_user"
                    backdrop="static"
                    placement="bottom"
                    visible={addCoachModal}
                    onHide={onclose}
                >
                    <COffcanvasHeader className="">
                        <COffcanvasTitle className="pt-4 offcanvas-title">
                            Add Coach
                            {errorMsg ? (
                                <span
                                    className="mt-4 ml-5 text-center rg-err ms-3"
                                    style={{ fontSize: 14 }}
                                >
                                    {errorMsg}
                                </span>
                            ) : (
                                ""
                            )}
                        </COffcanvasTitle>
                        <CCloseButton
                            className="text-reset modal-close-cross"
                            onClick={() => { setAddCoachModal(false); setErrors(); resetForm(); }}
                        />
                    </COffcanvasHeader>
                    <COffcanvasBody>
                        <div>
                            <div className="row">
                                <div className="col">
                                    <label htmlFor="formGroupExampleInput" className="p-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-input"
                                        placeholder=""
                                        name="first_name"
                                        value={formData?.first_name}
                                        onChange={handleChange}
                                    />
                                    {errors?.first_name && <p className="text-danger mt-2">{errors?.first_name}</p>}
                                </div>
                                <div className="col">
                                    <label htmlFor="formGroupExampleInput" className="p-2">
                                        Middle Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-input"
                                        placeholder=""
                                        name="middle_name"
                                        value={formData?.middle_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col">
                                    <label htmlFor="formGroupExampleInput" className="p-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-input"
                                        placeholder=""
                                        name="last_name"
                                        value={formData?.last_name}
                                        onChange={handleChange}
                                    />
                                    {errors?.last_name && <p className="text-danger mt-2">{errors?.last_name}</p>}
                                </div>
                            </div>
                            <div className="row pt-5">
                                <div className="col">
                                    <label htmlFor="formGroupExampleInput" className="p-2">
                                        Email *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-input"
                                        placeholder=""
                                        name="email"
                                        value={formData?.email}
                                        onChange={handleChange}
                                    />
                                    {errors?.email && <p className="text-danger mt-2">{errors?.email}</p>}
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="formGroupExampleInput" className="p-2">
                                        Gender *
                                    </label>
                                    <select
                                        className="form-select form-control-input"
                                        name="gender"
                                        value={formData?.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    {errors?.gender && <p className="text-danger mt-2">{errors?.gender}</p>}
                                </div>
                            </div>
                            <div className="row pt-5">
                                <div className="col">
                                    <label htmlFor="formGroupExampleInput" className="p-2">
                                        Address Line 1 *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-input"
                                        placeholder=""
                                        name="address_line_1"
                                        value={formData?.address_line_1}
                                        onChange={handleChange}
                                    />
                                    {errors?.address_line_1 && <p className="text-danger mt-2">{errors?.address_line_1}</p>}
                                </div>
                                <div className="col">
                                    <label className="rv-label-newpractice py-2">State *</label>
                                    <select
                                        type="text"
                                        className="form-control form-control-input"
                                        name="state"
                                        value={formData?.state}
                                        onChange={handleStateChange}
                                    >
                                        <option> Select State</option>
                                        {usStates.map((state) => {
                                            return (
                                                <option key={state?.isoCode} value={state?.isoCode}>
                                                    {state.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {errors?.state && <p className="text-danger mt-2">{errors?.state}</p>}
                                </div>
                            </div>
                            <div className="row pt-5">
                                <div className="col">
                                    <label className="rv-label-newpractice py-2">City</label>
                                    <select
                                        type="text"
                                        className="form-control form-control-input"
                                        name="city"
                                        value={formData?.city}
                                        onChange={handleCityChange}
                                    >
                                        <option>Select City</option>
                                        {cities?.map((city) => {
                                            return (
                                                <option key={city?.name} value={city?.name}>
                                                    {city?.name}
                                                </option>
                                            );
                                        })};
                                    </select>
                                </div>
                                <div className="col">
                                    <label htmlFor="formGroupExampleInput" className="p-2">
                                        Zip Code *
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control form-control-input"
                                        placeholder=""
                                        name="zipCode"
                                        value={formData?.zipCode}
                                        onChange={handleChange}
                                    />
                                    {errors?.zipCode && <p className="text-danger mt-2">{errors?.zipCode}</p>}
                                </div>
                            </div>
                            <div className="row pt-5">
                                <div className="col">
                                    <label htmlFor="formGroupExampleInput" className="p-2">
                                        Cell Number *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-input"
                                        placeholder=""
                                        name="cell_number"
                                        value={formData?.cell_number}
                                        onChange={handleChange}
                                    />
                                    {errors?.cell_number && <p className="text-danger mt-2">{errors?.cell_number}</p>}
                                </div>
                                <div className="col" />
                            </div>
                            <div className="row pt-2">
                                <div className="col-md-12 text-end">
                                    <button
                                        className=" rv-reset-cancel mt-4" type="button"
                                        onClick={() => { setAddCoachModal(false); setErrors(); resetForm(); }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn add-practs-btn ms-2"
                                        onClick={handleSubmit}
                                        disabled={btnDisable === true}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </COffcanvasBody>
                </COffcanvas>
            </>
            <AddUserConfirmationModal userModal={addCoachConfirmation} setUserModal={setAddCoachConfirmation} type={"Coach"} action={"add"} />
        </div>
    );
};

export default AddCoach;