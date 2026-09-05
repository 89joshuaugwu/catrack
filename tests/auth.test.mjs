import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
const require=createRequire(import.meta.url);
const ts=require("typescript");
function authModule(profile={role:"student",displayName:"Student",email:"student@test.invalid"}){
  const exports={};
  const code=ts.transpileModule(readFileSync(new URL("../lib/server-auth.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  runInNewContext(code,{exports,console,require:name=>{
    if(name==="next/server")return require(name);
    if(name==="./firebase-admin")return {
      adminAuth:{verifyIdToken:async(token,revocation)=>{assert.equal(revocation,true);if(token!=="valid")throw new Error("invalid");return {uid:"student"};}},
      adminDb:{collection:()=>({doc:()=>({get:async()=>({data:()=>profile})})})},
    };
    throw new Error(name);
  }});
  return exports;
}
const req=token=>new Request("http://localhost/api/workspace",{headers:token?{authorization:"Bearer "+token}:{}});
test("server rejects missing, malformed and invalid credentials",async()=>{
  const {requireUser}=authModule();
  await assert.rejects(requireUser(req()),e=>e.status===401);
  await assert.rejects(requireUser(req("invalid")),e=>e.status===401);
});
test("server rejects missing profiles, disabled accounts and unknown roles",async()=>{
  for(const profile of [null,{role:"student",disabled:true},{role:"owner"}])
    await assert.rejects(authModule(profile).requireUser(req("valid")),e=>e.status===403);
});
test("server enforces roles independently of the UI",async()=>{
  const {requireUser}=authModule();
  await assert.rejects(requireUser(req("valid"),["admin","lecturer"]),e=>e.status===403);
  assert.equal((await requireUser(req("valid"),["student"])).uid,"student");
});
