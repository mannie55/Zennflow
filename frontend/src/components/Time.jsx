import useTime from "../hooks/useTime.js";

const Time = () => {
  const now = useTime();

  const displayTime =
    now && typeof now.toLocaleTimeString === "function"
      ? now.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  return <div className="text-xl font-bold">{displayTime}</div>;
};

export default Time;
