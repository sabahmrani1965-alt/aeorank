"use client";

import { useEffect, useState } from "react";

const LOW_THRESHOLD_SECONDS = 120;

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Countdown({ expiresAt, onExpire }) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(expiresAt).getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const ms = new Date(expiresAt).getTime() - Date.now();
      setRemainingMs(ms);
      if (ms <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const low = remainingMs / 1000 <= LOW_THRESHOLD_SECONDS;

  return (
    <span className={`kc-countdown${low ? " kc-countdown-low" : ""}`}>
      ⏱ {formatRemaining(remainingMs)}
    </span>
  );
}
