import { test, expect, type Page } from "@playwright/test";

// Deterministic UI fixtures; production routes never import these.
async function signIn(page:Page, role:"student"|"lecturer"|"admin") {
  const now=Date.now();
  const user={uid:"test-"+role,displayName:"Test "+role,email:role+"@catrack.test",role};
  const jwt=[{alg:"none"},{sub:user.uid,user_id:user.uid,iat:Math.floor(now/1000),exp:Math.floor(now/1000)+3600,aud:"test",iss:"test"}].map(x=>Buffer.from(JSON.stringify(x)).toString("base64url")).join(".")+".signature";
  await page.route("https://identitytoolkit.googleapis.com/**",route=>{
    const lookup=route.request().url().includes("lookup");
    return route.fulfill({json:lookup?{users:[{localId:user.uid,email:user.email,displayName:user.displayName,emailVerified:true}]}:{localId:user.uid,email:user.email,idToken:jwt,refreshToken:"test-refresh",expiresIn:"3600",registered:true}});
  });
  await page.route("**/api/profile",r=>r.fulfill({json:user}));
  const questions=[{id:"one",text:"Choose the first option",options:[{id:"a",text:"First"},{id:"b",text:"Second"},{id:"c",text:"Third"},{id:"d",text:"Fourth"}],...(role!=="student"?{correctOptionId:"a"}:{})}];
  const quizzes=[{id:"seeded-quiz",courseId:"course",title:"Seeded assessment",createdBy:"test-lecturer",status:"published",questions,maxScore:1,weight:10,durationMinutes:15,startWindow:now-10000,endWindow:now+3600000}];
  const data={user,courses:[{id:"course",name:"Computer Science",code:"CSC301",lecturerId:"test-lecturer",caCeiling:30}],quizzes,attempts:[],users:[user,{uid:"test-lecturer",displayName:"Test lecturer",email:"lecturer@catrack.test",role:"lecturer"},{uid:"test-student",displayName:"Test student",email:"student@catrack.test",role:"student"}]};
  await page.route("**/api/workspace",r=>r.fulfill({json:r.request().method()==="GET"?data:{ok:true,id:"saved"}}));
  await page.route("**/api/quizzes/seeded-quiz/start",r=>r.fulfill({json:{quiz:quizzes[0],startedAt:now,serverNow:Date.now(),durationMinutes:15,answers:[],result:null}}));
  await page.route("**/api/quizzes/seeded-quiz/save",r=>r.fulfill({json:{saved:true}}));
  await page.route("**/api/quizzes/seeded-quiz/submit",r=>r.fulfill({json:{score:1,maxScore:1,lateSubmission:false}}));
  await page.goto("/auth/login");
  await page.getByLabel("Institutional email").fill(user.email);
  await page.getByLabel("Password",{exact:true}).fill("testing-password-123");
  await page.getByRole("button",{name:"Continue"}).click();
  await expect(page).toHaveURL(/dashboard/);
  return data;
}
test("all protected pages redirect unauthenticated visitors",async({page})=>{
  for(const path of ["/dashboard/admin/courses","/dashboard/admin/lecturers","/dashboard/admin/students","/dashboard/lecturer/quizzes","/dashboard/lecturer/quizzes/new","/dashboard/lecturer/quizzes/seeded-quiz/results","/dashboard/lecturer/ca-overview","/dashboard/scores","/dashboard/quizzes/seeded-quiz/take"]){
    await page.goto(path);await expect(page).toHaveURL(/auth\/login/);
  }
});
test("student can open seeded quiz, save answer, submit and view scores",async({page})=>{
  await signIn(page,"student");
  await page.getByRole("link",{name:"Review & start"}).click();
  await page.getByRole("button",{name:"Begin / resume / view result"}).click();
  await page.getByText("First",{exact:true}).click();
  await expect(page.getByRole("radio",{name:"First",exact:true})).toBeChecked();
  await expect(page.getByText("Answers saved")).toBeVisible();
  page.on("dialog",d=>d.accept());
  await page.getByRole("button",{name:"Submit quiz",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Seeded assessment — Submitted"})).toBeVisible();
  await page.getByRole("link",{name:"View CA progress"}).click();
  await expect(page.getByRole("heading",{name:"CA progress",exact:true})).toBeVisible();
});
test("lecturer results, overview, builder and student management resolve",async({page})=>{
  await signIn(page,"lecturer");
  await page.getByRole("link",{name:"View results"}).click();
  await expect(page.getByRole("heading",{name:"Assessment results"})).toBeVisible();
  await expect(page.getByText("No students have taken this quiz yet")).toBeVisible();
  for(const [path,title] of [["ca-overview","Class progress"],["students","Student accounts"],["quizzes/new","Create or edit quiz"],["quizzes/seeded-quiz/edit","Create or edit quiz"]]){
    await page.goto("/dashboard/lecturer/"+path);await expect(page.getByRole("heading",{name:title,exact:true})).toBeVisible();
  }
});
test("admin assignment edit and account pages work",async({page})=>{
  await signIn(page,"admin");
  await page.getByRole("button",{name:"Edit",exact:true}).click();
  await expect(page.getByLabel("Course code")).toHaveValue("CSC301");
  await page.getByLabel("CA ceiling").fill("40");
  const write=page.waitForRequest(r=>r.url().endsWith("/api/workspace")&&r.method()==="POST");
  await page.getByRole("button",{name:"Save course"}).click();
  expect((await write).postDataJSON()).toMatchObject({action:"saveCourse",id:"course",lecturerId:"test-lecturer",caCeiling:40});
  for(const [path,title] of [["lecturers","Lecturer accounts"],["students","Student accounts"]]){
    await page.goto("/dashboard/admin/"+path);await expect(page.getByRole("heading",{name:title,exact:true})).toBeVisible();
  }
});
test("failed data request shows retry instead of an endless spinner",async({page})=>{
  await signIn(page,"lecturer");
  await page.route("**/api/workspace",r=>r.fulfill({status:500,json:{error:"Temporary failure"}}));
  await page.goto("/dashboard/lecturer/ca-overview");
  await expect(page.getByRole("alert").filter({hasText:"Temporary failure"})).toContainText("Temporary failure");
  await expect(page.getByRole("button",{name:"Try again"})).toBeVisible();
});
test("student cannot open admin workspace",async({page})=>{
  await signIn(page,"student");
  await page.goto("/dashboard/admin/courses");
  await expect(page).toHaveURL(/dashboard\/quizzes$/);
  await expect(page.getByRole("heading",{name:"Your quizzes"})).toBeVisible();
});
test("mobile navigation does not obscure page content",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await signIn(page,"admin");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
});

test("PDF and CSV reports download successfully",async({page})=>{
  const data=await signIn(page,"lecturer");
  const reportData={...data,attempts:[{uid:"test-student",quizId:"seeded-quiz",status:"submitted",score:1,startedAt:Date.now()-10000,submittedAt:Date.now(),answers:[],lateSubmission:false}]};
  await page.route("**/api/workspace",r=>r.fulfill({json:reportData}));
  await page.goto("/dashboard/lecturer/quizzes/seeded-quiz/results");
  for(const format of ["PDF","CSV"]){
    const download=page.waitForEvent("download");
    await page.getByRole("button",{name:"Export "+format,exact:true}).click();
    const file=await download;
    expect(file.suggestedFilename()).toMatch(new RegExp("\\."+format.toLowerCase()+"$"));
    expect(await file.failure()).toBeNull();
  }
  await page.goto("/dashboard/lecturer/ca-overview");
  await expect(page.getByRole("cell",{name:"10.00",exact:true}).first()).toBeVisible();
  const download=page.waitForEvent("download");
  await page.getByRole("button",{name:"Export PDF",exact:true}).click();
  expect(await (await download).failure()).toBeNull();
});

test("quiz builder saves the complete payload and chosen draft status",async({page})=>{
  await signIn(page,"lecturer");
  await page.goto("/dashboard/lecturer/quizzes/new");
  await page.getByLabel("Quiz title",{exact:true}).fill("New assessment");
  await page.getByLabel("Opens",{exact:true}).fill("2027-01-01T09:00");
  await page.getByLabel("Closes",{exact:true}).fill("2027-01-01T10:00");
  await page.getByLabel("Question 1 text",{exact:true}).fill("Select A");
  for(const letter of ["A","B","C","D"])
    await page.getByLabel("Question 1, option "+letter,{exact:true}).fill(letter);
  const saved=page.waitForRequest(r=>r.url().endsWith("/api/workspace")&&r.method()==="POST");
  await page.getByRole("button",{name:"Save draft",exact:true}).click();
  const payload=(await saved).postDataJSON();
  expect(payload).toMatchObject({action:"saveQuiz",status:"draft",quiz:{title:"New assessment",courseId:"course",maxScore:1}});
  expect(payload.quiz.questions[0].correctOptionId).toBe(payload.quiz.questions[0].options[0].id);
  await expect(page).toHaveURL(/lecturer\/quizzes$/);
});

test("resuming restores saved answer and expiry submits only once",async({page})=>{
  const data=await signIn(page,"student");
  let submissions=0;
  await page.route("**/api/quizzes/seeded-quiz/start",r=>r.fulfill({json:{
    quiz:data.quizzes[0],startedAt:Date.now()-15*60000+2000,serverNow:Date.now(),
    durationMinutes:15,answers:[{questionId:"one",selectedOptionId:"a"}],result:null,
  }}));
  await page.route("**/api/quizzes/seeded-quiz/submit",r=>{
    submissions++;
    return r.fulfill({json:{score:1,maxScore:1,lateSubmission:false}});
  });
  await page.getByRole("link",{name:"Review & start"}).click();
  await page.getByRole("button",{name:"Begin / resume / view result"}).click();
  await expect(page.getByRole("radio",{name:"First",exact:true})).toBeChecked();
  await expect(page.getByRole("heading",{name:/Submitted$/})).toBeVisible({timeout:8000});
  expect(submissions).toBe(1);
});

test("failed autosave can be retried without losing the selected answer",async({page})=>{
  await signIn(page,"student");
  let fail=true;
  await page.route("**/api/quizzes/seeded-quiz/save",r=>r.fulfill(
    fail ? {status:503,json:{error:"Try again"}} : {json:{saved:true}}
  ));
  await page.getByRole("link",{name:"Review & start"}).click();
  await page.getByRole("button",{name:"Begin / resume / view result"}).click();
  await page.getByText("First",{exact:true}).click();
  await expect(page.getByRole("button",{name:"Retry saving answers"})).toBeVisible();
  fail=false;
  await page.getByRole("button",{name:"Retry saving answers"}).click();
  await expect(page.getByText("Answers saved")).toBeVisible();
  await expect(page.getByRole("radio",{name:"First",exact:true})).toBeChecked();
});
