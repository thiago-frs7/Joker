# 2. Arquitetura das mecânicas

## O circuito fechado (nada é sistema órfão)

```
            AÇÃO REAL DA VIDA
                   │
         ┌─────────┴─────────┐
         │                   │
     [ FAZER ]           [ CONSUMIR ]
   Brotos · Ciclos      Herbário (Folhas)
   Anéis · Vendavais            │
         │                      ├──► ENXERTOS ──┐
         └──────► SEIVA ◄───────┘   (2 obras     │
                    │                conectadas) │
        ┌───────────┼───────────┐                │
        ▼           ▼           ▼                │
     ÂMBAR       RAMOS      INCLUSÕES            │
   (acumula,    (nós de      (artefatos     bônus permanente
    nunca cai)   talento)     vivos)         de Ramo ◄──────┘
        │           │             │
        ▼           ▼             ▼
     CAMADA     SILHUETA       ESTUFA
     (nível)    (classe       (santuário
                emergente)      2.5D)
        │           │             │
        └───────────┴──────┬──────┘
                           ▼
                    FÓSSEIS + EPÍTETOS
                     (troféus/títulos)
                           │
                           ▼
                    ESTAÇÃO ATUAL ──► COLHEITA COMUM (meta global)
                           │
                           ▼
                    PODA (New Game+) ──► ANEL DE CERNE ──► volta ao topo
```

**Leia assim:** hábitos e mídias produzem a mesma Seiva → Seiva vira Âmbar (registro) *e*
investimento em Ramos → Ramos desenham a Silhueta e liberam Inclusões → Inclusões decoram a
Estufa e dão bônus → conquistas cristalizam em Fósseis → a Estação define o tema do trimestre →
a Poda reinicia a especialização sem apagar o histórico.

---

## As duas moedas (o coração do design)

| | **Seiva** 🩸 | **Âmbar** 🟡 |
|---|---|---|
| Natureza | saldo gastável | registro histórico |
| Como cresce | toda ação registrada | espelha 1:1 a Seiva **gerada** |
| Como diminui | quando você investe | **nunca** |
| Serve para | nós de Ramo, alimentar Inclusões | definir Camada, Fósseis, Silhueta |

Gastar Seiva **não** reduz o Âmbar. Isso significa que o nível (Camada) mede *produção total de
vida*, não *saldo em caixa*. É matematicamente impossível regredir.

---

## FAZER — os quatro formatos de tarefa

Um formato por horizonte de tempo. Nenhuma tarefa precisa ser classificada manualmente: o app
propõe o formato e o usuário aceita com um toque.

| Formato | Horizonte | O que é | Seiva base |
|---|---|---|---|
| 🌱 **Broto** | 2–5 min | a menor unidade acionável. Toda tarefa maior é fatiada em Brotos automaticamente | 10 |
| 🔁 **Ciclo** | diário/semanal | hábito recorrente. Alimenta a Corrente | 15 |
| 🪵 **Anel** | 1–3 meses | épica multi-etapa. Ao fechar, adiciona um anel de crescimento visível na árvore, para sempre | 40/etapa |
| 🌪️ **Vendaval** | 7 dias | desafio semanal calibrado no *seu* histórico. Não pede tarefas novas — soma o que você já faria | 120 |

**Fragmentação automática (Brotos):** ao criar qualquer tarefa, o app propõe 3 Brotos derivados
com verbos de início ("abrir o arquivo", "escrever 3 linhas", "separar a roupa"). O usuário
aceita, edita um, ou ignora. Uma tarefa nunca chega à tela **Hoje** sem estar fatiada.

**Vendaval é anti-frustração por construção:** seu HP é derivado da sua própria mediana das
4 semanas anteriores (ver [fórmulas](4-progressao-matematica.md)). Nunca há um padrão global a
alcançar. Falhar um Vendaval não custa nada — a tempestade simplesmente passa.

**Cooperação e duelo (opcional, desligado por padrão)**
- **Bosque** (party de 2–5 pessoas): o Vendaval do grupo soma a Seiva de todos. Ninguém vê o
  número individual dos outros — só a barra coletiva. *Zero comparação, zero culpa por semana ruim.*
- **Espelho** (duelo 1v1): compara **% de melhora sobre a própria média**, nunca valores brutos.
  Duas pessoas em ritmos totalmente diferentes podem duelar de igual para igual.

---

## CONSUMIR — o Herbário

Cada obra é uma **Folha** prensada no Herbário. Jogos, livros, mangás, animes, filmes, séries,
álbuns. Metadados vêm 100% de API ([ver mapeamento](5-apis-e-importacao.md)).

**Estados** — 4 chips, nunca dropdown: `Semeado` · `Em curso` · `Prensado` · `Deixado ir`

> "Deixado ir" (em vez de "abandonado") existe de propósito e **rende Seiva**. Reconhecer que
> uma obra não é para você agora é uma decisão executiva legítima, não um fracasso.

**Progresso** rende Seiva contínua, não só na conclusão: 1 Seiva por 10 páginas, por capítulo,
por 5 min de vídeo, por 10 min de jogo. Quem tem TDAH abandona 60% do que começa — o app precisa
pagar pelo caminho, não só pela linha de chegada.

