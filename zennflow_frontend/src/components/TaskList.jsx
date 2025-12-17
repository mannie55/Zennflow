import { useState, useRef, useEffect } from "react";
import useTasks from "../hooks/useTasks";
import useGetTasks from "../hooks/useGetTasks";

/* 
menuOpen - for the three dot dropdown
taskId - to show the dots only on hover
editingId - to switch between text view and input field
editValue - to update task title
menuRef - points to the dropdown dom node
inputRef - points to the input when editing
*/

const TaskList = () => {
  const [menuOpen, setMenuOpen] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const menuRef = useRef();
  const inputRef = useRef(null);

  const { data: tasks, isLoading, isError } = useGetTasks();

  const {
    editingId,
    setEditingId,
    editValue,
    setEditValue,
    handleDelete,
    handleTaskCheck,
    handleUpdate,
  } = useTasks(inputRef);

  const enterEditMode = (task) => {
    setEditingId(task.id);
    setEditValue(task.title);
    setMenuOpen(null);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (isError) {
    return <div>Error fetching tasks.</div>;
  }

  return (
    <div>
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex justify-between items-center list-none p-0 m-3 w-full h-8 group relative"
          onMouseEnter={() => setTaskId(task.id)}
          onMouseLeave={() => setTaskId(null)}
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleTaskCheck(task)}
              className="mr-2"
            />

            {editingId === task.id ? (
              <input
                ref={inputRef}
                className="m-2 border-b border-gray-300 outline-none bg-transparent w-full"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => handleUpdate(e, task)}
              />
            ) : (
              <div className="m-2">
                <span
                  onDoubleClick={() => enterEditMode(task)}
                  className={`block cursor-text ${
                    task.completed ? "line-through opacity-50" : ""
                  }`}
                >
                  {task.title}
                </span>

                {task.title ? (
                  <p
                    onDoubleClick={() => enterEditMode(task)}
                    className="text-sm text-gray-500 cursor-text"
                  ></p>
                ) : null}
              </div>
            )}
          </div>

          {taskId === task.id && editingId === null && (
            <button
              onClick={() => setMenuOpen(task.id)}
              className="flex justify-center items-center font-bold hover:bg-gray-50 pb-2 mr-3 w-8 h-8 rounded-full"
            >
              ...
            </button>
          )}

          {menuOpen === task.id && (
            <div
              ref={menuRef}
              className="absolute text-left right-10 top-8 bg-white shadow-md rounded-md w-32 pt-2 z-20"
            >
              <button
                onClick={() => handleDelete(task)}
                className="block w-full text-left px-2 py-2 hover:bg-gray-200 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => enterEditMode(task)}
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
