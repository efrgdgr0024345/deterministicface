/** Deterministic PUBLIC TEST identities. Seeds are publicly derivable; never use for real identity.
 * Private fixture keys exist only in this build process and are not saved or sent to the renderer.
 */
import {createHash,createPrivateKey,createPublicKey,sign} from 'node:crypto';
import {writeFileSync} from 'node:fs';
export function generateCorpus(){
 const cases=[];
 for(let i=0;i<100;i++){
  const seed=createHash('sha256').update('deterministicface/public-test-only/corpus-v1/'+i).digest();
  const privateKey=createPrivateKey({key:Buffer.concat([Buffer.from('302e020100300506032b657004220420','hex'),seed]),format:'der',type:'pkcs8'});
  const spki=createPublicKey(privateKey).export({format:'der',type:'spki'});
  const message='DeterministicFace public test vector '+(i+1);
  cases.push({id:'test-'+String(i+1).padStart(3,'0'),publicKey:spki.subarray(-32).toString('hex'),message,signature:sign(null,Buffer.from(message),privateKey).toString('hex')});
  seed.fill(0);
 }
 writeFileSync('demo/data/test-keys.json',JSON.stringify({schema:1,algorithm:'Ed25519',note:'PUBLIC TEST IDENTITIES ONLY: reproducible seeds are publicly derivable. Never use these keys as real identities. Private material is not saved.',cases},null,2)+'\n');
}