### Enxertos (síntese cultural)

Quando duas Folhas `Prensadas` compartilham ≥2 tags (tema, época, região, autor), o app oferece
um **Enxerto**: uma página ilustrada nova no Herbário + **bônus permanente** num Ramo.

```
🍃 Musashi (livro)  ✛  🍃 Ghost of Tsushima (jogo)
                    ▼
        ENXERTO · "Bushidō Vivido"
        +2% Seiva permanente no Ramo Cultura
        página ilustrada desbloqueada
```

Isso transforma consumo cultural passivo em **construção de conhecimento conectado** — e dá um
motivo mecânico para terminar aquele livro que faz par com o jogo que você já zerou.

---

## CRESCER — Ramos, Nós e Silhueta

**Ramos** (renomeáveis, criáveis, arquiváveis) são galhos de uma única árvore. Padrão:
`Corpo` · `Mente` · `Ofício` · `Vínculo` · `Cultura` · `Ordem`

Cada Ramo é uma **árvore de talentos ramificada** de 5 profundidades. A partir da profundidade 2
os galhos **bifurcam com exclusividade** — é aí que nasce identidade em vez de números lineares.

```
Ramo CORPO
 t1  ○ Constância    ○ Fôlego    ○ Postura
 t2         ├── FORÇA ──────────── ○ Carga  ○ Explosão
            └── RESISTÊNCIA ────── ○ Base   ○ Distância
 t3  ...
```

Um **Nó** entrega uma de quatro coisas — nunca só "+1 de atributo":
1. multiplicador de Seiva naquele domínio (+5%)
2. desbloqueio de mecânica (ex.: *Enxerto Triplo*, *Selagem de 90 min*, *segundo Ciclo diário*)
3. slot de Epíteto
4. uma Inclusão exclusiva

> **Regra de tela:** no máximo **4 nós compráveis** visíveis por vez. A árvore inteira é
> navegável, mas o app sempre destaca só as 4 próximas decisões possíveis.

### Silhueta — a classe que se revela

Ninguém escolhe classe. O app olha a **distribuição do seu investimento** e nomeia a forma que
sua copa projeta. Recalculada **uma vez por semana** (domingo à noite), para que não fique
oscilando e gerando ansiedade.

| Ramos dominantes | Silhueta |
|---|---|
| Corpo + Ordem | **Monge de Pedra** |
| Mente + Cultura | **Erudito das Marés** |
| Ofício + Ordem | **Ferreiro Silencioso** |
| Cultura + Vínculo | **Contador de Histórias** |
| Corpo + Vínculo | **Guardião do Bosque** |
| Mente + Ofício | **Alquimista Prático** |
| — sem dominância clara — | **Bruma** *(estado neutro, nunca "indefinido/incompleto")* |

Cada Silhueta dá **um** bônus passivo pequeno e muda a **luz da Estufa**.

---

## GUARDAR — Inclusões, Estufa, Fósseis

### Inclusões (artefatos vivos)

Blocos de âmbar 3D com uma criatura ou objeto suspenso dentro. Três estágios:

| Estágio | Custo em Seiva afim | O que muda |
|---|---|---|
| **Dormente** | — (ganha ao desbloquear) | resina opaca, criatura em sombra |
| **Desperta** | 400 | resina clareia, a criatura **se move devagar** |
| **Plena** | 1600 | luz interna própria, som ambiente próprio, bônus passivo |

Alimentar uma Inclusão consome Seiva que **não** irá para nós de Ramo. É um trade-off honesto:
beleza e vínculo afetivo *versus* poder. Ambos são escolhas válidas.

### Estufa (santuário 2.5D)

Uma estufa de vidro em corte lateral, com prateleiras. O usuário arrasta Inclusões para onde
quiser. O ambiente **responde** a três sinais:
- **Estação atual** → luz, plantas de fundo, chuva no vidro
- **Silhueta** → paleta e mobília
- **Ritmo recente** → sem julgamento: muita atividade traz vapor e insetos voando; pouca
  atividade traz silêncio e poeira suave que **limpa sozinha** ao primeiro retorno

### Fósseis (troféus) e Epítetos (títulos)

Quatro raridades geológicas: **Casca** → **Cerne** → **Âmbar** → **Prisma**.

- **Fósseis Ocultos** aparecem como `— — —` e só revelam a dica quando você já cumpriu 50% do
  critério sem saber. Desbloqueiam por comportamento fora da caixa: prensar uma obra em outro
  idioma, fechar um Anel no dia do prazo, voltar depois de 30 dias parado (*"O Retorno da Seiva"*),
  registrar Selagem às 4h da manhã.
- **Epítetos** são equipáveis (2 slots, +1 por Poda). Cada um dá um bônus pequeno **e** muda
  como o app fala com você: `O Insone` troca as notificações da manhã pelas da madrugada.

---

## O TEMPO — Estações e Colheita Comum

