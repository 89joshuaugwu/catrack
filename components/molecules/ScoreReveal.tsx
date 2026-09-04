"use client";

import { useEffect, useState } from "react";
import ScoreBand, { bandFor } from "@/components/ui/ScoreBand";

interface ScoreRevealProps {
  score: number;
  maxScore: number;
}

export default function ScoreReveal({ score, maxScore }: ScoreRevealProps) {
  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const [display, setDisplay] = useState(0);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplay(score);
      setLanded(true);
      return;
    }

    const durationMs = 900;
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      setDisplay(Math.round(t * score));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setLanded(true);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const band = bandFor(percent);
  const ring =
    band === "strong" ? "border-accent" : band === "average" ? "border-warning" : "border-error";

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div
        className={`h-40 w-40 rounded-full border-8 ${ring} flex items-center justify-center transition-transform duration-300 ${
          landed ? "scale-100" : "scale-95"
        }`}
        style={landed ? { transform: "scale(1.04)" } : undefined}
      >
        <div className="text-center">
          <div className="font-tnum text-4xl font-semibold">
            {display}/{maxScore}
          </div>
          <div className="text-text-secondary text-sm">{percent}%</div>
        </div>
      </div>
      <ScoreBand percent={percent} />
    </div>
  );
}
