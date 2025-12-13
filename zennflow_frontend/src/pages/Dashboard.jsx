import { useState, useEffect } from "react";
import LiveClock from "../components/LiveClock";

const Dashboard = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Dashboard mounted");
  }, []);

  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="border border-red-500">
      <div className="py-20 text-center bg-dark-60">
        <LiveClock />
        <h2>Enjoy the present moment</h2>
      </div>
      <div>
        <h3>What is your main goal for today?</h3>
        <input type="text" />
      </div>
    </div>
  );
};

export default Dashboard;
