import { useState } from "react";
import taskService from "../services/tasks";

const TaskForm = ({ tasks, setTasks, addPendingTask }) => {
  const [title, setTitle] = useState("");

  const addTask = async (event) => {
    event.preventDefault();

    const tempId = Math.random().toString(36);
    const object = {
      _tempId: tempId,
      title: title,
      description: null,
      completed: false,
    };

    // 1. save to localStorage immediately
    const updatedTasks = [...tasks, object];
    setTasks(updatedTasks);
    localStorage.setItem("zennflow_tasks", JSON.stringify(updatedTasks));
    addPendingTask(object, "create");

    // 2. try to save to DB (non-blocking)
    try {
      const response = await taskService.create(object);
      // replace temp task with DB response (has real id)
      setTasks((prev) =>
        prev.map((t) => (t._tempId === tempId ? response : t))
      );
      // remove from pending since DB sync succeeded
      const pending = JSON.parse(
        localStorage.getItem("zennflow_pending_tasks") || "[]"
      );
      localStorage.setItem(
        "zennflow_pending_tasks",
        JSON.stringify(pending.filter((t) => t._tempId !== tempId))
      );
    } catch (error) {
      console.log("DB save failed, task queued for sync", error);
      // task stays in localStorage and pending queue
    }

    setTitle("");
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
