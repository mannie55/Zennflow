import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SyncService } from "../services/SyncService";

const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedTask) => SyncService.enqueue("UPDATE_TASK", updatedTask),
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old) =>
        old.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      return { previousTasks };
    },
    onError: (err, updatedTask, context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export default useUpdateTask;
