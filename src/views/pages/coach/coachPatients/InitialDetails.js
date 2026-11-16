import React from 'react';
import DataTable from 'react-data-table-component';
import customStyles from '../../../../Components/DataTable/CustomStyle';
import Sorticon from '../../../../assets/icons/sort.png';

const SectionHeader = ({ title }) => (
  <div className="d-flex align-items-center justify-content-between mb-2">
    <h6 className="mb-0 fw-bold font-theme-color">{title}</h6>
  </div>
);

const KeyValueRow = ({ label, value }) => (
  <div className="  d-flex flex-column">
    <div className=" fw-semibold">{label}</div>
    <div className=" text-muted">{value || '-'}</div>
  </div>
);

const Card = ({ children }) => (
  <div className="bg-white rounded shadow p-3 mb-3">{children}</div>
);

const InitialDetails = ({ patientData }) => {
  const painColumns = [
    { name: 'Pain Location', selector: row => row.location, sortable: true },
    { name: 'Pain Level', selector: row => row.level, sortable: true },
    { name: 'Pain Duration', selector: row => row.duration, sortable: true },
    { name: 'Pain Quality', selector: row => row.quality, sortable: true },
  ];

  // Flatten painInfo -> pain_quality -> pain_details
  const painData = (patientData?.painInfo || []).flatMap((info) =>
    (info?.pain_quality || []).flatMap((q) =>
      (q?.pain_details || []).map((d) => ({
        location: d?.pain_location || '-',
        level: d?.pain_levels || '-',
        duration: d?.pain_duration || '-',
        quality: d?.pain_quality_name || '-',
      }))
    )
  );

  const medicalData = patientData?.medicalInfo;
  const medicalDiseaseData = medicalData?.flatMap((item) => item.diseases || []);

  const surgicalData = patientData?.surgicalInfo;
  const surgicalDetailsData = surgicalData.flatMap(item =>
    (item.surgicalDetails || []).map(detail => ({
      ...detail,
      comments: item.comments || "-",
    }))
  );
  // Aggregated info rows
  const factorsAffectingPain = (patientData?.painInfo || [])
    .map((i) => i?.pain_quality?.[0]?.activity_pain)
    .filter(Boolean)
    .join(', ');

  const painManagement = (patientData?.painInfo || [])
    .map((i) => i?.pain_quality?.[0]?.activity_affecting_pain)
    .filter(Boolean)
    .join(', ');

  const currentManagement = (patientData?.painInfo || [])
    .flatMap((i) => i?.pain_quality?.[0]?.pain_currently?.field_name || [])
    .filter(Boolean)
    .join(', ');

  const goals = (patientData?.painInfo || [])
    .flatMap((i) => i?.pain_your_goals || [])
    .filter(Boolean)
    .join(', ');



  // Map surgical details to table format
  const surgeryData = surgicalDetailsData?.map((surgery) => ({
    location: surgery?.body_part || '-',
    type: surgery?.body || '-',
    timeframe: surgery?.duration || '-',
    comments: surgery?.comments || '-',
  })) || [];

  // Get restrictions from surgicalInfo
  const restrictions = surgicalData?.flatMap((item) => item.restriction || [])
    .filter(Boolean).join(', ') || '-';
  const surgeryColumns = [
    { name: 'Surgery  Location', selector: row => row.location, sortable: true },
    { name: 'Surgery Type', selector: row => row.type, sortable: true },
    { name: 'Surgery Timeframe', selector: row => row.timeframe, sortable: true },
    { name: 'Other Notes', selector: row => row.comments, sortable: false },
  ];

  const medicineColumns = [
    { name: 'Medicine Type', selector: row => row.type, sortable: true },
    { name: 'Medicine Name', selector: row => row.name, sortable: true },
    { name: 'Dosage', selector: row => row.dosage, sortable: true },
    { name: 'Medicine Frequency', selector: row => row.frequency, sortable: true },
    { name: 'Other Notes', selector: row => row.notes, sortable: false },
  ];

  // Flatten medicine_details from medicalDiseaseData
  const medicineData = medicalDiseaseData?.flatMap((disease) =>
    (disease?.medicine_details || []).map((med) => ({
      type: med?.medicine_type || '-',
      name: med?.medicine_name || '-',
      dosage: med?.dosage || '-',
      frequency: med?.duration_medicine_routine || '-',
      notes: '-',
    }))
  ) || [];

  // Get diagnosis info
  const diagnosisInfo = medicalDiseaseData?.flatMap((disease) =>
    (disease?.diagnosisInfo || []).map((diag) => diag?.diagnosis_name)
  ).filter(Boolean).join(', ') || "-";

  // Get other medical conditions
  const otherMedicalConditions = medicalDiseaseData?.map((disease) =>
    disease?.other_medical_cond
  ).filter(Boolean).join(',  ') || "-";

  // Get medication feelings
  const medicationFeelings = medicalDiseaseData?.map((disease) =>
    disease?.med_feel?.feel_range
  ).filter(Boolean).join(', ') || "-";

  // Get medication goals
  const medicationGoals = medicalDiseaseData?.map((disease) =>
    disease?.med_feel?.medication_goal
  ).filter(Boolean).join(', ') || "-";

  return (
    <div className="container-fluid px-0 mt-3" >
      {/* Pain Details */}
      <Card>
        <SectionHeader title="Pain Details" />
        <div className="mt-3">
          <DataTable
            columns={painColumns}
            data={painData}
            customStyles={customStyles}
            sortIcon={<img loading="lazy" src={Sorticon} />}
          />
        </div>
        <div className="pt-4 mt-2 mx-3">
          <div className="row">
            <div className="col-md-4">
              <div className="fw-semibold mb-1">Factors Affecting Pain</div>
              <div className="text-muted">{factorsAffectingPain || '-'}</div>
            </div>
            <div className="col-md-4">
              <div className="fw-semibold mb-1">Better/Worse</div>
              <div className="text-muted">{painManagement || '-'}</div>
            </div>
            <div className="col-md-4">
              <div className="fw-semibold mb-1">Current Management</div>
              <div className="text-muted">{currentManagement || '-'}</div>
            </div>
          </div>
          <hr className='dashed-hr' />
          <KeyValueRow label="Goals" value={goals} />
        </div>
      </Card>

      {/* Surgery Details */}
      <Card>
        <SectionHeader title="Surgery Details" />
        <div className="mt-2">
          <DataTable
            columns={surgeryColumns}
            data={surgeryData}
            customStyles={customStyles}
            sortIcon={<img loading="lazy" src={Sorticon} />}
          />
        </div>
        <div className="mt-2">
          <KeyValueRow label="Restrictions" value={restrictions} />

        </div>

      </Card>

      {/* Medicine Details */}
      <Card>
        <SectionHeader title="Medicine Details" />
        <div className="row my-3">
          <div className="col-md-6 ">
            <KeyValueRow label="Diagnosis" value={diagnosisInfo} />
          </div>
          <div className="col-md-6">
            <KeyValueRow label="Other Medical Conditions" value={otherMedicalConditions} />
          </div>
        </div>

        <div className="mt-2">
          <DataTable
            columns={medicineColumns}
            data={medicineData}
            customStyles={customStyles}
            sortIcon={<img loading="lazy" src={Sorticon} />}
          />
        </div>

        <div className="row mt-3">
          <div className="col-md-6">
            <KeyValueRow label="These meds make me feel" value={medicationFeelings} />
          </div>
          <div className="col-md-6">
            <KeyValueRow label="My goal with these medication" value={medicationGoals} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InitialDetails;
