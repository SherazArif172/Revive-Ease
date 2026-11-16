///////////////Active log/////////////////
import React, { useEffect } from "react";
import DataTable from "react-data-table-component";
import Sorticon from "../../../../assets/icons/sort.png";
import { formatDate } from "../../../../utils/dateUtils";
import { customStylesAlert } from "../../../../Components/DataTable/CustomStyle";
import { useGetCoachAlerLogQuery } from "../../../../redux/apis/patient_coach_api";
import { useSelector } from "react-redux";

const AlertLog = ({ patientData }) => {

  const alertLog = useSelector((state) => state?.allCoach?.alertLog);
  const id = useSelector((state) => state?.user?.id);

  // eslint-disable-next-line no-unused-vars
  const { data: coachAlertLog, refetch } = useGetCoachAlerLogQuery({coachId: id, providerId: patientData?.provider?._id, patientId: patientData?._id});

  useEffect(() => {
    if (alertLog !== null) {
      refetch();
    }
  }, []);

  const columns = [
    {
      name: "Alert Description",
      selector: (row) => (
        <span title={row?.message}>
          {row?.message?.length > 90
            ? `${row?.message?.substring(0, 90)}...`
            : row?.message}
        </span>
      ),
      sortable: true,
      grow: 3
    },
    {
      name: "Status",
      selector: (row) => row?.status,
      sortable: true,
      cell: (row) => (
        <span
          style={{ 
            color: "green",
            fontWeight: "bold",
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Receiver",
      selector: (row) => {
        if (row?.patient_id) {
          return `${row?.patient_id?.first_name} ${ row?.patient_id?.last_name} (Patient)`;
        } else if (row?.provider_id) {
          return `${row?.provider_id?.first_name} ${row?.provider_id?.last_name} (Provider)`;
        } else {
          return "No receiver available";
        }
      },
      sortable: true
    },
    {
      name: "Sent On",
      selector: (row) => formatDate(row?.createdAt, "MM/dd/yyyy"),
      sortable: true,
    },
  ];
  return (
    <div className="default-container">
      <div className="row" >
        <div className="col-12">
          <div className="mt-4">
            <div>
              <DataTable
                columns={columns}
                data={alertLog?.alertData}
                customStyles={customStylesAlert}
                responsive={true}
                sortIcon={
                  <>
                    <img loading="lazy" src={Sorticon} alt="" />
                  </>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AlertLog;