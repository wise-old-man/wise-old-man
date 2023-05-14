import { useLayoutEffect, useState } from "react";

export function useTicker(intervalDuration?: number, enabled?: boolean) {
  const [, setTick] = useState(0);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, intervalDuration || 1000);

    return () => {
      clearInterval(interval);
    };
  }, [intervalDuration, enabled]);
}
