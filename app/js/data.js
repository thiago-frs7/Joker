/* ÂMBAR · base de dados semente
 * Tudo aqui funciona offline. As APIs (AniList, Open Library) são consultadas
 * quando há rede e o resultado é fundido neste catálogo; sem rede, este arquivo
 * é o catálogo. Ver docs/5-apis-e-importacao.md
 *
 * k    = tipo   · u = unidade de progresso · total = tamanho da obra
 * tags = grafo de síntese, usado para detectar Enxertos
 */

const RAMOS = [
  { id: 'corpo',   nome: 'Corpo',   glifo: '🜂', cor: '#C9622B' },
  { id: 'mente',   nome: 'Mente',   glifo: '🜄', cor: '#5C7FA3' },
  { id: 'oficio',  nome: 'Ofício',  glifo: '🜃', cor: '#8A6D3B' },
  { id: 'vinculo', nome: 'Vínculo', glifo: '🜁', cor: '#A0553F' },
  { id: 'cultura', nome: 'Cultura', glifo: '☾',  cor: '#7C6AA8' },
  { id: 'ordem',   nome: 'Ordem',   glifo: '☉',  cor: '#6E8B5E' },
];

/* Nós de talento: 3 na profundidade 1, bifurcação exclusiva na 2, depois 4/4/2.
 * custo(t) = 50 · 1,9^(t-1)  →  50 · 95 · 180 · 343 · 652 */
