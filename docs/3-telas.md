# 3. As telas principais

Cinco telas. Nenhuma sexta. A barra inferior tem exatamente 5 destinos, reordenáveis pelo
usuário — com uma exceção: **Hoje** é fixa na primeira posição, porque uma pessoa com TDAH
precisa de um ponto de retorno que nunca se mova.

```
🌱 Hoje    🌿 Árvore    🍃 Herbário    🏛️ Estufa    🪨 Estrato
```

---

## 1. 🌱 HOJE — a tela que decide por você

**O que ela resolve:** paralisia de decisão nos primeiros 5 segundos de app aberto.

```
┌──────────────────────────────────────┐
│  Camada 12  ▓▓▓▓▓▓▓▓░░░░  1.240 🟡  │  ← 1 linha, sem detalhe
│                                      │
│   ╭────────────────────────────────╮ │
│   │                                │ │
│   │      AGORA                     │ │  ← 1 Broto. Um só.
│   │      abrir o capítulo 12       │ │     escolhido pelo app
│   │      3 min                     │ │
│   │                                │ │
│   │      ┌──────────────────┐      │ │
│   │      │      FEITO       │      │ │  ← alvo de 72 dp
│   │      └──────────────────┘      │ │
│   │        outro  ·  depois        │ │  ← 2 escapes, discretos
│   ╰────────────────────────────────╯ │
│                                      │
│   ●●●○○   corrente de 3 elos        │
│                                      │
│   ┌────┐  ┌────┐  ┌────┐            │
│   │ 🏃 │  │ 📖 │  │ 💧 │            │  ← Ciclos de hoje como
│   └────┘  └────┘  └────┘               pedras. toque = feito
│                                      │
│   🌪️  Vendaval  ▓▓▓▓▓▓░░░  68%      │  ← 1 linha
│                                      │
│           ╭───────────╮              │
│           │  ⧗ SELAR  │              │  ← sempre no mesmo lugar
│           ╰───────────╯              │
└──────────────────────────────────────┘
```

**Decisões de design**
- **Um Broto por vez.** Nunca uma lista. "Outro" troca a sugestão; "depois" empurra 2 h. Nada de
  reordenar, priorizar, ou olhar a fila — a fila existe, mas mora na Árvore, não aqui.
- O botão **FEITO** é o maior elemento tocável do app inteiro.
- **Toque em pedra de Ciclo** = concluído, com resposta em **<120 ms**: a pedra vira âmbar,
  vibração curta, número de Seiva sobe flutuando e evapora.
- Zero badges. Zero contadores vermelhos. Zero "3 tarefas atrasadas".
- Nada nesta tela usa a palavra "atrasado", "pendente" ou "perdido".

---

## 2. 🌿 ÁRVORE — quem você está virando

**O que ela resolve:** dar sentido de longo prazo sem exigir planejamento.

```
┌──────────────────────────────────────┐
│         ERUDITO DAS MARÉS            │  ← Silhueta, em serifa grande
│         Mente · Cultura              │
│                                      │
│        ╱╲    ╱╲                      │
│      ○─┴─●  ●┴─○      canvas         │  ← árvore navegável
│       ╲   ╲╱   ╱      pan + pinch       (pinta-se conforme cresce)
│        ●───●───●                     │
│            │                         │
│         ▓▓▓▓▓  ← anéis dos Anéis     │
│                fechados              │
│                                      │
│  PRONTOS PARA ABRIR      🩸 1.240    │
│  ┌──────────┐ ┌──────────┐          │
│  │ Fôlego   │ │ Carga    │          │  ← EXATAMENTE 4, nunca mais
│  │ 95 🩸    │ │ 180 🩸   │          │
│  └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐          │
│  │ Base     │ │ Postura  │          │
│  └──────────┘ └──────────┘          │
└──────────────────────────────────────┘
```

- A árvore é **desenhada de verdade** — cresce galhos e engrossa o tronco conforme investimento.
  É a única visualização "complexa" do app, e é opcional: os 4 chips embaixo bastam para jogar.
- **Anéis** fechados aparecem como anéis de crescimento no tronco, permanentemente datados.
- Aqui também vive a fila completa de tarefas (Anéis e seus Brotos), fora da tela Hoje.
- Renomear Ramos, criar Ramos, definir fontes de Seiva: tudo daqui, via toque longo no galho.

---

## 3. 🍃 HERBÁRIO — dois toques e a obra existe

**O que ela resolve:** o atrito de registrar mídia, que é onde 90% dos trackers morrem.

```
┌──────────────────────────────────────┐
│  ╭──────────────────────────────╮    │
│  │ 🎙️  fala ou escreve o nome   │    │  ← campo único, foco
│  ╰──────────────────────────────╯       automático, voz em 1 toque
│                                      │
│  ▸ ENXERTO DISPONÍVEL                │
│  ╭──────────────────────────────╮    │
│  │ Musashi ✛ Ghost of Tsushima  │    │  ← banner âmbar, pulsante
│  │ "Bushidō Vivido"  → ENXERTAR │    │
│  ╰──────────────────────────────╯    │
│                                      │
│  Semeado │ EM CURSO │ Prensado │ ... │  ← 4 chips, scroll horizontal
│                                      │
│  ┌────┐ Vinland Saga                 │
│  │capa│ cap. 84 / 210                │  ← barra grossa de 8 dp
│  └────┘ ▓▓▓▓▓▓▓░░░░░░░  +1 cap  ⊕   │  ← botão de incremento
│                                      │     rápido, sem abrir nada
│  ┌────┐ Elden Ring                   │
│  │capa│ 41 h                         │
│  └────┘ ▓▓▓▓▓▓▓▓▓▓░░░  +1 h    ⊕   │
└──────────────────────────────────────┘
```

