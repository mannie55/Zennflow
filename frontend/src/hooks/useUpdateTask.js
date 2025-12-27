import { useMutation, useQueryClient } from "@tanstack/react-query";
import taskService from "../services/taskService";

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => taskService.updateTask(id, updates),
    onSuccess: () => {
      // Invalidate and refetch the tasks query to show the updates
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Error updating task:", error);
    },
  });
};