const NOS = {
  corpo: [
    { t: 1, n: 'Constância',     d: '+5% de Seiva em Ciclos de Corpo' },
    { t: 1, n: 'Fôlego',         d: '+5% de Seiva em Selagens longas' },
    { t: 1, n: 'Postura',        d: 'desbloqueia Ciclo diário extra' },
    { t: 2, n: 'Força',          d: 'bifurcação · caminho da carga', ramifica: true },
    { t: 2, n: 'Resistência',    d: 'bifurcação · caminho da distância', ramifica: true },
    { t: 3, n: 'Carga',          d: '+8% de Seiva em Brotos Pesados' },
    { t: 3, n: 'Explosão',       d: 'Brotos de 2 min rendem como 5 min' },
    { t: 3, n: 'Base',           d: 'a corrente congela por 4 dias, não 3' },
    { t: 3, n: 'Distância',      d: '+1 ficha de Bruma por mês' },
    { t: 4, n: 'Segundo Vento',  d: 'Selagem retomada mantém a pureza' },
    { t: 4, n: 'Pele de Casca',  d: 'Vendaval derrotado devolve 50 🩸' },
    { t: 4, n: 'Marcha',         d: '+10% de Seiva antes das 9h' },
    { t: 4, n: 'Tendão',         d: 'slot de Epíteto' },
    { t: 5, n: 'Corpo de Âmbar', d: 'Inclusão exclusiva: Escaravelho de Bronze' },
    { t: 5, n: 'Raiz Funda',     d: 'a corrente nunca recua abaixo de 7' },
  ],
  mente: [
    { t: 1, n: 'Atenção',        d: '+5% de Seiva em Selagens' },
    { t: 1, n: 'Curiosidade',    d: '+5% de Seiva no Herbário' },
    { t: 1, n: 'Memória',        d: 'o Estrato mostra o mês anterior lado a lado' },
    { t: 2, n: 'Análise',        d: 'bifurcação · caminho da profundidade', ramifica: true },
    { t: 2, n: 'Síntese',        d: 'bifurcação · caminho da conexão', ramifica: true },
    { t: 3, n: 'Recorte',        d: 'fragmenta tarefas em 5 Brotos, não 3' },
    { t: 3, n: 'Foco Frio',      d: 'Selagem de 60 min disponível' },
    { t: 3, n: 'Enxerto Duplo',  d: 'um Enxerto pode alimentar 2 Ramos' },
    { t: 3, n: 'Leitura Rápida', d: '+15% de Seiva por página' },
    { t: 4, n: 'Silêncio Fundo', d: 'Silêncio ativa em 6 min, não 12' },
    { t: 4, n: 'Marginália',     d: 'notas em Folhas rendem 5 🩸' },
    { t: 4, n: 'Índice',         d: 'slot de Epíteto' },
    { t: 4, n: 'Vigília',        d: '+20% de Seiva depois da meia-noite' },
    { t: 5, n: 'Mente de Vidro', d: 'Inclusão exclusiva: Traça de Prata' },
    { t: 5, n: 'Anel de Leitura',d: 'teto de Enxertos por Ramo vai a +40%' },
  ],
  oficio: [
    { t: 1, n: 'Mão Firme',      d: '+5% de Seiva em Brotos de Ofício' },
    { t: 1, n: 'Bancada',        d: 'Anéis aceitam 8 etapas, não 5' },
    { t: 1, n: 'Rascunho',       d: 'criar Broto por voz' },
    { t: 2, n: 'Precisão',       d: 'bifurcação · caminho do acabamento', ramifica: true },
    { t: 2, n: 'Volume',         d: 'bifurcação · caminho da quantidade', ramifica: true },
    { t: 3, n: 'Lixa',           d: 'etapa final de Anel rende 2×' },
    { t: 3, n: 'Molde',          d: 'duplica um Anel concluído como modelo' },
    { t: 3, n: 'Serial',         d: '+8% por Broto além do 3º no dia' },
    { t: 3, n: 'Encaixe',        d: 'dois Ciclos podem ser marcados juntos' },
    { t: 4, n: 'Assinatura',     d: 'slot de Epíteto' },
    { t: 4, n: 'Têmpera',        d: 'Vendaval rende +1 Fóssil de Casca' },
    { t: 4, n: 'Oficina',        d: '+10% de Seiva em dias de semana' },
    { t: 4, n: 'Aprendiz',       d: 'Bosque aceita 6 pessoas' },
    { t: 5, n: 'Mão de Cerne',   d: 'Inclusão exclusiva: Formiga-Ferreira' },
    { t: 5, n: 'Marca de Fogo',  d: 'Anel fechado concede Fóssil de Âmbar' },
  ],
  vinculo: [
    { t: 1, n: 'Presença',       d: '+5% de Seiva em Brotos de Vínculo' },
    { t: 1, n: 'Escuta',         d: 'Ciclos de Vínculo aceitam nota em 1 toque' },
    { t: 1, n: 'Convite',        d: 'desbloqueia Bosque (party)' },
    { t: 2, n: 'Confiança',      d: 'bifurcação · caminho do laço', ramifica: true },
    { t: 2, n: 'Alcance',        d: 'bifurcação · caminho da rede', ramifica: true },
    { t: 3, n: 'Elo',            d: 'Bosque divide 10% da Seiva do grupo' },
    { t: 3, n: 'Espelho',        d: 'desbloqueia duelo por melhora relativa' },
    { t: 3, n: 'Recado',         d: 'Pirilampo aparece 30% mais' },
    { t: 3, n: 'Mesa',           d: 'Enxerto compartilhado com o Bosque' },
    { t: 4, n: 'Nome',           d: 'slot de Epíteto' },
    { t: 4, n: 'Fogueira',       d: 'Vendaval em Bosque rende +100 🩸' },
    { t: 4, n: 'Herança',        d: 'Inclusão pode ser exibida a outros' },
    { t: 4, n: 'Fim de Semana',  d: '+15% de Seiva sábado e domingo' },
    { t: 5, n: 'Voz de Âmbar',   d: 'Inclusão exclusiva: Abelha-Mestra' },
    { t: 5, n: 'Raiz Comum',     d: 'o Bosque compartilha a corrente mais alta' },
  ],
  cultura: [
    { t: 1, n: 'Apetite',        d: '+5% de Seiva por obra prensada' },
    { t: 1, n: 'Repertório',     d: 'Herbário sugere a próxima obra' },
    { t: 1, n: 'Tradução',       d: 'obras em outro idioma rendem +20%' },
    { t: 2, n: 'Erudição',       d: 'bifurcação · caminho da profundidade', ramifica: true },
    { t: 2, n: 'Amplitude',      d: 'bifurcação · caminho da variedade', ramifica: true },
    { t: 3, n: 'Contexto',       d: 'Enxerto rende +3%, não +2%' },
    { t: 3, n: 'Cânone',         d: 'obras anteriores a 1950 rendem 2×' },
    { t: 3, n: 'Maratona',       d: '+10% ao prensar 2 obras na semana' },
    { t: 3, n: 'Deixar Ir',      d: '"Deixado ir" rende 25 🩸, não 10' },
    { t: 4, n: 'Curadoria',      d: 'slot de Epíteto' },
    { t: 4, n: 'Prancha',        d: 'Enxertos ganham página ilustrada dupla' },
    { t: 4, n: 'Vitrine',        d: 'Folha favorita vira moldura na Estufa' },
    { t: 4, n: 'Serão',         d: '+15% de Seiva depois das 21h' },
    { t: 5, n: 'Olho de Âmbar',  d: 'Inclusão exclusiva: Borboleta-Códice' },
    { t: 5, n: 'Herbário Vivo',  d: 'Enxertos detectados com 1 tag em comum' },
  ],
  ordem: [
    { t: 1, n: 'Ritmo',          d: '+5% de Seiva em todos os Ciclos' },
    { t: 1, n: 'Limpeza',        d: 'a poeira da Estufa nunca acumula' },
    { t: 1, n: 'Preparo',        d: 'o Broto de amanhã é escolhido hoje' },
    { t: 2, n: 'Disciplina',     d: 'bifurcação · caminho da corrente', ramifica: true },
    { t: 2, n: 'Flexibilidade',  d: 'bifurcação · caminho do perdão', ramifica: true },
    { t: 3, n: 'Elo de Ferro',   d: 'teto da corrente vai a 16 elos' },
    { t: 3, n: 'Marco',          d: 'a corrente recua para 14, no mínimo' },
    { t: 3, n: 'Bruma Densa',    d: '+2 fichas de Bruma por mês' },
    { t: 3, n: 'Retorno',        d: 'voltar após pausa rende 2× por 3 dias' },
    { t: 4, n: 'Ampulheta',      d: 'slot de Epíteto' },
    { t: 4, n: 'Calendário',     d: 'Vendaval mostra o HP da próxima semana' },
    { t: 4, n: 'Inventário',     d: 'Seiva investida pode ser realocada 1× por mês' },
    { t: 4, n: 'Manhã',          d: 'primeiro Broto do dia rende 2×' },
    { t: 5, n: 'Peso de Âmbar',  d: 'Inclusão exclusiva: Aranha-Relojoeira' },
    { t: 5, n: 'Estrato Firme',  d: 'a corrente nunca recua' },
  ],
};

