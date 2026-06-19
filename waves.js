import { PhysicsEngine, fitCanvas, clearCanvas, themeColors, grid } from '../core/engine.js';
import { createLabShell, addRange, bindTransport, observeResize, format } from '../core/lab-ui.js';

export function createSimulator(container,{item,lowPerformance=false}){
 const standing=item.title.includes('Standing')||item.title.includes('Harmonics');
 const ui=createLabShell(container,{equation:item.formula,explanation:'The canvas samples an analytic wave equation. Frequency controls temporal oscillation, while wavelength controls spatial repetition.',assumptions:['Ideal sinusoidal waves','Linear superposition','Uniform medium'],metrics:[{key:'speed',label:'Wave speed'},{key:'period',label:'Period'},{key:'omega',label:'Angular frequency'},{key:'k',label:'Wave number'}]});
 const s={f:2,lambda:3,A:.8,mode:2,t:0,speedScale:1};
 addRange(ui.controls,{key:'frequency',label:'Frequency',min:.2,max:10,step:.1,value:s.f,unit:' Hz',onInput:v=>s.f=v});
 addRange(ui.controls,{key:'wavelength',label:'Wavelength',min:.3,max:8,step:.1,value:s.lambda,unit:' m',onInput:v=>s.lambda=v});
 addRange(ui.controls,{key:'amplitude',label:'Amplitude',min:.1,max:1.5,step:.05,value:s.A,unit:' m',onInput:v=>s.A=v});
 if(standing)addRange(ui.controls,{key:'mode',label:'Mode number',min:1,max:8,step:1,value:s.mode,unit:'',onInput:v=>s.mode=v});
 const resizeOff=observeResize(ui.canvas.parentElement,()=>render());const reset=()=>s.t=0;
 const engine=new PhysicsEngine({targetFps:lowPerformance?30:60,fixedDt:1/120,update(dt){s.t+=dt*s.speedScale;},render});
 function render(){const{ctx,width,height}=fitCanvas(ui.canvas,lowPerformance?1:1.75);const c=themeColors();clearCanvas(ctx,width,height);grid(ctx,width,height,lowPerformance?80:48);const mid=height*.5;ctx.strokeStyle=c.border;ctx.beginPath();ctx.moveTo(20,mid);ctx.lineTo(width-20,mid);ctx.stroke();const samples=lowPerformance?90:220;ctx.strokeStyle=c.accent;ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=samples;i++){const p=i/samples,x=20+p*(width-40);let y;if(standing)y=mid-s.A*Math.sin(Math.PI*s.mode*p)*Math.cos(2*Math.PI*s.f*s.t)*height*.28;else y=mid-s.A*Math.sin(2*Math.PI*(p*8/s.lambda-s.f*s.t))*height*.24;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
 if(!lowPerformance){ctx.strokeStyle=c.accent2;ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<=samples;i++){const p=i/samples,x=20+p*(width-40);const y=mid+s.A*.45*Math.sin(2*Math.PI*(p*8/s.lambda+s.f*s.t))*height*.24;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
 const speed=s.f*s.lambda,period=1/s.f,omega=2*Math.PI*s.f,k=2*Math.PI/s.lambda;ui.metric('speed',`${format(speed)} m/s`);ui.metric('period',`${format(period)} s`);ui.metric('omega',`${format(omega)} rad/s`);ui.metric('k',`${format(k)} rad/m`);ui.readout.textContent=`v=${format(speed)} m/s · f=${format(s.f)} Hz · λ=${format(s.lambda)} m`;ui.setEquation(`v=fλ=(${format(s.f)})(${format(s.lambda)})=${format(speed)} m/s`);}
 bindTransport(ui,engine,reset,v=>s.speedScale=v);engine.start();return()=>{engine.destroy();resizeOff();};
}
