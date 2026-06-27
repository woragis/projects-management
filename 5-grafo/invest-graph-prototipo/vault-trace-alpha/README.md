# VaultTrace — protótipo HTML

Demo offline do projeto **VaultTrace** (Anti-Mixer / Compliance Lab) para compartilhar sem backend.

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `vaulttrace_anti_mixer.html` | Página principal |
| `vaulttrace.css` | Estilos Arctic Ledger |
| `vaulttrace-app.js` | Grafo, mixer, algoritmos e canvas |

## Como abrir

1. Abra `vaulttrace_anti_mixer.html` no Chrome, Edge ou Firefox.
2. Ou sirva a pasta localmente:

```bash
cd invest-graph-prototipo
python -m http.server 8765
# http://localhost:8765/vaulttrace_anti_mixer.html
```

> Os três arquivos precisam ficar na **mesma pasta** (links relativos).

## Roteiro da demo

1. **Gerar demo** — rede limpa (~22 carteiras)
2. **Mix simples** — peeling chain (8 hops)
3. Rodar **BFS** — contamina subgrafo
4. **Gerar demo** de novo → **Mix camadas** — layout radial 6×8
5. Rodar **BFS-T** ou **Taint** — rastreamento temporal / valor recoverable

## Algoritmos

- BFS, DFS, A*, Dijkstra
- BFS-T, DFS-T (temporal)
- Taint (propagação greedy de valor)

Implementação simplificada em JavaScript, espelhando o backend Go do projeto `vault-trace`.
