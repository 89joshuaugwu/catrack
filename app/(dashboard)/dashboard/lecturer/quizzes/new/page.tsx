"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AppShell from "@/components/shells/AppShell";
import QuizBuilder from "@/components/organisms/QuizBuilder";
import { demoUser, mockCourses } from "@/lib/mock-data";

export default function NewQuizPage() {
  const router = useRouter();
  const user = demoUser.lecturer;
  const myCourses = mockCourses.filter((c) => c.lecturerId === user.uid);

  return (
    <AppShell role="lecturer" userName={user.displayName}>
      <div className="mb-8"><p className="eyebrow">Quiz library</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Create a quiz</h1><p className="mt-2 text-text-secondary">Set the assessment window, CA value, and answers students will see.</p></div>
      <QuizBuilder
        courses={myCourses}
        onPublish={async () => {
          // POST to Firestore (db.collection("quizzes").add(...)) here,
          // per CONTEXT.md Section 4's data model.
          await new Promise((r) => setTimeout(r, 400));
          toast.success("Quiz published — sample data only in this demo build.");
          router.push("/dashboard/lecturer/quizzes");
        }}
      />
    </AppShell>
  );
}
