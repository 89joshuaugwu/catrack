"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import QuestionCard from "@/components/molecules/QuestionCard";
import ScoreReveal from "@/components/molecules/ScoreReveal";
import QuizTimer from "@/components/ui/QuizTimer";
import QuizShell from "@/components/shells/QuizShell";
import Button from "@/components/ui/Button";
import type { Answer, Question } from "@/types";
import { auth } from "@/lib/firebase";

interface QuizTakingInterfaceProps {
  quizId: string;
  title: string;
  questions: Question[];
  startedAt: number;
  durationMinutes: number;
}

export default function QuizTakingInterface({
  quizId,
  title,
  questions,
  startedAt,
  durationMinutes,
}: QuizTakingInterfaceProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number } | null>(null);

  const question = questions[current];
  const answered = Object.keys(answers).length;

  async function submit() {
    setSubmitting(true);
    try {
      const payload: Answer[] = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));

      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: payload }),
      });

      if (!res.ok) throw new Error((await res.json()).error ?? "Submission failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h1 className="font-display text-xl mb-2">{title} — Submitted</h1>
        <ScoreReveal score={result.score} maxScore={questions.length} />
      </div>
    );
  }

  return (
    <QuizShell
      timerSlot={
        <QuizTimer startedAt={startedAt} durationMinutes={durationMinutes} onExpire={submit} />
      }
      progressSlot={
        <span>
          Question {current + 1} of {questions.length} · {answered} answered
        </span>
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Assessment in progress</p><h1 className="mt-1 font-display text-xl font-bold">{title}</h1></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-primary">{answered} / {questions.length} answered</span></div>

      <QuestionCard
        question={question}
        index={current}
        total={questions.length}
        selectedOptionId={answers[question.id]}
        onSelect={(optionId) => setAnswers((a) => ({ ...a, [question.id]: optionId }))}
      />

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          Previous
        </Button>

        {current < questions.length - 1 ? (
          <Button onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}>
            Next
          </Button>
        ) : (
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Quiz"}
          </Button>
        )}
      </div>
    </QuizShell>
  );
}
