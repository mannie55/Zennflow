import { useState, useEffect, useRef } from "react";
import Time from "../components/Time.jsx";
import Task from "../components/Task.jsx";

const Dashboard = () => {
  const [goal, setGoal] = useState("");
  const [dailyGoal, setDailyGoal] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    chrome.storage.local.get(["dailyGoal"], (result) => {
      const storedGoal = result.dailyGoal;
      if (storedGoal) {
        if (storedGoal.date === today) {
          setDailyGoal(storedGoal.text);
          setEditedGoal(storedGoal.text);
        } else {
          chrome.storage.local.remove(["dailyGoal"]);
        }
      }
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGoalSubmit = (e) => {
    if (e.key === "Enter" && goal.trim()) {
      const today = new Date().toLocaleDateString();
      const newGoal = { text: goal.trim(), date: today };
      chrome.storage.local.set({ dailyGoal: newGoal }, () => {
        setDailyGoal(newGoal.text);
        setEditedGoal(newGoal.text);
        setGoal("");
      });
    }
  };

  const handleDelete = () => {
    chrome.storage.local.remove(["dailyGoal"], () => {
      setDailyGoal(null);
      setIsMenuOpen(false);
    });
  };

  const enterEditMode = () => {
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleEditSubmit = (e) => {
    if (e.key === "Enter" && editedGoal.trim()) {
      const today = new Date().toLocaleDateString();
      const newGoal = { text: editedGoal.trim(), date: today };
      chrome.storage.local.set({ dailyGoal: newGoal }, () => {
        setDailyGoal(newGoal.text);
        setIsEditing(false);
      });
    }
  };

  return (
    <div>
      <div>
        <Time />
        <h1>Enjoy the present moment</h1>
      </div>
      <div className="flex flex-col items-center">
        <h2>What is your main goal for today?</h2>
        {dailyGoal ? (
          <div
            className="relative flex items-center group"
          >
            {isEditing ? (
              <input
                type="text"
                value={editedGoal}
                onChange={(e) => setEditedGoal(e.target.value)}
                onKeyDown={handleEditSubmit}
                className="text-black"
              />
            ) : (
              <p>{dailyGoal}</p>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`ml-2 ${isMenuOpen ? 'visible' : 'invisible'} group-hover:visible`}
              >
                ...
              </button>
            )}
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute text-left right-0 top-10 bg-white shadow-md rounded-md w-32 pt-1 z-20 border border-gray-100"
              >
                <button
                  onClick={enterEditMode}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-md"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ) : (
          <input
            type="text"
            placeholder="Enter your goal here"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={handleGoalSubmit}
          />
        )}
      </div>
      <Task />
    </div>
  );
};
export default Dashboard;
