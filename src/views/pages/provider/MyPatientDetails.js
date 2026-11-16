import {
  CAvatar,
  CBreadcrumb,
  CBreadcrumbItem,
  CCloseButton,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Checkbox,
  FormControlLabel,
  Typography
} from "@mui/material";
import Box from "@mui/material/Box";
import { formatDate } from "../../../utils/dateUtils";
import React, { useEffect, useState } from "react";
import PasswordStrengthBar from "react-password-strength-bar";
import { useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApproveModal from "../../../Components/Modal/ApproveModal";
import useSelectedRole from "../../../SelectedRole";
import BackArrow from "../../../assets/icons/backArrow.png";
import DragIndicator from "../../../assets/icons/dragIndicator.png";
import MessageIcon from "../../../assets/icons/message-orange.png";
import IconCustomize from "../../../assets/icons/sidebar.png";
import CrossBtn from "../../../assets/icons/x-circle.png";
import RightArrow from "../../../assets/icons/chevron-right-orange.png";
import { base_url } from "../../../global/global";
import {
  useGetPatientByIdQuery,
  useGetWatchListedPatientsQuery,
} from "../../../redux/apis/allPatient_api";
import { useUpdateClinicUserMutation } from "../../../redux/apis/clinic_api";
import { usePostMdNotesMutation } from "../../../redux/apis/md_notes_api";
import { calculatePercentageChange, getDaysInMonthPatientReport, getCurrentWeekPatientReport, getTillDatePatientReport, extractGraphData, extractWeeklyGraphData } from "../../../utils/PercentageHandler";
import EngagementMedicineReport from "../coach/coachPatients/EngagemenetMedicineReport";
import PatientEngagement from "../coach/coachPatients/PatientEngagement";
import EngagementPatientReport from "../coach/coachPatients/EngagementPatientReport";
import Charts from "./Charts";
import MDNotes from "./MDNotes";
import MdNotesCanva from "./MDNotesCanva";
import MonitoringHistory from "./MonitoringHistory";

// Monitoring cards per product. The first key is the large card and is not customisable.
const PAIN_APP_KEYS = ["Pain Score", "Pain", "Sleep", "Mood", "Work Life", "Activity"];
const MIGRAINE_APP_KEYS = ["Migraine Score", "Migraine Days", "Pain", "Sleep", "Mood", "Work Life"];

const MyPatientDetails = () => {
  const navigate = useNavigate();
  const routes = useSelectedRole();
  const location = useLocation();
  const { patient_id } = location.state;
  const patientId = patient_id;
  const actorType = useSelector((state) => state?.user?.userType);
  const providerId = useSelector((state) => state?.user?.id);
  const mdNotesData = useSelector(
    (state) => state?.allPatients?.patient?.patientData?.mdnotes
  );
  const pagination = useSelector(
    (state) => state?.allPatients?.patient?.pagination
  );

  const messageData = useSelector(
    (state) => state?.allPatients?.patient?.patientData
  );
  const [continueTracking, setContinueTracking] = useState(true);
  const [comments, setComments] = useState("");
  const [bottomCanva, setBottomCanva] = useState(false);
  const [mdNotesCanva, setMdNotesCanva] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [title, setTitle] = useState("");
  const [confirmationPopup, setOpenConfirmation] = useState(false);
  const [edit, setEdit] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [activeItems, setActiveItems] = useState([
    "Pain Score",
    "Pain",
    "Sleep",
    "Mood",
    "Work Life",
    "Activity",
  ]);
  const [disabledItems, setDisabledItems] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for Pain Trend / EngagementPatientReport
  const [patientReport, setPatientReport] = useState("weekly");
  const [selectedCategory, setSelectedCategory] = useState("overall");
  const [currentMonthDatePatient, setCurrentMonthDatePatient] = useState(new Date());
  const [currentTillDateMonth, setCurrentTillDateMonth] = useState(new Date());
  const getCurrentWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const start = new Date(today);
    start.setDate(start.getDate() + diff);
    return start;
  };
  const [currentWeekStartPatientReport, setCurrentWeekStartPatientReport] = useState(getCurrentWeekStart());

  const patientCreatedAt = messageData?.createdAt ? new Date(messageData.createdAt) : new Date();
  // const minDate = patientCreatedAt;
  const maxDate = new Date();

  const hasCoachAssigned = !!messageData?.coach;
  // eslint-disable-next-line no-unused-vars
  const { data: patientDatas,
    refetch,
    isLoading: isLoadingPatientData,
  } = useGetPatientByIdQuery({
    id: patientId,
    page: page,
    rowsPerPage: rowsPerPage,
    graphType: "Login_data",
    actorId: providerId,
    actorType: actorType,
    patientInfoTab : "patientInfo",
  });
  // eslint-disable-next-line no-unused-vars
  // const { data } = useGetAllPatientQuery({
  //   filterText: "",
  //   filter: "",
  //   providerId: providerId,
  //   page: page,
  //   rowsPerPage: rowsPerPage,
  //   currentTab: currentTab,
  // });
  const [
    addMDNotes,
    {
      isLoading: loadingMdNotes,
      isError: errorMdNotes,
      isSuccess: addMDNotesSuccess,
    },
  ] = usePostMdNotesMutation();
  const [updateUserRole, { isSuccess: updateUserRoleSuccess }] =
    useUpdateClinicUserMutation();

  // eslint-disable-next-line no-unused-vars
  const { data: watchlistedPatiens, refetch: refechWatchlistedpatient } =
    useGetWatchListedPatientsQuery({ id: providerId }, { skip: !providerId });

  const scores = messageData?.total_pain_score || [];

  const totalPainScore = Number(scores?.[0]?.value ?? 0);

  // Get initial pain score from Redux store
  const initialPainScore = useSelector(
    (state) =>
      state?.allPatients?.patient?.patientData?.initials?.calculated_initial_pain ?? null
  );


  const MAX_COMMENT_LENGTH = 150;

  // For Pain Function Score, compare with initial pain score instead of previous non-zero
  const initialPainScoreNum = initialPainScore !== null ? Number(initialPainScore) : null;
  const percentageChangeTotalPainScore = initialPainScoreNum !== null && initialPainScoreNum > 0
    ? calculatePercentageChange(totalPainScore, initialPainScoreNum)
    : null;


  const moodScore = messageData?.mood_score?.[0]?.value ?? 0;
  const moodScorePrevious = messageData?.mood_score?.[1]?.value ?? 0;
  const percentageChangeMood = calculatePercentageChange(
    moodScore,
    moodScorePrevious
  );

  const sleepScore = messageData?.sleep_score?.[0]?.value ?? 0;
  const sleepScorePrev = messageData?.sleep_score?.[1]?.value ?? 0;
  const percentageChangeSleep = calculatePercentageChange(
    sleepScore,
    sleepScorePrev
  );

  const worklifeScore = messageData?.worklife_score?.[0]?.value ?? 0;
  const worklifescorePrev = messageData?.worklife_score?.[1]?.value ?? 0;
  const percentageChangeWorklife = calculatePercentageChange(
    worklifeScore,
    worklifescorePrev
  );

  const activityScore = messageData?.activity_score?.[0]?.value ?? 0;
  const activityScorePrev = messageData?.activity_score?.[1]?.value ?? 0;
  const percentageActivityScorePrev = calculatePercentageChange(
    activityScore,
    activityScorePrev
  );

  const painScore = messageData?.pain_score?.[0]?.value ?? 0;
  const painScorePrev = messageData?.pain_score?.[1]?.value ?? 0;
  const percentageChangePainScore = calculatePercentageChange(
    painScore,
    painScorePrev
  );

  // Migraine App patients get a different set of monitoring cards and "Migraine Trends".
  const isMigraine =
    /migraine/i.test(messageData?.product || "") ||
    (!messageData?.product && /migraine/i.test(messageData?.diagnosis || ""));
  const productName = messageData?.product || (isMigraine ? "Migraine App" : "Pain App");
  const cardKeys = isMigraine ? MIGRAINE_APP_KEYS : PAIN_APP_KEYS;
  const mainCardKey = cardKeys[0];
  const trendsTitle = isMigraine ? "Migraine Trends" : "Pain Trends";

  const migraineScore = messageData?.migraine_score?.[0]?.value ?? 0;
  const migraineScorePrev = messageData?.migraine_score?.[1]?.value ?? 0;
  const percentageChangeMigraineScore = calculatePercentageChange(migraineScore, migraineScorePrev);

  const migraineDays = messageData?.migraine_days?.[0]?.value ?? 0;
  const migraineDaysPrev = messageData?.migraine_days?.[1]?.value ?? 0;
  const percentageChangeMigraineDays = calculatePercentageChange(migraineDays, migraineDaysPrev);

  //   // 🔹 Total Pain Score
  // const totalPainScore= messageData?.total_pain_score?.[0]?.value ?? 0;
  // const totalPainScorePrevious =
  //   messageData?.total_pain_score?.[messageData.total_pain_score.length - 1]?.value ?? 0;
  // const percentageChangeTotalPainScore = calculatePercentageChange(
  //   totalPainScore,
  //   totalPainScorePrevious
  // );

  // // 🔹 Mood Score
  // const moodScore = messageData?.mood_score?.[0]?.value ?? 0;
  // const moodScorePrevious =
  //   messageData?.mood_score?.[messageData.mood_score.length - 1]?.value ?? 0;
  // const percentageChangeMood = calculatePercentageChange(
  //   moodScore,
  //   moodScorePrevious
  // );

  // // 🔹 Sleep Score
  // const sleepScore = messageData?.sleep_score?.[0]?.value ?? 0;
  // const sleepScorePrev =
  //   messageData?.sleep_score?.[messageData.sleep_score.length - 1]?.value ?? 0;
  // const percentageChangeSleep = calculatePercentageChange(
  //   sleepScore,
  //   sleepScorePrev
  // );

  // // 🔹 Worklife Score
  // const worklifeScore = messageData?.worklife_score?.[0]?.value ?? 0;
  // const worklifescorePrev =
  //   messageData?.worklife_score?.[messageData.worklife_score.length - 1]?.value ?? 0;
  // const percentageChangeWorklife = calculatePercentageChange(
  //   worklifeScore,
  //   worklifescorePrev
  // );

  // // 🔹 Activity Score
  // const activityScore = messageData?.activity_score?.[0]?.value ?? 0;
  // const activityScorePrev =
  //   messageData?.activity_score?.[messageData.activity_score.length - 1]?.value ?? 0;
  // const percentageChangeActivity = calculatePercentageChange(
  //   activityScore,
  //   activityScorePrev
  // );

  // // 🔹 Pain Score
  // const painScore = messageData?.pain_score?.[0]?.value ?? 0;
  // const painScorePrev =
  //   messageData?.pain_score?.[messageData.pain_score.length - 1]?.value ?? 0;
  // const percentageChangePainScore = calculatePercentageChange(
  //   painScore,
  //   painScorePrev
  // );

  // eslint-disable-next-line no-unused-vars

  const handleDisabledItems = (e, items) => {
    e.stopPropagation();
    setActiveItems(activeItems.filter((i) => i !== items));
    setDisabledItems([...disabledItems, items]);
  };

  const handleMoveToActive = (item) => {
    setDisabledItems((prevDisabledItems) =>
      prevDisabledItems.filter((i) => i !== item)
    );
    setActiveItems((prevActiveItems) => [...prevActiveItems, item]);
  };

  const handleOpenOffcanvas = (newTitle) => {

    // if ((newTitle === "Message Coach" || newTitle === "Coach Report Summary") && !hasCoachAssigned) {
    //   return;
    // }

    if (newTitle === "Message Coach") {
      navigate("/messages", { state: { patientId: patientId } });
    }
    setTitle(newTitle);
    setBottomCanva(true);
  };

  const onClosePopup = () => {
    setOpenConfirmation(false);
  };

  useEffect(() => {
    if (page || rowsPerPage) {
      refetch();
    }
  }, [page, rowsPerPage]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  useEffect(() => {
    if (addMDNotesSuccess) {
      setBtnDisable(false);
      setComments("");
      setBottomCanva(false);
      refetch();
    }
    if (errorMdNotes) {
      setBtnDisable(false);
    }
    if (loadingMdNotes) {
      setBtnDisable(true);
    }
  }, [addMDNotesSuccess, loadingMdNotes, errorMdNotes]);

  useEffect(() => {
    if (page > 0 || rowsPerPage) {
      refetch();
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    if (updateUserRoleSuccess && lastAction == "watchlist") {
      setIsOpen(false);
      refetch();
      refechWatchlistedpatient();
      onClosePopup();
      if (messageData?.iswatchlisted === false) {
        toast?.success("Patient added to watchlist successfully!");
      } else if (messageData?.iswatchlisted === true) {
        toast?.success("Patient removed from your watchlist successfully!");
      }
    } else if (updateUserRoleSuccess && lastAction == "customiseCard") {
      setIsOpen(false);
      refetch();
      toast?.success("Patient customise updated successfully!");
    }
  }, [updateUserRoleSuccess]);

  useEffect(() => {
    if (patientId !== null) {
      refetch();
    }
  }, [patientId]);

  useEffect(() => {
    if (messageData) {
      const saved = messageData?.customize_keys || cardKeys;
      // Keys that belong to this product only; if nothing saved matches, show every card.
      const active = saved.filter((item) => cardKeys.includes(item));
      const finalActive = active.length ? active : cardKeys;
      setActiveItems(finalActive);
      setDisabledItems(cardKeys.filter((item) => !finalActive.includes(item)));
    }
  }, [messageData, isMigraine]);

  // Initialize dates for Pain Trend based on patient's createdAt
  useEffect(() => {
    if (messageData?.createdAt) {
      const createdAt = new Date(messageData.createdAt);
      setCurrentTillDateMonth(createdAt);
      setCurrentWeekStartPatientReport(getCurrentWeekStart());
    }
  }, [messageData?.createdAt]);

  const handleOpenConfirmation = () => {
    setOpenConfirmation(true);
  };

  const handleWatchedList = (id) => {
    setLastAction("watchlist");
    let payload = {
      watchlisted: {
        patient_id: id,
        value: messageData?.iswatchlisted === true ? false : true,
        actorId: providerId,
        actorType: actorType,
      },
    };
    updateUserRole({ userId: providerId, updateData: payload });
  };

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const segmentNames = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const matchedRoute = routes.find((route) => route.path === path);

    const routeName = matchedRoute
      ? matchedRoute.name
      : segment.charAt(0).toUpperCase() + segment.slice(1);
    return matchedRoute && matchedRoute.badge ? (
      <>
        {routeName}{" "}
        <Badge eolor="primary" pill>
          {matchedRoute.badge}
        </Badge>
      </>
    ) : (
      routeName
    );
  });

  const handleCommentsChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_COMMENT_LENGTH) {
      setComments(value);
    }
  };

  const handleSubmit = (e, type) => {
    e.preventDefault();

    if (comments.length > MAX_COMMENT_LENGTH) {
      toast.error(`Comments cannot exceed ${MAX_COMMENT_LENGTH} characters`);
      return;
    }

    const taskNameMap = {
      "Continue-Tracking": continueTracking ? "Continue tracking" : "",
    };

    if (taskNameMap[type]) {
      const payload = {
        user_id: patientId,
        task_name: taskNameMap[type],
        description: comments,
        actorId: providerId,
        actorType: actorType,
        shareWithCoach: true,
      };

      addMDNotes(payload);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleSave = () => {
    setLastAction("customiseCard");
    let payload = {
      actorId: providerId,
      actorType: actorType,
      setcustom_keys: activeItems,
    };
    updateUserRole({ userId: patientId, updateData: payload });
  };

  const getScore = (score) => {
    if (score >= 1 && score <= 2) return "Dummy@gmail.com"; //strong
    if (score >= 3 && score <= 5) return "Dummy@gmail"; //good
    if (score >= 6 && score <= 8) return "Dummmyy"; //okay
    if (score >= 9 && score <= 10) return "Dummmy"; //worse
    return 0;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0 min";

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hrs > 0 && mins > 0) {
      return `${hrs} hr ${mins} min`;
    } else if (hrs > 0) {
      return `${hrs} hr`;
    } else {
      return `${mins} min`;
    }
  };

  // const getTotalVideoDuration = (tasks) => {
  //   if (!Array.isArray(tasks)) return 0;

  //   let totalSeconds = 0;

  //   tasks
  //     .filter((task) => task.value === true)
  //     .forEach((task) => {
  //       const durationStr = task.video_duration || "";
  //       const minsMatch = durationStr.match(/(\d+)\s*mins?/i);
  //       const secsMatch = durationStr.match(/(\d+)\s*sec/i);

  //       const minutes = minsMatch ? parseInt(minsMatch[1], 10) : 0;
  //       const seconds = secsMatch ? parseInt(secsMatch[1], 10) : 0;

  //       totalSeconds += minutes * 60 + seconds;
  //     });

  //   return totalSeconds;
  // };

  // Filter and group questionnaire data by questionnaire_name
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

  // Handler functions for Pain Trend / EngagementPatientReport
  const handleClickPatientReport = (type) => {
    setPatientReport(type);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handlePrevMonthPatientReport = () => {
    const newDate = new Date(currentMonthDatePatient.getFullYear(), currentMonthDatePatient.getMonth() - 1, 1);
    setCurrentMonthDatePatient(newDate);
  };

  const handleNextMonthPatientReport = () => {
    const newDate = new Date(currentMonthDatePatient.getFullYear(), currentMonthDatePatient.getMonth() + 1, 1);
    setCurrentMonthDatePatient(newDate);
  };

  const handlePrevFiveMonthPatientReport = () => {
    const newDate = new Date(currentTillDateMonth.getFullYear(), currentTillDateMonth.getMonth() - 1, 1);
    setCurrentTillDateMonth(newDate);
  };

  const handleNextFiveMonthPatientReport = () => {
    const newDate = new Date(currentTillDateMonth.getFullYear(), currentTillDateMonth.getMonth() + 1, 1);
    setCurrentTillDateMonth(newDate);
  };

  const handlePrevWeekPatientReport = () => {
    const newStart = new Date(currentWeekStartPatientReport);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStartPatientReport(newStart);
  };

  const handleNextWeekPatientReport = () => {
    const newStart = new Date(currentWeekStartPatientReport);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStartPatientReport(newStart);
  };

  const getWeeklyRange = (week) => {
    const weekStart = new Date(week);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  // Calculate data for EngagementPatientReport
  const monthData = getDaysInMonthPatientReport(
    currentMonthDatePatient.getFullYear(),
    currentMonthDatePatient.getMonth(),
    messageData?.total_pain_score,
    currentMonthDatePatient
  );
  const weeklyData = getCurrentWeekPatientReport(
    currentMonthDatePatient.getFullYear(),
    messageData?.total_pain_score,
    currentWeekStartPatientReport
  );
  const tillDateData = getTillDatePatientReport(
    messageData,
    maxDate,
    patientCreatedAt,
    selectedCategory
  );
  const dataLine = extractGraphData(messageData, currentMonthDatePatient);
  const dataLineWeekly = extractWeeklyGraphData(messageData, currentWeekStartPatientReport).map((entry, index, array) =>
    index === array.length - 1 ? { ...entry, name: "" } : entry
  );

  return (
    <>
      <div className="main-container mt-3">
        <div>
          <CBreadcrumb>
            {pathSegments.map((segment, index) => {
              const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
              const isLastSegment = index === pathSegments.length - 1;

              return (
                <CBreadcrumbItem key={path} active={isLastSegment}>
                  {isLastSegment ? (
                    segmentNames[index] || segment
                  ) : (
                    <NavLink to={path}>
                      {segmentNames[index] || segment}
                    </NavLink>
                  )}
                </CBreadcrumbItem>
              );
            })}
          </CBreadcrumb>
        </div>
        <div className="d-flex flex-column user-sm-container bg-white flex-md-row align-items-center justify-content-between me-1">
          <div className="d-flex ps-3 py-3">
            <div
              className="pointer px-2"
              onClick={() => {
                navigate(-1);
              }}
            >
              <img
                loading="lazy"
                className=""
                src={BackArrow}
                height={16}
                width={9.6}
              />
            </div>
            <div>
              <div className="d-flex align-items-center">
                <CAvatar
                  textColor="white"
                  className="ms-2"
                  height={30}
                  src={`${base_url + messageData?.profile_img}`}
                ></CAvatar>
              </div>
            </div>
            <div className="profile-name">{` ${messageData?.last_name || ""} ${messageData?.middle_name.charAt(0).toUpperCase() || ""
              } ${messageData?.first_name || ""}`}</div>{" "}
            <span id="divider" className="mx-2" style={{ height: "20px" }}>
              |
            </span>
            <div>
              <img loading="lazy" src={MessageIcon} height={18} width={20} />{" "}
              <span>{messageData?.email}</span>
            </div>
            <div className="px-2">
              | <strong className="font-theme-color">Diagnosis</strong> :{" "}
              {messageData?.diagnosis}
            </div>
            <div className="px-2">
              | <strong className="font-theme-color">Product</strong> :{" "}
              {productName}
            </div>
          </div>
        </div>
        <div className="default-container ps-4 mt-4 bg-white">
          <div>
            <strong className="fs-20">Monitoring</strong>
          </div>
          <div className="row">
            <div className="col-md-12 d-flex justify-content-between p-2">
              <div className="col-md-4">
                <div className="d-flex">
                  <p className="fw-bold mx-2 fs-14">Pain Progress:</p>
                  <PasswordStrengthBar
                    password={getScore(isMigraine ? migraineScore : totalPainScore)}
                    scoreWords={["worse", "worse", "okay", "good", "strong"]}
                    className="custom-password-strength-bar"
                    scoreWordClassName="scoreWord pe-2"
                    shortScoreWord=""
                  />
                </div>
              </div>
              <div>
                <CDropdown
                  visible={isOpen}
                  variant=""
                  direction="dropstart"
                  autoClose="outside"
                  alignment={{ xs: "end", lg: "start" }}
                >
                  <CDropdownToggle size="sm" onClick={() => setIsOpen(!isOpen)}>
                    <img loading="lazy" src={IconCustomize} alt="Customize" />
                    <span className="pointer fs-14 customize-btn">
                      Customise
                    </span>
                  </CDropdownToggle>
                  <CDropdownMenu style={{ width: "230px" }}>
                    <div className="fw-bold fs-16 ps-3 p-2">
                      Customise Cards
                    </div>
                    {activeItems
                      .filter((item) => item !== mainCardKey)
                      .map((item, index) => (
                        <React.Fragment key={index}>
                          <CDropdownItem>
                            <div className="d-flex justify-content-between">
                              <div>
                                <img
                                  loading="lazy"
                                  src={DragIndicator}
                                  className="me-2"
                                  alt="Drag Indicator"
                                />
                                {item}
                              </div>
                              <img
                                loading="lazy"
                                onClick={(e) => handleDisabledItems(e, item)}
                                src={CrossBtn}
                                alt="Cross Icon"
                                width={18}
                              />
                            </div>
                          </CDropdownItem>
                          {index !==
                            activeItems.filter((i) => i !== mainCardKey)
                              .length -
                            1 && <CDropdownDivider />}
                        </React.Fragment>
                      ))}
                    <div>
                      {disabledItems?.length > 0 && (
                        <>
                          <div className="p-2 ms-2 me-2 border-bottom border-secondary mb-2" />
                          <div>
                            {disabledItems?.map((item, index) => (
                              <React.Fragment key={index}>
                                <CDropdownItem
                                  key={index}
                                  className="text-muted"
                                >
                                  <div className="d-flex justify-content-between">
                                    <div>
                                      <img
                                        loading="lazy"
                                        src={DragIndicator}
                                        className="me-2"
                                        alt="Drag Indicator"
                                        onClick={() => handleMoveToActive(item)}
                                      />
                                      {item}
                                    </div>
                                  </div>
                                </CDropdownItem>
                              </React.Fragment>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="row pt-2 my-2">
                      <div className="col-md-12 text-center">
                        <button
                          className="btn btn-cancel-customize"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-save-customize ms-2 text-white"
                          onClick={handleSave}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </CDropdownMenu>
                </CDropdown>
              </div>
            </div>
          </div>
          {isMigraine ? (
            <div className="d-flex flex-wrap justify-content-between gap-3">
              {activeItems.includes("Migraine Score") && (
                <div className="col-12 col-md-3 border-1 p-2 box-1_Chart mb-3">
                  <Charts
                    title="Migraine Score"
                    value={migraineScore}
                    increaseBy={percentageChangeMigraineScore}
                    large
                  />
                </div>
              )}
              <div className="container col-12 col-md">
                <div className="row">
                  {activeItems.includes("Migraine Days") && (
                    <div className="col-12 col-md border-1 p-2 box-2_Chart mb-3">
                      <Charts
                        title="Migraine days this month"
                        value={migraineDays}
                        increaseBy={percentageChangeMigraineDays}
                      />
                    </div>
                  )}
                  {activeItems.includes("Pain") && (
                    <div className="col-12 col-md border-1 p-2 box-2_Chart ms-md-3 mb-3">
                      <Charts
                        title="Pain"
                        value={painScore}
                        increaseBy={percentageChangePainScore}
                      />
                    </div>
                  )}
                </div>
  
                <div className="row text-center">
                  {activeItems.includes("Sleep") && (
                    <div className="col-12 col-md border-1 me-md-2 p-2 box-2_Chart mb-3">
                      <Charts
                        title="Sleep"
                        value={sleepScore}
                        increaseBy={percentageChangeSleep}
                      />
                    </div>
                  )}
                  {activeItems.includes("Mood") && (
                    <div className="col-12 col-md border-1 mx-md-2 p-2 box-2_Chart mb-3">
                      <Charts
                        title="Mood"
                        value={moodScore}
                        increaseBy={percentageChangeMood}
                      />
                    </div>
                  )}
                  {activeItems.includes("Work Life") && (
                    <div className="col-12 col-md border-1 p-2 mx-md-2 box-2_Chart mb-3">
                      <Charts
                        title="Work/Life"
                        value={worklifeScore}
                        increaseBy={percentageChangeWorklife}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
          <div className="d-flex flex-wrap justify-content-between gap-3">
            {activeItems.includes("Pain Score") && (
              <div className="col-12 col-md-3 border-1 p-2 box-1_Chart mb-3">
                <Charts
                  title="Pain Function Score"
                  value={totalPainScore ? totalPainScore : 0}
                  increaseBy={percentageChangeTotalPainScore !== null ? Number(percentageChangeTotalPainScore) : null}
                />
              </div>
            )}
            <div className="container col-12 col-md">
              <div className="row">
                {activeItems.includes("Pain") && (
                  <div className="col-12 col-md border-1 p-2 box-2_Chart mb-3">
                    <Charts
                      title="Pain"
                      value={painScore}
                      increaseBy={percentageChangePainScore}
                    />
                  </div>
                )}
                {activeItems.includes("Sleep") && (
                  <div className="col-12 col-md border-1 p-2 box-2_Chart ms-md-3 mb-3">
                    <Charts
                      title="Sleep"
                      value={sleepScore}
                      increaseBy={percentageChangeSleep}
                    />
                  </div>
                )}
              </div>

              <div className="row text-center">
                {activeItems.includes("Mood") && (
                  <div className="col-12 col-md border-1 me-md-2 p-2 box-2_Chart mb-3">
                    <Charts
                      title="Mood"
                      value={moodScore}
                      increaseBy={percentageChangeMood}
                    />
                  </div>
                )}
                {activeItems.includes("Work Life") && (
                  <div className="col-12 col-md border-1 mx-md-2 p-2 box-2_Chart mb-3">
                    <Charts
                      title="Work Life"
                      value={worklifeScore}
                      increaseBy={percentageChangeWorklife}
                    />
                  </div>
                )}
                {activeItems.includes("Activity") && (
                  <div className="col-12 col-md border-1 p-2 mx-md-2 box-2_Chart mb-3">
                    <Charts
                      title="Activity"
                      value={activityScore}
                      increaseBy={percentageActivityScorePrev}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
        <div className="detail-container mt-2 bg-white">
          <div className="default-container">
            <div className="row gx-0">
              <div
                className="col px-0 my-patiets-tab font-size-16"
                onClick={() => handleOpenOffcanvas("Tracking")}
              >
                <div className="d-flex align-items-center ">
                  <div className="outcome-card-header-cancat"></div>
                  <div className="flex-items-between w-100 px-3">
                    <div className="font-theme-color"> Continue Tracking</div>

                    <div>
                      <img src={RightArrow} alt="RightArrow" />
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col px-0 my-patiets-tab font-size-16"
                onClick={() => handleOpenConfirmation()}
              >
                <div className="d-flex align-items-center ">
                  <div className="outcome-card-header-cancat"></div>
                  <div className="flex-items-between w-100 px-3">
                    <div className="font-theme-color">
                      {messageData?.iswatchlisted == true
                        ? "Remove From WatchList "
                        : "Add To Watchlist"}
                    </div>
                    <div>
                      <img src={RightArrow} alt="RightArrow" />
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col px-0 my-patiets-tab font-size-16"
                onClick={() => handleOpenOffcanvas(trendsTitle)}
              >
                <div className="d-flex align-items-center ">
                  <div className="outcome-card-header-cancat"></div>
                  <div className="flex-items-between w-100 px-3">
                    <div className="font-theme-color">{trendsTitle}</div>
                    <div>
                      <img src={RightArrow} alt="RightArrow" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row gx-0 mt-2">
              {hasCoachAssigned && (
                <div
                  className="col px-0 my-patiets-tab font-size-16"
                  onClick={() => handleOpenOffcanvas("Coach Report Summary")}
                >
                  <div className="d-flex align-items-center ">
                    <div className="outcome-card-header-cancat"></div>
                    <div className="flex-items-between w-100 px-3">
                      <div className="font-theme-color">
                        {" "}
                        Coach Report Summary
                      </div>
                      <div>
                        <img src={RightArrow} alt="RightArrow" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {hasCoachAssigned && (
                <div
                  className="col px-0 my-patiets-tab font-size-16"
                  onClick={() => handleOpenOffcanvas("Message Coach")}
                >
                  <div className="d-flex align-items-center ">
                    <div className="outcome-card-header-cancat"></div>
                    <div className="flex-items-between w-100 px-3">
                      <div className="font-theme-color"> Coach Messages</div>
                      <div>
                        <img src={RightArrow} alt="RightArrow" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div
                className="col px-0 my-patiets-tab font-size-16"
                onClick={() => handleOpenOffcanvas("Report")}
              >
                <div className="d-flex align-items-center ">
                  <div className="outcome-card-header-cancat"></div>
                  <div className="flex-items-between w-100 px-3">
                    <div className="font-theme-color"> Reports</div>
                    <div>
                      <img src={RightArrow} alt="RightArrow" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="">
            <Box className="px-3">
              <Accordion defaultExpanded disableGutters square
                elevation={0}
              >
                <AccordionSummary
                  className="header-reports rounded"
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="revive-content"
                  id="revive-header"
                >
                  <Typography variant="h6" className="fw-bold text-white">
                    MD Notes
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <MDNotes
                    mdNotesData={mdNotesData}
                    refetch={refetch}
                    setMdNotesCanva={setMdNotesCanva}
                    setRowData={setRowData}
                    rowData={rowData}
                    setEdit={setEdit}
                    pagination={pagination}
                    page={page}
                    handleChangePagess={handleChangePage}
                    handleChangeRowsPerPagess={handleChangeRowsPerPage}
                    rowsPerPages={rowsPerPage}
                    isLoadingPatientData={isLoadingPatientData}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion className=" mt-2" disableGutters square elevation={0}>
                <AccordionSummary
                  className="header-reports rounded"
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="revive-content"
                  id="revive-header"
                >
                  <Typography variant="h6" className="fw-bold text-white">
                    Monitoring History
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <MonitoringHistory
                    messageData={messageData}
                    refetch={refetch}
                    msgPagination={pagination}
                    page={page}
                    handleChangePagess={handleChangePage}
                    handleChangeRowsPerPagess={handleChangeRowsPerPage}
                    rowsPerPages={rowsPerPage}
                    isLoadingPatientData={isLoadingPatientData}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </div>
        </div>
      </div>
      <MdNotesCanva
        mdNotesCanva={mdNotesCanva}
        setMdNotesCanva={setMdNotesCanva}
        patientId={patientId}
        refetch={refetch}
        edit={edit}
        mdNotesData={rowData}
        setEdit={setEdit}
        onclose={() => setMdNotesCanva(false)}
      />
      <>
        <COffcanvas
          className="ps-3  pt-3 default_offcanvas_add bg-white"
          backdrop="static"
          placement="bottom"
          visible={bottomCanva}
          style={{ height: "auto" }}
          onHide={() => setBottomCanva(false)}
        >
          {title === "Migraine Trends" && (
            // Drag handle shown at the top of the sheet in the Figma design.
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "64px",
                height: "8px",
                borderRadius: "24px",
                backgroundColor: "#D6D8E7",
              }}
            />
          )}
          <COffcanvasHeader>
            <COffcanvasTitle className="">{title}</COffcanvasTitle>
            <CCloseButton
              className="text-reset modal-close-cross me-3"
              onClick={() => {
                setBottomCanva(false);
                setComments("");
              }}
            />
          </COffcanvasHeader>
          <div
            style={{ borderBottom: "1px solid #F5F5F5", marginBottom: "1px" }}
          ></div>

          <COffcanvasBody>
            {title === "Tracking" ? (
              <div>
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={continueTracking}
                        onChange={(e) => setContinueTracking(e.target.checked)}
                      />
                    }
                    label="Continue tracking"
                  />
                </div>
                {continueTracking === true ? (
                  <div>
                    <textarea
                      className="form-control px-3 py3 mt-4"
                      aria-label="minimum height"
                      rows={3}
                      placeholder="Enter your comments here"
                      value={comments}
                      onChange={handleCommentsChange}
                      maxLength={MAX_COMMENT_LENGTH}
                    />
                    <div className={`form-text text-end ${comments.length >= MAX_COMMENT_LENGTH ? "text-danger" : "text-muted"}`}>
                      {comments.length}/{MAX_COMMENT_LENGTH} characters
                    </div>
                  </div>
                ) : null}
                <div className="col-md-12 mt-4">
                  <div className="row pt-2">
                    <div className="col-md-12 text-end">
                      <button
                        type="submit"
                        className="btn btn-save ms-2 text-white fw-bold"
                        onClick={(e) => {
                          handleSubmit(e, "Continue-Tracking");
                          setComments("");
                        }}
                        disabled={btnDisable === true}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : title === "Pain Trends" || title === "Migraine Trends" ? (
              <>
                <EngagementPatientReport
                  patientReport={patientReport}
                  handleClickPatientReport={handleClickPatientReport}
                  providerReportGraph={false}
                  monthData={monthData}
                  weeklyData={weeklyData}
                  tillDateData={tillDateData}
                  dataLine={dataLine}
                  dataLineWeekly={dataLineWeekly}
                  handlePrevMonthPatientReport={handlePrevMonthPatientReport}
                  handleNextMonthPatientReport={handleNextMonthPatientReport}
                  handlePrevFiveMonthPatientReport={handlePrevFiveMonthPatientReport}
                  handleNextFiveMonthPatientReport={handleNextFiveMonthPatientReport}
                  handleNextWeekPatientReport={handleNextWeekPatientReport}
                  handlePrevWeekPatientReport={handlePrevWeekPatientReport}
                  handleCategoryClick={handleCategoryClick}
                  selectedCategory={selectedCategory}
                  currentMonthDatePatient={currentMonthDatePatient}
                  currentWeekStartPatientReport={currentWeekStartPatientReport}
                  getWeeklyRange={getWeeklyRange}
                  maxDate={maxDate}
                  patientCreatedAt={patientCreatedAt}
                  showMigraineDays={title === "Migraine Trends"}
                />
              </>
            ) : title === "Coach Report Summary" ? (
              <div className="mb-5 pb-4">
                <p>
                  <strong>Date :-</strong>{" "}
                  <span>
                    {messageData?.coach_to_mdreport?.[0]?.created_on
                      ? formatDate(
                        messageData.coach_to_mdreport[0].created_on,
                        "MM/dd/yyyy"
                      )
                      : "N/A"}
                  </span>
                </p>

                <p>
                  <strong>Comment :-</strong>{" "}
                  {messageData?.coach_to_mdreport[0]?.description}
                </p>
              </div>
            ) : title === "Report" ? (
              <div className="text-left">
                {isLoadingPatientData ? (
                  <div className="text-center fs-18 py-4">Loading...</div>
                ) : (
                  <>
                    {/* Outcomes Accordion */}
                    <Accordion
                      defaultExpanded={false}
                      className="rounded-1 accordion-spacing"
                    >
                      <AccordionSummary
                        className="header-reports"
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="outcomes-content"
                        id="outcomes-header"
                      >
                        <Typography variant="h6" className="fw-bold text-white">
                          Outcomes
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div className="report-layout d-flex  mt-2">
                          <div className="outcome-card-header-cancat-orange"></div>
                          <div className="main-outcome-div">
                            <div className="outcome-card-title">
                              <div>Outcome Forms Reviewed</div>{" "}
                            </div>

                            <div className="fw-bold text-black me-3">
                              {getUniqueQuestionnaireNames().length}
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Questionnaire Cards */}
                        <div className="row mt-3">
                          {getUniqueQuestionnaireNames().length > 0
                            ? getUniqueQuestionnaireNames().map((questionnaireName) => (
                              <div key={questionnaireName} className="col-md-6 mb-3">
                                <div className="outcome-card">
                                  <div className="outcome-card-header">
                                    <div className="d-flex py-3">
                                      <div className="outcome-card-header-cancat"></div>
                                      <h6 className="outcome-card-title ms-4">
                                        {questionnaireName}
                                      </h6>
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
                                            <div key={index} className="outcome-value-item">
                                              <div className="outcome-number">{score}</div>
                                              <div className="outcome-date">
                                                {formatDate(item.date, "M/dd/yyyy")}
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                            : null}
                        </div>
                      </AccordionDetails>
                    </Accordion>

                    {/* Medicine Details Accordion */}
                    <Accordion
                      defaultExpanded={false}
                      className="rounded-1 accordion-spacing"
                    >
                      <AccordionSummary
                        className="header-reports"
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="medicine-content"
                        id="medicine-header"
                      >
                        <Typography variant="h6" className="fw-bold text-white">
                          Medicine Details
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <EngagementMedicineReport patientData={messageData} />
                      </AccordionDetails>
                    </Accordion>

                    {/* Engagement Reports Accordion */}
                    <Accordion
                      expanded={true} // Force always expanded
                      className="rounded-1 accordion-spacing"
                    >
                      <AccordionSummary
                        className="header-reports"
                        aria-controls="engagement-content"
                        id="engagement-header"
                        // Remove click handler to prevent collapsing
                        onClick={(e) => e.preventDefault()}
                        style={{ cursor: "default" }} // Remove pointer cursor
                      >
                        <Typography variant="h6" className="fw-bold text-white">
                          Engagement Reports
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <PatientEngagement
                          patientId={patientId}
                          providerReportGraph={true}
                        />
                      </AccordionDetails>
                    </Accordion>

                    {/* Revive Engagement Accordion */}
                    <Accordion
                      defaultExpanded
                      expanded={true}
                      className="rounded-1 accordion-spacing"
                    >
                      <AccordionSummary
                        className="header-reports rounded"
                        aria-controls="revive-content"
                        id="revive-header"
                      >
                        <Typography variant="h6" className="fw-bold text-white">
                          Revive Engagement
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div className="d-flex flex-wrap">
                          <div className="report-layout d-flex align-items-center mt-2 me-4">
                            <div className="outcome-card-header-cancat-orange me-2"></div>
                            <div className="main-outcome-div">
                              <span className="text-secondary">
                                Monitoring Time
                              </span>
                              <span className="fw-bold text-black ms-2">
                                {" "}
                                {formatTime(
                                  messageData?.session_ids?.reduce(
                                    (sum, billing) =>
                                      sum +
                                      (billing?.sessions?.reduce(
                                        (sessionSum, session) =>
                                          sessionSum +
                                          (session?.total_time || 0),
                                        0
                                      ) || 0),
                                    0
                                  )
                                )}
                              </span>
                            </div>
                          </div>
                          

                          <div className="report-layout d-flex align-items-center mt-2 me-4">
                            <div className="outcome-card-header-cancat-orange me-2"></div>
                            <div className="main-outcome-div">
                              <span className="text-secondary">
                                Internal Messaging{" "}
                              </span>
                              <span className="fw-bold text-black ms-2">
                                {messageData?.messageCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </>
                )}
              </div>
            ) : (
              ""
            )}
          </COffcanvasBody>
        </COffcanvas>
      </>
      <ApproveModal
        approveModal={confirmationPopup}
        content={
          messageData?.iswatchlisted === true
            ? "Do you want to remove this from watchlist?"
            : "Do you want to add this to watchlist?"
        }
        onClose={onClosePopup}
        selectedRowId={patientId}
        onConfirm={handleWatchedList}
        messageData={messageData}
        watchList={"true"}
      />
    </>
  );
};

export default MyPatientDetails;
