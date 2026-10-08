/** Read-only allowlisted demo server. Never serves the repository root or executes PHP. */
import http from 'node:http';
import {readFile,realpath,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=await realpath(fileURLToPath(new URL('../demo/',import.meta.url)));
const port=Number(process.env.PORT||8000);if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid demo port');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Permissions-Policy':'camera=(), microphone=(), geolocation=()', 'Content-Security-Policy':"default-src 'none'; script-src 'self'; worker-src 'self'; connect-src 'self'; img-src 'self' blob: data:; style-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"};
 const send=(code,type,body)=>{res.writeHead(code,{...headers,'Content-Type':type});res.end(req.method==='HEAD'?undefined:body);};
 if(!['GET','HEAD'].includes(req.method||'')){send(405,'text/plain','Read-only demo');return;}
 try{
  const raw=(req.url||'/').split('?')[0];let path=decodeURIComponent(raw);
  if(path==='/healthz'){send(200,'application/json',JSON.stringify({ok:true,service:'deterministicface-demo'}));return;}
  if(path==='/api/build')path='/data/build.json';
  if(path==='/')path='/index.html';
  if(path.includes('\\')||path.includes('\0')||path.split('/').some(p=>p.startsWith('.'))||!/^\/(?:index\.html|app\.js|style\.css|render-worker\.js|core\/[a-z-]+\.js|data\/[a-z-]+\.json|CREDITS\.txt)$/.test(path)){send(404,'text/plain','Not found');return;}
  const target=await realpath(resolve(root,'.'+path));
  if(!target.startsWith(root+sep)||!(await stat(target)).isFile()){send(404,'text/plain','Not found');return;}
  const bytes=await readFile(target);send(200,mime[extname(target)]||'application/octet-stream',bytes);
 }catch{send(404,'text/plain','Not found');}
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Port already in use; no unrelated process was stopped.':'Demo server could not start.');process.exit(1);});
server.listen(port,'0.0.0.0',()=>console.log(`DeterministicFace demo ready: http://localhost:${port}`));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
