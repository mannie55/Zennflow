import { useState, useEffect } from "react";

const useTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds

  const start = (seconds) => {
    setTimeLeft(seconds);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const play = () => {
    setIsRunning(true);
  };
  const reset = (seconds) => {
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
