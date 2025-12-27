import { useState } from "react";
import { useCreateTask } from "../hooks/useCreateTask";

const TaskForm = () => {
  const [description, setDescription] = useState("");
  const { mutate: addTaskMutation } = useCreateTask();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    // The taskService will add id, createdAt, updatedAt, and synced status
    const taskData = {
      description: description.trim(),
      completed: false,
    };

    addTaskMutation(taskData);
    setDescription(""); // Clear input after submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        className="w-full border-gray-100 pt-2 text-sm outline-none"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add new task"
        maxLength={100}
      />
    </form>
  );
};

export default TaskForm;
