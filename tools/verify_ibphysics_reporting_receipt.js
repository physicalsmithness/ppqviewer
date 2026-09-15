"use strict";
// Authorised synthetic Test-cohort verification. Never retry an ambiguous append.
const fs=require("fs"),path=require("path"),vm=require("vm"),crypto=require("crypto");
const ROOT=path.resolve(__dirname,".."),receiptPath=path.join(ROOT,"dist/physics-audit/ibphysics-reporting-receipt.json");
async function main(){
 if(process.argv[2]!=="--send")throw Error("Use --send only for the authorised Test-class verification.");
 if(fs.existsSync(receiptPath))throw Error("A receipt already exists; inspect it and the sheet instead of retrying.");
 const stamp=new Date().toISOString(),id="ibphysics-qa-"+crypto.randomUUID();
 const receipt={attempt_id:id,started_at:stamp,project:"ppqviewer_ibphysics",spreadsheet_id:"1kUqhZCTyOMoHzgn2QRB2Dxhp2vSZarLsmMxcCqf5rRA",purpose:"Synthetic IB Physics logging verification authorised by Smith",events:[]};
 const person={anonymous_id:id,display_name:"IB Physics logging test (Codex)",cohort:"Test",signed_in:true};
 const q={id:"TEST-IBPHYSICS-LOGGING",source_part_id:"fixture-no-pupil-question",parent_id:"TEST-IBPHYSICS-LOGGING",question_number:"TEST",label:"",topic_codes:["A.1"],analysis_groups:[],analysis_atoms:[],year:"2025",paper:"2",level:"HL"};
 const row={id:q.id,attempt_id:id,learner_id:person.anonymous_id,ts:stamp,marks_awarded:1,marks_max:2,correct:false,time_ms:12500,timing_mode:"silent",self_report:null,learner_level:"SL"};
 const viewer={cfg:{learnerId:person.anonymous_id,idOf:q=>q.id},cur:q,byId:{[q.id]:q},_attemptId:id,store:{attempts:[row]}};
 fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+"\n");
 const save=()=>fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+"\n");
 const context={window:{fetch:async(url,opts)=>{
   const event={payload:JSON.parse(opts.body),state:"dispatch_started"};receipt.events.push(event);save();
   try{const response=await fetch(url,{method:"POST",headers:opts.headers,body:opts.body,signal:AbortSignal.timeout(45000)});const body=await response.text();event.http_status=response.status;try{event.response=JSON.parse(body);}catch(_){event.response_preview=body.slice(0,200);}event.state=event.response?.ok===true?"receiver_acknowledged":"unconfirmed";save();return response;}
   catch(error){event.state="unconfirmed";event.error=String(error);save();throw error;}
 }}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(ROOT,"example/physics-reporting.js"),"utf8"),context);
 const reporter=context.window.PhysicsReporting.create({enabled:true,identity:{current:()=>person},viewer:()=>viewer});
 await reporter.report({timestamp:stamp,session_id:id,item_id:q.id,status:"answered",qtype:"imageSelfMark",extra_json:JSON.stringify({attempt_id:id,correct:false,time_ms:row.time_ms})});
 if(receipt.events[0]?.state!=="receiver_acknowledged")throw Error("Attempt receipt unconfirmed; do not resend. Inspect the spreadsheet using the saved attempt ID.");
 row.self_report=3;
 await reporter.report({timestamp:new Date().toISOString(),session_id:id,item_id:q.id,status:"rated",qtype:"self_report",extra_json:JSON.stringify({rating:3})});
 if(receipt.events[1]?.state!=="receiver_acknowledged")throw Error("C receipt unconfirmed; do not resend. Inspect the spreadsheet using the saved attempt ID.");
 console.log(JSON.stringify({receipt:receiptPath,attempt_id:id,events:receipt.events.map(event=>({row_type:event.payload.row_type,status:event.payload.status,state:event.state})),sheet_readback_required:true},null,2));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
