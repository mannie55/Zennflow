import "./App.css";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import FocusDashboard from "./pages/FocusDashboard";
import Footer from "./components/Footer";
import Header from "./components/Nav";
import Task from "./components/Task";

import { SyncService } from "./services/SyncService";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  const [page, setPage] = useState("dashboard"); // "dashboard" or "focus"

  // Offline-first: Listen for network recovery to process the queue
  useEffect(() => {
    // CHROME EXTENSION: Signal background script to sync on mount
    chrome.runtime.sendMessage({ type: "SYNC_NOW" }).catch(() => {});

    const handleOnline = () => {
      console.log("Back online: Processing sync queue...");
      chrome.runtime.sendMessage({ type: "SYNC_NOW" }).catch(() => {});
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <div>
      <Header setPage={setPage} currentPage={page} />

      {/* Render based on page state */}
      {page === "dashboard" && <Dashboard setPage={setPage} />}
      {page === "focus" && <FocusDashboard setPage={setPage} />}

      <Task />
      <Footer />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
}

export default App;