/* ─── catálogo semente ───────────────────────────────────────────────────── */
const CATALOGO = [
  // mangá
  { t: 'Vinland Saga', k: 'manga', y: 2005, total: 220, u: 'cap', nota: 8.9, tags: ['japão','vikings','história','seinen','guerra','redenção'] },
  { t: 'Berserk', k: 'manga', y: 1989, total: 374, u: 'cap', nota: 9.5, tags: ['dark fantasy','medieval','seinen','trauma','guerra'] },
  { t: 'Vagabond', k: 'manga', y: 1998, total: 327, u: 'cap', nota: 9.2, tags: ['japão','samurai','história','seinen','bushidō','musashi'] },
  { t: 'Monster', k: 'manga', y: 1994, total: 162, u: 'cap', nota: 9.0, tags: ['thriller','alemanha','psicológico','seinen'] },
  { t: 'Blame!', k: 'manga', y: 1997, total: 65, u: 'cap', nota: 8.3, tags: ['sci-fi','ciberpunk','arquitetura','silêncio'] },
  { t: 'Oyasumi Punpun', k: 'manga', y: 2007, total: 147, u: 'cap', nota: 9.0, tags: ['drama','psicológico','juventude','japão'] },
  { t: 'Kingdom', k: 'manga', y: 2006, total: 800, u: 'cap', nota: 9.0, tags: ['china','história','guerra','estratégia','seinen'] },
  { t: 'Dorohedoro', k: 'manga', y: 2000, total: 167, u: 'cap', nota: 8.7, tags: ['dark fantasy','bizarro','magia','seinen'] },

  // anime
  { t: 'Mushishi', k: 'anime', y: 2005, total: 26, u: 'ep', nota: 8.7, tags: ['japão','folclore','natureza','contemplativo','episódico'] },
  { t: 'Cowboy Bebop', k: 'anime', y: 1998, total: 26, u: 'ep', nota: 8.8, tags: ['sci-fi','jazz','espaço','noir','solidão'] },
  { t: 'Ping Pong the Animation', k: 'anime', y: 2014, total: 11, u: 'ep', nota: 8.6, tags: ['esporte','juventude','japão','amizade'] },
  { t: 'Serial Experiments Lain', k: 'anime', y: 1998, total: 13, u: 'ep', nota: 8.2, tags: ['sci-fi','ciberpunk','identidade','psicológico','rede'] },
  { t: 'Vinland Saga (anime)', k: 'anime', y: 2019, total: 48, u: 'ep', nota: 8.7, tags: ['japão','vikings','história','guerra','redenção'] },
  { t: 'Shōwa Genroku Rakugo Shinjū', k: 'anime', y: 2016, total: 25, u: 'ep', nota: 8.6, tags: ['japão','história','teatro','drama','ofício'] },
  { t: 'Kaiba', k: 'anime', y: 2008, total: 12, u: 'ep', nota: 8.0, tags: ['sci-fi','memória','identidade','experimental'] },
  { t: 'Frieren', k: 'anime', y: 2023, total: 28, u: 'ep', nota: 9.0, tags: ['fantasia','tempo','luto','viagem','contemplativo'] },

  // jogos
  { t: 'Ghost of Tsushima', k: 'jogo', y: 2020, total: 45, u: 'h', nota: 8.3, tags: ['japão','samurai','história','bushidō','mongóis','mundo aberto'] },
  { t: 'Elden Ring', k: 'jogo', y: 2022, total: 90, u: 'h', nota: 9.6, tags: ['dark fantasy','medieval','mundo aberto','difícil','mito'] },
  { t: 'Sekiro', k: 'jogo', y: 2019, total: 35, u: 'h', nota: 9.2, tags: ['japão','samurai','sengoku','difícil','bushidō'] },
  { t: 'Hollow Knight', k: 'jogo', y: 2017, total: 40, u: 'h', nota: 9.0, tags: ['metroidvania','insetos','silêncio','difícil','ruínas'] },
  { t: 'Outer Wilds', k: 'jogo', y: 2019, total: 22, u: 'h', nota: 9.1, tags: ['sci-fi','espaço','tempo','descoberta','mistério'] },
  { t: 'Disco Elysium', k: 'jogo', y: 2019, total: 40, u: 'h', nota: 9.7, tags: ['rpg','política','psicológico','texto','noir'] },
  { t: 'Death Stranding', k: 'jogo', y: 2019, total: 60, u: 'h', nota: 8.2, tags: ['sci-fi','caminhada','solidão','conexão','pós-apocalipse'] },
  { t: 'Nier: Automata', k: 'jogo', y: 2017, total: 38, u: 'h', nota: 9.0, tags: ['sci-fi','existencial','androides','música','pós-apocalipse'] },
  { t: 'Kingdom Come: Deliverance', k: 'jogo', y: 2018, total: 70, u: 'h', nota: 8.0, tags: ['medieval','história','boêmia','simulação','difícil'] },
  { t: 'Subnautica', k: 'jogo', y: 2018, total: 40, u: 'h', nota: 8.7, tags: ['sobrevivência','oceano','sci-fi','medo','exploração'] },
  { t: 'Stardew Valley', k: 'jogo', y: 2016, total: 100, u: 'h', nota: 8.9, tags: ['fazenda','rotina','calmo','ciclos','comunidade'] },
  { t: 'Return of the Obra Dinn', k: 'jogo', y: 2018, total: 10, u: 'h', nota: 8.9, tags: ['mistério','dedução','navio','1800','monocromático'] },

  // livros
  { t: 'Musashi', a: 'Eiji Yoshikawa', k: 'livro', y: 1935, total: 970, u: 'pág', nota: 8.9, tags: ['japão','samurai','história','bushidō','musashi','jornada'] },
  { t: 'Hagakure', a: 'Yamamoto Tsunetomo', k: 'livro', y: 1716, total: 180, u: 'pág', nota: 7.8, tags: ['japão','samurai','filosofia','bushidō','morte'] },
  { t: 'O Livro dos Cinco Anéis', a: 'Miyamoto Musashi', k: 'livro', y: 1645, total: 120, u: 'pág', nota: 8.1, tags: ['japão','samurai','estratégia','bushidō','musashi'] },
  { t: 'Duna', a: 'Frank Herbert', k: 'livro', y: 1965, total: 680, u: 'pág', nota: 9.0, tags: ['sci-fi','deserto','política','ecologia','messias'] },
  { t: 'Meditações', a: 'Marco Aurélio', k: 'livro', y: 180, total: 250, u: 'pág', nota: 8.6, tags: ['filosofia','estoicismo','roma','disciplina','morte'] },
  { t: 'O Elogio da Sombra', a: 'Junichirō Tanizaki', k: 'livro', y: 1933, total: 96, u: 'pág', nota: 8.2, tags: ['japão','estética','arquitetura','luz','ensaio'] },
  { t: 'Sapiens', a: 'Yuval Noah Harari', k: 'livro', y: 2011, total: 464, u: 'pág', nota: 8.1, tags: ['história','antropologia','ensaio','humanidade'] },
  { t: 'A Guerra do Fim do Mundo', a: 'Mario Vargas Llosa', k: 'livro', y: 1981, total: 640, u: 'pág', nota: 8.7, tags: ['brasil','história','guerra','sertão','fanatismo'] },
  { t: 'Grande Sertão: Veredas', a: 'João Guimarães Rosa', k: 'livro', y: 1956, total: 624, u: 'pág', nota: 9.1, tags: ['brasil','sertão','linguagem','jornada','pacto'] },
  { t: 'O Nome do Vento', a: 'Patrick Rothfuss', k: 'livro', y: 2007, total: 662, u: 'pág', nota: 8.5, tags: ['fantasia','música','universidade','narrador'] },
  { t: 'Neuromancer', a: 'William Gibson', k: 'livro', y: 1984, total: 320, u: 'pág', nota: 8.0, tags: ['sci-fi','ciberpunk','rede','japão','noir'] },
  { t: 'O Corpo Fala com o Cérebro', a: 'Antonio Damasio', k: 'livro', y: 1994, total: 336, u: 'pág', nota: 8.0, tags: ['neurociência','emoção','ensaio','corpo'] },
  { t: 'Hábitos Atômicos', a: 'James Clear', k: 'livro', y: 2018, total: 320, u: 'pág', nota: 7.9, tags: ['hábitos','comportamento','produtividade','ensaio'] },
  { t: 'Fora de Série', a: 'Malcolm Gladwell', k: 'livro', y: 2008, total: 288, u: 'pág', nota: 7.5, tags: ['comportamento','prática','ensaio','sucesso'] },
  { t: 'A Montanha Mágica', a: 'Thomas Mann', k: 'livro', y: 1924, total: 928, u: 'pág', nota: 8.8, tags: ['alemanha','tempo','doença','filosofia','montanha'] },
  { t: 'O Deserto dos Tártaros', a: 'Dino Buzzati', k: 'livro', y: 1940, total: 224, u: 'pág', nota: 8.6, tags: ['espera','tempo','fortaleza','existencial'] },

  // filmes
  { t: 'Sete Samurais', k: 'filme', y: 1954, total: 207, u: 'min', nota: 9.0, tags: ['japão','samurai','história','kurosawa','aldeia'] },
  { t: 'Ran', k: 'filme', y: 1985, total: 162, u: 'min', nota: 8.2, tags: ['japão','samurai','kurosawa','shakespeare','guerra'] },
  { t: 'Blade Runner 2049', k: 'filme', y: 2017, total: 164, u: 'min', nota: 8.0, tags: ['sci-fi','ciberpunk','identidade','noir','memória'] },
  { t: 'Stalker', k: 'filme', y: 1979, total: 162, u: 'min', nota: 8.1, tags: ['sci-fi','zona','contemplativo','fé','tarkovsky'] },
  { t: 'Perfect Days', k: 'filme', y: 2023, total: 124, u: 'min', nota: 7.9, tags: ['japão','rotina','contemplativo','tóquio','ciclos'] },
  { t: 'Cidade de Deus', k: 'filme', y: 2002, total: 130, u: 'min', nota: 8.6, tags: ['brasil','favela','violência','juventude'] },
  { t: 'O Auto da Compadecida', k: 'filme', y: 2000, total: 104, u: 'min', nota: 8.6, tags: ['brasil','sertão','comédia','fé','folclore'] },
  { t: 'Whiplash', k: 'filme', y: 2014, total: 106, u: 'min', nota: 8.5, tags: ['música','obsessão','disciplina','ofício'] },

  // séries
  { t: 'Shōgun', k: 'serie', y: 2024, total: 10, u: 'ep', nota: 8.6, tags: ['japão','história','samurai','política','sengoku'] },
  { t: 'Chernobyl', k: 'serie', y: 2019, total: 5, u: 'ep', nota: 9.3, tags: ['história','urss','desastre','burocracia','verdade'] },
  { t: 'Dark', k: 'serie', y: 2017, total: 26, u: 'ep', nota: 8.7, tags: ['sci-fi','tempo','alemanha','família','ciclos'] },
  { t: 'Severance', k: 'serie', y: 2022, total: 19, u: 'ep', nota: 8.7, tags: ['sci-fi','trabalho','memória','identidade','burocracia'] },
  { t: 'Cosmos', k: 'serie', y: 1980, total: 13, u: 'ep', nota: 9.3, tags: ['ciência','espaço','divulgação','maravilhamento'] },

  // álbuns
  { t: 'Clube da Esquina', a: 'Milton Nascimento', k: 'album', y: 1972, total: 1, u: 'escuta', nota: 9.4, tags: ['brasil','mpb','minas','coletivo'] },
  { t: 'Kid A', a: 'Radiohead', k: 'album', y: 2000, total: 1, u: 'escuta', nota: 9.0, tags: ['eletrônico','alienação','experimental'] },
  { t: 'Nier: Automata OST', a: 'Keiichi Okabe', k: 'album', y: 2017, total: 1, u: 'escuta', nota: 9.2, tags: ['trilha sonora','sci-fi','existencial','coral'] },
  { t: 'Tim Maia Racional Vol. 1', a: 'Tim Maia', k: 'album', y: 1975, total: 1, u: 'escuta', nota: 8.9, tags: ['brasil','soul','fé','racional'] },
  { t: 'Music for Airports', a: 'Brian Eno', k: 'album', y: 1978, total: 1, u: 'escuta', nota: 8.7, tags: ['ambiente','silêncio','contemplativo','espera'] },
];

