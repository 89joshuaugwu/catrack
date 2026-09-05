import { POST as workspacePost } from "@/app/api/workspace/route";
import { apiError } from "@/lib/server-auth";
// Compatibility endpoint; uses the same validated account management.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    return workspacePost(new Request(request.url, {
      method:"POST", headers:request.headers,
      body:JSON.stringify({ ...body, action:"createUser", role:"lecturer" }),
    }));
  } catch(error) { return apiError(error); }
}
