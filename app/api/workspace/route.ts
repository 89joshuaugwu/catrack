import { NextResponse } from "next/server";
import { adminAuth, adminDb as db } from "@/lib/firebase-admin";
import { ApiError, apiError, requireUser } from "@/lib/server-auth";
import { millis, studentQuiz, validateQuiz } from "@/lib/assessment";
import type { AppUser, Quiz } from "@/types";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const courseQuery = user.role === "lecturer"
      ? db.collection("courses").where("lecturerId", "==", user.uid) : db.collection("courses");
    const courseDocs = await courseQuery.get();
    const courses = courseDocs.docs.map(d => ({ ...d.data(), id: d.id }));
    const allQuizzes = await db.collection("quizzes").get();
    const quizzes = allQuizzes.docs.map(d => {
      const q = d.data();
      return { ...q, id: d.id, maxScore: q.questions.length, startWindow: millis(q.startWindow), endWindow: millis(q.endWindow) } as Quiz;
    }).filter(q => user.role === "admin" || (user.role === "lecturer"
      ? courses.some(c => c.id === q.courseId) : ["published","closed"].includes(q.status)));
    const attempts = (await Promise.all(quizzes.map(async q => {
      const ref = db.collection("quizzes").doc(q.id).collection("attempts");
      const docs = user.role === "student" ? [await ref.doc(user.uid).get()] : (await ref.get()).docs;
      return docs.filter(d => d.exists).map(d => {
        const a = d.data()!;
        return { uid: d.id, quizId: q.id, status: a.status, score: a.score ?? 0,
          startedAt: millis(a.startedAt), submittedAt: a.submittedAt ? millis(a.submittedAt) : null,
          lateSubmission: !!a.lateSubmission, answers: user.role === "student" ? a.answers ?? [] : [] };
      });
    }))).flat();
    // The documented model is institution-wide (no course enrolment collection).
    const users: AppUser[] = user.role === "student" ? [user] :
      (await db.collection("users").get()).docs.filter(d => user.role === "admin" || d.data().role === "student" || d.id === user.uid)
        .map(d => ({ uid: d.id, displayName: d.data().displayName, email: d.data().email, role: d.data().role, disabled: !!d.data().disabled }));
    return NextResponse.json({ user, courses, quizzes: user.role === "student" ? quizzes.map(studentQuiz) : quizzes, attempts, users },
      { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}

const text = (v: unknown) => typeof v === "string" ? v.trim() : "";
export async function POST(request: Request) {
  try {
    const user = await requireUser(request, ["admin", "lecturer"]);
    const body = await request.json();
    const { action } = body;
    if (action === "saveCourse") {
      if (user.role !== "admin") throw new ApiError("Admin access required.", 403);
      const { name, code, lecturerId, caCeiling } = body;
      if (!text(name) || !/^[a-z0-9 -]{2,20}$/i.test(text(code)) ||
          !Number.isFinite(caCeiling) || caCeiling <= 0 || caCeiling > 100)
        throw new ApiError("Enter a course name, valid code, and CA ceiling from 1 to 100.");
      const lecturer = await db.collection("users").doc(text(lecturerId) || "_missing").get();
      if (lecturer.data()?.role !== "lecturer" || lecturer.data()?.disabled) throw new ApiError("Select an active lecturer.");
      const ref = body.id ? db.collection("courses").doc(body.id) : db.collection("courses").doc();
      await db.runTransaction(async tx => {
        const existing = await tx.get(ref);
        if (body.id && !existing.exists) throw new ApiError("Course not found.", 404);
        const duplicate = await tx.get(db.collection("courses").where("code", "==", text(code).toUpperCase()));
        if (duplicate.docs.some(d => d.id !== ref.id)) throw new ApiError("This course code already exists.");
        tx.set(ref, { name: text(name), code: text(code).toUpperCase(), lecturerId, caCeiling });
      });
      return NextResponse.json({ id: ref.id });
    }
    if (action === "createUser") {
      const role = body.role;
      if (!["student", "lecturer"].includes(role) || (role === "lecturer" && user.role !== "admin"))
        throw new ApiError("You cannot provision this role.", 403);
      if (!text(body.displayName) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(body.email)) ||
          typeof body.password !== "string" || body.password.length < 12)
        throw new ApiError("Enter a name, email, and a temporary password of at least 12 characters.");
      let account;
      try { account = await adminAuth.createUser({ email: text(body.email), displayName: text(body.displayName), password: body.password }); }
      catch (e) {
        if ((e as {code?:string}).code === "auth/email-already-exists") throw new ApiError("An account already uses this email.");
        throw e;
      }
      try { await db.collection("users").doc(account.uid).set({ uid: account.uid, email: account.email, displayName: account.displayName, role }); }
      catch (e) { await adminAuth.deleteUser(account.uid); throw e; }
      return NextResponse.json({ uid: account.uid });
    }
    if (action === "setUserDisabled") {
      if (user.role !== "admin" || body.uid === user.uid || typeof body.disabled !== "boolean")
        throw new ApiError("Admin access required; you cannot disable your own account.", 403);
      const ref = db.collection("users").doc(body.uid);
      const target = await ref.get();
      if (!target.exists || target.data()?.role === "admin") throw new ApiError("Select a student or lecturer account.");
      await adminAuth.updateUser(body.uid, { disabled: body.disabled });
      await ref.update({ disabled: body.disabled });
      if (body.disabled) await adminAuth.revokeRefreshTokens(body.uid);
      return NextResponse.json({ ok: true });
    }
    if (action === "saveQuiz" || action === "quizStatus") {
      const ref = body.id ? db.collection("quizzes").doc(body.id) : db.collection("quizzes").doc();
      await db.runTransaction(async tx => {
        const existing = await tx.get(ref);
        if (body.id && !existing.exists) throw new ApiError("Quiz not found.", 404);
        const prior = existing.data();
        const courseId = action === "saveQuiz" ? body.quiz?.courseId : prior?.courseId;
        if (!courseId) throw new ApiError("Select a course.");
        const course = await tx.get(db.collection("courses").doc(courseId));
        if (!course.exists || (user.role !== "admin" && course.data()?.lecturerId !== user.uid))
          throw new ApiError("This course is not assigned to you.", 403);
        if (prior && prior.courseId !== courseId) throw new ApiError("A quiz cannot be moved to a different course.");
        const attempts = await tx.get(ref.collection("attempts").limit(1));
        if (action === "quizStatus") {
          if (!["published", "closed"].includes(body.status)) throw new ApiError("Invalid quiz status.");
          if (body.status === "published") {
            try { validateQuiz({ ...prior, startWindow: millis(prior!.startWindow), endWindow: millis(prior!.endWindow) } as Quiz); }
            catch(e) { throw new ApiError((e as Error).message); }
            if (millis(prior!.endWindow) <= Date.now()) throw new ApiError("Update the quiz window before reopening.");
          }
          tx.update(ref, { status: body.status });
        } else {
          if (!attempts.empty) throw new ApiError("Questions and grading cannot change after an attempt has started.");
          const q = body.quiz as Quiz;
          try { validateQuiz(q); } catch(e) { throw new ApiError((e as Error).message); }
          if (q.weight > course.data()!.caCeiling) throw new ApiError("Quiz weight exceeds the course CA ceiling.");
          if (!["draft", "published"].includes(body.status)) throw new ApiError("Invalid quiz status.");
          tx.set(ref, { title: q.title.trim(), courseId, createdBy: prior?.createdBy ?? user.uid,
            questions: q.questions.map(question => ({id:question.id, text:question.text.trim(),
              options:question.options.map(o=>({id:o.id,text:o.text.trim()})), correctOptionId:question.correctOptionId})),
            maxScore: q.questions.length, weight:q.weight, durationMinutes:q.durationMinutes,
            startWindow:q.startWindow, endWindow:q.endWindow, status:body.status, allowReview:q.allowReview === true });
        }
      });
      return NextResponse.json({ id: ref.id });
    }
    throw new ApiError("Unknown action.");
  } catch (error) { return apiError(error); }
}
