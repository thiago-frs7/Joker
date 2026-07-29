# 6. Checklist de acessibilidade TDAH

Cada item é uma **decisão de design concreta**, com o mecanismo de TDAH que a justifica.
Nenhum desses itens é configurável para "desligar" — eles são o produto.

---

## Iniciação (o degrau mais alto do TDAH)

- [x] **Um Broto por vez na tela Hoje.** Nunca uma lista. Disfunção executiva não é falta de
      vontade, é falta de *ponto de entrada* — o app entrega o ponto de entrada já escolhido.
- [x] **Toda tarefa nasce fatiada em 2–5 min.** Nada chega à tela Hoje sem estar quebrado. A
      fragmentação é automática, com verbos de início ("abrir", "separar", "escrever 3 linhas").
- [x] **O botão FEITO é o maior alvo tocável do app** (72 dp). O caminho de menor esforço é
      sempre o caminho do progresso.
- [x] **"Outro" e "depois" existem e não custam nada.** Trocar de tarefa é um comportamento
      previsto, não um desvio a ser corrigido.
- [x] **Nenhum campo obrigatório em lugar nenhum**, exceto o nome de uma obra. Teto absoluto de
      **2 campos**, inclusive no pior caso (API vazia + OCR falho).

## Recompensa (o déficit de dopamina é o problema real)

- [x] **Feedback em < 300 ms**, sempre: alvo de 120 ms para haptic + partícula, 300 ms para o
      número de Seiva flutuar. Otimista na UI, persistência depois.
- [x] **Números flutuantes de Seiva** que sobem e evaporam a cada ação — a recompensa é *vista*,
      não apenas contabilizada.
- [x] **Progresso rende Seiva, não só a conclusão.** 10 páginas valem algo. 10 minutos de jogo
      valem algo. Quem abandona 60% do que começa precisa ser pago pelo caminho.
- [x] **`Deixado ir` rende Seiva.** Desistir consciente é uma decisão executiva, e é premiada.
- [x] **Celebrações cinematográficas em 3 eventos** apenas (Camada, Inclusão, Anel) — raras o
      suficiente para não virarem ruído, com duração de 2,4 a 4 s e corte por toque.
- [x] **Fila de celebração:** nunca duas seguidas. A segunda espera o próximo abrir do app, para
      que a dopamina não sature.

## Ausência de punição (estrutural, não opcional)

- [x] **Impossível perder Camada.** Âmbar é uma soma append-only no banco. A promessa é garantida
      pelo schema, não pela boa intenção.
- [x] **Sem XP negativo. Sem multa. Sem dívida.** Não existe subtração no modelo econômico.
- [x] **Corrente congela, não zera.** Turvação cosmética por 3 dias, depois recua ao último marco
      (30/14/7/3), nunca a zero.
- [x] **Bruma:** 2 perdões automáticos por mês, gastos em silêncio. O usuário nem é informado.
- [x] **Crédito parcial matemático:** 40 min com 5 interrupções vale mais que 15 min perfeitos.
      A fórmula ensina que insistir mal vale mais que desistir cedo.
- [x] **Vendaval derrotado não custa nada** e recalibra para baixo na semana seguinte.
- [x] **Vocabulário proibido:** "atrasado", "pendente", "perdido", "falhou", "você não". Nenhuma
      string do app pode conter essas palavras dirigidas ao usuário.
- [x] **A poeira da Estufa limpa sozinha** no primeiro retorno. Voltar nunca começa com faxina.
- [x] **Retorno após 7+ dias abre na Estufa**, não na lista de tarefas. Reencontro antes de
      trabalho.
- [x] **Existe Fóssil por voltar** ("O Retorno da Seiva", 30+ dias parado). A recaída é
      literalmente uma conquista rastreada.

## Carga de decisão (paralisia de escolha)

- [x] **Zero dropdowns longos.** Máximo **4 opções visíveis** por decisão, sempre como chips ou
      carrossel.
