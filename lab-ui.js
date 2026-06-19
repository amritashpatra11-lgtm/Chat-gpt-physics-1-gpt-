export function createLabShell(container, { equation, explanation, assumptions = [], metrics = [] }) {
  container.innerHTML = `
    <div class="lab-layout">
      <section class="lab-stage">
        <div class="canvas-wrap"><canvas aria-label="Interactive simulation canvas"></canvas></div>
        <div class="stage-toolbar">
          <div class="transport-controls">
            <button class="transport-button play-pause" aria-label="Pause simulation">Ⅱ</button>
            <button class="transport-button reset" aria-label="Restart simulation">↺</button>
            <button class="transport-button slow" aria-label="Toggle slow motion">½×</button>
          </div>
          <div class="stage-readout">Ready</div>
        </div>
      </section>
      <aside class="lab-side">
        <section class="lab-panel">
          <h2>Parameters</h2>
          <div class="controls"></div>
          <div class="equation-box">${escapeHtml(equation)}</div>
          <div class="metric-grid">${metrics.map(metric => `<div class="metric" data-metric="${metric.key}"><small>${escapeHtml(metric.label)}</small><strong>—</strong></div>`).join('')}</div>
        </section>
        <section class="lab-explanation">
          <h2>What the model shows</h2>
          <p>${escapeHtml(explanation)}</p>
          ${assumptions.length ? `<h2>Assumptions</h2><ul>${assumptions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
        </section>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas');
  const controls = container.querySelector('.controls');
  const readout = container.querySelector('.stage-readout');
  const playPause = container.querySelector('.play-pause');
  const reset = container.querySelector('.reset');
  const slow = container.querySelector('.slow');

  return {
    canvas, controls, readout, playPause, reset, slow,
    metric(key, value) {
      const node = container.querySelector(`[data-metric="${key}"] strong`);
      if (node) node.textContent = value;
    },
    setEquation(value) {
      const box = container.querySelector('.equation-box');
      if (box) box.textContent = value;
    }
  };
}

export function addRange(controls, { key, label, min, max, step, value, unit = '', onInput }) {
  const group = document.createElement('div');
  group.className = 'control-group';
  group.innerHTML = `
    <div class="control-heading"><label for="${key}">${escapeHtml(label)}</label><span class="control-value"><span>${value}</span>${escapeHtml(unit)}</span></div>
    <div class="number-row">
      <input id="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
      <input type="number" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${escapeHtml(label)} numerical value" />
    </div>`;
  const range = group.querySelector('input[type="range"]');
  const number = group.querySelector('input[type="number"]');
  const output = group.querySelector('.control-value span');
  const apply = raw => {
    let next = Number(raw);
    if (!Number.isFinite(next)) next = Number(value);
    next = Math.min(Number(max), Math.max(Number(min), next));
    range.value = String(next);
    number.value = String(next);
    output.textContent = format(next);
    onInput(next);
  };
  range.addEventListener('input', event => apply(event.target.value), { passive: true });
  number.addEventListener('change', event => apply(event.target.value));
  controls.append(group);
  return { element: group, set: apply };
}

export function addSelect(controls, { key, label, options, value, onInput }) {
  const group = document.createElement('div');
  group.className = 'control-group';
  group.innerHTML = `<div class="control-heading"><label for="${key}">${escapeHtml(label)}</label></div><select id="${key}">${options.map(option => `<option value="${escapeHtml(option.value)}" ${option.value === value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select>`;
  const select = group.querySelector('select');
  select.style.width = '100%'; select.style.height = '38px'; select.style.borderRadius = '9px';
  select.style.background = 'var(--panel-2)'; select.style.color = 'var(--text)'; select.style.border = '1px solid var(--border)'; select.style.padding = '0 8px';
  select.addEventListener('change', event => onInput(event.target.value));
  controls.append(group);
  return select;
}

export function bindTransport(ui, engine, reset, setSpeed) {
  let slow = false;
  ui.playPause.addEventListener('click', () => {
    const running = engine.toggle();
    ui.playPause.textContent = running ? 'Ⅱ' : '▶';
    ui.playPause.setAttribute('aria-label', running ? 'Pause simulation' : 'Resume simulation');
  });
  ui.reset.addEventListener('click', () => {
    reset();
    engine.resume();
    ui.playPause.textContent = 'Ⅱ';
  });
  ui.slow.addEventListener('click', () => {
    slow = !slow;
    ui.slow.textContent = slow ? '1×' : '½×';
    setSpeed(slow ? 0.5 : 1);
  });
}

export function observeResize(element, callback) {
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) callback(entry.contentRect);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }
  const onResize = () => callback(element.getBoundingClientRect());
  window.addEventListener('resize', onResize, { passive: true });
  requestAnimationFrame(onResize);
  return () => window.removeEventListener('resize', onResize);
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

export function format(value, digits = 2) {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if ((abs >= 10000 || (abs > 0 && abs < 0.001))) return value.toExponential(2);
  return Number(value.toFixed(digits)).toString();
}
