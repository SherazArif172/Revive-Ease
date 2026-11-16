import React from "react";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
// import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import Sorticon from "../../../../assets/icons/sort.png";

const ClinicalLogs = ({  providerMedicineShow , patientDetailLoading}) => {
  // const dataGraph = [
  //   { name: "Group A", value: 16 },
  //   { name: "Group B", value: 16 },
  //   { name: "Group C", value: 16 },
  //   { name: "Group D", value: 52 },
  // ];
  // const COLORS = ["#B15151", "#ABA038", "#293C7F", "#3D7E63"];
  // const RADIAN = Math.PI / 180;
  // const renderCustomizedLabel = ({
  //   cx,
  //   cy,
  //   midAngle,
  //   innerRadius,
  //   outerRadius,
  //   percent,
  // }) => {
  //   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  //   const x = cx + radius * Math.cos(-midAngle * RADIAN);
  //   const y = cy + radius * Math.sin(-midAngle * RADIAN);
  //   const textAnchor = x > cx ? "start" : "end";
  //   const fontSize = percent > 0.2 ? 14 : 12;
  //   return (
  //     <text
  //       x={x}
  //       y={y}
  //       fill="white"
  //       textAnchor={textAnchor}
  //       dominantBaseline="central"
  //       fontSize={fontSize}
  //     >
  //       {`${(percent * 100).toFixed(0)}%`}
  //     </text>
  //   );
  // };
  // eslint-disable-next-line no-unused-vars

  const patientData = useSelector((state) => state?.allPatients?.patient?.patientData?.medicalInfo);

  const medicineDetails = patientData?.flatMap((entry) =>
    entry?.diseases?.flatMap((disease) => disease?.medicine_details || []) || []
  ) || [];
  
  const medicineFeel = patientData?.flatMap((entry) =>
    entry?.diseases?.flatMap((disease) => disease?.med_feel || []) || []
  ) || [];

  const combinedFeel = medicineFeel?.length > 0 && medicineFeel.every(feel => feel != null) 
    ? Object.assign({}, ...medicineFeel.filter(feel => feel != null)) 
    : {};

  const combinedMedicineData = medicineDetails?.length > 0 
    ? medicineDetails.map((detail) => ({
        ...detail,
        ...combinedFeel
      }))
    : [];
  
  const customStyles = {
    rows: {
      style: {
        minHeight: "50px",
        fontSize: "13px",
        paddingLeft: "18px",
        fontWeight: "600",
        "&:last-of-type": {
          borderBottomLeftRadius: "20px",
          borderBottomRightRadius: "20px",
        },
        "&.rdt-selected": {
          backgroundColor: "red",
          paddingRight: "48px",
        },
      },
    },
    headCells: {
      style: {
        color: "white",
        lineHeight: "21px",
        fontSize: "13px",
        fontWeight: "600",
        paddingLeft: "18px",
        paddingRight: "18px",
        borderRight: "1px solid white",
      },
    },
    cells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
  };


  const columns = [
    {
      name: "Medicine Name",
      selector: (row) => {
        const fullName = row?.dosage && row.dosage.trim() !== "" ? `${row?.medicine_name}-${row?.dosage}` : `${row?.medicine_name}`;
        if (fullName?.length > 20) {
          return (
            <div
              title={fullName}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {fullName}
            </div>
          );
        }
        return fullName;
      },
      sortable: true,
    },    
    {
      name: "Medicine Type",
      selector: (row) => row?.medicine_type,
      sortable: true,
    },
    {
      name: "Duration",
      selector: (row) => row?.duration_medicine_routine,
      sortable: true,
    },
    {
      name: "Medicine Goals",
      selector: (row) => row?.medication_goal,
      sortable: true,
    },
    {
      name: "Meds Make Me Feel?",
      selector: (row) => row?.feel_range,
      sortable: true,
    },
  ];

  // const reviewItems = [
  //   { className: "box-color-1", text: "Review Management" },
  //   { className: "box-color-2", text: "Chat Reviews" },
  //   { className: "box-color-3", text: "Patient Analytic Review" },
  //   { className: "box-color-4", text: "Adherence" },
  // ];

  return (
    <>

      <div className="default-container ps-3 mt-3  bg-white">
        {/* {!providerMedicineShow && (
          <div className="row ">
            <div
              className="col-12 "
              style={{
                border: "1px solid #D6D6D6",
                height: "250px",
                borderRadius: "8px",
              }}
            >
              <div className="mt-2">
                <strong className="graph-text fs-14 pt-2">RTM Time Spent</strong>
              </div>

              <div
                className="d-flex align-items-center mx-2 mt-2"
                style={{ height: "180px" }}
              >
                <div
                  className="pie-chart-container"
                  style={{ flex: 0.3, height: "100%", width: "50%" }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    className="mt-3"
                  >
                    <PieChart width={400} height={400}>
                      <Pie
                        data={dataGraph}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dataGraph.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div
                  className="review-management-text px-5 ms-3 my-5"
                  style={{ flex: "0 0 auto", width: "50%" }}
                >
                  {reviewItems.map((item, index) => (
                    <div
                      key={index}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <div className={item.className}></div>
                      <p className="log-text-room m-0 p-0  fs-14">{item.text}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )} */}
        <div className="row">
          <div className="col-12">
          {!providerMedicineShow && (  <p className="log-text-room fw-bold  mt-3">How medicine makes me feel ?</p>)}
            <div className={`${providerMedicineShow ? "" : "mt-4"}`}>
              <div className="">
                <DataTable
                  columns={columns}
                  data={Array.isArray(combinedMedicineData) ? combinedMedicineData : []}
                  customStyles={customStyles}
                  progressPending = {patientDetailLoading}
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
    </>
  );
};
export default ClinicalLogs;
