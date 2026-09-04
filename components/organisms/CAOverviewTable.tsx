"use client";

import Button from "@/components/ui/Button";
import { computeCAScore } from "@/lib/ca-scoring";
import { exportClassGradesheet } from "@/lib/export";
import type { Attempt, Course, Quiz } from "@/types";

interface CAOverviewTableProps {
  course: Course;
  quizzes: Pick<Quiz, "id" | "title" | "maxScore" | "weight">[];
  students: {
    uid: string;
    name: string;
    email: string;
    attempts: Pick<Attempt, "quizId" | "score">[];
  }[];
}

export default function CAOverviewTable({ course, quizzes, students }: CAOverviewTableProps) {
  const rows = students.map((s) => ({
    ...s,
    total: computeCAScore(s.attempts, quizzes, course.caCeiling),
  }));

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">
          {course.code} <span className="text-text-secondary font-normal">— running CA totals</span>
        </h2>
        <Button
          variant="secondary"
          onClick={() =>
            exportClassGradesheet({
              courseName: course.name,
              courseCode: course.code,
              caCeiling: course.caCeiling,
              students: rows.map((r) => ({ name: r.name, email: r.email, total: r.total })),
            })
          }
        >
          Export gradesheet
        </Button>
      </div>

      <div className="ledger">
        <div className="hidden sm:grid grid-cols-[1fr_8rem_8rem] gap-2 text-xs text-text-secondary py-2">
          <span>Student</span>
          <span className="text-right">Quizzes taken</span>
          <span className="text-right">CA total</span>
        </div>
        {rows.map((r) => (
          <div key={r.uid} className="ledger-row grid sm:grid-cols-[1fr_8rem_8rem] gap-1 sm:gap-2 py-3 text-sm">
            <span className="font-medium">{r.name}</span>
            <span className="text-text-secondary sm:text-right">
              {r.attempts.length} of {quizzes.length}
            </span>
            <span className="font-tnum sm:text-right font-semibold">
              {r.total.toFixed(1)} / {course.caCeiling}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
