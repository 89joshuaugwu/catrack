import { redirect } from "next/navigation";
import { demoUser } from "@/lib/mock-data";

// Role-adaptive home: redirect to the right landing route for the signed-in
// user's role. Swap `demoUser.student` for the authenticated user's role
// once Firebase Auth is wired up.
export default function DashboardHome() {
  const role = demoUser.student.role;

  if (role === "student") redirect("/dashboard/quizzes");
  if (role === "lecturer") redirect("/dashboard/lecturer/quizzes");
  redirect("/dashboard/admin/courses");
}
