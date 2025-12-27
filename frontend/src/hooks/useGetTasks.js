import { useQuery } from "@tanstack/react-query";
import taskService from "../services/taskService";

/**
 * Custom hook to fetch tasks from local storage using TanStack Query.
 * It uses the query key ['tasks'] to cache the data.
 */
export const useGetTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: taskService.getAllTasks,
  });
};
