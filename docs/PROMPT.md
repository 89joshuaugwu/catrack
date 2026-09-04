# CATrack — PROMPT.md

Feed to Antigravity one phase at a time, attaching DESIGN.md + CONTEXT.md as context files.

---

## PHASE 0 — Project Bootstrap

```
Using DESIGN.md and CONTEXT.md as reference, bootstrap a new Next.js 16
project named "catrack" with:

- App Router, TypeScript (strict mode), Tailwind CSS v4, React 19
- Folder structure:
  /app
    /(public)/page.tsx
    /(public)/auth/login/page.tsx
    /(dashboard)/dashboard/page.tsx
    /(dashboard)/dashboard/quizzes/page.tsx
    /(dashboard)/dashboard/quizzes/[id]/take/page.tsx
    /(dashboard)/dashboard/scores/page.tsx
    /(dashboard)/dashboard/lecturer/quizzes/page.tsx
    /(dashboard)/dashboard/lecturer/quizzes/new/page.tsx
    /(dashboard)/dashboard/lecturer/quizzes/[id]/results/page.tsx
    /(dashboard)/dashboard/lecturer/ca-overview/page.tsx
    /(dashboard)/dashboard/admin/lecturers/page.tsx
    /(dashboard)/dashboard/admin/courses/page.tsx
    /api/quizzes/[id]/start/route.ts
    /api/quizzes/[id]/submit/route.ts
  /components
    /ui, /molecules, /organisms, /shells (QuizTimer, ScoreBand,
    QuestionCard, ScoreReveal, QuizCard, CAProgressBar, QuizBuilder,
    QuizTakingInterface, ScoreHistoryView, ClassResultsView,
    CAOverviewTable, AppShell, QuizShell)
  /lib
    /firebase.ts, /firebase-admin.ts
    /quiz-attempts.ts  -> startQuizAttempt(), submitQuizAttempt(),
                         gradeQuiz() exactly per CONTEXT.md Section 2
    /ca-scoring.ts     -> computeCAScore() exactly per CONTEXT.md Section 3
    /export.ts         -> PDF gradesheet/score-report generation
  /types

Install: firebase, firebase-admin, jspdf, jspdf-autotable, lucide-react,
react-hot-toast. Set up Tailwind theme using DESIGN.md's Royal Blue/Lime
palette. Load Work Sans, Inter, JetBrains Mono (tabular-nums for the timer).
Working `npm run dev`. Output .env.local.example per CONTEXT.md Section 7.
```

---

## PHASE 1 — Auth, Courses, Quiz Builder

```
Using CONTEXT.md Sections 4-5, build login (admin/lecturer/student, no
public signup), admin course management (name, code, caCeiling), and
the QuizBuilder (MCQ question entry, maxScore, weight, duration, window,
publish). Route guards per the RBAC table. Complete, deployable files.
```

---

## PHASE 2 — Quiz Attempt Lifecycle (build and verify)

```
Using CONTEXT.md Section 2 in full, build:

1. /app/api/quizzes/[id]/start/route.ts
2. /app/api/quizzes/[id]/submit/route.ts
3. /lib/quiz-attempts.ts — startQuizAttempt(), submitQuizAttempt(),
   gradeQuiz() exactly as specified

Requirements:
- Server-side timing enforcement, elapsed-time check on submission,
  same integrity principle as ExamGuard applied at this project's scale
- VERIFICATION: create a test quiz, start an attempt, manually wait past
  the duration (or manipulate the client timer via dev tools), submit
  late, confirm lateSubmission flags correctly rather than silently
  accepting a spoofed timer
- gradeQuiz(): confirm correct/incorrect scoring against a few manual
  test cases

Complete, deployable files. Do not proceed until this verification passes.
```

---

## PHASE 3 — Quiz-Taking Interface

```
Using DESIGN.md "Quiz Taking" and "Score Reveal" sections, build:

1. /app/(dashboard)/dashboard/quizzes/page.tsx
2. /app/(dashboard)/dashboard/quizzes/[id]/take/page.tsx
3. /components/shells/QuizShell.tsx
4. /components/organisms/QuizTakingInterface.tsx
5. /components/molecules/QuestionCard.tsx
6. /components/molecules/ScoreReveal.tsx
7. /components/ui/QuizTimer.tsx

Requirements:
- QuizShell: minimal chrome, timer prominent, same focus-mode principle
  as ExamGuard's ExamShell
- QuestionCard: real radio inputs under styled options, full keyboard
  navigation
- ScoreReveal: count-up animation per DESIGN.md Section 1, modest
  celebratory landing (this context allows more warmth than your
  exam-integrity projects), prefers-reduced-motion fallback showing the
  final score directly

Complete, deployable files.
```

---

## PHASE 4 — Score History & CA Progress

```
Using DESIGN.md "Score History" section and CONTEXT.md Section 3, build:

1. /app/(dashboard)/dashboard/scores/page.tsx
2. /components/organisms/ScoreHistoryView.tsx
3. /components/molecules/CAProgressBar.tsx
4. /lib/ca-scoring.ts — computeCAScore() exactly per CONTEXT.md Section 3
5. /lib/export.ts — student CA breakdown PDF

Requirements:
- Per course: CAProgressBar showing computeCAScore() result against
  caCeiling, list of individual quiz attempts with scores
- Download PDF: full CA breakdown per course (quiz-by-quiz + running total)

Complete, deployable files.
```

---

## PHASE 5 — Lecturer Results & CA Overview

```
Using DESIGN.md "Lecturer: CA Overview" section, build:

1. /app/(dashboard)/dashboard/lecturer/quizzes/[id]/results/page.tsx
2. /app/(dashboard)/dashboard/lecturer/ca-overview/page.tsx
3. /components/organisms/ClassResultsView.tsx
4. /components/organisms/CAOverviewTable.tsx
5. /lib/export.ts — extend with class gradesheet CSV/PDF export

Requirements:
- ClassResultsView: all students' scores for one quiz
- CAOverviewTable: running CA totals across the whole class using
  computeCAScore() per student, export gradesheet button

Complete, deployable files. Final phase before deploy.
```

---

## Deploy Checklist

```
1. Push to GitHub, connect Vercel, set env vars from CONTEXT.md Section 7
2. MANUAL STEP: Firebase Console -> Firestore Rules -> paste CONTEXT.md
   Section 6 -> Publish
3. Enable Email/Password auth, bootstrap first admin manually
4. Test full flow: admin creates lecturer -> lecturer creates course
   (with a realistic caCeiling like 30) and 2-3 quizzes with different
   weights -> student takes each quiz -> confirm individual scores and
   the running CA total both compute correctly, capping at the ceiling
   if exceeded
5. Test the server-side timing enforcement specifically per Phase 2's
   verification step
6. Test PDF exports: student's own CA breakdown, lecturer's class
   gradesheet — confirm both render correctly with real data
```

---

Run in order. Given how lean this project is relative to your recent builds, most phases should move quickly — the one still worth real testing time is Phase 2's timing enforcement, since that principle matters regardless of how simple the surrounding project is.
