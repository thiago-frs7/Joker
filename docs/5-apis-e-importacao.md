# 5. Mapeamento de APIs e fluxo de importação

> **Objetivo:** zero digitação de metadados. O usuário digita ou fala **um** nome e toca **uma**
> vez. Todo o resto — capa, sinopse, duração, páginas, episódios, gêneros, nota da crítica — vem
> de API.

---

## 5.1 Matriz de provedores

| Mídia | Primário | Fallback | Escrita de volta | Chave |
|---|---|---|---|---|
| **Anime** | AniList (GraphQL) | Jikan v4 → Kitsu | ✅ AniList, ✅ MAL v2, ✅ Kitsu | AniList: não p/ leitura |
| **Mangá** | AniList (GraphQL) | Jikan v4 → Kitsu | ✅ mesmas | — |
| **Livros** | Open Library | Google Books | ⚠️ nenhuma confiável | ambas sem chave¹ |
| **Jogos** | IGDB | RAWG | ❌ nenhuma | Twitch Client ID + secret |
| **Biblioteca de jogos** | Steam Web API | — | ❌ somente leitura | Steam Web API key |
| **Filmes/Séries** | TMDB | OMDb → TVDB v4 | ✅ TMDB (watchlist/listas) | TMDB key |
| **Episódios de série** | Trakt | TMDB | ✅ Trakt (scrobble por episódio) | OAuth Trakt |
| **Álbuns** | MusicBrainz | Last.fm | ✅ Last.fm (scrobble) · ✅ Spotify (álbuns salvos) | OAuth |

¹ Google Books tem cota diária maior com chave; Open Library dispensa chave mas pede
*User-Agent* identificável.

### Notas de realidade (verificar termos no momento da implementação)

- **Jikan** é um wrapper **não oficial** do MyAnimeList: excelente para busca, **somente
  leitura**, sem chave, com limite prático de ~3 req/s.
- **MyAnimeList API v2** (oficial, OAuth2 + PKCE) é o único caminho legítimo para *atualizar* a
  lista do usuário no MAL. Jikan não escreve.
- **AniList** é o melhor primário: GraphQL, uma query devolve capa, sinopse, contagem de
  capítulos/episódios, gêneros, tags e média — e a mutation `SaveMediaListEntry` fecha o ciclo
  bidirecional.
- **Steam** oferece `GetOwnedGames`/`GetPlayerAchievements` — perfeito para *importar* biblioteca
  e horas jogadas, mas **não existe escrita**. Sincronização com Steam é, e será, unidirecional.
  Isso deve ser dito ao usuário na tela de conexão, sem eufemismo.
- **Goodreads encerrou a API pública em 2020** e não emite novas chaves. *Scraping* é frágil e
  juridicamente arriscado — **não está no plano**. Livros ficam com Open Library + Google Books;
  Hardcover (GraphQL) entra como candidato a bidirecional quando/se estabilizar.
- **TMDB** e **RAWG** exigem atribuição visível na tela de detalhe da obra.
- **Spotify**: histórico de escuta é limitado (janela recente curta). Para "álbum ouvido" o
  caminho confiável é *Álbuns Salvos* + scrobbles do Last.fm, não o histórico do Spotify.
- **TVDB v4** é pago por assinatura de chave — entra apenas como terceiro fallback.

---

## 5.2 O fluxo de importação (dois toques)

```
┌────────────────────────────────────────────────────────────┐
│  toque 1  ·  🎙️ voz ou texto: "vinland"                    │
│             (STT on-device, sem enviar áudio p/ servidor)  │
└──────────────────────────┬─────────────────────────────────┘
                           ▼
              debounce 250 ms · consulta paralela
                    ┌──────┴──────┐
              cache local     provedor primário
              (30 dias)       (timeout 1.200 ms)
                    └──────┬──────┘
                           ▼          ┌── vazio/erro ──► fallback 1 ──► fallback 2
              ranking por fuzzy match + popularidade
                           ▼
        ┌──────────────────────────────────────┐
        │  no MÁXIMO 3 cards, com capa grande  │  ← nunca uma lista longa
        └──────────────────┬───────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────┐
│  toque 2  ·  toca o card                                    │
│  → Folha criada. Estado "Em curso". Tags herdadas.          │
│  → checagem de Enxerto disparada em background              │
└────────────────────────────────────────────────────────────┘
```