**O fluxo de registro completo, em dois toques:**

```
toque 1: 🎙️ "vinland saga"     →  app busca em AniList/Jikan
                                    e devolve 3 cards com capa
toque 2: toca no card correto   →  pronto. capa, sinopse de 2 linhas,
                                    capítulos, gêneros, nota, tudo dentro.
                                    Estado = "Em curso" por padrão.
```

Nenhum campo obrigatório além do nome. Prioridade, nota e avaliação são **opcionais e
posteriores**, editáveis por swipe. Se a API não achar: **foto da capa + OCR do título**, e o app
busca de novo com o texto lido.

---

## 4. 🏛️ ESTUFA — o lugar sem nenhuma tarefa

**O que ela resolve:** dar ao app um espaço de puro prazer, sem cobrança, para onde voltar em
dias ruins.

```
┌──────────────────────────────────────┐
│   ░░░ chuva no vidro (Estação) ░░░   │
│  ╔══════════════════════════════════╗│
│  ║   ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  ║│  ← prateleira
│  ║    🟡      🟡        ░░░        ║│
│  ║   escaravelho  pena   (vazio)   ║│  ← Inclusões arrastáveis
│  ║   ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  ║│
│  ║      🟡          🟡             ║│
│  ║   ┌──────────────────────┐      ║│
│  ║   │  luz de vela, vapor  │      ║│
│  ╚═══╧══════════════════════╧══════╝│
│                                      │
│   toque numa Inclusão → 3D em tela   │
│   cheia, rotação, som próprio        │
└──────────────────────────────────────┘
```

- **Nenhum número nesta tela.** Nenhum botão de tarefa. Nenhuma notificação chega aqui.
- Toque numa Inclusão: ela abre em tela cheia, rotação por arraste, com **uma linha** dizendo o
  que você fez para ganhá-la e a data. Alimentar (`+400 🩸`) é um único botão discreto.
- Prateleiras vazias não dizem "desbloqueie mais!" — ficam apenas vazias e bonitas.
- É a tela que o app abre por padrão quando você volta depois de 7+ dias parado. Primeiro o
  reencontro, depois o trabalho.

---

## 5. 🪨 ESTRATO — o registro do que ficou

**O que ela resolve:** memória externa de identidade — "eu sou alguém que fez coisas".

```
┌──────────────────────────────────────┐
│  ESTAÇÃO DE RESINA        43 dias    │
│  Colheita Comum ▓▓▓▓▓▓▓░░░  marco 2  │
│                                      │
│  ╔══════════════════════════════════╗│
│  ║  seu estrato                     ║│  ← corte geológico: cada
│  ║  ▓▓▓▓▓▓▓ camada 12  jul/2026     ║│     camada é um mês real,
│  ║  ▓▓▓▓▓ camada 11                 ║│     espessura = Âmbar do mês
│  ║  ▓▓▓▓▓▓▓▓▓ camada 10  🪲🪨       ║│     e os ícones são o que
│  ╚══════════════════════════════════╝│     você conquistou ali
│                                      │
│  EPÍTETOS   ┌─────────┐ ┌─────────┐ │
│             │ O Insone│ │  vazio  │ │  ← 2 slots
│             └─────────┘ └─────────┘ │
│                                      │
│  Prisma │ ÂMBAR │ Cerne │ Casca     │
│  🪨 Bushidō Vivido       ÂMBAR      │
│  🪨 — — —                ÂMBAR      │  ← Fóssil Oculto
│  🪨 O Retorno da Seiva   CERNE      │
└──────────────────────────────────────┘
```

- O **estrato** substitui a lista de troféus como visual principal: um corte de terra que
  cresce para cima, mês a mês. Rolar para baixo é literalmente escavar seu passado.
- Fósseis Ocultos permanecem `— — —` até 50% do critério; depois mostram uma dica de uma linha.
- Aqui vive também o botão de **Poda**, que só aparece na Camada 30 — e nunca é sugerido por
  notificação.

---

## Momentos de celebração (3, cinematográficos, curtos)

| Evento | Duração | Coreografia |
|---|---|---|
| **Nova Camada** | 2,4 s | a tela escurece, uma gota de resina desce do topo e endurece com um `tick` grave; o número da camada é gravado dentro dela; grão de papel volta |
| **Inclusão Desperta** | 3,0 s | a resina clareia de fora para dentro, a criatura move-se pela primeira vez, som único e irrepetível gerado a partir do ID da Inclusão |
| **Anel fechado** | 4,0 s | corte transversal do tronco, o novo anel se desenha em espiral com a data, e a Silhueta é reavaliada na hora |

**Regras de celebração:** nada é *skippable-obrigatório* — toque em qualquer lugar corta a
animação e mantém a recompensa. Nunca duas celebrações em sequência: a segunda entra numa fila e
espera o próximo abrir do app, para que a recompensa não vire ruído.
