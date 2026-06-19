import { PhysicsEngine, fitCanvas, clearCanvas, themeColors, drawArrow, grid } from '../core/engine.js';
import { createLabShell, addRange, bindTransport, observeResize, format } from '../core/lab-ui.js';

export function createSimulator(container, { item, lowPerformance = false }) {
  const isFreeFall = item.title.includes('Free-fall');
  const ui = createLabShell(container, {
    equation: item.formula,
    explanation: isFreeFall ? 'A body moves vertically under gravity. Optional launch velocity lets you compare dropping and throwing.' : 'Horizontal velocity remains constant while gravity changes vertical velocity, producing a parabolic path when drag is neglected.',
    assumptions: ['Uniform gravitational field', 'Flat ground', 'Point-like projectile', 'Air drag omitted in this milestone'],
    metrics: [{ key: 'range', label: isFreeFall ? 'Height' : 'Range' }, { key: 'time', label: 'Flight time' }, { key: 'speed', label: 'Speed' }, { key: 'height', label: 'Maximum height' }]
  });

  const state = { speed: isFreeFall ? 0 : 24, angle: isFreeFall ? 90 : 42, gravity: 9.81, startHeight: isFreeFall ? 60 : 0, t: 0, speedScale: 1, trail: [] };
  const reset = () => { state.t = 0; state.trail.length = 0; };
  addRange(ui.controls, { key: 'speed', label: isFreeFall ? 'Initial vertical speed' : 'Launch speed', min: 0, max: 60, step: .5, value: state.speed, unit: ' m/s', onInput: v => { state.speed = v; reset(); } });
  if (!isFreeFall) addRange(ui.controls, { key: 'angle', label: 'Launch angle', min: 5, max: 85, step: 1, value: state.angle, unit: '°', onInput: v => { state.angle = v; reset(); } });
  addRange(ui.controls, { key: 'gravity', label: 'Gravity', min: 1.6, max: 20, step: .01, value: state.gravity, unit: ' m/s²', onInput: v => { state.gravity = v; reset(); } });
  addRange(ui.controls, { key: 'height0', label: 'Initial height', min: 0, max: 100, step: 1, value: state.startHeight, unit: ' m', onInput: v => { state.startHeight = v; reset(); } });

  let current = { x: 0, y: state.startHeight, vx: 0, vy: state.speed };
  const solve = t => {
    const theta = state.angle * Math.PI / 180;
    const vx = isFreeFall ? 0 : state.speed * Math.cos(theta);
    const vy0 = state.speed * Math.sin(theta);
    return { x: vx * t, y: state.startHeight + vy0 * t - .5 * state.gravity * t * t, vx, vy: vy0 - state.gravity * t };
  };
  const theta = () => state.angle * Math.PI / 180;
  const flightTime = () => {
    const vy0 = state.speed * Math.sin(theta());
    return (vy0 + Math.sqrt(vy0 ** 2 + 2 * state.gravity * state.startHeight)) / state.gravity;
  };

  const resizeOff = observeResize(ui.canvas.parentElement, () => render());
  const engine = new PhysicsEngine({ targetFps: lowPerformance ? 30 : 60, fixedDt: 1 / 120,
    update(dt) {
      state.t += dt * state.speedScale;
      const total = Math.max(.2, flightTime());
      if (state.t > total + .35) reset();
      current = solve(Math.min(state.t, total));
      if (current.y >= 0) {
        state.trail.push({ x: current.x, y: current.y });
        const max = lowPerformance ? 55 : 180;
        if (state.trail.length > max) state.trail.shift();
      }
    }, render });

  function render() {
    const { ctx, width, height } = fitCanvas(ui.canvas, lowPerformance ? 1 : 1.75); const c = themeColors(); clearCanvas(ctx, width, height); grid(ctx, width, height, lowPerformance ? 75 : 48);
    const ft = flightTime(); const end = solve(ft); const maxH = state.startHeight + (state.speed * Math.sin(theta())) ** 2 / (2 * state.gravity);
    const maxX = Math.max(10, end.x * 1.1, 20); const maxY = Math.max(10, maxH * 1.25);
    const left = 45, right = 24, top = 24, bottom = 44; const sx = (width - left - right) / maxX, sy = (height - top - bottom) / maxY;
    const toPx = p => ({ x: left + p.x * sx, y: height - bottom - p.y * sy });
    ctx.strokeStyle = c.border; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(left, height - bottom); ctx.lineTo(width - right, height - bottom); ctx.stroke();
    if (state.trail.length > 1) { ctx.strokeStyle = c.accent2; ctx.lineWidth = 2; ctx.beginPath(); state.trail.forEach((p,i)=>{ const q=toPx(p); i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y); }); ctx.stroke(); }
    const q = toPx(current.y == null ? solve(0) : current); ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(q.x, q.y, 9, 0, Math.PI*2); ctx.fill();
    const velocityScale = 2.2; drawArrow(ctx, q.x, q.y, q.x + current.vx * velocityScale, q.y - current.vy * velocityScale, c.accent3, 'v'); drawArrow(ctx, q.x, q.y, q.x, q.y + Math.min(70,state.gravity*5), c.warning, 'g');
    ctx.fillStyle = c.muted; ctx.font = '11px ui-monospace, monospace'; ctx.fillText('ground', left, height - 24);
    const speed = Math.hypot(current.vx || 0, current.vy || 0);
    ui.metric('range', isFreeFall ? `${format(state.startHeight)} m` : `${format(end.x)} m`); ui.metric('time', `${format(ft)} s`); ui.metric('speed', `${format(speed)} m/s`); ui.metric('height', `${format(maxH)} m`);
    ui.readout.textContent = `t=${format(state.t)} s · x=${format(current.x || 0)} m · y=${format(current.y || 0)} m`;
    ui.setEquation(isFreeFall ? `y=${format(state.startHeight)}+${format(state.speed)}t−½(${format(state.gravity)})t²` : `x=${format(state.speed*Math.cos(theta()))}t,  y=${format(state.startHeight)}+${format(state.speed*Math.sin(theta()))}t−½(${format(state.gravity)})t²`);
  }
  bindTransport(ui, engine, reset, v => state.speedScale = v); engine.start();
  return () => { engine.destroy(); resizeOff(); };
}
