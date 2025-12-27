import React from "react";
import { useSyncStatus } from "../context/SyncStatusContext";

const SyncStatusIndicator = () => {
  const { status } = useSyncStatus();

  // Simple text-based indicator. Could be enhanced with icons.
  let indicatorText = "";
  let indicatorColor = "";

  switch (status) {
    case "Offline":
      indicatorText = "Offline";
      indicatorColor = "text-gray-500";
      break;
    case "Syncing":
      indicatorText = "Syncing...";
      indicatorColor = "text-blue-500";
      break;
    case "Up to Date":
      indicatorText = "Up to Date";
      indicatorColor = "text-green-500";
      break;
    default:
      indicatorText = "";
  }

  if (!indicatorText) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`text-sm font-semibold ${indicatorColor}`}>
        {indicatorText}
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
