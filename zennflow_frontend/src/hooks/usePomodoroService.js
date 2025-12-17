import { useEffect, useRef, useState } from "react";
import useGetSessions from "./useGetSessions";
import useCreateSession from "./useCreateSession";
import useUpdateSession from "./useUpdateSession";

const useSession = ({ isRunning, mode, focusDuration }) => {
  const [session, setSession] = useState(null);
  const previousModeRef = useRef(mode);

  const { data: allSessions } = useGetSessions();
  const createSessionMutation = useCreateSession();
  const updateSessionMutation = useUpdateSession();

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
        const res = await createSessionMutation.mutateAsync(payload);
        setSession(res);
      } catch (err) {
        console.error("Failed to create session:", err);
      }
    };

    createSession();
  }, [isRunning, mode, focusDuration, session, createSessionMutation]);

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

          const updated = await updateSessionMutation.mutateAsync(payload);
          setSession(updated);
        } catch (err) {
          console.error("Failed to update session:", err);
        }
      };
      updateSession();
    }
    previousModeRef.current = mode;
  }, [mode, session, focusDuration, updateSessionMutation]);

  return { session, allSessions };
};

export default useSession;
