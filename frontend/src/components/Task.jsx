import { useState, useEffect, useRef } from "react";
import TaskForm from "./TaskForm.jsx";
import TaskList from "./TaskList.jsx";

const Task = () => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("tasks"); // 'tasks', 'done', 'inbox'
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [menuOpenTaskId, setMenuOpenTaskId] = useState(null);
  const taskRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (taskRef.current && !taskRef.current.contains(event.target)) {
        if (menuOpenTaskId) {
          setMenuOpenTaskId(null);
        } else if (editingTaskId) {
          setEditingTaskId(null);
        } else {
          setOpen(false);
        }
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, menuOpenTaskId, editingTaskId]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div
          ref={taskRef}
          className="absolute bottom-10 right-0 w-96 bg-white shadow-lg rounded-xl border border-gray-200 p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <select
                value={view}
                onChange={(e) => setView(e.target.value)}
                className="font-semibold bg-transparent"
              >
                <option value="tasks">Tasks</option>
                <option value="done">Done</option>
                <option value="inbox">Inbox</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <TaskForm />
            <div className="max-h-[400px] overflow-y-auto">
              <TaskList
                view={view}
                editingTaskId={editingTaskId}
                setEditingTaskId={setEditingTaskId}
                menuOpenTaskId={menuOpenTaskId}
                setMenuOpenTaskId={setMenuOpenTaskId}
              />
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-900 text-white px-3 py-3 rounded-md shadow-md"
      >
        tasks
      </button>
    </div>
  );
};

export default Task;
