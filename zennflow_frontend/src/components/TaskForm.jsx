import { useState } from "react";
import useCreateTask from "../hooks/useCreateTask";

const TaskForm = () => {
  const [title, setTitle] = useState("");
  const createTask = useCreateTask();

  const addTask = (event) => {
    event.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: crypto.randomUUID(), // Generate a unique ID
      title: title,
      description: null,
      completed: false,
    };

    createTask.mutate(newTask);
    setTitle("");
  };

  return (
    <form onSubmit={addTask}>
      <input
        className="w-full border-gray-100 pt-2 text-sm outline-none"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add a task..."
        maxLength={50}
      />
    </form>
  );
};

export default TaskForm;

