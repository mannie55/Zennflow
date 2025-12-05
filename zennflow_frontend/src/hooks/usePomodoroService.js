import { useEffect, useRef, useState } from "react";
import sessionService from "../services/sessions";

const useSession = ({ isRunning, mode, focusDuration }) => {
  const [session, setSession] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const previousModeRef = useRef(mode);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessions = await sessionService.getAll();
        setAllSessions(sessions);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    };
  });

  // create a session when a focus period starts
  useEffect(() => {
    if (!isRunning) return;
    if (mode !== "focus") return;
    if (session) return;

    const createSession = async () => {
      const payload = {
        sessionTask: null,
        duration: focusDuration,
        startTime: new Date().toISOString(),
        endTime: null,
        focusedTime: 0,
        completed: false,
      };
      try {
        const res = await sessionService.create(payload);
        setSession(res);
      } catch (err) {
        console.error("Failed to create session:", err);
      }
    };

    createSession();
  }, [isRunning, mode, focusDuration, session]);

  useEffect(() => {
    const previousMode = previousModeRef.current;

    //detect mode switch from focus to break
    if (previousMode === "focus" && mode === "break" && session) {
      const updateSession = async () => {
        try {
          const payload = {
            ...session,
            endTime: new Date().toISOString(),
            focusedTime: focusDuration,
            completed: true,
          };

          const updated = await sessionService.update(session.id, payload);
          setSession(updated);
        } catch (err) {
          console.error("Failed to update session:", err);
        }
      };
      updateSession();
    }
    previousModeRef.current = mode;
  }, [mode, session, focusDuration]);

  return { session, allSessions };
};

export default useSession;
