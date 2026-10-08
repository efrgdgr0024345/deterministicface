import {generateCorpus} from './corpus.mjs';
import {spawnSync,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));process.chdir(root);
const compiler=existsSync('node_modules/typescript/bin/tsc')?[process.execPath,['node_modules/typescript/bin/tsc']]:['tsc',[]];
const run=spawnSync(compiler[0],compiler[1],{stdio:'inherit'});if(run.status!==0)process.exit(run.status||1);
mkdirSync('demo/data',{recursive:true});generateCorpus();
// Parse the existing single scope source without executing any PHP.
const php=readFileSync('loader.php','utf8');
const match=php.match(/\/\* DF_PROJECT_JSON_BEGIN\s*([\s\S]*?)\s*DF_PROJECT_JSON_END \*\//);
if(!match)throw new Error('Project scope source missing');const scope=JSON.parse(match[1]);
if(scope.schema!==1||!Array.isArray(scope.milestones)||!Array.isArray(scope.scope))throw new Error('Project scope schema invalid');
writeFileSync('demo/data/project.json',JSON.stringify(scope,null,2)+'\n');
let sha=null,dirty=null;
try{sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();dirty=!!execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
writeFileSync('demo/data/build.json',JSON.stringify({version:'0.2.0',sha,dirty,builtAt:new Date().toISOString(),profile:'df-procedural-pixels-1',node:process.version,renderer:'procedural software RGBA',learnedRenderer:'not implemented',securityStudy:'not performed',authentication:'none'},null,2)+'\n');
console.log('Demo built. No credentials or private keys read.');
