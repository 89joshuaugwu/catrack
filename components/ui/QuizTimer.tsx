"use client";
import { useEffect, useRef, useState } from "react";
export default function QuizTimer({startedAt,durationMinutes,onExpire}:{startedAt:number;durationMinutes:number;onExpire?:()=>void}) {
  const endAt=startedAt+durationMinutes*60000;
  const [remaining,setRemaining]=useState(Math.max(0,endAt-Date.now()));
  const callback=useRef(onExpire);
  callback.current=onExpire;
  useEffect(()=>{
    let fired=false;
    function tick(){
      const next=Math.max(0,endAt-Date.now());setRemaining(next);
      if(next===0&&!fired){fired=true;callback.current?.();}
    }
    tick();
    const timer=setInterval(tick,1000);
    return()=>clearInterval(timer);
  },[endAt]);
  const seconds=Math.ceil(remaining/1000);
  return <div role="timer" aria-label="Time remaining" className={"font-tnum text-2xl font-bold "+(seconds<60?"text-error":"text-primary")}>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</div>;
}
