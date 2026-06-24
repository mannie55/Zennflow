import { useQuery } from "@tanstack/react-query";
import sessionApi from "../apiService/session";

/**
 * Custom hook to fetch focus sessions from the backend using TanStack Query.
 */
export const useGetSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: sessionApi.getAllSessions,
    refetchInterval: 30000, // Refetch history every 30 seconds
  });
};