Quatro Estações por ano, 3 meses cada, girando com o hemisfério do usuário:
**Brotação** → **Estio** → **Resina** → **Repouso**.

Cada Estação traz: um tema global, 12 Vendavais temáticos, 6 Inclusões limitadas (nunca voltam),
uma paleta de Estufa, e uma **Colheita Comum**.

**Colheita Comum:** toda a base de usuários enche uma barra mundial com Seiva gerada. Três marcos.
O **marco 1 é sempre concedido no fim da Estação**, cumprido ou não — a meta coletiva é um convite,
nunca uma dívida coletiva.

---

## O RECOMEÇO — Poda

Disponível na **Camada 30** com ≥1 Anel fechado.

| A Poda **reseta** | A Poda **preserva** |
|---|---|
| nós dos Ramos | **Âmbar e Camada** (o nível nunca cai) |
| saldo de Seiva | Fósseis, Epítetos, Inclusões, Herbário, Enxertos, Anéis |

Recompensa: um **Anel de Cerne** — `+8% de Seiva permanente`, `+1 slot de Epíteto`, e acesso a
nós de profundidade 6 exclusivos de cerne. Até 5 Podas (`+40%`).

> A Poda existe para quem quer virar outra pessoa sem apagar quem foi. Você reformata a
> especialização; o estrato permanece.

---

## Os dois modos de atenção

| | **Selagem** (manual) | **Silêncio** (automático) |
|---|---|---|
| Como começa | um toque no botão âmbar | o app detecta flow (uso contínuo, sem troca de app, >12 min) |
| O que faz | timer de resina escorrendo, multiplicador crescente | remove **tudo**: badges, abas, notificações, contadores |
| Ao ser interrompido | rende **âmbar turvo** — menos, nunca zero | volta em fade de 400 ms, sem alerta |
| Ao terminar | celebração curta + Seiva multiplicada | um único aviso discreto: *"você ficou 47 min. ficou bonito."* |

Nenhum dos dois pune. Uma Selagem de 40 min interrompida 3 vezes ainda rende mais que nenhuma
Selagem — **crédito parcial é lei** ([ver a fórmula](4-progressao-matematica.md#3-multiplicadores)).

---

## A INTELIGÊNCIA — o Leitor de Anéis

O sistema que lê seus padrões e age sobre eles. Não é um chat, não é um assistente, não pede
nada: é um **dendrocronologista** — alguém que corta a árvore e lê os anéis para saber que anos
foram de seca.

**O que ele lê (tudo local, no dispositivo):**
horário e dia de cada registro · intervalo entre abrir o app e a primeira ação · quais Ciclos
quebram juntos · tempo médio de Selagem por Ramo · quais Folhas ficam paradas · o que você marca
como `Deixado ir` · Brotos que você sempre empurra com "depois".

**O que ele faz com isso:**

| Padrão detectado | Ação do Leitor |
|---|---|
| Ciclo de leitura parado há 6 dias | gera o Anel de recuperação **"O Retorno do Leitor"** — 3 Brotos de 4 min, Seiva 1,5× |
| Você registra sempre 21h–22h | move todos os lembretes para 20h50, sem avisar |
| Selagens sempre morrem em 18 min | passa a sugerir Selagem de **15 min**, não de 25 |
| Três Brotos empurrados no mesmo dia | remove os outros da tela Hoje e deixa **um**, o mais curto |
| Ramo Corpo sem investimento há 3 semanas | não cobra. Oferece uma Inclusão do Ramo Corpo como isca |
| Duas Folhas com tags em comum prensadas | prepara o Enxerto e mostra o banner |
| Semana toda vazia | silencia tudo, e no retorno abre direto na Estufa |

**Missões adaptativas** são sempre geradas **menores que o padrão que falhou**. Se você não
consegue ler 20 páginas, a missão de recuperação pede 2 — nunca 20 de novo. O algoritmo procura
o menor degrau que você provavelmente sobe.

### Notificações — três regras

1. **Sempre contextual, nunca genérica.** Proibido: *"não esqueça das suas tarefas!"*.
   Permitido: *"o capítulo 84 de Vinland Saga parou no meio de uma luta. 11 minutos."*
2. **Nunca durante Selagem, Silêncio, ou nos 90 min após uma sessão.**
3. **Teto rígido de 2 por dia**, e o segundo só dispara se o primeiro foi ignorado por 4 h.
   Sem badges no ícone. Nunca.

---

## Novidade — o Pirilampo

Um vaga-lume chamado **Lampo** aparece de forma imprevisível (média de 1× a cada 2 dias, com
janela aleatória). Ele nunca cobra nada. Ele oferece:

- **Missão Secreta** — 1 Broto surpresa de 3 min, Seiva 2×, expira em 40 min
- **Sopro de Cor** — a paleta do app muda por 24 h
- **Uma frase** — sobre algo real que você fez há muito tempo e esqueceu
- **Uma pista** — sobre um Fóssil Oculto que você está perto de desbloquear

O Lampo é o gerador de imprevisibilidade que cérebros que buscam novidade precisam para não
habituar-se ao app — e é a única coisa no sistema que pode aparecer sem ser chamada.