**Orçamento de tempo:** primeiro card renderizado em **≤ 900 ms** (esqueleto em 120 ms).
Se o provedor primário passar de 1.200 ms, o app já mostra o resultado do fallback e substitui
depois, sem pular a tela.

### Quando a API não acha (o caminho da câmera)

```
foto da capa  →  OCR on-device (ML Kit / Tesseract)
              →  título extraído  →  busca de novo
              →  ainda nada? Folha manual com 2 campos:
                 nome  +  tipo (4 chips)  →  a capa fotografada vira a arte
```

Nunca mais de **2 campos**. Nem no pior caso. Nem para mídia obscura.

### Importações em massa (uma vez, no onboarding)

| Origem | Método |
|---|---|
| MyAnimeList / AniList | export XML/JSON oficial, ou OAuth + puxar lista inteira |
| Steam | SteamID → `GetOwnedGames` (traz horas jogadas → progresso já preenchido) |
| Goodreads | **CSV de exportação** (o export manual continua funcionando, a API não) |
| Trakt / Letterboxd | CSV / OAuth |
| Planilhas | CSV genérico com mapeamento de colunas assistido |

O onboarding pode terminar com 300 Folhas já no Herbário e 12 Enxertos disponíveis — o app
começa **rico**, não vazio. Para um cérebro com TDAH, um app vazio é um app desinstalado.

---

## 5.3 Sincronização bidirecional

Opcional, por serviço, **desligada por padrão**, com uma frase clara em cada chave:

```
AniList     [ ✅ ligado  ]   escreve status, capítulo/episódio e nota
MyAnimeList [    ligado? ]   escreve status e progresso
Trakt       [    ligado? ]   marca episódios assistidos
TMDB        [    ligado? ]   atualiza watchlist e listas
Last.fm     [    ligado? ]   envia scrobbles
Steam       [ 🔒 leitura ]   só importa. A Steam não permite escrita.
```

**Regras de sincronização**
- **Fila local durável.** Toda escrita entra numa fila que sobrevive a fechar o app e à falta de
  rede. Retry com backoff exponencial (2s, 4s, 8s, 16s, depois 1h).
- **O local sempre ganha.** Em conflito, o valor do ÂMBAR é a verdade; o remoto é atualizado.
  Nunca o inverso — o app não pode "desfazer" progresso que o usuário registrou.
- **Nunca sincroniza `Deixado ir` como "abandonado"** sem avisar: alguns serviços expõem isso
  publicamente. O padrão é *não* propagar esse estado.
- **Sem token, sem app.** Nenhum serviço é obrigatório para usar o ÂMBAR inteiro.

---

## 5.4 Arquitetura de dados

**Local-first, sempre.** O app funciona 100% offline; a nuvem é conveniência, não requisito.

```
┌─── dispositivo ──────────────────────────────┐
│  SQLite (fonte da verdade)                   │
│   ├── folhas, brotos, ciclos, aneis          │
│   ├── seiva_ledger  (append-only, imutável)  │──► Âmbar é uma SOMA,
│   ├── cache_metadados (TTL 30 dias)          │    nunca um campo editável
│   └── fila_sync (durável)                    │
│  modelos .glb das Inclusões (bundled)        │──► 3D funciona sem rede
└──────────────────────┬───────────────────────┘
                       ▼
        ┌─── proxy de metadados (nosso) ────────┐
        │  guarda as chaves (IGDB, TMDB, RAWG)  │
        │  cache compartilhado + rate limiting  │
        │  normaliza tudo p/ 1 schema de Folha  │
        └───────────────────────────────────────┘
```

**Duas decisões de engenharia que importam:**

1. **Chaves nunca no cliente.** IGDB, TMDB, RAWG e Steam exigem segredo — vai tudo por proxy,
   que também dá cache compartilhado (uma busca por "Elden Ring" serve a todos os usuários) e
   protege contra o app inteiro ser banido por excesso de requisições de um usuário.
2. **`seiva_ledger` é append-only.** Não existe operação de UPDATE ou DELETE sobre Seiva ganha.
   A promessa "nada é retirado de você" é garantida pelo **schema do banco**, não pela
   disciplina do código.

**Modelos 3D:** as Inclusões são `.glb` **próprios, embarcados no app** — não busca em catálogo
de terceiros em tempo de uso. Isso garante funcionamento offline, peso controlado (~250 KB cada,
Draco + KTX2), estética coesa e zero dependência de disponibilidade externa.
