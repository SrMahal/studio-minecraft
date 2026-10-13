(() => {
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
      previous.textContent = index ? '← Anterior' : '← Início';
      const last = index === panels.length - 1;
      next.href = last ? next.dataset.endHref : '#' + panels[index + 1].id;
      next.textContent = last ? next.dataset.endLabel + ' ↗' : 'Próxima seção →';
      counter.textContent = 'Seção ' + (index + 1) + ' de ' + panels.length;
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
