import { useEffect } from "react";
import useTimer from "./useTimer";
import useSession from "./usePomodoroService";
import usePomodoroState from "./usePomodoroState";

const usePomodoro = () => {
  const {
    mode,
    focusDuration,
    breakDuration,
    totalFocus,
    getNextDuration,
    switchMode,
    setFocusDuration,
    setBreakDuration,
  } = usePomodoroState();

  const { timeLeft, isRunning, start, play, pause, reset } = useTimer();
  const session = useSession({ isRunning, mode, focusDuration });
  //start the first cycle
  const begin = () => {
    if (timeLeft === 0) start(getNextDuration());
    play();
  };

  //when timeLeft reaches 0, switch mode and start next cycle
  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft > 0) return;

    switchMode();

    //start next cycle
    start(getNextDuration());
  }, [timeLeft, isRunning]);

  return {
    mode,
    timeLeft,
    isRunning,
    totalFocus,
    begin,
    play,
    pause,
    reset,

    //for updating durations
    setFocusDuration,
    setBreakDuration,
    focusDuration,
    breakDuration,
  };
};

export default usePomodoro;