/* Enxertos curados: pares nomeados à mão, com bônus dobrado e Fóssil.
 * Os demais Enxertos são detectados automaticamente por ≥2 tags em comum. */
const ENXERTOS_CURADOS = [
  { a: 'Musashi', b: 'Ghost of Tsushima', nome: 'Bushidō Vivido', ramo: 'cultura',
    txt: 'Você leu o caminho e depois o andou. A espada deixou de ser metáfora.' },
  { a: 'O Livro dos Cinco Anéis', b: 'Sekiro', nome: 'Postura de Água', ramo: 'corpo',
    txt: 'Estratégia escrita em 1645, executada com o polegar em 2019.' },
  { a: 'Hagakure', b: 'Vagabond', nome: 'Morte Diária', ramo: 'ordem',
    txt: 'Duas leituras da mesma frase: o samurai já está morto.' },
  { a: 'Duna', b: 'Subnautica', nome: 'Ecologia do Medo', ramo: 'mente',
    txt: 'Deserto e oceano são o mesmo problema: um lugar que não te quer.' },
  { a: 'Neuromancer', b: 'Serial Experiments Lain', nome: 'Fio de Cobre', ramo: 'mente',
    txt: 'O ciberespaço saiu do livro e virou solidão em 13 episódios.' },
  { a: 'Meditações', b: 'Hábitos Atômicos', nome: 'Roma Cotidiana', ramo: 'ordem',
    txt: 'Dois mil anos separam os livros. O conselho é o mesmo: hoje.' },
  { a: 'Grande Sertão: Veredas', b: 'A Guerra do Fim do Mundo', nome: 'Sertão em Chamas', ramo: 'cultura',
    txt: 'O mesmo chão, dois pactos: um com o diabo, outro com o fim do mundo.' },
  { a: 'Sete Samurais', b: 'Kingdom', nome: 'Aldeia e Império', ramo: 'vinculo',
    txt: 'Sete homens para uma aldeia; um exército para a China. A escala muda, a tática não.' },
  { a: 'Whiplash', b: 'Shōwa Genroku Rakugo Shinjū', nome: 'Ofício que Dói', ramo: 'oficio',
    txt: 'Duas histórias sobre o preço exato da excelência.' },
  { a: 'Perfect Days', b: 'Mushishi', nome: 'Dias Iguais', ramo: 'ordem',
    txt: 'A repetição como forma de atenção, não como prisão.' },
  { a: 'Berserk', b: 'Elden Ring', nome: 'Eclipse Dourado', ramo: 'cultura',
    txt: 'Um mangá de 1989 desenhando o mundo que você jogou em 2022.' },
  { a: 'Outer Wilds', b: 'Frieren', nome: 'Tempo Emprestado', ramo: 'mente',
    txt: 'Vinte e dois minutos e mil anos: as duas formas de olhar um relógio.' },
];

