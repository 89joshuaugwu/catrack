"use client";

import CAProgressBar from "@/components/molecules/CAProgressBar";
import Button from "@/components/ui/Button";
import { computeCAScore } from "@/lib/ca-scoring";
import { exportStudentCAReport, toCASummaryRows } from "@/lib/export";
import type { Attempt, Course, Quiz } from "@/types";

interface ScoreHistoryViewProps {
  studentName: string;
  course: Course;
  quizzes: Pick<Quiz, "id" | "title" | "maxScore" | "weight">[];
  attempts: Pick<Attempt, "quizId" | "score" | "submittedAt">[];
}

export default function ScoreHistoryView({
  studentName,
  course,
  quizzes,
  attempts,
}: ScoreHistoryViewProps) {
  const runningTotal = computeCAScore(attempts, quizzes, course.caCeiling);
  const rows = toCASummaryRows(attempts, quizzes);

  return (
    <div className="grid gap-5 pb-8 border-b border-hairline last:border-0">
      <CAProgressBar
        courseName={course.name}
        courseCode={course.code}
        current={runningTotal}
        ceiling={course.caCeiling}
      />

      {attempts.length === 0 ? (
        <p className="text-text-secondary text-sm">
          Take your first quiz to see your CA progress
        </p>
      ) : (
        <div className="ledger">
          {rows.map((r) => (
            <div key={r.quizTitle} className="ledger-row flex items-center justify-between text-sm py-2.5">
              <span>{r.quizTitle}</span>
              <span className="font-tnum">
                {r.score}/{r.maxScore} <span className="text-text-secondary">+{r.normalized.toFixed(1)} CA</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="secondary"
        className="justify-self-start"
        onClick={() =>
          exportStudentCAReport({
            studentName,
            courseName: course.name,
            courseCode: course.code,
            caCeiling: course.caCeiling,
            runningTotal,
            rows,
          })
        }
      >
        Download PDF
      </Button>
    </div>
  );
}
