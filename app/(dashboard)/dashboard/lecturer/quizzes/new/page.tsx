"use client";
import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AppShell from "@/components/shells/AppShell";
import QuizBuilder from "@/components/organisms/QuizBuilder";
import Spinner from "@/components/ui/Spinner";
import { db } from "@/lib/firebase";
import { useCurrentUser } from "@/lib/client-data";
import { courseFromDoc } from "@/lib/firestore-data";
import type { Course } from "@/types";
export default function NewQuizPage(){const {user,loading}=useCurrentUser();const router=useRouter();const [courses,setCourses]=useState<Course[]>([]);useEffect(()=>{if(user?.role==="lecturer")getDocs(query(collection(db,"courses"),where("lecturerId","==",user.uid))).then(s=>setCourses(s.docs.map(courseFromDoc))).catch(console.error);},[user]);if(loading||!user)return <div className="grid min-h-screen place-items-center"><Spinner/></div>;return <AppShell role={user.role} userName={user.displayName}><div className="mb-8"><p className="eyebrow">Quiz library</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Create a quiz</h1><p className="mt-2 text-text-secondary">Set the assessment window, CA value, and answers students will see.</p></div>{courses.length?<QuizBuilder courses={courses} onPublish={async payload=>{await addDoc(collection(db,"quizzes"),{...payload,createdBy:user.uid,status:"published"});toast.success("Quiz published.");router.push("/dashboard/lecturer/quizzes");}}/>:<div className="surface rounded-2xl p-6 text-text-secondary">You need a course assigned to your account before creating a quiz.</div>}</AppShell>;}
