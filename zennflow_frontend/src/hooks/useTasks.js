import { useState, useEffect, useRef } from 'react'
import taskService from '../services/tasks'


const useTasks = (inputRef, tasks, setTasks) => {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        if (editingId !== null && inputRef.current) {
            const input = inputRef.current;
            input.focus();
            input.selectionStart = input.selectionEnd = input.value.length;
        }
    }, [editingId]);

    const handleDelete = async (id) => {
        console.log("id of task", id);

        const task = tasks.find((t) => t.id === id);

        try {
            await taskService.remove(task);
            setTasks(tasks.filter((t) => t.id !== task.id));
        } catch (error) {
            console.log(error);
        }
    };

    const handleTaskCheck = async (id) => {
        const task = tasks.find((task) => task.id === id);
        console.log(task);
        const newObject = {
            ...task,
            completed: !task.completed,
        };
        try {
            const data = await taskService.update(newObject);
            setTasks(tasks.map((t) => (t.id !== data.id ? t : data)));
        } catch (error) {
            console.log(error);
        }
    };


    const handleUpdate = async (e, id) => {
        if (e.key === "Enter") {
            //submit update
            const task = tasks.find((t) => t.id === id);
            const updated = { ...task, title: editValue };

            try {
                const data = await taskService.update(updated);
                setTasks(tasks.map((t) => (t.id === data.id ? data : t)));
            } catch (error) {
                console.log(error);
            }

            setEditingId(null);
        }

        if (e.key === "Escape") {
            //cancel edit
            setEditingId(null);
        }
    };


    return {
        editingId,
        setEditingId,
        editValue,
        setEditValue,
        handleDelete,
        handleTaskCheck,
        handleUpdate
    }
}

export default useTasks