(() => {
  const script = document.currentScript;
  const agentType = script?.getAttribute('data-vna-intelligence') || script?.dataset.vnaIntelligence || document.body.dataset.vnaIntelligence || 'public';
  const isAuditorPage = agentType === 'auditor';
  const isStudioAuditorWidget = agentType === 'studio-auditor';
  const isAuditor = isAuditorPage || isStudioAuditorWidget;
  const pathPrefix = script?.dataset.vnaRoot ?? (window.location.pathname.includes('/admin/') ? '../' : '');
  const historyKey = 'vna-auditor-history-v1';

  const state = {
    core: null,
    contentCatalog: null,
    productCatalog: null,
    affiliate: null,
    assistant: null,
    studioContext: null,
    contextKey: null,
    mode: isAuditor ? 'conteudo' : 'descobrir',
    initialized: false,
    bibleFlow: null,
    activeField: null,
  };

  const routes = {
    core: 'content/vna-core.json',
    contentCatalog: 'content/content-catalog.json',
    productCatalog: 'content/product-catalog.json',
    affiliate: 'content/affiliate-disclosure.json',
    publicAssistant: 'content/public-assistant.json',
    adminAuditor: 'content/admin-auditor.json',
    studioContext: 'content/studio-context.json',
  };

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9@.#\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(value) {
    return normalizeText(value).split(' ').filter((token) => token.length >= 3);
  }

  function isSafeUrl(url) {
    const value = String(url || '').trim();
    return value === '#' || value.startsWith('#') || value.startsWith('mailto:') || /^https:\/\//i.test(value);
  }

  function cleanUrl(url) {
    const value = String(url || '').trim();
    return isSafeUrl(value) ? value : '#';
  }

  async function loadJson(path) {
    const response = await fetch(pathPrefix + path, { cache: 'no-cache', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Nao foi possivel carregar ' + path);
    return response.json();
  }

  async function loadIntelligence() {
    const assistantPath = isAuditor ? routes.adminAuditor : routes.publicAssistant;
    const requests = [
      loadJson(routes.core),
      loadJson(routes.contentCatalog),
      loadJson(routes.productCatalog),
      loadJson(routes.affiliate),
      loadJson(assistantPath),
    ];
    if (isAuditor) requests.push(loadJson(routes.studioContext));

    const [core, contentCatalog, productCatalog, affiliate, assistant, studioContext] = await Promise.all(requests);

    state.core = core;
    state.contentCatalog = contentCatalog;
    state.productCatalog = productCatalog;
    state.affiliate = affiliate;
    state.assistant = assistant;
    state.studioContext = studioContext || null;
    if (assistant.modes?.[0]?.id) state.mode = assistant.modes[0].id;
    if (isAuditor) state.contextKey = inferContextKey();
  }

  function makeElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
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
    const message = makeElement('div', `vna-intel-message vna-intel-message-${role}`);
    renderText(message, text);

    const safeLinks = (links || []).filter((item) => item?.url && item.url !== '#' && isSafeUrl(item.url));
    if (safeLinks.length > 0) {
      const wrap = makeElement('div', 'vna-intel-links');
      for (const item of safeLinks) {
        const anchor = makeElement('a', 'vna-intel-link', item.label || 'Acessar');
        anchor.href = cleanUrl(item.url);
        if (/^https:\/\//i.test(anchor.href)) {
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
        }
        wrap.append(anchor);
      }
      message.append(wrap);
    }

    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function renderQuickReplies(container, replies, onPick) {
    if (!container) return;
    container.replaceChildren();
    for (const reply of replies || []) {
      const chip = makeElement('button', 'vna-intel-chip', reply);
      chip.type = 'button';
      chip.addEventListener('click', () => onPick(reply));
      container.append(chip);
    }
  }

  function getModes() {
    return state.assistant?.modes || [];
  }

  function currentMode() {
    return getModes().find((mode) => mode.id === state.mode) || getModes()[0];
  }

  function intentsFor(modeId = state.mode) {
    return getModes().find((mode) => mode.id === modeId)?.intents || [];
  }

  function allIntents() {
    return getModes().flatMap((mode) => (mode.intents || []).map((intent) => ({ ...intent, modeId: mode.id })));
  }

  function scoreKeywords(question, keywords = []) {
    const normalizedQuestion = normalizeText(question);
    const questionTokens = new Set(tokenize(question));
    let score = 0;

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) continue;
      if (normalizedQuestion.includes(normalizedKeyword)) {
        score += Math.max(5, tokenize(normalizedKeyword).length * 3);
        continue;
      }
      for (const token of tokenize(normalizedKeyword)) {
        if (questionTokens.has(token)) score += 1;
      }
    }

    return score;
  }

  function scoreIntent(question, intent) {
    return scoreKeywords(question, intent.keywords || []);
  }

  function findBestIntent(question) {
    const candidates = [...intentsFor(), ...allIntents()];
    let best = null;
    let bestScore = 0;

    for (const intent of candidates) {
      const score = scoreIntent(question, intent);
      if (score > bestScore) {
        best = intent;
        bestScore = score;
      }
    }

    return bestScore >= 3 ? best : null;
  }

  function inferContextKey() {
    const contexts = state.studioContext?.contexts || {};
    const params = new URLSearchParams(window.location.search);
    const explicit = params.get('context') || document.body.dataset.studioContext || script?.dataset.studioContext;
    if (explicit && contexts[explicit]) return explicit;

    const pathname = window.location.pathname.replace(/\/index\.html$/i, '/');
    const match = Object.entries(contexts)
      .filter(([, context]) => context.route && pathname.endsWith(context.route))
      .sort((a, b) => b[1].route.length - a[1].route.length)[0];

    return match?.[0] || state.studioContext?.defaultContext || 'auditor';
  }

  function currentStudioContext() {
    const contexts = state.studioContext?.contexts || {};
    return contexts[state.contextKey] || contexts[state.studioContext?.defaultContext] || null;
  }

  function fieldFromElement(element) {
    const fieldElement = element?.closest?.('[data-studio-field]');
    if (!fieldElement) return null;
    const label = fieldElement.dataset.studioFieldLabel || fieldElement.getAttribute('aria-label') || fieldElement.id || fieldElement.name || 'Campo selecionado';
    const section = fieldElement.dataset.studioSection || fieldElement.closest('[data-studio-section]')?.dataset.studioSection || currentStudioContext()?.module || 'Studio';
    const help = fieldElement.dataset.studioFieldHelp || 'Use este campo para simular a edição visual no Studio.';
    const field = fieldElement.dataset.studioField || '';
    const action = fieldElement.dataset.studioAction || '';
    const risk = fieldElement.dataset.studioRisk || (/link|status|image|imagem|opacity|opacidade|source|publicar/i.test(`${field} ${label}`) ? 'Médio' : 'Baixo');

    return { label, section, help, field, action, risk };
  }

  function trackStudioFieldContext() {
    if (!isAuditor) return;
    document.addEventListener('focusin', (event) => {
      const field = fieldFromElement(event.target);
      if (field) state.activeField = field;
    });
    document.addEventListener('pointerdown', (event) => {
      const field = fieldFromElement(event.target);
      if (field) state.activeField = field;
    });
  }

  function isFieldHelpQuestion(question) {
    const normalized = normalizeText(question);
    return /(o que coloco aqui|o que escrever aqui|como preencher|esse campo|este campo|campo atual|me ajuda nesse campo|me ajuda neste campo|isso aqui)/i.test(normalized);
  }

  function fieldSpecificResponse(field) {
    const normalized = normalizeText(`${field.field} ${field.label} ${field.section}`);
    if (/hero.*titulo|titulo.*hero|hero-title/.test(normalized)) {
      return 'Esse campo é o título principal da primeira dobra do site. Use uma frase curta, forte e clara. Para o VnA, o ideal é manter algo direto como "Vida no Altar" ou uma chamada institucional muito simples.';
    }
    if (/opacidade|opacity/.test(normalized)) {
      return 'A opacidade controla o quanto a imagem aparece. Para fundo visual, valores entre 40% e 70% costumam funcionar bem. Para imagem principal de pessoa ou produto, evite deixar transparente demais.';
    }
    if (/afiliado|amazon|shopee/.test(normalized)) {
      return 'Esse campo deve receber o link da Amazon ou Shopee. Como pode ser afiliado, mantenha o aviso de transparência visível para o visitante e nunca recomende só por comissão.';
    }
    if (/alt|texto alternativo/.test(normalized)) {
      return 'Esse campo descreve a imagem para acessibilidade. Escreva de forma objetiva quem ou o que aparece e por que a imagem importa naquele bloco.';
    }
    if (/status/.test(normalized)) {
      return 'Esse campo define se algo está em rascunho, publicado, arquivado, ativo, em desenvolvimento ou futuro. Se ainda falta revisão, link real ou imagem boa, mantenha como rascunho ou em desenvolvimento.';
    }
    if (/link/.test(normalized)) {
      return 'Esse campo recebe o destino do botão ou conteúdo. Use um link oficial, revise se ele abre o lugar certo e mantenha como rascunho quando ainda não existir destino real.';
    }
    return field.help;
  }

  function findFieldContext(question) {
    if (state.activeField && isFieldHelpQuestion(question)) return state.activeField;

    const fields = [...document.querySelectorAll('[data-studio-field]')].map(fieldFromElement).filter(Boolean);
    let best = null;
    let bestScore = 0;
    for (const field of fields) {
      const score = scoreKeywords(question, [field.field, field.label, field.section, field.help, field.action].filter(Boolean));
      if (score > bestScore) {
        best = field;
        bestScore = score;
      }
    }
    return bestScore >= 4 ? best : null;
  }

  function findContextTask(question) {
    const context = currentStudioContext();
    const tasks = [...(state.studioContext?.sharedTasks || []), ...(context?.tasks || [])];
    let best = null;
    let bestScore = 0;

    for (const task of tasks) {
      const score = scoreKeywords(question, task.keywords || []);
      if (score > bestScore) {
        best = task;
        bestScore = score;
      }
    }

    return bestScore >= 3 ? best : null;
  }

  function contextQuickReplies() {
    return currentStudioContext()?.quickReplies || state.assistant?.quickReplies || [];
  }

  function initialAuditorMessage() {
    const context = currentStudioContext();
    if (context && state.contextKey !== 'auditor') {
      return `Estou acompanhando a tela ${context.module}. ${context.description}\n\nPosso te orientar pelo caminho visual do Studio, explicar riscos simples e lembrar o que ainda é protótipo.`;
    }
    return state.assistant.initialMessage;
  }

  function hasSafetyMatch(question) {
    const normalized = normalizeText(question);
    return (state.assistant?.safety?.keywords || []).some((keyword) => normalized.includes(normalizeText(keyword)));
  }

  function searchContentCatalog(question) {
    const queryTokens = new Set(tokenize(question));
    const items = state.contentCatalog?.items || [];

    return items
      .map((item) => {
        const haystack = [
          item.title,
          item.project,
          item.type,
          item.primaryTheme,
          item.format,
          item.shortDescription,
          ...(item.secondaryThemes || []),
          ...(item.verses || []),
          ...(item.recommendedAudience || []),
        ].join(' ');
        const normalizedHaystack = normalizeText(haystack);
        let score = 0;
        for (const token of queryTokens) {
          if (normalizedHaystack.includes(token)) score += 1;
        }
        if (normalizeText(item.title).includes(normalizeText(question))) score += 5;
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  function formatContentResults(results) {
    if (!results.length) {
      return {
        text: 'Ainda não encontrei um conteúdo específico com link direto para esse tema. Por enquanto, acompanhe os canais oficiais do VnA para ver os conteúdos publicados.',
        links: [],
      };
    }

    const lines = results.map(({ item }, index) => {
      const linkNote = item.link && item.link !== '#' ? 'Link cadastrado.' : 'Link direto ainda não cadastrado.';
      return `${index + 1}. ${item.title}\nProjeto: ${item.project}\nTema: ${item.primaryTheme}\nResumo: ${item.shortDescription}\nStatus: ${item.status}. ${linkNote}`;
    });

    const links = results
      .map(({ item }) => ({ label: item.title, url: item.link }))
      .filter((link) => link.url && link.url !== '#');

    return {
      text: `Encontrei estes caminhos no catálogo do VnA:\n\n${lines.join('\n\n')}`,
      links,
    };
  }

  function bibleQuestions() {
    return state.productCatalog?.guidedBibleDiagnosis?.questions || [];
  }

  function startBibleFlow() {
    const questions = bibleQuestions();
    state.bibleFlow = { active: true, step: 0, answers: {} };
    const intro = state.productCatalog?.guidedBibleDiagnosis?.intro || 'Vou te guiar por etapas.';
    return `${intro}\n\nPergunta 1 de ${questions.length}: ${questions[0]?.text || 'A Bíblia é para você ou para presentear alguém?'}`;
  }

  function summarizeBibleFlow() {
    const answers = state.bibleFlow?.answers || {};
    const churchTranslation = answers.churchTranslation || 'não informada';
    const readingFeeling = normalizeText(answers.readingFeeling || '');
    const hasDifficulty = /dificil|dificuldade|nao entendo|não entendo|complicad/.test(readingFeeling);
    const wantsChurch = normalizeText(answers.sameAsChurch || '').includes('mesma') || normalizeText(answers.mainUse || '').includes('igreja');
    const products = state.productCatalog?.products || [];

    const guidance = [
      'Com base nas respostas, o caminho mais prudente é escolher uma Bíblia pelo uso real, não por moda ou comissão.',
      `Tradução mais ligada à sua igreja: ${churchTranslation}.`,
    ];

    if (wantsChurch) {
      guidance.push('Se o uso principal for culto, escola bíblica ou estudos coletivos, a tradução usada com frequência na sua igreja deve ter peso alto.');
    }

    if (hasDifficulty) {
      guidance.push('Se você tem muita dificuldade de entender essa tradução, considere usar uma Bíblia para acompanhar a igreja e uma tradução complementar para leitura pessoal. Isso não diminui nenhuma tradução; é uma decisão prática de compreensão.');
    }

    guidance.push('Nunca trate ARC, ARA, NAA, NTLH ou outra tradução fiel como espiritualmente superior por si só. A escolha precisa servir leitura, fidelidade, contexto e compreensão.');

    if (products.length === 0) {
      guidance.push('Ainda não há produtos cadastrados no catálogo do VnA, então não vou inventar uma Bíblia nem um link. Quando produtos reais forem cadastrados, eu poderei comparar opções com transparência.');
    }

    guidance.push(state.affiliate?.text || 'Alguns links poderão ser afiliados no futuro, com transparência.');
    state.bibleFlow = null;
    return guidance.join('\n\n');
  }

  function handleBibleFlow(question) {
    const normalized = normalizeText(question);
    if (normalized.includes('cancelar') || normalized.includes('parar')) {
      state.bibleFlow = null;
      return {
        text: 'Tudo bem, cancelei o diagnóstico de Bíblia. Posso te ajudar com conteúdos, projetos ou contato.',
        quickReplies: state.assistant?.quickReplies,
        links: [],
      };
    }

    const questions = bibleQuestions();
    const flow = state.bibleFlow;
    const current = questions[flow.step];
    if (current) flow.answers[current.key] = question.trim();
    flow.step += 1;

    if (flow.step >= questions.length) {
      return {
        text: summarizeBibleFlow(),
        quickReplies: ['Quero conhecer os projetos', 'Estou procurando um conteúdo por tema', 'Onde acompanho o VnA?'],
        links: [],
      };
    }

    const next = questions[flow.step];
    return {
      text: `Pergunta ${flow.step + 1} de ${questions.length}: ${next.text}`,
      quickReplies: ['Cancelar diagnóstico'],
      links: [],
    };
  }

  function answerPublic(question) {
    if (state.bibleFlow?.active) return handleBibleFlow(question);

    if (hasSafetyMatch(question)) {
      return {
        text: state.assistant?.safety?.response || state.assistant?.fallback,
        quickReplies: state.assistant?.quickReplies,
        links: [],
      };
    }

    const intent = findBestIntent(question);
    const catalogResults = searchContentCatalog(question);

    if (intent?.startBibleFlow) {
      return {
        text: startBibleFlow(),
        quickReplies: ['Cancelar diagnóstico'],
        links: [],
      };
    }

    if (intent?.useCatalogSearch || catalogResults.length > 0) {
      const result = formatContentResults(catalogResults);
      return {
        text: result.text,
        links: result.links,
        quickReplies: intent?.quickReplies || currentMode()?.quickReplies || state.assistant?.quickReplies,
      };
    }

    if (intent) {
      return {
        text: intent.response,
        links: intent.links || [],
        quickReplies: intent.quickReplies || currentMode()?.quickReplies || state.assistant?.quickReplies,
      };
    }

    return {
      text: state.assistant?.fallback,
      links: [],
      quickReplies: state.assistant?.quickReplies,
    };
  }

  function classifyRisk(question, explicitRisk) {
    if (explicitRisk) return explicitRisk;
    const normalized = normalizeText(question);
    const matrix = state.assistant?.riskMatrix || [];
    const found = matrix
      .map((item, index) => ({ item, index, hit: (item.keywords || []).some((keyword) => normalized.includes(normalizeText(keyword))) }))
      .filter((entry) => entry.hit)
      .sort((a, b) => b.index - a.index)[0];
    return found?.item?.level || 'Baixo';
  }

  function riskGuidance(level) {
    const guidance = {
      Baixo: 'É uma mudança simples. Mesmo assim, vale conferir texto e visual antes de considerar pronto.',
      Médio: 'Essa é uma alteração comum, mas vale revisar antes de publicar porque pode aparecer para todo visitante.',
      Alto: 'Essa mudança pede mais cuidado. Ela pode mexer na estrutura, na mensagem principal ou na forma como o visitante encontra algo importante.',
      Crítico: 'Aqui a atenção precisa ser maior. Mudanças críticas devem ter aprovação clara e não devem ser tratadas como ajuste comum.',
    };
    return guidance[level] || guidance.Baixo;
  }

  function shouldMentionPrototype(question, text, context) {
    if (/prot[oó]tipo|nesta fase|fase 0/i.test(text)) return false;
    const normalized = normalizeText(question);
    const actionAsked = /(salvar|publicar|criar|cadastrar|trocar|enviar|upload|restaurar|login|permissao|permissão|dominio|domínio)/i.test(normalized);
    return actionAsked || /protótipo|planejado|futuro/i.test(context?.status || '');
  }

  function modeNudge(intent, task) {
    if (!intent?.modeId || task || intent.modeId === state.mode) return '';
    const mode = getModes().find((item) => item.id === intent.modeId);
    if (!mode) return '';
    return `Essa pergunta puxa mais para ${mode.label}. Vou te orientar por esse lado.`;
  }

  function readHistory() {
    try {
      return JSON.parse(localStorage.getItem(historyKey) || '[]');
    } catch {
      return [];
    }
  }

  function writeHistory(entries) {
    localStorage.setItem(historyKey, JSON.stringify(entries.slice(0, 20)));
  }

  function saveHistory(entry) {
    const entries = readHistory();
    writeHistory([{ ...entry, at: new Date().toISOString() }, ...entries]);
  }

  function answerAuditor(question) {
    const context = currentStudioContext();
    const fieldContext = findFieldContext(question);
    const task = findContextTask(question);
    const intent = findBestIntent(question);
    const risk = classifyRisk(question, fieldContext?.risk || task?.risk || intent?.risk);
    const sourceText = fieldContext
      ? `Você está no campo ${fieldContext.label}, na área ${fieldContext.section}. ${fieldSpecificResponse(fieldContext)}`
      : task?.response || intent?.response || state.assistant?.fallback;
    const parts = [];
    const nudge = modeNudge(intent, task);

    if (nudge) parts.push(nudge);
    if (!fieldContext && !task && context && state.contextKey !== 'auditor' && !/^Você está/i.test(sourceText)) {
      parts.push(`Você está em ${context.module}. ${sourceText}`);
    } else {
      parts.push(sourceText);
    }

    parts.push(riskGuidance(risk));

    if (shouldMentionPrototype(question, sourceText, context)) {
      parts.push(state.studioContext?.globalPrototypeNote || 'Nesta fase, algumas ações ainda não salvam de verdade.');
    }

    if (!fieldContext && !task && !intent && context) {
      parts.push(`Para eu te guiar melhor, diga qual área você quer mexer em ${context.module}: ${[...(context.editableItems || [])].slice(0, 4).join(', ')}.`);
    }

    saveHistory({ question, mode: currentMode()?.label || state.mode, risk, context: fieldContext ? `${context?.module || 'Studio'} · ${fieldContext.label}` : context?.module || 'Studio' });

    return {
      text: parts.filter(Boolean).join('\n\n'),
      links: [],
      quickReplies: fieldContext ? ['Como revisar este campo?', 'O que devo evitar?', 'Isso altera o site publicado?'] : task?.quickReplies || intent?.quickReplies || contextQuickReplies(),
    };
  }

  function submitQuestion(question, elements) {
    const cleanQuestion = String(question || '').trim();
    if (!cleanQuestion) return;
    appendMessage(elements.messages, 'user', cleanQuestion);
    elements.input.value = '';

    const response = isAuditor ? answerAuditor(cleanQuestion) : answerPublic(cleanQuestion);
    appendMessage(elements.messages, 'agent', response.text, response.links);
    renderQuickReplies(elements.chips, response.quickReplies, (reply) => submitQuestion(reply, elements));
    if (elements.renderHistory) elements.renderHistory();
  }

  function createChatElements({ admin = false } = {}) {
    const messages = makeElement('div', 'vna-intel-messages');
    messages.setAttribute('role', 'log');
    messages.setAttribute('aria-live', 'polite');

    const chips = makeElement('div', 'vna-intel-chips');
    const form = makeElement('form', 'vna-intel-form');
    const input = makeElement('input', 'vna-intel-input');
    input.type = 'text';
    input.name = 'message';
    input.autocomplete = 'off';
    input.placeholder = admin ? 'Pergunte sobre esta tela, uma mudança ou um risco...' : 'Digite sua pergunta...';
    input.setAttribute('aria-label', admin ? 'Mensagem para o Auditor VnA' : 'Mensagem para o Assistente VnA');

    const send = makeElement('button', 'vna-intel-send', 'Enviar');
    send.type = 'submit';
    send.setAttribute('aria-label', 'Enviar mensagem');
    form.append(input, send);

    const footer = makeElement('div', 'vna-intel-footer');
    footer.append(chips, form);

    const elements = { messages, chips, form, input, footer };
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitQuestion(input.value, elements);
    });

    return elements;
  }

  function renderModeButtons(container, elements, admin = false) {
    container.replaceChildren();
    for (const mode of getModes()) {
      const button = makeElement('button', admin ? 'vna-intel-mode vna-intel-mode-admin' : 'vna-intel-mode', mode.label);
      button.type = 'button';
      button.dataset.mode = mode.id;
      button.setAttribute('aria-pressed', String(mode.id === state.mode));
      button.title = mode.description || mode.label;
      button.addEventListener('click', () => {
        state.mode = mode.id;
        container.querySelectorAll('.vna-intel-mode').forEach((item) => {
          item.setAttribute('aria-pressed', String(item.dataset.mode === state.mode));
        });
        renderQuickReplies(elements.chips, contextQuickReplies(), (reply) => submitQuestion(reply, elements));
        appendMessage(elements.messages, 'agent', `Modo ${mode.label} ativo. Pode perguntar normalmente; se sua dúvida for de outro tipo, eu ajusto a orientação.`);
        elements.input.focus();
      });
      container.append(button);
    }
  }

  function initPublicWidget() {
    if (document.querySelector('[data-vna-intel-public]')) return;

    const button = makeElement('button', 'vna-intel-fab');
    button.type = 'button';
    button.dataset.vnaIntelPublic = 'button';
    button.setAttribute('aria-label', 'Conversar com o Assistente VnA');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="vna-intel-fab-icon" aria-hidden="true"></span><span>Conversar com o VnA</span>';

    const panel = makeElement('section', 'vna-intel-panel');
    panel.hidden = true;
    panel.dataset.vnaIntelPublic = 'panel';
    panel.setAttribute('aria-label', 'Assistente VnA');

    const header = makeElement('div', 'vna-intel-header');
    const headerText = makeElement('div');
    headerText.append(
      makeElement('h2', 'vna-intel-title', state.assistant?.name || 'Assistente VnA'),
      makeElement('p', 'vna-intel-subtitle', 'Guia rápido do ecossistema Vida no Altar.'),
    );
    const close = makeElement('button', 'vna-intel-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Fechar Assistente VnA');
    header.append(headerText, close);

    const elements = createChatElements();
    const modeWrap = makeElement('div', 'vna-intel-modes');
    renderModeButtons(modeWrap, elements);
    panel.append(header, modeWrap, elements.messages, elements.footer);
    document.body.append(button, panel);

    function openPanel() {
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      if (!state.initialized) {
        appendMessage(elements.messages, 'agent', state.assistant.initialMessage);
        renderQuickReplies(elements.chips, state.assistant.quickReplies, (reply) => submitQuestion(reply, elements));
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

  function createAuditorPanel({ compact = false } = {}) {
    const context = currentStudioContext();
    const panel = makeElement('section', compact ? 'vna-intel-panel vna-intel-panel-studio' : '');
    const header = makeElement('div', 'vna-intel-header');
    const headerText = makeElement('div');
    headerText.append(
      makeElement('h2', 'vna-intel-title', state.assistant?.name || 'Auditor VnA'),
      makeElement('p', 'vna-intel-subtitle', context ? `Contexto: ${context.module} · ${context.status}` : 'Módulo interno do VnA Studio.'),
    );
    header.append(headerText);

    const contextBar = makeElement('div', 'vna-intel-context-bar', context ? `${context.description}` : 'Guia contextual do Studio.');
    const elements = createChatElements({ admin: true });
    return { panel, header, contextBar, elements };
  }

  function renderHistory(container) {
    const entries = readHistory();
    container.replaceChildren();
    if (entries.length === 0) {
      container.append(makeElement('p', 'vna-intel-history-empty', 'Nenhum registro local ainda.'));
      return;
    }

    for (const entry of entries.slice(0, 8)) {
      const item = makeElement('article', 'vna-intel-history-item');
      const date = new Date(entry.at);
      item.append(
        makeElement('strong', '', `${entry.risk} · ${entry.mode}`),
        makeElement('span', '', Number.isNaN(date.getTime()) ? '' : date.toLocaleString('pt-BR')),
        makeElement('p', '', entry.context ? `${entry.context}: ${entry.question}` : entry.question),
      );
      container.append(item);
    }
  }

  function initAuditorPage() {
    const root = document.querySelector('[data-vna-auditor]');
    if (!root) return;

    const modeMount = root.querySelector('[data-vna-auditor-modes]');
    const quickMount = root.querySelector('[data-vna-auditor-quick]');
    const chatMount = root.querySelector('[data-vna-auditor-chat]');
    const historyMount = root.querySelector('[data-vna-auditor-history]');
    const clearHistory = root.querySelector('[data-vna-auditor-clear]');
    if (!modeMount || !quickMount || !chatMount || !historyMount) return;

    const { header, contextBar, elements } = createAuditorPanel();
    elements.renderHistory = () => renderHistory(historyMount);
    chatMount.append(header, contextBar, elements.messages, elements.footer);

    renderModeButtons(modeMount, elements, true);
    renderQuickReplies(quickMount, contextQuickReplies(), (reply) => submitQuestion(reply, elements));
    renderQuickReplies(elements.chips, contextQuickReplies(), (reply) => submitQuestion(reply, elements));
    appendMessage(elements.messages, 'agent', initialAuditorMessage());
    renderHistory(historyMount);

    clearHistory?.addEventListener('click', () => {
      writeHistory([]);
      renderHistory(historyMount);
    });
  }

  function initStudioAuditorWidget() {
    if (document.querySelector('[data-vna-intel-studio]')) return;

    const button = makeElement('button', 'vna-intel-fab vna-intel-fab-studio');
    button.type = 'button';
    button.dataset.vnaIntelStudio = 'button';
    button.setAttribute('aria-label', 'Abrir Auditor VnA contextual');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="vna-intel-fab-icon" aria-hidden="true"></span><span>Auditor VnA</span>';

    const { panel, header, contextBar, elements } = createAuditorPanel({ compact: true });
    panel.hidden = true;
    panel.dataset.vnaIntelStudio = 'panel';
    panel.setAttribute('aria-label', 'Auditor VnA contextual');

    const close = makeElement('button', 'vna-intel-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Fechar Auditor VnA');
    header.append(close);

    panel.append(header, contextBar, elements.messages, elements.footer);
    document.body.append(button, panel);

    function openPanel() {
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      if (!state.initialized) {
        appendMessage(elements.messages, 'agent', initialAuditorMessage());
        renderQuickReplies(elements.chips, contextQuickReplies(), (reply) => submitQuestion(reply, elements));
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

  async function init() {
    try {
      await loadIntelligence();
      trackStudioFieldContext();
      if (isAuditorPage) initAuditorPage();
      else if (isStudioAuditorWidget) initStudioAuditorWidget();
      else initPublicWidget();
    } catch (error) {
      console.warn('VnA Intelligence Core indisponivel:', error);
    }
  }

  init();
})();
