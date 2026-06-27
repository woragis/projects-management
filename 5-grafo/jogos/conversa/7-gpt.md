Como você também cursa Estatística, existe uma oportunidade interessante: transformar o jogo em algo que mistura **Grafos + Estatística + Ciência de Dados**.

Nesse cenário, o jogador não apenas navega pela rede. Ele também precisa **inferir**, **prever**, **classificar** e **tomar decisões sob incerteza**.

---

# Regressão Linear

## Missão

```txt
Preveja onde o alvo estará amanhã.
```

Dados:

```txt
Segunda -> Cafeteria A
Terça   -> Cafeteria A
Quarta  -> Cafeteria B
Quinta  -> Cafeteria B
```

O jogador analisa padrões.

Conceito:

* Tendência
* Previsão

---

# Regressão Logística

## Missão

```txt
Qual dispositivo pertence ao suspeito?
```

Dados:

```txt
Android
Samsung
Conecta às 8h
Conecta às 18h
```

O modelo retorna:

```txt
Device A -> 92%
Device B -> 12%
Device C -> 5%
```

O jogador escolhe.

---

# Bayes

## Missão

```txt
Atualize sua suspeita conforme novas evidências aparecem.
```

Inicialmente:

```txt
Suspeito A = 25%
Suspeito B = 25%
Suspeito C = 25%
Suspeito D = 25%
```

Nova evidência:

```txt
O culpado usa iPhone.
```

Probabilidades mudam.

Visualmente isso funciona muito bem.

Widget matemático:

genui{"math_block_widget_always_prefetch_v2":{"content":"P(A|B)=\frac{P(B|A)P(A)}{P(B)}"}}

---

# Cadeias de Markov

## Missão

```txt
Prever o próximo movimento do alvo.
```

Rede:

```txt
Casa
  |
Trabalho
  |
Academia
```

Histórico:

```txt
Casa -> Trabalho 90%
Casa -> Academia 10%
```

Você estima a próxima posição.

---

# HMM (Hidden Markov Model)

## Missão

```txt
Localizar um espião que nunca aparece diretamente.
```

Você vê apenas rastros:

```txt
GPS
Mensagens
WiFi
```

Mas não vê o alvo.

Precisa inferir o estado oculto.

---

# K-Means

## Missão

```txt
Separar usuários em grupos.
```

Resultado:

```txt
Cluster 1 -> Estudantes
Cluster 2 -> Funcionários
Cluster 3 -> Diretores
```

---

# DBSCAN

## Missão

```txt
Encontrar reuniões suspeitas.
```

Dados de localização.

O algoritmo detecta aglomerações.

---

# PCA

## Missão

```txt
Analisar milhares de dispositivos rapidamente.
```

Cada dispositivo:

```txt
CPU
RAM
Horário
Fabricante
Localização
```

PCA reduz dimensões.

No jogo isso pode virar:

```txt
Modo de Análise Avançada
```

---

# Séries Temporais

## Missão

```txt
Prever quando ocorrerá um ataque.
```

Dados:

```txt
10h
12h
14h
16h
```

Você identifica periodicidade.

---

# ARIMA

## Missão

```txt
Prever carga futura da rede.
```

Ajuda a planejar defesa.

---

# Poisson

## Missão

```txt
Quantas tentativas de acesso esperar hoje?
```

Perfeito para eventos raros.

Widget:

P(X=k)=\frac{\lambda^k e^{-\lambda}}{k!}

---

# Exponencial

## Missão

```txt
Quanto tempo até o próximo incidente?
```

---

# Distribuição Normal

## Missão

```txt
Detectar comportamento anômalo.
```

Usuário comum:

```txt
50 acessos/dia
```

Hoje:

```txt
300 acessos
```

Algo está errado.

---

# Z-Score

## Missão

```txt
Encontrar outliers.
```

Widget:

genui{"math_block_widget_always_prefetch_v2":{"content":"z=\frac{x-\mu}{\sigma}"}}

---

# Teste Qui-Quadrado

## Missão

```txt
Existe associação entre dois eventos?
```

Exemplo:

```txt
Departamento
Incidentes
```

O jogador testa hipóteses.

---

# Teste t

## Missão

```txt
O novo protocolo reduziu falhas?
```

Comparar antes/depois.

---

# A/B Testing

## Missão

```txt
Qual estratégia de defesa funciona melhor?
```

Você testa:

```txt
Firewall A
Firewall B
```

---

# Monte Carlo

## Missão

```txt
Simular milhares de cenários.
```

Pergunta:

```txt
Qual a chance da rede sobreviver?
```

O jogo roda 10.000 simulações.

---

# Redes Bayesianas

## Missão

```txt
Descobrir a causa mais provável de um incidente.
```

Exemplo:

```txt
Falha elétrica
↓
Servidor caiu
↓
Sistema indisponível
```

---

# Survival Analysis

## Missão

```txt
Qual servidor deve falhar primeiro?
```

Muito usada em manutenção preditiva.

---

# Combinação Grafos + Estatística

As missões mais interessantes misturam ambos.

## Exemplo

Rede social:

```txt
1000 usuários
```

Objetivos:

1. Detectar comunidades (Louvain)
2. Encontrar líderes (PageRank)
3. Identificar usuários anômalos (Z-Score)
4. Prever recrutamentos (Regressão Logística)
5. Simular propagação (Markov)
6. Maximizar influência (Influence Maximization)

---

## Exemplo 2

Cidade Inteligente

```txt
Semáforos
Ônibus
Sensores
Câmeras
```

Objetivos:

1. Encontrar caminho mínimo (Dijkstra)
2. Detectar falhas (Outlier Detection)
3. Prever congestionamento (Séries Temporais)
4. Simular eventos futuros (Monte Carlo)

---

Se você unir Grafos e Estatística, o projeto deixa de parecer apenas um trabalho de disciplina e passa a parecer uma pequena plataforma de análise de redes e inteligência, algo bastante alinhado com suas formações em Ciência da Computação e Estatística.
