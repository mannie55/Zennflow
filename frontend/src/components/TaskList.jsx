import { useEffect, useRef, useMemo } from "react";
import { useGetTasks } from "../hooks/useGetTasks";
import TaskItem from "./TaskItem";

const TaskList = ({
  view,
  editingTaskId,
  setEditingTaskId,
  menuOpenTaskId,
  setMenuOpenTaskId,
}) => {
  const { data: tasks, isLoading, isError } = useGetTasks();
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuOpenTaskId && !editingTaskId) {
        return;
      }

      const clickedOnTaskId = event.target.closest("[data-task-id]")?.dataset
        .taskId;

      if (menuOpenTaskId && clickedOnTaskId !== menuOpenTaskId) {
        setMenuOpenTaskId(null);
      }

      if (editingTaskId && clickedOnTaskId !== editingTaskId) {
        setEditingTaskId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpenTaskId, editingTaskId, setMenuOpenTaskId, setEditingTaskId]);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    const today = new Date().toISOString().split("T")[0];

    switch (view) {
      case "done":
        return tasks.filter(
          (task) =>
            task.completed &&
            task.completedAt &&
            task.completedAt.split("T")[0] === today
        );
      case "inbox":
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return tasks.filter(
          (task) =>
            !task.completed &&
            task.createdAt &&
            new Date(task.createdAt) < sevenDaysAgo
        );
      case "tasks":
      default:
        return tasks.filter((task) => !task.completed);
    }
  }, [tasks, view]);

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 mt-4">Loading tasks...</div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 mt-4">Error fetching tasks.</div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto" ref={listRef}>
      {filteredTasks && filteredTasks.length > 0 ? (
        <ul className="mt-4">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isEditing={editingTaskId === task.id}
              isMenuOpen={menuOpenTaskId === task.id}
              onEditClick={() => {
                setEditingTaskId(task.id);
                setMenuOpenTaskId(null);
              }}
              onMenuToggle={() =>
                setMenuOpenTaskId(menuOpenTaskId === task.id ? null : task.id)
              }
              onCancelEdit={() => setEditingTaskId(null)}
            />
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 mt-4">No tasks yet.</div>
      )}
    </div>
  );
};

export default TaskList;
