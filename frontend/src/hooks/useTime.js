import { useState, useEffect, useRef } from "react";

const useTime = ({
  syncWithServer = false,
  endPoint = null,
  updateInterval = 1000,
} = {}) => {
  const [now, setNow] = useState(new Date());
  const offSetRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      try {
        const res = await fetch(endPoint);
        const body = await res.json();
        const iso = typeof body === "string" ? body : body.now;
        offSetRef.current = new Date(iso).getTime() - Date.now();
        if (mounted) {
          setNow(new Date(Date.now() + offSetRef.current));
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (syncWithServer && endPoint) sync();

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

export default useTime;
