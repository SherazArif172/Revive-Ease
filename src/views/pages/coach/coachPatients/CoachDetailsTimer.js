import React, { useState, useRef } from "react";
import { FaPlay, FaPause, FaStop, FaClock } from "react-icons/fa";

const Timer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const handlePlayPause = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, "0");
    const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

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
          onClick={handlePlayPause}
          style={{
            border: "none",
            borderRadius: "5px",
            background: "white",
          }}
        >
          {isRunning ? (
            <FaPause size={15} color="orange" />
          ) : (
            <FaPlay size={15} color="green" />
          )}
        </button>
        <button
          onClick={handleStop}
          style={{
            border: "none",
            borderRadius: "5px",
            background: "white",
          }}
        >
          <FaStop size={15} color="red" />
        </button>
      </div>
    </div>
  );
};

export default Timer;