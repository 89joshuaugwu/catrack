import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { csvText } from "./csv";
import type { Attempt, Quiz } from "@/types";

/** Student's own CA breakdown: quiz-by-quiz + running total, one course. */
export function exportStudentCAReport(opts: {
  studentName: string;
  courseName: string;
  courseCode: string;
  caCeiling: number;
  runningTotal: number;
  rows: { quizTitle: string; score: number; maxScore: number; weight: number; normalized: number }[];
}) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("CATrack — CA Breakdown", 14, 18);
  doc.setFontSize(11);
  doc.text(`Student: ${opts.studentName}`, 14, 27);
  doc.text(`Course: ${opts.courseCode} — ${opts.courseName}`, 14, 34);

  autoTable(doc, {
    startY: 42,
    head: [["Quiz", "Score", "Max", "Weight", "Normalized"]],
    body: opts.rows.map((r) => [
      r.quizTitle,
      String(r.score),
      String(r.maxScore),
      String(r.weight),
      r.normalized.toFixed(2),
    ]),
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(12);
  doc.text(
    `Running CA total: ${opts.runningTotal.toFixed(2)} / ${opts.caCeiling}`,
    14,
    finalY + 12
  );

  doc.save(`${opts.courseCode}-CA-breakdown.pdf`);
}

/** Lecturer's class gradesheet: every student's running CA total for a course. */
export function exportClassGradesheet(opts: {
  courseName: string;
  courseCode: string;
  caCeiling: number;
  students: { name: string; email: string; total: number }[];
}) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("CATrack — Class Gradesheet", 14, 18);
  doc.setFontSize(11);
  doc.text(`Course: ${opts.courseCode} — ${opts.courseName}`, 14, 27);

  autoTable(doc, {
    startY: 35,
    head: [["Student", "Email", `CA Total (/${opts.caCeiling})`]],
    body: opts.students.map((s) => [s.name, s.email, s.total.toFixed(2)]),
  });

  doc.save(`${opts.courseCode}-gradesheet.pdf`);
}

/** Lecturer's single-quiz class results export. */
export function exportQuizResultsCSV(opts: {
  quizTitle: string;
  results: { name: string; email: string; score: number; maxScore: number; lateSubmission?: boolean }[];
}) {
  const header = "";
  const rows = csvText([["Name","Email","Score","Max Score","Late Submission"], ...opts.results.map(r => [r.name,r.email,r.score,r.maxScore,r.lateSubmission?"Yes":"No"])]);

  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.quizTitle.replace(/\s+/g, "-")}-results.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Re-exported for convenience where callers only have raw attempts/quizzes.
export function toCASummaryRows(
  attempts: Pick<Attempt, "quizId" | "score">[],
  quizzes: Pick<Quiz, "id" | "title" | "maxScore" | "weight">[]
) {
  return attempts
    .map((a) => {
      const quiz = quizzes.find((q) => q.id === a.quizId);
      if (!quiz || quiz.maxScore <= 0 || !Number.isFinite(a.score)) return null;
      return {
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: a.score,
        maxScore: quiz.maxScore,
        weight: quiz.weight,
        normalized: (a.score / quiz.maxScore) * quiz.weight,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
}
