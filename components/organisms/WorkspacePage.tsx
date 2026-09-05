"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AppShell from "@/components/shells/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ScoreHistoryView from "./ScoreHistoryView";
import ClassResultsView from "./ClassResultsView";
import CAOverviewTable from "./CAOverviewTable";
import QuizBuilder from "./QuizBuilder";
import { api, rolePath, useCurrentUser } from "@/lib/client-data";
import type { WorkspaceData } from "@/types";
import { CourseManagement, UserManagement } from "./WorkspaceManagement";

type View = "quizzes" | "scores" | "library" | "builder" | "results" | "overview" | "courses" | "lecturers" | "students";
const titles: Record<View,string> = {
  quizzes:"Your quizzes", scores:"CA progress", library:"Quiz library", builder:"Create or edit quiz",
  results:"Assessment results", overview:"Class progress", courses:"Course catalogue", lecturers:"Lecturer accounts", students:"Student accounts",
};
export default function WorkspacePage({ view }: { view: View }) {
  const {user, loading, error:authError} = useCurrentUser();
  const router = useRouter();
  const params = useParams<{id?:string}>();
  const [data,setData] = useState<WorkspaceData|null>(null);
  const [error,setError] = useState("");
  const [pending,setPending] = useState(false);
  const [search,setSearch] = useState("");
  const [courseFilter,setCourseFilter] = useState("");
  const allowed = !!user && (["quizzes","scores"].includes(view) ? user.role === "student"
    : ["courses","lecturers"].includes(view) ? user.role === "admin" : user.role !== "student");
  const refresh = useCallback(async () => {
    setPending(true); setError("");
    try { setData(await api<WorkspaceData>("/api/workspace")); }
    catch(e) { setError(e instanceof Error ? e.message : "Could not load the workspace."); }
    finally { setPending(false); }
  }, []);
  useEffect(() => {
    if (loading || authError) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (!allowed) { router.replace(rolePath(user.role)); return; }
    void refresh();
  }, [loading, user, allowed, authError, refresh, router]);
  async function mutate(body: unknown) {
    await api("/api/workspace",body);
    await refresh();
  }
  if (authError) return <main className="mx-auto max-w-lg p-8"><p role="alert">{authError}</p><Link href="/auth/login">Return to sign in</Link></main>;
  if (loading || !user || !allowed) return <div className="grid min-h-screen place-items-center"><Spinner/></div>;
  const quiz = data?.quizzes.find(q=>q.id===params.id);
  const submitted = data?.attempts.filter(a=>a.status==="submitted") ?? [];
  const filtered = data?.quizzes.filter(q=>(!courseFilter || q.courseId===courseFilter) && q.title.toLowerCase().includes(search.toLowerCase())) ?? [];
  return <AppShell role={user.role} userName={user.displayName}>
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div><p className="eyebrow">{user.role} workspace</p><h1 className="mt-1 text-3xl font-bold">{titles[view]}</h1></div>
      <Button variant="secondary" disabled={pending} onClick={refresh}>{pending ? "Refreshing…" : "Refresh"}</Button>
    </div>
    {error && <Card className="mb-5"><p role="alert" className="text-error">{error}</p><Button onClick={refresh}>Try again</Button></Card>}
    {!data && pending && <Spinner/>}
    {data && <>
      {(view==="quizzes" || view==="library") && <>
        <div className="mb-5 flex flex-wrap gap-3">
          <input aria-label="Search quizzes" className="field flex-1" placeholder="Search quizzes" value={search} onChange={e=>setSearch(e.target.value)}/>
          <select aria-label="Filter by course" className="field" value={courseFilter} onChange={e=>setCourseFilter(e.target.value)}><option value="">All courses</option>{data.courses.map(c=><option key={c.id} value={c.id}>{c.code}</option>)}</select>
          {view==="library" && <Link className="action-link" href="/dashboard/lecturer/quizzes/new">New quiz</Link>}
        </div>
        {!filtered.length && <Card>No quizzes match. {view==="library" ? "Create an assessment to get started." : "Check back when your lecturer publishes an assessment."}</Card>}
        <div className="grid gap-4">{filtered.map(q=>{
          const attempt=data.attempts.find(a=>a.quizId===q.id && a.uid===user.uid);
          const open=q.status==="published" && q.startWindow<=Date.now() && q.endWindow>Date.now();
          const status=attempt?.status==="submitted" ? "Submitted" : attempt ? "In progress" : q.status==="draft" ? "Draft" : q.status==="closed" || q.endWindow<=Date.now() ? "Closed" : open ? "Open now" : "Upcoming";
          return <Card key={q.id}>
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">{data.courses.find(c=>c.id===q.courseId)?.code}</p><h2 className="mt-1 text-xl font-semibold">{q.title}</h2><p className="mt-2 text-sm text-text-secondary">{q.durationMinutes} minutes · {q.maxScore} marks · {q.weight} CA weight</p><p className="mt-1 text-sm text-text-secondary">{new Date(q.startWindow).toLocaleString()} — {new Date(q.endWindow).toLocaleString()}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-primary">{status}</span></div>
            <div className="mt-4 flex flex-wrap gap-3">
              {view==="quizzes" && (open || attempt) && <Link className="action-link" href={"/dashboard/quizzes/"+q.id+"/take"}>{attempt?.status==="submitted" ? "View result" : attempt ? "Resume quiz" : "Review & start"}</Link>}
              {view==="library" && <>
                <Link className="action-link" href={"/dashboard/lecturer/quizzes/"+q.id+"/results"}>View results</Link>
                {!data.attempts.some(a=>a.quizId===q.id) && <Link className="action-link" href={"/dashboard/lecturer/quizzes/"+q.id+"/edit"}>Edit quiz</Link>}
                <Button variant="secondary" onClick={async()=>{try{await mutate({action:"quizStatus",id:q.id,status:q.status==="published"?"closed":"published"});toast.success("Quiz status updated.");}catch(e){toast.error((e as Error).message);}}}>{q.status==="published"?"Close quiz":"Publish / reopen"}</Button>
              </>}
            </div>
          </Card>;
        })}</div>
      </>}
      {view==="scores" && <div className="grid gap-5">{!data.courses.length && <Card>No courses available yet.</Card>}{data.courses.map(course=>{
        const quizzes=data.quizzes.filter(q=>q.courseId===course.id);
        return <ScoreHistoryView key={course.id} studentName={user.displayName} course={course} quizzes={quizzes} attempts={submitted.filter(a=>quizzes.some(q=>q.id===a.quizId))}/>;
      })}</div>}
      {view==="builder" && (params.id && !quiz ? <Card>Quiz not found or you do not have access.</Card> : !data.courses.length ? <Card>An administrator needs to assign you a course first.</Card> : <QuizBuilder key={params.id??"new"} initialQuiz={quiz} courses={data.courses} onPublish={async(payload,status)=>{
        await api("/api/workspace",{action:"saveQuiz",id:params.id,quiz:payload,status});
        toast.success(status==="draft"?"Draft saved.":"Quiz published.");router.push("/dashboard/lecturer/quizzes");
      }}/>)}
      {view==="results" && (!quiz ? <Card>Quiz not found or you do not have access. <Link href="/dashboard/lecturer/quizzes">Back to quizzes</Link></Card> : <Card><h2 className="mb-4 text-xl font-bold">{quiz.title}</h2><p className="mb-4 text-sm text-text-secondary">{data.attempts.filter(a=>a.quizId===quiz.id&&a.status==="in_progress").length} attempts in progress</p><ClassResultsView quizTitle={quiz.title} maxScore={quiz.maxScore} results={submitted.filter(a=>a.quizId===quiz.id).map(a=>({name:data.users.find(u=>u.uid===a.uid)?.displayName??a.uid,email:data.users.find(u=>u.uid===a.uid)?.email??a.uid,score:a.score,lateSubmission:a.lateSubmission}))}/></Card>)}
      {view==="overview" && <div className="grid gap-5">{!data.courses.length&&<Card>No courses assigned yet.</Card>}{data.courses.map(course=>{
        const quizzes=data.quizzes.filter(q=>q.courseId===course.id && q.status!=="draft");
        return <Card key={course.id}><CAOverviewTable course={course} quizzes={quizzes} students={data.users.filter(u=>u.role==="student").map(u=>({uid:u.uid,name:u.displayName,email:u.email,attempts:submitted.filter(a=>a.uid===u.uid&&quizzes.some(q=>q.id===a.quizId))}))}/></Card>;
      })}</div>}
      {view==="courses" && <CourseManagement data={data} mutate={mutate}/>}
      {(view==="lecturers" || view==="students") && <UserManagement data={data} role={view==="lecturers"?"lecturer":"student"} mutate={mutate}/>}
    </>}
  </AppShell>;
}
