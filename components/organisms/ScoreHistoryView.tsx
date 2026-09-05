"use client";
import { Download } from "lucide-react";
import CAProgressBar from "@/components/molecules/CAProgressBar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { computeCAScore } from "@/lib/ca-scoring";
import { exportStudentCAReport, toCASummaryRows } from "@/lib/export";
import type { Attempt, Course, Quiz } from "@/types";
interface Props {studentName:string;course:Course;quizzes:Pick<Quiz,"id"|"title"|"maxScore"|"weight">[];attempts:Pick<Attempt,"quizId"|"score"|"submittedAt">[];}
export default function ScoreHistoryView({studentName,course,quizzes,attempts}:Props){const runningTotal=computeCAScore(attempts,quizzes,course.caCeiling);const rows=toCASummaryRows(attempts,quizzes);return <Card><CAProgressBar courseName={course.name} courseCode={course.code} current={runningTotal} ceiling={course.caCeiling}/><div className="mt-6 border-t border-border pt-5">{attempts.length===0?<div className="rounded-xl bg-slate-50 p-4 text-sm text-text-secondary">No submitted quizzes yet. Take your first quiz to start building this total.</div>:<div className="ledger">{rows.map(r=><div key={r.quizId} className="ledger-row flex items-center justify-between gap-4 py-3 text-sm"><span className="font-medium">{r.quizTitle}<span className="mt-1 block text-xs text-text-secondary">{(()=>{const q=quizzes.find(q=>q.id===r.quizId);const a=attempts.find(a=>a.quizId===q?.id);return a?.submittedAt?new Date(a.submittedAt).toLocaleString():"";})()}</span></span><span className="shrink-0 font-tnum"><b>{r.score}/{r.maxScore}</b><span className="ml-2 text-text-secondary">+{r.normalized.toFixed(1)} CA</span></span></div>)}</div>}</div><Button variant="secondary" className="mt-5" onClick={()=>exportStudentCAReport({studentName,courseName:course.name,courseCode:course.code,caCeiling:course.caCeiling,runningTotal,rows})}><Download size={16}/> Download statement</Button></Card>;}
