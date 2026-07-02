(() => {
  const script = document.currentScript;
  const agentType = script?.dataset.vnaAgent || document.body.dataset.vnaAgent || 'public';
  const isAdmin = agentType === 'admin';
  const pathPrefix = window.location.pathname.includes('/admin/') ? '../' : '';
  const state = {
    config: null,
    knowledge: null,
    mode: 'conteudo',
    initialized: false,
  };

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9@.\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(value) {
    return normalizeText(value).split(' ').filter((token) => token.length >= 3);
  }

  function escapeUrl(url) {
    const value = String(url || '').trim();
    if (value.startsWith('#') || value.startsWith('mailto:')) return value;
    if (/^https:\/\//i.test(value)) return value;
    return '#';
  }

  function scoreIntent(question, intent) {
    const normalizedQuestion = normalizeText(question);
    const questionTokens = new Set(tokenize(question));
    let score = 0;

    for (const keyword of intent.keywords || []) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) continue;

      if (normalizedQuestion.includes(normalizedKeyword)) {
        score += Math.max(4, tokenize(normalizedKeyword).length * 3);
        continue;
      }

      for (const token of tokenize(normalizedKeyword)) {
        if (questionTokens.has(token)) score += 1;
      }
    }

    return score;
  }

  function currentIntents() {
    if (!isAdmin) return state.config?.intents || [];
    const mode = state.config?.modes?.find((item) => item.id === state.mode) || state.config?.modes?.[0];
    return mode?.intents || [];
  }

  function currentMode() {
    return state.config?.modes?.find((item) => item.id === state.mode) || state.config?.modes?.[0];
  }

  function findBestIntent(question) {
    let bestIntent = null;
    let bestScore = 0;

    for (const intent of currentIntents()) {
      const score = scoreIntent(question, intent);
      if (score > bestScore) {
        bestIntent = intent;
        bestScore = score;
      }
    }

    return bestScore >= 3 ? bestIntent : null;
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: 'no-cache', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Nao foi possivel carregar ${path}`);
    return response.json();
  }

  async function loadAgent() {
    const configPath = isAdmin ? 'content/agent-admin.json' : 'content/agent-public.json';
    const [config, knowledge] = await Promise.all([
      loadJson(pathPrefix + configPath),
      loadJson(pathPrefix + 'content/knowledge-base.json'),
    ]);

    state.config = config;
    state.knowledge = knowledge;
    if (isAdmin && config.modes?.[0]?.id) state.mode = config.modes[0].id;
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (typeof text === 'string') element.textContent = text;
    return element;
  }

  function renderText(container, text) {
    const parts = String(text || '').split('\n\n');
    for (const part of parts) {
      if (!part.trim()) continue;
      const paragraph = makeElement('p');
      paragraph.textContent = part.trim();
      container.append(paragraph);
    }
  }

  function appendMessage(messages, role, text, links = []) {
    const message = makeElement('div', `vna-agent-message vna-agent-message-${role}`);
    renderText(message, text);

    if (Array.isArray(links) && links.length > 0) {
      const linkWrap = makeElement('div', 'vna-agent-links');
      for (const item of links) {
        const anchor = makeElement('a', 'vna-agent-link', item.label || 'Acessar');
        anchor.href = escapeUrl(item.url);
        if (/^https:\/\//i.test(anchor.href)) {
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
        }
        linkWrap.append(anchor);
      }
      message.append(linkWrap);
    }

    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function renderQuickReplies(container, replies, onPick) {
    container.replaceChildren();
    for (const reply of replies || []) {
      const chip = makeElement('button', 'vna-agent-chip', reply);
      chip.type = 'button';
      chip.addEventListener('click', () => onPick(reply));
      container.append(chip);
    }
  }

  function answer(question) {
    const intent = findBestIntent(question);
    if (!intent) {
      return {
        text: state.config?.fallback || 'Não tenho uma resposta pronta para isso ainda.',
        quickReplies: isAdmin ? currentMode()?.quickReplies : state.config?.quickReplies,
        links: [],
      };
    }

    return {
      text: intent.response,
      quickReplies: intent.quickReplies || (isAdmin ? currentMode()?.quickReplies : state.config?.quickReplies),
      links: intent.links || [],
    };
  }

  function submitQuestion(question, elements) {
    const cleanQuestion = String(question || '').trim();
    if (!cleanQuestion) return;

    appendMessage(elements.messages, 'user', cleanQuestion);
    elements.input.value = '';

    const response = answer(cleanQuestion);
    appendMessage(elements.messages, 'agent', response.text, response.links);
    renderQuickReplies(elements.chips, response.quickReplies, (reply) => submitQuestion(reply, elements));
  }

  function createChatElements({ admin = false } = {}) {
    const messages = makeElement('div', 'vna-agent-messages');
    messages.setAttribute('role', 'log');
    messages.setAttribute('aria-live', 'polite');

    const chips = makeElement('div', 'vna-agent-chips');
    const form = makeElement('form', 'vna-agent-form');
    const input = makeElement('input', 'vna-agent-input');
    input.type = 'text';
    input.name = 'message';
    input.autocomplete = 'off';
    input.placeholder = admin ? 'Pergunte sobre conteúdo, técnica ou SEO...' : 'Digite sua pergunta...';
    input.setAttribute('aria-label', admin ? 'Mensagem para o Assistente Admin VnA' : 'Mensagem para o Assistente VnA');

    const send = makeElement('button', 'vna-agent-send', 'Enviar');
    send.type = 'submit';
    send.setAttribute('aria-label', 'Enviar mensagem');

    form.append(input, send);

    const footer = makeElement('div', 'vna-agent-footer');
    footer.append(chips, form);

    const elements = { messages, chips, form, input, footer };
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitQuestion(input.value, elements);
    });

    return elements;
  }

  function initPublicWidget() {
    if (document.querySelector('[data-vna-public-agent]')) return;

    const button = makeElement('button', 'vna-agent-fab');
    button.type = 'button';
    button.dataset.vnaPublicAgent = 'button';
    button.setAttribute('aria-label', 'Conversar com o Assistente VnA');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="vna-agent-fab-icon" aria-hidden="true"></span><span>Conversar com o VnA</span>';

    const panel = makeElement('section', 'vna-agent-panel');
    panel.hidden = true;
    panel.dataset.vnaPublicAgent = 'panel';
    panel.setAttribute('aria-label', 'Assistente VnA');

    const header = makeElement('div', 'vna-agent-header');
    const headerText = makeElement('div');
    headerText.append(
      makeElement('h2', 'vna-agent-title', 'Assistente VnA'),
      makeElement('p', 'vna-agent-subtitle', 'Ajuda rápida para conhecer o Vida no Altar.'),
    );
    const close = makeElement('button', 'vna-agent-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Fechar Assistente VnA');
    header.append(headerText, close);

    const elements = createChatElements();
    panel.append(header, elements.messages, elements.footer);
    document.body.append(button, panel);

    function openPanel() {
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      if (!state.initialized) {
        appendMessage(elements.messages, 'agent', state.config.initialMessage);
        renderQuickReplies(elements.chips, state.config.quickReplies, (reply) => submitQuestion(reply, elements));
        state.initialized = true;
      }
      elements.input.focus();
    }

    function closePanel() {
      panel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      button.focus();
    }

    button.addEventListener('click', () => {
      if (panel.hidden) openPanel();
      else closePanel();
    });
    close.addEventListener('click', closePanel);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) closePanel();
    });
  }

  function initAdminAssistant() {
    const root = document.querySelector('[data-vna-admin-agent]');
    if (!root) return;

    const modeWrap = root.querySelector('[data-vna-agent-modes]');
    const quickWrap = root.querySelector('[data-vna-agent-admin-quick]');
    const chatMount = root.querySelector('[data-vna-agent-chat]');
    if (!modeWrap || !quickWrap || !chatMount) return;

    const elements = createChatElements({ admin: true });
    const header = makeElement('div', 'vna-agent-header');
    const headerText = makeElement('div');
    headerText.append(
      makeElement('h2', 'vna-agent-title', state.config.name || 'Assistente Admin VnA'),
      makeElement('p', 'vna-agent-subtitle', state.config.description || 'Guia interno do site.'),
    );
    header.append(headerText);
    chatMount.append(header, elements.messages, elements.footer);

    function setMode(modeId) {
      state.mode = modeId;
      const mode = currentMode();
      modeWrap.querySelectorAll('.vna-agent-mode').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode));
      });
      renderQuickReplies(quickWrap, mode?.quickReplies || [], (reply) => submitQuestion(reply, elements));
      renderQuickReplies(elements.chips, mode?.quickReplies || [], (reply) => submitQuestion(reply, elements));
      appendMessage(elements.messages, 'agent', `Modo ${mode?.label || 'Admin'} ativo. ${mode?.description || ''}`.trim());
      elements.input.focus();
    }

    for (const mode of state.config.modes || []) {
      const button = makeElement('button', 'vna-agent-mode', mode.label);
      button.type = 'button';
      button.dataset.mode = mode.id;
      button.setAttribute('aria-pressed', String(mode.id === state.mode));
      button.addEventListener('click', () => setMode(mode.id));
      modeWrap.append(button);
    }

    appendMessage(elements.messages, 'agent', state.config.initialMessage);
    setMode(state.mode);
  }

  async function init() {
    try {
      await loadAgent();
      if (isAdmin) initAdminAssistant();
      else initPublicWidget();
    } catch (error) {
      console.warn('Assistente VnA indisponivel:', error);
    }
  }

  init();
})();
