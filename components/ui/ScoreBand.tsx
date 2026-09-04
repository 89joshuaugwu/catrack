type Band = "strong" | "average" | "failing";

export function bandFor(percent: number): Band {
  if (percent >= 70) return "strong";
  if (percent >= 50) return "average";
  return "failing";
}

const styles: Record<Band, { bg: string; text: string; label: string }> = {
  strong: { bg: "bg-accent/15", text: "text-accent", label: "Strong" },
  average: { bg: "bg-warning/15", text: "text-warning", label: "Average" },
  failing: { bg: "bg-error/15", text: "text-error", label: "Needs work" },
};

export default function ScoreBand({ percent }: { percent: number }) {
  const band = bandFor(percent);
  const s = styles[band];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${s.bg} ${s.text}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          band === "strong" ? "bg-accent" : band === "average" ? "bg-warning" : "bg-error"
        }`}
      />
      {s.label}
    </span>
  );
}
