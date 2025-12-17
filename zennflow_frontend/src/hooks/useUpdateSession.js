import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SyncService } from "../services/SyncService";

const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedSession) =>
      SyncService.enqueue("UPDATE_SESSION", updatedSession),
    onMutate: async (updatedSession) => {
      await queryClient.cancelQueries({ queryKey: ["sessions"] });

      const previousSessions = queryClient.getQueryData(["sessions"]);

      queryClient.setQueryData(["sessions"], (old) =>
        old.map((session) =>
          session.id === updatedSession.id ? updatedSession : session
        )
      );

      return { previousSessions };
    },
    onError: (err, updatedSession, context) => {
      queryClient.setQueryData(["sessions"], context.previousSessions);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};

export default useUpdateSession;
