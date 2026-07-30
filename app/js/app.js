/* ÂMBAR · boot, rotas, eventos, foco e novidade */
(function () {
  'use strict';
  const { $, $$, esc, G } = UI;
  const A = window.AMBAR, DB = window.DB, T = window.TELAS;

  /* ─── topo e rotas ────────────────────────────────────────────────────── */
  let telaAtual = 'hoje';
  const RENDER = { hoje: T.hoje, arvore: T.arvore, herbario: T.herbario, estufa: T.estufa, estrato: T.estrato };

  function topo() {
    const p = A.progressoCamada();
    $('#t-camada').textContent = p.n;
    $('#t-barra').style.width = (p.pc * 100).toFixed(1) + '%';
    $('#t-saldo').innerHTML = A.seiva() + G;
  }
  function pintar() { RENDER[telaAtual](); topo(); }
  function ir(t) {
    telaAtual = t;
    $$('#nav button').forEach((b) => b.setAttribute('aria-current', String(b.dataset.t === t)));
    $$('.tela').forEach((s) => s.classList.toggle('on', s.id === 'tela-' + t));
    pintar();
    scrollTo({ top: 0, behavior: 'smooth' });
    UI.escoarFila();                     /* celebração guardada entra agora */
  }

  /* ─── recompensa de uma ação ──────────────────────────────────────────── */
  function premiar(el, r, contexto) {
    if (!r) return;
    const antes = contexto && contexto.camadaAntes;
    UI.ganho(el, r.seiva);
    const v = A.danoVendaval(r.seiva);
    if (v) setTimeout(() => UI.celebrar({ num: '≋', titulo: 'Vendaval vencido',
      texto: 'a tempestade passou por cima e você ficou de pé. +' + v.seiva + ' de Seiva.' }), 700);
    (r.novos ? r.novos.fosseis : []).forEach((f, i) => setTimeout(() =>
      UI.torrada('◆ Fóssil de ' + f.r + ': ' + f.nome), 900 + i * 400));
    (r.novos ? r.novos.inclusoes : []).forEach((inc, i) => setTimeout(() =>
      UI.celebrar({ num: '', titulo: inc.nome, texto: inc.lore + ' · está na sua Estufa, dormente.' }), 1100 + i * 500));
    const depois = A.camada();
    if (antes && depois > antes) {
      setTimeout(() => UI.celebrar({ num: depois, titulo: 'Camada ' + depois,
        texto: 'a resina endureceu. essa camada não sai mais.' }), 500);
    }
    topo();
  }

  /* ─── HOJE: concluir o Broto ──────────────────────────────────────────── */
  function feito(el) {
    const b = $('#tela-hoje')._broto, s = A.s, camadaAntes = A.camada();
    if (b.vazio) { ir('herbario'); setTimeout(() => $('#busca') && $('#busca').focus(), 350); return; }
    let r = null;

    if (b.ciclo) {
      r = A.marcarCiclo(s.ciclos.find((c) => c.id === b.ciclo));
    } else if (b.folha) {
      const f = s.folhas.find((x) => x.id === b.folha);
      if (f) { r = A.avancarFolha(f, 1); if (r.prensou) UI.torrada('❧ ' + f.t + ' foi prensado no Herbário.'); }
    } else if (b.anel) {
      const an = s.aneis.find((x) => x.id === b.anel);
      const et = an.etapas.find((e) => !e.ok);
      if (et) {
        et.ok = true;
        r = A.registrar({ base: 40, dif: 1.5, ramo: an.ramo, k: 'anel', r: an.nome });
        if (an.etapas.every((e) => e.ok)) {
          s.marcas.aneisFechados++;
          A.revisar();
          setTimeout(() => UI.celebrar({ num: '◎', titulo: 'Anel fechado',
            texto: an.nome + ' · um anel de crescimento foi gravado no tronco, com data.' }), 600);
        }
        A.salvar();
      }
    } else {
      const idx = s.brotos.findIndex((x) => x.id === b.id);
      if (idx >= 0) s.brotos[idx].feito = true;
      s.marcas.brotosFeitos++;
      r = A.registrar({ base: b.base || 10, dif: b.dif || 1, ramo: b.ramo, k: 'broto', r: b.txt, evento: b.evento || 1 });
    }
    A.salvar();
    premiar(el, r, { camadaAntes });
    T.hoje();
  }

  /* ─── selagem ─────────────────────────────────────────────────────────── */
  const sel = { on: false, ini: 0, meta: 25, interrup: 0, timer: null, silencio: false };
  function abrirSelagem() {
    T.lamina(`<h3>Selagem</h3><p class="sub">tempo como matéria. o frasco enche enquanto você fica.</p>
      <div class="chips">
        ${[15, 25, 40].map((m) => `<button class="chip" data-sel="${m}">${m} min</button>`).join('')}
        <button class="chip" data-sel="0">sem meta</button>
      </div>
      <p style="color:var(--texto3);font-size:12px;margin-top:14px">
        interromper não zera nada: 40 min com 5 interrupções ainda vale mais que 15 min perfeitos.</p>`);
  }
  function comecarSelagem(meta) {
    sel.on = true; sel.ini = Date.now(); sel.meta = meta || 40; sel.interrup = 0; sel.silencio = false;
    $('#selagem').classList.add('on');
    tickSelagem();
    sel.timer = setInterval(tickSelagem, 1000);
    UI.haptic(30);
  }
  function tickSelagem() {
    const seg = Math.floor((Date.now() - sel.ini) / 1000), min = seg / 60;
    const mm = String(Math.floor(seg / 60)).padStart(2, '0'), ss = String(seg % 60).padStart(2, '0');
    $('#sel-t').textContent = mm + ':' + ss;
    $('#sel-liq').style.height = Math.min(100, (min / sel.meta) * 100).toFixed(1) + '%';
    const F = A.multFoco(min, sel.interrup);
    $('#sel-mult').textContent = '×' + F.toFixed(2).replace('.', ',');
    $('#sel-m').textContent = sel.interrup
      ? sel.interrup + (sel.interrup === 1 ? ' saída' : ' saídas') + ' · a resina ficou turva, não vazia'
      : 'a resina escorre enquanto você fica';
    if (min >= 12 && !sel.silencio) {
      sel.silencio = true; document.body.classList.add('silencio');
      UI.torrada('silêncio. o resto do app saiu da frente.', 2600);
    }
  }
  function encerrarSelagem() {
    if (!sel.on) return;
    clearInterval(sel.timer); sel.on = false;
    document.body.classList.remove('silencio');
    $('#selagem').classList.remove('on');
    const min = (Date.now() - sel.ini) / 60000;
    if (min < 1) { UI.torrada('menos de um minuto não endurece. sem problema.'); return; }
    const F = A.multFoco(min, sel.interrup), h = new Date().getHours();
    const s = A.s, camadaAntes = A.camada();
    s.marcas.selagens++;
    if (min >= 40 && sel.interrup === 0) s.marcas.selagemPerfeita = true;
    if (h < 6 && sel.interrup === 0) s.marcas.selagemMadrugada = true;
    const r = A.registrar({ base: Math.round(min * 1.2), ramo: 'mente', foco: F, k: 'selagem',
      r: Math.round(min) + ' min selados' });
    premiar($('#btn-selar'), r, { camadaAntes });
    UI.torrada(`você ficou ${Math.round(min)} min. ficou bonito. ×${F.toFixed(2).replace('.', ',')}`, 4000);
    pintar();
  }

  /* ─── pirilampo ───────────────────────────────────────────────────────── */
  function talvezLampo() {
    const s = A.s;
    if (sel.on || Date.now() - s.lampo.ultimo < 2 * 36e5) return;
    if (Math.random() > 0.06) return;
    const el = $('#lampo');
    el.style.left = (12 + Math.random() * 66) + 'vw';
    el.style.top = (22 + Math.random() * 48) + 'vh';
    el.classList.add('on');
    UI.som(880, .5, 'sine', .07);
    setTimeout(() => el.classList.remove('on'), 40000);
  }
  const OFERTAS = ['missao', 'cor', 'lembranca'];
  function atenderLampo() {
    const s = A.s;
    $('#lampo').classList.remove('on');
    s.lampo.ultimo = Date.now(); s.marcas.lampoAtendidos++;
    const tipo = OFERTAS[Math.floor(Math.random() * OFERTAS.length)];
    if (tipo === 'missao') {
      const frag = DB.FRAGMENTOS[Math.floor(Math.random() * DB.FRAGMENTOS.length)];
      const alvo = s.folhas.find((f) => f.estado === 'curso');
      const txt = frag.m.replace('%s', alvo ? alvo.t : 'a primeira coisa que aparecer');
      s.brotos.unshift({ id: 'lampo:' + Date.now(), txt, min: frag.min, ramo: 'cultura', dif: 1, evento: 2, base: 10 });
      T.lamina(`<h3>Missão secreta</h3><p class="sub">expira em 40 minutos. rende o dobro.</p>
        <div class="acao" style="text-align:center"><b>${esc(txt)}</b><br><span style="font-size:12px;color:var(--texto3)">${frag.min} min · Seiva ×2</span></div>
        <div class="acoes"><button class="acao primaria" data-fechar="1">ACEITAR</button></div>`);
    } else if (tipo === 'cor') {
      const h = [12, 48, 96, 168, 276, 320][Math.floor(Math.random() * 6)];
      document.documentElement.style.setProperty('--acento', `hsl(${h} 62% 56%)`);
      s.prefs.acento = h; s.prefs.acentoAte = Date.now() + 864e5;
      T.lamina(`<h3>Sopro de cor</h3><p class="sub">a paleta muda por 24 horas. só porque hoje é hoje.</p>
        <div class="acoes"><button class="acao primaria" data-fechar="1">BONITO</button></div>`);
      T.desenharArvore();
    } else {
      const fs = A.s.ledger.slice(0, 40).filter((e) => e.r);
      const e = fs.length ? fs[Math.floor(Math.random() * fs.length)] : null;
      const quando = e ? new Date(e.t).toLocaleDateString('pt-BR') : null;
      T.lamina(`<h3>Uma lembrança</h3>
        <p class="sub">${e ? `em ${quando} você fez isto: <b style="color:var(--seiva)">${esc(e.r)}</b>. ainda conta.`
          : 'você abriu este app pela primeira vez hoje. isso também conta.'}</p>
        <div class="acoes"><button class="acao primaria" data-fechar="1">ESTAVA ESQUECIDO</button></div>`);
    }
    A.revisar(); A.salvar(); pintar();
  }

  /* ─── busca de obras (API com queda para o catálogo local) ────────────── */
  let buscaT = null;
  function buscar(q) {
    clearTimeout(buscaT);
    if (!q || q.length < 2) { $('#resultados').innerHTML = ''; return; }
    buscaT = setTimeout(async () => {
      const local = DB.CATALOGO
        .filter((c) => c.t.toLowerCase().includes(q.toLowerCase()) || (c.a || '').toLowerCase().includes(q.toLowerCase()))
        .slice(0, 3);
      render(local.map((c) => [c, 'catálogo local']));
      const remoto = await buscarAPI(q).catch(() => []);
      if (remoto.length) render(remoto.concat(local.map((c) => [c, 'catálogo local'])).slice(0, 3));
      else if (!local.length) render([]);
    }, 250);

    function render(pares) {
      const box = $('#resultados'); if (!box) return;
      box.innerHTML = pares.length
        ? pares.map(([c, fonte]) => T.resHTML(c, fonte)).join('')
        : `<button class="res" data-manual="${esc(q)}"><div class="capa">${UI.capaSVG(q, 'livro')}</div>
             <div class="info"><div class="tt">${esc(q)}</div>
             <div class="mt">nenhuma API achou. criar com este nome?</div>
             <div class="fonte">manual · 2 campos</div></div></button>`;
      box._pares = pares;
    }
  }

  async function buscarAPI(q) {
    if (!navigator.onLine) return [];
    const out = [];
    const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 1200);
    try {
      const r = await fetch('https://graphql.anilist.co', {
        method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query($q:String){Page(perPage:2){media(search:$q,sort:POPULARITY_DESC){
            title{romaji english} type format episodes chapters averageScore startDate{year} genres}}}`,
          variables: { q },
        }),
      });
      const j = await r.json();
      (j.data && j.data.Page.media || []).forEach((m) => {
        const t = m.title.english || m.title.romaji;
        const manga = m.type === 'MANGA';
        out.push([{ t, k: manga ? 'manga' : 'anime', y: m.startDate && m.startDate.year,
          total: (manga ? m.chapters : m.episodes) || (manga ? 100 : 12),
          nota: m.averageScore ? (m.averageScore / 10).toFixed(1) : null,
          tags: (m.genres || []).map((g) => g.toLowerCase()) }, 'AniList']);
      });
    } catch (e) { /* offline ou CORS: o catálogo local assume */ }
    clearTimeout(to);
    if (out.length >= 2) return out;
    try {
      const c2 = new AbortController(); setTimeout(() => c2.abort(), 1200);
      const r = await fetch('https://openlibrary.org/search.json?limit=2&fields=title,author_name,first_publish_year,number_of_pages_median,subject&q='
        + encodeURIComponent(q), { signal: c2.signal });
      const j = await r.json();
      (j.docs || []).forEach((d) => out.push([{ t: d.title, a: (d.author_name || [])[0], k: 'livro',
        y: d.first_publish_year, total: d.number_of_pages_median || 300,
        tags: (d.subject || []).slice(0, 6).map((x) => String(x).toLowerCase()) }, 'Open Library']));
    } catch (e) {}
    return out;
  }

  function adicionarFolha(c, fonte) {
    const s = A.s;
    if (s.folhas.some((f) => f.t === c.t)) { UI.torrada('já está no Herbário.'); return; }
    const camadaAntes = A.camada();
    const f = { id: 'f' + Date.now(), t: c.t, k: c.k || 'livro', total: c.total || 100,
      prog: 0, estado: 'curso', tags: c.tags || [], nota: c.nota || null, fonte: fonte || 'local' };
    s.folhas.push(f);
    const r = A.registrar({ base: 5, ramo: 'cultura', k: 'folha', r: 'plantou ' + f.t });
    A.salvar();
    UI.torrada('❧ ' + f.t + ' entrou no Herbário. estado: em curso.');
    premiar($('#busca'), r, { camadaAntes });
    const b = $('#busca'); if (b) b.value = '';
    T.herbario();
  }

  /* ─── lâminas de ação ─────────────────────────────────────────────────── */
  function abrirFolha(id) {
    const f = A.s.folhas.find((x) => x.id === id); if (!f) return;
    const u = T.UNID[f.k] || '';
    T.lamina(`<h3>${esc(f.t)}</h3>
      <p class="sub">${T.NOME_K[f.k] || f.k} · ${f.prog}/${f.total} ${u} · ${esc((f.tags || []).slice(0, 3).join(' · '))}</p>
      <div class="prog" style="margin-bottom:16px"><i style="width:${(f.prog / f.total * 100).toFixed(0)}%"></i></div>
      <div class="acoes">
        <button class="acao primaria" data-avancar="${f.id}">＋ AVANÇAR</button>
        <button class="acao" data-estado="prensado:${f.id}">prensar · concluída <b>+${(A.SEIVA_MIDIA[f.k] || A.SEIVA_MIDIA.livro).fim}${G}</b></button>
        <button class="acao" data-estado="deixado:${f.id}">deixar ir · não é pra agora <b>+10${G}</b></button>
        <button class="acao" data-estado="semeado:${f.id}">guardar como semeado</button>
      </div>
      <p style="color:var(--texto3);font-size:11.5px;margin-top:12px">
        "deixar ir" rende Seiva. parar consciente também é uma decisão executiva.</p>`);
  }

  function abrirNovoCiclo() {
    T.lamina(`<h3>Novo Ciclo</h3><p class="sub">um hábito. dois toques: nome e Ramo.</p>
      <div class="busca"><input id="nc-nome" placeholder="ex: 20 minutos de violão"></div>
      <div class="chips" id="nc-ramos">
        ${DB.RAMOS.map((r, i) => `<button class="chip" data-ncr="${r.id}" aria-pressed="${i === 0}">${r.glifo} ${r.nome}</button>`).join('')}
      </div>
      <div class="chips" id="nc-dif">
        ${[['1', 'Leve'], ['1.5', 'Média'], ['2.2', 'Pesada']].map(([v, n], i) =>
          `<button class="chip" data-ncd="${v}" aria-pressed="${i === 0}">${n}</button>`).join('')}
      </div>
      <div class="acoes"><button class="acao primaria" id="nc-ok">CRIAR</button></div>`,
      (el) => setTimeout(() => el.querySelector('#nc-nome').focus(), 250));
  }

  function abrirNovaTarefa() {
    T.lamina(`<h3>Nova coisa</h3><p class="sub">escreve grande. o app quebra em pedaços de 2 a 5 min.</p>
      <div class="busca"><input id="nt-nome" placeholder="ex: organizar as fotos da viagem"></div>
      <div id="nt-frag"></div>
      <div class="acoes"><button class="acao primaria" id="nt-ok">FRAGMENTAR E GUARDAR</button></div>`,
      (el) => {
        const inp = el.querySelector('#nt-nome');
        setTimeout(() => inp.focus(), 250);
        const atualiza = () => {
          const q = inp.value.trim();
          el.querySelector('#nt-frag').innerHTML = q
            ? '<div class="secao">O app propõe</div>' + DB.FRAGMENTOS.slice(0, 3).map((f) =>
                `<div class="acao" style="margin-bottom:8px">${esc(f.m.replace('%s', q))}
                 <span style="color:var(--texto3);font-size:12px"> · ${f.min} min</span></div>`).join('')
            : '';
        };
        inp.addEventListener('input', atualiza);
      });
  }

  function abrirEpitetos(slot) {
    const st = A.stats();
    const disp = DB.EPITETOS.filter((e) => { try { return e.req(st); } catch (x) { return false; } }).slice(0, 4);
    T.lamina(`<h3>Epítetos</h3><p class="sub">um título muda como o app fala com você.</p>
      <div class="acoes">
        ${disp.length ? disp.map((e) => `<button class="acao" data-eq="${slot}:${e.id}">
            <b>${esc(e.nome)}</b><br><span style="font-size:12px;color:var(--texto2)">${esc(e.d)}</span></button>`).join('')
          : '<div class="acao" style="color:var(--texto3)">nenhum ainda. eles aparecem sozinhos.</div>'}
        ${A.s.epitetos[slot] ? `<button class="acao" data-eq="${slot}:">deixar vazio</button>` : ''}
      </div>`);
  }

  function abrirSistema() {
    const s = A.s;
    T.lamina(`<h3>Sistema</h3><p class="sub">Camada ${A.camada()} · ${A.ambar()}${G} fixados no Âmbar · ${A.seiva()}${G} disponíveis</p>
      <div class="acoes">
        <button class="acao" data-cfg="tema">tema · <b>${s.prefs.tema === 'claro' ? 'papel' : 'sombra'}</b></button>
        <button class="acao" data-cfg="som">som · <b>${s.prefs.som ? 'ligado' : 'desligado'}</b></button>
        <button class="acao" data-cfg="haptic">vibração · <b>${s.prefs.haptic ? 'ligada' : 'desligada'}</b></button>
        <button class="acao" data-cfg="silhueta">recalcular Silhueta agora</button>
        <button class="acao" data-cfg="zerar" style="color:#C97B7B">apagar tudo e começar de novo</button>
      </div>
      <p style="color:var(--texto3);font-size:11.5px;margin-top:12px">
        Âmbar é um registro append-only: nenhuma função deste app remove Seiva já ganha.</p>`);
  }

  /* ─── eventos (delegação única) ───────────────────────────────────────── */
  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-t],[data-esc],[data-ciclo],[data-novo-ciclo],[data-nova-tarefa],'
      + '[data-filtro],[data-rar],[data-no],[data-add],[data-manual],[data-avancar],[data-folha],'
      + '[data-enx],[data-abrir-inc],[data-alimentar],[data-estado],[data-epiteto],[data-eq],'
      + '[data-sel],[data-ncr],[data-ncd],[data-cfg],[data-fechar],#btn-feito,#btn-selar,#btn-poda,'
      + '#sel-sair,#nc-ok,#nt-ok,#lampo,#celebra,#btn-voz');
    if (!t) return;
    const d = t.dataset || {};

    if (t.id === 'celebra' || t.closest('#celebra')) { UI.fecharCelebra(); return; }
    if (t.id === 'lampo') { atenderLampo(); return; }
    if (d.t) { ir(d.t); return; }

    if (t.id === 'btn-feito') { feito(t); return; }
    if (d.esc === 'outro' || d.esc === 'depois') {
      const b = $('#tela-hoje')._broto;
      A.s.adiados[b.id] = Date.now() + (d.esc === 'depois' ? 2 * 36e5 : 3 * 6e4);
      A.salvar(); UI.haptic(10); T.hoje();
      UI.torrada(d.esc === 'depois' ? 'guardado por 2 horas. sem cobrança.' : 'outra coisa então.', 2200);
      return;
    }
    if (d.ciclo) {
      const c = A.s.ciclos.find((x) => x.id === d.ciclo);
      if (!c || c.ultimo === A.dia()) { UI.torrada('esse já está feito hoje.'); return; }
      const camadaAntes = A.camada();
      premiar(t, A.marcarCiclo(c), { camadaAntes });
      T.hoje();
      return;
    }
    if (d.novoCiclo) { abrirNovoCiclo(); return; }
    if (d.novaTarefa) { abrirNovaTarefa(); return; }
    if (t.id === 'btn-selar') { abrirSelagem(); return; }
    if (d.sel !== undefined) { t.closest('.lamina').remove(); comecarSelagem(Number(d.sel)); return; }
    if (t.id === 'sel-sair') { encerrarSelagem(); return; }

    if (d.filtro) { T.filtro = d.filtro; T.herbario(); return; }
    if (d.rar) { T.filtroR = d.rar; T.estrato(); return; }

    if (d.no) {
      const [ramo, i] = d.no.split(':');
      const n = A.nosDisponiveis(ramo).find((x) => x.i === Number(i));
      if (!n) return;
      if (A.seiva() < n.custo) { UI.torrada('faltam ' + (n.custo - A.seiva()) + ' de Seiva. nada foi perdido, só ainda não chegou.'); return; }
      A.comprarNo(n);
      UI.ganho(t, '−' + n.custo); UI.som(330, .5, 'triangle', .18); UI.haptic([0, 20, 40, 30]);
      UI.torrada('nó aberto: ' + n.n);
      const sil = A.s.silhueta && A.s.silhueta.nome;
      A.calcularSilhueta(true);
      if (A.s.silhueta && A.s.silhueta.nome !== sil) {
        UI.celebrar({ num: '', titulo: A.s.silhueta.nome, texto: 'sua copa tomou forma. ' + A.s.silhueta.b });
      }
      T.arvore(); topo();
      return;
    }

    if (d.add) {
      const pares = $('#resultados')._pares || [];
      const par = pares.find(([c]) => c.t === d.add);
      const c = par ? par[0] : DB.CATALOGO.find((x) => x.t === d.add);
      if (c) adicionarFolha(c, par ? par[1] : 'catálogo local');
      return;
    }
    if (d.manual) { adicionarFolha({ t: d.manual, k: 'livro', total: 200, tags: [] }, 'manual'); return; }
    if (d.avancar) {
      const f = A.s.folhas.find((x) => x.id === d.avancar);
      const camadaAntes = A.camada();
      const r = A.avancarFolha(f, 1);
      premiar(t, r, { camadaAntes });
      if (r.prensou) UI.torrada('❧ ' + f.t + ' prensado. procure um Enxerto.');
      const lam = t.closest('.lamina'); if (lam) lam.remove();
      T.herbario();
      return;
    }
    if (d.folha) { abrirFolha(d.folha); return; }
    if (d.estado) {
      const [est, id] = d.estado.split(':');
      const f = A.s.folhas.find((x) => x.id === id);
      const camadaAntes = A.camada();
      premiar(t, A.prensarFolha(f, est), { camadaAntes });
      t.closest('.lamina').remove();
      T.herbario();
      return;
    }
    if (d.enx) {
      const e = $('#tela-herbario')._enx[Number(d.enx)];
      const camadaAntes = A.camada();
      const r = A.enxertar(e);
      premiar(t, r, { camadaAntes });
      UI.celebrar({ num: '✛', titulo: e.nome, texto: e.txt });
      T.herbario();
      return;
    }

    if (d.abrirInc) { T.abrirInclusao(d.abrirInc); return; }
    if (d.alimentar) {
      const def = DB.INCLUSOES.find((i) => i.id === d.alimentar);
      const st = A.s.inclusoes[d.alimentar];
      const custo = A.CUSTO_ALIM[st.estagio];
      if (!A.alimentar(d.alimentar)) { UI.torrada('faltam ' + (custo - A.seiva()) + ' de Seiva.'); return; }
      t.closest('.lamina').remove();
      UI.somDe(def.id);
      UI.celebrar({ num: '', titulo: def.nome + (A.s.inclusoes[def.id].estagio === 2 ? ' · plena' : ' · desperta'),
        texto: A.s.inclusoes[def.id].estagio === 2 ? 'agora ela tem luz própria.' : 'a resina clareou. ela se moveu.' });
      T.estufa(); topo();
      return;
    }

    if (d.epiteto !== undefined) { abrirEpitetos(Number(d.epiteto)); return; }
    if (d.eq !== undefined) {
      const [slot, id] = d.eq.split(':');
      A.s.epitetos[Number(slot)] = id || null;
      A.salvar(); t.closest('.lamina').remove(); T.estrato();
      UI.torrada(id ? 'epíteto equipado.' : 'slot livre.');
      return;
    }
    if (t.id === 'btn-poda') {
      T.lamina(`<h3>Poda</h3><p class="sub">reformata a especialização. a sua Camada permanece.</p>
        <div class="acoes">
          <button class="acao">reseta: nós dos Ramos e saldo de Seiva</button>
          <button class="acao">preserva: <b>Âmbar, Camada</b>, Fósseis, Inclusões, Herbário, Enxertos</button>
          <button class="acao primaria" data-cfg="podar">✂ PODAR · +8% de Seiva permanente</button>
        </div>`);
      return;
    }
    if (d.fechar) { t.closest('.lamina').remove(); return; }

    if (t.id === 'nc-ok') {
      const el = t.closest('.lamina');
      const nome = el.querySelector('#nc-nome').value.trim();
      if (!nome) { UI.torrada('só o nome, e está feito.'); return; }
      const ramo = el.querySelector('#nc-ramos [aria-pressed="true"]').dataset.ncr;
      const dif = Number(el.querySelector('#nc-dif [aria-pressed="true"]').dataset.ncd);
      const r = DB.RAMOS.find((x) => x.id === ramo);
      A.s.ciclos.push({ id: 'c' + Date.now(), nome, ramo, dif, glifo: r.glifo, ultimo: null });
      A.salvar(); el.remove(); ir('hoje'); UI.torrada('Ciclo criado. aparece amanhã também.');
      return;
    }
    if (d.ncr || d.ncd) {
      const grupo = t.parentElement;
      Array.from(grupo.children).forEach((c) => c.setAttribute('aria-pressed', String(c === t)));
      return;
    }
    if (t.id === 'nt-ok') {
      const el = t.closest('.lamina');
      const q = el.querySelector('#nt-nome').value.trim();
      if (!q) { UI.torrada('escreve qualquer coisa. o app quebra.'); return; }
      DB.FRAGMENTOS.slice(0, 3).forEach((f, i) => A.s.brotos.push({
        id: 'b' + Date.now() + i, txt: f.m.replace('%s', q), min: f.min, ramo: 'oficio', dif: 1, base: 10 }));
      A.salvar(); el.remove(); ir('hoje');
      UI.torrada('quebrado em 3 pedaços. o primeiro já está na tela.');
      return;
    }

    if (d.cfg) {
      const s = A.s;
      if (d.cfg === 'tema') { s.prefs.tema = s.prefs.tema === 'claro' ? 'escuro' : 'claro'; document.documentElement.dataset.tema = s.prefs.tema; }
      if (d.cfg === 'som') s.prefs.som = !s.prefs.som;
      if (d.cfg === 'haptic') s.prefs.haptic = !s.prefs.haptic;
      if (d.cfg === 'silhueta') { A.calcularSilhueta(true); UI.torrada(s.silhueta ? 'silhueta: ' + s.silhueta.nome : 'ainda em Bruma.'); }
      if (d.cfg === 'podar') { if (A.podar()) UI.celebrar({ num: '✂', titulo: 'Anel de Cerne', texto: 'a árvore foi podada. o estrato permanece.' }); }
      if (d.cfg === 'zerar') { A.zerar(); location.reload(); return; }
      A.salvar(); t.closest('.lamina').remove(); pintar();
      return;
    }

    if (t.id === 'btn-voz') { ditar(t); return; }
  });

  document.addEventListener('input', (ev) => {
    if (ev.target.id === 'busca') buscar(ev.target.value.trim());
  });

  /* toque longo no topo abre o Sistema */
  let pressT = null;
  $('.topo').addEventListener('pointerdown', () => { pressT = setTimeout(abrirSistema, 550); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) =>
    $('.topo').addEventListener(e, () => clearTimeout(pressT)));

  /* ─── voz ─────────────────────────────────────────────────────────────── */
  function ditar(btn) {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) { UI.torrada('este navegador não escuta. digite o nome.'); $('#busca').focus(); return; }
    const rec = new R(); rec.lang = 'pt-BR'; rec.interimResults = false;
    btn.classList.add('ouvindo');
    rec.onresult = (e) => { const q = e.results[0][0].transcript; $('#busca').value = q; buscar(q); };
    rec.onerror = () => UI.torrada('não deu. digite o nome.');
    rec.onend = () => btn.classList.remove('ouvindo');
    try { rec.start(); } catch (e) { btn.classList.remove('ouvindo'); }
  }

  /* ─── interrupções da Selagem ─────────────────────────────────────────── */
  document.addEventListener('visibilitychange', () => {
    if (sel.on && document.hidden) { sel.interrup++; tickSelagem(); }
  });
  window.addEventListener('blur', () => { if (sel.on) { sel.interrup++; tickSelagem(); } });
  window.addEventListener('resize', () => { if (telaAtual === 'arvore') T.desenharArvore(); });

  /* ─── primeira execução: importação de exemplo ────────────────────────── */
  function semear() {
    const s = A.s;
    if (s.folhas.length || s.ledger.length) return;
    const pega = (t) => DB.CATALOGO.find((c) => c.t === t);
    const add = (t, estado, prog) => {
      const c = pega(t); if (!c) return;
      s.folhas.push({ id: 'f' + t.length + s.folhas.length, t: c.t, k: c.k, total: c.total,
        prog: prog || 0, estado, tags: c.tags, nota: c.nota, fonte: 'importado', importada: true });
    };
    add('Vinland Saga', 'curso', 84);
    add('Elden Ring', 'curso', 41);
    add('Musashi', 'prensado', 970);
    add('Ghost of Tsushima', 'prensado', 45);
    add('Mushishi', 'semeado', 0);
    add('Meditações', 'curso', 60);
    A.revisar(); A.salvar();
  }

  /* ─── boot ────────────────────────────────────────────────────────────── */
  A.carregar();
  semear();
  $$('[data-ico]').forEach((e) => { e.innerHTML = UI.ICO[e.dataset.ico] || ''; });
  document.documentElement.dataset.tema = A.s.prefs.tema || 'escuro';
  document.documentElement.style.setProperty('--estacao', A.estacao().acento);
  if (A.s.prefs.acento && A.s.prefs.acentoAte > Date.now()) {   /* sopro de cor do Pirilampo */
    document.documentElement.style.setProperty('--acento', `hsl(${A.s.prefs.acento} 62% 56%)`);
  }
  if (A.s.congelado) document.body.classList.add('turvo');

  /* volta depois de 7+ dias: a Estufa primeiro, o trabalho depois */
  const pausa = A.s.pausaAtual || 0;
  ir(pausa >= 7 ? 'estufa' : 'hoje');
  if (pausa >= 7) UI.torrada('você voltou. a poeira já se limpou sozinha.', 5000);
  else if (A.s.congelado) UI.torrada('sua corrente está congelada, não perdida. ela retoma de onde parou.', 5000);

  setInterval(talvezLampo, 60000);
  setTimeout(talvezLampo, 25000);
  window.addEventListener('beforeunload', A.salvar);
})();
