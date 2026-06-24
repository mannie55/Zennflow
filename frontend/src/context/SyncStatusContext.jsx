import React, { createContext, useContext, useState, useEffect } from "react";

const SyncStatusContext = createContext();

export const useSyncStatus = () => {
  return useContext(SyncStatusContext);
};

export const SyncStatusProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasUnsyncedTasks, setHasUnsyncedTasks] = useState(false);

  // Listen to online/offline events and storage changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check for unsynced tasks (checks all tasks including soft-deleted ones)
    chrome.storage.local.get({ tasks: [] }, (result) => {
      const unsynced = result.tasks.some((task) => !task.synced);
      setHasUnsyncedTasks(unsynced);
    });

    // Reactive listener for storage changes
    const handleStorageChange = (changes, namespace) => {
      if (namespace === "local" && changes.tasks) {
        const unsynced =
          changes.tasks.newValue?.some((task) => !task.synced) || false;
        setHasUnsyncedTasks(unsynced);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

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
