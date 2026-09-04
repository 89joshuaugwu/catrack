interface CAProgressBarProps {
  courseName: string;
  courseCode: string;
  current: number;
  ceiling: number;
}

// A tally, not a progress bar: hash marks at every 5 points read like a
// mark sheet rather than a generic dashboard widget.
export default function CAProgressBar({ courseName, courseCode, current, ceiling }: CAProgressBarProps) {
  const pct = ceiling > 0 ? Math.min(100, (current / ceiling) * 100) : 0;
  const ticks = Math.max(1, Math.floor(ceiling / 5));

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-medium">
          {courseCode} <span className="text-text-secondary font-normal">— {courseName}</span>
        </p>
        <p className="font-tnum text-sm">
          <span className="font-semibold">{current.toFixed(1)}</span>
          <span className="text-text-secondary"> / {ceiling}</span>
        </p>
      </div>
      <div className="relative h-3">
        <div className="absolute inset-0 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="absolute inset-0 flex justify-between px-px" aria-hidden>
          {Array.from({ length: ticks + 1 }).map((_, i) => (
            <span key={i} className="w-px h-full bg-bg" />
          ))}
        </div>
      </div>
    </div>
  );
}
