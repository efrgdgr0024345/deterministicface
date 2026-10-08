import {digestInput,publicKeyDigest,hex,sha256,deriveBytes,cryptoAPI,ascii,verifyOperation,LatestOperation} from './core/core.js';
import {renderPortrait,RENDER_PROFILE} from './core/portrait.js';
const $=id=>document.getElementById(id);
const current=new LatestOperation(),verification=new LatestOperation();
let last=null,corpus=[],keyPair=null,signature=null,testReport=null,galleryStarted=false,build={};
const urls=new Map();let nextJob=0;const jobs=new Map();
let workerFailed=false;
const worker=new Worker(new URL('./render-worker.js',import.meta.url),{type:'module'});
worker.onmessage=({data})=>{const job=jobs.get(data.id);if(!job)return;jobs.delete(data.id);if(data.error)job.reject(new Error(data.error));else job.resolve(data.result);};
worker.onerror=()=>{workerFailed=true;for(const j of jobs.values())j.reject(new Error('RENDER_WORKER_FAILED'));jobs.clear();};
function render(digest){return new Promise((resolve,reject)=>{if(workerFailed){reject(new Error('RENDER_WORKER_FAILED'));return;}const id=++nextJob;jobs.set(id,{resolve,reject});worker.postMessage({id,digest});});}
const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function status(message,kind=''){const el=$('status');el.textContent=message;el.className='status'+(kind?' '+kind:'');}
function friendly(error){const c=error instanceof Error?error.message:String(error);if(c==='INVALID_INPUT')return 'Enter exactly 64 hexadecimal characters (0–9 and a–f).';if(c.includes('CRYPTO_UNAVAILABLE'))return 'This browser needs HTTPS or localhost and native Web Crypto.';if(c.includes('UNSUPPORTED'))return 'This browser does not support the requested key operation. Use the digest laboratory or a current browser.';return 'The operation could not complete: '+c.slice(0,140);}
function picture(id,result){const previous=urls.get(id);const url=URL.createObjectURL(new Blob([result.png],{type:'image/png'}));$(id).src=url;$(id).hidden=false;urls.set(id,url);if(previous)URL.revokeObjectURL(previous);return url;}
function hideComparison(){$('comparison-card').hidden=true;$('portrait-grid').classList.remove('compare');}
function invalidatePortrait(){
 current.cancel();last=null;hideComparison();$('portrait').hidden=true;$('placeholder').hidden=false;
 $('placeholder').querySelector('p').textContent='Generate a portrait for the current input.';
 $('pixel-hash').textContent='Not generated';$('input-digest').textContent='—';$('render-time').textContent='—';$('portrait-label').textContent='NO CURRENT PORTRAIT';
 $('repeat').disabled=true;$('flip').disabled=true;$('download').classList.add('disabled');$('download').removeAttribute('href');
 $('binding-note').textContent='No portrait is associated with the current input until generation succeeds.';
 const previous=urls.get('portrait');if(previous){URL.revokeObjectURL(previous);urls.delete('portrait');$('portrait').removeAttribute('src');}
}
function setInput(raw,mode='key'){invalidatePortrait();$('input-mode').value=mode;$('key-input').value=raw;}
async function generate(){
 invalidatePortrait();
 const operation=current.begin(),mode=$('input-mode').value,raw=$('key-input').value;
 status('Deriving the complete portrait from the selected input…');hideComparison();
 try{
  const bytes=digestInput(raw),d=mode==='key'?await publicKeyDigest(bytes):bytes;const digest=hex(d);const t=performance.now();
  const result=await render(digest);if(!current.isCurrent(operation))return;
  last={...result,mode,publicInput:hex(bytes)};picture('portrait',result);$('placeholder').hidden=true;
  $('pixel-hash').textContent=result.pixelDigest;$('input-digest').textContent=digest;
  $('render-time').textContent=Math.round(performance.now()-t)+' ms · generated here';
  $('portrait-label').textContent=mode==='key'?'PUBLIC KEY PORTRAIT':'DIGEST LABORATORY';
  $('binding-note').textContent=mode==='key'?'Derived from the public key above. Pasting a key is not authentication; the verification tab demonstrates the actual working-key binding.':'Laboratory digest input only—not a claim that a valid key or authenticated connection exists.';
  $('repeat').disabled=false;$('flip').disabled=false;$('download').classList.remove('disabled');$('download').href=urls.get('portrait');
  status('Portrait generated. The complete face and background come from this input.');
 }catch(e){if(current.isCurrent(operation)){status(friendly(e),'error');$('binding-note').textContent='The current input failed. No portrait is associated with this input.';}}
}
$('generate').onclick=generate;
for(const id of ['key-input','input-mode'])$(id).addEventListener('input',()=>{invalidatePortrait();status('Input changed. Choose Generate portrait to update the image.','warn');});
$('new-key').onclick=async()=>{
 invalidatePortrait();
 const operation=current.begin();status('Creating a new public test key in this browser…');
 try{const pair=await cryptoAPI().generateKey('Ed25519',false,['sign','verify']);const raw=hex(new Uint8Array(await cryptoAPI().exportKey('raw',pair.publicKey)));if(!current.isCurrent(operation))return;setInput(raw);await generate();}catch(e){if(current.isCurrent(operation))status(friendly(e),'error');}
};
$('repeat').onclick=async()=>{
 if(!last)return;const original=last,operation=current.begin();status('Regenerating from scratch; comparing every RGBA pixel…');
 try{const t=performance.now(),r=await render(original.digest);if(!current.isCurrent(operation))return;const same=equal(r.pixels,original.pixels)&&r.pixelDigest===original.pixelDigest;status(same?'PASS — all 1,048,576 RGBA bytes match. Face and background are identical.':'FAIL — pixel mismatch. This output is not conforming.',same?'':'error');$('render-time').textContent=Math.round(performance.now()-t)+' ms · independent regeneration';}catch(e){if(current.isCurrent(operation))status(friendly(e),'error');}
};
$('flip').onclick=async()=>{
 if(!last)return;const original=last,operation=current.begin(),d=digestInput(original.digest);d[31]^=1;status('Changing exactly one bit of the portrait-input digest…');
 try{const r=await render(hex(d));if(!current.isCurrent(operation))return;picture('comparison-image',r);$('comparison-hash').textContent=r.pixelDigest;
  let changed=0;for(let i=0;i<r.pixels.length;i+=4)if(r.pixels[i]!==original.pixels[i]||r.pixels[i+1]!==original.pixels[i+1]||r.pixels[i+2]!==original.pixels[i+2])changed++;
  $('comparison-stats').textContent=(100*changed/262144).toFixed(1)+'% of pixel RGB values changed';$('comparison-card').hidden=false;$('portrait-grid').classList.add('compare');
  status('One digest bit changed. Pixel difference is measured; human distinguishability is not yet proven.');
 }catch(e){if(current.isCurrent(operation))status(friendly(e),'error');}
};
$('close-compare').onclick=()=>{current.cancel();hideComparison();};
for(const tab of document.querySelectorAll('.tab'))tab.onclick=()=>{for(const t of document.querySelectorAll('.tab'))t.classList.toggle('active',t===tab);for(const panel of document.querySelectorAll('.tab-panel'))panel.hidden=panel.id!==tab.dataset.tab;};
$('gallery-button').onclick=async()=>{
 if(galleryStarted)return;galleryStarted=true;$('gallery-button').disabled=true;
 try{for(let i=0;i<12;i++){
  $('gallery-status').textContent=`Generating ${i+1} / 12 from the fixed public-key corpus…`;
  const key=corpus[i],digest=hex(await publicKeyDigest(digestInput(key.publicKey))),r=await render(digest);
  const b=document.createElement('button');b.className='gallery-item';b.type='button';const img=document.createElement('img');img.alt='Generated portrait for public test key '+(i+1);const u=URL.createObjectURL(new Blob([r.png],{type:'image/png'}));img.src=u;urls.set('gallery-'+i,u);const label=document.createElement('span');label.textContent=key.id;b.append(img,label);b.onclick=()=>{setInput(key.publicKey);generate();$('lab').scrollIntoView({behavior:'auto',block:'start'});};$('gallery').append(b);await sleep(0);
 }$('gallery-status').textContent='12 / 12 generated in this browser. Click a portrait to regenerate its key.';}
 catch(e){$('gallery-status').textContent=friendly(e);galleryStarted=false;$('gallery-button').disabled=false;}
};
async function verifyWith(key){
 const op=verification.begin(),msg=ascii($('signed-message').value),sig=new Uint8Array(signature);$('verify-status').textContent='Verifying, then rendering the actual verification key…';
 try{const receipt=await verifyOperation(key,sig,msg);const r=await render(receipt.digest);if(!verification.isCurrent(op))return;
  picture('verify-image',r);$('verify-placeholder').hidden=true;$('verify-key').textContent=receipt.publicKey;$('verify-digest').textContent=receipt.digest;$('verify-pixels').textContent=r.pixelDigest;
  $('signature-result').textContent=receipt.valid?'PASS — signature valid for this key and message.':'FAIL — signature is not valid for this key and message.';
  $('verify-status').textContent=receipt.valid?'Signature verified. The portrait uses that same public-key object.':'Signature failed. The portrait still identifies the key actually used for this failed verification.';
  $('verify-status').className=receipt.valid?'status':'status error';
 }catch(e){if(verification.isCurrent(op)){$('verify-status').textContent=friendly(e);$('verify-status').className='status error';}}
}
$('sign').onclick=async()=>{
 const op=verification.begin();$('verify-status').textContent='Generating a temporary signing key. Its private part is not exported…';
 try{const pair=await cryptoAPI().generateKey('Ed25519',false,['sign','verify']),message=ascii($('signed-message').value);const sig=new Uint8Array(await cryptoAPI().sign('Ed25519',pair.privateKey,message));if(!verification.isCurrent(op))return;keyPair=pair;signature=sig;$('verify-same').disabled=false;$('verify-wrong').disabled=false;await verifyWith(pair.publicKey);}catch(e){if(verification.isCurrent(op))$('verify-status').textContent=friendly(e);}
};
$('verify-same').onclick=()=>{if(keyPair&&signature)verifyWith(keyPair.publicKey);};
$('verify-wrong').onclick=async()=>{if(!signature)return;const op=verification.begin();try{const other=await cryptoAPI().generateKey('Ed25519',false,['sign','verify']);if(verification.isCurrent(op))await verifyWith(other.publicKey);}catch(e){if(verification.isCurrent(op))$('verify-status').textContent=friendly(e);}};
$('signed-message').addEventListener('input',()=>{verification.cancel();if(signature){$('verify-status').textContent='Message edited. The displayed receipt is the previous result. Verify again.';$('verify-status').className='status warn';$('signature-result').textContent='Message changed — needs verification.';}});
async function runSelfTests(){
 $('self-test').disabled=true;$('report').disabled=true;$('test-results').replaceChildren();const rows=[];
 async function check(name,fn){let passed=false;try{passed=!!await fn();}catch{}rows.push({name,passed});const el=document.createElement('div');el.className='test-row'+(passed?'':' failed');el.textContent=(passed?'PASS  ':'FAIL  ')+name;$('test-results').append(el);await sleep(0);}
 const zero=digestInput('0'.repeat(64));
 await check('Original HKDF vector: face.shape',async()=>hex(await deriveBytes(zero,'face.shape',0,64))==='4437d6eb79f70a7a0429ad4a966707551ac0442b056efe1f65b1df65fbec2400e7c609f5651817d213e6f1b2e1338c4d68da33631500449ca1389b8e5ace6559');
 await check('Original HKDF vector: background.structure',async()=>hex(await deriveBytes(zero,'background.structure',0,64))==='3334619cfdec215e134d39054520b00f9cd6d2daef56a37be3a7e4c357425296a0e4f9b05ac9d29b70656fc1d4d8a38d4fd4ff8c4bc09bda2c22b1fce8473a2f');
 let a,b;
 await check('Independent full-pixel regeneration',async()=>{a=await render('0'.repeat(64));b=await render('0'.repeat(64));return equal(a.pixels,b.pixels);});
 await check('Versioned canonical pixel golden fixture',()=>a?.pixelDigest==='22409d6f4403cc8131b2da6f4a7abf4f8558c09a25ed5587faa561a337457606');
 await check('One-bit change alters visible face AND background',async()=>{const r=await render('0'.repeat(63)+'1');let face=false,bg=false;for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4;if(a.pixels[i]!==r.pixels[i]||a.pixels[i+1]!==r.pixels[i+1]||a.pixels[i+2]!==r.pixels[i+2]){if(x>185&&x<330&&y>150&&y<330)face=true;if(x<50||x>462)bg=true;}}return face&&bg;});
 await check('Native Ed25519 valid-signature operation',async()=>{const k=corpus[0],publicKey=await cryptoAPI().importKey('raw',digestInput(k.publicKey),'Ed25519',true,['verify']);const sig=Uint8Array.from(k.signature.match(/../g),v=>parseInt(v,16));return (await verifyOperation(publicKey,sig,ascii(k.message))).valid;});
 await check('Wrong key is rejected; receipt follows wrong key',async()=>{const k=corpus[0],other=corpus[1],key=await cryptoAPI().importKey('raw',digestInput(other.publicKey),'Ed25519',true,['verify']);const receipt=await verifyOperation(key,Uint8Array.from(k.signature.match(/../g),v=>parseInt(v,16)),ascii(k.message));return !receipt.valid&&receipt.publicKey===other.publicKey;});
 await check('Stale asynchronous operation rejected',async()=>{const gate=new LatestOperation();const old=gate.begin();const pending=sleep(20).then(()=>gate.isCurrent(old));const newest=gate.begin();return !await pending&&gate.isCurrent(newest);});
 await check('Malformed hexadecimal input rejected',()=>{try{digestInput('not-a-key');return false;}catch{return true;}});
 testReport={schema:1,profile:RENDER_PROFILE,build:build.sha??null,ranAt:new Date().toISOString(),tests:rows,passed:rows.filter(r=>r.passed).length,total:rows.length,scope:'Browser conformance checks, not human-recognition or security evidence.'};
 const sum=document.createElement('div');sum.className='test-row';sum.textContent=`RESULT ${testReport.passed} / ${testReport.total} passed.`;$('test-results').append(sum);$('self-test').disabled=false;$('report').disabled=false;return testReport;
}
$('self-test').onclick=runSelfTests;
$('report').onclick=()=>{if(!testReport)return;const a=document.createElement('a');const u=URL.createObjectURL(new Blob([JSON.stringify(testReport,null,2)],{type:'application/json'}));a.href=u;a.download='deterministicface-test-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),5000);};
async function start(){
 try{
  const [keys,scope,b]=await Promise.all(['test-keys','project','build'].map(async n=>{const r=await fetch('./data/'+n+'.json',{cache:'no-store'});if(!r.ok)throw new Error('DEMO_DATA_UNAVAILABLE');return r.json();}));corpus=keys.cases;build=b;
  for(const text of scope.scope){const p=document.createElement('p');p.textContent=text;$('project-scope').append(p);}
  for(const reference of scope.references){const div=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=reference.name;p.textContent=reference.work;div.append(h,p);if(/^https:\/\//.test(reference.url)){const a=document.createElement('a');a.href=reference.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Original work ↗';div.append(a);}$('credits').append(div);}
  for(const [k,v] of Object.entries({'Demo version':b.version,'Build commit':b.sha||'Local development build','Uncommitted source changes':b.dirty===null?'Not determined':b.dirty?'Yes':'No','Rendering profile':b.profile,'Compute location':'Your browser; no inference API','Learned face model':'Not implemented','Research validation':'Not performed'})){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;$('build-info').append(dt,dd);}
  setInput(corpus[0].publicKey);await generate();
 }catch(e){status(friendly(e),'error');$('placeholder').querySelector('p').textContent='Startup failed. See the message above.';}
}
Object.defineProperty(window,'DFDemo',{value:Object.freeze({render,runSelfTests,getPublicState:()=>last?{digest:last.digest,pixelDigest:last.pixelDigest,profile:last.profile}:null}),writable:false});
start();
