"use client";

import { reportPDF } from "@/lib/report-export";
import Button from "@/components/ui/Button";
import { exportQuizResultsCSV } from "@/lib/export";

interface ClassResultsViewProps {
  quizTitle: string;
  maxScore: number;
  results: { name: string; email: string; score: number; lateSubmission?: boolean }[];
}

export default function ClassResultsView({ quizTitle, maxScore, results }: ClassResultsViewProps) {
  if (results.length === 0) {
    return <p className="text-text-secondary text-sm">No students have taken this quiz yet</p>;
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {results.length} submission{results.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={()=>reportPDF(quizTitle,["Student","Email","Score","Max","Timing"],results.map(r=>[r.name,r.email,r.score,maxScore,r.lateSubmission?"Late":"On time"]))}>Export PDF</Button><Button
          variant="secondary"
          onClick={() =>
            exportQuizResultsCSV({ quizTitle, results: results.map((r) => ({ ...r, maxScore })) })
          }
        >
          Export CSV
        </Button></div>
      </div>

      <div className="ledger">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_5rem_5rem] gap-2 text-xs text-text-secondary py-2">
          <span>Student</span>
          <span>Email</span>
          <span className="text-right">Score</span>
          <span className="text-right">Timing</span>
        </div>
        {results.map((r) => (
          <div
            key={r.email}
            className="ledger-row grid sm:grid-cols-[1fr_1fr_5rem_5rem] gap-1 sm:gap-2 py-3 text-sm"
          >
            <span className="font-medium">{r.name}</span>
            <span className="text-text-secondary">{r.email}</span>
            <span className="font-tnum sm:text-right">
              {r.score}/{maxScore}
            </span>
            <span className={`sm:text-right ${r.lateSubmission ? "text-error" : "text-accent"}`}>
              {r.lateSubmission ? "Late" : "On time"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
