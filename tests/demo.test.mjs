import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {spawn,execFileSync} from 'node:child_process';import {inflateSync} from 'node:zlib';
import {parseHash,digestInput,deriveBytes,uniformInt,hex,sha256,ascii,concat,u32,publicKeyDigest,verifyOperation,LatestOperation} from '../demo/core/core.js';
import {renderPortrait,portraitSpec,RENDER_PROFILE} from '../demo/core/portrait.js';
const vectors=JSON.parse(readFileSync(new URL('./vectors/derivation.json',import.meta.url)));
const keys=JSON.parse(readFileSync(new URL('../demo/data/test-keys.json',import.meta.url))).cases;
const zero='0'.repeat(64),d=digestInput(zero);const sig=s=>Uint8Array.from(s.match(/../g),v=>parseInt(v,16));
for(const c of vectors.cases)test('unchanged vector: '+c.id,async()=>assert.equal(hex(await deriveBytes(digestInput(c.hashHex),c.label,c.index,c.length)),c.expectedHex));
test('strict input parser and canonical casing',()=>{
 assert.equal(hex(digestInput(' \t'+('AB'.repeat(32))+'\r\n')),'ab'.repeat(32));assert.equal(d[0],0);
 for(const input of [null,[],1,'x',{}, {hashAlgorithm:'sha256',hashHex:zero,profile:'df-exp-1',extra:true}])assert.throws(()=>parseHash(input));
 for(const s of ['a'.repeat(63),'a'.repeat(65),'0x'+zero,zero.slice(0,32)+' '+zero.slice(32),'\u00a0'+zero,'g'.repeat(64)])assert.throws(()=>digestInput(s));
 assert.throws(()=>parseHash({hashAlgorithm:'sha512',hashHex:zero,profile:'df-exp-1'}));assert.throws(()=>parseHash({hashAlgorithm:'sha256',hashHex:zero,profile:'latest'}));
});
test('derivation validates all parameter boundaries',async()=>{
 for(const label of ['', 'A','a_','a..b','a-','a'.repeat(65)])await assert.rejects(deriveBytes(d,label,0,32));
 for(const n of [-1,1.5,Infinity,NaN,true,4294967296])await assert.rejects(deriveBytes(d,'face.test',n,32));
 for(const n of [-1,0,8161,1.5,Infinity,true])await assert.rejects(deriveBytes(d,'face.test',0,n));
 await assert.rejects(deriveBytes(new Uint8Array(31),'face.test',0,32));
 assert.equal((await deriveBytes(d,'face.test',0,1)).length,1);assert.equal((await deriveBytes(d,'face.test',0,8160)).length,8160);
});
test('mutable inputs are captured before asynchronous work',async()=>{const bytes=new Uint8Array(32);const promise=deriveBytes(bytes,'face.shape',0,64);bytes.fill(255);assert.equal(hex(await promise),vectors.cases[0].expectedHex);});
test('independent outputs, labels, indices and call-order repeatability',async()=>{
 const a=await deriveBytes(d,'face.shape',0,64);await deriveBytes(d,'background.structure',9,128);const b=await deriveBytes(d,'face.shape',0,64);assert.deepEqual(a,b);a[0]^=255;assert.notDeepEqual(a,b);
 assert.notDeepEqual(b,await deriveBytes(d,'face.shape',1,64));assert.notDeepEqual(b,await deriveBytes(d,'background.structure',0,64));
});
test('uniform integer sampling and exact rejection boundaries',()=>{
 assert.equal(uniformInt(u32(0xffffffff),4294967296),0xffffffff);assert.equal(uniformInt(u32(10),1),0);
 assert.equal(uniformInt(concat(u32(0xffffffff),u32(8)),3),2);assert.throws(()=>uniformInt(u32(0xffffffff),3),/SAMPLE_EXHAUSTED/);
 for(const n of [0,-1,2**32+1,.5,true,NaN])assert.throws(()=>uniformInt(u32(0),n));for(const a of [new Uint8Array(),new Uint8Array(5)])assert.throws(()=>uniformInt(a,3));
});
test('adapter matches independent SHA-256 framing',async()=>{
 const raw=digestInput(keys[0].publicKey);assert.equal(hex(await publicKeyDigest(raw)),hex(await sha256(concat(ascii('deterministicface/ed25519/raw-v1'),new Uint8Array([0]),u32(32),raw))));
 await assert.rejects(publicKeyDigest(new Uint8Array(31)));
});
test('all 100 corpus entries are usable public keys with valid signatures',async()=>{
 assert.equal(keys.length,100);assert.equal(new Set(keys.map(k=>k.publicKey)).size,100);
 for(const k of keys){assert.deepEqual(Object.keys(k).sort(),['id','message','publicKey','signature']);const key=await crypto.subtle.importKey('raw',digestInput(k.publicKey),'Ed25519',true,['verify']);const result=await verifyOperation(key,sig(k.signature),ascii(k.message));assert.equal(result.valid,true);assert.equal(result.publicKey,k.publicKey);}
});
test('actual verifier key drives receipt for success, wrong key and changed message',async()=>{
 const a=await crypto.subtle.importKey('raw',digestInput(keys[0].publicKey),'Ed25519',true,['verify']);const b=await crypto.subtle.importKey('raw',digestInput(keys[1].publicKey),'Ed25519',true,['verify']);const k=keys[0];
 const good=await verifyOperation(a,sig(k.signature),ascii(k.message));const wrong=await verifyOperation(b,sig(k.signature),ascii(k.message));const modified=await verifyOperation(a,sig(k.signature),ascii(k.message+'!'));
 assert.equal(good.valid,true);assert.equal(wrong.valid,false);assert.equal(modified.valid,false);assert.equal(good.digest,modified.digest);assert.notEqual(good.digest,wrong.digest);assert.equal(wrong.publicKey,keys[1].publicKey);
});
test('late operation cannot replace a newer key or edited input',async()=>{const g=new LatestOperation(),old=g.begin();const pending=new Promise(r=>setTimeout(()=>r(g.isCurrent(old)),15));const latest=g.begin();assert.equal(await pending,false);assert.equal(g.isCurrent(latest),true);g.cancel();assert.equal(g.isCurrent(latest),false);});
const expected=['22409d6f4403cc8131b2da6f4a7abf4f8558c09a25ed5587faa561a337457606','89de0efa3af4a95575920b232c53c4d4d42abc454522e6103e1ff0e0b2a69fc0','921784458dd9fb078dada687dbc05dd09512debbd203ddebc075a7356200ac3f','827a1dc6f5527e6002aab921e57f50de314c6e2e7e638041da91f4ae5ef3a81c'];
for(let i=0;i<4;i++)test('canonical complete-pixel golden '+i,async()=>{const r=await renderPortrait(i.toString(16).padStart(64,'0'));assert.equal(r.pixelDigest,expected[i]);assert.equal(r.profile,RENDER_PROFILE);assert.equal(r.pixels.length,1048576);for(let j=3;j<r.pixels.length;j+=4)assert.equal(r.pixels[j],255);});
test('fresh render and fresh process reproduce the same whole image',async()=>{
 const a=await renderPortrait(zero);const b=await renderPortrait(zero);assert.deepEqual(a.pixels,b.pixels);assert.deepEqual(a.png,b.png);
 const fresh=execFileSync(process.execPath,['--input-type=module','-e',"import {renderPortrait} from './demo/core/portrait.js';console.log((await renderPortrait('0'.repeat(64))).pixelDigest)"],{encoding:'utf8'}).trim();assert.equal(fresh,a.pixelDigest);
});
test('one-bit digest mutation changes both face and background regions',async()=>{
 const a=await renderPortrait(zero),b=await renderPortrait('0'.repeat(63)+'1');let face=0,bg=0;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4;if(!a.pixels.subarray(i,i+3).every((v,j)=>v===b.pixels[i+j])){if(x>185&&x<330&&y>150&&y<330)face++;if(x<50||x>462)bg++;}}
 assert.ok(face>20000);assert.ok(bg>35000); // A fixture check, not a universal visual-distance guarantee.
});
test('canonical PNG decodes to the exact canonical RGBA buffer',async()=>{
 const r=await renderPortrait(zero),png=Buffer.from(r.png);assert.equal(png.subarray(1,4).toString(),'PNG');let at=8,idat=[];
 while(at<png.length){const n=png.readUInt32BE(at),type=png.subarray(at+4,at+8).toString();if(type==='IDAT')idat.push(png.subarray(at+8,at+8+n));at+=n+12;}
 const raw=inflateSync(Buffer.concat(idat));const pixels=Buffer.alloc(1048576);for(let y=0;y<512;y++){assert.equal(raw[y*2049],0);raw.copy(pixels,y*2048,y*2049+1,y*2049+2049);}assert.deepEqual(pixels,Buffer.from(r.pixels));
});
test('same-key canonical parameters repeat with no unrelated random state',async()=>{assert.deepEqual(await portraitSpec(zero),await portraitSpec(zero));});
test('server is read-only and cannot serve repository or arbitrary files',async()=>{
 const port=19437;const child=spawn(process.execPath,['scripts/server.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
 try{let ready=false;for(let i=0;i<50;i++){try{if((await fetch(`http://127.0.0.1:${port}/healthz`)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,50));}assert.ok(ready);
  for(const path of ['/loader.php','/.git/config','/%2e%2e%2floader.php','/data/../loader.php','/scripts/server.mjs','/core/','/index.html/extra'])assert.equal((await fetch(`http://127.0.0.1:${port}`+path)).status,404);
  assert.equal((await fetch(`http://127.0.0.1:${port}/`,{method:'POST',body:'no'})).status,405);
  const response=await fetch(`http://127.0.0.1:${port}/`);assert.equal(response.status,200);assert.ok(response.headers.get('content-security-policy').includes("form-action 'none'"));assert.equal(response.headers.get('set-cookie'),null);
  const build=await(await fetch(`http://127.0.0.1:${port}/api/build`)).json();assert.equal(build.authentication,'none');
 }finally{child.kill('SIGTERM');}
});
