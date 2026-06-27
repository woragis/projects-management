const SCENARIOS = {
  new: {
    label: "URL nova (análise completa)",
    steps: [
      {
        id: "submit",
        title: "1. Usuário envia URL",
        badge: "request",
        from: "user",
        to: "frontend",
        wire: ["user", "frontend"],
        nodes: ["user", "frontend"],
        skip: [],
        payload: (url) => ({
          action: "Usuário cola URL e clica Escanear",
          page: "/dashboard",
          input: { inputUrl: url },
          note: "Com URL preenchida, o campo de texto é ignorado",
        }),
      },
      {
        id: "post",
        title: "2. Frontend → API",
        badge: "request",
        from: "frontend",
        to: "api",
        wire: ["frontend", "api"],
        nodes: ["frontend", "api"],
        skip: [],
        payload: (url) => ({
          method: "POST",
          path: "/api/analyses",
          headers: { Authorization: "Bearer <jwt>", "Content-Type": "application/json" },
          body: { inputUrl: url },
        }),
      },
      {
        id: "lookup",
        title: "3. API busca cache (URL normalizada)",
        badge: "request",
        from: "api",
        to: "db",
        wire: ["api", "db"],
        nodes: ["api", "db"],
        skip: [],
        payload: (url) => ({
          query: "SELECT * FROM content_items WHERE canonical_key = ?",
          canonicalKey: `url:${normalizeDemo(url)}`,
          result: null,
          message: "URL ainda não analisada — segue para IA",
        }),
      },
      {
        id: "ai-call",
        title: "4. API chama serviço de IA",
        badge: "request",
        from: "api",
        to: "ai",
        wire: ["api", "ai"],
        nodes: ["api", "ai"],
        skip: [],
        payload: (url) => ({
          method: "POST",
          path: "/ai/analyze",
          body: { url },
        }),
      },
      {
        id: "scrape",
        title: "5. IA raspa a página",
        badge: "request",
        from: "ai",
        to: "ai",
        wire: ["ai", "ai"],
        nodes: ["ai"],
        skip: [],
        payload: () => ({
          step: "scrape_url",
          target: "article body (G1, Globo…)",
          rawTextPreview:
            "O presidente ucraniano publicou carta aberta propondo encontro com Putin…",
        }),
      },
      {
        id: "claims",
        title: "6. Extrai alegações (claims)",
        badge: "request",
        from: "ai",
        to: "ai",
        wire: ["ai", "ai"],
        nodes: ["ai"],
        skip: [],
        payload: () => ({
          step: "extract_claims",
          claims: [
            "Zelensky propôs encontro presencial com Putin",
            "Carta pede cessar-fogo durante negociações",
            "Peskov convidou Zelensky a ir a Moscou",
          ],
        }),
      },
      {
        id: "serper",
        title: "7. Fact-check + Serper",
        badge: "request",
        from: "ai",
        to: "serper",
        wire: ["ai", "serper"],
        nodes: ["ai", "serper"],
        skip: [],
        payload: () => ({
          serper: { q: "Zelensky carta Putin G1", gl: "br", hl: "pt-br" },
          results: [
            { verified: true, source: "g1.globo.com", confidence: 0.78 },
            { verified: "unknown", confidence: 0.5 },
          ],
        }),
      },
      {
        id: "score",
        title: "8. LLM calcula score e veredito",
        badge: "response",
        from: "ai",
        to: "api",
        wire: ["ai", "api"],
        nodes: ["ai", "api"],
        skip: [],
        payload: () => ({
          credibilityScore: 0.85,
          verdict: "RELIABLE",
          explanation:
            "Matéria do G1 reporta evento verificável; alegações corroboradas em veículos confiáveis.",
          sources: [{ domain: "g1.globo.com", reputationScore: 0.92 }],
        }),
        verdict: { score: 85, label: "Confiável", class: "reliable", explain: "Nova análise concluída pela IA." },
      },
      {
        id: "save",
        title: "9. API persiste no banco",
        badge: "response",
        from: "api",
        to: "db",
        wire: ["api", "db"],
        nodes: ["api", "db"],
        skip: [],
        payload: () => ({
          tables: ["content_items", "analyses", "claims", "analysis_sources"],
          contentItem: { analysisCount: 1, lastAnalyzedAt: new Date().toISOString() },
          fromCache: false,
        }),
      },
      {
        id: "log",
        title: "10. Log assíncrono (RabbitMQ)",
        badge: "response",
        from: "api",
        to: "mq",
        wire: ["api", "mq"],
        nodes: ["api", "mq"],
        skip: [],
        payload: () => ({
          event: "analysis.created",
          queue: "fakeradar.logs",
          consumer: "logging-worker",
        }),
      },
      {
        id: "response",
        title: "11. Resposta ao frontend",
        badge: "response",
        from: "api",
        to: "frontend",
        wire: ["api", "frontend"],
        nodes: ["api", "frontend"],
        skip: [],
        payload: () => ({
          status: 201,
          fromCache: false,
          analyzedAt: new Date().toISOString(),
          redirect: "/items/{contentItemId}",
        }),
      },
      {
        id: "portal",
        title: "12. Entra no portal público",
        badge: "response",
        from: "frontend",
        to: "portal",
        wire: ["frontend", "portal"],
        nodes: ["frontend", "portal", "db"],
        skip: [],
        payload: () => ({
          public: true,
          endpoint: "GET /api/portal/items",
          visible: "Badge + score + data para qualquer visitante",
        }),
        verdict: { score: 85, label: "Confiável", class: "reliable", explain: "Disponível no feed público em /" },
      },
    ],
  },
  cache: {
    label: "URL em cache (sem nova IA)",
    steps: [
      {
        id: "submit",
        title: "1. Usuário envia URL já analisada",
        badge: "request",
        from: "user",
        to: "frontend",
        wire: ["user", "frontend"],
        nodes: ["user", "frontend"],
        skip: [],
        payload: (url) => ({
          action: "Mesma URL enviada novamente",
          input: { inputUrl: url },
        }),
      },
      {
        id: "post",
        title: "2. POST /api/analyses",
        badge: "request",
        from: "frontend",
        to: "api",
        wire: ["frontend", "api"],
        nodes: ["frontend", "api"],
        skip: [],
        payload: (url) => ({
          method: "POST",
          path: "/api/analyses",
          body: { inputUrl: url },
        }),
      },
      {
        id: "hit",
        title: "3. Cache hit no PostgreSQL",
        badge: "cache",
        from: "api",
        to: "db",
        wire: ["api", "db"],
        nodes: ["api", "db"],
        skip: ["ai", "serper", "mq"],
        payload: (url) => ({
          canonicalKey: `url:${normalizeDemo(url)}`,
          found: true,
          latestAnalysisId: "a1b2c3d4-…",
          message: "IA NÃO é chamada novamente",
        }),
      },
      {
        id: "cached",
        title: "4. API devolve análise existente",
        badge: "cache",
        from: "api",
        to: "frontend",
        wire: ["api", "frontend"],
        nodes: ["api", "frontend"],
        skip: ["ai", "serper", "mq"],
        payload: () => ({
          status: 200,
          fromCache: true,
          analyzedAt: "2026-06-04T18:18:00.000Z",
          canReanalyze: false,
          nextReanalyzeAt: "2026-06-05T18:18:00.000Z",
          credibilityScore: 0.85,
          verdict: "RELIABLE",
        }),
        verdict: {
          score: 85,
          label: "Confiável",
          class: "reliable",
          explain: "Resultado reutilizado. Banner: análise anterior em …",
        },
      },
      {
        id: "portal",
        title: "5. Detalhe no portal",
        badge: "response",
        from: "frontend",
        to: "portal",
        wire: ["frontend", "portal"],
        nodes: ["frontend", "portal"],
        skip: ["ai", "serper"],
        payload: () => ({
          page: "/items/{contentItemId}",
          banner: "Nenhuma nova verificação foi executada agora",
          reanalyze: "Disponível após cooldown de 24h",
        }),
      },
    ],
  },
};

