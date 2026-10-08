/** Optional portable copy, generated from the same source. No external hosting dependency. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const core=['core','raster','portrait'].map(n=>read('demo/core/'+n+'.js').replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'')).join('\n');
let app=read('demo/app.js').replace(/^import .*;\s*$/gm,'');
const start=app.indexOf('const worker=new Worker('),end=app.indexOf('const equal=',start);
if(start<0||end<0)throw new Error('Standalone assembly contract changed');
app=app.slice(0,start)+'async function render(digest){await new Promise(r=>setTimeout(r,0));return renderPortrait(digest);}\n'+app.slice(end);
const search="await Promise.all(['test-keys','project','build'].map(async n=>{const r=await fetch('./data/'+n+'.json',{cache:'no-store'});if(!r.ok)throw new Error('DEMO_DATA_UNAVAILABLE');return r.json();}))";
if(!app.includes(search))throw new Error('Data loader assembly contract changed');
const data=['test-keys','project','build'].map(n=>JSON.parse(read('demo/data/'+n+'.json')));
app=app.replace(search,JSON.stringify(data));
const script='(()=>{\n'+core+'\n'+app+'\n})();';
const html=read('demo/index.html').replace('<link rel="stylesheet" href="./style.css">','<style>'+read('demo/style.css')+'</style>').replace('<script type="module" src="./app.js"></script>','<script>'+script.replace(/<\/script/gi,'<\\/script')+'</script>');
mkdirSync('dist',{recursive:true});writeFileSync('dist/DeterministicFace-demo.html',html);console.log('Portable self-contained demo built. No credentials included.');
