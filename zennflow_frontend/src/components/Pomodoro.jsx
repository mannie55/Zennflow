import { useEffect, useState } from "react";
import TimerCircle from "./TimerCircle";
import usePomodoro from "../hooks/usePomodoro";

const Pomodoro = () => {
  const [inputValue, setInputValue] = useState(25);
  const {
    mode,
    timeLeft,
    isRunning,
    totalFocus,
    begin,
    pause,
    play,
    reset,
    setFocusDuration,
    setBreakDuration,
    focusDuration,
    breakDuration,
  } = usePomodoro();

  // initialize local input when focusDuration changes (keeps UI in sync)
  useEffect(() => {
    setInputValue(focusDuration);
  }, [focusDuration]);

  const commitFocus = (value) => {
    const minutes = Math.max(1, Math.floor(Number(value) || 0)); // clamp to 1+
    setFocusDuration(minutes); // use minutes (usePomodoroState stores minutes)
    setInputValue(minutes);
    // if timer is not running, reflect change in the displayed timer
    if (!isRunning) {
      reset(minutes * 60);
    }
  };

  const handleInputChange = (e) => {
    // allow temporary empty input for user editing
    const v = e.target.value;
    if (/^\d*$/.test(v)) {
      setInputValue(v === "" ? "" : Number(v));
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      commitFocus(inputValue);
    } else if (e.key === "Escape") {
      // revert to current focusDuration
      setInputValue(focusDuration);
    }
  };

  const duration = mode === "focus" ? focusDuration * 60 : breakDuration * 60;
  const progress = timeLeft / duration;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h2 className="text-xl font-semibold mb-4">Pomodoro</h2>
      <div>
        <label>
          Focus (minutes)
          <input
            type="text"
            name="focus time"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={() => commitFocus(inputValue)}
            className="w-16 ml-2 border rounded px-2"
          />
        </label>
      </div>

      <div className="mb-4">
        <TimerCircle progress={progress} />
      </div>

      <h1>
        {minutes}:{seconds.toString().padStart(2, 0)}
      </h1>

      {!isRunning ? (
        <button
          onClick={begin}
          className="bg-green-500 text-white px-8 py-2 rounded"
        >
          Play
        </button>
      ) : (
        <button
          onClick={pause}
          className="bg-red-600 text-white px-8 py-2 rounded"
        >
          pause
        </button>
      )}
    </div>
  );
};

export default Pomodoro;
