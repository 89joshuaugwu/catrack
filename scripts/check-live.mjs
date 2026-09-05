// Read-only smoke check against a running local CATrack server and seeded accounts.
// Does not create quizzes, start attempts, submit answers, or mutate Firestore.
const base=process.env.TEST_APP_URL??"http://localhost:3102";
const password=process.env.SEED_PASSWORD??"CATrack-demo-2026!";
let failed=false;
for(const [role,email] of [["admin","admin@catrack.test"],["lecturer","uzo.eze@catrack.test"],["student","ada.obi@catrack.test"]]){
  try{
    const login=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key="+process.env.NEXT_PUBLIC_FIREBASE_API_KEY,{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password,returnSecureToken:true}),signal:AbortSignal.timeout(15000),
    });
    const credentials=await login.json();
    if(!login.ok)throw new Error("Seed account sign-in failed: "+(credentials.error?.message??login.status));
    const response=await fetch(base+"/api/workspace",{headers:{Authorization:"Bearer "+credentials.idToken},signal:AbortSignal.timeout(25000)});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error??"Workspace request failed");
    if(data.user.role!==role)throw new Error("Unexpected account role");
    if(role==="student"&&JSON.stringify(data.quizzes).includes("correctOptionId"))throw new Error("Student payload exposes an answer key");
    console.log(role+": OK ("+data.courses.length+" courses, "+data.quizzes.length+" quizzes, "+data.attempts.length+" attempts)");
  }catch(error){failed=true;console.error(role+": "+error.message);}
}
if(failed)process.exitCode=1;
