import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import * as assessment from "../lib/assessment.ts";
const require=createRequire(import.meta.url);
const ts=require("typescript");
class ApiError extends Error {constructor(message,status=400){super(message);this.status=status;}}
function setup(role="lecturer") {
  const store=new Map([
    ["courses/own",{code:"OWN",name:"Own course",lecturerId:"caller",caCeiling:30}],
    ["courses/other",{code:"OTHER",name:"Other course",lecturerId:"another",caCeiling:30}],
    ["users/caller",{role,displayName:"Caller",email:"caller@test.invalid"}],
    ["users/student",{role:"student",displayName:"Student",email:"student@test.invalid"}],
  ]);
  let id=0;
  const snapshot=path=>({id:path.split("/").at(-1),exists:store.has(path),data:()=>store.get(path)});
  const document=path=>({id:path.split("/").at(-1),path,get:async()=>snapshot(path),
    collection:name=>collection(path+"/"+name),set:async data=>store.set(path,data),update:async data=>store.set(path,{...store.get(path),...data})});
  const collection=(path,filters=[],limit=Infinity)=>({
    path,filters,limitValue:limit,
    doc:key=>document(path+"/"+(key??"new-"+(++id))),
    where:(field,op,value)=>collection(path,[...filters,[field,value]],limit),
    limit:n=>collection(path,filters,n),
    get:async()=>{
      const docs=[...store.keys()].filter(key=>key.startsWith(path+"/")&&key.split("/").length===path.split("/").length+1)
        .filter(key=>filters.every(([field,value])=>store.get(key)[field]===value)).slice(0,limit).map(snapshot);
      return {docs,empty:!docs.length};
    },
  });
  const db={collection,runTransaction:async fn=>fn({
    get:ref=>ref.get(),
    set:(ref,data)=>store.set(ref.path,data),
    update:(ref,data)=>store.set(ref.path,{...store.get(ref.path),...data}),
  })};
  const exports={};
  const next=require("next/server");
  const source=ts.transpileModule(readFileSync(new URL("../app/api/workspace/route.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  runInNewContext(source,{exports,console,Date,require:name=>{
    if(name==="next/server")return next;
    if(name==="@/lib/firebase-admin")return {adminDb:db,adminAuth:{}};
    if(name==="@/lib/assessment")return assessment;
    if(name==="@/lib/server-auth")return {ApiError,requireUser:async(_req,roles)=>{
      if(roles&&!roles.includes(role))throw new ApiError("Forbidden",403);
      return {uid:"caller",role,displayName:"Caller",email:"caller@test.invalid"};
    },apiError:e=>next.NextResponse.json({error:e.message},{status:e.status??500})};
    throw new Error(name);
  }});
  const quiz={id:"q",courseId:"own",title:"Test quiz",createdBy:"caller",status:"published",
    startWindow:Date.now()-1000,endWindow:Date.now()+600000,durationMinutes:5,weight:10,maxScore:1,
    questions:[{id:"q1",text:"Question",options:["a","b","c","d"].map(id=>({id,text:id})),correctOptionId:"a"}]};
  store.set("quizzes/q",quiz);
  return {store,quiz,get:()=>exports.GET(new Request("http://localhost/api/workspace")),
    post:body=>exports.POST(new Request("http://localhost/api/workspace",{method:"POST",body:JSON.stringify(body)}))};
}
test("lecturer workspace excludes assessments and attempts owned by other courses",async()=>{
  const {store,quiz,get}=setup();
  store.set("quizzes/other",{...quiz,courseId:"other"});
  const data=await (await get()).json();
  assert.equal(data.quizzes.length,1);
  assert.equal(data.courses.length,1);
});
test("student cannot discover drafts or answer keys",async()=>{
  const {store,quiz,get}=setup("student");
  store.set("quizzes/draft",{...quiz,status:"draft"});
  const data=await (await get()).json();
  assert.equal(data.quizzes.length,1);
  assert.equal(JSON.stringify(data.quizzes).includes("correctOptionId"),false);
  assert.equal(data.users.length,1);
});
test("students cannot use management writes",async()=>{
  assert.equal((await setup("student").post({action:"saveCourse"})).status,403);
});
test("lecturer cannot publish into another lecturer's course",async()=>{
  const {post,quiz}=setup();
  const response=await post({action:"saveQuiz",quiz:{...quiz,courseId:"other"},status:"published"});
  assert.equal(response.status,403);
});
test("started assessments reject edits but allow closure",async()=>{
  const {store,quiz,post}=setup();
  store.set("quizzes/q/attempts/student",{status:"in_progress",startedAt:Date.now()});
  assert.equal((await post({action:"saveQuiz",id:"q",quiz,status:"published"})).status,400);
  assert.equal((await post({action:"quizStatus",id:"q",status:"closed"})).status,200);
  assert.equal(store.get("quizzes/q").status,"closed");
});
test("admin course assignment requires an active lecturer",async()=>{
  const {post}=setup("admin");
  const response=await post({action:"saveCourse",code:"NEW",name:"New course",lecturerId:"student",caCeiling:30});
  assert.equal(response.status,400);
});
test("saved quiz maximum is derived from its questions",async()=>{
  const {post,quiz,store}=setup();
  const response=await post({action:"saveQuiz",quiz:{...quiz,maxScore:500},status:"draft"});
  assert.equal(response.status,200);
  const {id}=await response.json();
  assert.equal(store.get("quizzes/"+id).maxScore,1);
});
