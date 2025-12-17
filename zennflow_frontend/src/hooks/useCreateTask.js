import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SyncService } from "../services/SyncService";

const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTask) => SyncService.enqueue("CREATE_TASK", newTask),
    // When mutate is called:
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(["tasks"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["tasks"], (old) => [...old, newTask]);

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTask, context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export default useCreateTask;