const EDGES = [
  ["user", "frontend"],
  ["frontend", "api"],
  ["api", "db"],
  ["api", "ai"],
  ["ai", "serper"],
  ["api", "mq"],
  ["frontend", "portal"],
  ["api", "frontend"],
  ["ai", "api"],
];

const state = {
  scenario: "new",
  stepIndex: -1,
  playing: false,
  timer: null,
};

const el = {
  canvas: document.getElementById("canvas"),
  wires: document.getElementById("wires"),
  packet: document.getElementById("packet"),
  stepList: document.getElementById("step-list"),
  stepTitle: document.getElementById("step-title"),
  stepBadge: document.getElementById("step-badge"),
  payloadJson: document.getElementById("payload-json"),
  verdictCard: document.getElementById("verdict-card"),
  verdictRing: document.getElementById("verdict-ring"),
  verdictScore: document.getElementById("verdict-score"),
  verdictLabel: document.getElementById("verdict-label"),
  verdictExplain: document.getElementById("verdict-explain"),
  urlInput: document.getElementById("url-input"),
  btnStart: document.getElementById("btn-start"),
  btnNext: document.getElementById("btn-next"),
  btnReset: document.getElementById("btn-reset"),
  autoPlay: document.getElementById("auto-play"),
  tabs: document.querySelectorAll(".tab"),
};