- [x] **Dificuldade em 3 chips** (Leve/Média/Pesada), não em escala numérica.
- [x] **Estado da obra em 4 chips.** Prioridade e nota são opcionais e *posteriores*.
- [x] **A tela Árvore mostra 4 nós compráveis**, escolhidos pelo app, mesmo com 30 elegíveis.
- [x] **A classe não é escolhida — é revelada.** A Silhueta emerge do comportamento; zero
      decisão de build, zero medo de "errar o build".
- [x] **A Silhueta recalcula 1×/semana**, nunca em tempo real, para não gerar ansiedade de
      otimização.
- [x] **Máximo 3 resultados de busca** de mídia, com capa grande.

## Atenção e hiperfoco

- [x] **Silêncio automático:** detectado o flow (>12 min de uso contínuo sem troca de app), o
      app remove badges, abas, contadores e notificações. Retorno em fade de 400 ms.
- [x] **Selagem** com timer visual de resina escorrendo — tempo como matéria, não como número
      contando para baixo (contagem regressiva gera ansiedade).
- [x] **Selagem sugerida no tamanho que você aguenta.** Se suas sessões morrem em 18 min, o app
      passa a oferecer 15, não 25.
- [x] **Nenhuma notificação durante Selagem, Silêncio, ou nos 90 min seguintes.**

## Notificações e memória

- [x] **Teto rígido de 2 notificações/dia.** A segunda só se a primeira foi ignorada por 4 h.
- [x] **Zero badges no ícone.** Nunca, em nenhuma circunstância.
- [x] **100% contextual.** Proibido "não esqueça". Obrigatório citar a coisa real: *"o capítulo 84
      de Vinland Saga parou no meio de uma luta. 11 minutos."*
- [x] **Lembretes se movem para o seu horário real**, aprendido dos registros, sem pedir
      configuração.
- [x] **Memória externalizada:** o Estrato guarda mês a mês o que você fez, com ícones do que
      conquistou. Contra a amnésia de conquista ("eu não fiz nada esse ano").

## Carga cognitiva visual

- [x] **Nenhum bloco de texto acima de 3 linhas** em nenhuma tela. Sinopses são cortadas em 2.
- [x] **Barras de progresso de 8 dp**, grossas, com valor absoluto sempre visível.
- [x] **Uma cor saturada por tela** (âmbar). Todo o resto é papel e sombra — reduz a competição
      por atenção.
- [x] **Uma única identidade visual** e duas famílias tipográficas. Consistência absoluta reduz
      recarga de contexto a cada tela.
- [x] **Nada pisca, nada quica.** Todo movimento é viscoso e desacelerado.
- [x] **Hoje é fixa na primeira aba.** As outras 4 são reordenáveis, mas o ponto de retorno nunca
      se move.
- [x] **A Estufa não tem um único número** nem um único botão de tarefa. Existe um lugar no app
      sem cobrança nenhuma.

## Novidade (busca de estímulo)

- [x] **Pirilampo imprevisível** (~1 a cada 2 dias, janela aleatória) com missão secreta de 3 min,
      mudança de paleta por 24 h, ou uma lembrança do seu próprio passado.
- [x] **Estações trimestrais** com tema, Inclusões limitadas e paleta nova — o app muda de cara
      4× por ano sem que o usuário precise fazer nada.
- [x] **Fósseis Ocultos** invisíveis até 50% do critério: recompensam brincar com o app fora do
      trilho.
- [x] **Som próprio e irrepetível por Inclusão**, gerado a partir do seu ID.

## Acessibilidade sensorial e geral

- [x] **Haptics granulares** (leve/médio/pesado por tipo de evento) e desligáveis em bloco.
- [x] **Áudio 100% opcional**, com a UI totalmente funcional em silêncio.
- [x] **`prefers-reduced-motion` respeitado:** celebrações caem para *cross-fade* simples,
      mantendo a recompensa integral.
- [x] **Contraste AA mínimo em todo texto**, inclusive sobre a textura de papel.
- [x] **Modo claro desenhado à mão** (papel de carta), não uma inversão automática.
- [x] **Alvos de toque ≥ 48 dp**, com folga para tremor e pressa.
- [x] **Tudo offline.** Falta de rede nunca bloqueia registrar nada — e nada perdido na fila.
