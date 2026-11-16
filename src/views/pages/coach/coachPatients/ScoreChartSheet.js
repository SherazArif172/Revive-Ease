import React from "react";
import { COffcanvas } from "@coreui/react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "../../../../utils/dateUtils";
import CloseIcon from "../../../../assets/icons/figma/close-circle.svg";
import "./ScoreChartSheet.scss";

/**
 * Side sheet showing one completed outcome's scores over time (Figma "Quick Dash" / Score Chart).
 * `scores` are the questionnaire entries for that outcome, any order.
 */
const ScoreChartSheet = ({ visible, onClose, title, scores = [], scoreKey = "value" }) => {
  const data = [...scores]
    .filter((s) => s?.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((s) => ({
      date: formatDate(s.date, "d MMM yyyy"),
      score: Number(s?.[scoreKey] ?? s?.value ?? 0),
    }));

  // Round the axis top up to a clean value (10, 20, 30 ...) so ticks read evenly, as in Figma (2-10).
  const maxScore = Math.max(10, Math.ceil(Math.max(0, ...data.map((d) => d.score)) / 10) * 10);

  return (
    <COffcanvas
      className="score-chart-sheet"
      placement="end"
      backdrop="static"
      visible={visible}
      onHide={onClose}
    >
      <div className="sc-inner">
        <div className="sc-handle" />
        <div className="sc-head">
          <p className="sc-title">{title}</p>
          <button type="button" className="sc-close" aria-label="Close" onClick={onClose}>
            <img src={CloseIcon} alt="" />
          </button>
        </div>
        <div className="sc-body">
          <p className="sc-subtitle">Score Chart</p>
          <div className="sc-chart">
            {data.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#F2F2F2" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, maxScore]} tickCount={6} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip formatter={(v) => [v, "Score"]} />
                  <Area type="linear" dataKey="score" stroke="none" fill="#D3ECE4" fillOpacity={1} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <span className="sc-empty">No scores recorded yet.</span>
            )}
          </div>
        </div>
      </div>
    </COffcanvas>
  );
};

export default ScoreChartSheet;
