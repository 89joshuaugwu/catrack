// Rebuild the shareable tester guide without reading application secrets.
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const pdf = new jsPDF({ unit: "mm", format: "a4" });
const blue = [37, 99, 235];
const ink = [15, 23, 42];
const muted = [71, 85, 105];
const site = "https://ca-track.vercel.app";
let y = 0;
let pageNumber = 0;
const bounds = [];
function page(section, title, intro) {
  if (pageNumber) pdf.addPage();
  pageNumber++;
  pdf.setFillColor(...blue); pdf.rect(0, 0, 210, 4, "F");
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(12); pdf.setTextColor(...ink);
  pdf.text("CATrack", 18, 16);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(...muted);
  pdf.text("TESTER HANDBOOK  /  SEPTEMBER 2026", 192, 16, { align: "right" });
  y = 31;
  pdf.setFont("helvetica", "bold"); pdf.setTextColor(...blue); pdf.setFontSize(10);
  pdf.text(section.toUpperCase(), 18, y); y += 11;
  pdf.setTextColor(...ink); pdf.setFontSize(23); pdf.text(title, 18, y); y += 9;
  paragraph(intro);
}
function paragraph(text, gap = 4) {
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(10.5); pdf.setTextColor(...muted);
  const lines = pdf.splitTextToSize(text, 174);
  pdf.text(lines, 18, y, { lineHeightFactor: 1.4 });
  y += lines.length * 5.2 + gap;
  check();
}
function heading(text) {
  y += 2;
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(13); pdf.setTextColor(...ink);
  pdf.text(text, 18, y); y += 7;
}
function step(n, title, description) {
  pdf.setFillColor(239, 246, 255); pdf.roundedRect(18, y - 4, 8, 8, 2, 2, "F");
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...blue);
  pdf.text(String(n), 22, y + 1, { align: "center" });
  pdf.setTextColor(...ink); pdf.setFontSize(11); pdf.text(title, 30, y + 1); y += 8;
  paragraph(description);
}
function table(head, rows, widths) {
  autoTable(pdf, {
    startY: y, margin: { left: 18, right: 18, bottom: 25 },
    head: [head], body: rows, theme: "grid",
    styles: { font:"helvetica", fontSize:9.5, cellPadding:2, textColor:ink, lineColor:[226,232,240], overflow:"linebreak" },
    headStyles: { fillColor:blue, textColor:255, fontStyle:"bold" },
    columnStyles: Object.fromEntries(widths.map((cellWidth, i) => [i, { cellWidth }])),
  });
  y = pdf.lastAutoTable.finalY + 8; check();
}
function note(title, text) {
  const lines = pdf.splitTextToSize(text, 164);
  const height = 14 + lines.length * 4.7;
  pdf.setFillColor(239, 246, 255); pdf.roundedRect(18, y - 2, 174, height, 3, 3, "F");
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...blue);
  pdf.text(title, 23, y + 4);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(...ink);
  pdf.text(lines, 23, y + 11, { lineHeightFactor:1.3 });
  y += height + 5; check();
}
function check() {
  if (y > 268) throw new Error("Content exceeds the safe page area on page " + pageNumber + ": " + y);
  bounds.push({ page:pageNumber, bottom:y });
}

page("01 / Start here", "Your first complete test",
  "A practical guide for non-technical testers. You will act as an administrator, a teacher (called a lecturer on the site), and a student. Allow about 20-30 minutes.");
heading("Open the website");
pdf.setFont("helvetica", "normal"); pdf.setFontSize(12); pdf.setTextColor(...blue);
pdf.textWithLink(site + "/auth/login", 18, y, {url:site+"/auth/login"}); y += 10;
paragraph("Use Chrome, Edge, Safari, or Firefox with an internet connection. On a computer, navigation is on the left; on a phone, it is at the bottom. Click Continue after entering your email and password.");
table(["Role", "Email to type", "What this account does"], [
  ["Admin", "admin@catrack.test", "Creates courses and staff/student accounts."],
  ["Teacher / lecturer", "uzo.eze@catrack.test", "Creates quizzes and checks class results."],
  ["Student - start here", "new.student@catrack.test", "Takes your new practice quiz."],
  ["Other sample student", "ada.obi@catrack.test", "Has sample assessment history."],
  ["Other sample student", "chike.nwosu@catrack.test", "Has a sample late-submission record."],
], [39, 69, 66]);
note("Sample password: CATrack-demo-2026!",
  "Use this password for newly seeded accounts. Existing accounts kept their previous password. Type email addresses exactly as printed: no backslashes, quotes, or spaces. Passwords are case-sensitive.");
