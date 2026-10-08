import {digestInput, deriveBytes, parameter, hex, sha256, ascii, concat, u32} from './core.js';
import {Raster, Color, Point, Paint, color, mix, curve, png} from './raster.js';
export const RENDER_PROFILE = 'df-procedural-pixels-1';
const SKIN = ['f0d0b3','e6b99a','d99e78','c88b68','b47755','975d41','76482f','563627'].map(color);
const HAIR = ['252221','3a2924','594033','75412b','a56636','c5a373','d7cbb5','b7b8b5','352c3b'].map(color);
const IRIS = ['5d766d','607d90','7b633c','4a4033','69885e','8a8068'].map(color);
const CLOTH = ['253e47','593944','363b34','8f634d','243033','796e54','354b69','6d4840'].map(color);
const PALETTES = [
 ['183b4b','a9c9c0','365e66','799786','e3c3a0'], ['313e65','d1c7c1','535e7c','8b9eab','f2d49b'],
 ['553643','e2b6a2','9b6560','c28b73','f1d8b0'], ['343f39','b6c3a1','536954','80936f','d9d4b8'],
 ['553d32','e5c3a1','a67b5c','c59d77','f4dfb8'], ['223a49','a9baca','526f85','8a9bab','ead9a8'],
 ['393b47','b7aaa7','71696f','9b8d87','f1cfb0'], ['343e3c','b9cdbe','687f75','93a995','eddab3']
].map(p=>p.map(color));
const PARAMS: [string,number,number][] = [
 ['face.width',98,122],['face.height',233,265],['face.top',90,110],['face.shift',-9,9],['face.jaw',53,80],
 ['face.skin',0,7],['face.eyegap',44,58],['face.eyewidth',21,30],['face.eyeheight',8,12],['face.eyelevel',100,115],
 ['face.iris',0,5],['face.brow',2,6],['face.browangle',-5,7],['face.nosewidth',13,22],['face.noselength',42,62],
 ['face.mouthwidth',23,35],['face.mouthheight',5,10],['face.smile',-4,5],['face.ears',12,19],['face.freckles',0,3],
 ['face.beard',0,5],['face.glasses',0,4],['face.age',0,3],['hair.style',0,5],['hair.color',0,8],['hair.volume',15,37],
 ['background.family',0,5],['background.palette',0,7],['background.sunx',45,457],['background.suny',65,180],
 ['background.horizon',238,328],['background.sunradius',23,47],['background.offset',-35,35],['clothing.color',0,7],['clothing.collar',0,3]
];
export interface PortraitSpec {profile:string;digest:string;values:Record<string,number>;detail:Uint8Array;sceneDetail:Uint8Array;}
export async function portraitSpec(input:string):Promise<PortraitSpec>{
 const d=digestInput(input);const pairs=await Promise.all(PARAMS.map(async([label,lo,hi])=>[label,await parameter(d,label,lo,hi)] as const));
 return {profile:RENDER_PROFILE,digest:hex(d),values:Object.fromEntries(pairs),detail:await deriveBytes(d,'face.detail',0,256),sceneDetail:await deriveBytes(d,'background.detail',0,256)};
}
function background(r:Raster,s:PortraitSpec):void{
 const p=s.values,v=(k:string)=>p['background.'+k],a=s.sceneDetail;
 const [dark,sky,far,near,sun]=PALETTES[v('palette')],h=v('horizon'),sx=v('sunx'),sy=v('suny'),sr=v('sunradius');
 r.rect(0,0,512,512,{axis:'y',start:0,end:512,a:dark,b:sky});
 for(let i=5;i>0;i--)r.ellipse(sx,sy,sr+i*7,sr+i*7,sun,10);
 r.ellipse(sx,sy,sr,sr,sun,230);
 const ridge=(base:number,spread:number,seed:number):Point[]=>{const pts:Point[]=[[0,512],[0,base]];for(let x=0;x<=560;x+=56)pts.push([x,base+(a[(x/56+seed)%256]%spread)-spread/2]);pts.push([512,512]);return pts;};
 const f=v('family');
 if(f===0||f===1){
   r.poly(ridge(h-40,90,1),far);r.poly(ridge(h+14,55,15),near);
   if(f===0){r.rect(0,h+24,512,488-h,{axis:'y',start:h+24,end:512,a:mix(sky,far,100),b:dark});
     for(let i=0;i<28;i++){const y=h+40+i*6;const x=a[i]*2;const w=20+a[i+40]%95;r.stroke([[x,y],[Math.min(512,x+w),y]],sun,1,45);}
   }else{r.poly(ridge(h+75,70,33),mix(near,dark,110));
     for(let i=0;i<19;i++){const x=a[i]*2,y=h+40+a[i+25]/2,ht=28+a[i+50]%58;r.poly([[x-ht/5,y+ht],[x,y],[x+ht/5,y+ht]],dark,140);}}
 }else if(f===2){
   r.rect(0,h+60,512,512,near);for(const x of [-40,340+v('offset')]){
     const arch=curve([x,480],[[[x,260],[x,142],[x+90,140]],[[x+175,142],[x+175,275],[x+175,480]]]);
     r.poly(arch,mix(sky,sun,85));r.poly(curve([x+22,480],[[[x+22,266],[x+24,171],[x+90,169]],[[x+151,173],[x+153,279],[x+153,480]]]),dark);
     for(let k=0;k<5;k++)r.stroke([[x,250+k*42],[x+22,250+k*42]],near,1,150);
   }
   for(let i=0;i<6;i++)r.stroke([[0,430+i*17],[512,430+i*17]],dark,2,80);
 }else if(f===3){
   r.poly(ridge(h,70,8),far);r.poly(ridge(h+66,48,26),near);
   for(let i=0;i<10;i++){const x=i<5?i*25-10:400+(i-5)*28,y=70+a[i]%90;r.stroke([[x,512],[x+12,y]],dark,5,185);
    for(let j=0;j<8;j++){const yy=y+j*38,dir=j%2?1:-1;r.stroke([[x+8,yy+18],[x+dir*34,yy-12]],dark,2,170);r.ellipse(x+dir*32,yy-12,20,9,near,185);r.ellipse(x+dir*23,yy-29,12,7,sky,105);}}
 }else if(f===4){
   for(let i=0;i<5;i++)r.poly(curve([0,512],[[[0,h+i*29],[160,h-80+i*39],[310,h+i*30]],[[410,h+45+i*30],[475,h-30+i*40],[512,h+i*36]],[[512,490],[512,512],[512,512]]]),mix(far,sky,i*40));
   for(let i=0;i<9;i++)r.stroke(curve([0,340+i*16],[[[100,320+i*18],[170,370+i*10],[220,360+i*13]]]),dark,1,28);
 }else{
   r.rect(25,35,462,442,dark,70);for(let i=0;i<4;i++){r.ellipse(256+v('offset'),255,206-i*15,206-i*15,near,30);}
   r.rect(26,32,2,449,sun,80);r.rect(484,32,2,449,sun,80);
   for(let i=0;i<5;i++){const y=75+i*85;r.stroke([[28,y],[483,y]],sun,1,70);}
 }
 // Public, key-derived small scene landmarks; not a secret checkpoint.
 for(let i=0;i<9;i++){const x=i%2?425+a[80+i]%60:25+a[80+i]%60,y=50+a[105+i]*1.6;r.ellipse(x,y,2+a[130+i]%4,2+a[130+i]%4,sun,95);}
}
export function paintPortrait(s:PortraitSpec):Uint8Array{
 if(s.profile!==RENDER_PROFILE)throw new Error('UNSUPPORTED_PROFILE');
 const v=s.values,get=(k:string)=>v['face.'+k],r=new Raster([0,0,0]);background(r,s);
 const cx=256+get('shift'),top=get('top'),w=get('width'),chin=top+get('height'),ey=top+get('eyelevel');
 const skin=SKIN[get('skin')],dark=mix(skin,[32,22,25],132),light=mix(skin,[255,239,211],65);
 const hair=HAIR[v['hair.color']],hairHi=mix(hair,[233,213,180],50),style=v['hair.style'],vol=v['hair.volume'];
 const cloth=CLOTH[v['clothing.color']],eyeGap=get('eyegap'),ew=get('eyewidth'),eh=get('eyeheight');
 const jaw=get('jaw'),nb=ey+get('noselength'),my=Math.min(chin-36,nb+29),mw=get('mouthwidth'),mh=get('mouthheight');
 const P=(start:Point,segs:[Point,Point,Point][],fill:Paint,a=255)=>r.poly(curve(start,segs),fill,a);
 const S=(start:Point,segs:[Point,Point,Point][],c:Color,width=1,a=255)=>r.stroke(curve(start,segs),c,width,a);
 // Hair behind the neck and ears.
 if(style===3||style===4){r.ellipse(cx,top+142,w+23,165,{axis:'x',start:cx-w,end:cx+w,a:hairHi,b:hair});r.rect(cx-w-20,top+140,2*w+40,256,hair);}
 // Shoulders, neck, fabric and collar.
 P([68,512],[[[80,436],[151,416],[cx-38,407]],[[cx-19,398],[cx+19,398],[cx+39,407]],[[385,416],[430,441],[447,512]]],{axis:'x',start:70,end:450,a:mix(cloth,[190,171,139],35),b:mix(cloth,[0,0,0],65)});
 P([cx-34,chin-27],[[[cx-31,chin+15],[cx-42,412],[cx-54,424]],[[cx-27,455],[cx+28,454],[cx+54,424]],[[cx+40,411],[cx+30,chin+13],[cx+34,chin-27]]],{axis:'x',start:cx-45,end:cx+48,a:skin,b:dark});
 r.ellipse(cx,chin+3,35,18,dark,66);
 if(v['clothing.collar']<2){P([cx-57,417],[[[cx-47,432],[cx-23,441],[cx,446]],[[cx+26,441],[cx+49,431],[cx+57,417]],[[cx+79,430],[cx+85,435],[cx+97,447]],[[cx+35,482],[cx-36,482],[cx-97,447]]],mix(cloth,[0,0,0],48));}
 else{r.poly([[cx-63,411],[cx-4,445],[cx-41,473],[cx-88,432]],mix(cloth,[255,243,221],45));r.poly([[cx+63,411],[cx+4,445],[cx+41,473],[cx+88,432]],mix(cloth,[0,0,0],30));r.stroke([[cx,450],[cx,512]],dark,1,70);}
 // Ears.
 for(const dir of [-1,1]){const ex=cx+dir*(w-4);r.ellipse(ex,ey+24,get('ears'),33,dark);r.ellipse(ex-dir*2,ey+21,get('ears')-3,29,skin);S([ex-dir*4,ey+1],[[[ex+dir*10,ey-2],[ex+dir*10,ey+32],[ex-dir*4,ey+37]]],dark,2,105);}
 // Head silhouette.
 P([cx,top],[[[cx+w*.69,top-6],[cx+w,top+42],[cx+w-3,ey+1]],[[cx+w-3,ey+62],[cx+jaw,chin-23],[cx+27,chin-2]],[[cx+11,chin+8],[cx-10,chin+8],[cx-28,chin-2]],[[cx-jaw,chin-22],[cx-w+3,ey+58],[cx-w+3,ey]],[[cx-w,top+40],[cx-w*.67,top-6],[cx,top]]],{axis:'x',start:cx-w,end:cx+w,a:light,b:mix(skin,dark,102)});
 // Controlled shading; facial identity is not just a palette swap.
 P([cx+w*.57,top+45],[[[cx+w+8,top+102],[cx+w*.68,chin-20],[cx+20,chin]],[[cx+67,chin-36],[cx+46,ey+37],[cx+w*.57,top+45]]],dark,37);
 for(let i=4;i>0;i--)r.ellipse(cx-w*.43,ey+46,21+i*6,16+i*3,light,9);
 for(const dir of [-1,1])r.ellipse(cx+dir*eyeGap,ey+6,ew+9,eh+9,dark,18);
 // Beard/stubble is varied but never interpreted as the key owner's identity.
 const beard=get('beard');
 if(beard===1||beard===2)P([cx-w+13,ey+48],[[[cx-60,my+5],[cx-32,my+17],[cx,my+17]],[[cx+32,my+17],[cx+60,my+5],[cx+w-13,ey+48]],[[cx+w-16,chin-43],[cx+43,chin+5],[cx,chin+8]],[[cx-43,chin+5],[cx-w+16,chin-43],[cx-w+13,ey+48]]],hair,beard===1?62:210);
 // Eyes and brows.
 for(const dir of [-1,1]){
   const ex=cx+dir*eyeGap,skew=dir*get('browangle')/3;
   P([ex-ew,ey],[[[ex-ew/2,ey-eh-2],[ex+ew/2,ey-eh+skew],[ex+ew,ey]],[[ex+ew/2,ey+eh],[ex-ew/2,ey+eh-1],[ex-ew,ey]]],[220,218,205]);
   r.ellipse(ex,ey,eh*.75,eh*.92,IRIS[get('iris')]);r.ellipse(ex,ey,eh*.33,eh*.68,[25,28,27]);r.ellipse(ex-2,ey-3,1.6,1.6,[252,250,235],240);
   S([ex-ew,ey],[[[ex-ew/2,ey-eh-2],[ex+ew/2,ey-eh+skew],[ex+ew,ey]]],mix(hair,dark,90),1.9);
   S([ex-ew+3,ey+3],[[[ex-ew/2,ey+eh+3],[ex+ew/2,ey+eh+3],[ex+ew-1,ey+2]]],dark,1,100);
   S([ex-ew-4,ey-18+dir*3],[[[ex-8,ey-26-get('browangle')],[ex+10,ey-24],[ex+ew+3,ey-17-dir*3]]],hair,get('brow'),235);
   S([ex-ew,ey-9],[[[ex-ew/2,ey-eh-8],[ex+ew/2,ey-eh-7],[ex+ew,ey-7]]],dark,1,60);
 }
 // Nose bridge, wings, nostrils and philtrum.
 const nw=get('nosewidth');
 P([cx-5,ey-4],[[[cx-8,ey+20],[cx-nw-3,nb-1],[cx-nw,nb+5]],[[cx-7,nb+12],[cx+7,nb+12],[cx+nw,nb+5]],[[cx+nw+3,nb-1],[cx+7,ey+20],[cx+5,ey-4]]],{axis:'x',start:cx-nw,end:cx+nw,a:light,b:mix(skin,dark,97)},130);
 r.ellipse(cx-nw+4,nb+4,4,2.2,dark,130);r.ellipse(cx+nw-4,nb+4,4,2.2,dark,145);r.ellipse(cx-2,nb-1,nw*.44,4.5,light,90);
 S([cx-3,nb+13],[[[cx-4,nb+18],[cx-5,my-8],[cx-6,my-5]]],dark,.8,65);
 // Lips, with a closed neutral-to-slightly-smiling mouth.
 const lip=mix(skin,[125,56,55],105),sm=get('smile');
 P([cx-mw,my-sm],[[[cx-18,my-5],[cx-10,my-mh],[cx,my-3]],[[cx+10,my-mh],[cx+20,my-4],[cx+mw,my-sm]],[[cx+12,my+4],[cx-12,my+4],[cx-mw,my-sm]]],mix(lip,dark,43));
 P([cx-mw+1,my-sm+1],[[[cx-17,my+mh+6],[cx+17,my+mh+6],[cx+mw-1,my-sm+1]],[[cx+12,my+4],[cx-12,my+4],[cx-mw+1,my-sm+1]]],mix(lip,light,60));
 S([cx-mw,my-sm],[[[cx-14,my+2],[cx+14,my+2],[cx+mw,my-sm]]],dark,1,180);S([cx-10,my+mh],[[[cx-3,my+mh+1],[cx+4,my+mh+1],[cx+11,my+mh]]],light,1,85);
 r.ellipse(cx,chin-13,19,4,dark,22);
 if(get('age')>1){for(const dir of [-1,1]){S([cx+dir*(nw+10),nb-1],[[[cx+dir*(nw+20),nb+17],[cx+dir*(mw+10),my+6],[cx+dir*(mw+8),my+15]]],dark,1,42);for(let i=0;i<2;i++)S([cx-36,ey-43-i*11],[[[cx-12,ey-47-i*11],[cx+12,ey-47-i*11],[cx+36,ey-43-i*11]]],dark,.7,37);}}
 if(get('freckles')===0)for(let i=0;i<22;i++){const dir=i%2?1:-1,x=cx+dir*(22+s.detail[i]%55),y=ey+22+s.detail[i+25]%30;r.ellipse(x,y,.6+s.detail[i+50]%2,.65,dark,58);}
 // Six hair constructions, using the same complete key derivation.
 if(style!==5){
  const hairTop=top-vol;
  P([cx-w-7,ey-5],[[[cx-w-29,top+25],[cx-78,hairTop-16],[cx+10,hairTop]],[[cx+84,hairTop-10],[cx+w+23,top+30],[cx+w+6,ey-3]],[[cx+w-2,top+73],[cx+68,top+18],[cx+20,top+28]],[[cx-38,top+16],[cx-w+1,top+76],[cx-w-7,ey-5]]],{axis:'x',start:cx-w,end:cx+w,a:hairHi,b:hair});
  if(style===0||style===1){P([cx-w,top+86],[[[cx-57,top+19],[cx+51,top-15],[cx+w-10,top+45]],[[cx+55,top+9],[cx-5,top+88],[cx-w,top+86]]],hair);for(let i=0;i<10;i++)S([cx-w+12+i*9,top+56-i*2],[[[cx-52+i*9,top+14],[cx-7+i*8,top-3],[cx+33+i*6,top+6+i]]],hairHi,.8,125);}
  if(style===2){for(let i=0;i<9;i++){const x=cx-w+15+i*(2*w-30)/8;P([x-18,top+24],[[[x-20,top+55],[x+7,top+52+s.detail[i]%23],[x+20,top+67]],[[x+24,top+36],[x+27,top+18],[x-18,top+24]]],i%2?hair:hairHi);}}
  if(style===3){for(let i=0;i<38;i++){const x=cx-w-3+(i%13)*(2*w+6)/12,y=top-5+Math.floor(i/13)*16+((s.detail[i]%15)-7);r.ellipse(x,y,13+s.detail[i+40]%9,15+s.detail[i+80]%6,i%3?hair:hairHi);}}
  if(style===4){for(const dir of [-1,1])P([cx+dir*(w-7),top+58],[[[cx+dir*(w+33),top+150],[cx+dir*(w+32),chin+37],[cx+dir*(w-12),chin+60]],[[cx+dir*(w-31),chin+9],[cx+dir*(w-7),ey+23],[cx+dir*(w-7),top+58]]],{axis:'x',start:cx-w-30,end:cx+w+30,a:hairHi,b:hair});}
 }else{for(const dir of [-1,1])P([cx+dir*(w-18),top+50],[[[cx+dir*(w+5),top+74],[cx+dir*w,ey-3],[cx+dir*(w-6),ey+23]],[[cx+dir*(w-15),ey+10],[cx+dir*(w-25),top+80],[cx+dir*(w-18),top+50]]],hair,165);}
 // Optional eyeglasses; controlled geometry, no separate avatar assets.
 if(get('glasses')===0){for(const dir of [-1,1]){const ex=cx+dir*eyeGap;const pts:Point[]=[[ex-ew-7,ey-15],[ex+ew+7,ey-15],[ex+ew+4,ey+18],[ex-ew-4,ey+18],[ex-ew-7,ey-15]];r.stroke(pts,mix(hair,[0,0,0],80),2,230);}r.stroke([[cx-eyeGap+ew+7,ey-7],[cx+eyeGap-ew-7,ey-7]],hair,2);}
 return r.pixels();
}
export async function renderPortrait(input:string){
 const spec=await portraitSpec(input),pixels=paintPortrait(spec);
 const pixelDigest=hex(await sha256(concat(ascii('df-rgba8-opaque-srgb-v1'),new Uint8Array([0]),u32(512),u32(512),pixels)));
 return {profile:RENDER_PROFILE,digest:spec.digest,pixels,pixelDigest,png:png(pixels)};
}
