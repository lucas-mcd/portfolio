import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

// One static atlas. Glyphs are rasterized only at mount; all reveal, cleaning,
// signal graphs and progress are driven by the existing monitor shader clock.
export function makeBootTexture() {
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Canvas 2D indisponível para diagnóstico.');
  ctx.fillStyle='#000';ctx.fillRect(0,0,1536,1024);
  ctx.textBaseline='middle';ctx.font='18px ui-monospace, monospace';
  ctx.fillStyle='#91e9ff';
  ctx.fillText('CORE / RECOVERY TERMINAL',40,48);
  ctx.fillText('MEMORY SECTORS / 256 BLOCKS',960,48);
  const checkpoints=[
    '[ SYSTEM OVERLOAD DETECTED - PURGING IN-MEMORY CORES... OK ]',
    '[ TEMPERATURE PURGED - COOLING SYSTEM: RE-ENGAGED ]',
    '[ SYSTEM KERNEL REBOOT: SUCCESSFUL ]',
    '[ RENDER CORE_HUD IN SAFE_MODE... ]',
  ];
  const actions=[['isolate render queue','release volatile buffers','verify local memory','purge damaged video fields','flush frame history'],
    ['clear thermal flags','reset fan controller','check cooling circuit','synchronize power rails','verify thermal budget'],
    ['load safe kernel','verify checksum','mount local assets','restore event bus','initialize renderer'],
    ['bind display target','align scan buffers','load interface texture','restore input handlers','lock stable video signal']];
  ctx.font='17px ui-monospace, monospace';
  checkpoints.forEach((message,block)=>{
    for(let i=0;i<6;i++){
      ctx.fillStyle=i===5?'#d6faff':'#61c9e0';
      ctx.fillText(i===5?message:`[ ${String(block*6+i).padStart(4,'0')} ] ${actions[block][i]} ... OK`,40,100+(block*6+i)*22);
    }
  });
  ctx.font='12px ui-monospace, monospace';ctx.fillStyle='#fff';
  for(let i=0;i<256;i++)ctx.fillText('0x'+((i*73+31)%256).toString(16).toUpperCase().padStart(2,'0'),960+(i%16)*32,100+Math.floor(i/16)*30);
  ctx.font='17px ui-monospace, monospace';ctx.fillStyle='#8be8ff';
  ctx.fillText('SIGNAL INTEGRITY / CH_01 + CH_02',40,660);
  ctx.fillText('POST / RECOVERY BUS ONLINE',960,630);
  ctx.fillText('LOCAL VISUAL SIMULATION',960,660);
  ctx.fillText('[ SYSTEM STATUS: OK ]',960,720);
  ctx.font='22px ui-monospace, monospace';
  ctx.fillText('CORE_STORAGE CHECKING:',400,854);
  ctx.fillText('[',300,906);ctx.fillText(']',1210,906);
  ctx.fillStyle='#fff';
  // Private digit atlas; this strip is never directly displayed.
  for(let i=0;i<10;i++)ctx.fillText(String(i),40+i*32,990);
  ctx.fillText('%',360,990);
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
  texture.minFilter=LinearFilter;texture.magFilter=LinearFilter;texture.generateMipmaps=false;
  return texture;
}

export const diagnosticShader=/* glsl */ `
  float digit(vec2 pixel,float x,float value) {
    vec2 p=pixel-vec2(x,840.);
    if(p.x<0. || p.x>=24. || p.y<0. || p.y>=28.)return 0.;
    vec2 source=vec2(40.+value*32.+p.x,976.+p.y);
    return texture2D(uBoot,vec2(source.x/1536.,1.-source.y/1024.)).r;
  }
  vec3 diagnostics(vec2 uv,float age) {
    vec2 p=vec2(uv.x,1.-uv.y)*vec2(1536.,1024.);
    float block=min(3.,floor(age/2.));
    float within=mod(age,2.);
    // Fast log bursts, then a readable checkpoint dwell in each stage.
    float rows=min(24.,block*6.+floor(min(within/.78,1.)*6.));
    float progress=min(1.,(block+min(within/1.35,1.))/4.);
    vec3 ink=texture2D(uBoot,uv).rgb;
    vec3 color=vec3(0.);
    if(p.y<76.)color=ink;
    if(p.x<930. && p.y>=82. && p.y<638.) {
      // Reveal atlas rows in checkpoint bursts; no canvas uploads.
      float row=floor((p.y-89.)/22.);
      float shown=1.-step(rows,row);
      float checkpoint=step(.78,within)*step(abs(row-(block*6.+5.)),.5);
      color=ink*shown*(1.+checkpoint*.45);
    }
    if(p.x>=952. && p.x<1476. && p.y>=85. && p.y<575.) {
      vec2 cell=floor((p-vec2(960.,85.))/vec2(32.,30.));
      float index=cell.y*16.+cell.x;
      float clean=step(index+1.,floor(progress*256.));
      float noise=hash(index+floor(age*13.)*47.);
      vec3 corrupt=mix(vec3(.85,.035,.025),vec3(.02,.58,.9),step(.5,noise));
      color=ink*mix(corrupt*(.3+noise*.7),vec3(1.),clean);
    }
    if(p.y>=615. && p.y<680.)color=ink;
    if(p.x>=40. && p.x<910. && p.y>=685. && p.y<810.) {
      float x=(p.x-40.)/870.;
      float chaos=pow(1.-progress,1.5);
      float n=hash(floor(x*170.)+floor(age*32.)*13.)*2.-1.;
      float wave=(sin(x*34.-age*4.)*13.+sin(x*71.+age*6.)*5.)*(1.-progress);
      float spikes=n*25.*chaos;
      float a=abs(p.y-(720.+wave+spikes));
      float b=abs(p.y-(780.+wave*.55-spikes*.8));
      float traces=1.-smoothstep(.55,1.5,min(a,b));
      float grid=(1.-step(1.,mod(p.x-40.,54.)))+(1.-step(1.,mod(p.y-690.,20.)));
      color=vec3(.015,.06,.08)*min(grid,1.)+vec3(.12,.85,1.)*traces;
    }
    if(p.y>=830. && p.y<930.) {
      color=ink*(.78+.22*step(.5,fract(age*2.)));
      float value=floor(progress*100.);
      float digits=digit(p,720.,floor(value/100.))+digit(p,744.,mod(floor(value/10.),10.))+digit(p,768.,mod(value,10.))+digit(p,796.,10.);
      color+=vec3(.2,.9,1.)*digits;
      if(p.x>=330. && p.x<1200. && p.y>=894. && p.y<918.) {
        float cell=floor((p.x-330.)/29.);
        float filled=step(cell+1.,floor(progress*30.));
        float gap=1.-step(25.,mod(p.x-330.,29.));
        float hatch=step(.5,fract((p.x+p.y)*.25));
        color=vec3(.3,.85,1.)*gap*mix(.10+.10*hatch,1.,filled);
      }
    }
    return color;
  }
`;
