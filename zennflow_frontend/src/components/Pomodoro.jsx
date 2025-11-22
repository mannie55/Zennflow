import { useState, useEffect } from "react";

const Pomodoro = () => {
  const [time, setTime] = useState(25);

  useEffect(() => {
    if (time <= 0) return;

    const interval = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  return (
    <div>
      <div>
        <span>
          <button>Focus</button>
        </span>
        <span>
          <button>Break</button>
        </span>
        <h1>{time}</h1>

        <input type="text" placeholder="I will focus on..." />
      </div>
    </div>
  );
};

export default Pomodoro;

//   const TOTAL = 25 * 60;
//   const RADIUS = 140;
//   const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
//   const [remaining, setRemaining] = useState(TOTAL);
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setRemaining((prev) => (prev <= 0 ? 0 : prev - 1));
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);
//   const progress = remaining / TOTAL;
//   const offset = CIRCUMFERENCE * (1 - progress);
//   const minutes = Math.floor(remaining / 60);
//   const seconds = remaining % 60;
//   return (
//     <div className="pomodoro-container">
//       <svg width="320" height="320">
//         <circle
//           r={RADIUS}
//           cx="160"
//           cy="160"
//           stroke="#A3A38F"
//           strokeWidth="10"
//           fill="transparent"
//           strokeDasharray={CIRCUMFERENCE}
//           strokeDashoffset={offset}
//           strokeLinecap="round"
//           transform="rotate(-90 160 160)"
//         />
//       </svg>
//       <div className="center-content">
//         <h1>
//           {minutes}:{seconds.toString().padStart(2, "0")}
//         </h1>
//         <p>coding</p>
//       </div>
//     </div>
//   );
