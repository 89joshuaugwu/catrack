"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import QuizTakingInterface from "@/components/organisms/QuizTakingInterface";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api, rolePath, useCurrentUser } from "@/lib/client-data";
import type { Answer, Quiz, WorkspaceData } from "@/types";

export type QuizSession = {
  quiz:Quiz; startedAt:number; durationMinutes:number; serverNow:number;
  answers:Answer[]; result:{score:number;maxScore:number;lateSubmission:boolean;review?:{questionId:string;correctOptionId:string}[]}|null;
};
export default function TakeQuizPage() {
  const {id} = useParams<{id:string}>();
  const {user,loading,error:authError}=useCurrentUser();
  const router=useRouter();
  const [quiz,setQuiz]=useState<Quiz|null>(null);
  const [session,setSession]=useState<QuizSession|null>(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    if(loading||authError)return;
    if(!user){router.replace("/auth/login");return;}
    if(user.role!=="student"){router.replace(rolePath(user.role));return;}
    let active=true;
    api<WorkspaceData>("/api/workspace").then(data=>{
      if(!active)return;
      const q=data.quizzes.find(q=>q.id===id);
      if(!q)throw new Error("Quiz not found or not available to you.");
      setQuiz(q);
    }).catch(e=>{if(active)setError(e.message);});
    return()=>{active=false;};
  },[id,user,loading,authError,router]);
  if(session&&user) return <QuizTakingInterface key={id} uid={user.uid} session={session}/>;
  return <main className="mx-auto max-w-2xl px-5 py-12">
    <Link className="text-primary" href="/dashboard/quizzes">← Back to quizzes</Link>
    {(error||authError)&&<Card className="mt-6"><p role="alert">{error||authError}</p><Button className="mt-4" onClick={()=>window.location.reload()}>Retry</Button></Card>}
    {!quiz&&!error&&!authError&&<Spinner/>}
    {quiz&&<Card className="mt-6"><p className="eyebrow">Before you begin</p><h1 className="mt-2 text-3xl font-bold">{quiz.title}</h1>
      <p className="my-4">{quiz.questions.length} questions · {quiz.durationMinutes} minutes · {quiz.weight} CA marks</p>
      <p className="text-text-secondary">Your timer starts when you begin and continues if you close the page. Answers are saved as you work. The quiz ends at the earlier of your time limit or the closing time.</p>
      <p className="mt-3 text-sm">Closes: {new Date(quiz.endWindow).toLocaleString()}</p>
      <Button disabled={busy} className="mt-5" onClick={async()=>{
        setBusy(true);setError("");
        try{setSession(await api<QuizSession>("/api/quizzes/"+id+"/start",{}));}
        catch(e){setError((e as Error).message);}
        finally{setBusy(false);}
      }}>{busy?"Opening…":"Begin / resume / view result"}</Button>
    </Card>}
  </main>;
}
