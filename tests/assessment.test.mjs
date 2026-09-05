import test from "node:test";
import assert from "node:assert/strict";
import { gradeAnswers, validateAnswers, validateQuiz, studentQuiz, millis } from "../lib/assessment.ts";
import { computeCAScore } from "../lib/ca-scoring.ts";
import { csvText } from "../lib/csv.ts";
const questions = [1,2].map(id => ({id:String(id),text:"Question "+id,correctOptionId:"a",options:["a","b","c","d"].map(id=>({id,text:id}))}));
const quiz = {id:"q",title:"Quiz",courseId:"c",createdBy:"l",questions,maxScore:2,weight:10,durationMinutes:5,startWindow:1000,endWindow:400000,status:"published"};
test("grading counts each question at most once",()=>{
  assert.equal(gradeAnswers([{questionId:"1",selectedOptionId:"a"},{questionId:"1",selectedOptionId:"a"}],questions),1);
  assert.equal(gradeAnswers([{questionId:"1",selectedOptionId:"a"},{questionId:"2",selectedOptionId:"b"}],questions),1);
});
test("submission rejects duplicates, unknown questions and invalid options",()=>{
  for(const value of [null,{},[{questionId:"3",selectedOptionId:"a"}],[{questionId:"1",selectedOptionId:"x"}],[{questionId:"1",selectedOptionId:"a"},{questionId:"1",selectedOptionId:"b"}]])
    assert.throws(()=>validateAnswers(value,questions));
  assert.deepEqual(validateAnswers([],questions),[]);
});
test("quiz validation rejects missing answers, bad windows and invalid weights",()=>{
  assert.doesNotThrow(()=>validateQuiz(quiz));
  for(const patch of [{durationMinutes:0},{endWindow:1001},{weight:-1},{questions:[]},{questions:[{...questions[0],correctOptionId:"x"}]}])
    assert.throws(()=>validateQuiz({...quiz,...patch}));
});
test("student payload strips keys and all unrecognized fields",()=>{
  const clean=studentQuiz({...quiz,secret:"hidden",questions:[{...questions[0],explanation:"answer a"}]});
  assert.equal(JSON.stringify(clean).includes("correctOptionId"),false);
  assert.equal("secret" in clean,false);
  assert.equal("explanation" in clean.questions[0],false);
});
test("timestamps accept existing numeric seeds and Firestore timestamps",()=>{
  assert.equal(millis(123),123);assert.equal(millis({toMillis:()=>456}),456);
  assert.throws(()=>millis("yesterday"));
});
test("CA normalizes by quiz weight and caps at ceiling",()=>{
  assert.equal(computeCAScore([{quizId:"q",score:1}],[quiz],30),5);
  assert.equal(computeCAScore([{quizId:"q",score:2}],[quiz],6),6);
  assert.equal(computeCAScore([{quizId:"q",score:2},{quizId:"q",score:2}],[quiz],30),10);
  assert.equal(computeCAScore([{quizId:"q",score:NaN}],[quiz],30),0);
  assert.equal(computeCAScore([{quizId:"q",score:1}],[{...quiz,maxScore:0}],30),0);
});
test("CSV handles commas, quotes and spreadsheet formulas",()=>{
  assert.equal(csvText([['Obi, Ada','say "hi"','=1+1']]),'"Obi, Ada","say ""hi""","\'=1+1"');
});
