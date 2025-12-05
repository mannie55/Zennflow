import { useState } from "react";

const usePomodoroState = () => {
  const [mode, setMode] = useState("focus"); // "focus" | "break"
  const [focusDuration, setFocusDuration] = useState(25); // in seconds
  const [breakDuration, setBreakDuration] = useState(5);
  const [totalFocus, setTotalFocus] = useState(0);

  const focusDurationInSeconds = focusDuration * 60;
  const breakDurationInSeconds = breakDuration * 60;

  const getNextDuration = () => {
    return mode === "focus" ? focusDurationInSeconds : breakDurationInSeconds;
  };

  const switchMode = () => {
    if (mode === "focus") {
      setTotalFocus((prev) => prev + focusDurationInSeconds);
      setMode("break");
    } else {
      setMode("focus");
    }
  };

  return {
    mode,
    focusDuration,
    breakDuration,
    totalFocus,
    setFocusDuration,
    setBreakDuration,
    getNextDuration,
    switchMode,
  };
};

export default usePomodoroState;
