import useServerTimeSync from "../hooks/useServerTimeSync";

const LiveClock = () => {
  const now = useServerTimeSync();

  const display =
    now && typeof now.toLocaleTimeString === "function"
      ? now.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  return <div className="text-xl font-semibold">{display}</div>;
};

export default LiveClock;
