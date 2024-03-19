var e=require("@actions/core"),t=require("@actions/github"),o=require("@alwaysmeticulous/common"),r=require("@alwaysmeticulous/remote-replay-launcher"),n=require("@alwaysmeticulous/sentry"),s=require("loglevel"),a=require("retry"),i=require("@alwaysmeticulous/client"),l=require("luxon"),u=require("child_process");function c(e){return e&&e.__esModule?e.default:e}const h=async e=>{const t=a.operation({retries:7,factor:2,minTimeout:1e3}),o=new URL(e);t.attempt((async()=>{await p(o)||t.retry(new Error(`Could not connect to '${e}'. Please check:\n\n1. The server running at '${e}' has fully started by the time the Meticulous action starts. You may need to add a 'sleep 30' after starting the server to ensure that this is the case.\n2. The server running at '${e}' is using tcp instead of tcp6. You can use 'netstat -tulpen' to see what addresses and ports it is bound to.\n\n`))}))},p=async e=>{try{const t=await async function(e){const t=new AbortController,o=setTimeout((()=>t.abort()),5e3),r=await fetch(e,{signal:t.signal});return clearTimeout(o),r}(e);return 502!==t.status}catch(e){return!1}};["  permissions:","    actions: write","    checks: write","    contents: read","    discussions: write","    pull-requests: write","    statuses: write","    deployments: read",""].join("\n");const w=e=>g(e).toLowerCase().includes("resource not accessible by integration")||403===e?.status,g=e=>{const t=e?.message??"";return"string"==typeof t?t:""},d=e=>{const t=c(s).getLogger(o.METICULOUS_LOGGER_NAME);switch((e||"").toLocaleLowerCase()){case"trace":t.setLevel(c(s).levels.TRACE,!1);break;case"debug":t.setLevel(c(s).levels.DEBUG,!1);break;case"info":t.setLevel(c(s).levels.INFO,!1);break;case"warn":t.setLevel(c(s).levels.WARN,!1);break;case"error":t.setLevel(c(s).levels.ERROR,!1);break;case"silent":t.setLevel(c(s).levels.SILENT,!1)}},f=e=>e.slice(0,7),m=l.Duration.fromObject({seconds:10}),b=l.Duration.fromObject({seconds:5}),y=async({context:e,octokit:t})=>{const{owner:o,repo:r}=e.repo,n=e.runId,{data:s}=await t.rest.actions.getWorkflowRun({owner:o,repo:r,run_id:n});return{workflowId:s.workflow_id}},k=async({owner:e,repo:t,workflowId:r,ref:n,commitSha:a,octokit:i})=>{try{await i.rest.actions.createWorkflowDispatch({owner:e,repo:t,workflow_id:r,ref:n})}catch(e){const t=c(s).getLogger(o.METICULOUS_LOGGER_NAME);return(e?.message??"").includes("Workflow does not have 'workflow_dispatch' trigger")?(t.error(`Could not trigger a workflow run on commit ${f(a)} of the base branch (${n}) to compare against, because there was no Meticulous workflow with the 'workflow_dispatch' trigger on the ${n} branch. Visual snapshots of the new flows will be taken, but no comparisons will be made. If you haven't merged the PR to setup Meticulous in Github Actions to the ${n} branch yet then this is expected. Otherwise please check that Meticulous is running on the ${n} branch, that it has a 'workflow_dispatch' trigger, and has the appropiate permissions. See https://app.meticulous.ai/docs/github-actions-v2 for the correct setup.`),void t.debug(e)):w(e)?(t.error(`Missing permission to trigger a workflow run on the base branch (${n}). Visual snapshots of the new flows will be taken, but no comparisons will be made. Please add the 'actions: write' permission to your workflow YAML file: see https://app.meticulous.ai/docs/github-actions-v2 for the correct setup.`),void t.debug(e)):void t.error(`Could not trigger a workflow run on commit ${f(a)} of the base branch (${n}) to compare against. Visual snapshots of the new flows will be taken, but no comparisons will be made. Please check that Meticulous is running on the ${n} branch, that it has a 'workflow_dispatch' trigger, and has the appropiate permissions. See https://app.meticulous.ai/docs/github-actions-v2 for the correct setup.`,e)}await E(m);return await _({owner:e,repo:t,workflowId:r,commitSha:a,octokit:i})},$=async({owner:e,repo:t,workflowRunId:r,octokit:n,timeout:a})=>{const i=c(s).getLogger(o.METICULOUS_LOGGER_NAME);let u=null;const h=l.DateTime.now();for(;(null==u||v(u.status))&&l.DateTime.now().diff(h)<a;){u=(await n.rest.actions.getWorkflowRun({owner:e,repo:t,run_id:r})).data,i.debug(JSON.stringify({id:u.id,status:u.status,conclusion:u.conclusion},null,2)),await E(b)}return u},_=async({owner:e,repo:t,workflowId:r,commitSha:n,octokit:a})=>{const i=c(s).getLogger(o.METICULOUS_LOGGER_NAME),l=await a.rest.actions.listWorkflowRuns({owner:e,repo:t,workflow_id:r,head_sha:n});i.debug(`Workflow runs list: ${JSON.stringify(l.data,null,2)}`);const u=l.data.workflow_runs.find((e=>v(e.status)));if(null!=u)return{...u,workflowRunId:u.id}},v=e=>["in_progress","queued","requested","waiting"].some((t=>t===e)),E=async e=>new Promise((t=>setTimeout(t,e.toMillis()))),T=l.Duration.fromObject({minutes:30}),S=l.Duration.fromObject({minutes:10}),L=async(...t)=>{const r=c(s).getLogger(o.METICULOUS_LOGGER_NAME);try{return await q(...t)}catch(o){r.error(o);const n=`Error while running tests on base ${t[0].base}. No diffs will be reported for this run.`;return r.warn(n),(0,e.warning)(n),{shaToCompareAgainst:null}}},q=async({event:t,apiToken:r,base:n,context:a,octokit:l})=>{const u=c(s).getLogger(o.METICULOUS_LOGGER_NAME),{owner:h,repo:p}=a.repo;if(!n)return{shaToCompareAgainst:null};const w=await(0,i.getLatestTestRunResults)({client:(0,i.createClient)({apiToken:r}),commitSha:n,logicalEnvironmentVersion:5});if(null!=w)return u.info(`Tests already exist for commit ${n} (${w.id})`),{shaToCompareAgainst:n};const{workflowId:g}=await y({context:a,octokit:l}),d=await _({owner:h,repo:p,workflowId:g,commitSha:n,octokit:l});if(null!=d)return u.info(`Waiting on workflow run on base commit (${n}) to compare against: ${d.html_url}`),"pull_request"===t.type?(await U({owner:h,repo:p,workflowRunId:d.workflowRunId,octokit:l,commitSha:n,timeout:T}),{shaToCompareAgainst:n}):await R({owner:h,repo:p,workflowRunId:d.workflowRunId,octokit:l,commitSha:n,timeout:S,logger:u});if("pull_request"!==t.type)return{shaToCompareAgainst:null};const f=t.payload.pull_request.base.ref;u.debug(JSON.stringify({base:n,baseRef:f},null,2));const m=await I({owner:h,repo:p,ref:f,octokit:l});if(u.debug(JSON.stringify({owner:h,repo:p,base:n,baseRef:f,currentBaseSha:m},null,2)),n!==m){const t=`Meticulous tests on base commit ${n} haven't started running so we have nothing to compare against.\n    In addition we were not able to trigger a run on ${n} since the '${f}' branch is now pointing to ${m}.\n    Therefore no diffs will be reported for this run. Re-running the tests may fix this.`;return u.warn(t),(0,e.warning)(t),{shaToCompareAgainst:null}}const b=await k({owner:h,repo:p,workflowId:g,ref:f,commitSha:n,octokit:l});if(null==b){const t=`Warning: Could not retrieve dispatched workflow run. Will not perform diffs against ${n}.`;return u.warn(t),(0,e.warning)(t),{shaToCompareAgainst:null}}return u.info(`Waiting on workflow run: ${b.html_url}`),await U({owner:h,repo:p,workflowRunId:b.workflowRunId,octokit:l,commitSha:n,timeout:T}),{shaToCompareAgainst:n}},U=async({commitSha:e,...t})=>{const o=await $(t);if(null==o||v(o.status))throw new Error(`Timed out while waiting for workflow run (${t.workflowRunId}) to complete.`);if("completed"!==o.status||"success"!==o.conclusion)throw new Error(`Comparing against visual snapshots taken on ${e}, but the corresponding workflow run [${o.id}] did not complete successfully. See: ${o.html_url}`)},R=async({commitSha:e,logger:t,...o})=>{const r=await $(o);return null==r||v(r.status)?(t.warn(`Timed out while waiting for workflow run (${o.workflowRunId}) to complete. Running without comparisons.`),{shaToCompareAgainst:null}):"completed"!==r.status||"success"!==r.conclusion?(t.warn(`Comparing against visual snapshots taken on ${e}, but the corresponding workflow run [${r.id}] did not complete successfully. See: ${r.html_url}. Running without comparisons.`),{shaToCompareAgainst:null}):{shaToCompareAgainst:e}},I=async({owner:e,repo:t,ref:r,octokit:n})=>{try{const o=await n.rest.repos.getBranch({owner:e,repo:t,branch:r});return o.data.commit.sha}catch(e){if(w(e))throw new Error(`Missing permission to get the head commit of the branch '${r}'. This is required in order to correctly calculate the two commits to compare. Please add the 'contents: read' permission to your workflow YAML file: see https://app.meticulous.ai/docs/github-actions-v2 for the correct setup.`);throw c(s).getLogger(o.METICULOUS_LOGGER_NAME).error(`Unable to get head commit of branch '${r}'. This is required in order to correctly calculate the two commits to compare. Please check www.githubstatus.com, and that you have setup the action correctly, including with the correct permissions: see https://app.meticulous.ai/docs/github-actions-v2 for the correct setup.`),e}},A=({event:e,head:t})=>"push"===e.type?{context:{type:"github",event:"push",beforeSha:e.payload.before,afterSha:e.payload.after,ref:e.payload.ref}}:"pull_request"===e.type?{context:{type:"github",event:"pull-request",title:e.payload.pull_request.title,number:e.payload.pull_request.number,htmlUrl:e.payload.pull_request.html_url,baseSha:e.payload.pull_request.base.sha,headSha:e.payload.pull_request.head.sha}}:{context:{type:"github",event:"workflow-dispatch",ref:e.payload.ref,inputs:e.payload.inputs,headSha:t}},C=async(e,o)=>{if("pull_request"===e.type){const t=e.payload.pull_request.head.sha,r=e.payload.pull_request.base.sha,n=e.payload.pull_request.base.ref;return o.useDeploymentUrl?{base:await M(t,r,n)??r,head:t}:{base:await G(t,r)??r,head:t}}return"push"===e.type?{base:e.payload.before,head:e.payload.after}:"workflow_dispatch"===e.type?{base:null,head:t.context.sha}:O(e)},O=e=>{throw new Error("Unexpected event: "+JSON.stringify(e))},M=(e,t,r)=>{const n=c(s).getLogger(o.METICULOUS_LOGGER_NAME);try{N(),(0,u.execSync)(`git fetch origin ${e}`),(0,u.execSync)(`git fetch origin ${r}`);const o=(0,u.execSync)(`git merge-base ${e} origin/${r}`).toString().trim();return x(o)?o:(n.error(`Failed to get merge base of ${e} and ${r}: value returned by 'git merge-base' was not a valid git SHA ('${o}').Using the base of the pull request instead (${t}).`),null)}catch(o){return n.error(`Failed to get merge base of ${e} and ${r}. Error: ${o}. Using the base of the pull request instead (${t}).`),null}},G=(e,t)=>{const r=process.env.GITHUB_SHA,n=c(s).getLogger(o.METICULOUS_LOGGER_NAME);if(null==r)return n.error(`No GITHUB_SHA environment var set, so can't work out true base of the merge commit. Using the base of the pull request instead (${t}).`),null;try{N();const o=(0,u.execSync)("git rev-list --max-count=1 HEAD").toString().trim();if(o!==r)return n.info(`The head commit SHA (${o}) does not equal GITHUB_SHA environment variable (${r}).\n          This is likely because a custom ref has been passed to the 'actions/checkout' action. We're assuming therefore\n          that the head commit SHA is not a temporary merge commit, but rather the head of the branch. Therefore we're\n          using the base of the pull request (${t}) to compare the visual snapshots against, and not the base\n          of GitHub's temporary merge commit.`),null;const s=(0,u.execSync)(`git cat-file -p ${r}`).toString().split("\n").filter((e=>e.startsWith("parent "))).map((e=>e.substring(7).trim()));if(2!==s.length)return n.error(`GITHUB_SHA (${r}) is not a merge commit, so can't work out true base of the merge commit. Using the base of the pull request instead.`),null;const a=s[0];return s[1]!==e?(n.error(`The second parent (${s[1]}) of the GITHUB_SHA merge commit (${r}) is not equal to the head of the PR (${e}),\n        so can not confidently determine the base of the merge commit to compare against. Using the base of the pull request instead (${t}).`),null):a}catch(e){return n.error(`Error getting base of merge commit (${r}). Using the base of the pull request instead (${t}).`,e),null}},N=()=>{(0,u.execSync)(`git config --global --add safe.directory "${process.cwd()}"`)},x=e=>/^[a-f0-9]{40}$/.test(e),H=(e,t)=>"push"===e?{type:"push",payload:t}:"pull_request"===e?{type:"pull_request",payload:t}:"workflow_dispatch"===e?{type:"workflow_dispatch",payload:t}:null,D=e=>{if(null==e)throw new Error("github-token is required");try{return(0,t.getOctokit)(e)}catch(e){throw c(s).getLogger(o.METICULOUS_LOGGER_NAME).error(e),new Error("Error connecting to GitHub. Did you specify a valid 'github-token'?")}},W=({name:e,required:t,type:o})=>{const r=e.toUpperCase().replaceAll("-","_"),n=process.env[r];if(("string"===o||"string-array"===o)&&""===n&&!t)return null;const s=B(n,o);if(t&&null==s)throw new Error(`Input ${e} is required`);if(t&&F(s)&&"string-array"!==o)throw new Error(`Input ${e} is required`);if(null!=s&&typeof s!==j(o))throw new Error(`Expected ${o} for input ${e}, but got ${typeof s}`);return s},B=(e,t)=>{if(null==e)return null;if("string"===t)return e;if("string-array"===t)return-1===e.indexOf("\n")?e.split(",").map((e=>e.trim())).filter((e=>""!==e)):e.split("\n").map((e=>e.trim())).filter((e=>""!==e));if("int"===t){const t=Number.parseInt(e);return isNaN(t)?null:t}if("float"===t){const t=Number.parseFloat(e);return isNaN(t)?null:t}if("boolean"===t){if(""===e)return null;if("true"!==e&&"false"!==e)throw new Error("Boolean inputs must be equal to the string 'true' or the string 'false'");return"true"===e}return P(t)},P=e=>{throw new Error(`Only string or number inputs currently supported, but got ${e}`)},F=e=>null==e||"string"==typeof e&&0===e.length,j=e=>"string-array"===e?"object":"string"===e?"string":"int"===e||"float"===e?"number":"boolean"===e?"boolean":P(e);(async()=>{c(s).getLogger(o.METICULOUS_LOGGER_NAME).setDefaultLevel(c(s).levels.INFO);const a=await(0,n.initSentry)("report-diffs-action-in-cloud-v1",1),i=a.startTransaction({name:"report-diffs-action.runMeticulousTestsActionInCloud",description:"Run Meticulous tests action (in cloud)",op:"report-diffs-action.runMeticulousTestsActionInCloud"});+(process.env.RUNNER_DEBUG??"0")&&d("trace");const{apiToken:l,githubToken:u,appUrl:p}={apiToken:W({name:"api-token",required:!0,type:"string"}),githubToken:W({name:"github-token",required:!0,type:"string"}),appUrl:W({name:"app-url",required:!0,type:"string"})},{payload:w}=t.context,g=H(t.context.eventName,w),m=D(u),b=c(s).getLogger(o.METICULOUS_LOGGER_NAME);if(null==g)return void b.warn(`Running report-diffs-action is only supported for 'push',       'pull_request' and 'workflow_dispatch' events, but was triggered       on a '${t.context.eventName}' event. Skipping execution.`);const{base:y,head:k}=await C(g,{useDeploymentUrl:!1}),{shaToCompareAgainst:$}=(A({event:g,head:k}),await L({event:g,apiToken:l,base:y,context:t.context,octokit:m}));null!=$&&"pull_request"===g.type?b.info(`Comparing visual snapshots for the commit head of this PR, ${f(k)}, against ${f($)}`):null!=$?b.info(`Comparing visual snapshots for commit ${f(k)} against commit ${f($)}}`):b.info(`Generating visual snapshots for commit ${f(k)}`);try{await h(p);const e=({url:e,basicAuthUser:t,basicAuthPassword:o})=>{b.info(`Secure tunnel to ${p} created: ${e}, user: ${t}, password: ${o}`)};await(0,r.executeRemoteTestRun)({apiToken:l,appUrl:p,commitSha:k,environment:"github-actions",onTunnelCreated:e}),i.setStatus("ok"),i.finish(),await(a.getClient()?.close(5e3)),process.exit(0)}catch(t){const o=t instanceof Error?t.message:`${t}`;(0,e.setFailed)(o),i.setStatus("unknown_error"),i.finish(),await(a.getClient()?.close(5e3)),process.exit(1)}})().catch((t=>{const o=t instanceof Error?t.message:`${t}`;(0,e.setFailed)(o),process.exit(1)}));
//# sourceMappingURL=in-cloud.entrypoint.js.map
