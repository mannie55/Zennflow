import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SyncService } from "../services/SyncService";

const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deletedTask) => SyncService.enqueue("DELETE_TASK", deletedTask),
    onMutate: async (deletedTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old) =>
        old.filter((task) => task.id !== deletedTask.id)
      );
      return { previousTasks };
    },
    onError: (err, deletedTask, context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export default useDeleteTask;
