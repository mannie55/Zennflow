import { useState, useEffect } from "react";
import taskService from "../services/tasks";

/**
 * useTasks - hook for task editing and optimistic updates
 *
 * Provides local editing state and handlers for deleting, toggling
 * completion, and updating task titles. This hook expects the parent
 * component to manage the tasks array and its setter.
 *
 * Parameters
 * @param {Object} inputRef - React ref pointing to the editable input element.
 *   When `editingId` changes the hook will focus the input and move the
 *   cursor to the end.
 * @param {Array<Object>} tasks - Current array of task objects.
 *   Each task object should include at least `{ id, title, completed }`.
 * @param {Function} setTasks - State setter for the tasks array (from useState).
 *
 * Returns
 * @returns {Object} - An object containing:
 *   - `editingId` (number|null): id of the task currently being edited
 *   - `setEditingId` (fn): setter to change the editing id
 *   - `editValue` (string): current edit string for the input
 *   - `setEditValue` (fn): setter for editValue
 *   - `handleDelete` (async fn): deletes a task by id and updates state
 *   - `handleTaskCheck` (async fn): toggles a task's `completed` state
 *   - `handleUpdate` (async fn): submits or cancels an edit using keyboard events
 *
 * Notes
 * - All server interactions use `taskService` and are performed asynchronously.
 * - The hook performs optimistic UI updates by updating local state after
 *   successful responses from the service.
 * - `handleUpdate` listens for `Enter` and `Escape` keys on the edit input.
 *
 * Example
 * const inputRef = useRef(null)
 * const { editingId, setEditingId, editValue, setEditValue, handleDelete } =
 *   useTasks(inputRef, tasks, setTasks)
 */

const useTasks = (inputRef, tasks, setTasks) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      const input = inputRef.current;
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
    }
  }, [editingId]);

  const handleDelete = async (id) => {
    console.log("id of task", id);

    const task = tasks.find((t) => t.id === id);

    try {
      await taskService.remove(task);
      setTasks(tasks.filter((t) => t.id !== task.id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleTaskCheck = async (id) => {
    const task = tasks.find((task) => task.id === id);
    console.log(task);
    const newObject = {
      ...task,
      completed: !task.completed,
    };
    try {
      const response = await taskService.update(newObject);
      setTasks(tasks.map((t) => (t.id !== response.id ? t : response)));
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = async (e, id) => {
    if (e.key === "Enter") {
      //submit update
      const task = tasks.find((t) => t.id === id);
      const updated = { ...task, title: editValue };

      try {
        const data = await taskService.update(updated);
        setTasks(tasks.map((t) => (t.id === data.id ? data : t)));
      } catch (error) {
        console.log(error);
      }

      setEditingId(null);
    }

    if (e.key === "Escape") {
      //cancel edit
      setEditingId(null);
    }
  };

  return {
    editingId,
    setEditingId,
    editValue,
    setEditValue,
    handleDelete,
    handleTaskCheck,
    handleUpdate,
  };
};

export default useTasks;
