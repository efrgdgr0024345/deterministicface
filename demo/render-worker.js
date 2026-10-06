import {renderPortrait} from './core/portrait.js';
self.onmessage=async({data})=>{
 try{const result=await renderPortrait(data.digest);self.postMessage({id:data.id,result},[result.pixels.buffer,result.png.buffer]);}
 catch(e){self.postMessage({id:data.id,error:e instanceof Error?e.message:'RENDER_FAILED'});}
};
