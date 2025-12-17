import { SyncService } from "./src/services/SyncService.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ timerStatus: "idle", endTime: null });
  // Optional: Periodic Sync (e.g., every 5 minutes)
  chrome.alarms.create("periodicSync", { periodInMinutes: 5 });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_TIMER") {
    const { minutes } = request;
    const endTime = Date.now() + minutes * 60 * 1000;

    // Save state so it persists if tab is closed
    chrome.storage.local.set({
      timerStatus: "running",
      endTime: endTime,
    });

    // Create an alarm to wake up the background script when timer ends
    chrome.alarms.create("focusTimer", { when: endTime });

    sendResponse({ success: true });
  } else if (request.action === "STOP_TIMER") {
    chrome.storage.local.set({ timerStatus: "idle", endTime: null });
    chrome.alarms.clear("focusTimer");
    sendResponse({ success: true });
  } else if (request.type === "SYNC_NOW") {
    SyncService.processQueue();
    sendResponse({ success: true });
  }
});

// Listen for the alarm (when timer hits 0)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "focusTimer") {
    chrome.storage.local.set({ timerStatus: "finished" });

    chrome.notifications.create({
      type: "basic",
      iconUrl: "./dist/icons.png",
      title: "ZennFlow",
      message: "Focus session complete! Great work.",
    });
  } else if (alarm.name === "periodicSync") {
    SyncService.processQueue();
  }
});
