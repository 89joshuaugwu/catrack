"use client";
import Button from "@/components/ui/Button";
import { computeCAScore } from "@/lib/ca-scoring";
import { reportCSV, reportPDF } from "@/lib/report-export";
import type { Attempt, Course, Quiz } from "@/types";
interface Props {
  course:Course;
  quizzes:Pick<Quiz,"id"|"title"|"maxScore"|"weight">[];
  students:{uid:string;name:string;email:string;attempts:Pick<Attempt,"quizId"|"score">[]}[];
}
export default function CAOverviewTable({course,quizzes,students}:Props) {
  const head=["Student","Email",...quizzes.map(q=>q.title+" (CA /"+q.weight+")"),"Total /"+course.caCeiling];
  const rows=students.map(s=>[s.name,s.email,...quizzes.map(q=>{
    const a=s.attempts.find(a=>a.quizId===q.id);
    return a&&q.maxScore>0?((a.score/q.maxScore)*q.weight).toFixed(2):"—";
  }),computeCAScore(s.attempts,quizzes,course.caCeiling).toFixed(2)]);
  return <div><div className="mb-5 flex flex-wrap items-center justify-between gap-4"><h2 className="text-lg font-bold">{course.code} — {course.name}</h2><div className="flex gap-2"><Button variant="secondary" onClick={()=>reportCSV(course.code+"-gradesheet",head,rows)}>Export CSV</Button><Button variant="secondary" onClick={()=>reportPDF(course.code+"-gradesheet",head,rows)}>Export PDF</Button></div></div>
    {!students.length?<p>No student accounts yet.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{head.map((h,i)=><th key={i} className="border-b p-3">{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={students[i].uid}>{row.map((cell,j)=><td key={j} className="border-b border-border p-3">{cell}</td>)}</tr>)}</tbody></table></div>}
    <p className="mt-4 text-xs text-text-secondary">Only submitted attempts contribute to CA. A dash means no submission; totals are capped at {course.caCeiling}.</p>
  </div>;
}
