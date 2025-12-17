import { useState } from "react";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";

const Task = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="absolute bottom-10 right-0 w-96 bg-white shadow-lg rounded-xl border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">New Tasks</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 text-sm"
            >
              x
            </button>
          </div>

          <div className="space-y-2">
            <TaskForm />
            <TaskList />
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-900 text-white px-3 py-2 rounded-md shadow-md"
      >
        tasks
      </button>
    </div>
  );
};

export default Task;

