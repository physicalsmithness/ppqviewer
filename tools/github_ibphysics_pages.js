"use strict";
// Use the existing Git credential helper for this one authorized repository.
// Credentials remain in memory and are never written to output or files.
const {execFileSync} = require("child_process");
const ROOT = require("path").resolve(__dirname,"..");
const repository = "physicalsmithness/ibphysicsppqs";
async function main() {
  const credential = execFileSync("git",["credential","fill"],{
    cwd:ROOT,input:"protocol=https\nhost=github.com\npath="+repository+".git\n\n",encoding:"utf8",stdio:["pipe","pipe","pipe"]
  });
  const token = credential.split(/\r?\n/).find(s=>s.startsWith("password="));
  if (!token) throw Error("The existing Git credential helper did not supply access.");
  const api = async (suffix,method="GET",body) => {
    const response = await fetch("https://api.github.com/repos/"+repository+suffix,{
      method,headers:{Authorization:"Bearer "+token.slice(9),Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"},
      body:body ? JSON.stringify(body) : undefined
    });
    const result = response.status === 204 ? {} : await response.json();
    return {status:response.status,result};
  };
  const command=process.argv[2] || "status";
  if (command === "status") {
    const repo=await api(""),pages=await api("/pages");
    console.log(JSON.stringify({repository:repository,repository_status:repo.status,private:repo.result.private,permissions:repo.result.permissions,default_branch:repo.result.default_branch,pages_status:pages.status,pages:pages.status === 200 ? {status:pages.result.status,html_url:pages.result.html_url,source:pages.result.source,build_type:pages.result.build_type} : {message:pages.result.message}},null,2));
  } else if (command === "enable") {
    const existing=await api("/pages");
    if (existing.status === 200) {
      if (existing.result.source?.branch !== "main" || existing.result.source?.path !== "/") throw Error("Existing Pages source differs; inspect before updating.");
      console.log(JSON.stringify({already_enabled:true,url:existing.result.html_url}));
    } else if(existing.status === 404) {
      const created=await api("/pages","POST",{build_type:"legacy",source:{branch:"main",path:"/"}});
      if(created.status !== 201) throw Error("Pages setup returned "+created.status+": "+created.result.message);
      console.log(JSON.stringify({enabled:true,url:created.result.html_url,status:created.result.status}));
    } else throw Error("Unable to read Pages settings: "+existing.status);
  } else if(command === "build") {
    const latest=await api("/pages/builds/latest");
    console.log(JSON.stringify({http_status:latest.status,status:latest.result.status,commit:latest.result.commit,error:latest.result.error?.message,message:latest.result.message},null,2));
  } else throw Error("Unknown command");
}
main().catch(error=>{console.error(error.message.includes("credential") ? "Git credential access failed." : error.message);process.exitCode=1;});
