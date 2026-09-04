import Link from "next/link";
import type { Quiz } from "@/types";

interface QuizCardProps {
  quiz: Pick<Quiz, "id" | "title" | "startWindow" | "endWindow" | "durationMinutes">;
  courseLabel: string;
  ownScore?: number;
  maxScore?: number;
}

function status(startWindow: number, endWindow: number) {
  const now = Date.now();
  if (now < startWindow) return { label: "Upcoming", dot: "bg-text-secondary" };
  if (now > endWindow) return { label: "Closed", dot: "bg-error" };
  return { label: "Open", dot: "bg-accent" };
}

// A ledger row, not a card-in-a-list — status reads as a mark on a
// register, not a colored pill.
export default function QuizCard({ quiz, courseLabel, ownScore, maxScore }: QuizCardProps) {
  const s = status(quiz.startWindow, quiz.endWindow);
  const taken = ownScore !== undefined && maxScore !== undefined;
  const isOpen = s.label === "Open";

  const body = (
    <div className="ledger-row flex items-center gap-4 py-4 group">
      <span className={`shrink-0 w-2 h-2 rounded-full ${s.dot}`} aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-secondary">{courseLabel}</p>
        <h3 className={`font-medium ${isOpen && !taken ? "group-hover:text-primary" : ""}`}>
          {quiz.title}
        </h3>
      </div>
      <span className="text-sm text-text-secondary font-tnum">{quiz.durationMinutes}′</span>
      <span className="text-sm text-text-secondary w-16 text-right">{s.label}</span>
      {taken && (
        <span className="font-tnum text-sm font-semibold w-14 text-right">
          {ownScore}/{maxScore}
        </span>
      )}
    </div>
  );

  if (isOpen && !taken) {
    return <Link href={`/dashboard/quizzes/${quiz.id}/take`}>{body}</Link>;
  }
  return body;
}
