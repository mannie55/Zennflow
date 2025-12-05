import { useState, useRef, useEffect } from "react";

const useServerTimeSync = ({
  syncWithServer = true,
  endPoint = "/api/time",
  updateInterval = 1000,
} = {}) => {
  const [now, setNow] = useState(new Date());
  const offSetRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      try {
        res = await fetch(endPoint);
        const body = await res.json();
        const iso = typeof body === "string" ? body : body.now;
        offSetRef.current = new Date(iso).getTime() - Date.now();
        if (mounted) {
          setNow(new Date(Date.now() + offSetRef.current));
        }
      } catch {}
    };

    if (syncWithServer) sync();

    const id = setInterval(() => {
      setNow(new Date(Date.now() + offSetRef.current));
    }, updateInterval);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [syncWithServer, endPoint, updateInterval]);

  return now;
};

export default useServerTimeSync;
