import crxLogo from "@/assets/crx.svg";
import reactLogo from "@/assets/react.svg";
import viteLogo from "@/assets/vite.svg";
import HelloWorld from "@/components/HelloWorld";
import "./App.css";
import Dashboard from "../pages/DashboardPage.jsx";
import Focuspage from "../pages/FocusPage.jsx";

import {
  Route,
  Routes,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";

import SyncStatusIndicator from "@/components/SyncStatusIndicator";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    // 1. Retrieve the last path on startup
    chrome.storage.session.get(["lastPath"], (result) => {
      if (result.lastPath && result.lastPath !== location.pathname) {
        navigate(result.lastPath);
      }
      setIsRestored(true); // Mark as restored so we can start saving
    });
  }, []);

  useEffect(() => {
    // 2. Save path only after restoration is complete
    if (isRestored) {
      chrome.storage.session.set({ lastPath: location.pathname });
    }
  }, [location.pathname, isRestored]);

  return (
    <div>
      <header>
        <nav>
          {location.pathname === "/focus" ? (
            <Link to="/">Dashboard</Link>
          ) : (
            <Link to="/focus">Focus</Link>
          )}
        </nav>
        <SyncStatusIndicator />
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/focus" element={<Focuspage />} />
        </Routes>
 
      </main>
    </div>
  );
}
