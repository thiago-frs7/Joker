# 4. Sistema de progressão detalhado

Toda fórmula aqui obedece a um princípio: **nenhum termo pode ser negativo.** Não existe
subtração no modelo econômico do ÂMBAR — apenas multiplicadores ≥ 1 e ausência de ganho.

---

## 1. Seiva por ação

```
S  =  B × D × C × F × E × (1 + Enx_r) × (1 + Cerne)
```

| Termo | O que é | Valores |
|---|---|---|
| `B` | base do formato | Broto 10 · Ciclo 15 · etapa de Anel 40 · Vendaval 120 |
| `D` | dificuldade (3 chips) | Leve **1,0** · Média **1,5** · Pesada **2,2** |
| `C` | corrente (dias consecutivos) | `1 + 0,04 × min(elos, 12)` → máx **1,48** |
| `F` | foco (Selagem) | ver §3 → máx **1,60** |
| `E` | evento | normal **1,0** · Colheita Comum **1,25** · Pirilampo **2,0** |
| `Enx_r` | enxertos daquele Ramo | `0,02 × nº enxertos`, teto **0,30** |
| `Cerne` | podas realizadas | `0,08 × nº podas`, teto **0,40** |

**Teto teórico:** 2,2 × 1,48 × 1,60 × 2,0 × 1,30 × 1,40 ≈ **19×** a base. Alto de propósito: o
pico raro de recompensa é o que mantém um cérebro que busca novidade engajado — mas depende de
alinhar corrente, foco e evento, o que é improvável por acidente.

### Seiva do Herbário (progresso contínuo)

| Mídia | Taxa |
|---|---|
| Livro / mangá | **1 🩸** por 10 páginas · **3 🩸** por capítulo |
| Anime / série | **2 🩸** por episódio |
| Filme | **8 🩸** ao prensar |
| Jogo | **1 🩸** por 10 min · **25 🩸** ao prensar |
| Álbum | **4 🩸** por escuta completa |
| `Deixado ir` | **10 🩸** — decidir parar também é executar |

---

## 2. Camada (nível) e Âmbar

O Âmbar total é a soma de **toda a Seiva já gerada** na vida da conta. Gastar Seiva não o afeta.

```
Âmbar necessário para atingir a Camada n:     A(n) = 60 · n^1,55
Camada atual a partir do Âmbar:               n    = ⌊ (Âmbar / 60)^0,645 ⌋
```

| Camada | Âmbar | Tempo estimado¹ |
|---:|---:|---|
| 5 | 727 | ~7 dias |
| 10 | 2.129 | ~19 dias |
| 20 | 6.234 | ~56 dias |
| **30** | **11.687** | **~104 dias** ← libera a Poda, ≈ 1 Estação |
| 50 | 25.796 | ~7,5 meses |
| 100 | 75.536 | ~1,8 anos |

¹ base: **≈112 🩸/dia** de um usuário mediano (3 Brotos + 2 Ciclos + progresso de mídia +
1 Selagem de 25 min).

**Por que expoente 1,55:** o custo por camada cresce (de ~373 🩸 na Camada 12 para ~609 🩸 na
Camada 30), mas **o tempo por camada nunca passa de ~5 dias**, porque os multiplicadores crescem
junto. A curva é desenhada para que jamais exista um "muro" — o motivo nº 1 de abandono.

---

## 3. Multiplicadores

### Corrente (chains) — e o perdão

```
C = 1 + 0,04 × min(elos, 12)
```
`elos` = dias consecutivos com ≥1 Ciclo cumprido. E então, a parte que importa:

```
dia 1 perdido → TURVAÇÃO. corrente CONGELA. cosmético (âmbar fica opaco).
dia 2 perdido → congelada. nada acontece.
dia 3 perdido → congelada. o app não notifica sobre isso.
dia 4+       → corrente RECUA ao último marco: {30, 14, 7, 3, 0}
```

Uma corrente de 22 elos abandonada por uma semana volta com **14**, não com 0.
**Bruma:** 2 fichas de perdão por mês, gastas automaticamente e em silêncio — o usuário só
descobre que existiam ao ler os detalhes.

### Foco (Selagem) — crédito parcial é lei

```
F_bruto = 1 + 0,015 × min(minutos, 40)          → máx 1,60
pureza  = max(0,40 ; 1 − 0,20 × interrupções)
F       = 1 + (F_bruto − 1) × pureza            → SEMPRE ≥ 1,00
```

| Sessão | Interrupções | F |
|---|---:|---:|
| 40 min | 0 | **1,60** |
| 40 min | 2 | 1,36 |
| 40 min | 5 | 1,24 |
| 15 min | 0 | 1,23 |
| 15 min | 3 | 1,09 |

Uma sessão de 40 min interrompida 5 vezes ainda vale **mais** que 15 min perfeitos. A mensagem
matemática é explícita: *tentar por mais tempo, mesmo mal, vale mais que desistir cedo.*

**Seiva da própria Selagem:** `minutos × 1,2 × F` → 25 min limpos = **41 🩸**.

---

## 4. Ramos e Nós

```
custo do nó na profundidade t:     custo(t) = 50 × 1,9^(t−1)
```

