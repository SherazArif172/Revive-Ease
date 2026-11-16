import React from "react";
import DataTable from "react-data-table-component";
import { EngagemenetMedicineColumns } from "../../../../Components/DataTable/commonColumn";
import customStyles from "../../../../Components/DataTable/CustomStyle";
import Sorticon from "../../../../assets/icons/sort.png";

const EngagementMedicineReport = ({ patientData }) => {
  const columns = EngagemenetMedicineColumns();

  const weelyMedicineLog = patientData?.medicine_log_data;
  console.log("weelyMedicineLog",weelyMedicineLog);

  return (
    <>
      <div className="mt-3">
        <DataTable
          columns={columns}
          data={weelyMedicineLog}
          customStyles={customStyles}
          sortIcon={<img loading="lazy" src={Sorticon} />}
        />
      </div>
    </>
  );
};

export default EngagementMedicineReport;
