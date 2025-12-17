import { useQuery } from "@tanstack/react-query";
import sessionService from "../services/sessions";

const useGetSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: sessionService.getAll,
  });
};

export default useGetSessions;