function normalizeDemo(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    u.hostname = u.hostname.toLowerCase();
    return u.toString();
  } catch {
    return url;
  }
}

function getNodeCenter(id) {
  const node = document.querySelector(`[data-node="${id}"]`);
  const canvas = el.canvas.getBoundingClientRect();
  const rect = node.getBoundingClientRect();
  return {
    x: rect.left - canvas.left + rect.width / 2,
    y: rect.top - canvas.top + rect.height / 2,
  };
}

function drawWires() {
  el.wires.innerHTML = "";
  const canvas = el.canvas.getBoundingClientRect();
  el.wires.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);

  EDGES.forEach(([a, b]) => {
    const pa = getNodeCenter(a);
    const pb = getNodeCenter(b);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const mx = (pa.x + pb.x) / 2;
    const d = `M ${pa.x} ${pa.y} Q ${mx} ${pa.y} ${pb.x} ${pb.y}`;
    path.setAttribute("d", d);
    path.setAttribute("class", "wire");
    path.dataset.wire = `${a}-${b}`;
    el.wires.appendChild(path);
  });
}

function setPacket(from, to) {
  if (!from || !to) {
    el.packet.hidden = true;
    return;
  }
  const a = getNodeCenter(from);
  const b = getNodeCenter(to);
  el.packet.hidden = false;
  el.packet.style.left = `${a.x - 18}px`;
  el.packet.style.top = `${a.y - 18}px`;
  requestAnimationFrame(() => {
    el.packet.style.left = `${b.x - 18}px`;
    el.packet.style.top = `${b.y - 18}px`;
  });
}

function highlightWires(pairs) {
  document.querySelectorAll(".wire").forEach((w) => w.classList.remove("active"));
  pairs.forEach(([a, b]) => {
    const wire = document.querySelector(`.wire[data-wire="${a}-${b}"]`);
    if (wire) wire.classList.add("active");
  });
}

function highlightNodes(active, done, skip) {
  document.querySelectorAll(".node").forEach((n) => {
    const id = n.dataset.node;
    n.classList.remove("active", "done", "skip");
    if (skip.includes(id)) n.classList.add("skip");
    else if (active.includes(id)) n.classList.add("active");
    else if (done.includes(id)) n.classList.add("done");
  });
}

function renderStepList() {
  const steps = SCENARIOS[state.scenario].steps;
  el.stepList.innerHTML = steps
    .map(
      (s, i) => `
    <div class="step-item ${i === state.stepIndex ? "active" : ""} ${i < state.stepIndex ? "done" : ""}" data-idx="${i}">
      <span class="step-num">${String(i + 1).padStart(2, "0")}</span>
      <span>${s.title.replace(/^\d+\.\s*/, "")}</span>
    </div>`
    )
    .join("");
}

