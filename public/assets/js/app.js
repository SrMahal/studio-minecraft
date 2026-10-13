(() => {
  const root = document.documentElement;
  const preferences = document.querySelector('[data-preferences]');
  if (preferences) {
    const themeButton = preferences.querySelector('[data-theme-toggle]');
    const motionButton = preferences.querySelector('[data-motion-toggle]');
    const smaller = preferences.querySelector('[data-text-smaller]');
    const larger = preferences.querySelector('[data-text-larger]');
    const sizes = ['100', '125', '150'];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreferences = () => {
      const light = root.dataset.theme === 'light';
      const reduced = root.dataset.motion === 'reduced' || reducedMotion.matches;
      themeButton.setAttribute('aria-pressed', String(light));
      themeButton.setAttribute('aria-label', light ? 'Tema claro: ativar modo escuro' : 'Tema escuro: ativar modo claro');
      themeButton.querySelector('[data-theme-label]').textContent = light ? 'Claro' : 'Escuro';
      themeButton.querySelector('svg').innerHTML = light
        ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>'
        : '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z"/>';
      motionButton.setAttribute('aria-pressed', String(reduced));
      motionButton.querySelector('[data-motion-label]').textContent = reduced ? 'Sem animações' : 'Animações';
      motionButton.setAttribute('aria-label', reduced ? 'Sem animações: ativar animações' : 'Animações: reduzir animações');
      motionButton.disabled = reducedMotion.matches;
      motionButton.title = reducedMotion.matches ? 'Animações reduzidas pela preferência do sistema' : 'Ativar ou reduzir animações';
      const size = sizes.indexOf(root.dataset.textSize);
      smaller.disabled = size === 0;
      larger.disabled = size === sizes.length - 1;
      preferences.querySelector('[data-text-size]').textContent = root.dataset.textSize + '%';
      document.querySelector('meta[name="theme-color"]').content = light ? '#f3f7f6' : '#181818';
    };
    const savePreferences = () => {
      updatePreferences();
      try { localStorage.setItem('studio-minecraft:reading', JSON.stringify({ theme: root.dataset.theme, textSize: root.dataset.textSize, motion: root.dataset.motion })); }
      catch { /* Preferences still work for the current page. */ }
    };
    themeButton.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      savePreferences();
    });
    motionButton.addEventListener('click', () => {
      root.dataset.motion = root.dataset.motion === 'reduced' ? 'full' : 'reduced';
      savePreferences();
    });
    [smaller, larger].forEach((button, i) => button.addEventListener('click', () => {
      const index = Math.max(0, Math.min(sizes.length - 1, sizes.indexOf(root.dataset.textSize) + (i ? 1 : -1)));
      root.dataset.textSize = sizes[index];
      savePreferences();
    }));
    reducedMotion.addEventListener('change', updatePreferences);
    preferences.hidden = false;
    updatePreferences();
  }

  // Decorative icons always accompany readable labels and stay out of screen readers.
  const icon = name => {
    const paths = {
      left: 'M20 12H4m6-6-6 6 6 6',
      right: 'M4 12h16m-6-6 6 6-6 6',
      external: 'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7'
    };
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', paths[name]);
    svg.append(path);
    return svg;
  };
  const labelButton = (button, label, symbol, first = false) => {
    const text = document.createElement('span');
    text.textContent = label;
    button.replaceChildren(...(first ? [icon(symbol), text] : [text, icon(symbol)]));
  };
  const journey = document.querySelector('[data-journey]');
  if (journey) {
    const panels = [...journey.querySelectorAll('.panel')];
    const links = [...journey.querySelectorAll('[data-step-link]')];
    const previous = journey.querySelector('[data-previous]');
    const next = journey.querySelector('[data-next]');
    const counter = journey.querySelector('[data-step-counter]');
    const status = journey.querySelector('[data-step-status]');
    const startHref = previous.getAttribute('href');
    let current = 0;

    const indexFromHash = () => {
      let id;
      try { id = decodeURIComponent(location.hash.slice(1)); }
      catch { return 0; }
      const index = panels.findIndex(panel => panel.id === id);
      return index < 0 ? 0 : index;
    };
    const show = (index, focus = false) => {
      current = index;
      panels.forEach((panel, i) => { panel.hidden = i !== index; });
      links.forEach((link, i) => {
        if (i === index) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
      previous.href = index ? '#' + panels[index - 1].id : startHref;
      labelButton(previous, index ? 'Anterior' : 'Início', 'left', true);
      const last = index === panels.length - 1;
      next.href = last ? next.dataset.endHref : '#' + panels[index + 1].id;
      labelButton(next, last ? next.dataset.endLabel : 'Próxima', last ? 'external' : 'right');
      counter.textContent = 'Seção ' + (index + 1) + ' de ' + panels.length;
      panels.forEach(panel => panel.classList.remove('panel-enter'));
      // Restart the short entrance when navigating, including repeated sections.
      void panels[index].offsetWidth;
      panels[index].classList.add('panel-enter');
      if (focus) {
        status.textContent = counter.textContent;
        journey.querySelector('.panels').scrollTop = 0;
        panels[index].querySelector('h1').focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };
    journey.classList.add('journey-enhanced');
    show(indexFromHash());
    document.querySelector('.skip-link')?.addEventListener('click', event => {
      event.preventDefault();
      panels[current].querySelector('h1').focus({ preventScroll: true });
    });
    journey.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const index = panels.findIndex(panel => '#' + panel.id === href);
      if (index < 0) return;
      event.preventDefault();
      if (index !== current) history.pushState(null, '', href);
      show(index, true);
    });
    const restore = () => show(indexFromHash(), true);
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
  }

  const toast = document.getElementById('toast');
  let toastTimer;
  const notify = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  };
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy;
      let copied = false;
      try {
        await navigator.clipboard.writeText(value);
        copied = true;
      } catch {
        const input = document.createElement('textarea');
        input.value = value;
        input.style.cssText = 'position:fixed;top:0;left:-9999px';
        document.body.appendChild(input);
        input.select();
        try { copied = document.execCommand('copy'); } catch { /* Report failure below. */ }
        input.remove();
        button.focus({ preventScroll: true });
      }
      notify(copied ? 'Copiado: ' + value : 'Não foi possível copiar. Selecione o texto e copie manualmente.');
    });
  });

  document.querySelectorAll('[data-checklist]').forEach((list, listIndex) => {
    const items = [...list.querySelectorAll('input[type="checkbox"]')];
    const progress = list.querySelector('.check-progress');
    const storageKey = 'studio-minecraft:' + location.pathname + ':checklist:' + listIndex;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      if (Array.isArray(saved)) items.forEach((item, i) => { item.checked = saved[i] === true; });
    } catch { /* The checklist also works without storage. */ }
    const update = () => {
      const completed = items.filter(item => item.checked).length;
      progress.textContent = completed === items.length ? 'Tudo conferido. Pronto para jogar!' : completed + ' de ' + items.length + ' concluídos';
      try { sessionStorage.setItem(storageKey, JSON.stringify(items.map(item => item.checked))); }
      catch { /* Storage can be unavailable in private sessions. */ }
    };
    items.forEach(item => item.addEventListener('change', update));
    update();
  });

  document.querySelectorAll('.faq').forEach(faq => {
    faq.querySelectorAll('details').forEach(detail => {
      detail.addEventListener('toggle', () => {
        if (detail.open) faq.querySelectorAll('details').forEach(other => {
          if (other !== detail) other.open = false;
        });
      });
    });
  });
})();
