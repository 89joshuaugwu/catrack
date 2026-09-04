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
      <h1 className="font-display text-2xl mb-6">New Quiz</h1>
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
