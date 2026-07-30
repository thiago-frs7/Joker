import type { Contadores } from '../dados/db'
import { ATRIBUTOS, type AtributoId } from './tipos'
import { nivelAtributo } from './progressao'

/**
 * Troféus.
 *
 * Regras que valem para a lista inteira:
 * - Nenhum troféu depende de *não* falhar. Nenhum exige dias seguidos.
 * - Vários premiam exatamente o que o TDAH torna difícil: voltar ao abandonado,
 *   fatiar o grande demais, começar num dia ruim, e largar sem culpa.
 * - Bloqueado é visível e com a condição escrita. Curiosidade é combustível.
 */

export interface ContextoTrofeu {
  contadores: Contadores
  nivel: number
  momentum: number
  atributos: Record<AtributoId, number>
  obrasPorTipo: { anime: number; livro: number; jogo: number }
  obrasNoGrimorio: number
}

export interface Trofeu {
  id: string
  nome: string
  /** A condição, escrita para ser lida antes de ser cumprida. */
  condicao: string
  grupo: 'caminho' | 'cabeca' | 'grimorio' | 'ramos'
  glifo: string
  /** Quanto falta. Sempre em forma de fração — barra, não número solto. */
  medir: (c: ContextoTrofeu) => { atual: number; alvo: number }
}

const meta = (atual: number, alvo: number) => ({ atual: Math.min(atual, alvo), alvo })

