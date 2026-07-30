/* ÂMBAR · as cinco telas */
(function () {
  'use strict';
  const { $, $$, esc, capaSVG, blocoHTML, G, ICO } = UI;
  const DB = window.DB;
  const A = window.AMBAR;

  const NOME_K = { livro: 'livro', manga: 'mangá', anime: 'anime', jogo: 'jogo',
                   filme: 'filme', serie: 'série', album: 'álbum' };
  const UNID = { livro: 'pág', manga: 'cap', anime: 'ep', serie: 'ep', jogo: 'h', filme: 'min', album: 'escuta' };

  /* ─── lâminas (folhas de baixo) ───────────────────────────────────────── */
  function lamina(html, aoAbrir) {
    const el = document.createElement('div');
    el.className = 'lamina';
    el.innerHTML = `<div class="corpo"><div class="puxador"></div>${html}</div>`;
    el.addEventListener('click', (e) => { if (e.target === el) el.remove(); });
    document.body.appendChild(el);
    if (aoAbrir) aoAbrir(el);
    return el;
  }

  /* ─── HOJE ────────────────────────────────────────────────────────────── */
  /* escolhe UM Broto. Nunca devolve lista. Nunca pede prioridade ao usuário. */
  function proximoBroto() {
    const s = A.s, agora = Date.now();
    const livre = (id) => !(s.adiados[id] > agora);

    const pend = s.brotos.find((b) => !b.feito && livre(b.id));
    if (pend) return pend;

    for (const an of s.aneis) {
      const et = an.etapas.find((e) => !e.ok);
      if (et && livre('anel:' + an.id)) {
        return { id: 'anel:' + an.id, txt: et.t, min: 5, ramo: an.ramo, dif: 1.5, anel: an.id, base: 40 };
      }
    }
    const emCurso = s.folhas.filter((f) => f.estado === 'curso');
    for (const f of emCurso) {
      if (!livre('folha:' + f.id)) continue;
      const u = UNID[f.k] || 'pág';
      const passo = f.k === 'livro' ? '10 páginas' : f.k === 'jogo' ? '10 minutos' : '1 ' + u;
      return { id: 'folha:' + f.id, txt: `avançar ${passo} de ${f.t}`, min: 4, ramo: 'cultura', dif: 1, folha: f.id };
    }
    const c = s.ciclos.find((x) => x.ultimo !== A.dia() && livre('ciclo:' + x.id));
    if (c) return { id: 'ciclo:' + c.id, txt: c.nome, min: 3, ramo: c.ramo, dif: c.dif, ciclo: c.id };

    const semear = s.folhas.find((f) => f.estado === 'semeado' && livre('folha:' + f.id));
    if (semear) return { id: 'folha:' + semear.id, txt: 'começar ' + semear.t, min: 5, ramo: 'cultura', dif: 1, folha: semear.id };

    return { id: 'vazio', txt: 'plantar uma coisa nova no Herbário', min: 2, ramo: 'cultura', dif: 1, vazio: true };
  }

  function hoje() {
    const s = A.s, b = proximoBroto(), hp = A.vendavalHP();
    const pcV = Math.min(1, s.vendaval.dano / hp);
    const feitosHoje = s.ciclos.filter((c) => c.ultimo === A.dia()).length;
    const elosVis = Math.max(5, Math.min(12, s.elos + 2));
    let elos = '';
    for (let i = 0; i < elosVis; i++) elos += `<span class="elo ${i < s.elos ? 'on' : ''}"></span>`;

    $('#tela-hoje').innerHTML = `
      <div class="agora">
        <div class="halo"></div>
        <div class="et">AGORA</div>
        <div class="tt">${esc(b.txt)}</div>
        <div class="mn">${b.min} min${b.anel ? ' · etapa de Anel' : ''}</div>
        <button class="feito" id="btn-feito">FEITO</button>
        <div class="escapes">
          <button data-esc="outro">outro</button>
          <button data-esc="depois">depois</button>
        </div>
      </div>

      <div class="corrente ${s.congelado ? 'turvo' : ''}">
        ${elos}<span class="lbl">${s.elos === 0 ? 'primeira corrente' : 'corrente de ' + s.elos + (s.elos === 1 ? ' elo' : ' elos')}${s.congelado ? ' · congelada' : ''}</span>
      </div>

      <div class="secao">Ciclos de hoje · ${feitosHoje}/${s.ciclos.length}</div>
      <div class="pedras">
        ${s.ciclos.map((c) => `<button class="pedra ${c.ultimo === A.dia() ? 'feita' : ''}" data-ciclo="${c.id}">
            <span class="g">${c.glifo}</span><span>${esc(c.nome)}</span></button>`).join('')}
      </div>
      <div class="criar">
        <button data-novo-ciclo="1">＋ Ciclo</button>
        <button data-nova-tarefa="1">＋ uma coisa que preciso fazer</button>
      </div>

      <div class="secao">Vendaval da semana</div>
      <div class="vendaval">
        <span class="g">${ICO.vendaval}</span>
        <div class="prog"><i style="width:${(pcV * 100).toFixed(0)}%"></i></div>
        <span class="pc">${(pcV * 100).toFixed(0)}%</span>
      </div>
      ${s.vendaval.vencido ? '<p class="mn" style="color:var(--seiva);font-size:13px;margin-top:8px">a tempestade passou por cima e você ficou de pé.</p>' : ''}

      <button class="selar" id="btn-selar">⧗ SELAR</button>
      <p style="text-align:center;color:var(--texto3);font-size:11.5px;margin-top:-2px">
        ${s.congelado ? 'sua corrente está congelada, não perdida.' : 'foco vira multiplicador. interrupção não zera nada.'}
      </p>`;
    $('#tela-hoje')._broto = b;
  }

  /* ─── ÁRVORE ──────────────────────────────────────────────────────────── */
  function arvore() {
    const s = A.s, sil = A.calcularSilhueta();
    const nos = A.quatroNos();
    const totalNos = s.nos.length;

    $('#tela-arvore').innerHTML = `
      <div class="silhueta">
        <h2>${sil ? esc(sil.nome) : 'Bruma'}</h2>
        <div class="sub">${sil ? esc(sil.chave.split('+').map((r) => DB.RAMOS.find((x) => x.id === r).nome).join(' · ')) : 'sem forma definida ainda'}</div>
        ${sil ? `<div class="bon">${esc(sil.b)}</div>` : '<div class="bon" style="color:var(--texto3)">invista em dois Ramos e a copa toma forma</div>'}
      </div>
      <canvas id="arvore-canvas"></canvas>
      <div class="secao">Prontos para abrir · ${A.seiva()}${G}</div>
      <div class="nos">
        ${nos.length ? nos.map((n) => `
          <button class="no ${A.seiva() < n.custo ? 'bloq' : ''}" data-no="${n.ramo}:${n.i}">
            <div class="nn">${esc(n.n)}</div>
            <div class="nd">${esc(n.d)}</div>
            <div class="nc">${n.custo}${G} · ${DB.RAMOS.find((r) => r.id === n.ramo).nome}</div>
          </button>`).join('')
          : '<p class="mn" style="grid-column:1/-1;color:var(--texto3)">nada aberto agora. volte com mais Seiva.</p>'}
      </div>
      <div class="secao">Ramos · ${totalNos} ${totalNos === 1 ? 'nó' : 'nós'}</div>
      ${DB.RAMOS.map((r) => {
        const q = s.nos.filter((n) => n.startsWith(r.id + ':')).length;
        const inv = s.invest[r.id] || 0;
        return `<div class="ramo-linha"><span class="g">${r.glifo}</span>
          <span class="nm">${r.nome}</span>
          <span class="qt">${q}/15 · ${inv}${G}${A.multEnxerto(r.id) > 1 ? ' · +' + Math.round((A.multEnxerto(r.id) - 1) * 100) + '%' : ''}</span></div>`;
      }).join('')}
      <div class="secao">Anéis</div>
      ${s.aneis.map((an) => {
        const ok = an.etapas.filter((e) => e.ok).length;
        return `<div class="cartao" style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <span class="serif" style="font-size:17px">${esc(an.nome)}</span>
            <span style="font-size:12px;color:var(--texto3)">${ok}/${an.etapas.length}</span></div>
          <div class="prog" style="margin-top:10px"><i style="width:${(ok / an.etapas.length * 100).toFixed(0)}%"></i></div>
        </div>`;
      }).join('')}
      ${A.podaLiberada() ? '<button class="acao primaria" id="btn-poda" style="margin-top:14px">✂ PODAR</button>' : ''}`;

    desenharArvore();
  }

  function desenharArvore() {
    const cv = $('#arvore-canvas'); if (!cv) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = cv.clientWidth, h = 200;
    cv.width = w * dpr; cv.height = h * dpr;
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    g.clearRect(0, 0, w, h);
    const s = A.s;
    const total = Object.values(s.invest).reduce((a, b) => a + b, 0);
    const tronco = 6 + Math.min(16, s.nos.length * 0.9);
    const cor = getComputedStyle(document.documentElement).getPropertyValue('--acento').trim() || '#E8A33D';

    // tronco + anéis dos Anéis fechados
    g.strokeStyle = '#4A3B2A'; g.lineCap = 'round';
    g.lineWidth = tronco; g.beginPath(); g.moveTo(w / 2, h - 4); g.lineTo(w / 2, h - 62); g.stroke();
    const aneis = s.marcas.aneisFechados;
    for (let i = 0; i < aneis; i++) {
      g.strokeStyle = cor; g.globalAlpha = .5; g.lineWidth = 1.5;
      g.beginPath(); g.arc(w / 2, h - 14 - i * 8, tronco / 2 + 3, Math.PI, 0); g.stroke();
      g.globalAlpha = 1;
    }

    // um galho por Ramo, espessura pelo investimento
    DB.RAMOS.forEach((r, i) => {
      const inv = s.invest[r.id] || 0;
      const q = s.nos.filter((n) => n.startsWith(r.id + ':')).length;
      const ang = -Math.PI / 2 + (i - (DB.RAMOS.length - 1) / 2) * 0.36;
      const len = 46 + Math.min(84, q * 17 + (total ? inv / total * 44 : 0));
      const x0 = w / 2, y0 = h - 62;
      galho(g, x0, y0, ang, len, 2 + Math.min(7, q * .9), q, cor, '#5A4632');
    });
  }
  function galho(g, x, y, ang, len, esp, prof, cor, corRamo) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    g.strokeStyle = corRamo; g.globalAlpha = .8; g.lineWidth = esp;
    g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(ang - .2) * len * .6, y + Math.sin(ang - .2) * len * .6, x2, y2);
    g.stroke(); g.globalAlpha = 1;
    if (prof > 0) {
      g.fillStyle = cor;
      for (let k = 0; k < Math.min(prof, 5); k++) {
        const t = (k + 1) / (Math.min(prof, 5) + 1);
        g.beginPath(); g.arc(x + (x2 - x) * t, y + (y2 - y) * t, 2.4, 0, 7); g.fill();
      }
      if (prof >= 2) {
        galho(g, x2, y2, ang - .45, len * .52, esp * .6, prof - 2, cor, corRamo);
        galho(g, x2, y2, ang + .45, len * .52, esp * .6, prof - 2, cor, corRamo);
      }
    }
  }

  /* ─── HERBÁRIO ────────────────────────────────────────────────────────── */
  const FILTROS = [['curso', 'Em curso'], ['semeado', 'Semeado'], ['prensado', 'Prensado'], ['deixado', 'Deixado ir']];
  let filtro = 'curso';

  function herbario() {
    const s = A.s;
    const enx = A.enxertosDisponiveis();
    const lista = s.folhas.filter((f) => f.estado === filtro);

    $('#tela-herbario').innerHTML = `
      <div class="busca">
        <input id="busca" type="search" inputmode="search" placeholder="fala ou escreve o nome" autocomplete="off">
        <button class="voz" id="btn-voz" title="ditar" aria-label="ditar">${ICO.mic}</button>
      </div>
      <div class="resultados" id="resultados"></div>

      ${enx.length ? `
        <div class="secao">Enxerto disponível</div>
        ${enx.map((e, i) => `<div class="enxerto-banner">
          <div class="par">❧ ${esc(e.ta)} &nbsp;✛&nbsp; ❧ ${esc(e.tb)}</div>
          <div class="nm">${esc(e.nome)}</div>
          <div class="tx">${esc(e.txt)}</div>
          <button data-enx="${i}">ENXERTAR · +${e.curado ? 4 : 2}% em ${DB.RAMOS.find((r) => r.id === e.ramo).nome}</button>
        </div>`).join('')}` : ''}

      <div class="secao">Herbário · ${s.folhas.length} ${s.folhas.length === 1 ? 'folha' : 'folhas'}</div>
      <div class="chips">
        ${FILTROS.map(([k, n]) => `<button class="chip" data-filtro="${k}" aria-pressed="${filtro === k}">${n} ${s.folhas.filter((f) => f.estado === k).length || ''}</button>`).join('')}
      </div>
      ${lista.length ? lista.map((f) => folhaHTML(f)).join('')
        : `<p class="mn" style="color:var(--texto3);padding:16px 0">nada aqui. busque uma obra acima — dois toques e ela existe.</p>
           <div class="secao">Sugestões do catálogo</div>
           ${DB.CATALOGO.slice(0, 4).map((c) => resHTML(c, 'catálogo')).join('')}`}`;
    $('#tela-herbario')._enx = enx;
  }

  function folhaHTML(f) {
    const pc = f.total ? Math.min(1, f.prog / f.total) : 0;
    const u = UNID[f.k] || '';
    return `<div class="folha" data-folha="${f.id}">
      <div class="capa">${capaSVG(f.t, f.k)}</div>
      <div class="info">
        <div class="tt">${esc(f.t)}</div>
        <div class="mt">${f.estado === 'prensado' ? 'prensado' : `${f.prog}${u ? ' ' + u : ''} / ${f.total}${u ? ' ' + u : ''}`} · ${NOME_K[f.k] || f.k}</div>
        <div class="prog"><i style="width:${(pc * 100).toFixed(0)}%"></i></div>
      </div>
      ${f.estado === 'prensado' || f.estado === 'deixado' ? ''
        : `<button class="mais" data-avancar="${f.id}" title="avançar">＋</button>`}
    </div>`;
  }
  function resHTML(c, fonte) {
    return `<button class="res" data-add="${esc(c.t)}" data-fonte="${esc(fonte || '')}">
      <div class="capa">${capaSVG(c.t, c.k)}</div>
      <div class="info">
        <div class="tt">${esc(c.t)}</div>
        <div class="mt">${NOME_K[c.k] || c.k} · ${c.y || '—'} · ${c.total} ${UNID[c.k] || ''}${c.nota ? ' · ★ ' + c.nota : ''}</div>
        <div class="fonte">${esc(fonte || '')}</div>
      </div></button>`;
  }

  /* ─── ESTUFA ──────────────────────────────────────────────────────────── */
  function estufa() {
    const s = A.s;
    const minhas = DB.INCLUSOES.filter((i) => s.inclusoes[i.id]);
    const vagas = Math.max(8, Math.ceil(minhas.length / 4) * 4);
    const est = A.estacao();
    let html = '';
    for (let p = 0; p < vagas / 4; p++) {
      html += '<div class="prateleira">';
      for (let k = 0; k < 4; k++) {
        const inc = minhas[p * 4 + k];
        html += inc
          ? `<div class="vaga" data-abrir-inc="${inc.id}">${blocoHTML(inc, s.inclusoes[inc.id].estagio)}<div class="lb">${esc(inc.nome)}</div></div>`
          : '<div class="vaga vazia"><div class="bloco" style="opacity:.12"><div class="cubo"><div class="f f1"></div><div class="f f3"></div></div></div></div>';
      }
      html += '</div>';
    }
    const proximas = DB.INCLUSOES.filter((i) => !s.inclusoes[i.id]).slice(0, 3);

    $('#tela-estufa').innerHTML = `
      <div class="estufa"><div class="vidro"></div>${html}</div>
      <p style="text-align:center;color:var(--texto3);font-size:12px;margin-top:14px">
        ${est.nome} · ${est.tema}</p>
      ${proximas.length ? `<div class="secao">Ainda em resina</div>
        ${proximas.map((i) => `<div class="ramo-linha"><span class="g">·</span>
          <span class="nm" style="color:var(--texto3)">${esc(i.nome)}</span>
          <span class="qt">${esc(i.dica)}</span></div>`).join('')}` : ''}`;
  }

  function abrirInclusao(id) {
    const def = DB.INCLUSOES.find((i) => i.id === id), st = A.s.inclusoes[id];
    if (!def || !st) return;
    const custo = A.CUSTO_ALIM[st.estagio];
    const nomes = ['Dormente', 'Desperta', 'Plena'];
    lamina(`
      <div style="text-align:center;padding:10px 0 4px">${blocoHTML(def, st.estagio, true)}</div>
      <h3 style="text-align:center">${esc(def.nome)}</h3>
      <p class="sub" style="text-align:center">${esc(def.lore)}</p>
      <div class="ramo-linha"><span class="g">${DB.RAMOS.find((r) => r.id === def.ramo).glifo}</span>
        <span class="nm">${nomes[st.estagio]}</span>
        <span class="qt">afinidade ${DB.RAMOS.find((r) => r.id === def.ramo).nome}</span></div>
      <div class="acoes">
        ${st.estagio < 2
          ? `<button class="acao ${A.seiva() >= custo ? 'primaria' : ''}" data-alimentar="${id}">
               ALIMENTAR · ${custo}${G}</button>`
          : '<div class="acao" style="text-align:center;color:var(--seiva)">plena. ela já tem luz própria.</div>'}
      </div>
      <p style="color:var(--texto3);font-size:11.5px;margin-top:12px">
        Seiva investida aqui não vira nó de Ramo. É uma escolha, não um erro.</p>`,
      (el) => { UI.somDe(id); girarManual(el); });
  }
  /* arraste para girar o bloco grande */
  function girarManual(escopo) {
    const bloco = escopo.querySelector('.bloco.grande'); if (!bloco) return;
    const cubo = bloco.querySelector('.cubo');
    let arrastando = false, x0 = 0, y0 = 0, rx = 12, ry = 28;
    const set = () => { cubo.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };
    bloco.addEventListener('pointerdown', (e) => { arrastando = true; bloco.classList.add('manual'); x0 = e.clientX; y0 = e.clientY; set(); });
    window.addEventListener('pointermove', (e) => {
      if (!arrastando) return;
      ry += (e.clientX - x0) * .6; rx -= (e.clientY - y0) * .4;
      rx = Math.max(-70, Math.min(70, rx)); x0 = e.clientX; y0 = e.clientY; set();
    });
    window.addEventListener('pointerup', () => { arrastando = false; });
  }

  /* ─── ESTRATO ─────────────────────────────────────────────────────────── */
  const RAR = { casca: 'Casca', cerne: 'Cerne', ambar: 'Âmbar', prisma: 'Prisma' };
  let filtroR = 'todos';

  function estrato() {
    const s = A.s, st = A.stats(), col = A.colheitaComum();
    // camadas por mês, a partir do ledger
    const meses = {};
    s.ledger.forEach((e) => { const m = new Date(e.t).toISOString().slice(0, 7); meses[m] = (meses[m] || 0) + e.s; });
    const chaves = Object.keys(meses).sort().reverse();
    const maxM = Math.max(1, ...Object.values(meses));

    const fosseis = DB.FOSSEIS.filter((f) => filtroR === 'todos' || f.r === filtroR);
    const ganhos = fosseis.filter((f) => s.fosseis.includes(f.id));
    const faltam = fosseis.filter((f) => !s.fosseis.includes(f.id));

    $('#tela-estrato').innerHTML = `
      <div class="secao">Estação de ${col.est.nome}</div>
      <div class="cartao">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">
          <span class="serif" style="font-size:16px">Colheita Comum</span>
          <span style="font-size:12px;color:var(--texto3)">estimativa local</span>
        </div>
        <div class="prog"><i style="width:${(col.pc * 100).toFixed(0)}%"></i></div>
        <p style="font-size:12px;color:var(--texto2);margin:10px 0 0">
          sua contribuição na estação: ${col.minha}${G} · o marco 1 é liberado no fim, cumprido ou não.</p>
      </div>

      <div class="secao">Seu estrato</div>
      <div class="estrato">
        ${chaves.length ? chaves.map((m) => {
          const alt = 16 + Math.round((meses[m] / maxM) * 34);
          const [ano, mes] = m.split('-');
          return `<div class="camada-linha" style="height:${alt}px">
            <span class="lb">${mes}/${ano.slice(2)}</span>
            <div class="faixa" style="background:linear-gradient(90deg,var(--ambar) ${(meses[m] / maxM * 100).toFixed(0)}%, transparent 0)"></div>
            <span class="lb" style="color:var(--seiva)">${meses[m]}${G}</span></div>`;
        }).join('') : '<div class="camada-linha" style="height:44px"><span class="lb">sem camadas ainda</span></div>'}
      </div>

      <div class="secao">Epítetos</div>
      <div class="epitetos">
        ${s.epitetos.map((e, i) => {
          const def = DB.EPITETOS.find((x) => x.id === e);
          return `<button class="slot ${def ? 'on' : ''}" data-epiteto="${i}">${def ? esc(def.nome) : 'vazio'}</button>`;
        }).join('')}
      </div>

      <div class="secao">Fósseis · ${s.fosseis.length}/${DB.FOSSEIS.length}</div>
      <div class="chips">
        <button class="chip" data-rar="todos" aria-pressed="${filtroR === 'todos'}">Todos</button>
        ${Object.entries(RAR).reverse().map(([k, n]) => `<button class="chip" data-rar="${k}" aria-pressed="${filtroR === k}">${n}</button>`).join('')}
      </div>
      ${ganhos.map((f) => fossilHTML(f, true)).join('')}
      ${faltam.map((f) => fossilHTML(f, false, st)).join('')}`;
  }

  function fossilHTML(f, ganho, st) {
    let nome = f.nome, dd = f.d;
    let oc = false;
    if (!ganho && f.oculto) { oc = true; nome = '———'; dd = f.meia && meioCaminho(f, st) ? f.meia : '???'; }
    return `<div class="fossil ${ganho ? '' : 'travado'} ${oc ? 'oculto' : ''}">
      <span class="g">${ganho ? '◆' : '·'}</span>
      <div class="info"><div class="nm">${esc(nome)}</div><div class="dd">${esc(dd)}</div></div>
      <span class="r r-${f.r}">${RAR[f.r]}</span></div>`;
  }
  /* dica só aparece com metade do critério cumprido */
  function meioCaminho(f, st) {
    if (!st) return false;
    const m = { o1: st.selagens >= 3, o2: st.folhasPrensadas >= 5, o3: st.deixadas >= 1,
                o4: st.lampoAtendidos >= 5, o5: st.selagens >= 3 };
    return !!m[f.id];
  }

  window.TELAS = { hoje, arvore, herbario, estufa, estrato, lamina, abrirInclusao,
                   folhaHTML, resHTML, desenharArvore, proximoBroto,
                   get filtro() { return filtro; }, set filtro(v) { filtro = v; },
                   set filtroR(v) { filtroR = v; }, UNID, NOME_K };
})();
