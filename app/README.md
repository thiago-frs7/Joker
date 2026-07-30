# ÂMBAR · aplicativo

Local-first, offline, sem build, sem dependências. Abra `index.html` no navegador.

```
app/
├── index.html          esqueleto: 5 telas + sobreposições
├── css/ambar.css       Herbário Vitoriano em Luz Baixa · uma cor saturada por tela
├── js/data.js          a base de dados: catálogo semente, Ramos, Nós, Inclusões, Fósseis
├── js/core.js          economia, fórmulas, ledger append-only, persistência
├── js/ui.js            arte procedural, glifos de linha, feedback sensorial, celebrações
├── js/telas.js         renderização das 5 telas
├── js/app.js           boot, rotas, eventos, Selagem, Silêncio, Pirilampo
├── build.js            empacota tudo em arquivo único
└── dist/ambar.html     arquivo único (133 KB) · duplo clique e roda
```

## Rodar

```bash
# direto
xdg-open app/index.html          # ou abra o arquivo no navegador

# arquivo único (para mandar pro celular / salvar na tela inicial)
cd app && node build.js && open dist/ambar.html
```

Nenhum servidor, nenhum `npm install`. Estado em `localStorage` (chave `ambar.v1`).
**Toque longo no topo** abre o Sistema (tema, som, vibração, recalcular Silhueta, apagar tudo).

## O que já funciona

| Sistema | Estado |
|---|---|
| Seiva / Âmbar em ledger append-only | ✅ impossível perder Camada |
| Camada `A(n) = 60·n^1,55` | ✅ |
| Corrente com Turvação, marcos e Bruma | ✅ perdão silencioso, 2/mês |
| Ciclos, Brotos, Anéis, fragmentação automática | ✅ |
| Vendaval calibrado na sua mediana de 4 semanas | ✅ piso 300 |
| Ramos com 90 nós, bifurcação exclusiva, 4 por vez | ✅ |
| Silhueta emergente semanal | ✅ 12 combinações |
| Herbário com busca em 2 toques | ✅ AniList + Open Library, queda para catálogo local |
| Enxertos (12 curados + automáticos por tags) | ✅ |
| Inclusões 3D em 3 estágios, arraste para girar | ✅ CSS 3D, offline |
| Estufa 2.5D com prateleiras e Estação | ✅ |
| Fósseis (16 + 5 ocultos), Epítetos | ✅ |
| Estrato por mês, Colheita Comum | ✅ Colheita é estimativa local (sem servidor) |
| Selagem com pureza e crédito parcial | ✅ |
| Silêncio automático aos 12 min | ✅ |
| Pirilampo: missão secreta, sopro de cor, lembrança | ✅ |
| Poda (New Game+) | ✅ liberada na Camada 30 |

## O que é honesto dizer que **não** está aqui

- **Sincronização bidirecional** (AniList/MAL/Trakt/Last.fm): precisa de OAuth e de um proxy
  com segredos — não cabe num arquivo estático. O fluxo de leitura já funciona.
- **Colheita Comum real**: sem servidor não existe número global. A barra é uma estimativa
  local, e a tela diz isso na cara.
- **Leitor de Anéis**: os heurísticos estão especificados em
  [`docs/2`](../docs/2-arquitetura-das-mecanicas.md#a-inteligência--o-leitor-de-anéis);
  no app, só a parte determinística age (escolha do próximo Broto, calibragem do Vendaval,
  sugestão de Enxerto).
- **Notificações**: exigem service worker + permissão; o teto de 2/dia e o formato contextual
  estão especificados, não implementados.
- **Bosque e Espelho** (party/duelo): dependem de backend.

## Verificação

`node build.js` empacota; o app foi exercitado de ponta a ponta em Chromium (Playwright):
5 telas, conclusão de Broto, Ciclo, Enxerto, compra de nó, Inclusão 3D, Selagem, fragmentação,
persistência após reload, e o invariante central — **gastar toda a Seiva não muda o Âmbar nem a
Camada**.
