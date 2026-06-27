Se você começar a explorar análise de redes, mineração de dados e sistemas de recomendação, aparecem muitos algoritmos e métricas além dos clássicos de grafos. Alguns são excelentes para transformar em mecânicas de jogo.

# Similaridade

## Jaccard

Mede quanto dois conjuntos se parecem.

Widget:

J(A,B)=\frac{|A\cap B|}{|A\cup B|}

Missão:

```txt
Descubra qual conta falsa pertence ao mesmo operador.
```

Usuário A segue:

* X
* Y
* Z

Usuário B segue:

* X
* Y
* W

Alta similaridade de Jaccard.

---

## Cosine Similarity

Muito usada em recomendação.

Missão:

```txt
Encontrar qual perfil mais se parece com o alvo.
```

Você compara:

* interesses
* horários
* localização
* comportamento

---

## Pearson Correlation

Missão:

```txt
Quais usuários agem de forma sincronizada?
```

Pode revelar bots.

---

# Recomendação

## Collaborative Filtering

Missão:

```txt
Prever quem será recrutado para uma organização.
```

Baseado em pessoas parecidas.

---

## Matrix Factorization

Missão:

```txt
Encontrar preferências ocultas dos usuários.
```

Muito usado por plataformas de streaming.

---

# Predição em Grafos

## Common Neighbors

Missão:

```txt
Prever futuras amizades.
```

Se A e B têm muitos amigos em comum.

---

## Adamic-Adar

Missão:

```txt
Descobrir conexões ocultas.
```

Amigos raros valem mais.

---

## Resource Allocation Index

Missão:

```txt
Identificar canais prováveis de comunicação.
```

---

## Preferential Attachment

Missão:

```txt
Prever quem ganhará mais influência.
```

Baseado no conceito:

```txt
Quem é popular tende a ficar mais popular.
```

---

# Teoria das Redes Complexas

## Coeficiente de Clusterização

Missão:

```txt
Encontrar grupos muito unidos.
```

Exemplo:

```txt
A conhece B
A conhece C
B conhece C
```

Triângulo fechado.

---

## Small World Networks

Missão:

```txt
Encontrar atalhos em uma rede global.
```

Inspirado nos "6 graus de separação".

---

## Assortatividade

Missão:

```txt
Descobrir se pessoas semelhantes se conectam.
```

---

## Modularity

Missão:

```txt
Avaliar a qualidade das comunidades encontradas.
```

Muito usada pelo Louvain.

---

# Detecção de Comunidades

## Louvain

Missão:

```txt
Encontrar facções.
```

---

## Leiden

Versão moderna do Louvain.

Missão:

```txt
Mapear organizações globais.
```

---

## Infomap

Missão:

```txt
Encontrar grupos usando fluxo de informação.
```

---

# Classificação

## Naive Bayes

Missão:

```txt
Classificar mensagens suspeitas.
```

---

## Random Forest

Missão:

```txt
Determinar se uma conta é legítima.
```

O jogador coleta atributos.

---

## SVM

Missão:

```txt
Separar usuários normais de anômalos.
```

---

# Detecção de Anomalias

## Isolation Forest

Missão:

```txt
Encontrar infiltrados.
```

---

## Local Outlier Factor

Missão:

```txt
Quem se comporta diferente do grupo?
```

---

## One-Class SVM

Missão:

```txt
Detectar tráfego incomum.
```

---

# Busca Inteligente

## Beam Search

Missão:

```txt
Investigar rapidamente uma rede enorme.
```

---

## Best First Search

Missão:

```txt
Seguir as pistas mais promissoras.
```

---

## Bidirectional Search

Missão:

```txt
Encontrar uma rota entre dois agentes.
```

Busca começa dos dois lados.

---

# Otimização

## Simulated Annealing

Missão:

```txt
Encontrar a melhor configuração da rede.
```

---

## Algoritmo Genético

Missão:

```txt
Evoluir estratégias de defesa.
```

---

## Ant Colony Optimization

Missão:

```txt
Descobrir rotas eficientes.
```

Formigas deixam "feromônios".

---

# Ciência de Redes Moderna

## PageRank

Missão:

```txt
Quem realmente controla a rede?
```

---

## HITS

Missão:

```txt
Encontrar especialistas e disseminadores.
```

Divide em:

```txt
Authorities
Hubs
```

---

## Katz Centrality

Missão:

```txt
Encontrar influência indireta.
```

---

## Eigenvector Centrality

Missão:

```txt
Quem influencia os influentes?
```

---

# Algoritmos que dariam missões muito interessantes

Se eu estivesse projetando um jogo ambicioso, provavelmente usaria:

| Algoritmo        | Missão                            |
| ---------------- | --------------------------------- |
| BFS              | Encontrar o informante            |
| DFS              | Seguir uma cadeia de eventos      |
| Dijkstra         | Menor risco                       |
| Kruskal          | Reconstruir infraestrutura        |
| PageRank         | Encontrar líderes                 |
| Louvain          | Detectar facções                  |
| Jaccard          | Encontrar contas relacionadas     |
| Adamic-Adar      | Descobrir conexões ocultas        |
| Markov           | Prever movimentos                 |
| Bayes            | Atualizar suspeitos               |
| K-Means          | Agrupar usuários                  |
| DBSCAN           | Encontrar reuniões                |
| Isolation Forest | Encontrar infiltrados             |
| Monte Carlo      | Simular cenários                  |
| Random Forest    | Classificar ameaças               |
| HITS             | Encontrar fontes e amplificadores |
| Betweenness      | Descobrir intermediários          |
| Min Cut          | Desmantelar uma rede              |

Esse conjunto já é suficiente para criar dezenas de missões diferentes e dar ao projeto uma aparência de plataforma de inteligência e análise de redes, não apenas um trabalho de grafos.
