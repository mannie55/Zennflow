import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import taskService from "../services/taskService";

const SyncStatusContext = createContext();

export const useSyncStatus = () => {
  return useContext(SyncStatusContext);
};

export const SyncStatusProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Listen to online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Query tasks to check for unsynced items
  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskService.getAllTasks,
    // Refetch on a schedule to check for sync status changes from background
    refetchInterval: 5000, 
  });

  const hasUnsyncedTasks = tasks?.some(task => !task.synced);

  let status = "Up to Date";
  if (!isOnline) {
    status = "Offline";
  } else if (hasUnsyncedTasks) {
    status = "Syncing";
  }

  const value = {
    status,
    isOnline,
    hasUnsyncedTasks,
  };

  return (
    <SyncStatusContext.Provider value={value}>
      {children}
    </SyncStatusContext.Provider>
  );
};
