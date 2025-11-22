import "./App.css";
import Dashboard from "./pages/Dashboard";
import FocusDashboard from "./pages/FocusDashboard";
import Footer from "./components/Footer";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Nav";
import Task from "./components/Task";

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pomodorro" element={<FocusDashboard />} />
      </Routes>
      <Task />
      <Footer />
    </div>
  );
}

export default App;