| t | Custo | Nós disponíveis por Ramo |
|---:|---:|---|
| 1 | 50 | 3 (todos compráveis) |
| 2 | 95 | 2 (bifurcação **exclusiva** — escolher um fecha o outro) |
| 3 | 181 | 4 |
| 4 | 343 | 4 |
| 5 | 652 | 2 (capstone) |
| 6 | 1.238 | só com Anel de Cerne |

**Regra de interface acima da matemática:** independentemente de quantos nós estejam elegíveis,
a tela Árvore mostra **no máximo 4 chips compráveis**, ordenados por (custo mais baixo → Ramo
mais ativo nos últimos 7 dias).

### Silhueta (classe emergente)

Seja `v_r` = Seiva investida em nós do Ramo `r` no ciclo atual, e `V = Σ v_r`:

```
p_r = v_r / V
top1, top2 = os dois maiores p_r

Silhueta definida  ⟺  p_top1 ≥ 0,25  E  p_top2 ≥ 0,25  E  (p_top1 + p_top2) ≥ 0,55
senão → "Bruma"
```

Recalculada **domingo 22h**, nunca em tempo real. Bônus da Silhueta: um único passivo de +6%
sobre uma ação específica (ex.: *Monge de Pedra* → +6% em Ciclos de manhã).

---

## 5. Vendaval (boss semanal calibrado)

```
HP = max(300 ;  0,80 × mediana(Seiva das 4 semanas anteriores))
teto de crescimento: HP_semana ≤ 1,25 × HP_semana_anterior
primeiras 4 semanas de conta: HP = 300 fixo
```

Usuário mediano (784 🩸/semana) → **HP 627**. Ou seja: o Vendaval é vencido fazendo **80% do que
você já fazia**. Ele não pede esforço extra; ele *reconhece* o esforço normal e o dramatiza.

- Qualquer Broto/Ciclo/progresso de mídia contribui — sem tarefa obrigatória.
- Recompensa: 1 Fóssil (Cerne ou Âmbar) + 1 Inclusão da Estação + 200 🩸.
- **Derrota não custa nada.** O Vendaval passa e a semana seguinte recalibra para baixo.
- **Bosque** (party): `HP_grupo = Σ HP_individual × 0,9`. Ninguém vê a contribuição individual
  dos outros — só a barra do grupo.
- **Espelho** (duelo): pontuação = `Seiva_semana / mediana_pessoal_4sem`. Compara **melhora
  relativa**, então ritmos diferentes duelam de igual para igual.

---

## 6. Inclusões (artefatos vivos)

```
Dormente → Desperta:  400 🩸 do Ramo afim
Desperta → Plena:   1.600 🩸 do Ramo afim
```

Seiva investida em Inclusão **não** conta para nós de Ramo. Trade-off real e reversível uma única
vez por Poda. Bônus de uma Inclusão Plena: +3% de Seiva no Ramo afim (teto de 4 Inclusões Plenas
contribuindo ao mesmo tempo, escolhidas pelo usuário na Estufa).

---

## 7. Enxertos

```
elegível  ⟺  duas Folhas "Prensadas" com ≥ 2 tags em comum
             (ou par curado pela equipe, que rende Fóssil junto)
bônus     =  +2% de Seiva permanente num Ramo escolhido entre 2 sugeridos
teto      =  +30% por Ramo (15 enxertos)
```

Enxertos **sobrevivem à Poda**. São a única forma de bônus permanente que vem exclusivamente do
consumo cultural — e por isso o incentivo central para terminar o que se começa.

---

## 8. Poda (New Game+)

```
requisito:  Camada ≥ 30  E  ≥ 1 Anel fechado
reseta:     nós de Ramo, saldo de Seiva, vínculos de Inclusão
preserva:   Âmbar, Camada, Fósseis, Epítetos, Inclusões, Herbário, Enxertos, Anéis
concede:    Anel de Cerne → +8% Seiva permanente (teto 5 podas = +40%)
            +1 slot de Epíteto
            acesso a nós de profundidade 6
```

A Camada **não** reseta. É a diferença filosófica com todo sistema de prestígio de mercado: aqui
o prestígio não custa a sua história, custa apenas a sua especialização atual.

---

## 9. Colheita Comum (meta global da Estação)

```
alvo = 0,60 × usuários_ativos × mediana_semanal_global × 12 semanas
marcos em 33% / 66% / 100%
```

O **marco 1 é liberado para todos no encerramento da Estação**, independentemente do resultado.
Metas coletivas nunca podem virar culpa coletiva.

---

## 10. Fósseis — critérios de exemplo

| Fóssil | Raridade | Critério |
|---|---|---|
| Primeira Gota | Casca | 1º registro |
| O Retorno da Seiva | Cerne | voltar após 30+ dias parado |
| Mão de Ferreiro | Cerne | 50 Brotos num único Ramo |
| Bushidō Vivido | Âmbar | um Enxerto específico curado |
| Doze Anéis | Âmbar | 12 elos de corrente em 3 Ramos diferentes |
| Herbário Cheio | Âmbar | 100 Folhas prensadas |
| **— — —** *(oculto)* | Âmbar | prensar uma obra em idioma diferente do sistema |
| **— — —** *(oculto)* | Prisma | uma Selagem de 40 min sem interrupções às 4h |
| Ambarista | Prisma | 3 Podas + 5 Inclusões Plenas |

**Fósseis Ocultos:** invisíveis (`— — —`) até 50% do critério; então revelam **uma linha** de
dica. Nunca aparecem em nenhuma lista de "conquistas disponíveis".
