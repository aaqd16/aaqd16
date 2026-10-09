// Original procedural ASCII art. No generated pictures or external assets.
// The loop is illustrative, not a recording of shell commands or benchmarks.
export function drawTerminal(ctx,time=0,compact=false) {
  const W=compact?360:600,H=compact?422:246;
  ctx.save();ctx.scale(ctx.canvas.width/W,ctx.canvas.height/H);
  const c={bg:'#0d1117',bar:'#161b22',line:'#30363d',ink:'#e6edf3',muted:'#9ba9b7',blue:'#79c0ff',mint:'#9be9bc',violet:'#c8b6ef'};
  ctx.fillStyle=c.bg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle=c.bar;ctx.fillRect(0,0,W,27);
  for(const [i,color] of ['#f47067','#e3b341','#57ab5a'].entries()){
    ctx.fillStyle=color;ctx.beginPath();ctx.arc(15+i*12,13.5,3,0,Math.PI*2);ctx.fill();
  }
  ctx.font='9px Menlo, monospace';ctx.fillStyle=c.muted;ctx.fillText('aaqd16 / terminal',64,17);
  ctx.fillStyle=c.line;ctx.fillRect(0,27,W,1);
  const t=time%12,x=compact?20:26;
  const put=(text,y,color=c.ink,size=compact?11.5:11)=>{
    ctx.font=`${size}px Menlo, monospace`;ctx.fillStyle=color;ctx.fillText(text,x,y);
  };
  const type=(text,start,y)=>{
    if(t<start)return;
    const count=Math.min(text.length,Math.floor((t-start)*21));
    const fragment=text.slice(0,count);put(fragment,y,c.blue);
    if(count<text.length){ctx.fillStyle=c.violet;ctx.fillRect(x+ctx.measureText(fragment).width+2,y-9,6,11);}
  };
  type('$ whoami',.05,56);
  if(t>.55)put('Egor Kolyshev',83,c.ink,compact?22:23);
  type('$ cat focus.md',1.2,112);
  if(t>2)put('Developer / Founder @ Apex',133,c.muted,compact?10.5:10.5);
  if(t>2.5)put('Building Apex Feed',152,c.mint);
  type('$ ls stack/',3.2,181);
  if(t>3.95)put('Python  JavaScript  Flask',201,c.ink,compact?10.5:10.5);
  if(t>4.2)put('SQLite  HTML  CSS',218,c.muted,compact?10.5:10.5);
  if(t>4.9){put('$',236,c.blue);ctx.fillStyle=Math.floor(t*1.4)%2?c.violet:'#c8b6ef55';ctx.fillRect(x+14,227,6,11);}
  // A rotating torus knot sampled into a character-cell depth buffer. Every
  // visible character comes from a projected point, not a raster portrait.
  const cols=52,rows=37,cell=compact?3.7:3.8;
  const artX=compact?(W-cols*cell)/2:370,artY=compact?263:55;
  const depth=new Float32Array(cols*rows).fill(-Infinity);
  const intensity=new Float32Array(cols*rows);
  const angle=t*Math.PI/6;
  for(let u=0;u<Math.PI*2;u+=.027){
    const radius=1.05+.38*Math.cos(3*u);
    const center=[radius*Math.cos(2*u),radius*Math.sin(2*u),.6*Math.sin(3*u)];
    for(let v=0;v<Math.PI*2;v+=.27){
      let px=center[0]+.2*Math.cos(v)*Math.cos(2*u);
      let py=center[1]+.2*Math.cos(v)*Math.sin(2*u);
      let pz=center[2]+.2*Math.sin(v);
      const ax=px*Math.cos(angle)+pz*Math.sin(angle),az=-px*Math.sin(angle)+pz*Math.cos(angle);
      const ay=py*Math.cos(.65)-az*Math.sin(.65),zz=py*Math.sin(.65)+az*Math.cos(.65);
      const scale=12.1/(1-zz*.08);
      const sx=Math.round(cols/2+ax*scale),sy=Math.round(rows/2+ay*scale*.78);
      if(sx<0||sx>=cols||sy<0||sy>=rows)continue;
      const index=sy*cols+sx;
      if(zz>depth[index]){depth[index]=zz;intensity[index]=Math.max(.12,Math.min(1,(zz+1.7)/3.5));}
    }
  }
  const chars='.:=+*#%@';ctx.font=`${cell+1}px Menlo, monospace`;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const index=y*cols+x;if(depth[index]===-Infinity)continue;
    const level=intensity[index];
    ctx.fillStyle=level>.73?c.mint:level>.4?c.blue:'#426785';
    ctx.fillText(chars[Math.floor(level*(chars.length-1))],artX+x*cell,artY+y*cell);
  }
  ctx.strokeStyle=c.line;ctx.lineWidth=.6;
  // Short alignment corners hold the generative sculpture without a card.
  for(const [px,py,sx,sy] of [[artX-6,artY-6,1,1],[artX+cols*cell+6,artY-6,-1,1],[artX-6,artY+rows*cell+8,1,-1],[artX+cols*cell+6,artY+rows*cell+8,-1,-1]]){
    ctx.beginPath();ctx.moveTo(px+8*sx,py);ctx.lineTo(px,py);ctx.lineTo(px,py+8*sy);ctx.stroke();
  }
  ctx.restore();
}