/* Inclusões · artefato vivo em 3 estágios. desbl = predicado sobre o estado */
const INCLUSOES = [
  { id: 'escaravelho', nome: 'Escaravelho de Bronze', ramo: 'corpo',  bicho: 'beetle',
    lore: 'Rolou a mesma pedra por tanto tempo que a pedra virou sol.',
    desbl: (s) => s.ciclosFeitos >= 10, dica: 'cumpra 10 Ciclos' },
  { id: 'traca', nome: 'Traça de Prata', ramo: 'mente', bicho: 'moth',
    lore: 'Come páginas e devolve pó luminoso.',
    desbl: (s) => s.folhasPrensadas >= 3, dica: 'prense 3 obras' },
  { id: 'formiga', nome: 'Formiga-Ferreira', ramo: 'oficio', bicho: 'ant',
    lore: 'Carrega quinze vezes o próprio peso e nunca menciona isso.',
    desbl: (s) => s.brotosFeitos >= 25, dica: 'conclua 25 Brotos' },
  { id: 'abelha', nome: 'Abelha-Mestra', ramo: 'vinculo', bicho: 'bee',
    lore: 'Não faz mel sozinha. Nunca fez.',
    desbl: (s) => s.enxertos >= 1, dica: 'faça 1 Enxerto' },
  { id: 'borboleta', nome: 'Borboleta-Códice', ramo: 'cultura', bicho: 'butterfly',
    lore: 'As asas são duas páginas do mesmo livro, abertas ao meio.',
    desbl: (s) => s.folhasPrensadas >= 8, dica: 'prense 8 obras' },
  { id: 'aranha', nome: 'Aranha-Relojoeira', ramo: 'ordem', bicho: 'spider',
    lore: 'Refaz a teia toda noite. Nunca reclamou da noite anterior.',
    desbl: (s) => s.elosMax >= 7, dica: 'alcance 7 elos de corrente' },
  { id: 'semente', nome: 'Semente Adormecida', ramo: 'ordem', bicho: 'seed',
    lore: 'Esperou quarenta mil anos. Ainda germina.',
    desbl: (s) => s.diasRetorno >= 1, dica: 'volte depois de uma pausa' },
  { id: 'pena', nome: 'Pena de Corvo', ramo: 'mente', bicho: 'feather',
    lore: 'Caiu de algo que estava indo embora.',
    desbl: (s) => s.selagens >= 5, dica: 'complete 5 Selagens' },
  { id: 'libelula', nome: 'Libélula de Estio', ramo: 'corpo', bicho: 'dragonfly',
    lore: 'Vive um dia inteiro como se fosse suficiente. E é.',
    desbl: (s) => s.vendavaisVencidos >= 1, dica: 'vença 1 Vendaval' },
  { id: 'vagalume', nome: 'Pirilampo Preso', ramo: 'vinculo', bicho: 'firefly',
    lore: 'Aceitou ficar. Ninguém pediu.',
    desbl: (s) => s.lampoAtendidos >= 3, dica: 'atenda o Pirilampo 3 vezes' },
  { id: 'folhaoro', nome: 'Folha de Ouro', ramo: 'cultura', bicho: 'leaf',
    lore: 'Caiu no outono errado e endureceu antes de tocar o chão.',
    desbl: (s) => s.camada >= 10, dica: 'alcance a Camada 10' },
  { id: 'anelcerne', nome: 'Anel de Cerne', ramo: 'oficio', bicho: 'ring',
    lore: 'Um ano inteiro comprimido em três milímetros.',
    desbl: (s) => s.aneisFechados >= 1, dica: 'feche 1 Anel' },
];

