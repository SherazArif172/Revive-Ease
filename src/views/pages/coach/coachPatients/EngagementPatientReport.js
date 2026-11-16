import React from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import chevronLeft from "../../../../assets/icons/chevron-left-orange.png";
import chevronRight from "../../../../assets/icons/chevron-right-orange.png";
import { formatDate } from "../../../../utils/dateUtils";

const EngagementPatientReport = ({
    patientReport,
    handleClickPatientReport,
    providerReportGraph,
    monthData,
    weeklyData,
    tillDateData,
    dataLine,
    dataLineWeekly,
    handlePrevMonthPatientReport,
    handleNextMonthPatientReport,
    handleNextWeekPatientReport,
    handlePrevWeekPatientReport,
    handlePrevFiveMonthPatientReport,
    handleNextFiveMonthPatientReport,
    handleCategoryClick,
    selectedCategory,
    currentMonthDatePatient,
    currentWeekStartPatientReport,
    getWeeklyRange,
    maxDate,
    patientCreatedAt,
    showMigraineDays = false
}) => {
    console.log(tillDateData, "tillDateData");


    const getTillDateRange = () => {
        const startDate = formatDate(patientCreatedAt, 'MM/dd/yyyy');
        const endDate = formatDate(maxDate, 'MM/dd/yyyy');
        return `${startDate} - ${endDate}`;
    };

    // Transform data to use pain_score, mood_score, sleep_score keys
    const transformDataForCategory = (data, category) => {
        if (!data || !Array.isArray(data)) return [];
        return data.map(item => {
            const transformed = { ...item };
            if (category === "pain") {
                // Map Pain to pain_score
                if (item.Pain !== undefined) {
                    transformed.pain_score = item.Pain;
                } else if (item.pain_score !== undefined) {
                    // Already has pain_score, keep it
                    transformed.pain_score = item.pain_score;
                }
            } else if (category === "mood") {
                // Map Mood to mood_score
                if (item.Mood !== undefined) {
                    transformed.mood_score = item.Mood;
                } else if (item.mood_score !== undefined) {
                    // Already has mood_score, keep it
                    transformed.mood_score = item.mood_score;
                }
            } else if (category === "sleep") {
                // Map Sleep to sleep_score
                if (item.Sleep !== undefined) {
                    transformed.sleep_score = item.Sleep;
                } else if (item.sleep_score !== undefined) {
                    // Already has sleep_score, keep it
                    transformed.sleep_score = item.sleep_score;
                }
            } else if (category === "migraine_days") {
                transformed.migraine_days = item.MigraineDays !== undefined ? item.MigraineDays : (item.migraine_days ?? 0);
            }
            return transformed;
        });
    };

    return (
        <>
            {!providerReportGraph && (
                <div className="col-12 mt-3">
                    <div className="d-flex justify-content-between">
                        <p className="month-text">
                            <b>Patient Report</b>
                        </p>
                        <div className="month">
                            <button
                                type="button"
                                onClick={() => handleClickPatientReport("weekly")}
                                style={{
                                    backgroundColor:
                                        patientReport === "weekly" ? "#F88200" : "#EDEDED",
                                    color: patientReport === "weekly" ? "#FFFFFF" : "#000000",
                                    border: "none",
                                    padding: "8px 24px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    borderRadius: patientReport === "weekly" ? "5px" : "0px",
                                    borderTopLeftRadius:
                                        patientReport === "weekly" ? "5px" : "10px",
                                    borderBottomLeftRadius:
                                        patientReport === "weekly" ? "5px" : "10px",
                                }}
                            >
                                Weekly
                            </button>
                            <button
                                type="button"
                                onClick={() => handleClickPatientReport("monthly")}
                                style={{
                                    backgroundColor:
                                        patientReport === "monthly" ? "#F88200" : "#EDEDED",
                                    color:
                                        patientReport === "monthly" ? "#FFFFFF" : "#000000",
                                    border: "none",
                                    padding: "8px 24px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    borderRadius: patientReport === "monthly" ? "5px" : "0px",
                                }}
                            >
                                Monthly
                            </button>
                            <button
                                type="button"
                                onClick={() => handleClickPatientReport("till_date")}
                                style={{
                                    backgroundColor:
                                        patientReport === "till_date" ? "#F88200" : "#EDEDED",
                                    color:
                                        patientReport === "till_date" ? "#FFFFFF" : "#000000",
                                    border: "none",
                                    padding: "8px 24px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    borderRadius: patientReport === "till_date" ? "5px" : "0px",
                                    borderTopRightRadius:
                                        patientReport === "till_date" ? "5px" : "10px",
                                    borderBottomRightRadius:
                                        patientReport === "till_date" ? "5px" : "10px",
                                }}
                            >
                                Till Date
                            </button>
                        </div>
                    </div>
                    <div
                        className="row d-flex mt-3 justify-content-between gap-3 "
                        style={{ flexWrap: "wrap" }}
                    >
                        <div
                            className={`${selectedCategory === "overall"
                                ? "button-patient-1"
                                : "button-patient-2"
                                }  pointer fw-bold d-flex col justify-content-between p-2 ${selectedCategory === "overall" ? "active" : ""
                                }`}
                            onClick={() => handleCategoryClick("overall")}
                        >
                            <span>Overall</span>
                        </div>
                        <div
                            className={`${selectedCategory === "pain"
                                ? "button-patient-pain "
                                : "button-patient-2"
                                } pointer fw-bold d-flex col justify-content-between p-2 ${selectedCategory === "pain" ? "active" : ""
                                }`}
                            onClick={() => handleCategoryClick("pain")}
                        >
                            <span>Pain</span>
                        </div>
                        <div
                            className={`${selectedCategory === "mood"
                                ? "button-patient-mood"
                                : "button-patient-2"
                                } pointer fw-bold d-flex col justify-content-between p-2 ${selectedCategory === "mood" ? "active" : ""
                                }`}
                            onClick={() => handleCategoryClick("mood")}
                        >
                            <span>Mood</span>
                        </div>
                        <div
                            className={`${selectedCategory === "sleep"
                                ? "button-patient-sleep"
                                : "button-patient-2"
                                } pointer fw-bold d-flex col justify-content-between p-2 ${selectedCategory === "sleep" ? "active" : ""
                                }`}
                            onClick={() => handleCategoryClick("sleep")}
                        >
                            <span>Sleep</span>
                        </div>
                        {showMigraineDays && (
                            <div
                                className={`${selectedCategory === "migraine_days"
                                    ? "button-patient-1"
                                    : "button-patient-2"
                                    } pointer fw-bold d-flex col justify-content-between p-2 ${selectedCategory === "migraine_days" ? "active" : ""
                                    }`}
                                onClick={() => handleCategoryClick("migraine_days")}
                            >
                                <span>Migraine Days</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-3">
                        {patientReport === "monthly" ? (
                            <div>
                                <p className="month-text flex items-center">
                                    <img
                                        loading="lazy"
                                        className="me-2 pointer"
                                        src={chevronLeft}
                                        onClick={handlePrevMonthPatientReport}
                                        alt="Previous"
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <b className="me-2 font-theme-color">
                                        {formatDate(currentMonthDatePatient, "MMMM yyyy")}
                                    </b>
                                    <img
                                        loading="lazy"
                                        className="mx-2 pointer"
                                        src={chevronRight}
                                        onClick={handleNextMonthPatientReport}
                                        alt="Next"
                                        style={{ cursor: 'pointer' }}
                                    />
                                </p>
                            </div>
                        ) : patientReport === "till_date" ? (
                            <div>
                                <p className="month-text flex items-center">
                                    <img
                                        loading="lazy"
                                        className="me-2 pointer"
                                        src={chevronLeft}
                                        onClick={handlePrevFiveMonthPatientReport}
                                        alt="Previous"
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <b className="me-2 font-theme-color">
                                        {getTillDateRange()}
                                    </b>
                                    <img
                                        loading="lazy"
                                        className="mx-2 pointer"
                                        src={chevronRight}
                                        onClick={handleNextFiveMonthPatientReport}
                                        alt="Next"
                                        style={{ cursor: 'pointer' }}
                                    />
                                </p>
                            </div>
                        ) : (
                            <p className="month-text flex items-center">
                                <img
                                    loading="lazy"
                                    className="me-2 pointer"
                                    src={chevronLeft}
                                    onClick={handlePrevWeekPatientReport}
                                    alt="Previous"
                                    style={{ cursor: 'pointer' }}
                                />
                                <b className="me-2  font-theme-color">{getWeeklyRange(currentWeekStartPatientReport)}</b>
                                <img
                                    loading="lazy"
                                    className="mx-2 pointer"
                                    src={chevronRight}
                                    onClick={handleNextWeekPatientReport}
                                    alt="Next"
                                    style={{ cursor: 'pointer' }}
                                />
                            </p>
                        )}
                    </div>
                    <div className="row">
                        <div className="col-12 mt-4" style={{ height: "300px" }}>
                            <ResponsiveContainer width="100%" height={200}>
                                {selectedCategory === "overall" ? (
                                    patientReport === "monthly" ? (
                                        <AreaChart
                                            data={monthData || []}
                                            syncId="anyId"
                                            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                                            <Tooltip />
                                            <Area dataKey="value" stroke="#82ca9d" fill="#82ca9d" />
                                        </AreaChart>
                                    ) : patientReport === "till_date" ? (
                                        <AreaChart
                                            data={tillDateData || []}
                                            syncId="anyId"
                                            margin={{ top: 10, right: 0, left: 10, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                angle={-30}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                                            <Tooltip
                                                formatter={(value) => [`${value}`, 'Score']}
                                                labelFormatter={(label) => `Month: ${label}`}
                                            />
                                            <Area
                                                dataKey="value"
                                                stroke="#82ca9d"
                                                fill="#82ca9d"
                                                name="Overall Score"
                                            />
                                        </AreaChart>
                                    ) : (
                                        <AreaChart
                                            data={weeklyData || []}
                                            syncId="anyId"
                                            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                                            <Tooltip />
                                            <Area dataKey="value" stroke="#82ca9d" fill="#82ca9d" />
                                        </AreaChart>
                                    )
                                ) : patientReport === "monthly" ? (
                                    <LineChart
                                        data={transformDataForCategory(dataLine, selectedCategory) || []}
                                        margin={{ top: 20 }}
                                        accessibilityLayer
                                    >
                                        <CartesianGrid
                                            strokeDasharray=""
                                            fillOpacity={0.9}
                                            stroke="#f2f2f2"
                                        />
                                        <XAxis dataKey="name" stroke="grey" />
                                        <YAxis stroke="grey" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                                        <Tooltip />
                                        {selectedCategory === "pain" && (
                                            <Line dataKey="pain_score" stroke="#236504" dot={false} name="Pain Score" />
                                        )}
                                        {selectedCategory === "mood" && (
                                            <Line dataKey="mood_score" stroke="#C50F0F" dot={false} name="Mood Score" />
                                        )}
                                        {selectedCategory === "sleep" && (
                                            <Line dataKey="sleep_score" stroke="#363CD1" dot={false} name="Sleep Score" />
                                        )}
                                        {selectedCategory === "migraine_days" && (
                                            <Line dataKey="migraine_days" stroke="#F88200" dot={false} name="Migraine Days" />
                                        )}
                                    </LineChart>
                                ) : patientReport === "till_date" ? (
                                    <LineChart
                                        data={transformDataForCategory(tillDateData, selectedCategory) || []}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            angle={-30}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis domain={[0, 10]} />
                                        <Tooltip
                                            formatter={(value, name) => [`${value}`, name]}
                                            labelFormatter={(label) => `Month: ${label}`}
                                        />
                                        {selectedCategory === "pain" && (
                                            <Line
                                                type="monotone"
                                                dataKey="pain_score"
                                                stroke="#236504"
                                                strokeWidth={2}
                                                dot={{ fill: '#236504', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Pain Score"
                                            />
                                        )}
                                        {selectedCategory === "mood" && (
                                            <Line
                                                type="monotone"
                                                dataKey="mood_score"
                                                stroke="#C50F0F"
                                                strokeWidth={2}
                                                dot={{ fill: '#C50F0F', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Mood Score"
                                            />
                                        )}
                                        {selectedCategory === "sleep" && (
                                            <Line
                                                type="monotone"
                                                dataKey="sleep_score"
                                                stroke="#363CD1"
                                                strokeWidth={2}
                                                dot={{ fill: '#363CD1', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Sleep Score"
                                            />
                                        )}
                                        {selectedCategory === "migraine_days" && (
                                            <Line
                                                type="monotone"
                                                dataKey="migraine_days"
                                                stroke="#F88200"
                                                strokeWidth={2}
                                                dot={{ fill: '#F88200', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Migraine Days"
                                            />
                                        )}
                                    </LineChart>
                                ) : (
                                    <LineChart
                                        data={transformDataForCategory(dataLineWeekly, selectedCategory) || []}
                                        margin={{ top: 20 }}
                                        accessibilityLayer
                                    >
                                        <CartesianGrid
                                            strokeDasharray=""
                                            fillOpacity={0.9}
                                            stroke="#f2f2f2"
                                        />
                                        <XAxis dataKey="name" stroke="grey" />
                                        <YAxis stroke="grey" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                                        <Tooltip />
                                        {selectedCategory === "pain" && (
                                            <Line dataKey="pain_score" stroke="#236504" dot={false} name="Pain Score" />
                                        )}
                                        {selectedCategory === "mood" && (
                                            <Line dataKey="mood_score" stroke="#C50F0F" dot={false} name="Mood Score" />
                                        )}
                                        {selectedCategory === "sleep" && (
                                            <Line dataKey="sleep_score" stroke="#363CD1" dot={false} name="Sleep Score" />
                                        )}
                                        {selectedCategory === "migraine_days" && (
                                            <Line dataKey="migraine_days" stroke="#F88200" dot={false} name="Migraine Days" />
                                        )}
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EngagementPatientReport;