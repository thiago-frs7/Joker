/**
 * Vocabulário do app, em um lugar só.
 * Tudo aqui é dado puro — nada importa Dexie, nada importa React.
 */

export const ATRIBUTOS = [
  'conhecimento',
  'comunicacao',
  'corpo',
  'consistencia',
  'persistencia',
  'social',
  'idiomas',
  'cultura',
  'exploracao',
] as const

export type AtributoId = (typeof ATRIBUTOS)[number]

export interface AtributoMeta {
  id: AtributoId
  nome: string
  glifo: string
  /** Usada em vazios de tela e na Ascensão. Fala do que o atributo significa na vida real. */
  sussurro: string
}

export const ATRIBUTO: Record<AtributoId, AtributoMeta> = {
  conhecimento: {
    id: 'conhecimento',
    nome: 'Conhecimento',
    glifo: '◈',
    sussurro: 'o que você estudou, leu, entendeu',
  },
  comunicacao: {
    id: 'comunicacao',
    nome: 'Comunicação',
    glifo: '❖',
    sussurro: 'escrever, falar, responder aquela mensagem',
  },
  corpo: { id: 'corpo', nome: 'Corpo', glifo: '⬢', sussurro: 'mover, comer, dormir, cuidar' },
  consistencia: {
    id: 'consistencia',
    nome: 'Consistência',
    glifo: '◉',
    sussurro: 'o que você faz de novo, mesmo sem vontade',
  },
  persistencia: {
    id: 'persistencia',
    nome: 'Persistência',
    glifo: '▲',
    sussurro: 'voltar ao que ficou pela metade',
  },
  social: { id: 'social', nome: 'Social', glifo: '◐', sussurro: 'pessoas, laços, presença' },
  idiomas: { id: 'idiomas', nome: 'Idiomas', glifo: '⌘', sussurro: 'outras línguas, outras cabeças' },
  cultura: {
    id: 'cultura',
    nome: 'Cultura',
    glifo: '✦',
    sussurro: 'histórias que você atravessou inteiras',
  },
  exploracao: {
    id: 'exploracao',
    nome: 'Exploração',
    glifo: '✧',
    sussurro: 'o inédito, o fora da rota, o que dá medinho',
  },
}

export type Energia = 'baixa' | 'media' | 'alta'

export interface EnergiaMeta {
  id: Energia
  nome: string
  /** Frase na primeira pessoa — é assim que o filtro se lê na tela. */
  frase: string
  /** Quantos "traços" a etiqueta acende. Tempo e esforço precisam de forma, não de número. */
  traços: number
}

export const ENERGIA: Record<Energia, EnergiaMeta> = {
  baixa: { id: 'baixa', nome: 'Pouca', frase: 'estou no fundo do poço', traços: 1 },
  media: { id: 'media', nome: 'Média', frase: 'dá pra levar', traços: 2 },
  alta: { id: 'alta', nome: 'Alta', frase: 'estou ligado', traços: 3 },
}

export const ORDEM_ENERGIA: Energia[] = ['baixa', 'media', 'alta']

export type EstadoObra = 'planejado' | 'andamento' | 'concluido' | 'abandonado'

export interface EstadoObraMeta {
  id: EstadoObra
  nome: string
  /** Verbo do botão que leva a este estado. */
  acao: string
}

export const ESTADO_OBRA: Record<EstadoObra, EstadoObraMeta> = {
  planejado: { id: 'planejado', nome: 'Na fila', acao: 'guardar na fila' },
  andamento: { id: 'andamento', nome: 'Em andamento', acao: 'comecei' },
  concluido: { id: 'concluido', nome: 'Concluído', acao: 'terminei' },
  // Sem penalidade, sem cor de alerta, sem "desistiu". Largar é uma decisão.
  abandonado: { id: 'abandonado', nome: 'Larguei', acao: 'larguei' },
}

export type TipoObra = 'anime' | 'livro' | 'jogo'

export interface TipoObraMeta {
  id: TipoObra
  nome: string
  plural: string
  atributo: AtributoId
  glifo: string
  unidade: string
}

export const TIPO_OBRA: Record<TipoObra, TipoObraMeta> = {
  anime: { id: 'anime', nome: 'Anime', plural: 'Animes', atributo: 'cultura', glifo: '▤', unidade: 'ep' },
  livro: { id: 'livro', nome: 'Livro', plural: 'Livros', atributo: 'conhecimento', glifo: '▥', unidade: 'pág' },
  jogo: { id: 'jogo', nome: 'Jogo', plural: 'Jogos', atributo: 'exploracao', glifo: '▦', unidade: '%' },
}
