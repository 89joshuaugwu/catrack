"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import QuizTakingInterface from "@/components/organisms/QuizTakingInterface";
import Spinner from "@/components/ui/Spinner";
import { db } from "@/lib/firebase";
import { useCurrentUser } from "@/lib/client-data";
import type { Quiz } from "@/types";
export default function TakeQuizPage(){const params=useParams<{id:string}>();const {user,loading}=useCurrentUser();const router=useRouter();const [quiz,setQuiz]=useState<Quiz|null>(null);const [startedAt,setStartedAt]=useState<number|null>(null);useEffect(()=>{if(!user)return;if(user.role!=="student"){router.replace("/dashboard");return;}(async()=>{const snap=await getDoc(doc(db,"quizzes",params.id));if(!snap.exists()){router.replace("/dashboard/quizzes");return;}const token=await user.firebaseUser.getIdToken();const response=await fetch(`/api/quizzes/${params.id}/start`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});const data=await response.json();if(!response.ok)throw new Error(data.error);const value=snap.data();setQuiz({...value,id:snap.id,startWindow:value.startWindow.toMillis(),endWindow:value.endWindow.toMillis()} as Quiz);setStartedAt(data.startedAt);})().catch(console.error);},[user,params.id,router]);if(loading||!quiz||!startedAt)return <div className="grid min-h-screen place-items-center"><Spinner/></div>;return <QuizTakingInterface quizId={quiz.id} title={quiz.title} questions={quiz.questions} startedAt={startedAt} durationMinutes={quiz.durationMinutes}/>;}
