import { ATRIBUTOS, type AtributoId, type Energia } from './tipos'

/**
 * Leitura de uma linha de texto livre.
 *
 * Nada aqui é obrigatório: quem digitar só "ligar pro dentista" recebe uma missão
 * válida com padrões razoáveis. O que for reconhecido vira etiqueta *visível* na
 * hora — o usuário nunca precisa adivinhar o que o parser entendeu.
 */

export interface Capturado {
  titulo: string
  primeiroPasso?: string
  atributo?: AtributoId
  energia?: Energia
  prazo?: number
  /** Pedaços consumidos do texto, para destacar no campo. */
  reconhecido: { texto: string; tipo: 'atributo' | 'energia' | 'prazo' }[]
}

const APELIDOS: Record<string, AtributoId> = {
  saude: 'corpo',
  treino: 'corpo',
  academia: 'corpo',
  comida: 'corpo',
  sono: 'corpo',
  estudo: 'conhecimento',
  estudar: 'conhecimento',
  ler: 'conhecimento',
  leitura: 'conhecimento',
  curso: 'conhecimento',
  trabalho: 'consistencia',
  casa: 'consistencia',
  rotina: 'consistencia',
  grana: 'consistencia',
  escrever: 'comunicacao',
  email: 'comunicacao',
  mensagem: 'comunicacao',
  ligar: 'comunicacao',
  amigos: 'social',
  familia: 'social',
  ingles: 'idiomas',
  japones: 'idiomas',
  idioma: 'idiomas',
  anime: 'cultura',
  filme: 'cultura',
  jogo: 'cultura',
  serie: 'cultura',
  novo: 'exploracao',
  aventura: 'exploracao',
  medo: 'persistencia',
  pendente: 'persistencia',
  atrasado: 'persistencia',
}

const DIAS: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
}

function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function inicioDoDia(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function hoje(): number {
  return inicioDoDia(Date.now())
}

function diasAFrente(n: number): number {
  return hoje() + n * 86_400_000
}

export function capturar(entrada: string, agora = Date.now()): Capturado {
  let texto = entrada.trim()
  const reconhecido: Capturado['reconhecido'] = []
  let atributo: AtributoId | undefined
  let energia: Energia | undefined
  let prazo: number | undefined

  // #atributo
  texto = texto.replace(/#([\p{L}]+)/gu, (todo, palavra: string) => {
    const chave = semAcento(palavra.toLowerCase())
    const achado = (ATRIBUTOS as readonly string[]).includes(chave)
      ? (chave as AtributoId)
      : APELIDOS[chave]
    if (achado) {
      atributo = achado
      reconhecido.push({ texto: todo, tipo: 'atributo' })
      return ''
    }
    return todo
  })

  // !energia
  texto = texto.replace(/!(baixa|media|média|alta)\b/giu, (todo, palavra: string) => {
    const chave = semAcento(palavra.toLowerCase())
    energia = chave === 'media' ? 'media' : (chave as Energia)
    reconhecido.push({ texto: todo, tipo: 'energia' })
    return ''
  })

  const marcarPrazo = (todo: string, valor: number) => {
    prazo = valor
    reconhecido.push({ texto: todo.trim(), tipo: 'prazo' })
    return ''
  }

  texto = texto.replace(/\bdepois de amanh[ãa]\b/giu, (t) => marcarPrazo(t, diasAFrente(2)))
  texto = texto.replace(/\bamanh[ãa]\b/giu, (t) => marcarPrazo(t, diasAFrente(1)))
  texto = texto.replace(/\bhoje\b/giu, (t) => marcarPrazo(t, hoje()))
  texto = texto.replace(/\bem (\d{1,3}) dias?\b/giu, (t, n: string) =>
    marcarPrazo(t, diasAFrente(parseInt(n, 10))),
  )
  texto = texto.replace(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g, (t, d: string, m: string, a?: string) => {
    const ano = a ? (a.length === 2 ? 2000 + +a : +a) : new Date(agora).getFullYear()
    const alvo = new Date(ano, +m - 1, +d)
    alvo.setHours(0, 0, 0, 0)
    // Data já passada sem ano explícito quase sempre quer dizer o ano que vem.
    if (!a && alvo.getTime() < hoje()) alvo.setFullYear(ano + 1)
    return marcarPrazo(t, alvo.getTime())
  })
  texto = texto.replace(
    /\b(?:na |nesta |essa |na pr[óo]xima |pr[óo]xima )?(domingo|segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado)(?:-feira)?\b/giu,
    (t, dia: string) => {
      const alvoDia = DIAS[semAcento(dia.toLowerCase())]
      const atual = new Date(hoje()).getDay()
      let delta = (alvoDia - atual + 7) % 7
      if (delta === 0) delta = 7
      return marcarPrazo(t, diasAFrente(delta))
    },
  )

  // "título > primeiro passo de 2 minutos".
  // O corte vem *depois* das etiquetas: quem escreve "#casa" no fim da frase
  // está etiquetando a missão, não batizando o primeiro passo.
  let primeiroPasso: string | undefined
  const corte = texto.indexOf('>')
  if (corte > 0) {
    primeiroPasso = limpar(texto.slice(corte + 1)) || undefined
    texto = texto.slice(0, corte)
  }

  return { titulo: limpar(texto), primeiroPasso, atributo, energia, prazo, reconhecido }
}

function limpar(s: string): string {
  return s.replace(/\s{2,}/g, ' ').replace(/\s+([,.;])/g, '$1').trim()
}

/**
 * Chute de atributo por palavras do próprio título, quando ninguém etiquetou nada.
 * Errar aqui é barato — o usuário troca em um toque — e acertar poupa uma decisão.
 */
export function palpiteDeAtributo(titulo: string): AtributoId {
  const t = semAcento(titulo.toLowerCase())
  for (const [palavra, atributo] of Object.entries(APELIDOS)) {
    if (new RegExp(`\\b${palavra}`, 'i').test(t)) return atributo
  }
  return 'consistencia'
}