function showVerdict(v) {
  if (!v) {
    el.verdictCard.classList.add("hidden");
    return;
  }
  el.verdictCard.classList.remove("hidden");
  el.verdictRing.className = `ring ${v.class}`;
  el.verdictScore.textContent = `${v.score}%`;
  el.verdictLabel.textContent = v.label;
  el.verdictExplain.textContent = v.explain;
}

function goToStep(index) {
  const scenario = SCENARIOS[state.scenario];
  const steps = scenario.steps;
  if (index < 0 || index >= steps.length) return;

  state.stepIndex = index;
  const step = steps[index];
  const url = el.urlInput.value.trim();

  const doneNodes = new Set();
  const skipNodes = new Set(step.skip || []);
  for (let i = 0; i <= index; i++) {
    steps[i].nodes.forEach((n) => doneNodes.add(n));
  }
  step.skip?.forEach((n) => doneNodes.delete(n));

  highlightNodes(step.nodes, [...doneNodes].filter((n) => !step.nodes.includes(n)), [...skipNodes]);

  if (Array.isArray(step.wire?.[0])) {
    highlightWires(step.wire);
  } else if (step.wire?.length === 2) {
    highlightWires([step.wire]);
  } else {
    highlightWires([]);
  }

  setPacket(step.from, step.to);

  el.stepTitle.textContent = step.title;
  el.stepBadge.textContent = step.badge;
  el.stepBadge.className = `payload-badge ${step.badge}`;
  el.payloadJson.textContent = JSON.stringify(step.payload(url), null, 2);
  showVerdict(step.verdict || null);

  renderStepList();
  el.btnNext.disabled = index >= steps.length - 1;

  if (index >= steps.length - 1) {
    stopAuto();
  }
}

function nextStep() {
  const steps = SCENARIOS[state.scenario].steps;
  if (state.stepIndex < steps.length - 1) {
    goToStep(state.stepIndex + 1);
  }
}

function reset() {
  stopAuto();
  state.stepIndex = -1;
  el.btnNext.disabled = true;
  el.stepTitle.textContent = "Aguardando início…";
  el.stepBadge.textContent = "idle";
  el.stepBadge.className = "payload-badge";
  el.payloadJson.textContent = JSON.stringify(
    { status: "ready", scenario: SCENARIOS[state.scenario].label, hint: "Clique em Iniciar fluxo" },
    null,
    2
  );
  showVerdict(null);
  el.packet.hidden = true;
  document.querySelectorAll(".node").forEach((n) => n.classList.remove("active", "done", "skip"));
  document.querySelectorAll(".wire").forEach((w) => w.classList.remove("active"));
  renderStepList();
}

function start() {
  reset();
  goToStep(0);
  if (el.autoPlay.checked) startAuto();
}

function startAuto() {
  stopAuto();
  state.timer = setInterval(() => {
    const steps = SCENARIOS[state.scenario].steps;
    if (state.stepIndex >= steps.length - 1) {
      stopAuto();
      return;
    }
    nextStep();
  }, 2200);
}

function stopAuto() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

function setScenario(name) {
  state.scenario = name;
  el.tabs.forEach((t) => {
    const active = t.dataset.scenario === name;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });
  reset();
}

el.btnStart.addEventListener("click", start);
el.btnNext.addEventListener("click", nextStep);
el.btnReset.addEventListener("click", reset);
el.autoPlay.addEventListener("change", () => {
  if (!el.autoPlay.checked) stopAuto();
  else if (state.stepIndex >= 0) startAuto();
});
el.tabs.forEach((tab) => tab.addEventListener("click", () => setScenario(tab.dataset.scenario)));
el.stepList.addEventListener("click", (e) => {
  const item = e.target.closest(".step-item");
  if (!item || state.stepIndex < 0) return;
  goToStep(Number(item.dataset.idx));
});

window.addEventListener("resize", () => {
  drawWires();
  if (state.stepIndex >= 0) {
    const step = SCENARIOS[state.scenario].steps[state.stepIndex];
    setPacket(step.from, step.to);
  }
});

renderStepList();
requestAnimationFrame(drawWires);
