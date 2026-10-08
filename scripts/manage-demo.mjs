/** Owner-side lifecycle only. Nothing in this file is served to visitors. */
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,mkdirSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {resolve} from 'node:path';import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));process.chdir(root);
const runtime=resolve('.demo-runtime');mkdirSync(runtime,{recursive:true});const pidFile=resolve(runtime,'server.pid');
const command=process.argv[2]||'status';const serverPath=resolve('scripts/server.mjs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function ownerPID(){try{const pid=Number(readFileSync(pidFile,'utf8'));if(!Number.isInteger(pid)||pid<1)return null;const cmd=readFileSync(`/proc/${pid}/cmdline`,'utf8').split('\0');return cmd.includes(serverPath)?pid:null;}catch{return null;}}
async function health(){try{const r=await fetch('http://127.0.0.1:8000/healthz',{signal:AbortSignal.timeout(1000)});return r.ok&&(await r.json()).service==='deterministicface-demo';}catch{return false;}}
function run(exe,args){const r=spawnSync(exe,args,{stdio:'inherit'});if(r.status!==0)throw new Error('Command failed; demo was not promoted.');}
async function stop(){const pid=ownerPID();if(pid){process.kill(pid,'SIGTERM');for(let i=0;i<30;i++){try{process.kill(pid,0);}catch{break;}await wait(100);}console.log('Demo process stopped.');}else console.log('No owned demo process to stop.');if(existsSync(pidFile))unlinkSync(pidFile);}
async function announce(){
 console.log('Working locally: http://localhost:8000');
 const name=process.env.CODESPACE_NAME,domain=process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN||'app.github.dev';
 if(name&&/^[a-z0-9-]+$/.test(name)&&/^[a-z0-9.-]+$/.test(domain)){
  // The owner expressly requested a password-free public test demo. Only port 8000 is shared.
  const result=spawnSync('gh',['codespace','ports','visibility','8000:public','-c',name],{stdio:'ignore',timeout:15000});
  if(result.status===0)console.log('Public port enabled. Open: https://'+name+'-8000.'+domain);
  else console.log('Open the Ports tab, open port 8000 in a browser. Public visibility could not be set automatically; change only this port to Public to share it.');
 }
}
async function start(){
 if(await health()){if(ownerPID()){console.log('Demo already running.');await announce();return;}throw new Error('Port 8000 is occupied by an unowned process. Nothing stopped.');}
 if(!existsSync('demo/core/portrait.js')||!existsSync('demo/data/build.json'))throw new Error('Build missing. Run npm ci && npm test before starting.');
 const log=openSync(resolve(runtime,'server.log'),'a',0o600);
 // The public static server does not inherit GitHub tokens or Codespaces secrets.
 const child=spawn(process.execPath,[serverPath],{cwd:root,detached:true,stdio:['ignore',log,log],env:{PATH:process.env.PATH||'',PORT:'8000'}});closeSync(log);child.unref();writeFileSync(pidFile,String(child.pid),{mode:0o600});
 for(let i=0;i<40;i++){if(await health()){await announce();return;}await wait(100);}throw new Error('Demo did not start. No endpoint has been claimed as running.');
}
try{
 if(command==='start')await start();
 else if(command==='stop')await stop();
 else if(command==='status')console.log(await health()?'Demo is listening on port 8000.':'Demo is not running.');
 else if(command==='update'){
  const dirty=execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim();if(dirty)throw new Error('Local changes found. Preserving them; automatic update stopped.');
  await stop();run('git',['pull','--ff-only']);run('npm',['ci','--ignore-scripts','--no-audit','--no-fund']);run('npm',['test']);await start();
 }else throw new Error('Use start, stop, status or update.');
}catch(e){console.error(e.message);process.exitCode=1;}
