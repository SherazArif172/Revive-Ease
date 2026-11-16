import { AccordionDetails, AccordionSummary } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { formatDateOnly } from "../../../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import DeleteIcon from "../../../../assets/icons/trash-2.png";
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from "@coreui/react";
import { useUpdateRoleMutation } from "../../../../redux/apis/role_api";
import { toast } from "react-toastify";
import RightArrow from "../../../../assets/icons/chevron-right-orange.png";
import ScoreChartSheet from "./ScoreChartSheet";

const OutcomeCoach = ({ patientId, refetch }) => {
  const messageData = useSelector( 
    (state) => state?.allPatients?.patient?.patientData
  );

  const [deleteSendQuestionnaireOutcome, { isSuccess: deleteSendQuestionnaireOutcomeSuccess }] = useUpdateRoleMutation();
  
  const actorId = useSelector((state) => state?.user?.id);
  const actorType = useSelector((state) => state?.user?.userType);
  const [chartFor, setChartFor] = useState(null); // questionnaire name whose Score Chart is open

  useEffect(() => {
    const refreshData = async () => {
      if (deleteSendQuestionnaireOutcomeSuccess) {
  
        // Wait a bit to ensure backend has processed the delete
        await new Promise(resolve => setTimeout(resolve, 500));
        // Refetch patient data to update the Redux store
        if (refetch && typeof refetch === 'function') {
          try {
           await refetch();
           
          } catch (error) {
            console.error("Error refetching patient data:", error);
            toast.error("Failed to refresh data. Please reload the page.");
          }
        } else {
          console.warn("Refetch function is not available");
        }
      }
    };
    refreshData();
  }, [deleteSendQuestionnaireOutcomeSuccess, refetch]);

  const handleDeleteOutcome = async (questionnaireName) => {
    // Debug: Log all values to see what's missing
    // console.log("Delete Outcome - Values:", {
    //   patientId,
    //   actorId,
    //   actorType,
    //   questionnaireName,
    // });

    if (!patientId) {
      toast.error("Patient ID is missing");
      return;
    }
    if (!actorId) {
      toast.error("Actor ID is missing");
      return;
    }
    if (!actorType) {
      toast.error("Actor Type is missing");
      return;
    }
    if (!questionnaireName) {
      toast.error("Questionnaire Name is missing");
      return;
    }


    

    try {
      const payload = {
        deleteSendQuestionnaireOutcome: {
          patient_id: patientId,
          actorId: actorId,
          actorType: actorType,
          deleteFromPatient: questionnaireName,
        },
      };


      await deleteSendQuestionnaireOutcome({
        id: actorId,
        payload: payload,
      });
    } catch (error) {
      toast.error("Failed to delete outcome");
      console.error("Delete outcome error:", error);
    }
  };

  // Helper function to format date-only values without timezone conversion

  const getUniqueQuestionnaireNames = () => {
    if (!messageData?.questionnaire?.questionnaire_scores) return [];

    const uniqueNames = [
      ...new Set(
        messageData.questionnaire.questionnaire_scores.map(
          (item) => item.questionnaire_name
        )
      ),
    ];
    return uniqueNames;
  };

  const getQuestionnaireDataByName = (questionnaireName) => {
    if (!messageData?.questionnaire?.questionnaire_scores) return [];

    return messageData.questionnaire.questionnaire_scores
      .filter((item) => item.questionnaire_name === questionnaireName)
      .sort((a, b) => {
        // Compare UTC dates (all backend dates are UTC)
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB.getTime() - dateA.getTime(); // Sort by date, newest first
      });
  };

  const getUniqueUpcomingQuestionnaireNames =
    messageData?.questionnaire?.upcomingOutcomes;

  return (
    <>
      <AccordionSummary>
        <div className="fw-bold">Completed Outcome</div>
      </AccordionSummary>
      <AccordionDetails>
        <div className="row mt-3">
          {getUniqueQuestionnaireNames().length > 0 ? (
            getUniqueQuestionnaireNames().map((questionnaireName) => (
              <div key={questionnaireName} className="col-md-6 mb-3">
                <div className="outcome-card">
                  <div className="outcome-card-header">
                    <div className="d-flex py-3 align-items-center">
                      <div className="outcome-card-header-cancat"></div>
                      <h6 className="outcome-card-title ms-4 mb-0 flex-grow-1">
                        {questionnaireName}
                      </h6>
                      <button
                        type="button"
                        className="btn btn-sm border-0 me-2"
                        aria-label={`View ${questionnaireName} score chart`}
                        onClick={() => setChartFor(questionnaireName)}
                      >
                        <img src={RightArrow} alt="" />
                      </button>
                    </div>
                    <div className="hr-container">
                      <hr className="custom-hr" />
                    </div>
                  </div>
                  <div className="outcome-card-body">
                    <div className="outcome-values">
                      {getQuestionnaireDataByName(questionnaireName)
                        .slice(0, 5)
                        .map((item, index) => {
                          let score;
                          if (questionnaireName === "PROMIS Global") {
                            score = item.promis_global_overall ?? "-";
                          } else if (
                            ["NDI", "FAAM", "ODI"].includes(
                              (questionnaireName || "").toUpperCase()
                            )
                          ) {
                            score = `${item.value}%`;
                          } else {
                            score = item.value;
                          }

                          return (
                            <div
                              key={index}
                              className="outcome-value-item ps-3"
                            >
                              <div className="outcome-number">{score}</div>
                              <div className="fw-bold">Score</div>
                              <div className="outcome-date mt-2">
                                {formatDateOnly(item.date, "MM/dd/yyyy")}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">
              <p>No record found</p>
            </div>
          )}
        </div>
      </AccordionDetails>
      <AccordionSummary>
        <div className="fw-bold">Upcoming Outcome</div>
      </AccordionSummary>
      <AccordionDetails>
        <div className="row mt-3">
          {getUniqueUpcomingQuestionnaireNames &&
          getUniqueUpcomingQuestionnaireNames.length > 0 ? (
            <div className="outcome-cards-row">
              {getUniqueUpcomingQuestionnaireNames.map((item, index) => (
                <div key={item?.id || index} className="outcome-card-upcoming">
                  <div className="outcome-card-header">
                    <div className="d-flex justify-content-between align-items-start py-3">
                      <div className="d-flex">
                        <div className="outcome-card-header-cancat"></div>
                        <div>
                          <h6 className="ms-4 outcome-card-title mb-1">
                            {item?.questionnaire_name}
                          </h6>
                          <h6
                            className="ms-4 text-muted"
                            style={{ fontSize: "0.9rem", fontWeight: "normal" }}
                          >
                            {item?.note}
                          </h6>
                        </div>
                      </div>
                      {actorType === "coach" && (
                        <div>
                          <CDropdown variant="" direction="dropstart" id={`outcome-card-dropdown-${index}`}>
                            <CDropdownToggle size="sm">
                              <FontAwesomeIcon
                                icon={faEllipsis}
                                rotation={90}
                                size="lg"
                                style={{ color: "#04470C" }}
                              />
                            </CDropdownToggle>
                            <CDropdownMenu>
                              <CDropdownItem
                                onClick={() => {
                                  handleDeleteOutcome(item?.questionnaire_name);
                                }}
                              >
                                <img src={DeleteIcon} className="me-2" alt="Delete" />
                                Delete
                              </CDropdownItem>
                            </CDropdownMenu>
                          </CDropdown>
                        </div>
                      )}
                    </div>
                    <div className="hr-container">
                      <hr className="custom-hr" />
                    </div>
                  </div>
                  <div className="outcome-card-body">
                    <div className="outcome-date ps-3">
                      Date: {formatDateOnly(item?.requested_date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p>No record found</p>
            </div>
          )}
        </div>
      </AccordionDetails>
      <ScoreChartSheet
        visible={!!chartFor}
        onClose={() => setChartFor(null)}
        title={chartFor || ""}
        scores={chartFor ? getQuestionnaireDataByName(chartFor) : []}
        scoreKey={chartFor === "PROMIS Global" ? "promis_global_overall" : "value"}
      />
    </>
  );
};

export default OutcomeCoach;
