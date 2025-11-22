import { useState, useRef, useEffect } from "react";
import useTasks from "../hooks/useTasks";

/* 
menuOpen - for the three dot dropdown
taskId - to show the dots only on hover
editingId - to switch between text view and input field
editValue - to update task title
menuRef - points to the dropdown dom node
inputRef - points to the input when editing
*/

const TaskList = ({ tasks, setTasks }) => {
  const [menuOpen, setMenuOpen] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const menuRef = useRef();
  const inputRef = useRef(null);
  const {
    editingId,
    setEditingId,
    editValue,
    setEditValue,
    handleDelete,
    handleTaskCheck,
    handleUpdate,
  } = useTasks(inputRef, tasks, setTasks);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div>
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex justify-between items-center list-none p-0 m-3 w-full h-8 group"
          onMouseEnter={() => setTaskId(task.id)}
          onMouseLeave={() => setTaskId(null)}
        >
          <div>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleTaskCheck(task.id)}
            />
            {editingId === task.id ? (
              <input
                ref={inputRef}
                className="m-2 border-b border-gray-300 outline-none"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => handleUpdate(e, task.id)}
              />
            ) : (
              <span
                className={`m-2 ${
                  task.completed ? "line-through opacity-50" : ""
                }`}
              >
                {task.title}
              </span>
            )}
          </div>
          {taskId === task.id && (
            <button
              onClick={() => setMenuOpen(task.id)}
              className="flex justify-center items-center font-bold hover:bg-gray-50 pb-2 mr-3 w-8 h-8 rounded-full"
            >
              <span className="text-center">...</span>
            </button>
          )}
          {menuOpen === task.id && (
            <div
              ref={menuRef}
              className="absolute text-left right-10 top-8 bg-white shadow-md rounded-md w-32 pt-2 z-20"
            >
              <button
                onClick={() => handleDelete(task.id)}
                className="block w-full text-left px-2 py-2 hover:bg-gray-200 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setEditingId(task.id);
                  setEditValue(task.title);
                  setMenuOpen(null);
                }}
                className="block w-full text-left px-2 py-1 hover:bg-gray-200 rounded"
              >
                Edit
              </button>
            </div>
          )}
        </li>
      ))}
    </div>
  );
};

export default TaskList;
