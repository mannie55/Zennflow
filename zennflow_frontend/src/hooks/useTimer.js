import { useState, useEffect } from "react";

const useTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds

  // Sync with background script on mount and periodically
  useEffect(() => {
    const syncState = () => {
      chrome.storage.local.get(["timerStatus", "endTime"], (result) => {
        if (result.timerStatus === "running" && result.endTime) {
          const remaining = Math.ceil((result.endTime - Date.now()) / 1000);
          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsRunning(true);
          } else {
            setTimeLeft(0);
            // If time is up but status is running, we wait for background to finish
            // or let the consuming component handle the switch.
            setIsRunning(true);
          }
        } else {
          setIsRunning(false);
          if (result.timerStatus === "finished") {
            setTimeLeft(0);
          }
        }
      });
    };

    syncState();
    const interval = setInterval(syncState, 1000);

    return () => clearInterval(interval);
  }, []);

  const start = (seconds) => {
    const minutes = seconds / 60;
    chrome.runtime.sendMessage({ action: "START_TIMER", minutes });
    setTimeLeft(seconds);
    setIsRunning(true);
  };

  const pause = () => {
    // Background currently treats stop/pause the same (clears alarm)
    chrome.runtime.sendMessage({ action: "STOP_TIMER" });
    setIsRunning(false);
  };

  const play = () => {
    setIsRunning(true);
    // Resume logic would go here, but requires background support.
    // For now, relies on 'start' being called with duration.
  };

  const reset = (seconds) => {
    chrome.runtime.sendMessage({ action: "STOP_TIMER" });
    setTimeLeft(seconds);
    setIsRunning(false);
  };

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, timeLeft]);

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    play,
    reset,
  };
};

export default useTimer;
