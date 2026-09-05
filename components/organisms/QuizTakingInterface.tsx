"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import QuestionCard from "@/components/molecules/QuestionCard";
import ScoreReveal from "@/components/molecules/ScoreReveal";
import QuizTimer from "@/components/ui/QuizTimer";
import QuizShell from "@/components/shells/QuizShell";
import Button from "@/components/ui/Button";
import { api } from "@/lib/client-data";
import type { Answer } from "@/types";
import type { QuizSession } from "@/app/(dashboard)/dashboard/quizzes/[id]/take/page";

export default function QuizTakingInterface({session,uid}:{session:QuizSession;uid:string}) {
  const {quiz}=session;
  const storageKey="catrack:"+uid+":"+quiz.id+":"+session.startedAt;
  const [current,setCurrent]=useState(0);
  const [answers,setAnswers]=useState<Record<string,string>>(()=>{
    const saved=Object.fromEntries(session.answers.map(a=>[a.questionId,a.selectedOptionId]));
    if(session.result)return saved;
    try {
      const local=JSON.parse(localStorage.getItem(storageKey)??"null");
      if(local && typeof local==="object") for(const q of quiz.questions)
        if(q.options.some(o=>o.id===local[q.id]))saved[q.id]=local[q.id];
    } catch {}
    return saved;
  });
  const [result,setResult]=useState(session.result);
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");
  const [saveStatus,setSaveStatus]=useState("Answers restored");
  const [expired,setExpired]=useState(false);
  const clockOffset=useRef(session.serverNow-Date.now());
  const queue=useRef<Promise<unknown>>(Promise.resolve());
  const locked=useRef(false);
  const latest=useRef(answers);
  latest.current=answers;
  const deadline=Math.min(session.startedAt+quiz.durationMinutes*60000,quiz.endWindow)-clockOffset.current;
  const payload=(a:Record<string,string>):Answer[]=>Object.entries(a).map(([questionId,selectedOptionId])=>({questionId,selectedOptionId}));
  useEffect(()=>{
    if(result||expired)return;
    try{localStorage.setItem(storageKey,JSON.stringify(answers));}catch{}
    setSaveStatus("Saving answers…");
    const timer=setTimeout(()=>{
      if(locked.current)return;
      queue.current=queue.current.catch(()=>{}).then(()=>api("/api/quizzes/"+quiz.id+"/save",{answers:payload(answers)}));
      queue.current.then(()=>setSaveStatus("Answers saved")).catch(()=>setSaveStatus("Not synced. Keep this page open and retry."));
    },400);
    return()=>clearTimeout(timer);
  },[answers,quiz.id,result,expired,storageKey]);
  useEffect(()=>{
    if(result)return;
    const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue="";};
    window.addEventListener("beforeunload",warn);
    return()=>window.removeEventListener("beforeunload",warn);
  },[result]);
  const submit=useCallback(async()=>{
    if(locked.current||result)return;
    locked.current=true;setSubmitting(true);setError("");
    try{
      await queue.current.catch(()=>{});
      const value=await api<NonNullable<QuizSession["result"]>>("/api/quizzes/"+quiz.id+"/submit",{answers:payload(latest.current)});
      setResult(value);
      try{localStorage.removeItem(storageKey);}catch{}
    }catch(e){setError((e as Error).message);}
    finally{locked.current=false;setSubmitting(false);}
  },[quiz.id,result,storageKey]);
  if(result)return <main className="mx-auto max-w-lg px-5 py-12 text-center"><h1 className="text-2xl font-bold">{quiz.title} — Submitted</h1><ScoreReveal score={result.score} maxScore={result.maxScore}/>{result.lateSubmission&&<p className="mb-5 text-warning">Submitted after the grace period. Only answers previously saved on the server were graded.</p>}{result.review?.length ? <div className="my-5 grid gap-3 text-left">{result.review.map(r=>{const q=quiz.questions.find(q=>q.id===r.questionId)!;return <div key={r.questionId} className="rounded-xl border p-4"><p className="font-semibold">{q.text}</p><p className="text-sm">Your answer: {q.options.find(o=>o.id===answers[q.id])?.text??"Unanswered"}</p><p className="text-sm">Correct answer: {q.options.find(o=>o.id===r.correctOptionId)?.text}</p></div>;})}</div> : quiz.allowReview && <p className="mb-4 text-sm">Answer review becomes available after the quiz window closes. Return to this result then.</p>}<Link className="action-link" href="/dashboard/scores">View CA progress</Link><Link className="ml-4 text-primary" href="/dashboard/quizzes">All quizzes</Link></main>;
  return <QuizShell timerSlot={<QuizTimer startedAt={deadline-quiz.durationMinutes*60000} durationMinutes={quiz.durationMinutes} onExpire={()=>{setExpired(true);void submit();}}/>} progressSlot={<span>{Object.keys(answers).length} of {quiz.questions.length} answered · {saveStatus}</span>}>
    <h1 className="mb-5 text-2xl font-bold">{quiz.title}</h1>
    {error&&<div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">{error}<Button className="ml-3" disabled={submitting} onClick={submit}>Retry submission</Button></div>}
    {expired&&<p className="mb-4 font-semibold text-warning">Time is up. Answers are locked while submission completes.</p>}
    <fieldset disabled={submitting||expired}><QuestionCard question={quiz.questions[current]} index={current} total={quiz.questions.length} selectedOptionId={answers[quiz.questions[current].id]} onSelect={optionId=>setAnswers(a=>({...a,[quiz.questions[current].id]:optionId}))}/></fieldset>
    <nav aria-label="Question navigation" className="my-5 flex flex-wrap gap-2">{quiz.questions.map((q,i)=><button key={q.id} aria-label={"Question "+(i+1)+(answers[q.id]?", answered":", unanswered")} aria-current={i===current?"step":undefined} className={"h-12 w-12 rounded-lg border "+(i===current?"border-primary bg-primary text-white":answers[q.id]?"bg-blue-100":"bg-white")} onClick={()=>setCurrent(i)}>{i+1}</button>)}</nav>
    <div className="flex flex-wrap justify-between gap-3"><Button variant="secondary" disabled={current===0} onClick={()=>setCurrent(c=>c-1)}>Previous</Button>{current<quiz.questions.length-1&&<Button variant="secondary" onClick={()=>setCurrent(c=>c+1)}>Next</Button>}<Button disabled={submitting} onClick={()=>{if(expired||window.confirm("Submit "+Object.keys(answers).length+" answered questions out of "+quiz.questions.length+"? You cannot change answers after submitting."))void submit();}}>{submitting?"Submitting…":"Submit quiz"}</Button></div>
  </QuizShell>;
}
