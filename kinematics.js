import { PhysicsEngine, fitCanvas, clearCanvas, themeColors, drawArrow, grid } from '../core/engine.js';
import { createLabShell, addRange, bindTransport, observeResize, format } from '../core/lab-ui.js';

export function createSimulator(container, { item, lowPerformance = false }) {
  const ui = createLabShell(container, {
    equation: item.formula,
    explanation: 'The object is integrated with a fixed physics timestep. Sliders change the initial conditions without forcing a page-wide re-render.',
    assumptions: ['One-dimensional motion', 'Acceleration is uniform unless Variable acceleration is selected', 'Relativistic effects are ignored'],
    metrics: [{ key: 'x', label: 'Position' }, { key: 'v', label: 'Velocity' }, { key: 'a', label: 'Acceleration' }, { key: 't', label: 'Time' }]
  });

  const state = { u: 6, a: 2, duration: 8, t: 0, x: 0, v: 6, speedScale: 1, points: [] };
  const variable = item.title.includes('Variable');
  const recalc = () => {
    const aNow = variable ? state.a * Math.sin(state.t * 1.1) : state.a;
    state.x = state.u * state.t + 0.5 * (variable ? state.a * (state.t - Math.sin(1.1 * state.t) / 1.1) : state.a * state.t ** 2);
    state.v = state.u + (variable ? state.a * (1 - Math.cos(1.1 * state.t)) / 1.1 : state.a * state.t);
    return aNow;
  };
  const reset = () => { state.t = 0; state.x = 0; state.v = state.u; state.points.length = 0; };

  addRange(ui.controls, { key: 'u', label: 'Initial velocity', min: -15, max: 25, step: .5, value: state.u, unit: ' m/s', onInput: v => { state.u = v; reset(); } });
  addRange(ui.controls, { key: 'a', label: variable ? 'Acceleration amplitude' : 'Acceleration', min: -10, max: 12, step: .25, value: state.a, unit: ' m/s²', onInput: v => { state.a = v; reset(); } });
  addRange(ui.controls, { key: 'duration', label: 'Run duration', min: 2, max: 16, step: .5, value: state.duration, unit: ' s', onInput: v => { state.duration = v; reset(); } });

  let size = { width: 600, height: 400 };
  const resizeOff = observeResize(ui.canvas.parentElement, rect => { size = rect; render(); });
  const engine = new PhysicsEngine({
    targetFps: lowPerformance ? 30 : 60,
    fixedDt: 1 / 120,
    update(dt) {
      state.t += dt * state.speedScale;
      if (state.t > state.duration) state.t = 0;
      const aNow = recalc();
      if (!lowPerformance || state.points.length % 2 === 0) state.points.push({ t: state.t, x: state.x });
      const maxPoints = lowPerformance ? 90 : 220;
      if (state.points.length > maxPoints) state.points.shift();
      state.aNow = aNow;
    },
    render
  });

  function render() {
    const { ctx, width, height } = fitCanvas(ui.canvas, lowPerformance ? 1 : 1.75);
    size = { width, height };
    const c = themeColors();
    clearCanvas(ctx, width, height);
    grid(ctx, width, height, lowPerformance ? 70 : 45);
    const groundY = height * .64;
    ctx.strokeStyle = c.border; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(24, groundY); ctx.lineTo(width - 24, groundY); ctx.stroke();
    const progressX = ((state.x % 100) + 100) % 100;
    const px = 40 + progressX / 100 * Math.max(80, width - 100);
    ctx.fillStyle = c.accent; ctx.beginPath(); ctx.roundRect(px - 24, groundY - 29, 48, 22, 7); ctx.fill();
    ctx.fillStyle = c.text; for (const dx of [-15, 15]) { ctx.beginPath(); ctx.arc(px + dx, groundY - 5, 6, 0, Math.PI * 2); ctx.fill(); }
    const vScale = Math.max(-90, Math.min(90, state.v * 3));
    drawArrow(ctx, px, groundY - 40, px + vScale, groundY - 40, c.accent3, 'v');
    drawArrow(ctx, px, groundY - 65, px + Math.max(-70, Math.min(70, state.aNow * 6)), groundY - 65, c.warning, 'a');

    const graphTop = 24, graphHeight = Math.max(90, groundY - 115), graphLeft = 40, graphWidth = Math.max(120, width - 80);
    ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(graphLeft, graphTop); ctx.lineTo(graphLeft, graphTop + graphHeight); ctx.lineTo(graphLeft + graphWidth, graphTop + graphHeight); ctx.stroke();
    const maxX = Math.max(10, ...state.points.map(p => Math.abs(p.x)));
    ctx.strokeStyle = c.accent2; ctx.lineWidth = 2; ctx.beginPath();
    state.points.forEach((p, i) => {
      const x = graphLeft + (p.t / state.duration) * graphWidth;
      const y = graphTop + graphHeight / 2 - (p.x / maxX) * graphHeight * .42;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = c.muted; ctx.font = '11px ui-monospace, monospace'; ctx.fillText('position vs time', graphLeft + 6, graphTop + 15);

    ui.metric('x', `${format(state.x)} m`); ui.metric('v', `${format(state.v)} m/s`); ui.metric('a', `${format(state.aNow)} m/s²`); ui.metric('t', `${format(state.t)} s`);
    ui.readout.textContent = `x=${format(state.x)} m · v=${format(state.v)} m/s`;
    ui.setEquation(variable ? `a(t)=${format(state.a)}sin(1.1t),  v≈${format(state.v)},  x≈${format(state.x)}` : `v=${format(state.u)}+(${format(state.a)})(${format(state.t)})=${format(state.v)} m/s`);
  }

  bindTransport(ui, engine, reset, value => { state.speedScale = value; });
  engine.start();
  return () => { engine.destroy(); resizeOff(); };
}
