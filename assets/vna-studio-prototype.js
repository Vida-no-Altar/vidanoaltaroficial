(() => {
  const draftPrefix = 'vna-studio-draft';
  const historyKey = 'vna-studio-local-history-v1';

  function text(value, fallback = '') {
    const clean = String(value || '').trim();
    return clean || fallback;
  }

  function safeHref(value) {
    const clean = String(value || '').trim();
    return clean || '#';
  }

  function query(selector) {
    return selector ? document.querySelector(selector) : null;
  }

  function fieldValue(field) {
    if (field instanceof HTMLInputElement && field.type === 'checkbox') return field.checked ? 'sim' : 'nao';
    return String(field.value || '');
  }

  function setFieldValue(field, value) {
    if (field instanceof HTMLInputElement && field.type === 'checkbox') {
      field.checked = value === 'sim' || value === true;
      return;
    }
    field.value = String(value ?? '');
  }

  function updateText(input) {
    const target = query(input.dataset.previewText);
    if (target) target.textContent = text(input.value, input.dataset.previewFallback);
  }

  function updateHref(input) {
    const target = query(input.dataset.previewHref);
    if (target) target.setAttribute('href', safeHref(input.value));
  }

  function updateSource(input) {
    const target = query(input.dataset.previewSrc);
    if (!target) return;
    const nextSource = text(input.value, input.dataset.previewFallback);
    if (nextSource) target.setAttribute('src', nextSource);
  }

  function updateAlt(input) {
    const target = query(input.dataset.previewAlt);
    if (target) target.setAttribute('alt', text(input.value));
  }

  function updateOpacity(input) {
    const target = query(input.dataset.previewOpacity);
    const output = query(input.dataset.previewOutput);
    const value = Math.max(0, Math.min(100, Number(input.value || 100)));
    if (target) target.style.opacity = String(value / 100);
    if (output) output.textContent = `${value}%`;
  }

  function updateDataset(input, key, selectorName) {
    const target = query(input.dataset[selectorName]);
    if (target) target.dataset[key] = input.value;
  }

  function updateRounded(input) {
    const target = query(input.dataset.previewRounded);
    if (!target) return;
    target.dataset.rounded = input.checked ? 'sim' : 'nao';
  }

  function updateAll(root = document) {
    root.querySelectorAll('[data-preview-text]').forEach(updateText);
    root.querySelectorAll('[data-preview-href]').forEach(updateHref);
    root.querySelectorAll('[data-preview-src]').forEach(updateSource);
    root.querySelectorAll('[data-preview-alt]').forEach(updateAlt);
    root.querySelectorAll('[data-preview-opacity]').forEach(updateOpacity);
    root.querySelectorAll('[data-preview-align]').forEach((input) => updateDataset(input, 'align', 'previewAlign'));
    root.querySelectorAll('[data-preview-status]').forEach((input) => updateDataset(input, 'status', 'previewStatus'));
    root.querySelectorAll('[data-preview-position]').forEach((input) => updateDataset(input, 'position', 'previewPosition'));
    root.querySelectorAll('[data-preview-size]').forEach((input) => updateDataset(input, 'size', 'previewSize'));
    root.querySelectorAll('[data-preview-rounded]').forEach(updateRounded);
  }

  function initTabs(root) {
    const tabs = root.querySelectorAll('[data-studio-tab]');
    const panels = root.querySelectorAll('[data-studio-tab-panel]');
    if (!tabs.length || !panels.length) return;

    function activate(id) {
      tabs.forEach((tab) => {
        const selected = tab.dataset.studioTab === id;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.studioTabPanel !== id;
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activate(tab.dataset.studioTab));
    });

    activate(tabs[0].dataset.studioTab);
  }

  function collectStudioFields(root) {
    return [...root.querySelectorAll('[data-studio-field]')]
      .filter((field) => field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)
      .map((field, index) => {
        if (!field.dataset.studioKey) field.dataset.studioKey = field.id || `${field.dataset.studioField}-${index}`;
        if (!field.dataset.studioOriginal) field.dataset.studioOriginal = fieldValue(field);
        return field;
      });
  }

  function getOriginalState(fields) {
    return Object.fromEntries(fields.map((field) => [field.dataset.studioKey, field.dataset.studioOriginal || '']));
  }

  function getCurrentState(fields) {
    return Object.fromEntries(fields.map((field) => [field.dataset.studioKey, fieldValue(field)]));
  }

  function fieldMeta(field) {
    const name = `${field.dataset.studioField || ''} ${field.dataset.studioFieldLabel || ''}`.toLowerCase();
    let type = 'texto';
    if (name.includes('link') || name.includes('email')) type = 'link';
    if (name.includes('imagem') || name.includes('image') || name.includes('capa') || name.includes('source')) type = 'imagem';
    if (name.includes('opacidade') || name.includes('opacity') || name.includes('alinhamento') || name.includes('posicao') || name.includes('posição') || name.includes('tamanho') || name.includes('arredondamento')) type = 'aparência';

    let risk = 'Baixo';
    if (type === 'link' || type === 'imagem' || type === 'aparência' || name.includes('status')) risk = 'Médio';
    if (name.includes('hero') || name.includes('publicado') || name.includes('projeto')) risk = 'Alto';

    return {
      key: field.dataset.studioKey,
      section: field.dataset.studioSection || 'Studio',
      label: field.dataset.studioFieldLabel || field.labels?.[0]?.textContent?.trim() || field.id || 'Campo',
      field: field.dataset.studioField || field.id || 'campo',
      type,
      risk,
    };
  }

  function diffStates(fields, original, current) {
    return fields
      .map((field) => {
        const key = field.dataset.studioKey;
        const before = original[key] ?? '';
        const after = current[key] ?? '';
        if (String(before) === String(after)) return null;
        return { ...fieldMeta(field), before, after, observation: observationForField(field, before, after) };
      })
      .filter(Boolean);
  }

  function observationForField(field, before, after) {
    const name = `${field.dataset.studioField || ''} ${field.dataset.studioFieldLabel || ''}`.toLowerCase();
    if (name.includes('hero') && name.includes('titulo')) return 'Esse texto aparece em uma área importante da página inicial. Revise se ele continua claro para visitantes novos.';
    if (name.includes('link')) return 'Confira se o destino abre o lugar certo e se o texto do botão combina com esse caminho.';
    if (name.includes('opacidade')) return `Opacidade alterada de ${before}% para ${after}%. Verifique se a imagem ainda comunica bem no site público.`;
    if (name.includes('alt')) return 'Alt text ajuda acessibilidade. Ele deve descrever a imagem de forma objetiva.';
    if (name.includes('status') && String(after).toLowerCase().includes('publicado')) return 'Publicado aqui é só simulação. Antes da publicação real, revise título, link, descrição e imagem.';
    return 'Revise se a mudança mantém clareza, identidade visual e coerência com o Vida no Altar.';
  }

  function readHistory() {
    try {
      return JSON.parse(localStorage.getItem(historyKey) || '[]');
    } catch {
      return [];
    }
  }

  function writeHistory(entries) {
    localStorage.setItem(historyKey, JSON.stringify(entries.slice(0, 60)));
  }

  function registerLocalHistory(entry) {
    const entries = readHistory();
    writeHistory([{ user: 'Matheus', at: new Date().toISOString(), ...entry }, ...entries]);
    renderHistoryPage();
  }

  function getModuleName(root) {
    const context = document.body.dataset.studioContext || root.dataset.studioPrototype || 'studio';
    const names = { editor: 'Editor visual', conteudos: 'Conteúdos', midia: 'Mídia', historico: 'Histórico', auditor: 'Auditor VnA' };
    return names[context] || context;
  }

  function draftKey(root) {
    return `${draftPrefix}:${document.body.dataset.studioContext || root.dataset.studioPrototype || 'studio'}`;
  }

  function ensureDraftUi(root) {
    let actions = root.querySelector('[data-studio-draft-actions]');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'studio-actions studio-draft-actions';
      actions.dataset.studioDraftActions = '';
      actions.innerHTML = `
        <span class="studio-draft-state" data-draft-status>Sem alterações</span>
        <button class="studio-button" type="button" data-draft-save disabled>Salvar rascunho local</button>
        <button class="studio-button studio-button-secondary" type="button" data-draft-review-button disabled>Revisar alterações</button>
        <button class="studio-button studio-button-secondary" type="button" data-draft-discard disabled>Descartar alterações</button>
        <button class="studio-button studio-button-secondary" type="button" data-draft-publish disabled>Simular publicação</button>
      `;
      root.querySelector('.studio-form')?.append(actions);
    }

    let review = root.querySelector('[data-draft-review]');
    if (!review) {
      review = document.createElement('section');
      review.className = 'studio-review-panel';
      review.dataset.draftReview = '';
      review.hidden = true;
      review.innerHTML = '<h2>Revisão antes/depois</h2><p>Esta revisão ajuda a conferir mudanças antes de publicar. Nesta fase, nada altera o site público.</p><div data-review-list></div>';
      root.append(review);
    }
  }

  function setDirtyState(root, diffs, message) {
    const dirty = diffs.length > 0;
    const status = root.querySelector('[data-draft-status]');
    const save = root.querySelector('[data-draft-save]');
    const review = root.querySelector('[data-draft-review-button]');
    const discard = root.querySelector('[data-draft-discard]');
    const publish = root.querySelector('[data-draft-publish]');
    if (status) {
      status.textContent = message || (dirty ? 'Alterações não salvas' : 'Sem alterações');
      status.dataset.state = dirty ? 'dirty' : 'clean';
    }
    [save, review, discard, publish].forEach((button) => {
      if (button) button.disabled = !dirty;
    });
  }

  function alertsFor(root, diffs, current) {
    const context = document.body.dataset.studioContext;
    const alerts = [];
    if (context === 'conteudos') {
      const title = current['content-title'] || '';
      const project = current['content-project'] || '';
      const link = current['content-link'] || '';
      const description = current['content-short'] || '';
      const status = current['content-status'] || '';
      if (!title.trim()) alerts.push('Adicione um título antes de tratar este conteúdo como pronto.');
      if (!project.trim()) alerts.push('Escolha um projeto para organizar o conteúdo corretamente.');
      if (!description.trim()) alerts.push('A descrição curta está vazia; o card pode ficar pouco claro.');
      if (!link.trim() || link.trim() === '#') alerts.push('O link ainda não aponta para um conteúdo real. Mantenha como rascunho.');
      if (status.toLowerCase() === 'publicado') alerts.push('Status publicado é apenas simulação nesta fase. Nada vai para o site público.');
    }
    if (context === 'midia') {
      const alt = current['media-alt'] || '';
      const opacity = Number(current['media-opacity'] || 100);
      const size = current['media-size'] || '';
      if (!alt.trim()) alerts.push('Alt text está vazio. Escreva uma descrição objetiva da imagem.');
      if (opacity < 45) alerts.push('A opacidade está baixa. Verifique se a imagem ainda comunica bem.');
      if (size === 'pequeno') alerts.push('Imagem pequena demais pode perder presença visual em áreas importantes.');
    }
    if (diffs.some((diff) => diff.risk === 'Alto')) alerts.push('Há mudança em área importante. Revise com calma antes de simular publicação.');
    return alerts;
  }

  function renderReview(root, fields, state, status = 'revisão feita') {
    const panel = root.querySelector('[data-draft-review]');
    const list = root.querySelector('[data-review-list]');
    const diffs = diffStates(fields, state.original, state.current);
    const alerts = alertsFor(root, diffs, state.current);
    if (!panel || !list) return;

    panel.hidden = false;
    list.replaceChildren();

    if (alerts.length) {
      const alertBox = document.createElement('div');
      alertBox.className = 'studio-review-alerts';
      alertBox.innerHTML = `<h3>Atenção antes de avançar</h3>${alerts.map((alert) => `<p>${alert}</p>`).join('')}`;
      list.append(alertBox);
    }

    if (!diffs.length) {
      list.insertAdjacentHTML('beforeend', '<p class="studio-muted">Nenhuma alteração detectada agora.</p>');
      return;
    }

    diffs.forEach((diff) => {
      const card = document.createElement('article');
      card.className = 'studio-review-card';
      card.innerHTML = `
        <div class="studio-review-card-head">
          <span>${diff.section}</span>
          <strong>Risco: ${diff.risk}</strong>
        </div>
        <h3>${diff.label}</h3>
        <p><strong>Tipo:</strong> ${diff.type}</p>
        <div class="studio-compare-grid">
          <div><span>Antes</span><p>${escapeHtml(diff.before || 'vazio')}</p></div>
          <div><span>Depois</span><p>${escapeHtml(diff.after || 'vazio')}</p></div>
        </div>
        <p class="studio-review-note">${diff.observation}</p>
      `;
      list.append(card);
    });

    registerLocalHistory({
      module: getModuleName(root),
      section: diffs[0]?.section || getModuleName(root),
      type: diffs.map((diff) => diff.type).filter((value, index, array) => array.indexOf(value) === index).join(', '),
      status,
      risk: diffs.some((diff) => diff.risk === 'Alto') ? 'Alto' : diffs.some((diff) => diff.risk === 'Médio') ? 'Médio' : 'Baixo',
      fields: diffs,
      note: 'Revisão local gerada pelo protótipo do VnA Studio. Nada foi publicado no site real.',
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function saveLocalDraft(root, fields, state) {
    const diffs = diffStates(fields, state.original, state.current);
    localStorage.setItem(draftKey(root), JSON.stringify({ savedAt: new Date().toISOString(), module: getModuleName(root), values: state.current, diffs }));
    setDirtyState(root, diffs, 'Rascunho local salvo neste navegador');
    registerLocalHistory({
      module: getModuleName(root),
      section: diffs[0]?.section || getModuleName(root),
      type: diffs.map((diff) => diff.type).filter((value, index, array) => array.indexOf(value) === index).join(', ') || 'sem alteração',
      status: 'rascunho local',
      risk: diffs.some((diff) => diff.risk === 'Alto') ? 'Alto' : diffs.some((diff) => diff.risk === 'Médio') ? 'Médio' : 'Baixo',
      fields: diffs,
      note: 'Rascunho salvo apenas neste navegador para teste do protótipo.',
    });
  }

  function loadLocalDraft(root, fields, state) {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey(root)) || 'null');
      if (!draft?.values) return;
      fields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(draft.values, field.dataset.studioKey)) setFieldValue(field, draft.values[field.dataset.studioKey]);
      });
      updateAll(root);
      state.current = getCurrentState(fields);
      const diffs = diffStates(fields, state.original, state.current);
      setDirtyState(root, diffs, 'Rascunho local carregado neste navegador');
    } catch {
      localStorage.removeItem(draftKey(root));
    }
  }

  function discardLocalDraft(root, fields, state) {
    fields.forEach((field) => setFieldValue(field, state.original[field.dataset.studioKey] || ''));
    localStorage.removeItem(draftKey(root));
    updateAll(root);
    state.current = getCurrentState(fields);
    setDirtyState(root, [], 'Alterações descartadas');
    const panel = root.querySelector('[data-draft-review]');
    if (panel) panel.hidden = true;
    registerLocalHistory({
      module: getModuleName(root),
      section: getModuleName(root),
      type: 'descarte',
      status: 'descartado',
      risk: 'Baixo',
      fields: [],
      note: 'Alterações locais descartadas. O site público não foi alterado.',
    });
  }

  function simulatePublish(root, fields, state) {
    const diffs = diffStates(fields, state.original, state.current);
    renderReview(root, fields, state, 'simulação de publicação');
    setDirtyState(root, diffs, 'Simulação de publicação registrada');
  }

  function clearContentForm(root, fields, state) {
    fields.forEach((field) => setFieldValue(field, ''));
    updateAll(root);
    state.current = getCurrentState(fields);
    setDirtyState(root, diffStates(fields, state.original, state.current), 'Formulário limpo para teste');
  }

  function initDraftFlow(root) {
    ensureDraftUi(root);
    const fields = collectStudioFields(root);
    const state = { original: getOriginalState(fields), current: getCurrentState(fields) };
    loadLocalDraft(root, fields, state);

    function refresh() {
      state.current = getCurrentState(fields);
      setDirtyState(root, diffStates(fields, state.original, state.current));
    }

    root.addEventListener('input', refresh);
    root.addEventListener('change', refresh);
    root.querySelector('[data-draft-save]')?.addEventListener('click', () => saveLocalDraft(root, fields, state));
    root.querySelector('[data-draft-review-button]')?.addEventListener('click', () => renderReview(root, fields, state));
    root.querySelector('[data-draft-discard]')?.addEventListener('click', () => discardLocalDraft(root, fields, state));
    root.querySelector('[data-draft-publish]')?.addEventListener('click', () => simulatePublish(root, fields, state));
    root.querySelector('[data-draft-clear]')?.addEventListener('click', () => clearContentForm(root, fields, state));
    refresh();
  }

  function initPrototype(root) {
    root.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) updateAll(root);
    });
    root.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) updateAll(root);
    });

    initTabs(root);
    updateAll(root);
    initDraftFlow(root);
  }

  function renderHistoryPage() {
    const root = document.querySelector('[data-studio-history]');
    if (!root) return;
    const list = root.querySelector('[data-history-list]');
    const details = root.querySelector('[data-history-details]');
    const entries = readHistory();
    if (!list || !details) return;
    list.replaceChildren();

    if (!entries.length) {
      list.innerHTML = '<p class="studio-muted">Nenhum registro local ainda. Faça uma alteração em Editor, Conteúdos ou Mídia e salve um rascunho local para testar.</p>';
      details.innerHTML = '<p>Histórico local é apenas apoio de protótipo. Auditoria real virá quando houver login, banco de dados e permissões.</p>';
      return;
    }

    entries.forEach((entry, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'studio-history-item';
      button.innerHTML = `
        <span>${new Date(entry.at).toLocaleString('pt-BR')}</span>
        <strong>${entry.module || 'Studio'} · ${entry.status || 'registro local'}</strong>
        <small>${entry.section || 'Sem seção'} · ${entry.type || 'alteração'} · Risco ${entry.risk || 'Baixo'} · ${entry.user || 'Matheus'}</small>
      `;
      button.addEventListener('click', () => renderHistoryDetails(details, entry));
      list.append(button);
      if (index === 0) renderHistoryDetails(details, entry);
    });
  }

  function renderHistoryDetails(container, entry) {
    const fields = entry.fields || [];
    container.innerHTML = `
      <h3>${entry.module || 'Studio'} · ${entry.status || 'registro local'}</h3>
      <p><strong>Data:</strong> ${new Date(entry.at).toLocaleString('pt-BR')}</p>
      <p><strong>Usuário simulado:</strong> ${entry.user || 'Matheus'}</p>
      <p><strong>Risco:</strong> ${entry.risk || 'Baixo'}</p>
      <p>${entry.note || 'Registro local do protótipo.'}</p>
      <div class="studio-history-diff">
        ${fields.length ? fields.map((field) => `
          <article class="studio-review-card">
            <h4>${field.section} · ${field.label}</h4>
            <div class="studio-compare-grid">
              <div><span>Antes</span><p>${escapeHtml(field.before || 'vazio')}</p></div>
              <div><span>Depois</span><p>${escapeHtml(field.after || 'vazio')}</p></div>
            </div>
            <p class="studio-review-note">${field.observation || 'Mudança registrada localmente.'}</p>
          </article>
        `).join('') : '<p class="studio-muted">Este registro não possui campos modificados.</p>'}
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-studio-prototype]').forEach(initPrototype);
    renderHistoryPage();
  });
})();
