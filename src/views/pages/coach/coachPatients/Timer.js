import { FaPlay, FaPause, FaClock } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  useStartSessionMutation,
  usePauseSessionMutation
} from "../../../../redux/apis/billing_api";
import { useEffect, useState, useRef } from "react";
import { setPausePlay } from "../../../../redux/reducers/coachReducer";
// Guard against double auto-starts (e.g., React StrictMode remounts)
// Use a timestamp map so quick remounts do not trigger a second start
const startedSessions = new Map(); // key => lastStartMs

const Timer = ({ sessionId, patientId, coachId, setInCoachPatient }) => {
  const { isLoading, error } = useSelector((state) => state.billing || {});
  const [startSessionMutation] = useStartSessionMutation();
  const [pauseSessionMutation] = usePauseSessionMutation();
  const [cumulativeTimeSent, setCumulativeTimeSent] = useState(0);

  const timerRef = useRef(null);
  const [time, setTime] = useState(0);
  const dispatch = useDispatch();
  const [isRunning, setIsRunning] = useState(false);
  const hasFetched = useRef(false);
  const isUnmounting = useRef(false);
  const initialSessionStarted = useRef(false);

  // Reset timer when sessionId or patientId changes
  useEffect(() => {
    setTime(0);
    setCumulativeTimeSent(0);
    setIsRunning(false);
    hasFetched.current = false;
    initialSessionStarted.current = false;
    clearInterval(timerRef.current);
  }, [sessionId, patientId]);

  useEffect(() => {
    dispatch(setInCoachPatient(true));
    return () => {
      if (!isUnmounting.current) {
        dispatch(setInCoachPatient(false));
        if (sessionId && patientId && isRunning) {
          pauseSessionMutation({
            session_id: sessionId,
            patient_id: patientId,
            coach_id: coachId,
            time
          });
        }
      }
    };
  }, [dispatch, sessionId, patientId, pauseSessionMutation, isRunning, coachId]);

  const startSession = async () => {
    try {
      if (initialSessionStarted.current) return; // Prevent multiple calls
      initialSessionStarted.current = true;

      const response = await startSessionMutation({
        session_id: sessionId,
        patient_id: patientId,
        coach_id: coachId,
      });

      if (response.error) {
        if (response.error?.data?.message?.includes("Session already started") ||
          response.error?.data?.error?.includes("No matching document found")) {
          // Session is already running or has issues, just start the timer locally
          setIsRunning(true);
          return;
        }
        console.error("Failed to start session:", response.error);
        return;
      }

      setIsRunning(true);
    } catch (error) {
      console.error("Failed to start session:", error.message);
      // Even if there's an error, start the timer locally
      setIsRunning(true);
    }
  };

  // Only start session automatically on component mount for new sessions
  useEffect(() => {
    if (!sessionId || !patientId) return;

    const startKey = `${sessionId}:${patientId}`;
    const now = Date.now();
    const lastStart = startedSessions.get(startKey) || 0;
    const cooldownMs = 1500; // allow re-entry after 1.5s, block strict-mode double start

    if (!hasFetched.current && now - lastStart > cooldownMs) {
      hasFetched.current = true;
      startedSessions.set(startKey, now);
      startSession();
    }

    // Clear guard after cooldown so a genuine re-entry can trigger again
    const clearTimer = setTimeout(() => {
      // Only clear if the recorded timestamp is the same (no newer start occurred)
      if (startedSessions.get(startKey) === now) {
        startedSessions.delete(startKey);
      }
    }, cooldownMs);

    return () => clearTimeout(clearTimer);
  }, [sessionId, patientId]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handlePlay = async () => {
    if (isRunning) return; // Already running, no need to start again

    dispatch(setPausePlay(true));

    // Only call the API if we haven't started the session yet
    if (!initialSessionStarted.current) {
      await startSession();
    } else {
      // If session was already started, just resume the timer locally
      setIsRunning(true);
    }
  };

  const sessionDelta = time - cumulativeTimeSent;
  const togglePlayPause = async (e) => {
    e.preventDefault();
    isUnmounting.current = true;

    if (isRunning) {
      // Pause the session
      dispatch(setPausePlay(false));
      setIsRunning(false);

      // Only send pause request to API if session was successfully started
      if (initialSessionStarted.current) {
        try {
          await pauseSessionMutation({
            session_id: sessionId,
            patient_id: patientId,
            coach_id: coachId,
            time: sessionDelta
          });
          setCumulativeTimeSent(time);
        } catch (error) {
          console.error("Failed to pause session:", error.message);
        }
      }
    } else {
      // Play/resume the session
      await handlePlay();
    }
    isUnmounting.current = false;
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds === undefined) return "00:00:00";

    const hours = Math.floor(timeInSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((timeInSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // Don't render timer if no valid session ID
  if (!sessionId) {
    return null;
  }

  return (
    <div>
      <div
        style={{
          border: "1px solid red",
          padding: "5px",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "3px",
        }}
      >
        <FaClock size={15} color="red" className="mx-1" />
        <span style={{ color: "red" }}>{formatTime(time)}</span>
        <button
          onClick={togglePlayPause}
          style={{ border: "none", borderRadius: "5px", background: "white" }}
          disabled={isLoading}
        >
          {isRunning ? (
            <FaPause size={15} color="orange" />
          ) : (
            <FaPlay size={15} color="green" />
          )}
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default Timer;