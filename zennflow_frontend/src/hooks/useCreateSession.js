import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SyncService } from "../services/SyncService";

const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSession) => SyncService.enqueue("CREATE_SESSION", newSession),
    onMutate: async (newSession) => {
      await queryClient.cancelQueries({ queryKey: ["sessions"] });

      const previousSessions = queryClient.getQueryData(["sessions"]);

      queryClient.setQueryData(["sessions"], (old) => [...old, newSession]);

      return { previousSessions };
    },
    onError: (err, newSession, context) => {
      queryClient.setQueryData(["sessions"], context.previousSessions);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};

export default useCreateSession;
