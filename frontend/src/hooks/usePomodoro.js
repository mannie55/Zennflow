import { useState, useEffect, useRef, useCallback } from "react";
import sessionApi from "../apiService/session";

const DEFAULT_DURATION = 25 * 60; // 25 minutes in seconds

export const usePomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  const timerIntervalRef = useRef(null);

  // Sync state from storage
  const syncFromStorage = useCallback(() => {
    chrome.storage.local.get(["pomodoroState"], (result) => {
      const state = result.pomodoroState;
      if (state) {
        setIsActive(state.isActive || false);
        setIsPaused(state.isPaused || false);
        setDuration(state.duration || DEFAULT_DURATION);
        setSelectedTaskId(state.selectedTaskId || null);
        setCurrentSessionId(state.currentSessionId || null);

        if (state.isActive && !state.isPaused) {
          const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
          const remaining = Math.max(0, state.duration - elapsed);
          setTimeLeft(remaining);
        } else if (state.isPaused) {
          setTimeLeft(state.pausedTimeLeft);
        } else {
          setTimeLeft(state.duration || DEFAULT_DURATION);
        }
      } else {
        // Initialize default state
        setTimeLeft(DEFAULT_DURATION);
        setIsActive(false);
        setIsPaused(false);
        setDuration(DEFAULT_DURATION);
        setSelectedTaskId(null);
        setCurrentSessionId(null);
      }
    });
  }, []);

  // Sync state on load and register listener
  useEffect(() => {
    syncFromStorage();

    const handleStorageChange = (changes, namespace) => {
      if (namespace === "local" && changes.pomodoroState) {
        syncFromStorage();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [syncFromStorage]);

  // Handle active countdown
  useEffect(() => {
    if (isActive && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        chrome.storage.local.get(["pomodoroState"], (result) => {
          const state = result.pomodoroState;
          if (state && state.isActive && !state.isPaused) {
            const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
            const remaining = Math.max(0, state.duration - elapsed);
            
            setTimeLeft(remaining);

            if (remaining <= 0) {
              clearInterval(timerIntervalRef.current);
              handleTimerComplete(state);
            }
          }
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  // Handles completion
  const handleTimerComplete = async (currentState) => {
    // 1. Play sound or show alert
    try {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "logo.png",
        title: "Time's up!",
        message: "Great job! Your focus session is complete. Take a short break.",
      });
    } catch (e) {
      console.warn("Could not fire system notification:", e);
    }

    // 2. Update backend session
    if (currentState.currentSessionId) {
      try {
        await sessionApi.updateSession(currentState.currentSessionId, {
          focusedTime: currentState.duration * 1000,
          completed: true,
        });
      } catch (err) {
        console.error("Failed to update completed session on backend:", err);
      }
    }

    // 3. Clear pomodoro state in storage
    const newState = {
      isActive: false,
      isPaused: false,
      duration: currentState.duration,
      timeLeft: currentState.duration,
      currentSessionId: null,
      selectedTaskId: null,
    };
    chrome.storage.local.set({ pomodoroState: newState });
  };

  // Start the focus session
  const startTimer = async (durationInSeconds, taskId) => {
    let sessionId = null;
    
    // 1. Create a session on the backend
    try {
      const createdSession = await sessionApi.startSession({
        duration: durationInSeconds * 1000,
        taskId: taskId || undefined,
      });
      sessionId = createdSession.id;
    } catch (err) {
      console.error("Failed to start session on backend:", err);
    }

    // 2. Set storage state
    const state = {
      isActive: true,
      isPaused: false,
      startTime: Date.now(),
      duration: durationInSeconds,
      currentSessionId: sessionId,
      selectedTaskId: taskId || null,
    };

    await chrome.storage.local.set({ pomodoroState: state });
  };

  // Pause the timer
  const pauseTimer = async () => {
    chrome.storage.local.get(["pomodoroState"], async (result) => {
      const state = result.pomodoroState;
      if (state && state.isActive && !state.isPaused) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const remaining = Math.max(0, state.duration - elapsed);

        // Update backend with currently focused time
        if (state.currentSessionId) {
          try {
            await sessionApi.updateSession(state.currentSessionId, {
              focusedTime: elapsed * 1000,
              completed: false,
            });
          } catch (err) {
            console.error("Failed to update paused session on backend:", err);
          }
        }

        const updatedState = {
          ...state,
          isPaused: true,
          pausedTimeLeft: remaining,
          focusedAccrued: (state.focusedAccrued || 0) + elapsed,
        };

        await chrome.storage.local.set({ pomodoroState: updatedState });
      }
    });
  };

  // Resume the timer
  const resumeTimer = async () => {
    chrome.storage.local.get(["pomodoroState"], async (result) => {
      const state = result.pomodoroState;
      if (state && state.isActive && state.isPaused) {
        let newSessionId = state.currentSessionId;

        // If the backend session was updated/closed on pause, start a new session segment
        try {
          const createdSession = await sessionApi.startSession({
            duration: state.pausedTimeLeft * 1000,
            taskId: state.selectedTaskId || undefined,
          });
          newSessionId = createdSession.id;
        } catch (err) {
          console.error("Failed to start new session segment on backend:", err);
        }

        const updatedState = {
          ...state,
          isPaused: false,
          startTime: Date.now(),
          duration: state.pausedTimeLeft,
          currentSessionId: newSessionId,
        };

        await chrome.storage.local.set({ pomodoroState: updatedState });
      }
    });
  };

  // Reset/Cancel the timer early
  const resetTimer = async () => {
    chrome.storage.local.get(["pomodoroState"], async (result) => {
      const state = result.pomodoroState;
      if (state) {
        let elapsed = 0;
        if (state.isActive && !state.isPaused) {
          elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        }
        const totalFocused = (state.focusedAccrued || 0) + elapsed;

        // Update backend with final focused time
        if (state.currentSessionId && totalFocused > 0) {
          try {
            await sessionApi.updateSession(state.currentSessionId, {
              focusedTime: totalFocused * 1000,
              completed: false,
            });
          } catch (err) {
            console.error("Failed to update reset session on backend:", err);
          }
        }

        const clearedState = {
          isActive: false,
          isPaused: false,
          duration: state.duration || DEFAULT_DURATION,
          timeLeft: state.duration || DEFAULT_DURATION,
          currentSessionId: null,
          selectedTaskId: null,
        };

        await chrome.storage.local.set({ pomodoroState: clearedState });
      }
    });
  };

  return {
    timeLeft,
    isActive,
    isPaused,
    duration,
    selectedTaskId,
    currentSessionId,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  };
};
