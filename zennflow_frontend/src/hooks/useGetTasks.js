import { useQuery } from "@tanstack/react-query";
import tasksService from "../services/tasks";

const useGetTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: tasksService.getAll,
  });
};

export default useGetTasks;
