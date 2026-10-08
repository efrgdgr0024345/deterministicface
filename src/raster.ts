/** Deterministic software rasterizer. No Canvas/SVG/GPU engine defines these pixels.
 * Polygon scan conversion uses fixed 1/16-pixel coordinates and specified rounding.
 * 2x supersampling -> exact integer box downsample. No system fonts or image assets.
 */
export type Point = [number, number];
export type Color = [number, number, number];
export type Paint = Color | {axis: 'x'|'y'; start: number; end: number; a: Color; b: Color};
export function mix(a: Color, b: Color, t: number): Color {
  t = Math.max(0, Math.min(256, Math.round(t)));
  return a.map((v, i) => Math.floor((v * (256 - t) + b[i] * t + 128) / 256)) as Color;
}
export function color(h: string): Color {
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const CIRCLE: Point[] = [[10000,0],[9808,1951],[9239,3827],[8315,5556],[7071,7071],[5556,8315],[3827,9239],[1951,9808],[0,10000],[-1951,9808],[-3827,9239],[-5556,8315],[-7071,7071],[-8315,5556],[-9239,3827],[-9808,1951],[-10000,0],[-9808,-1951],[-9239,-3827],[-8315,-5556],[-7071,-7071],[-5556,-8315],[-3827,-9239],[-1951,-9808],[0,-10000],[1951,-9808],[3827,-9239],[5556,-8315],[7071,-7071],[8315,-5556],[9239,-3827],[9808,-1951]];
export function curve(start: Point, segments: [Point, Point, Point][]): Point[] {
  const out: Point[] = [start]; let p = start;
  for (const [a,b,c] of segments) {
    for (let i=1;i<=20;i++) { const j=20-i;
      out.push([Math.round((j*j*j*p[0]+3*j*j*i*a[0]+3*j*i*i*b[0]+i*i*i*c[0])*16/8000)/16,
                Math.round((j*j*j*p[1]+3*j*j*i*a[1]+3*j*i*i*b[1]+i*i*i*c[1])*16/8000)/16]);
    } p=c;
  } return out;
}
export class Raster {
  readonly scale = 2; readonly n = 1024;
  readonly data = new Uint8Array(this.n*this.n*4);
  constructor(base: Color) {
    for(let i=0;i<this.data.length;i+=4){this.data[i]=base[0];this.data[i+1]=base[1];this.data[i+2]=base[2];this.data[i+3]=255;}
  }
  poly(points: Point[], paint: Paint, alpha=255): void {
    if(points.length<3)return;
    const pts=points.map(([x,y])=>[Math.round(x*32),Math.round(y*32)] as Point);
    let lo=this.n,hi=0;for(const p of pts){lo=Math.min(lo,Math.floor(p[1]/16));hi=Math.max(hi,Math.ceil(p[1]/16));}
    lo=Math.max(0,lo);hi=Math.min(this.n,hi);alpha=Math.max(0,Math.min(255,Math.round(alpha)));
    for(let y=lo;y<hi;y++){
      const yy=y*16+8,xs:number[]=[];
      for(let i=0,j=pts.length-1;i<pts.length;j=i++){
        const [x1,y1]=pts[j],[x2,y2]=pts[i];
        if((y1<=yy&&y2>yy)||(y2<=yy&&y1>yy))xs.push(x1+Math.floor((yy-y1)*(x2-x1)/(y2-y1)));
      }
      xs.sort((a,b)=>a-b);
      for(let k=0;k+1<xs.length;k+=2){const x0=Math.max(0,Math.ceil((xs[k]-8)/16)),x1=Math.min(this.n,Math.ceil((xs[k+1]-8)/16));
        for(let x=x0;x<x1;x++){
          const c=Array.isArray(paint)?paint:mix(paint.a,paint.b,((paint.axis==='x'?(x+.5)/2:(y+.5)/2)-paint.start)*256/(paint.end-paint.start));
          const at=(y*this.n+x)*4;
          for(let ch=0;ch<3;ch++)this.data[at+ch]=Math.floor((c[ch]*alpha+this.data[at+ch]*(255-alpha)+127)/255);
        }
      }
    }
  }
  rect(x:number,y:number,w:number,h:number,p:Paint,a=255):void{this.poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],p,a);}
  ellipse(x:number,y:number,rx:number,ry:number,p:Paint,a=255):void{this.poly(CIRCLE.map(([u,v])=>[x+u*rx/10000,y+v*ry/10000]),p,a);}
  stroke(pts:Point[],p:Color,width=1,a=255):void{
    for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i];const n=Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2)||1;
      for(let t=0;t<=n;t++)this.ellipse(x0+(x1-x0)*t/n,y0+(y1-y0)*t/n,width/2,width/2,p,a);
    }
  }
  pixels():Uint8Array{
    const out=new Uint8Array(512*512*4);
    for(let y=0;y<512;y++)for(let x=0;x<512;x++){
      const a=(y*2*this.n+x*2)*4,b=a+this.n*4,d=(y*512+x)*4;
      for(let c=0;c<3;c++)out[d+c]=Math.floor((this.data[a+c]+this.data[a+4+c]+this.data[b+c]+this.data[b+4+c]+2)/4);
      out[d+3]=255;
    }return out;
  }
}
/** Canonical PNG encoding: RGBA8, filter 0, uncompressed DEFLATE, no metadata. */
export function png(pixels:Uint8Array):Uint8Array{
  if(pixels.length!==512*512*4)throw new Error('INVALID_PIXELS');
  const be=(n:number)=>new Uint8Array([(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]);
  const cat=(...parts:Uint8Array[])=>{const o=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const p of parts){o.set(p,at);at+=p.length;}return o;};
  const crc=(b:Uint8Array)=>{let c=0xffffffff;for(const v of b){c^=v;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;};
  const chunk=(name:string,b:Uint8Array)=>{const body=cat(new TextEncoder().encode(name),b);return cat(be(b.length),body,be(crc(body)));};
  const raw=new Uint8Array(512*(512*4+1));for(let y=0;y<512;y++)raw.set(pixels.subarray(y*2048,(y+1)*2048),y*2049+1);
  const blocks:Uint8Array[]=[new Uint8Array([0x78,0x01])];
  for(let at=0;at<raw.length;at+=65535){const n=Math.min(65535,raw.length-at);blocks.push(new Uint8Array([at+n===raw.length?1:0,n&255,n>>>8,(~n)&255,((~n)>>>8)&255]),raw.subarray(at,at+n));}
  let a=1,b=0;for(const v of raw){a=(a+v)%65521;b=(b+a)%65521;}blocks.push(be((b*65536+a)>>>0));
  return cat(new Uint8Array([137,80,78,71,13,10,26,10]),chunk('IHDR',cat(be(512),be(512),new Uint8Array([8,6,0,0,0]))),chunk('IDAT',cat(...blocks)),chunk('IEND',new Uint8Array()));
}
