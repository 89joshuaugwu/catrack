import { NextResponse } from "next/server";
import { apiError, requireUser } from "@/lib/server-auth";
export async function GET(request: Request) {
  try { return NextResponse.json(await requireUser(request), {headers:{"Cache-Control":"private, no-store"}}); }
  catch(error) { return apiError(error); }
}
