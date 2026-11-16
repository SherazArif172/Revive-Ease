import React, { useEffect, useState } from "react";
import { COffcanvas } from "@coreui/react";
import { State, City } from "country-state-city";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAddClinicUserMutation } from "../../../../redux/apis/clinic_api";
import {
  usAutomaticCalidation,
  validateEmail,
  validateLength,
  validateRequired,
  validateZipCode,
} from "../../../../utils/inputValidation";
import CloseIcon from "../../../../assets/icons/figma/close-circle.svg";
import ChevronDown from "../../../../assets/icons/figma/chevron-down.svg";
import "./AddPatient.scss";

const INSURANCE_OPTIONS = [
  "Medicare (Original, Parts A & B)",
  "Medicare Advantage (Part C)",
  "Blue Cross Blue Shield (BCBS of Georgia)",
  "Aetna / Cigna / Humana / UnitedHealthcare",
  "Medicaid (Georgia: Amerigroup, CareSource, Peach State, WellCare)",
  "Other / Self-Pay",
];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  cellNumber: "",
  gender: "",
  insurance: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
};

const validateField = (name, value) => {
  switch (name) {
    case "firstName":
    case "lastName":
      return validateRequired(value) || validateLength(value, 2, 50);
    case "email":
      return validateRequired(value) || validateEmail(value);
    case "cellNumber":
      return validateRequired(value) || usAutomaticCalidation(value).error;
    case "gender":
      return validateRequired(value);
    case "zipCode":
      return validateRequired(value) || validateZipCode(value);
    default:
      return null;
  }
};

const selectStyle = { backgroundImage: `url(${ChevronDown})` };

const Label = ({ text, required }) => (
  <p className="ap-label">
    {text}
    {required && <span className="ap-req">*</span>}
  </p>
);

const AddPatient = ({ visible, setVisible, refetch }) => {
  const actorId = useSelector((state) => state?.user?.id);
  const actorType = useSelector((state) => state?.user?.userType);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [addPatient, { isLoading }] = useAddClinicUserMutation();

  const usStates = State.getStatesOfCountry("US");
  const cities = form.state ? City.getCitiesOfState("US", form.state) : [];

  useEffect(() => {
    if (!visible) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [visible]);

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === "cellNumber") value = usAutomaticCalidation(value).formattedValue;
    setForm((prev) => ({ ...prev, [name]: value, ...(name === "state" ? { city: "" } : {}) }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    Object.keys(form).forEach((k) => {
      const err = validateField(k, form[k]);
      if (err) nextErrors[k] = err;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      const res = await addPatient({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        cell_number: form.cellNumber,
        gender: form.gender,
        insurance: form.insurance,
        address_line_1: form.addressLine1,
        address_line2: form.addressLine2,
        city: form.city,
        state: form.state,
        zip_code: form.zipCode,
        userType: "patient",
        actorId,
        actorType,
      }).unwrap();
      toast.success(res?.message && res.message !== "Done (mock)" ? res.message : "Patient added successfully!");
      refetch?.();
      setVisible(false);
    } catch (err) {
      toast.error(err?.data?.message || "Unable to add patient");
    }
  };

  const err = (name) => errors[name] && <p className="ap-error">{errors[name]}</p>;

  return (
    <COffcanvas
      className="add-patient-sheet"
      placement="bottom"
      backdrop="static"
      visible={visible}
      onHide={() => setVisible(false)}
    >
      <div className="ap-inner">
        <div className="ap-handle" />
        <div className="ap-head">
          <p className="ap-title">Add New Patient</p>
          <button type="button" className="ap-close" aria-label="Close" onClick={() => setVisible(false)}>
            <img src={CloseIcon} alt="" />
          </button>
        </div>

        <form className="ap-form" onSubmit={handleSubmit} noValidate>
          <div className="ap-row">
            <div className="ap-field">
              <Label text="First Name" required />
              <input className="ap-input" name="firstName" value={form.firstName} onChange={handleChange} />
              {err("firstName")}
            </div>
            <div className="ap-field">
              <Label text="Last Name" required />
              <input className="ap-input" name="lastName" value={form.lastName} onChange={handleChange} />
              {err("lastName")}
            </div>
          </div>

          <div className="ap-row">
            <div className="ap-field">
              <Label text="Email" required />
              <input className="ap-input" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="off" />
              {err("email")}
            </div>
            <div className="ap-field">
              <Label text="Cell Number" required />
              <input className="ap-input" name="cellNumber" value={form.cellNumber} onChange={handleChange} />
              {err("cellNumber")}
            </div>
          </div>

          <div className="ap-row">
            <div className="ap-field">
              <Label text="Gender" required />
              <select className="ap-input" style={selectStyle} name="gender" value={form.gender} onChange={handleChange}>
                <option value="" disabled hidden />
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {err("gender")}
            </div>
            <div className="ap-field">
              <Label text="Insurance" />
              <select className="ap-input" style={selectStyle} name="insurance" value={form.insurance} onChange={handleChange}>
                <option value="" />
                {INSURANCE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ap-row">
            <div className="ap-field">
              <Label text="Address Line 1" />
              <input className="ap-input" name="addressLine1" value={form.addressLine1} onChange={handleChange} />
            </div>
            <div className="ap-field">
              <Label text="Address Line 2" />
              <input className="ap-input" name="addressLine2" value={form.addressLine2} onChange={handleChange} />
            </div>
          </div>

          <div className="ap-row">
            <div className="ap-field">
              <Label text="City" />
              <select className="ap-input" style={selectStyle} name="city" value={form.city} onChange={handleChange} disabled={!form.state}>
                <option value="" />
                {cities.map((c) => (
                  <option key={`${c.name}-${c.latitude}`} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="ap-field">
              <Label text="State" />
              <select className="ap-input" style={selectStyle} name="state" value={form.state} onChange={handleChange}>
                <option value="" />
                {usStates.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ap-row">
            <div className="ap-field">
              <Label text="Zip Code" required />
              <input className="ap-input" name="zipCode" value={form.zipCode} onChange={handleChange} inputMode="numeric" />
              {err("zipCode")}
            </div>
            <div className="ap-field" aria-hidden="true" />
          </div>

          <div className="ap-actions">
            <button type="button" className="ap-cancel" onClick={() => setVisible(false)}>
              Cancel
            </button>
            <button type="submit" className="ap-submit" disabled={isLoading}>
              ADD
            </button>
          </div>
        </form>
      </div>
    </COffcanvas>
  );
};

export default AddPatient;
