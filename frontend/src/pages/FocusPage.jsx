import { useState } from "react";
import { usePomodoro } from "../hooks/usePomodoro";
import { useGetTasks } from "../hooks/useGetTasks";
import { useGetSessions } from "../hooks/useGetSessions";
import { useQueryClient } from "@tanstack/react-query";

const FocusPage = () => {
  const {
    timeLeft,
    isActive,
    isPaused,
    duration,
    selectedTaskId,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = usePomodoro();

  const { data: tasks = [] } = useGetTasks();
  const { data: sessions = [], isLoading: loadingSessions } = useGetSessions();
  const queryClient = useQueryClient();

  const [sessionLength, setSessionLength] = useState(25); // minutes
  const [activeTab, setActiveTab] = useState("focus"); // "focus", "short", "long"
  const [localTaskId, setLocalTaskId] = useState("");

  // Format time display (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // SVG circular progress calculation
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = duration > 0 ? (duration - timeLeft) / duration : 0;
  const strokeDashoffset = circumference - progressPercentage * circumference;

  const handleStart = async () => {
    const totalSeconds = sessionLength * 60;
    const taskIdToUse = localTaskId || selectedTaskId || null;
    await startTimer(totalSeconds, taskIdToUse);
    // Invalidate sessions query to update tracking
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  const handlePause = async () => {
    await pauseTimer();
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  const handleResume = async () => {
    await resumeTimer();
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  const handleReset = async () => {
    await resetTimer();
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  const selectPresetMode = (mode, minutes) => {
    if (isActive) return; // Prevent changing preset during active timer
    setActiveTab(mode);
    setSessionLength(minutes);
  };

  // Find currently active task description
  const activeTask = tasks.find((t) => t.id === (selectedTaskId || localTaskId));

  return (
    <div className="min-h-[85vh] bg-transparent text-gray-100 font-sans p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Left Column: Timer & Controls */}
      <div className="md:col-span-2 flex flex-col items-center justify-center bg-[#1e1e1e] border border-gray-800 rounded-2xl p-8 shadow-lg backdrop-blur-md">
        
        {/* Presets */}
        <div className="flex bg-[#121212] border border-gray-800 rounded-xl p-1 mb-8 w-full max-w-sm">
          <button
            disabled={isActive}
            onClick={() => selectPresetMode("focus", 25)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "focus"
                ? "bg-teal-500 text-white"
                : "text-gray-400 hover:text-gray-200 disabled:opacity-50"
            }`}
          >
            Focus (25m)
          </button>
          <button
            disabled={isActive}
            onClick={() => selectPresetMode("short", 5)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "short"
                ? "bg-teal-500 text-white"
                : "text-gray-400 hover:text-gray-200 disabled:opacity-50"
            }`}
          >
            Short Break (5m)
          </button>
          <button
            disabled={isActive}
            onClick={() => selectPresetMode("long", 15)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "long"
                ? "bg-teal-500 text-white"
                : "text-gray-400 hover:text-gray-200 disabled:opacity-50"
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Visual Clock with Circle Progress */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r={radius}
              className="stroke-gray-800 fill-none"
              strokeWidth="8"
            />
            <circle
              cx="128"
              cy="128"
              r={radius}
              className="stroke-teal-500 fill-none transition-all duration-300"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-bold tracking-wider">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs uppercase tracking-widest text-gray-500 mt-2 font-bold">
              {isActive ? (isPaused ? "Paused" : "Flowing") : "Ready"}
            </span>
          </div>
        </div>

        {/* Task Selection Selector */}
        <div className="w-full max-w-sm mb-8">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Associate with Task
          </label>
          <select
            disabled={isActive}
            value={selectedTaskId || localTaskId}
            onChange={(e) => setLocalTaskId(e.target.value)}
            className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none focus:border-teal-500 transition-colors disabled:opacity-60"
          >
            <option value="">No specific task (General focus)</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.description.length > 40
                  ? `${task.description.substring(0, 40)}...`
                  : task.description}
              </option>
            ))}
          </select>
          {activeTask && isActive && (
            <p className="text-teal-400 text-xs mt-2 italic font-semibold">
              Currently focusing on: "{activeTask.description}"
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex gap-4 w-full max-w-sm">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
            >
              Start Session
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={handleResume}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Pause
                </button>
              )}
              <button
                onClick={handleReset}
                className="flex-1 bg-red-950/40 border border-red-800 hover:bg-red-900/40 text-red-300 font-bold py-3 px-6 rounded-xl transition-all"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Focus History Stats */}
      <div className="flex flex-col bg-[#1e1e1e] border border-gray-800 rounded-2xl p-6 shadow-lg backdrop-blur-md h-[85vh]">
        <h2 className="text-xl font-bold tracking-tight mb-4 text-teal-400 border-b border-gray-800 pb-3">
          Session History
        </h2>

        {loadingSessions ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Loading focus log...
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm text-center px-4">
            No focus sessions logged. Start a timer to see your stats.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {sessions.map((session) => {
              const date = new Date(session.startTime).toLocaleDateString();
              const time = new Date(session.startTime).toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              });
              const minsFocused = Math.round(session.focusedTime / 60000);
              const durationMins = Math.round(session.duration / 60000);

              return (
                <div
                  key={session.id}
                  className="bg-[#121212] border border-gray-800/80 rounded-xl p-4 text-xs space-y-2 hover:border-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-center text-gray-400">
                    <span>
                      {date} @ {time}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full ${
                        session.completed
                          ? "bg-teal-950/50 text-teal-300 border border-teal-800/30"
                          : "bg-red-950/40 text-red-300 border border-red-800/20"
                      }`}
                    >
                      {session.completed ? "Completed" : "Interrupted"}
                    </span>
                  </div>

                  {session.task ? (
                    <div className="text-gray-200 font-medium">
                      🎯 {session.task.description}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">General focus session</div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-gray-800/50 text-gray-400">
                    <span>Focused:</span>
                    <span className="font-semibold text-gray-200">
                      {minsFocused} / {durationMins} min
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Daily Summary Card */}
        <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 mt-4 text-center">
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
            Completed Today
          </div>
          <div className="text-3xl font-extrabold text-teal-400 font-mono">
            {sessions.filter((s) => s.completed && new Date(s.startTime).toDateString() === new Date().toDateString()).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusPage;