export const TROFEUS: Trofeu[] = [
  /* ── o caminho ── */
  {
    id: 'primeira-alma',
    nome: 'Primeira Alma',
    condicao: 'Concluir uma missão. Qualquer uma.',
    grupo: 'caminho',
    glifo: '✦',
    medir: (c) => meta(c.contadores.missoes, 1),
  },
  {
    id: 'camada-5',
    nome: 'Quinta Camada',
    condicao: 'Chegar à camada 5.',
    grupo: 'caminho',
    glifo: '◈',
    medir: (c) => meta(c.nivel, 5),
  },
  {
    id: 'camada-10',
    nome: 'Décima Camada',
    condicao: 'Chegar à camada 10.',
    grupo: 'caminho',
    glifo: '◈',
    medir: (c) => meta(c.nivel, 10),
  },
  {
    id: 'camada-25',
    nome: 'Camada Profunda',
    condicao: 'Chegar à camada 25.',
    grupo: 'caminho',
    glifo: '❖',
    medir: (c) => meta(c.nivel, 25),
  },
  {
    id: 'cem-missoes',
    nome: 'Centena',
    condicao: 'Concluir 100 missões — do jeito que der, no tempo que for.',
    grupo: 'caminho',
    glifo: '▲',
    medir: (c) => meta(c.contadores.missoes, 100),
  },
  {
    id: 'passos-50',
    nome: 'Pé Ante Pé',
    condicao: 'Concluir 50 passos soltos. Metade também conta.',
    grupo: 'caminho',
    glifo: '⋯',
    medir: (c) => meta(c.contadores.passos, 50),
  },
  {
    id: 'incendio',
    nome: 'Incêndio',
    condicao: 'Levar o momentum a 70.',
    grupo: 'caminho',
    glifo: '❂',
    medir: (c) => meta(Math.round(c.momentum), 70),
  },

  /* ── a cabeça: o que o TDAH cobra caro ── */
  {
    id: 'ressurgencia',
    nome: 'Ressurgência',
    condicao: 'Concluir uma missão que ficou parada mais de duas semanas.',
    grupo: 'cabeca',
    glifo: '↺',
    medir: (c) => meta(c.contadores.retomadas, 1),
  },
  {
    id: 'necromante',
    nome: 'Necromante',
    condicao: 'Fazer isso 10 vezes: trazer de volta o que já tinha sumido.',
    grupo: 'cabeca',
    glifo: '↻',
    medir: (c) => meta(c.contadores.retomadas, 10),
  },
  {
    id: 'disseccao',
    nome: 'Dissecação',
    condicao: 'Quebrar uma missão em 5 passos ou mais.',
    grupo: 'cabeca',
    glifo: '⑃',
    medir: (c) => meta(c.contadores.quebraMaxima, 5),
  },
  {
    id: 'cirurgiao',
    nome: 'Cirurgião',
    condicao: 'Quebrar 15 missões em passos.',
    grupo: 'cabeca',
    glifo: '⑂',
    medir: (c) => meta(c.contadores.quebras, 15),
  },
  {
    id: 'dois-minutos',
    nome: 'Dois Minutos',
    condicao: 'Concluir 10 missões que tinham um primeiro passo declarado.',
    grupo: 'cabeca',
    glifo: '◔',
    medir: (c) => meta(c.contadores.primeirosPassos, 10),
  },
  {
    id: 'fundo-do-poco',
    nome: 'Fundo do Poço',
    condicao: 'Concluir 5 missões etiquetadas como pouca energia.',
    grupo: 'cabeca',
    glifo: '▁',
    medir: (c) => meta(c.contadores.baixaEnergia, 5),
  },
  {
    id: 'reacender',
    nome: 'Reacender',
    condicao: 'Concluir algo com o momentum quase apagado. Voltar conta.',
    grupo: 'cabeca',
    glifo: '⁂',
    medir: (c) => meta(c.contadores.reacendimentos, 1),
  },
  {
    id: 'mao-do-destino',
    nome: 'Mão do Destino',
    condicao: 'Concluir 10 missões que o app escolheu por você.',
    grupo: 'cabeca',
    glifo: '⚄',
    medir: (c) => meta(c.contadores.sorteiosConcluidos, 10),
  },
  {
    id: 'empurrao',
    nome: 'Empurrão',
    condicao: 'Empurrar 20 missões pra hoje. Adiar não é dívida.',
    grupo: 'cabeca',
    glifo: '»',
    medir: (c) => meta(c.contadores.adiamentos, 20),
  },
  {
    id: 'sem-vergonha',
    nome: 'Sem Vergonha',
    condicao: 'Largar uma obra no Grimório. Largar é decisão, não falha.',
    grupo: 'cabeca',
    glifo: '⌁',
    medir: (c) => meta(c.contadores.largadas, 1),
  },

  /* ── grimório ── */
  {
    id: 'estante',
    nome: 'Estante',
    condicao: 'Ter 25 obras registradas no Grimório.',
    grupo: 'grimorio',
    glifo: '▤',
    medir: (c) => meta(c.obrasNoGrimorio, 25),
  },
  {
    id: 'maratona',
    nome: 'Maratona',
    condicao: 'Concluir 10 animes.',
    grupo: 'grimorio',
    glifo: '▤',
    medir: (c) => meta(c.obrasPorTipo.anime, 10),
  },
  {
    id: 'devorador',
    nome: 'Devorador de Páginas',
    condicao: 'Concluir 10 livros.',
    grupo: 'grimorio',
    glifo: '▥',
    medir: (c) => meta(c.obrasPorTipo.livro, 10),
  },
  {
    id: 'creditos',
    nome: 'Créditos Finais',
    condicao: 'Zerar 10 jogos.',
    grupo: 'grimorio',
    glifo: '▦',
    medir: (c) => meta(c.obrasPorTipo.jogo, 10),
  },
  {
    id: 'platina',
    nome: 'Platina',
    condicao: 'Platinar um jogo.',
    grupo: 'grimorio',
    glifo: '◇',
    medir: (c) => meta(c.contadores.platinas, 1),
  },
  {
    id: 'cacador-de-platinas',
    nome: 'Caçador de Platinas',
    condicao: 'Platinar 5 jogos.',
    grupo: 'grimorio',
    glifo: '◆',
    medir: (c) => meta(c.contadores.platinas, 5),
  },
  {
    id: 'regra-propria',
    nome: 'Regra Própria',
    condicao: 'Concluir 10 desafios pessoais que você mesmo inventou.',
    grupo: 'grimorio',
    glifo: '✧',
    medir: (c) => meta(c.contadores.desafios, 10),
  },

  /* ── ramos ── */
  {
    id: 'ramo-forte',
    nome: 'Ramo Grosso',
    condicao: 'Levar qualquer atributo ao nível 10.',
    grupo: 'ramos',
    glifo: '⬢',
    medir: (c) => meta(Math.max(...ATRIBUTOS.map((a) => nivelAtributo(c.atributos[a]))), 10),
  },
  {
    id: 'equilibrio',
    nome: 'Copa Redonda',
    condicao: 'Ter todos os nove atributos no nível 3 ou mais.',
    grupo: 'ramos',
    glifo: '◉',
    medir: (c) => meta(ATRIBUTOS.filter((a) => nivelAtributo(c.atributos[a]) >= 3).length, 9),
  },
  {
    id: 'erudito',
    nome: 'Erudito',
    condicao: 'Levar Conhecimento ao nível 15.',
    grupo: 'ramos',
    glifo: '◈',
    medir: (c) => meta(nivelAtributo(c.atributos.conhecimento), 15),
  },
]

export const GRUPO_TROFEU: Record<Trofeu['grupo'], { nome: string; legenda: string }> = {
  caminho: { nome: 'O Caminho', legenda: 'distância percorrida' },
  cabeca: { nome: 'A Cabeça', legenda: 'o que custa mais caro por dentro' },
  grimorio: { nome: 'O Grimório', legenda: 'histórias atravessadas' },
  ramos: { nome: 'Os Ramos', legenda: 'atributos que engrossaram' },
}

export const trofeuPorId = new Map(TROFEUS.map((t) => [t.id, t]))

export function conquistados(ctx: ContextoTrofeu): string[] {
  return TROFEUS.filter((t) => {
    const { atual, alvo } = t.medir(ctx)
    return atual >= alvo
  }).map((t) => t.id)
}
