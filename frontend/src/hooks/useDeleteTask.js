import { useMutation, useQueryClient } from "@tanstack/react-query";
import taskService from "../services/taskService";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      // Invalidate and refetch the tasks query to reflect the deletion
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
    },
  });
};