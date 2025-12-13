import "./App.css";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import FocusDashboard from "./pages/FocusDashboard";
import Footer from "./components/Footer";
import Header from "./components/Nav";
import Task from "./components/Task";

function App() {
  const [page, setPage] = useState("dashboard"); // "dashboard" or "focus"

  return (
    <div>
      <Header setPage={setPage} currentPage={page} />

      {/* Render based on page state */}
      {page === "dashboard" && <Dashboard setPage={setPage} />}
      {page === "focus" && <FocusDashboard setPage={setPage} />}

      <Task />
      <Footer />
    </div>
  );
}

export default App;
