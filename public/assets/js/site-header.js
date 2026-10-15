/* Menu compartilhado das páginas públicas StudioCraft. */
(() => {
  const mount = document.querySelector('[data-site-header]');
  if (!mount) return;
  const base = mount.dataset.base === '../../' ? '../../' : './';
  const page = mount.dataset.page;
  const icon = {
    inicio: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    mods: '<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
    ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 17h.01"/>'
  };
  const svg = value => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + value + '</svg>';
  const links = [
    ['inicio', base, 'Início'], ['mods', base + 'pages/mods/', 'Mods'],
    ['ajuda', base + 'pages/ajuda/', 'Ajuda']
  ];
  mount.innerHTML = `
    <a class="brand" href="${base}"><img src="${base}assets/img/threeebs-symbol.png" width="32" height="32" alt=""><span>Studio Minecraft<small>por Threeebs!</small></span></a>
    <nav class="nav" aria-label="Navegação principal">
      ${links.map(([id,href,label]) => '<a href="' + href + '"' + (id === page ? ' aria-current="page"' : '') + '>' + svg(icon[id]) + '<span>' + label + '</span></a>').join('')}
      <a href="${base}login.php">Entrar</a>
    </nav>
    <div class="settings-menu" data-settings-menu>
      <button class="preference-button settings-trigger" type="button" data-settings-trigger aria-controls="painel-configuracoes" aria-expanded="false" aria-label="Abrir configurações">
        ${svg('<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>')}
        <span>Configurações</span><span class="settings-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="preferences settings-panel" id="painel-configuracoes" role="group" aria-label="Preferências de leitura" hidden data-preferences>
        <div class="text-size-controls" role="group" aria-label="Tamanho do texto">
          <span class="preference-label">Texto</span>
          <button class="preference-button" type="button" data-text-smaller aria-label="Diminuir tamanho do texto">A−</button>
          <output data-text-size aria-live="polite" aria-label="Tamanho atual do texto">100%</output>
          <button class="preference-button" type="button" data-text-larger aria-label="Aumentar tamanho do texto">A+</button>
        </div>
        <button class="preference-button" type="button" data-theme-toggle aria-label="Ativar modo claro" aria-pressed="false">
          ${svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>')}
          <span data-theme-label>Escuro</span>
        </button>
        <button class="preference-button" type="button" data-motion-toggle aria-pressed="false">
          ${svg('<path d="m13 2-9 12h7l-1 8 10-12h-7Z"/>')}
          <span data-motion-label>Animações</span>
        </button>
      </div>
    </div>`;
})();