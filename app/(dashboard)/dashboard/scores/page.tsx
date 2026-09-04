"use client";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shells/AppShell";
import ScoreHistoryView from "@/components/organisms/ScoreHistoryView";
import Spinner from "@/components/ui/Spinner";
import { db } from "@/lib/firebase";
import { useCurrentUser } from "@/lib/client-data";
import { attemptFromData, courseFromDoc, quizFromDoc } from "@/lib/firestore-data";
import type { Attempt, Course, Quiz } from "@/types";
export default function ScoresPage(){const {user,loading}=useCurrentUser();const router=useRouter();const [courses,setCourses]=useState<Course[]>([]);const [quizzes,setQuizzes]=useState<Quiz[]>([]);const [attempts,setAttempts]=useState<Attempt[]>([]);useEffect(()=>{if(!user)return;if(user.role!=="student"){router.replace("/dashboard");return;}(async()=>{const [cs,qs]=await Promise.all([getDocs(collection(db,"courses")),getDocs(collection(db,"quizzes"))]);const quizzes=qs.docs.map(quizFromDoc);setCourses(cs.docs.map(courseFromDoc));setQuizzes(quizzes);const results=await Promise.all(quizzes.map(async q=>{const a=await getDoc(doc(db,"quizzes",q.id,"attempts",user.uid));return a.exists()?attemptFromData(user.uid,q.id,a.data()):null;}));setAttempts(results.filter((a):a is Attempt=>a!==null));})().catch(console.error);},[user,router]);if(loading||!user)return <div className="grid min-h-screen place-items-center"><Spinner/></div>;return <AppShell role={user.role} userName={user.displayName}><div className="mb-8"><p className="eyebrow">Student workspace</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight">CA progress</h1><p className="mt-2 text-text-secondary">See how each graded quiz contributes to your continuous assessment total.</p></div><div className="grid gap-5">{courses.map(course=>{const qs=quizzes.filter(q=>q.courseId===course.id);return <ScoreHistoryView key={course.id} studentName={user.displayName} course={course} quizzes={qs} attempts={attempts.filter(a=>qs.some(q=>q.id===a.quizId))}/>;})}</div></AppShell>;}
