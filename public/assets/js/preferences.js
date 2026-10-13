// Apply saved reading preferences before the first paint, including on nested pages.
(() => {
  const root = document.documentElement;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('studio-minecraft:reading')) || {}; }
  catch { /* Reading controls remain available when storage is blocked. */ }
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  root.dataset.theme = ['light', 'dark'].includes(saved.theme) ? saved.theme : prefersLight ? 'light' : 'dark';
  root.dataset.textSize = ['100', '125', '150'].includes(saved.textSize) ? saved.textSize : '100';
  root.dataset.motion = ['reduced', 'full'].includes(saved.motion) ? saved.motion : 'full';
})();
