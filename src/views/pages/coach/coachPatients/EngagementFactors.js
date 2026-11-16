import React from "react";
import DataTable from "react-data-table-component";
import { EngagemenetFactorsColumns } from "../../../../Components/DataTable/commonColumn";
import customStyles from "../../../../Components/DataTable/CustomStyle";
import Sorticon from "../../../../assets/icons/sort.png";

const EngagemenetFactors = ({ patientData }) => {
  const columns = EngagemenetFactorsColumns();

  const painFactorData = patientData?.painFactors;

  return (
    <>
      <div className="mt-3">
        <DataTable
          columns={columns}
          data={painFactorData}
          customStyles={customStyles}
          sortIcon={<img loading="lazy" src={Sorticon} />}
        />
      </div>
    </>
  );
};

export default EngagemenetFactors;
