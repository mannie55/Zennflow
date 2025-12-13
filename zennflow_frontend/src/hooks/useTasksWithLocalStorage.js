import { useEffect, useState } from "react";
import taskService from "../services/tasks";

/**
 * useTasksWithLocalStorage - tasks with localStorage fallback
 *
 * Fetches tasks from DB on mount. On create/update/delete, saves to
 * localStorage first (instant), then syncs to DB. If DB sync fails,
 * keeps the task in localStorage and retries periodically.
 *
 * Returns
 * @returns {Object} - { tasks, setTasks, syncStatus }
 *   - `tasks` (Array): current tasks (from localStorage or DB)
 *   - `setTasks` (fn): update tasks locally
 *   - `syncStatus` (string): "synced" | "pending" | "error"
 */
const useTasksWithLocalStorage = () => {
  const [tasks, setTasks] = useState([]);
  const [syncStatus, setSyncStatus] = useState("synced");
  const STORAGE_KEY = "zennflow_tasks";
  const PENDING_KEY = "zennflow_pending_tasks";

  // load from localStorage on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // try to fetch from DB first
        const dbTasks = await taskService.getAll();
        setTasks(dbTasks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbTasks));
        setSyncStatus("synced");
      } catch (err) {
        console.warn("DB fetch failed, loading from localStorage", err);
        // fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setTasks(JSON.parse(stored));
        }
        setSyncStatus("error");
      }
    };

    loadTasks();
  }, []);

  // sync pending tasks to DB periodically (every 5 seconds)
  useEffect(() => {
    const syncPending = async () => {
      const pending = localStorage.getItem(PENDING_KEY);
      if (!pending) return;

      const pendingTasks = JSON.parse(pending);
      if (pendingTasks.length === 0) return;

      setSyncStatus("pending");

      for (const task of pendingTasks) {
        try {
          if (task._operation === "create") {
            const { _operation, ...payload } = task;
            const response = await taskService.create(payload);
            // replace local task with DB response (gets real id)
            setTasks((prev) =>
              prev.map((t) => (t._tempId === task._tempId ? response : t))
            );
          } else if (task._operation === "update") {
            const { _operation, ...payload } = task;
            const response = await taskService.update(payload);
            setTasks((prev) =>
              prev.map((t) => (t.id === response.id ? response : t))
            );
          } else if (task._operation === "delete") {
            await taskService.remove(task);
            setTasks((prev) => prev.filter((t) => t.id !== task.id));
          }
        } catch (err) {
          console.error("Sync failed for task", task.id, err);
          // keep in pending and retry
          return;
        }
      }

      // all synced, clear pending
      localStorage.removeItem(PENDING_KEY);
      setSyncStatus("synced");
    };

    const id = setInterval(syncPending, 5000); // sync every 5s
    return () => clearInterval(id);
  }, []);

  // wrapper to save to localStorage and queue for sync
  const addPendingTask = (task, operation) => {
    const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    pending.push({ ...task, _operation: operation });
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  };

  return { tasks, setTasks, syncStatus, addPendingTask };
};

export default useTasksWithLocalStorage;