import { useState, useEffect } from "react";
import useUpdateTask from "./useUpdateTask";
import useDeleteTask from "./useDeleteTask";

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
 * - All server interactions use mutation hooks.
 * - The hook performs optimistic UI updates by updating local state after
 *   successful responses from the service.
 * - `handleUpdate` listens for `Enter` and `Escape` keys on the edit input.
 *
 * Example
 * const inputRef = useRef(null)
 * const { editingId, setEditingId, editValue, setEditValue, handleDelete } =
 *   useTasks(inputRef)
 */

const useTasks = (inputRef) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      const input = inputRef.current;
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
    }
  }, [editingId]);

  const handleDelete = async (task) => {
    deleteTask.mutate(task);
  };

  const handleTaskCheck = async (task) => {
    const newObject = {
      ...task,
      completed: !task.completed,
    };
    updateTask.mutate(newObject);
  };

  const handleUpdate = async (e, task) => {
    if (e.key === "Enter") {
      //submit update
      const updated = { ...task, title: editValue };
      updateTask.mutate(updated);
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
