"use client";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "@/lib/firebase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { Course, WorkspaceData } from "@/types";

type Props = { data:WorkspaceData; mutate:(body:unknown)=>Promise<void> };
export function CourseManagement({data,mutate}:Props) {
  const [editing,setEditing]=useState("");
  const [name,setName]=useState("");
  const [code,setCode]=useState("");
  const [lecturerId,setLecturerId]=useState("");
  const [ceiling,setCeiling]=useState(30);
  const [busy,setBusy]=useState(false);
  function edit(c:Course) {setEditing(c.id);setName(c.name);setCode(c.code);setLecturerId(c.lecturerId);setCeiling(c.caCeiling);}
  function reset(){setEditing("");setName("");setCode("");setLecturerId("");setCeiling(30);}
  return <div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="grid content-start gap-4">{!data.courses.length&&<Card>No courses yet. Add a course and assign its lecturer.</Card>}{data.courses.map(c=><Card key={c.id}><div className="flex items-center justify-between gap-4"><div><h2 className="font-bold">{c.code} — {c.name}</h2><p className="mt-2 text-sm text-text-secondary">{data.users.find(u=>u.uid===c.lecturerId)?.displayName??"Unassigned"} · CA ceiling {c.caCeiling}</p></div><Button variant="secondary" onClick={()=>edit(c)}>Edit</Button></div></Card>)}</div>
    <Card className="h-fit"><form className="grid gap-4" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await mutate({action:"saveCourse",id:editing||undefined,name,code,lecturerId,caCeiling:ceiling});reset();toast.success("Course saved.");}catch(e){toast.error((e as Error).message);}finally{setBusy(false);}}}>
      <h2 className="text-lg font-bold">{editing?"Edit course":"Add course"}</h2>
      <label>Course code<input className="field w-full" required maxLength={20} value={code} onChange={e=>setCode(e.target.value)}/></label>
      <label>Course name<input className="field w-full" required value={name} onChange={e=>setName(e.target.value)}/></label>
      <label>Lecturer<select className="field w-full" required value={lecturerId} onChange={e=>setLecturerId(e.target.value)}><option value="">Select lecturer</option>{data.users.filter(u=>u.role==="lecturer"&&!u.disabled).map(u=><option key={u.uid} value={u.uid}>{u.displayName}</option>)}</select></label>
      <label>CA ceiling<input type="number" className="field w-full" min={1} max={100} required value={ceiling} onChange={e=>setCeiling(Number(e.target.value))}/></label>
      <Button disabled={busy}>{busy?"Saving…":"Save course"}</Button>{editing&&<Button type="button" variant="secondary" onClick={reset}>Cancel editing</Button>}
    </form></Card></div>;
}
export function UserManagement({data,mutate,role}:Props & {role:"student"|"lecturer"}) {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const users=data.users.filter(u=>u.role===role);
  return <div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="grid content-start gap-4">{!users.length&&<Card>No {role} accounts yet.</Card>}{users.map(u=><Card key={u.uid}><h2 className="font-bold">{u.displayName}</h2><p className="mb-3 text-sm text-text-secondary break-all">{u.email} · {u.disabled?"Disabled":"Active"}</p><div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={busy} onClick={async()=>{setBusy(true);try{await sendPasswordResetEmail(auth,u.email);toast.success("Password reset email sent.");}catch{toast.error("Could not send reset email. Try again.");}finally{setBusy(false);}}}>Send password reset</Button>{data.user.role==="admin"&&<Button variant="secondary" disabled={busy} onClick={async()=>{if(!window.confirm((u.disabled?"Enable":"Disable")+" access for "+u.displayName+"?"))return;setBusy(true);try{await mutate({action:"setUserDisabled",uid:u.uid,disabled:!u.disabled});}catch(e){toast.error((e as Error).message);}finally{setBusy(false);}}}>{u.disabled?"Enable":"Disable"} access</Button>}</div></Card>)}</div>
    <Card className="h-fit"><form className="grid gap-4" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await mutate({action:"createUser",role,displayName:name,email,password});toast.success("Account created. Share the temporary password securely.");setName("");setEmail("");setPassword("");}catch(e){toast.error((e as Error).message);}finally{setBusy(false);}}}>
      <h2 className="text-lg font-bold">Create {role} account</h2>
      <label>Full name<input className="field w-full" required value={name} onChange={e=>setName(e.target.value)}/></label>
      <label>Email<input type="email" className="field w-full" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label>Temporary password<input type="password" autoComplete="new-password" minLength={12} className="field w-full" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
      <p className="text-xs text-text-secondary">Use at least 12 characters. Share this password with the account holder, who can reset it from sign-in.</p>
      <Button disabled={busy}>{busy?"Creating…":"Create account"}</Button>
    </form></Card></div>;
}
