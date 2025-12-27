import React, { useState, useRef, useEffect } from "react";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { useDeleteTask } from "../hooks/useDeleteTask";

const TaskItem = ({
  task,
  isEditing,
  isMenuOpen,
  onEditClick,
  onMenuToggle,
  onCancelEdit,
}) => {
  const [editedDescription, setEditedDescription] = useState(task.description);
  const editInputRef = useRef(null);
  const menuRef = useRef(null);

  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  // Focus the input when editing mode is activated
  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

  // If the task description changes from props, update the local state
  useEffect(() => {
    setEditedDescription(task.description);
  }, [task.description]);

  const handleCheck = () => {
    const isCompleting = !task.completed;
    updateTask({
      id: task.id,
      updates: {
        completed: isCompleting,
        completedAt: isCompleting ? new Date().toISOString() : null,
      },
    });
  };

  const handleDescriptionChange = (e) => {
    setEditedDescription(e.target.value);
  };

  const handleUpdate = (e) => {
    if (e.key === "Enter") {
      if (
        editedDescription.trim() !== "" &&
        editedDescription.trim() !== task.description
      ) {
        updateTask({
          id: task.id,
          updates: { description: editedDescription.trim() },
        });
      }
      onCancelEdit();
    }
    if (e.key === "Escape") {
      setEditedDescription(task.description); // Revert changes before cancelling
      onCancelEdit();
    }
  };

  const handleBlur = () => {
    if (
      editedDescription.trim() !== "" &&
      editedDescription.trim() !== task.description
    ) {
      updateTask({
        id: task.id,
        updates: { description: editedDescription.trim() },
      });
    }
    onCancelEdit();
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <li
      data-task-id={task.id}
      className="flex justify-between items-center list-none p-2 my-1 w-full h-12 group relative rounded-md hover:bg-gray-50"
    >
      <div className="flex items-center w-full">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleCheck}
          className="mr-3 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />

        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editedDescription}
            onChange={handleDescriptionChange}
            onKeyDown={handleUpdate}
            onBlur={handleBlur}
            className="border-b border-gray-300 outline-none bg-transparent w-full"
          />
        ) : (
          <>
            <span
              onDoubleClick={onEditClick}
              className={`cursor-pointer ${
                task.completed ? "line-through opacity-50" : ""
              }`}
            >
              {task.description}
            </span>
            {!task.synced && (
              <span className="text-xs text-gray-400 italic ml-2">
                (unsynced)
              </span>
            )}
          </>
        )}
      </div>

      <div className="relative">
        <button
          onClick={onMenuToggle}
          className="flex justify-center items-center font-bold text-gray-500 hover:bg-gray-200 pb-2 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ...
        </button>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute text-left right-0 top-10 bg-white shadow-md rounded-md w-32 pt-1 z-20 border border-gray-100"
          >
            <button
              onClick={onEditClick}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-md"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

export default TaskItem;