heading("The test route");
paragraph("Admin creates course  >  Lecturer publishes quiz  >  Student answers  >  Lecturer checks results  >  Admin reviews totals.");
paragraph("Use Sign out at the top before switching accounts. Signing into another account in a second tab can switch the session in all tabs. This guide contains test credentials: share it only with your testing group.", 0);

page("02 / Administrator", "Create and assign a course",
  "Sign in as admin@catrack.test. The administrator prepares the course and assigns the lecturer who will assess it.");
step(1, "Open Courses", "Select Courses in the navigation. Find the Add course form.");
table(["Field", "Sample value"], [
  ["Course code", "TEST101"],
  ["Course name", "CATrack Practice Course"],
  ["Lecturer", "Dr. Uzo Eze"],
  ["CA ceiling", "30"],
], [52,122]);
step(2, "Select Save course", "Your course should appear in the catalogue with Dr. Uzo Eze assigned and a CA ceiling of 30. This ceiling is the maximum running CA total for that course.");
step(3, "Confirm assignment", "Select Edit beside the new course and confirm the lecturer and ceiling. Use Cancel editing if no change is needed. If TEST101 already exists, use TEST102 or a different unused code and keep the same code throughout this guide.");
heading("Optional: try account creation");
paragraph("Open Lecturers or Students. Enter a Full name, a new Email, and a Temporary password of at least 12 characters, then select Create account. The lecturer can also create student accounts from Students.");
paragraph("Example: name Test Teacher; email teacher2@catrack.test; temporary password CATrack-Teacher-2026! These are suggested inputs, not existing accounts. For another run, choose a new unused email.");
note("Expected result",
  "The course appears with its assigned lecturer. Any account you create appears in the relevant list. For the main walkthrough, keep using the seeded lecturer Dr. Uzo Eze.");
paragraph("Select Sign out, then sign in as uzo.eze@catrack.test.");

page("03 / Lecturer", "Build a two-question quiz",
  "Sign in as uzo.eze@catrack.test. Open Quiz library, then select New quiz. Use the new practice course from page 2.");
table(["Field", "Enter or select"], [
  ["Quiz title", "Practice Quiz 1"],
  ["Course", "TEST101 - CATrack Practice Course (or your chosen code)"],
  ["Weight toward CA", "10"],
  ["Duration (minutes)", "10"],
  ["Opens", "Today, about 5 minutes before the current time"],
  ["Closes", "Today, about 1 hour after the current time"],
], [52,122]);
paragraph("Dates and times follow your device's local time. The opening-to-closing window must be at least as long as the duration. With the values above, students can begin immediately.");
table(["Question", "Options to type", "Mark correct"], [
  ["1. What is 2 + 2?", "A: 3\nB: 4\nC: 5\nD: 6", "B - 4"],
  ["2. Which device is used to type text?", "A: Keyboard\nB: Monitor\nC: Speaker\nD: Printer", "A - Keyboard"],
], [70,70,34]);
paragraph("Enter question 1 and all four options. Click the small circle beside option B to mark it correct. Select + Add question for question 2, enter its options, and select the circle beside A.");
note("Publish and check",
  "Select Publish quiz. Practice Quiz 1 should appear in Quiz library. Optionally use Save draft first, then Edit quiz and publish. Drafts still need valid details, dates, questions, and options; students cannot see them.");
paragraph("Optional: enable Allow answer review after the quiz window closes. Correct answers will be available to students only after Closes. Questions and grading cannot be edited once any attempt has started.");

page("04 / Student", "Take the quiz and see your score",
  "Sign out of the lecturer account. Sign in as new.student@catrack.test using the sample password. This is the recommended account for a fresh test.");
step(1, "Find Practice Quiz 1", "Open My quizzes. Search for Practice Quiz 1 or filter by your practice course. The status should say Open now. Select Review & start.");
step(2, "Read the instructions, then begin", "The pre-start page shows the question count, duration, weight, and closing time. Select Begin / resume / view result. Your timer starts now.");
step(3, "Answer the two questions", "For question 1, choose B: 4. Select Next or question number 2. For question 2, deliberately choose B: Monitor. This gives one correct and one incorrect answer for an easy scoring check.");
step(4, "Wait for Answers saved", "You can move between question numbers and change answers before submission. If saving fails, use Retry saving answers. Keep the page open until saving or submission succeeds.");
step(5, "Submit once", "Select Submit quiz and accept the confirmation. You cannot change answers or retake this quiz after submission. If submission fails, use Retry submission.");
note("Expected score",
  "You should receive 1 out of 2 (50%). Select View CA progress. Practice Quiz 1 should contribute 5.0 CA marks to the practice course: 1 / 2 x 10 = 5.");
paragraph("If this is the only completed quiz for the course, the total should be 5.0 / 30. If you chose both correct answers instead, expect 2 / 2 and 10.0 / 30. Select Download statement to save your course CA report as a PDF.");

