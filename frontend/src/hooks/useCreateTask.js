import { useMutation, useQueryClient } from "@tanstack/react-query";
import taskService from "../services/taskService";

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      // Invalidate and refetch the tasks query to show the new task
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      // It's good practice to handle potential errors, even with local storage.
      console.error("Error creating task:", error);
    },
  });
};
