if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r = 0) {
    const radius = Math.min(Math.abs(w) / 2, Math.abs(h) / 2, Number(r) || 0);
    this.moveTo(x + radius, y);
    this.arcTo(x + w, y, x + w, y + h, radius);
    this.arcTo(x + w, y + h, x, y + h, radius);
    this.arcTo(x, y + h, x, y, radius);
    this.arcTo(x, y, x + w, y, radius);
    this.closePath();
    return this;
  };
}

export class PhysicsEngine {
  constructor({ update, render, fixedDt = 1 / 120, targetFps = 60, maxFrameTime = 0.1 }) {
    this.update = update;
    this.render = render;
    this.fixedDt = fixedDt;
    this.targetFps = targetFps;
    this.maxFrameTime = maxFrameTime;
    this.running = false;
    this.paused = false;
    this.accumulator = 0;
    this.lastTime = 0;
    this.lastRender = 0;
    this.rafId = 0;
    this.boundLoop = this.loop.bind(this);
    this.onVisibility = () => {
      if (document.hidden) {
        this.wasRunningBeforeHidden = this.running && !this.paused;
        this.stop();
      } else if (this.wasRunningBeforeHidden) {
        this.start();
      }
    };
    document.addEventListener('visibilitychange', this.onVisibility, { passive: true });
  }

  setTargetFps(value) {
    this.targetFps = Math.max(1, Number(value) || 60);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTime = performance.now();
    this.lastRender = this.lastTime;
    this.rafId = requestAnimationFrame(this.boundLoop);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    if (!this.running) return this.start();
    this.paused = false;
    this.lastTime = performance.now();
  }

  toggle() {
    this.paused ? this.resume() : this.pause();
    return !this.paused;
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  loop(now) {
    if (!this.running) return;
    const elapsed = Math.min((now - this.lastTime) / 1000, this.maxFrameTime);
    this.lastTime = now;

    if (!this.paused) {
      this.accumulator += elapsed;
      while (this.accumulator >= this.fixedDt) {
        this.update(this.fixedDt);
        this.accumulator -= this.fixedDt;
      }
    }

    const renderInterval = 1000 / this.targetFps;
    if (now - this.lastRender >= renderInterval) {
      const alpha = this.accumulator / this.fixedDt;
      this.render(alpha, now);
      this.lastRender = now;
    }
    this.rafId = requestAnimationFrame(this.boundLoop);
  }

  destroy() {
    this.stop();
    document.removeEventListener('visibilitychange', this.onVisibility);
  }
}

export function fitCanvas(canvas, maxDpr = 2) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height, dpr };
}

export function clearCanvas(ctx, width, height, color = 'transparent') {
  ctx.clearRect(0, 0, width, height);
  if (color !== 'transparent') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }
}

export function themeColors() {
  const css = getComputedStyle(document.documentElement);
  return {
    text: css.getPropertyValue('--text').trim(),
    muted: css.getPropertyValue('--muted').trim(),
    accent: css.getPropertyValue('--accent').trim(),
    accent2: css.getPropertyValue('--accent-2').trim(),
    accent3: css.getPropertyValue('--accent-3').trim(),
    border: css.getPropertyValue('--border-strong').trim(),
    panel2: css.getPropertyValue('--panel-2').trim(),
    warning: css.getPropertyValue('--warning').trim(),
    danger: css.getPropertyValue('--danger').trim()
  };
}

export function drawArrow(ctx, x1, y1, x2, y2, color, label = '') {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 8;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath(); ctx.fill();
  if (label) {
    ctx.font = '12px ui-monospace, monospace';
    ctx.fillText(label, x2 + 6, y2 - 6);
  }
  ctx.restore();
}

export function grid(ctx, width, height, step = 40, color = 'rgba(120,150,180,.12)') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
  for (let y = 0; y <= height; y += step) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
  ctx.stroke();
  ctx.restore();
}
