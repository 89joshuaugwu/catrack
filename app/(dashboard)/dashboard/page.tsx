"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { useCurrentUser, rolePath } from "@/lib/client-data";
export default function DashboardHome(){const {user,loading}=useCurrentUser();const router=useRouter();useEffect(()=>{if(!loading)router.replace(user?rolePath(user.role):"/auth/login");},[loading,user,router]);return <div className="grid min-h-screen place-items-center"><Spinner/></div>;}
