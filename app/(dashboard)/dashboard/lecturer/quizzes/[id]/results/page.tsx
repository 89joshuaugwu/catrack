"use client";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/shells/AppShell";
import ClassResultsView from "@/components/organisms/ClassResultsView";
import Spinner from "@/components/ui/Spinner";
import { db } from "@/lib/firebase";
import { useCurrentUser } from "@/lib/client-data";
import { quizFromDoc } from "@/lib/firestore-data";
import type { Quiz } from "@/types";

type Result = { name: string; email: string; score: number; lateSubmission?: boolean };

export default function QuizResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "lecturer") { router.replace("/dashboard"); return; }
    (async () => {
      const quizSnapshot = await getDoc(doc(db, "quizzes", id));
      if (!quizSnapshot.exists() || quizSnapshot.data().createdBy !== user.uid) {
        router.replace("/dashboard/lecturer/quizzes"); return;
      }
      const currentQuiz = quizFromDoc(quizSnapshot as never);
      setQuiz(currentQuiz);
      const attemptSnapshots = await getDocs(collection(db, "quizzes", id, "attempts"));
      setResults(await Promise.all(attemptSnapshots.docs.map(async (attempt) => {
        const profile = await getDoc(doc(db, "users", attempt.id));
        const data = attempt.data();
        return { name: profile.data()?.displayName ?? "Unknown student", email: profile.data()?.email ?? "", score: data.score ?? 0, lateSubmission: data.lateSubmission };
      })));
    })().catch(console.error);
  }, [id, router, user]);

  if (loading || !user || !quiz) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  return <AppShell role={user.role} userName={user.displayName}>
    <div className="mb-8"><p className="eyebrow">Assessment results</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{quiz.title}</h1><p className="mt-2 text-text-secondary">{quiz.questions.length} questions · {quiz.durationMinutes} minutes · {quiz.weight} CA marks</p></div>
    <div className="surface rounded-2xl p-5 sm:p-6"><ClassResultsView quizTitle={quiz.title} maxScore={quiz.maxScore} results={results} /></div>
  </AppShell>;
}
