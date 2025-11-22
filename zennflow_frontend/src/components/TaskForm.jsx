import { useState } from "react";
import taskService from "../services/tasks";

const TaskForm = ({ tasks, setTasks }) => {
  const [title, setTitle] = useState("");

  const addTask = async (event) => {
    event.preventDefault();
    const object = {
      title: title,
      description: null,
      completed: false,
    };

    try {
      const response = await taskService.create(object);
      setTasks((prev) => [...prev, response]);

      console.log(response);
      console.log(tasks);

      setTitle("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={addTask}>
      <input
        className="w-full border-gray-100 pt-2 text-sm outline-none"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add task desc..."
        maxLength={30}
      />
    </form>
  );
};

export default TaskForm;
