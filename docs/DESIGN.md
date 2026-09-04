# CATrack — DESIGN.md

**Product:** Web-Based Online Quiz and Continuous Assessment System (Case Study: ESUT) — lecturers create timed MCQ quizzes, students get instant auto-graded scores, running CA totals aggregate across quizzes per course.
**Target:** Students (take quizzes, view score history), Lecturers (create quizzes, view/export class results), Admin (manage lecturer accounts, courses).
**Status:** Production-ready spec for Next.js 16 + Tailwind CSS v4 + React 19.
**Cost:** $0 — Firebase Spark, Vercel free tier. No external APIs, no ML/biometric phase — deliberately kept lean per your own scoping.

---

## 1. Brand Identity

### Name & Positioning
**CATrack** — Continuous Assessment, tracked. Plain, describes what it does.

### Color Palette — Clean, Positive

| Role | Color | Hex | Use |
|---|---|---|---|
| Primary | Royal Blue | `#2563EB` | Headers, primary actions |
| Accent | Lime | `#84CC16` | Score reveal, positive/passing results |
| Warning | Amber | `#D97706` | Below-average scores |
| Error | Red | `#DC2626` | Failing scores, quiz window closed |
| Background | Off-White | `#F8FAFC` | Standard background |
| Card BG | White | `#FFFFFF` | Cards |
| Border | Slate 200 | `#E2E8F0` | Dividers |
| Text Primary | Slate 900 | `#0F172A` | Headings |
| Text Secondary | Slate 500 | `#64748B` | Labels |

### Typography
- **Display:** Work Sans 600 — clean, academic-friendly
- **Body:** Inter 400
- **Mono:** JetBrains Mono with tabular-nums — quiz timer, scores

### The Signature Moment: The Score Reveal
On quiz submission, the score counts up from 0 to the final result, landing on a color-coded band (Lime for strong scores, Amber for average, Red for failing) — this is routine coursework feedback, not a grave context, so a modest celebratory feel (a brief scale-bounce on landing) is appropriate here, unlike the restrained tone used in your exam-integrity projects.

Respect prefers-reduced-motion: show the final score directly, no count-up.

---

## 2. Page Map & Routing

```
/                              # Landing
/auth/login                    # Shared login — no public signup
  |
/dashboard                     # Role-adaptive home
  |
  # Student routes
  |- /dashboard/quizzes                 # Available quizzes
  |- /dashboard/quizzes/[id]/take       # The quiz-taking screen
  |- /dashboard/scores                  # Score history + running CA totals per course
  |
  # Lecturer routes
  |- /dashboard/lecturer/quizzes         # Quiz management
  |- /dashboard/lecturer/quizzes/new
  |- /dashboard/lecturer/quizzes/[id]/results   # Class results, export
  |- /dashboard/lecturer/ca-overview     # Running CA totals for the whole class
  |
  # Admin routes
  |- /dashboard/admin/lecturers
  |- /dashboard/admin/courses
```

---

## 3. Component Architecture

### Shells
- **AppShell** — standard dashboard chrome, role-adaptive nav
- **QuizShell** — stripped-down quiz-taking wrapper, same "focus mode" principle as ExamGuard's ExamShell (minimal chrome, timer prominent), reused here at a lighter scale

### Atoms
- **QuizTimer** — mono, tabular-nums, color-shifts under time pressure
- **ScoreBand** — Lime/Amber/Red, always paired with text
- **Button**, **Card**, **Spinner**, **Toast**

### Molecules
- **QuestionCard** — MCQ options as tappable cards, answered/unanswered state
- **ScoreReveal** — the signature moment count-up
- **QuizCard** — (list view) title, course, status (upcoming/open/closed), student's own score if taken
- **CAProgressBar** — running total vs the course's CA ceiling, per course

### Organisms
- **QuizBuilder** — question entry (MCQ only), duration, window, weight/max-score setting
- **QuizTakingInterface** — QuestionCard flow, QuizTimer, submit
- **ScoreHistoryView** — student's full quiz history + CAProgressBar per course
- **ClassResultsView** — (lecturer) all student scores for one quiz, export button
- **CAOverviewTable** — (lecturer) running CA totals across the whole class, export button

---

## 4. Mobile-First / Responsive Spec

- QuizTakingInterface: single column, comfortable tap targets — students will realistically take quizzes on phones between classes
- Dashboards/results tables: card-per-row mobile, table desktop
- Tap targets 48px throughout

---

## 5. Page-by-Page UX Flow

### Quizzes (/dashboard/quizzes) — student
```
[QuizCard list: open/upcoming/closed status, own score if already taken]
[Tap an open quiz -> /dashboard/quizzes/[id]/take]
```

### Quiz Taking (/dashboard/quizzes/[id]/take) — QuizShell
```
[Top bar: QuizTimer | Question X of Y | Submit]
[QuestionCard — one question at a time or paginated]
[Submit -> ScoreReveal]
```

### Score Reveal (post-submit)
```
[ScoreReveal — count-up to final score, ScoreBand color]
[Breakdown: correct/incorrect per question, if the lecturer allows
 reviewing answers after submission]
```

### Score History (/dashboard/scores) — student
```
[Per course: CAProgressBar — "18/30 CA marks so far"]
[List of quiz attempts: score, date]
[Download PDF button — full CA breakdown for that course]
```

### Lecturer: Quiz Builder (/dashboard/lecturer/quizzes/new)
```
[Title, course]
[Questions: text, 4 options, correct answer — MCQ only]
[Max score, weight toward CA]
[Duration, start/end window]
[Publish button]
```

### Lecturer: CA Overview (/dashboard/lecturer/ca-overview)
```
[Table: student, running CA total per quiz, cumulative total]
[Export CSV/PDF gradesheet button]
```

---

## 6. Accessibility

- Contrast: Slate 900 on Off-White = 15.8:1 (WCAG AAA)
- QuizTimer legible, never color-alone
- Full keyboard navigation for quiz-taking (real input type="radio" under styled options, per your established convention)

---

## 7. Empty & Loading States

```
No quizzes available: "No quizzes open right now"
No score history yet: "Take your first quiz to see your CA progress"
No results yet (lecturer): "No students have taken this quiz yet"
```

This DESIGN.md pairs with CONTEXT.md for the full technical architecture and PROMPT.md for phase-by-phase scaffolding.
