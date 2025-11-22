import { useEffect, useState } from "react";
import taskService from "../services/tasks";

const useFetchTasks = () => {
    const [tasks, setTasks] = useState([])

    useEffect(() => {
        const fetchTasks = async () => {
            const response = await taskService.getAll()
            setTasks(response)
        }

        fetchTasks()
    }, [])

    return { tasks, setTasks }
}

export default useFetchTasks