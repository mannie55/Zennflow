import { useEffect, useState } from "react";
import taskService from "../services/tasks";

/**
 * useFetchTasks - fetches tasks from backend on mount
 *
 * A small convenience hook that loads tasks from `taskService.getAll()`
 * when the component mounts and exposes `tasks` and `setTasks`.
 *
 * Returns
 * @returns {Object} - { tasks, setTasks }
 *   - `tasks` (Array): array of task objects fetched from the service
 *   - `setTasks` (fn): setter to update tasks locally
 *
 * Notes
 * - This hook performs the fetch only once on mount (empty dependency array).
 * - It intentionally leaves `setTasks` exposed so consuming components can
 *   update the list (for example when creating or deleting tasks).
 *
 * Example
 * const { tasks, setTasks } = useFetchTasks()
 */

const useFetchTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await taskService.getAll();
      setTasks(response);
    };

    fetchTasks();
  }, []);

  return { tasks, setTasks };
};

export default useFetchTasks;
