"use client";

import { useEffect, useState } from "react";

interface QuizTimerProps {
  startedAt: number;
  durationMinutes: number;
  onExpire?: () => void;
}

export default function QuizTimer({ startedAt, durationMinutes, onExpire }: QuizTimerProps) {
  const endAt = startedAt + durationMinutes * 60_000;
  const [remaining, setRemaining] = useState(Math.max(0, endAt - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      const next = Math.max(0, endAt - Date.now());
      setRemaining(next);
      if (next === 0) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endAt, onExpire]);

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pctLeft = remaining / (durationMinutes * 60_000);

  const color = pctLeft < 0.1 ? "text-error" : pctLeft < 0.25 ? "text-warning" : "text-primary";

  return (
    <div className={`font-tnum text-2xl font-semibold ${color}`} aria-live="polite">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
