import type { Obra } from './db'
import type { TipoObra } from '../dominio/tipos'

/**
 * Busca externa do Grimório.
 *
 * Três fontes, três regras diferentes de acesso — e o app não pode quebrar por
 * causa disso. Se a rede cair, se a chave não existir ou se a API mudar de
 * humor, a tela oferece o cadastro manual e segue funcionando.
 */

export interface Achado {
  fonte: Obra['fonte']
  fonteId: string
  titulo: string
  capa?: string
  autoria?: string
  ano?: number
  total?: number
  sinopse?: string
}

const TEMPO_LIMITE = 8000

async function pegar(url: string): Promise<unknown> {
  const controle = new AbortController()
  const t = setTimeout(() => controle.abort(), TEMPO_LIMITE)
  try {
    const r = await fetch(url, { signal: controle.signal })
    if (!r.ok) throw new Error(`resposta ${r.status}`)
    return await r.json()
  } finally {
    clearTimeout(t)
  }
}

/* ─────────────────────────────── anime ────────────────────────────────── */

interface RespostaJikan {
  data?: {
    mal_id: number
    title: string
    title_english?: string | null
    images?: { webp?: { image_url?: string }; jpg?: { image_url?: string } }
    episodes?: number | null
    year?: number | null
    studios?: { name: string }[]
    synopsis?: string | null
  }[]
}

export async function buscarAnime(termo: string): Promise<Achado[]> {
  const r = (await pegar(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(termo)}&limit=10&sfw=true&order_by=members&sort=desc`,
  )) as RespostaJikan
  return (r.data ?? []).map((a) => ({
    fonte: 'jikan' as const,
    fonteId: String(a.mal_id),
    titulo: a.title_english || a.title,
    capa: a.images?.webp?.image_url ?? a.images?.jpg?.image_url,
    autoria: a.studios?.[0]?.name,
    ano: a.year ?? undefined,
    total: a.episodes ?? undefined,
    sinopse: a.synopsis ?? undefined,
  }))
}

/* ─────────────────────────────── livros ───────────────────────────────── */

interface RespostaGoogle {
  items?: {
    id: string
    volumeInfo?: {
      title?: string
      authors?: string[]
      pageCount?: number
      publishedDate?: string
      description?: string
      imageLinks?: { thumbnail?: string; smallThumbnail?: string }
    }
  }[]
}

export async function buscarLivros(termo: string): Promise<Achado[]> {
  const r = (await pegar(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(termo)}&maxResults=10&printType=books`,
  )) as RespostaGoogle
  return (r.items ?? [])
    .filter((l) => l.volumeInfo?.title)
    .map((l) => ({
      fonte: 'google-books' as const,
      fonteId: l.id,
      titulo: l.volumeInfo!.title!,
      // O thumbnail vem em http e com zoom feio; https e zoom=1 resolvem.
      capa: l.volumeInfo?.imageLinks?.thumbnail
        ?.replace(/^http:/, 'https:')
        .replace(/&edge=curl/, ''),
      autoria: l.volumeInfo?.authors?.join(', '),
      ano: l.volumeInfo?.publishedDate ? parseInt(l.volumeInfo.publishedDate.slice(0, 4), 10) : undefined,
      total: l.volumeInfo?.pageCount || undefined,
      sinopse: l.volumeInfo?.description,
    }))
}

/* ──────────────────────────────── jogos ───────────────────────────────── */

interface RespostaRawg {
  results?: {
    id: number
    name: string
    background_image?: string | null
    released?: string | null
    metacritic?: number | null
    parent_platforms?: { platform: { name: string } }[]
  }[]
}

export class SemChaveRawg extends Error {
  constructor() {
    super('A busca de jogos precisa de uma chave da RAWG (Ajustes) — ou cadastre na mão.')
  }
}

export async function buscarJogos(termo: string, chave?: string): Promise<Achado[]> {
  if (!chave) throw new SemChaveRawg()
  const r = (await pegar(
    `https://api.rawg.io/api/games?key=${encodeURIComponent(chave)}&search=${encodeURIComponent(termo)}&page_size=10`,
  )) as RespostaRawg
  return (r.results ?? []).map((j) => ({
    fonte: 'rawg' as const,
    fonteId: String(j.id),
    titulo: j.name,
    capa: j.background_image ?? undefined,
    autoria: j.parent_platforms?.map((p) => p.platform.name).join(', '),
    ano: j.released ? parseInt(j.released.slice(0, 4), 10) : undefined,
    // Jogo se mede em percentual de conclusão, não em episódios.
    total: 100,
  }))
}

export function buscar(tipo: TipoObra, termo: string, chaveRawg?: string): Promise<Achado[]> {
  if (tipo === 'anime') return buscarAnime(termo)
  if (tipo === 'livro') return buscarLivros(termo)
  return buscarJogos(termo, chaveRawg)
}