/* Fósseis · troféus. oculto = só aparece com 50% do critério cumprido */
const FOSSEIS = [
  { id: 'f1',  nome: 'Primeira Gota',      r: 'casca', d: 'seu primeiro registro',              p: (s) => s.acoes >= 1 },
  { id: 'f2',  nome: 'Três Elos',          r: 'casca', d: '3 dias seguidos de Ciclo',            p: (s) => s.elosMax >= 3 },
  { id: 'f3',  nome: 'Primeira Folha',     r: 'casca', d: 'uma obra prensada',                   p: (s) => s.folhasPrensadas >= 1 },
  { id: 'f4',  nome: 'Resina Fresca',      r: 'casca', d: 'uma Selagem concluída',               p: (s) => s.selagens >= 1 },
  { id: 'f5',  nome: 'Mão de Ferreiro',    r: 'cerne', d: '50 Brotos concluídos',                p: (s) => s.brotosFeitos >= 50 },
  { id: 'f6',  nome: 'Doze Elos',          r: 'cerne', d: 'corrente de 12 elos',                 p: (s) => s.elosMax >= 12 },
  { id: 'f7',  nome: 'Tempestade Vencida', r: 'cerne', d: 'um Vendaval derrotado',               p: (s) => s.vendavaisVencidos >= 1 },
  { id: 'f8',  nome: 'O Retorno da Seiva', r: 'cerne', d: 'voltar depois de 30 dias parado',     p: (s) => s.maiorPausa >= 30 },
  { id: 'f9',  nome: 'Enxertador',         r: 'cerne', d: 'um Enxerto realizado',                p: (s) => s.enxertos >= 1 },
  { id: 'f10', nome: 'Camada Dez',         r: 'cerne', d: 'alcançar a Camada 10',                p: (s) => s.camada >= 10 },
  { id: 'f11', nome: 'Herbário Cheio',     r: 'ambar', d: '25 obras prensadas',                  p: (s) => s.folhasPrensadas >= 25 },
  { id: 'f12', nome: 'Copa Definida',      r: 'ambar', d: 'ter uma Silhueta revelada',           p: (s) => !!s.silhuetaDefinida },
  { id: 'f13', nome: 'Anel de Crescimento',r: 'ambar', d: 'fechar um Anel completo',             p: (s) => s.aneisFechados >= 1 },
  { id: 'f14', nome: 'Cinco Vivas',        r: 'ambar', d: '5 Inclusões despertas',               p: (s) => s.inclusoesDespertas >= 5 },
  { id: 'f15', nome: 'Estrato Fundo',      r: 'ambar', d: 'alcançar a Camada 30',                p: (s) => s.camada >= 30 },
  { id: 'f16', nome: 'Ambarista',          r: 'prisma',d: '3 Podas e 5 Inclusões Plenas',        p: (s) => s.podas >= 3 && s.inclusoesPlenas >= 5 },
  // ocultos
  { id: 'o1', nome: 'Leitor Noturno',   r: 'ambar',  d: 'uma Selagem limpa depois das 3h',     p: (s) => s.selagemMadrugada, oculto: true, meia: 'algo acontece quando a cidade dorme' },
  { id: 'o2', nome: 'Língua Estranha',  r: 'ambar',  d: 'prensar obra em outro idioma',        p: (s) => s.obraEstrangeira,  oculto: true, meia: 'o Herbário aceita mais de um idioma' },
  { id: 'o3', nome: 'Deixar Ir',        r: 'cerne',  d: 'abandonar 3 obras consciente',        p: (s) => s.deixadas >= 3,    oculto: true, meia: 'parar também é uma decisão' },
  { id: 'o4', nome: 'Amigo do Lampo',   r: 'prisma', d: 'atender o Pirilampo 10 vezes',        p: (s) => s.lampoAtendidos >= 10, oculto: true, meia: 'ele repara em quem repara nele' },
  { id: 'o5', nome: 'Uma Coisa Só',     r: 'ambar',  d: 'uma Selagem de 40 min sem interrupção',p: (s) => s.selagemPerfeita,  oculto: true, meia: 'quarenta minutos inteiros existem' },
];

