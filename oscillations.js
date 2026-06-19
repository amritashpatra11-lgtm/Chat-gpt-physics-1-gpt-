import { PhysicsEngine, fitCanvas, clearCanvas, themeColors, grid } from '../core/engine.js';
import { createLabShell, addRange, bindTransport, observeResize, format } from '../core/lab-ui.js';

export function createSimulator(container, { item, lowPerformance = false }) {
  const ui = createLabShell(container, {
    equation: item.formula,
    explanation: 'A mass connected to an ideal spring oscillates around equilibrium. Damping and driving controls are enabled for the related advanced concepts.',
    assumptions: ['Linear spring', 'Small deformation', 'One-dimensional motion', 'Massless spring'],
    metrics: [{key:'period',label:'Period'}, {key:'force',label:'Restoring force'}, {key:'energy',label:'Total energy'}, {key:'position',label:'Position'}]
  });
  const state={m:1,k:12,A:.8,b:item.title.includes('Damped')?.45:0,drive:item.title.includes('Forced')||item.title.includes('Resonance')?1.5:0,driveF:3,t:0,x:.8,v:0,speedScale:1,points:[]};
  const reset=()=>{state.t=0;state.x=state.A;state.v=0;state.points=[];};
  addRange(ui.controls,{key:'mass',label:'Mass',min:.2,max:5,step:.1,value:state.m,unit:' kg',onInput:v=>{state.m=v;reset();}});
  addRange(ui.controls,{key:'spring',label:'Spring constant',min:1,max:60,step:1,value:state.k,unit:' N/m',onInput:v=>{state.k=v;reset();}});
  addRange(ui.controls,{key:'amp',label:'Initial amplitude',min:.1,max:2,step:.05,value:state.A,unit:' m',onInput:v=>{state.A=v;reset();}});
  if(item.title.includes('Damped')||item.title.includes('Forced')||item.title.includes('Resonance')) addRange(ui.controls,{key:'damping',label:'Damping coefficient',min:0,max:3,step:.05,value:state.b,unit:' N·s/m',onInput:v=>{state.b=v;reset();}});
  if(item.title.includes('Forced')||item.title.includes('Resonance')) addRange(ui.controls,{key:'drive',label:'Driving frequency',min:.1,max:8,step:.05,value:state.drive,unit:' rad/s',onInput:v=>{state.drive=v;reset();}});
  const resizeOff=observeResize(ui.canvas.parentElement,()=>render());
  const engine=new PhysicsEngine({targetFps:lowPerformance?30:60,fixedDt:1/180,update(dt){dt*=state.speedScale;state.t+=dt;const drive=state.drive?state.driveF*Math.cos(state.drive*state.t):0;const a=(-state.k*state.x-state.b*state.v+drive)/state.m;state.v+=a*dt;state.x+=state.v*dt;state.points.push(state.x);const max=lowPerformance?80:220;if(state.points.length>max)state.points.shift();},render});
  function render(){const{ctx,width,height}=fitCanvas(ui.canvas,lowPerformance?1:1.75);const c=themeColors();clearCanvas(ctx,width,height);grid(ctx,width,height,lowPerformance?75:45);const centerY=height*.5;const anchorX=45;const scale=Math.min(140,width*.22);const massX=width*.48+state.x*scale;
    ctx.fillStyle=c.muted;ctx.fillRect(anchorX-8,centerY-55,12,110);ctx.strokeStyle=c.accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(anchorX,centerY);const coils=13;for(let i=1;i<=coils;i++){const x=anchorX+(massX-anchorX-30)*i/coils;const y=centerY+(i===coils?0:(i%2?16:-16));ctx.lineTo(x,y);}ctx.lineTo(massX-30,centerY);ctx.stroke();ctx.fillStyle=c.accent2;ctx.beginPath();ctx.roundRect(massX-30,centerY-30,60,60,12);ctx.fill();ctx.fillStyle=c.text;ctx.font='700 12px ui-monospace,monospace';ctx.fillText(`${format(state.m,1)} kg`,massX-22,centerY+4);
    const gx=35,gy=height-90,gw=width-70,gh=62;ctx.strokeStyle=c.border;ctx.strokeRect(gx,gy,gw,gh);ctx.strokeStyle=c.accent3;ctx.beginPath();state.points.forEach((p,i)=>{const x=gx+i/Math.max(1,state.points.length-1)*gw;const y=gy+gh/2-p/state.A*gh*.4;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
    const period=2*Math.PI*Math.sqrt(state.m/state.k);const force=-state.k*state.x;const energy=.5*state.m*state.v**2+.5*state.k*state.x**2;ui.metric('period',`${format(period)} s`);ui.metric('force',`${format(force)} N`);ui.metric('energy',`${format(energy)} J`);ui.metric('position',`${format(state.x)} m`);ui.readout.textContent=`x=${format(state.x)} m · v=${format(state.v)} m/s`;ui.setEquation(`F=−(${format(state.k)})(${format(state.x)})=${format(force)} N;  T=${format(period)} s`);
  }
  bindTransport(ui,engine,reset,v=>state.speedScale=v);engine.start();return()=>{engine.destroy();resizeOff();};
}
