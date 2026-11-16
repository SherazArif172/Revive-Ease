import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js";
import Statsup from "../../../assets/icons/statsUp.png";
import Statsdown from "../../../assets/icons/statsDown.png";

Chart.register(ArcElement);

const Charts = ({ title, value, increaseBy, large, max }) => {
  const scoreValue = value || 0; // Default to 0 if no value is provided
  const isLarge = large ?? title === "Pain Function Score";
  const maxValue = max ?? (title === "Pain Function Score" ? 100 : 10);
  const remainingValue = maxValue - scoreValue; // Adjust based on scale (100 for Pain Function Score, 10 for others)

  const data = {
    datasets: [
      {
        data: [scoreValue, remainingValue],
        // backgroundColor: ["#007E9E", "#EBEBEB"],
        backgroundColor:  increaseBy < 0 ? ["#EB854A", "#D9D9D9"] : ["#3E8816", "#D9D9D9"],

        borderRadius: (context) => (context.dataIndex === 0 ? 5 : 0),
        borderColor: ["#D1D6DC", "transparent"],
      },
      
    ],
    
  };

  const chartStyle = isLarge ? { width: "307px", height: "230px" } : { width: "120px", height: "110px" };

  return (
    <>
      <div className="d-flex justify-content-between mx-3">
        <div className="bold">{title}</div>
        <div className="stats d-flex">
          <span>
            {increaseBy > 0 ?
              <img loading="lazy"
                src={Statsup}
                height={14}
                width={21}
                alt="stats icon"
              /> : 
              increaseBy < 0 ?
                <img loading="lazy"
                  src={Statsdown}
                  height={14}
                  width={21}
                  alt="stats icon"
                /> : null}
          </span>
          <span className="stats-value ms-2">{}
            {increaseBy === null ? null : increaseBy >= 0 ? `${increaseBy}%` : `${Math.abs(increaseBy)}%`}
          </span>
        </div>
      </div>
      <div style={{ position: "relative", ...chartStyle, margin: "auto" }} className="mt-3">
        <Doughnut
          data={data}
          options={{
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            rotation: -90,
            circumference: 180,
            cutout: "60%",
            maintainAspectRatio: false,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          {scoreValue}
        </div>
      </div>
    </>
  );
};

export default Charts;



