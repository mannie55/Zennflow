import { useState, useEffect } from "react";

const usePomodoroState = () => {
  const [mode, setMode] = useState(
    () => localStorage.getItem("zennflow_mode") || "focus"
  );
  const [focusDuration, setFocusDuration] = useState(
    () => parseInt(localStorage.getItem("zennflow_focus_duration")) || 25
  );
  const [breakDuration, setBreakDuration] = useState(
    () => parseInt(localStorage.getItem("zennflow_break_duration")) || 5
  );
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

  // Persist settings
  useEffect(() => {
    localStorage.setItem("zennflow_mode", mode);
    localStorage.setItem("zennflow_focus_duration", focusDuration);
    localStorage.setItem("zennflow_break_duration", breakDuration);
  }, [mode, focusDuration, breakDuration]);

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
