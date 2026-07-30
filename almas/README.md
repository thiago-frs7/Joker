# ALMAS

> RPG da vida real desenhado para o funcionamento cognitivo do TDAH.
> Carrega a memória por você, tira o atrito de começar, devolve recompensa na hora — e nunca pune.

```bash
cd almas
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/ (PWA instalável, funciona offline)
npm run preview  # serve o dist
```

Sem onboarding, sem conta, sem servidor. Abre pronto para usar.

---

## As regras que o código garante

Não são promessas de interface — são propriedades do código:

1. **Nada é retirado.** Não existe nenhuma função em `src/dominio/progressao.ts` que subtraia
   Almas, camada ou momentum. Desmarcar uma missão concluída devolve ela à lista e **mantém**
   as Almas. Não há caminho para perder.
2. **Momentum no lugar de streak.** Decaimento exponencial com meia-vida de 9 dias: tende a zero
   sem nunca chegar, e qualquer ação recoloca você na curva. Nenhum contador de dias perdidos.
3. **Atraso é neutro.** Missão vencida não fica vermelha, não sobe no topo e não muda a ordem da
   lista. Ganha um marcador discreto e um botão de "empurrar pra hoje" — que, em vez de culpa,
   conta para o troféu *Empurrão*.
4. **Largar é decisão.** No Grimório, `abandonado` é um estado com o mesmo peso visual dos outros
   e **paga Almas** — fechar um ciclo aberto libera memória de trabalho. Tem troféu por isso.

## Arquitetura

```
src/
  dominio/       matemática e regras puras — nada importa Dexie, nada importa React
    tipos.ts         vocabulário: atributos, energia, estados
    progressao.ts    Almas, camadas, multiplicador, momentum
    captura.ts       leitura de uma linha de texto livre
    trofeus.ts       27 troféus como dados + função de medição
  dados/         persistência e efeitos
    db.ts            esquema Dexie (IndexedDB)
    acoes.ts         toda escrita passa por aqui: pulso primeiro, banco depois
    pulso.ts         canal de recompensa (o que faz o feedback sair em <100ms)
    backup.ts        export/import JSON
    apis.ts          Jikan, Google Books, RAWG
  estado/hooks.ts    useLiveQuery + contagem animada + atalhos
  ui/                peças reutilizáveis; BarraDeAlmas é a assinatura
  telas/             Núcleo, Missões, Grimório, Ascensão, Troféus, Ajustes
```

### Por que a recompensa é rápida

`acoes.ts` tem um contrato: **primeiro o pulso, depois o banco**. Quem conclui algo emite o ganho
no canal síncrono (`canalGanho`) antes de qualquer `await`, então o número voa, a barra cresce e o
selo pulsa enquanto o IndexedDB ainda está escrevendo. O `useLiveQuery` reconcilia depois. O nível
usado para o multiplicador vem de um cache em memória do perfil, mantido pelo `usePerfil`.

## Progressão

| | fórmula |
|---|---|
| Almas para a camada *n* | `50 · (n-1)^1.7` |
| Multiplicador de ganho | `1 + (n-1) · 0.12` |
| Nível de atributo | `⌊(almas / 26)^(1/1.55)⌋` |
| Momentum | `m · 0.5^(dias/9)`, teto 100, ganho com retorno decrescente |

Ganhos base: passo 5 · missão 16 (+4 se tinha primeiro passo declarado, +5 se era de pouca
energia) · quebrar em passos 6 · obra 26–34 · largar 8 · platina 90 · troféu 40.

## Captura

Um campo. `Enter` salva e **continua aberto** — despejar cinco coisas seguidas é o caso comum.
Tudo abaixo é opcional e aparece como etiqueta visível assim que é reconhecido:

```
ligar pro dentista amanhã #saude !baixa > procurar o número na agenda
└─ título ────────────┘ └prazo┘ └atr.┘ └energ┘ └─ primeiro passo de 2 minutos ─┘
```

Também entende `hoje`, `sexta`, `em 3 dias`, `12/08`, e chuta o atributo pelas palavras do título
quando ninguém etiquetou nada.

## Dados

IndexedDB via Dexie. **Nada sai do navegador** — nenhum servidor, nenhuma conta. Isso significa
que limpar os dados do site apaga tudo, e por isso o app tem exportação de JSON completo em
Ajustes e cobra um backup a cada 30 dias com um aviso discreto (não bloqueante). A importação
mostra o que o arquivo contém antes de substituir.

## APIs externas

| tipo | fonte | chave |
|---|---|---|
| anime | [Jikan](https://jikan.moe) (MyAnimeList) | não precisa |
| livros | Google Books | não precisa |
| jogos | [RAWG](https://rawg.io/apidocs) | precisa — cole em Ajustes |

Sem chave da RAWG, o Grimório continua inteiro: dá para cadastrar na mão com capa por URL. Se
qualquer busca falhar, a tela diz o que houve e oferece o cadastro manual — a estante nunca fica
refém da rede. As capas já vistas ficam em cache do service worker para a estante ter rosto offline.

## Acessibilidade

- Contraste mínimo de 4.5:1 em todo texto sobre o fundo.
- Alvos de toque de 44px (utilitário `.toque`).
- `prefers-reduced-motion` respeitado sem depender de configuração.
- **Modo calmo**: esfria o acento, aproxima as superfícies, desliga toda animação, aumenta a
  entrelinha e reduz o Núcleo a um único "depois disso". Nenhuma função some.
- Navegação editável: renomear, reordenar e esconder abas (nunca todas).