const EPITETOS = [
  { id: 'e1', nome: 'O Insone',      d: 'lembretes migram para a madrugada · +10% depois das 0h', req: (s) => s.selagemMadrugada },
  { id: 'e2', nome: 'O Constante',   d: '+5% de Seiva em Ciclos',                                 req: (s) => s.elosMax >= 12 },
  { id: 'e3', nome: 'O Enxertador',  d: 'Enxertos rendem +1%',                                    req: (s) => s.enxertos >= 3 },
  { id: 'e4', nome: 'O Que Voltou',  d: '+15% por 3 dias após qualquer pausa',                    req: (s) => s.maiorPausa >= 7 },
  { id: 'e5', nome: 'O Curioso',     d: '+5% no Herbário',                                        req: (s) => s.folhasPrensadas >= 10 },
  { id: 'e6', nome: 'O Prensador',   d: 'obras curtas rendem +20%',                               req: (s) => s.folhasPrensadas >= 20 },
];

const SILHUETAS = {
  'corpo+ordem':     { nome: 'Monge de Pedra',        b: '+6% em Ciclos antes das 9h' },
  'mente+cultura':   { nome: 'Erudito das Marés',     b: '+6% por página lida' },
  'oficio+ordem':    { nome: 'Ferreiro Silencioso',   b: '+6% em etapas de Anel' },
  'cultura+vinculo': { nome: 'Contador de Histórias', b: '+6% ao prensar obras' },
  'corpo+vinculo':   { nome: 'Guardião do Bosque',    b: '+6% em Vendavais' },
  'mente+oficio':    { nome: 'Alquimista Prático',    b: '+6% em Selagens' },
  'corpo+mente':     { nome: 'Asceta de Vidro',       b: '+6% em Brotos Pesados' },
  'oficio+cultura':  { nome: 'Artesão de Margens',    b: '+6% em Enxertos' },
  'vinculo+ordem':   { nome: 'Guardião da Casa',      b: '+6% em Ciclos de Vínculo' },
  'mente+ordem':     { nome: 'Cartógrafo Paciente',   b: '+6% no primeiro Broto do dia' },
  'corpo+cultura':   { nome: 'Peregrino',             b: '+6% em fins de semana' },
  'oficio+vinculo':  { nome: 'Mestre de Obras',       b: '+6% em Bosque' },
};

