const state = {
  catalog: [],
  categories: [],
  challenges: [],
  currentView: 'home',
  currentItem: null,
  cleanupLab: null,
  query: '',
  category: 'all',
  favorites: new Set(readJson('physics-explorer-favorites', [])),
  lowPerformance: localStorage.getItem('physics-explorer-low-performance') === 'true',
  deferredInstall: null
};

const el = id => document.getElementById(id);
const views = {
  home: el('homeView'), catalog: el('catalogView'), favorites: el('favoritesView'),
  challenges: el('challengesView'), lab: el('labView')
};

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function saveFavorites() {
  localStorage.setItem('physics-explorer-favorites', JSON.stringify([...state.favorites]));
}

function showToast(message) {
  const toast = el('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function setView(name, { updateHash = true } = {}) {
  if (state.cleanupLab && name !== 'lab') {
    state.cleanupLab();
    state.cleanupLab = null;
  }
  Object.entries(views).forEach(([key, node]) => node.classList.toggle('active', key === name));
  document.querySelectorAll('.nav-item').forEach(node => node.classList.toggle('active', node.dataset.view === name));
  state.currentView = name;
  const labels = { home: 'Discover', catalog: 'All simulations', favorites: 'Saved labs', challenges: 'Challenges', lab: state.currentItem?.title || 'Laboratory' };
  el('breadcrumb').textContent = labels[name];
  closeSidebar();
  if (name === 'favorites') renderFavorites();
  if (name === 'challenges') renderChallenges();
  if (updateHash && name !== 'lab') history.replaceState(null, '', `#${name}`);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function closeSidebar() {
  el('sidebar').classList.remove('open');
  el('sidebarScrim').hidden = true;
}

function openSidebar() {
  el('sidebar').classList.add('open');
  el('sidebarScrim').hidden = false;
}

function cardMarkup(item, compact = false) {
  const saved = state.favorites.has(item.id);
  return `
    <article class="${compact ? 'feature-card' : 'sim-card'}" data-open-id="${item.id}" tabindex="0" role="button" aria-label="Open ${escapeHtml(item.title)}">
      <div class="card-icon" aria-hidden="true">${item.icon}</div>
      <div class="card-kicker">${String(item.number).padStart(3, '0')} · ${escapeHtml(item.category)}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="${compact ? 'card-footer' : 'sim-card-actions'}">
        <span class="live-pill">Interactive</span>
        ${compact ? '<span class="arrow-link">Open →</span>' : `<button class="save-card ${saved ? 'saved' : ''}" data-save-id="${item.id}" aria-label="${saved ? 'Remove from saved labs' : 'Save lab'}">${saved ? '★' : '☆'}</button>`}
      </div>
    </article>`;
}

function bindCards(root) {
  root.querySelectorAll('[data-open-id]').forEach(card => {
    const open = event => {
      if (event.target.closest('[data-save-id]')) return;
      if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      const item = state.catalog.find(entry => entry.id === card.dataset.openId);
      if (item) openLab(item);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', open);
  });
  root.querySelectorAll('[data-save-id]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    toggleFavorite(button.dataset.saveId);
  }));
}

function renderFeatured(featuredIds) {
  const root = el('featuredGrid');
  const items = featuredIds.map(id => state.catalog.find(item => item.id === id)).filter(Boolean);
  root.innerHTML = items.slice(0, 6).map(item => cardMarkup(item, true)).join('');
  bindCards(root);
}

function renderCatalog() {
  const query = state.query.trim().toLowerCase();
  const filtered = state.catalog.filter(item => {
    const matchesCategory = state.category === 'all' || item.category === state.category;
    const haystack = `${item.title} ${item.description} ${item.formula} ${item.category}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
  el('catalogStats').textContent = `${filtered.length} of ${state.catalog.length} simulations`;
  const root = el('catalogGrid');
  root.innerHTML = filtered.length ? filtered.map(item => cardMarkup(item)).join('') : '<div class="empty-state"><div><strong>No matching simulation</strong><br><span>Try a broader concept or another topic.</span></div></div>';
  bindCards(root);
}

function renderFavorites() {
  const root = el('favoritesGrid');
  const items = state.catalog.filter(item => state.favorites.has(item.id));
  root.innerHTML = items.length ? items.map(item => cardMarkup(item)).join('') : '<div class="empty-state"><div><strong>No saved laboratories yet</strong><br><span>Tap ☆ on a simulation card to save it here.</span></div></div>';
  bindCards(root);
}

function renderChallenges() {
  const root = el('challengeList');
  root.innerHTML = state.challenges.map((challenge, index) => `<article class="challenge-card"><div class="eyebrow">CHALLENGE ${index + 1}</div><h3>${escapeHtml(challenge.title)}</h3><p>${escapeHtml(challenge.text)}</p></article>`).join('');
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    showToast('Removed from saved labs');
  } else {
    state.favorites.add(id);
    showToast('Saved to your laboratories');
  }
  saveFavorites();
  renderCatalog();
  if (state.currentView === 'favorites') renderFavorites();
  if (state.currentItem?.id === id) updateFavoriteButton();
}

function updateFavoriteButton() {
  const saved = state.currentItem && state.favorites.has(state.currentItem.id);
  el('favoriteButton').classList.toggle('saved', Boolean(saved));
  el('favoriteButton').textContent = saved ? '★' : '☆';
  el('favoriteButton').setAttribute('aria-label', saved ? 'Remove simulation from saved labs' : 'Save simulation');
}

async function openLab(item) {
  if (state.cleanupLab) { state.cleanupLab(); state.cleanupLab = null; }
  state.currentItem = item;
  el('labTitle').textContent = item.title;
  el('labMeta').textContent = `${item.category.toUpperCase()} · INTERACTIVE LAB · ${String(item.number).padStart(3, '0')}`;
  el('breadcrumb').textContent = item.title;
  updateFavoriteButton();
  setView('lab', { updateHash: false });
  history.replaceState(null, '', `#lab/${encodeURIComponent(item.id)}`);
  const mount = el('labMount');
  mount.innerHTML = '<div class="loading-lab">Loading the simulation module…</div>';
  try {
    const modulePath = simulatorModule(item.module);
    const module = await import(modulePath);
    if (state.currentItem?.id !== item.id) return;
    mount.innerHTML = '';
    state.cleanupLab = module.createSimulator(mount, { item, lowPerformance: state.lowPerformance }) || null;
  } catch (error) {
    console.error(error);
    mount.innerHTML = `<div class="fallback-lab"><h2>Simulation could not start</h2><p>${escapeHtml(error.message || 'Unknown module error')}</p><button class="secondary-button" id="retryLab">Retry</button></div>`;
    el('retryLab')?.addEventListener('click', () => openLab(item));
  }
}

function simulatorModule(moduleName) {
  const paths = {
    kinematics: './simulators/kinematics.js',
    freefall: './simulators/projectile.js',
    projectile: './simulators/projectile.js',
    oscillations: './simulators/oscillations.js',
    waves: './simulators/waves.js',
    electricity: './simulators/electricity.js',
    optics: './simulators/optics.js'
  };
  return paths[moduleName] || './simulators/concept-lab.js';
}

function answerQuestion(raw) {
  const question = raw.trim();
  if (!question) return;
  const normalized = question.toLowerCase();
  const exactAliases = [
    ['projectile', 'projectile motion'], ['spring', "hooke's law"], ['hooke', "hooke's law"], ['ohm', "ohm's law"],
    ['lens', 'lens equation'], ['mirror', 'mirror equation'], ['wave', 'wave speed'], ['coulomb', "coulomb's law"],
    ['free fall', 'free-fall simulator'], ['resonance', 'resonance'], ['collision', 'elastic collision']
  ];
  let item = null;
  for (const [token, title] of exactAliases) {
    if (normalized.includes(token)) { item = state.catalog.find(entry => entry.title.toLowerCase() === title); if (item) break; }
  }
  if (!item) {
    const words = normalized.split(/\W+/).filter(word => word.length > 2);
    item = state.catalog.map(entry => ({ entry, score: words.reduce((score, word) => score + (`${entry.title} ${entry.description} ${entry.formula}`.toLowerCase().includes(word) ? 1 : 0), 0) })).sort((a,b) => b.score-a.score)[0];
    item = item?.score ? item.entry : null;
  }
  if (item) {
    showToast(`Opening ${item.title}`);
    openLab(item);
  } else {
    state.query = question;
    el('catalogSearch').value = question;
    renderCatalog();
    setView('catalog');
    showToast('Showing the closest catalogue matches');
  }
}

function applyPerformanceMode(enabled, reopen = false) {
  state.lowPerformance = enabled;
  document.documentElement.classList.toggle('low-performance', enabled);
  document.body.classList.toggle('low-performance', enabled);
  el('performanceToggle').checked = enabled;
  localStorage.setItem('physics-explorer-low-performance', String(enabled));
  if (reopen && state.currentView === 'lab' && state.currentItem) openLab(state.currentItem);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('physics-explorer-theme', theme);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function wireUi() {
  document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  document.querySelectorAll('[data-view-target]').forEach(button => button.addEventListener('click', () => setView(button.dataset.viewTarget)));
  document.querySelectorAll('[data-category-jump]').forEach(button => button.addEventListener('click', () => {
    state.category = button.dataset.categoryJump;
    el('categorySelect').value = state.category;
    renderCatalog(); setView('catalog');
  }));
  document.querySelectorAll('.level-filter').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.level-filter').forEach(node => node.classList.remove('active'));
    button.classList.add('active');
    if (button.dataset.level !== 'all' && button.dataset.level !== 'School') showToast(`${button.dataset.level} modules are prepared for the next milestone`);
    else setView('catalog');
  }));
  el('catalogSearch').addEventListener('input', event => { state.query = event.target.value; renderCatalog(); });
  el('categorySelect').addEventListener('change', event => { state.category = event.target.value; renderCatalog(); });
  el('focusSearch').addEventListener('click', () => { setView('catalog'); setTimeout(() => el('catalogSearch').focus(), 0); });
  el('questionForm').addEventListener('submit', event => { event.preventDefault(); answerQuestion(el('questionInput').value); });
  document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => { el('questionInput').value = button.dataset.question; answerQuestion(button.dataset.question); }));
  el('newLabButton').addEventListener('click', () => { el('questionInput').value = ''; setView('home'); setTimeout(() => el('questionInput').focus(), 0); });
  el('backButton').addEventListener('click', () => setView('catalog'));
  el('favoriteButton').addEventListener('click', () => state.currentItem && toggleFavorite(state.currentItem.id));
  el('sidebarOpen').addEventListener('click', openSidebar); el('sidebarClose').addEventListener('click', closeSidebar); el('sidebarScrim').addEventListener('click', closeSidebar);
  el('performanceToggle').addEventListener('change', event => applyPerformanceMode(event.target.checked, true));
  el('themeToggle').addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
  el('installButton').addEventListener('click', async () => {
    if (!state.deferredInstall) return;
    state.deferredInstall.prompt(); await state.deferredInstall.userChoice; state.deferredInstall = null; el('installButton').hidden = true;
  });
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); state.deferredInstall = event; el('installButton').hidden = false; });
  window.addEventListener('hashchange', handleInitialRoute);
}

function handleInitialRoute() {
  const hash = location.hash.slice(1);
  if (hash.startsWith('lab/')) {
    const id = decodeURIComponent(hash.slice(4));
    const item = state.catalog.find(entry => entry.id === id);
    if (item) return openLab(item);
  }
  if (views[hash]) setView(hash, { updateHash: false });
}

async function init() {
  applyTheme(localStorage.getItem('physics-explorer-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  applyPerformanceMode(state.lowPerformance);
  wireUi();
  await new Promise(requestAnimationFrame);
  const data = await import('./data/catalog.js');
  state.catalog = data.catalog; state.categories = data.categories; state.challenges = data.challenges;
  const select = el('categorySelect');
  data.categories.forEach(category => select.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`));
  renderFeatured(data.featuredIds); renderCatalog(); renderChallenges(); handleInitialRoute();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(console.warn);
}

init().catch(error => {
  console.error(error);
  el('featuredGrid').innerHTML = `<div class="empty-state">The catalogue failed to load: ${escapeHtml(error.message)}</div>`;
});
