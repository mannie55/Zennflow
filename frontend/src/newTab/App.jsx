import "./App.css";
import Dashboard from "../pages/DashboardPage.jsx";
import Focuspage from "../pages/FocusPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Retrieve the auth token from chrome.storage.local
    chrome.storage.local.get(["token"], (localResult) => {
      const hasToken = !!localResult.token;
      setIsAuthenticated(hasToken);

      // 2. Retrieve the last path on startup
      chrome.storage.session.get(["lastPath"], (sessionResult) => {
        let targetPath = sessionResult.lastPath || "/";

        if (!hasToken) {
          targetPath = "/login";
        } else if (targetPath === "/login") {
          targetPath = "/";
        }

        if (targetPath !== location.pathname) {
          navigate(targetPath);
        }
        setIsRestored(true); // Mark as restored so we can start saving
      });
    });
  }, []);

  useEffect(() => {
    // 3. Save path only after restoration is complete
    if (isRestored && isAuthenticated) {
      chrome.storage.session.set({ lastPath: location.pathname });
    }
  }, [location.pathname, isRestored, isAuthenticated]);

  useEffect(() => {
    // 4. Reactively listen for auth token changes (e.g. login / logout)
    const handleStorageChange = (changes, namespace) => {
      if (namespace === "local" && changes.token) {
        const hasToken = !!changes.token.newValue;
        setIsAuthenticated(hasToken);
        if (!hasToken) {
          navigate("/login");
        } else if (location.pathname === "/login") {
          navigate("/");
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [location.pathname, navigate]);

  if (!isRestored) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent text-gray-400">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-teal-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold tracking-wide">Restoring session...</span>
        </div>
      </div>
    );
  }

  const showNav = location.pathname !== "/login" && isAuthenticated;

  return (
    <div>
      {showNav && (
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
      )}

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/focus" element={<Focuspage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}