const ESTACOES = [
  { id: 'brotacao', nome: 'Brotação', tema: 'o que começa mesmo sem garantia', acento: '#8FA85C', meses: [8, 9, 10] },
  { id: 'estio',    nome: 'Estio',    tema: 'resistir ao que não dá trégua',    acento: '#D98A2B', meses: [11, 0, 1] },
  { id: 'resina',   nome: 'Resina',   tema: 'fixar o que estava escorrendo',    acento: '#E8A33D', meses: [2, 3, 4] },
  { id: 'repouso',  nome: 'Repouso',  tema: 'a raiz trabalha no escuro',        acento: '#6F7FA3', meses: [5, 6, 7] },
];

/* Verbos de início usados na fragmentação automática em Brotos */
const FRAGMENTOS = [
  { v: 'abrir',    m: 'abrir %s e não fazer mais nada',        min: 2 },
  { v: 'separar',  m: 'separar o que precisa para %s',         min: 3 },
  { v: 'escrever', m: 'escrever 3 linhas sobre %s',            min: 4 },
  { v: 'listar',   m: 'listar o primeiro passo de %s',         min: 2 },
  { v: 'tocar',    m: 'passar 5 minutos em %s e parar',        min: 5 },
];

const CICLOS_SEMENTE = [
  { id: 'c1', nome: 'Ler 10 páginas',    ramo: 'cultura', glifo: '☾', dif: 1.0 },
  { id: 'c2', nome: 'Mover o corpo',     ramo: 'corpo',   glifo: '🜂', dif: 1.5 },
  { id: 'c3', nome: 'Beber água',        ramo: 'corpo',   glifo: '🜄', dif: 1.0 },
];

const ANEIS_SEMENTE = [
  { id: 'an1', nome: 'Terminar Vinland Saga', ramo: 'cultura',
    etapas: ['chegar ao capítulo 100', 'chegar ao capítulo 150', 'chegar ao capítulo 200', 'prensar a obra'] },
];

window.DB = { RAMOS, NOS, CATALOGO, ENXERTOS_CURADOS, INCLUSOES, FOSSEIS, EPITETOS,
              SILHUETAS, ESTACOES, FRAGMENTOS, CICLOS_SEMENTE, ANEIS_SEMENTE };