page("05 / Results", "Confirm the marks on both sides",
  "Sign out of the student account and sign in again as uzo.eze@catrack.test.");
step(1, "Check the individual result", "Open Quiz library. Find Practice Quiz 1 and select View results. Look for New Student, the email new.student@catrack.test, a score of 1 / 2, and On time if submitted within the allowed time.");
step(2, "Download class results", "Select Export CSV and Export PDF. Open the downloaded files and confirm the student name and score. CSV files can be opened in Excel or another spreadsheet app.");
step(3, "Check the running total", "Open Class progress and locate your practice course. New Student should show 5.00 under Practice Quiz 1 and a total of 5.00 out of 30. Other students may have a dash where they have not submitted.");
heading("Optional: verify addition across two quizzes");
paragraph("Create Practice Quiz 2 for the same course, with one question, a CA weight of 5, and an open window. Ask 'How many days are in a week?' Use A: 5, B: 6, C: 7, D: 8; mark C correct.");
paragraph("Sign in as New Student, take Practice Quiz 2, and choose C: 7. Expect 1 / 1 and an extra 5 CA marks. Your running course total should now be 10 / 30, assuming no other submitted quizzes in this practice course.");
step(4, "Confirm the administrator's view", "Sign out and sign in as admin@catrack.test. Open Results for class totals, or Quizzes then View results for a single quiz. The same student marks should appear.");
note("What the marks mean",
  "A quiz score is the number of correct answers. CA contribution is score divided by question count, multiplied by its assigned weight. Contributions add together, but the total never exceeds the course CA ceiling.");
paragraph("The current test system uses one shared student cohort. There is no separate enrolment step for your new course. A lecturer manages assessments for courses assigned to them.");

page("06 / Extra checks & help", "Finish the test with confidence",
  "Use a fresh quiz for each extra attempt. A submitted attempt cannot be reset by signing out or running the seed again.");
table(["Optional check", "What to do and expect"], [
  ["Resume an attempt", "Start a fresh quiz, answer a question, wait for Answers saved, then refresh. Use Begin / resume / view result to continue. The answer returns and the original timer continues."],
  ["Automatic submission", "Create a fresh quiz with a 1-minute duration and a longer open window. Answer, wait for saving, and let time run out with the page open. Answers lock and submission starts."],
  ["Close a quiz", "As lecturer, select Close quiz before a fresh student starts. That student should not be able to begin. Closure prevents new starts; already-started timers continue."],
  ["Review answers", "Enable review before publishing. After submission and after the closing time, return through View result. Correct answers should now be shown."],
], [43,131]);
heading("If something does not look right");
paragraph("Cannot sign in? Retype the email without backslashes. Existing accounts may have an older password; ask the person running the test to confirm it. The @catrack.test addresses are sample identities, not real mailboxes: password-reset emails cannot be received there.");
paragraph("No course or quiz? Use Refresh, check the course filter, confirm the lecturer assignment, and confirm the quiz is published and its time window is open. If screens differ from this guide or show errors, ask the project owner to confirm that the latest site and access rules are deployed.");
paragraph("Already submitted or closed? Create a new practice quiz or use another unused student account. Re-running the seed preserves existing work and does not reopen old quiz windows.");
heading("Send your test result to the project owner");
paragraph("Record: your name and date; the role/email used; course code; quiz title; the button you clicked; expected result; actual result; and a screenshot if there is a problem. Do not include passwords in screenshots.");
note("Completion checklist",
  "Course assigned [ ]  Quiz published [ ]  Student submitted [ ]  Score correct [ ]  CA total correct [ ]  Lecturer result matches [ ]  PDF/CSV open [ ]  Signed out [ ]");

if (pdf.getNumberOfPages() !== 6) throw new Error("Unexpected overflow page.");
for (let p=1; p<=pdf.getNumberOfPages(); p++) {
  pdf.setPage(p);
  pdf.setDrawColor(226,232,240); pdf.line(18,278,192,278);
  pdf.setFont("helvetica","normal"); pdf.setFontSize(8); pdf.setTextColor(...muted);
  pdf.text("CATrack | Sample credentials - testing use only",18,285);
  pdf.text(p+" / "+pdf.getNumberOfPages(),192,285,{align:"right"});
}
pdf.setProperties({title:"CATrack - Non-technical testing guide",subject:"Admin, lecturer and student testing walkthrough",author:"CATrack",keywords:"testing, quiz, continuous assessment, guide"});
pdf.save("ca-track guild.pdf");
console.log("Created ca-track guild.pdf ("+pdf.getNumberOfPages()+" pages).");
console.log("Checked content bounds; maximum bottom: "+Math.max(...bounds.map(b=>b.bottom)).toFixed(1)+" mm.");
