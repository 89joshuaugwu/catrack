# Completion audit — 5 September 2026

## Changes

All dashboard routes use the authenticated workspace API. No production page
imports a mock fixture. The obsolete mock module was removed; sample records
exist only in the seed and test fixtures.

| Area | Completed behavior |
| --- | --- |
| Authentication | Verified Firebase tokens, provisioned role checks, disabled-account checks, role redirects, sign-out and password reset |
| Admin | Create/edit courses, assign lecturer, provision students/lecturers, disable/enable accounts, access all assessments and reports |
| Lecturer | Assigned-course access, draft creation, edit before attempts, publish/close/reopen, student provisioning, class results and CA overview |
| Student | Quiz discovery, pre-start screen, original-timer resume, saved answers, auto-submit, explicit retry, result and CA history |
| Reporting | Submitted attempts only, weighted/capped totals, per-quiz class breakdown, PDF/CSV downloads, dated student statements |
| Integrity | Server validation, transactional attempts, duplicate-answer rejection, immutable grading once started, answer-key stripping |
| Review | Lecturer-controlled answers released after the closing window |
| Seed | Missing-record creation only, correct maximum scores, fresh student, no password reset or history overwrite on repeat runs |

The browser no longer reads quiz documents directly. Correct answers remain in
server-readable quiz documents, and the API projects only permitted question
fields into student responses. The updated Firestore rules deny direct access,
including to pre-existing seed documents that contain answer keys.

## Verification

- Production build and strict TypeScript checks pass with Next.js 16.3.4.
- 24 Node tests cover grading, payload validation, timestamps, CA aggregation,
  CSV escaping, authentication, role enforcement, attempt lifecycle,
  answer review timing, course ownership and management validation.
- All 11 browser tests pass in Chrome against a production build with intercepted
  Firebase Auth/API fixtures. They exercise all role areas, protected redirects,
  student submission, error recovery, mobile layout, draft saving, report
  downloads, expiry and autosave retry.
- A read-only check against the configured Firebase project successfully signed
  in the seeded admin, lecturer and student and loaded their live workspaces.
  The student response did not contain answer keys. Live quiz/attempt records
  were not created, submitted, or changed for testing.
- The PDF dependency and Next.js upgrades removed the reported high/critical
  dependency findings. npm install still reports eight moderate findings.
  The Firebase Admin transitive dependency chain needs a separate compatible
  dependency update; a forced major downgrade was not applied.

## Deployment and verification boundaries

1. Deploy this application with the updated lockfile.
2. Publish firestore.rules from this repository in the same rollout.
3. Verify the deployed URL using each seeded role in your testing project.
   Run an actual create/start/submit workflow there before using real assessments.
4. Use npm run seed only if additional sample records are needed. Existing
   passwords and expired windows will not be reset.

The local rules file has not been deployed or exercised in a Firestore emulator
by this audit. Browser/API unit fixtures are not a substitute for a live
transaction/load test. Password reset delivery depends on Firebase configuration
and mailbox availability.

The documented model treats all students as one institution-wide cohort.
There are no per-course enrolments, class rosters or academic terms. Lecturers
can see the student directory, but assessment access is limited to assigned
courses. Adding separate cohorts would require a deliberate data-model change.

The workspace endpoint loads the accessible assessment history in one response;
large institutions should add pagination and scoped reporting queries.

## Repeatable checks

Run npm test, npm run lint, npm run build, then npm run test:browser.
Chrome must be installed. If automatic test-server shutdown hangs on Windows,
start the production server manually and set PLAYWRIGHT_BASE_URL to its URL
before running the browser suite. Stop that server after the tests.

For a read-only live check, run a local server on port 3102 and execute:

    node --env-file=.env.local scripts/check-live.mjs

Use TEST_APP_URL to target a different local port.
