/**
 * VaultTrace — protótipo offline (Compliance Lab)
 * Simula mixer + anti-mixer com algoritmos de grafos em JS puro.
 */

(function () {
  "use strict";

  // ── util ─────────────────────────────────────────────────────
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let idCounter = 0;
  function uid(prefix) {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
  }

  function roundBtc(v) {
    return Math.round(v * 1e8) / 1e8;
  }

  function formatBtc(v) {
    return `${v.toFixed(4)} BTC`;
  }

  function hashId(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) {
      h = (h * 31 + id.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  function parseLayerFromLabel(label) {
    const m = label.match(/Camada\s+(\d+)/i);
    return m ? Number.parseInt(m[1], 10) : null;
  }

  function isLayeredNetwork(nodes, mixerProfile) {
    if (mixerProfile === "layered") return true;
    return nodes.some((n) => parseLayerFromLabel(n.label) != null);
  }

  // ── layout ───────────────────────────────────────────────────
  function layoutRadialLayered(nodes, width, height) {
    const margin = 64;
    const w = Math.max(width, 320);
    const h = Math.max(height, 320);
    const cx = w / 2;
    const cy = h / 2;
    const byLayer = new Map();
    const unlayered = [];

    nodes.forEach((n) => {
      const layer = parseLayerFromLabel(n.label);
      if (layer == null) {
        unlayered.push(n);
        return;
      }
      const list = byLayer.get(layer) ?? [];
      list.push(n);
      byLayer.set(layer, list);
    });

    const maxLayer = Math.max(0, ...byLayer.keys());
    const placed = new Map();

    byLayer.forEach((list, layer) => {
      const radius = margin + ((w / 2 - margin) * layer) / Math.max(maxLayer, 1);
      list.forEach((n, i) => {
        const angle = (2 * Math.PI * i) / list.length - Math.PI / 2;
        placed.set(n.id, {
          ...n,
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        });
      });
    });

    unlayered.forEach((n) => {
      if (n.kind === "origin") {
        placed.set(n.id, { ...n, x: cx, y: cy });
        return;
      }
      if (n.kind === "target") {
        placed.set(n.id, { ...n, x: w - margin, y: cy });
        return;
      }
      const seed = hashId(n.id);
      const angle = ((seed % 360) * Math.PI) / 180;
      placed.set(n.id, {
        ...n,
        x: cx + Math.cos(angle) * (maxLayer * 20 + 40),
        y: cy + Math.sin(angle) * (maxLayer * 20 + 40),
      });
    });

    return nodes.map((n) => placed.get(n.id));
  }

  function layoutForce(nodes, width, height) {
    const margin = 56;
    const w = Math.max(width, 320);
    const h = Math.max(height, 320);
    const origins = nodes.filter((n) => n.kind === "origin");
    const targets = nodes.filter((n) => n.kind === "target");
    const exchanges = nodes.filter((n) => n.isExchange || n.kind === "exchange");
    const others = nodes.filter(
      (n) =>
        n.kind !== "origin" &&
        n.kind !== "target" &&
        !n.isExchange &&
        n.kind !== "exchange",
    );
    const placed = new Map();

    origins.forEach((n, i) => {
      placed.set(n.id, { ...n, x: margin + 20, y: h * (0.35 + i * 0.15) });
    });
    targets.forEach((n, i) => {
      const count = Math.max(targets.length, 1);
      placed.set(n.id, {
        ...n,
        x: w - margin - 20,
        y: margin + ((h - margin * 2) * (i + 1)) / (count + 1),
      });
    });
    exchanges.forEach((n, i) => {
      placed.set(n.id, { ...n, x: w - margin - 80, y: margin + 24 + i * 42 });
    });
    others.forEach((n) => {
      const seed = hashId(n.id);
      const angle = ((seed % 360) * Math.PI) / 180;
      const radiusX = (w - margin * 2) * (0.22 + (seed % 17) / 100);
      const radiusY = (h - margin * 2) * (0.18 + (seed % 13) / 100);
      placed.set(n.id, {
        ...n,
        x: w * 0.48 + Math.cos(angle) * radiusX,
        y: h * 0.5 + Math.sin(angle) * radiusY,
      });
    });

    return nodes.map((n) => placed.get(n.id));
  }

  function layoutGraph(nodes, width, height, mixerProfile) {
    if (isLayeredNetwork(nodes, mixerProfile)) {
      return layoutRadialLayered(nodes, width, height);
    }
    return layoutForce(nodes, width, height);
  }

  // ── network generation ───────────────────────────────────────
  function buildCleanNetwork(rng) {
    idCounter = 0;
    const nodes = [];
    const edges = [];
    const baseTime = Date.now() - 7 * 24 * 3600 * 1000;

    const origin = {
      id: uid("w"),
      label: "Origem · Vault",
      kind: "origin",
      balanceBtc: 5,
      isExchange: false,
    };
    const target = {
      id: uid("w"),
      label: "Destino · Alvo",
      kind: "target",
      balanceBtc: 0.2,
      isExchange: false,
    };
    const ex1 = {
      id: uid("w"),
      label: "Exchange · Binance BR",
      kind: "exchange",
      balanceBtc: 120,
      isExchange: true,
    };
    const ex2 = {
      id: uid("w"),
      label: "Exchange · Mercado",
      kind: "exchange",
      balanceBtc: 85,
      isExchange: true,
    };

    nodes.push(origin, target, ex1, ex2);

    for (let i = 0; i < 18; i++) {
      nodes.push({
        id: uid("w"),
        label: `Carteira ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) || ""}`,
        kind: "normal",
        balanceBtc: roundBtc(0.1 + rng() * 2.5),
        isExchange: false,
      });
    }

    let t = 0;
    function addEdge(from, to, amount, mixed) {
      edges.push({
        id: uid("e"),
        from,
        to,
        amountBtc: roundBtc(amount),
        txAt: baseTime + t * 60000,
        isMixed: !!mixed,
      });
      t += 1 + Math.floor(rng() * 4);
    }

    const normals = nodes.filter((n) => n.kind === "normal");
    normals.slice(0, 3).forEach((n) => addEdge(origin.id, n.id, 0.4 + rng() * 0.8, false));
    normals.slice(3, 8).forEach((n, i) => {
      const prev = normals[i + 2];
      if (prev) addEdge(prev.id, n.id, 0.2 + rng() * 0.5, false);
    });
    addEdge(normals[5].id, ex1.id, 1.2, false);
    addEdge(normals[9].id, ex2.id, 0.9, false);
    addEdge(ex1.id, normals[12].id, 0.6, false);
    addEdge(normals[14].id, target.id, 0.15, false);

    for (let i = 0; i < 12; i++) {
      const a = normals[Math.floor(rng() * normals.length)];
      const b = normals[Math.floor(rng() * normals.length)];
      if (a.id !== b.id && !edges.some((e) => e.from === a.id && e.to === b.id)) {
        addEdge(a.id, b.id, 0.05 + rng() * 0.3, false);
      }
    }

    return { nodes, edges, mixerProfile: null, name: "Demo VaultTrace" };
  }

  function mixSimple(clean, rng) {
    const nodes = clean.nodes.map((n) => ({ ...n }));
    const edges = clean.edges.map((e) => ({ ...e }));
    const origin = nodes.find((n) => n.kind === "origin");
    const target = nodes.find((n) => n.kind === "target");
    if (!origin || !target) return clean;

    const baseTime = Date.now() - 2 * 24 * 3600 * 1000;
    let currentId = origin.id;
    let remaining = Math.min(origin.balanceBtc, 5);
    let txSeq = 0;

    for (let hop = 0; hop < 8 && remaining > 0.0001; hop++) {
      const forward = roundBtc(remaining * 0.95);
      const ping = roundBtc(remaining - forward);
      const wallet = {
        id: uid("w"),
        label: `Mixer hop ${hop + 1}`,
        kind: "intermediate",
        balanceBtc: forward,
        isExchange: false,
      };
      nodes.push(wallet);
      edges.push({
        id: uid("e"),
        from: currentId,
        to: wallet.id,
        amountBtc: forward,
        txAt: baseTime + txSeq * 60000,
        isMixed: true,
      });
      txSeq += 1;
      if (ping > 0) {
        edges.push({
          id: uid("e"),
          from: currentId,
          to: target.id,
          amountBtc: ping,
          txAt: baseTime + txSeq * 60000 + 1000,
          isMixed: true,
        });
        txSeq += 1;
      }
      currentId = wallet.id;
      remaining = forward;
    }

    if (remaining > 0) {
      edges.push({
        id: uid("e"),
        from: currentId,
        to: target.id,
        amountBtc: remaining,
        txAt: baseTime + txSeq * 60000,
        isMixed: true,
      });
    }

    return {
      nodes,
      edges,
      mixerProfile: "simple",
      name: "Demo · mix simples",
    };
  }

  function mixLayered(clean, rng) {
    const nodes = clean.nodes.filter((n) => n.kind !== "intermediate").map((n) => ({ ...n }));
    const edges = clean.edges.filter((e) => !e.isMixed).map((e) => ({ ...e }));
    const origin = nodes.find((n) => n.kind === "origin");
    const target = nodes.find((n) => n.kind === "target");
    if (!origin || !target) return clean;

    const layerCount = 6;
    const walletsPerLayer = 8;
    const forwardProb = 0.6;
    const baseTime = Date.now() - 3 * 24 * 3600 * 1000;
    let txAt = baseTime;
    let seq = 0;

    const layers = [];
    for (let layer = 0; layer < layerCount; layer++) {
      const row = [];
      for (let slot = 0; slot < walletsPerLayer; slot++) {
        const w = {
          id: uid("w"),
          label: `Camada ${layer + 1} · #${slot + 1}`,
          kind: "intermediate",
          balanceBtc: 0,
          isExchange: false,
          _layer: layer,
        };
        nodes.push(w);
        row.push(w);
      }
      layers.push(row);
    }

    function addTx(from, to, amount, hop) {
      if (amount <= 0) return;
      amount = roundBtc(amount);
      if (amount <= 0) return;
      edges.push({
        id: uid("e"),
        from,
        to,
        amountBtc: amount,
        txAt: txAt,
        isMixed: true,
        hopIndex: hop,
      });
      txAt += (1 + Math.floor(rng() * 3)) * 60000;
      seq += 1;
    }

    let remaining = Math.min(origin.balanceBtc, 5);
    const l1 = layers[0];
    while (remaining > 0 && l1.length) {
      const idx = Math.floor(rng() * l1.length);
      let part =
        l1.length === 1
          ? remaining
          : roundBtc(remaining * (0.08 + rng() * 0.35));
      if (part > remaining) part = remaining;
      if (part <= 0) part = remaining;
      addTx(origin.id, l1[idx].id, part, 0);
      l1[idx].balanceBtc = roundBtc(l1[idx].balanceBtc + part);
      remaining = roundBtc(remaining - part);
    }

    for (let layer = 0; layer < layerCount; layer++) {
      const current = layers[layer];
      for (const w of current) {
        while (w.balanceBtc > 0.00001) {
          const goForward = layer < layerCount - 1 && rng() < forwardProb;
          let toWallet;
          let hop = layer;

          if (goForward) {
            const next = layers[layer + 1];
            toWallet = next[Math.floor(rng() * next.length)];
            hop = layer + 1;
          } else if (layer > 0) {
            const prev = layers[layer - 1];
            toWallet = prev[Math.floor(rng() * prev.length)];
            hop = layer - 1;
          } else {
            toWallet = target;
            hop = layerCount;
          }

          let send = roundBtc(w.balanceBtc * (0.15 + rng() * 0.55));
          if (send > w.balanceBtc) send = w.balanceBtc;
          if (send <= 0) send = w.balanceBtc;

          addTx(w.id, toWallet.id, send, hop);
          w.balanceBtc = roundBtc(w.balanceBtc - send);
          toWallet.balanceBtc = roundBtc(toWallet.balanceBtc + send);
        }
      }
    }

    const last = layers[layerCount - 1];
    for (const w of last) {
      if (w.balanceBtc > 0) {
        addTx(w.id, target.id, w.balanceBtc, layerCount);
        w.balanceBtc = 0;
      }
    }

    nodes.forEach((n) => delete n._layer);

    return {
      nodes,
      edges,
      mixerProfile: "layered",
      name: "Demo · mix em camadas",
    };
  }

  // ── graph index ──────────────────────────────────────────────
  function buildGraphIndex(nodes, edges) {
    const index = new Map();
    nodes.forEach((n, i) => index.set(n.id, i));
    const adj = nodes.map(() => []);
    edges.forEach((e) => {
      const from = index.get(e.from);
      const to = index.get(e.to);
      if (from == null || to == null) return;
      adj[from].push({ to, edge: e, txAt: e.txAt, amountBtc: e.amountBtc });
    });
    return { index, adj };
  }

  function nodeIds(nodes, indices) {
    return indices.map((i) => nodes[i].id);
  }

  // ── trace algorithms ─────────────────────────────────────────
  const ALGO_HELP = {
    bfs: "BFS contamina vizinhos em K hops — mostra subgrafo alcançável após o mix.",
    dfs: "DFS busca caminhos origem→destino em profundidade (até 10 caminhos).",
    astar: "A* encontra caminho provável até a exchange mais próxima (heurística).",
    dijkstra: "Dijkstra minimiza custo acumulado (peso = 1/valor da tx).",
    "bfs-temporal": "BFS-T só avança por arestas com timestamp ≥ tempo atual — ignora retrocessos inválidos.",
    "dfs-temporal": "DFS-T busca caminhos origem→destino respeitando ordem temporal.",
    taint: "Taint propaga valor rastreável greedy ao longo do tempo — estima BTC recoverable.",
  };

  function runBFS(g, source, maxHops, includeSteps) {
    const res = { visitedWalletIds: [], steps: [], paths: [] };
    const visited = new Array(g.nodes.length).fill(false);
    const hop = new Array(g.nodes.length).fill(-1);
    const queue = [source];
    visited[source] = true;
    hop[source] = 0;
    res.visitedWalletIds.push(g.nodes[source].id);

    if (includeSteps) {
      res.steps.push({
        action: "visit",
        walletId: g.nodes[source].id,
        hop: 0,
        message: "BFS: origem enfileirada",
      });
    }

    let head = 0;
    while (head < queue.length) {
      const cur = queue[head++];
      const curHop = hop[cur];
      if (curHop >= maxHops) continue;

      const neighbors = [];
      for (const e of g.adj[cur]) {
        if (!visited[e.to] && hop[e.to] < 0) neighbors.push(e.to);
      }

      if (includeSteps && neighbors.length) {
        res.steps.push({
          action: "expand",
          walletId: g.nodes[cur].id,
          hop: curHop,
          neighbors: nodeIds(g.nodes, neighbors),
          message: "BFS: expandindo vizinhos",
        });
      }

      for (const next of neighbors) {
        visited[next] = true;
        hop[next] = curHop + 1;
        res.visitedWalletIds.push(g.nodes[next].id);
        queue.push(next);
        if (includeSteps) {
          res.steps.push({
            action: "enqueue",
            walletId: g.nodes[next].id,
            hop: curHop + 1,
            message: "BFS: carteira contaminada",
          });
        }
      }
    }

    res.visitedCount = res.visitedWalletIds.length;
    return res;
  }

  function runDFS(g, source, target, maxHops, maxPaths, includeSteps) {
    const res = { visitedWalletIds: [], steps: [], paths: [] };
    const onPath = new Array(g.nodes.length).fill(false);
    const globalVisited = new Array(g.nodes.length).fill(false);
    const path = [source];
    onPath[source] = true;
    globalVisited[source] = true;
    res.visitedWalletIds.push(g.nodes[source].id);

    if (includeSteps) {
      res.steps.push({
        action: "visit",
        walletId: g.nodes[source].id,
        hop: 0,
        message: "DFS: início da busca em profundidade",
      });
    }

    function dfs(node, depth) {
      if (res.paths.length >= maxPaths) return;
      if (node === target) {
        const walletIds = path.map((i) => g.nodes[i].id);
        res.paths.push({ walletIds, hopCount: walletIds.length - 1 });
        if (includeSteps) {
          res.steps.push({
            action: "found",
            path: walletIds,
            hop: depth,
            message: "DFS: caminho encontrado",
          });
        }
        return;
      }
      if (depth >= maxHops) return;

      for (const e of g.adj[node]) {
        if (onPath[e.to]) continue;
        onPath[e.to] = true;
        if (!globalVisited[e.to]) {
          globalVisited[e.to] = true;
          res.visitedWalletIds.push(g.nodes[e.to].id);
        }
        path.push(e.to);
        if (includeSteps) {
          res.steps.push({
            action: "visit",
            walletId: g.nodes[e.to].id,
            hop: depth + 1,
            message: "DFS: descendo na árvore",
          });
        }
        dfs(e.to, depth + 1);
        path.pop();
        onPath[e.to] = false;
        if (res.paths.length >= maxPaths) return;
      }
    }

    dfs(source, 0);
    res.visitedCount = res.visitedWalletIds.length;
    return res;
  }

  function runAStar(g, source, includeSteps) {
    const res = { visitedWalletIds: [], steps: [], paths: [] };
    const exchanges = g.nodes
      .map((n, i) => ({ n, i }))
      .filter(({ n }) => n.isExchange || n.kind === "exchange");
    if (!exchanges.length) return res;

    const targetIdx = exchanges[0].i;
    const dist = new Array(g.nodes.length).fill(Infinity);
    const prev = new Array(g.nodes.length).fill(-1);
    const open = new Set([source]);
    dist[source] = 0;

    function heuristic(i) {
      const a = g.layout[i];
      const b = g.layout[targetIdx];
      if (!a || !b) return 0;
      return Math.hypot(a.x - b.x, a.y - b.y) / 100;
    }

    while (open.size) {
      let cur = -1;
      let best = Infinity;
      for (const i of open) {
        const f = dist[i] + heuristic(i);
        if (f < best) {
          best = f;
          cur = i;
        }
      }
      if (cur < 0) break;
      open.delete(cur);
      if (!res.visitedWalletIds.includes(g.nodes[cur].id)) {
        res.visitedWalletIds.push(g.nodes[cur].id);
      }
      if (includeSteps) {
        res.steps.push({
          action: "visit",
          walletId: g.nodes[cur].id,
          message: "A*: explorando nó promissor",
        });
      }
      if (cur === targetIdx) break;

      for (const e of g.adj[cur]) {
        const cost = 1 / Math.max(e.amountBtc, 0.001);
        const nd = dist[cur] + cost;
        if (nd < dist[e.to]) {
          dist[e.to] = nd;
          prev[e.to] = cur;
          open.add(e.to);
        }
      }
    }

    if (dist[targetIdx] < Infinity) {
      const pathIdx = [];
      let c = targetIdx;
      while (c >= 0) {
        pathIdx.unshift(c);
        c = prev[c];
      }
      const walletIds = pathIdx.map((i) => g.nodes[i].id);
      res.paths.push({ walletIds, hopCount: walletIds.length - 1 });
      if (includeSteps) {
        res.steps.push({
          action: "found",
          path: walletIds,
          message: "A*: caminho até exchange",
        });
      }
    }

    res.visitedCount = res.visitedWalletIds.length;
    return res;
  }

  function runDijkstra(g, source, target, includeSteps) {
    const res = { visitedWalletIds: [], steps: [], paths: [] };
    const dist = new Array(g.nodes.length).fill(Infinity);
    const prev = new Array(g.nodes.length).fill(-1);
    const visited = new Array(g.nodes.length).fill(false);
    dist[source] = 0;

    for (let k = 0; k < g.nodes.length; k++) {
      let u = -1;
      let best = Infinity;
      for (let i = 0; i < g.nodes.length; i++) {
        if (!visited[i] && dist[i] < best) {
          best = dist[i];
          u = i;
        }
      }
      if (u < 0 || best === Infinity) break;
      visited[u] = true;
      res.visitedWalletIds.push(g.nodes[u].id);
      if (includeSteps) {
        res.steps.push({
          action: "visit",
          walletId: g.nodes[u].id,
          message: "Dijkstra: nó com menor custo",
        });
      }
      if (u === target) break;

      for (const e of g.adj[u]) {
        const cost = 1 / Math.max(e.amountBtc, 0.001);
        if (dist[u] + cost < dist[e.to]) {
          dist[e.to] = dist[u] + cost;
          prev[e.to] = u;
        }
      }
    }

    if (dist[target] < Infinity) {
      const pathIdx = [];
      let c = target;
      while (c >= 0) {
        pathIdx.unshift(c);
        c = prev[c];
      }
      const walletIds = pathIdx.map((i) => g.nodes[i].id);
      res.paths.push({ walletIds, hopCount: walletIds.length - 1 });
      if (includeSteps) {
        res.steps.push({
          action: "found",
          path: walletIds,
          message: "Dijkstra: caminho mínimo",
        });
      }
    }

    res.visitedCount = res.visitedWalletIds.length;
    return res;
  }

  function runBFSTemporal(g, source, maxHops, includeSteps) {
    const res = { visitedWalletIds: [], steps: [], paths: [] };
    let startTime = Infinity;
    for (const e of g.adj[source]) {
      if (e.txAt < startTime) startTime = e.txAt;
    }
    if (!Number.isFinite(startTime)) startTime = Date.now();

    const visited = new Array(g.nodes.length).fill(false);
    const queue = [{ node: source, hop: 0, at: startTime }];
    visited[source] = true;
    res.visitedWalletIds.push(g.nodes[source].id);

    if (includeSteps) {
      res.steps.push({
        action: "visit",
        walletId: g.nodes[source].id,
        hop: 0,
        message: "BFS temporal: origem no tempo t0",
      });
    }

    let head = 0;
    while (head < queue.length) {
      const cur = queue[head++];
      if (cur.hop >= maxHops) continue;

      const neighbors = [];
      for (const e of g.adj[cur.node]) {
        if (e.txAt >= cur.at && !visited[e.to]) neighbors.push(e.to);
      }

      if (includeSteps && neighbors.length) {
        res.steps.push({
          action: "expand",
          walletId: g.nodes[cur.node].id,
          hop: cur.hop,
          neighbors: nodeIds(g.nodes, neighbors),
          message: "BFS temporal: expandindo arestas válidas no tempo",
        });
      }

      for (const e of g.adj[cur.node]) {
        if (e.txAt < cur.at || visited[e.to]) continue;
        visited[e.to] = true;
        res.visitedWalletIds.push(g.nodes[e.to].id);
        queue.push({ node: e.to, hop: cur.hop + 1, at: e.txAt });
        if (includeSteps) {
          res.steps.push({
            action: "enqueue",
            walletId: g.nodes[e.to].id,
            hop: cur.hop + 1,
            message: "BFS temporal: carteira alcançada respeitando tx_at",
          });
        }
      }
    }

    res.visitedCount = res.visitedWalletIds.length;
    return res;
  }

  function runDFSTemporal(g, source, target, maxHops, maxPaths, includeSteps) {
    const res = { visitedWalletIds: [], steps: [], paths: [] };
    let startTime = Infinity;
    for (const e of g.adj[source]) {
      if (e.txAt < startTime) startTime = e.txAt;
    }
    if (!Number.isFinite(startTime)) startTime = Date.now();

    const path = [source];
    const onPath = new Array(g.nodes.length).fill(false);
    onPath[source] = true;
    const globalVisited = new Array(g.nodes.length).fill(false);
    globalVisited[source] = true;
    res.visitedWalletIds.push(g.nodes[source].id);

    function dfs(node, hop, at) {
      if (res.paths.length >= maxPaths) return;
      if (node === target) {
        const walletIds = path.map((i) => g.nodes[i].id);
        res.paths.push({ walletIds, hopCount: walletIds.length - 1 });
        if (includeSteps) {
          res.steps.push({
            action: "found",
            path: walletIds,
            hop,
            message: "DFS temporal: caminho válido no tempo",
          });
        }
        return;
      }
      if (hop >= maxHops) return;

      for (const e of g.adj[node]) {
        if (e.txAt < at || onPath[e.to]) continue;
        onPath[e.to] = true;
        if (!globalVisited[e.to]) {
          globalVisited[e.to] = true;
          res.visitedWalletIds.push(g.nodes[e.to].id);
        }
        path.push(e.to);
        if (includeSteps) {
          res.steps.push({
            action: "visit",
            walletId: g.nodes[e.to].id,
            hop: hop + 1,
            message: "DFS temporal: descendo respeitando timestamp",
          });
        }
        dfs(e.to, hop + 1, e.txAt);
        path.pop();
        onPath[e.to] = false;
        if (res.paths.length >= maxPaths) return;
      }
    }

    dfs(source, 0, startTime);
    res.visitedCount = res.visitedWalletIds.length;
    return res;
  }

  function runTaint(g, source, maxHops, includeSteps) {
    const res = {
      visitedWalletIds: [],
      steps: [],
      paths: [],
      taintByWallet: {},
      recoverableBtc: 0,
    };
    const taint = new Array(g.nodes.length).fill(0);
    const timedEdges = [];

    g.adj.forEach((adj, from) => {
      adj.forEach((e) => {
        timedEdges.push({ from, to: e.to, at: e.txAt, amt: e.amountBtc });
      });
    });
    timedEdges.sort((a, b) => a.at - b.at);

    for (const e of timedEdges) {
      if (e.from === source) taint[source] += e.amt;
    }

    if (includeSteps) {
      res.steps.push({
        action: "visit",
        walletId: g.nodes[source].id,
        message: "Taint: valor inicial na origem",
      });
    }

    const visited = {};
    const hops = {};
    visited[source] = true;
    hops[source] = 0;
    res.visitedWalletIds.push(g.nodes[source].id);

    for (const e of timedEdges) {
      if (taint[e.from] <= 0) continue;
      if (hops[e.from] >= maxHops) continue;
      let send = e.amt;
      if (send > taint[e.from]) send = taint[e.from];
      taint[e.from] -= send;
      taint[e.to] += send;

      if (!visited[e.to]) {
        visited[e.to] = true;
        hops[e.to] = hops[e.from] + 1;
        res.visitedWalletIds.push(g.nodes[e.to].id);
        if (includeSteps) {
          res.steps.push({
            action: "enqueue",
            walletId: g.nodes[e.to].id,
            hop: hops[e.to],
            score: send,
            message: `Taint: propagando ${roundBtc(send)} BTC rastreável`,
          });
        }
      }
    }

    let recoverable = 0;
    taint.forEach((v, i) => {
      if (v <= 0) return;
      const rounded = roundBtc(v);
      res.taintByWallet[g.nodes[i].id] = rounded;
      recoverable += rounded;
    });
    res.recoverableBtc = roundBtc(recoverable);

    if (includeSteps) {
      res.steps.push({
        action: "found",
        score: res.recoverableBtc,
        message: `Taint: ${formatBtc(res.recoverableBtc)} ainda rastreável`,
      });
    }

    res.visitedCount = res.visitedWalletIds.length;
    return res;
  }

  function runTrace(algo, nodes, edges, layoutNodes, maxHops) {
    const g = buildGraphIndex(nodes, edges);
    g.nodes = nodes;
    g.layout = layoutNodes;
    const source = nodes.findIndex((n) => n.kind === "origin");
    const target = nodes.findIndex((n) => n.kind === "target");
    if (source < 0) throw new Error("Origem não encontrada");

    const t0 = performance.now();
    let result;

    switch (algo) {
      case "bfs":
        result = runBFS(g, source, maxHops, true);
        break;
      case "dfs":
        if (target < 0) throw new Error("Destino não encontrado");
        result = runDFS(g, source, target, maxHops, 10, true);
        break;
      case "astar":
        result = runAStar(g, source, true);
        break;
      case "dijkstra":
        if (target < 0) throw new Error("Destino não encontrado");
        result = runDijkstra(g, source, target, true);
        break;
      case "bfs-temporal":
        result = runBFSTemporal(g, source, maxHops, true);
        break;
      case "dfs-temporal":
        if (target < 0) throw new Error("Destino não encontrado");
        result = runDFSTemporal(g, source, target, maxHops, 10, true);
        break;
      case "taint":
        result = runTaint(g, source, maxHops, true);
        break;
      default:
        throw new Error("Algoritmo desconhecido");
    }

    result.elapsedMs = Math.max(1, Math.round(performance.now() - t0));
    result.algorithm = algo;
    return result;
  }

  // ── canvas ───────────────────────────────────────────────────
  const COLORS = {
    origin: { fill: "#FEF3C7", stroke: "#D97706", text: "#92400E" },
    target: { fill: "#FEE2E2", stroke: "#DC2626", text: "#991B1B" },
    exchange: { fill: "#D1FAE5", stroke: "#059669", text: "#065F46" },
    intermediate: { fill: "#FFEDD5", stroke: "#EA580C", text: "#9A3412" },
    suspicious: { fill: "#FEF3C7", stroke: "#F59E0B", text: "#92400E" },
    normal: { fill: "#F8FAFC", stroke: "#94A3B8", text: "#475569" },
    idle: { fill: "#E2E8F0", stroke: "#CBD5E1", text: "#64748B" },
  };

  const KIND_COLORS = {
    origin: "#D97706",
    target: "#DC2626",
    exchange: "#059669",
    intermediate: "#EA580C",
    normal: "#94A3B8",
  };

  // ── app state ────────────────────────────────────────────────
  const state = {
    scenario: "none",
    network: null,
    nodes: [],
    edges: [],
    layoutNodes: [],
    revealedNodes: new Set(),
    revealedEdges: new Set(),
    highlightPath: [],
    steps: [],
    paths: [],
    activePath: 0,
    algo: "bfs",
    busy: false,
    metrics: { visited: 0, ms: 0, mixed: 0, recoverable: 0 },
    layers: { nodes: true, edges: true, mixed: true },
    pulse: 0,
    cleanBase: null,
    rng: mulberry32(42),
  };

  const canvas = document.getElementById("gc");
  const ctx = canvas.getContext("2d");
  const area = document.getElementById("graph-area");
  let animId = null;
  let stepTimer = null;

  function setStatus(msg) {
    document.getElementById("status-msg").textContent = msg;
    document.getElementById("trace-status").textContent = msg;
  }

  function updateMetrics() {
    document.getElementById("m-visited").textContent = state.metrics.visited;
    document.getElementById("m-ms").textContent = `${state.metrics.ms}ms`;
    document.getElementById("m-mixed").textContent = state.metrics.mixed;
    document.getElementById("m-recoverable").textContent =
      state.metrics.recoverable > 0 ? formatBtc(state.metrics.recoverable) : "—";
    document.getElementById("st-nodes").textContent = state.nodes.length;
    document.getElementById("st-edges").textContent = state.edges.length;
    document.getElementById("st-mixed").textContent = state.metrics.mixed;

    const badge = document.getElementById("radial-badge");
    if (state.network && isLayeredNetwork(state.nodes, state.network.mixerProfile)) {
      badge.style.display = "inline";
    } else {
      badge.style.display = "none";
    }
  }

  function relayout() {
    const rect = area.getBoundingClientRect();
    state.layoutNodes = layoutGraph(
      state.nodes,
      rect.width,
      rect.height,
      state.network?.mixerProfile,
    );
  }

  function resetReveal() {
    state.revealedNodes = new Set();
    state.revealedEdges = new Set();
    state.nodes.forEach((n) => {
      if (n.kind === "origin" || n.kind === "target" || n.isExchange) {
        state.revealedNodes.add(n.id);
      }
    });
  }

  function loadNetwork(net) {
    state.network = net;
    state.nodes = net.nodes;
    state.edges = net.edges;
    state.metrics.mixed = net.edges.filter((e) => e.isMixed).length;
    state.steps = [];
    state.paths = [];
    state.highlightPath = [];
    resetReveal();
    relayout();
    renderWallets();
    renderPaths();
    renderLog([]);
    updateMetrics();
    document.getElementById("net-name").textContent = net.name;
  }

  function generateDemo() {
    if (state.busy) return;
    state.cleanBase = buildCleanNetwork(mulberry32(42));
    state.rng = mulberry32(42);
    loadNetwork(state.cleanBase);
    state.scenario = "clean";
    setStatus("Rede demo gerada — execute um mix ou rastreamento.");
    addLog("info", "Rede limpa: origem, destino, exchanges e 18 carteiras normais.");
  }

  function runMixSimple() {
    if (state.busy || !state.cleanBase) return;
    state.busy = true;
    const net = mixSimple(state.cleanBase, mulberry32(42));
    loadNetwork(net);
    state.scenario = "simple";
    state.busy = false;
    setStatus("Mix simples concluído — peeling chain + fan-out.");
    addLog("info", `Mix simples: +${net.nodes.length - state.cleanBase.nodes.length} carteiras intermediárias.`);
  }

  function runMixLayered() {
    if (state.busy || !state.cleanBase) return;
    state.busy = true;
    const net = mixLayered(state.cleanBase, mulberry32(42));
    loadNetwork(net);
    state.scenario = "layered";
    state.busy = false;
    setStatus("Mix em camadas concluído — layout radial ativo.");
    addLog("info", "Mix em camadas: 6×8 com retrocesso ~40% — use BFS-T ou Taint.");
  }

  function applyStep(step) {
    state.steps.push(step);
    renderLog(state.steps);

    if (step.walletId) state.revealedNodes.add(step.walletId);

    if (step.action === "expand" && step.walletId && step.neighbors) {
      step.neighbors.forEach((id) => state.revealedNodes.add(id));
      step.neighbors.forEach((to) => {
        const edge = state.edges.find(
          (e) => e.from === step.walletId && e.to === to,
        );
        if (edge) state.revealedEdges.add(edge.id);
      });
    }

    if (step.path?.length) {
      state.highlightPath = step.path;
      if (!state.paths.some((p) => p.walletIds.join() === step.path.join())) {
        state.paths.push({
          walletIds: step.path,
          hopCount: step.path.length - 1,
        });
        renderPaths();
      }
    }
  }

  function runTraceAlgo(algo) {
    if (state.busy || !state.nodes.length) return;
    state.busy = true;
    state.algo = algo;
    document.querySelectorAll(".algo-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.algo === algo);
    });
    document.getElementById("algo-help-text").innerHTML = `<strong>${algo.toUpperCase()}</strong> — ${ALGO_HELP[algo]}`;

    state.steps = [];
    state.paths = [];
    state.highlightPath = [];
    resetReveal();
    renderPaths();
    renderLog([]);

    try {
      const result = runTrace(algo, state.nodes, state.edges, state.layoutNodes, 15);
      state.metrics.visited = result.visitedCount;
      state.metrics.ms = result.elapsedMs;
      state.metrics.recoverable = result.recoverableBtc ?? 0;
      updateMetrics();

      if (result.steps?.length) {
        let i = 0;
        if (stepTimer) clearInterval(stepTimer);
        stepTimer = setInterval(() => {
          if (i >= result.steps.length) {
            clearInterval(stepTimer);
            stepTimer = null;
            if (result.paths[0]) {
              state.highlightPath = result.paths[0].walletIds;
              state.paths = result.paths;
              renderPaths();
            }
            setStatus(
              `${algo.toUpperCase()} — ${result.visitedCount} nós · ${result.elapsedMs}ms` +
                (result.recoverableBtc ? ` · ${formatBtc(result.recoverableBtc)} rastreável` : ""),
            );
            state.busy = false;
            return;
          }
          applyStep(result.steps[i]);
          i += 1;
        }, 70);
      } else {
        result.visitedWalletIds.forEach((id) => state.revealedNodes.add(id));
        if (result.paths[0]) {
          state.highlightPath = result.paths[0].walletIds;
          state.paths = result.paths;
          renderPaths();
        }
        setStatus(`${algo.toUpperCase()} — ${result.visitedCount} nós · ${result.elapsedMs}ms`);
        state.busy = false;
      }
    } catch (e) {
      setStatus(e.message || "Erro no rastreamento");
      state.busy = false;
    }
  }

  // ── UI render ────────────────────────────────────────────────
  function renderWallets() {
    const el = document.getElementById("wallet-list");
    const key = state.nodes.filter(
      (n) =>
        n.kind === "origin" ||
        n.kind === "target" ||
        n.isExchange ||
        n.kind === "intermediate",
    );
    const shown = key.slice(0, 24);
    el.innerHTML = shown
      .map((n) => {
        const col = KIND_COLORS[n.kind] || KIND_COLORS.normal;
        return `<div class="wallet-item">
          <div class="wallet-dot" style="background:${col}"></div>
          <div class="wallet-info">
            <div class="wallet-label">${n.label}</div>
            <div class="wallet-meta">${n.kind}${n.balanceBtc ? " · " + formatBtc(n.balanceBtc) : ""}</div>
          </div>
        </div>`;
      })
      .join("");
    if (key.length > 24) {
      el.innerHTML += `<div class="wallet-meta" style="padding:6px 8px">+${key.length - 24} carteiras…</div>`;
    }
  }

  function renderLog(steps) {
    const feed = document.getElementById("log-feed");
    if (!steps.length) {
      feed.innerHTML = `<div class="log-row info">Execute um algoritmo para ver a animação passo a passo.</div>`;
      return;
    }
    feed.innerHTML = steps
      .slice()
      .reverse()
      .slice(0, 40)
      .map(
        (s) =>
          `<div class="log-row ${s.action === "found" ? "found" : s.action === "expand" ? "expand" : "visit"}">${s.message}${s.score ? ` (${formatBtc(s.score)})` : ""}</div>`,
      )
      .join("");
  }

  function renderPaths() {
    const el = document.getElementById("path-list");
    if (!state.paths.length) {
      el.innerHTML = `<div class="log-row info">Nenhum caminho encontrado ainda.</div>`;
      return;
    }
    el.innerHTML = state.paths
      .map(
        (p, i) => `<div class="path-card ${i === state.activePath ? "active" : ""}" data-idx="${i}">
        <div>Caminho ${i + 1}</div>
        <div class="path-meta">${p.hopCount} hops · ${p.walletIds.length} carteiras</div>
      </div>`,
      )
      .join("");
    el.querySelectorAll(".path-card").forEach((card) => {
      card.addEventListener("click", () => {
        state.activePath = Number(card.dataset.idx);
        state.highlightPath = state.paths[state.activePath].walletIds;
        renderPaths();
      });
    });
  }

  function addLog(kind, msg) {
    const feed = document.getElementById("log-feed");
    const row = document.createElement("div");
    row.className = `log-row ${kind}`;
    row.textContent = msg;
    feed.insertBefore(row, feed.firstChild);
  }

  function nodeStyle(node, revealed, highlighted) {
    if (highlighted) return COLORS.suspicious;
    if (!revealed && node.kind === "normal") return COLORS.idle;
    if (node.kind === "origin") return COLORS.origin;
    if (node.kind === "target") return COLORS.target;
    if (node.isExchange || node.kind === "exchange") return COLORS.exchange;
    if (node.kind === "intermediate") return COLORS.intermediate;
    return COLORS.normal;
  }

  function nodeRadius(node, revealed) {
    if (node.kind === "origin" || node.kind === "target") return 12;
    if (node.kind === "intermediate" || !revealed) return 6;
    return 8;
  }

  function draw() {
    state.pulse += 0.03;
    const rect = area.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--bg-canvas")
      .trim();
    ctx.fillRect(0, 0, W, H);

    const index = new Map(state.layoutNodes.map((n, i) => [n.id, i]));
    const pathSet = new Set(state.highlightPath);

    if (state.layers.edges) {
      state.edges.forEach((edge) => {
        if (!state.layers.mixed && edge.isMixed) return;
        const a = state.layoutNodes[index.get(edge.from)];
        const b = state.layoutNodes[index.get(edge.to)];
        if (!a || !b) return;
        const revealed = state.revealedEdges.has(edge.id);
        const onPath =
          pathSet.has(edge.from) &&
          pathSet.has(edge.to) &&
          pathSet.size > 1;
        const idle = !revealed && !onPath;

        ctx.save();
        ctx.globalAlpha = idle ? 0.08 : onPath ? 0.95 : revealed ? 0.55 : 0.2;
        ctx.strokeStyle = edge.isMixed
          ? onPath
            ? "#DC2626"
            : "#EA580C"
          : onPath
            ? "#7C3AED"
            : "#94A3B8";
        ctx.lineWidth = onPath ? 2.5 : edge.isMixed ? 1.2 : 0.8;
        if (edge.isMixed && !onPath) ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      });
    }

    if (state.layers.nodes) {
      state.layoutNodes.forEach((node) => {
        const revealed =
          state.revealedNodes.has(node.id) ||
          node.kind === "origin" ||
          node.kind === "target" ||
          node.isExchange;
        const highlighted = pathSet.has(node.id);
        const style = nodeStyle(node, revealed, highlighted);
        const r = nodeRadius(node, revealed);
        const pulse = highlighted ? Math.sin(state.pulse * 2) * 1.5 : 0;

        ctx.save();
        if (!revealed) ctx.globalAlpha = 0.35;

        if (highlighted) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 8 + pulse, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(124, 58, 237, 0.12)";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, r + pulse * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = style.fill;
        ctx.fill();
        ctx.strokeStyle = style.stroke;
        ctx.lineWidth = highlighted ? 2 : 1.2;
        ctx.stroke();

        if (revealed && (r >= 8 || node.kind === "origin" || node.kind === "target")) {
          ctx.fillStyle = style.text;
          ctx.font = `500 ${node.kind === "intermediate" ? 8 : 9}px ${getComputedStyle(document.body).fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const short =
            node.label.length > 14 ? node.label.slice(0, 12) + "…" : node.label;
          ctx.fillText(short.split("·")[0].trim(), node.x, node.y);
        }

        ctx.restore();
      });
    }

    animId = requestAnimationFrame(draw);
  }

  function getNodeAt(mx, my) {
    const index = new Map(state.layoutNodes.map((n, i) => [n.id, i]));
    for (let i = state.layoutNodes.length - 1; i >= 0; i--) {
      const n = state.layoutNodes[i];
      const revealed = state.revealedNodes.has(n.id) || n.kind !== "normal";
      const r = nodeRadius(n, revealed) + 4;
      if (Math.hypot(n.x - mx, n.y - my) < r) return n;
    }
    return null;
  }

  // ── events ───────────────────────────────────────────────────
  document.getElementById("btn-generate").addEventListener("click", generateDemo);
  document.getElementById("btn-mix-simple").addEventListener("click", runMixSimple);
  document.getElementById("btn-mix-layered").addEventListener("click", runMixLayered);

  document.querySelectorAll(".algo-btn").forEach((btn) => {
    btn.addEventListener("click", () => runTraceAlgo(btn.dataset.algo));
  });

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const layer = chip.dataset.layer;
      state.layers[layer] = !state.layers[layer];
      chip.classList.toggle("on", state.layers[layer]);
    });
  });

  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const n = getNodeAt(mx, my);
    const tt = document.getElementById("tooltip");
    if (n) {
      tt.style.display = "block";
      tt.style.left = `${mx + 14}px`;
      tt.style.top = `${my - 8}px`;
      document.getElementById("tt-title").textContent = n.label;
      document.getElementById("tt-body").innerHTML = `
        <div class="tooltip-row">Tipo: ${n.kind}</div>
        <div class="tooltip-row">Saldo: ${formatBtc(n.balanceBtc || 0)}</div>
        ${parseLayerFromLabel(n.label) ? `<div class="tooltip-row">Camada: ${parseLayerFromLabel(n.label)}</div>` : ""}
      `;
    } else {
      tt.style.display = "none";
    }
  });

  canvas.addEventListener("mouseleave", () => {
    document.getElementById("tooltip").style.display = "none";
  });

  window.addEventListener("resize", () => {
    if (state.nodes.length) relayout();
  });

  // ── boot ─────────────────────────────────────────────────────
  renderLog([]);
  renderPaths();
  updateMetrics();
  setStatus('Clique em "Gerar demo" para começar.');
  document.getElementById("algo-help-text").innerHTML = `<strong>BFS</strong> — ${ALGO_HELP.bfs}`;
  animId = requestAnimationFrame(draw);
})();
