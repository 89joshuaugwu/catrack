import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import * as assessment from "../lib/assessment.ts";
const require=createRequire(import.meta.url);
const ts=require("typescript");
class ApiError extends Error { constructor(message,status=400){super(message);this.status=status;} }
function setup(){
  let now=1000000;
  const store=new Map();
  const ref=path=>({path,collection:name=>({doc:id=>ref(path+"/"+name+"/"+id)}),doc:id=>ref(path+"/"+id)});
  const snapshot=r=>({exists:store.has(r.path),data:()=>store.get(r.path)});
  let serial=Promise.resolve();
  const db={collection:name=>ref(name),runTransaction:fn=>{
    const result=serial.then(()=>fn({
      get:async r=>snapshot(r),
      create:(r,d)=>{assert.equal(store.has(r.path),false);store.set(r.path,d);},
      update:(r,d)=>store.set(r.path,{...store.get(r.path),...d}),
    }));
    serial=result.catch(()=>{});
    return result;
  }};
  const exports={};
  const source=ts.transpileModule(readFileSync(new URL("../lib/quiz-attempts.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  runInNewContext(source,{exports,require:name=>{
    if(name==="./firebase-admin")return {adminDb:db};
    if(name==="./server-auth")return {ApiError};
    if(name==="./assessment")return assessment;
    if(name==="firebase-admin/firestore")return {Timestamp:{fromMillis:n=>({toMillis:()=>n})}};
    throw new Error("Unexpected import "+name);
  },Date:{now:()=>now}});
  const quiz={id:"quiz",title:"Quiz",courseId:"c",createdBy:"l",status:"published",durationMinutes:1,startWindow:now-1000,endWindow:now+500000,maxScore:99,weight:10,questions:[{id:"q",text:"Question",options:[{id:"a",text:"A"},{id:"b",text:"B"}],correctOptionId:"a"}]};
  store.set("quizzes/quiz",quiz);
  return {store,quiz,api:exports,setNow:n=>{now=n;}};
}
test("concurrent starts resume a single original timestamp without exposing keys",async()=>{
  const {api,store}=setup();
  const [a,b]=await Promise.all([api.startQuizAttempt("quiz","student"),api.startQuizAttempt("quiz","student")]);
  assert.equal(a.startedAt,b.startedAt);
  assert.equal(store.size,2);
  assert.equal(a.quiz.maxScore,1);
  assert.equal("correctOptionId" in a.quiz.questions[0],false);
});
test("draft, closed, future and nonexistent quizzes cannot start",async()=>{
  for(const patch of [{status:"draft"},{status:"closed"},{startWindow:2000000}]){
    const {api,quiz}=setup();Object.assign(quiz,patch);
    await assert.rejects(api.startQuizAttempt("quiz","student"),/not currently available/);
  }
  await assert.rejects(setup().api.startQuizAttempt("missing","student"),/not found/);
});
test("submission requires an attempt and duplicate answers are rejected",async()=>{
  const {api}=setup();
  await assert.rejects(api.saveOrSubmitAttempt("quiz","student",[],true),/Start this quiz/);
  await api.startQuizAttempt("quiz","student");
  await assert.rejects(api.saveOrSubmitAttempt("quiz","student",[{questionId:"q",selectedOptionId:"a"},{questionId:"q",selectedOptionId:"a"}],true));
});
test("autosaved answers survive resume; repeat submission returns original result",async()=>{
  const {api}=setup();
  await api.startQuizAttempt("quiz","student");
  await api.saveOrSubmitAttempt("quiz","student",[{questionId:"q",selectedOptionId:"a"}],false);
  assert.equal((await api.startQuizAttempt("quiz","student")).answers.length,1);
  assert.equal((await api.saveOrSubmitAttempt("quiz","student",[{questionId:"q",selectedOptionId:"a"}],true)).score,1);
  assert.equal((await api.saveOrSubmitAttempt("quiz","student",[],true)).score,1);
});
test("after grace period only server-saved answers count, with late flag",async()=>{
  const {api,setNow}=setup();
  await api.startQuizAttempt("quiz","student");
  setNow(1100000);
  const result=await api.saveOrSubmitAttempt("quiz","student",[{questionId:"q",selectedOptionId:"a"}],true);
  assert.equal(result.score,0);
  assert.equal(result.lateSubmission,true);
});
test("closing window also limits save time, even if timer has minutes left",async()=>{
  const {api,quiz,setNow}=setup();
  quiz.endWindow=1001000;
  await api.startQuizAttempt("quiz","student");
  setNow(1002000);
  await assert.rejects(api.saveOrSubmitAttempt("quiz","student",[],false),/Time is up/);
});
test("answer review is withheld until the closing time",async()=>{
  const {api,quiz,setNow}=setup();
  quiz.allowReview=true;
  await api.startQuizAttempt("quiz","student");
  const result=await api.saveOrSubmitAttempt("quiz","student",[],true);
  assert.equal(result.review.length,0);
  setNow(quiz.endWindow+1);
  const resumed=await api.startQuizAttempt("quiz","student");
  assert.equal(resumed.result.review[0].correctOptionId,"a");
});
