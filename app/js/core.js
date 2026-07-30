/* ÂMBAR · núcleo
 * Regra absoluta deste arquivo: NÃO EXISTE SUBTRAÇÃO DE ÂMBAR.
 * O ledger é append-only. Nenhuma função aqui remove, edita ou zera uma entrada.
 * Ver docs/4-progressao-matematica.md
 */
(function () {
  'use strict';
  const DB = window.DB;
  const CHAVE = 'ambar.v1';

  /* ─── tempo ───────────────────────────────────────────────────────────── */
  const dia = (d = new Date()) => {
    const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4);
    return z.toISOString().slice(0, 10);
  };
  const diasEntre = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 864e5);
  const semanaDe = (d = new Date()) => {
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    t.setDate(t.getDate() - ((t.getDay() + 6) % 7));           // segunda
    return dia(t);
  };
  const mesDe = (d = new Date()) => dia(d).slice(0, 7);

  /* ─── estado ──────────────────────────────────────────────────────────── */
  const inicial = () => ({
    v: 1,
    criado: Date.now(),
    ledger: [],                    // append-only: {t, s, k, r}
    gasto: 0,
    nos: [],                       // 'ramo:indice'
    invest: {},                    // ramo -> seiva investida
    folhas: [],
    ciclos: DB.CICLOS_SEMENTE.map((c) => ({ ...c, ultimo: null })),
    aneis: DB.ANEIS_SEMENTE.map((a) => ({ ...a, etapas: a.etapas.map((t) => ({ t, ok: false })) })),
    brotos: [],
    adiados: {},
    elos: 0, elosMax: 0, ultimoCiclo: null, congelado: 0,
    bruma: { mes: mesDe(), fichas: 2 },
    inclusoes: {},                 // id -> {estagio 0|1|2, alim}
    fosseis: [],
    epitetos: [null, null],
    vendaval: { semana: semanaDe(), dano: 0, vencido: false },
    enxertos: [],
    silhueta: null, silhuetaCalc: 0,
    podas: 0,
    marcas: {                      // gatilhos de Fósseis Ocultos
      selagemMadrugada: false, selagemPerfeita: false, obraEstrangeira: false,
      lampoAtendidos: 0, deixadas: 0, maiorPausa: 0, diasRetorno: 0,
      selagens: 0, vendavaisVencidos: 0, aneisFechados: 0,
      brotosFeitos: 0, ciclosFeitos: 0,
    },
    ultimoAcesso: dia(),
    prefs: { tema: 'escuro', som: true, haptic: true },
    lampo: { ultimo: 0, ativo: null },
  });

  let s = inicial();

  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (bruto) {
        const salvo = JSON.parse(bruto);
        s = Object.assign(inicial(), salvo);
        s.marcas = Object.assign(inicial().marcas, salvo.marcas || {});
        s.prefs = Object.assign(inicial().prefs, salvo.prefs || {});
      }
    } catch (e) { console.warn('estado ilegível, começando limpo', e); }
    manutencaoDiaria();
    return s;
  }
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(s)); } catch (e) {} };

  /* ─── economia ────────────────────────────────────────────────────────── */
  const ambar = () => s.ledger.reduce((a, e) => a + e.s, 0);
  const seiva = () => Math.max(0, ambar() - s.gasto);

  const A = (n) => Math.round(60 * Math.pow(n, 1.55));
  const camada = () => Math.max(1, Math.floor(Math.pow(ambar() / 60, 1 / 1.55)));
  function progressoCamada() {
    const n = camada(), a = ambar(), base = A(n), topo = A(n + 1);
    return { n, a, base, topo, pc: Math.max(0, Math.min(1, (a - base) / (topo - base))) };
  }

  const multCorrente = () => 1 + 0.04 * Math.min(s.elos, 12);
  const multEnxerto = (ramo) => 1 + Math.min(0.30, 0.02 * s.enxertos.filter((e) => e.ramo === ramo).length);
  const multCerne = () => 1 + Math.min(0.40, 0.08 * s.podas);
  function multFoco(min, interrup) {
    const bruto = 1 + 0.015 * Math.min(min, 40);
    const pureza = Math.max(0.40, 1 - 0.20 * interrup);
    return 1 + (bruto - 1) * pureza;                     // sempre ≥ 1
  }

  /* S = B · D · C · F · E · (1+Enx) · (1+Cerne) */
  function calcular({ base, dif = 1, ramo = 'ordem', foco = 1, evento = 1 }) {
    return Math.max(1, Math.round(base * dif * multCorrente() * foco * evento
      * multEnxerto(ramo) * multCerne()));
  }

  /* único ponto de entrada de Seiva no sistema. Só empilha. */
  function registrar(op) {
    const q = calcular(op);
    s.ledger.push({ t: Date.now(), s: q, k: op.k || 'acao', r: op.r || '', m: op.ramo || 'ordem' });
    const novos = revisar();
    salvar();
    return { seiva: q, novos };
  }

  function gastar(q) {
    if (seiva() < q) return false;
    s.gasto += q;                     // gasto NUNCA toca o ledger → Âmbar intacto
    salvar();
    return true;
  }

  /* ─── corrente (chains) ───────────────────────────────────────────────── */
  const MARCOS = [30, 14, 7, 3, 0];
  function avaliarCorrente() {
    if (!s.ultimoCiclo) return;
    const g = diasEntre(s.ultimoCiclo, dia());
    if (g <= 1) { s.congelado = 0; return; }
    let perdidos = g - 1;
    if (s.bruma.mes !== mesDe()) s.bruma = { mes: mesDe(), fichas: 2 };
    while (perdidos > 0 && s.bruma.fichas > 0) { s.bruma.fichas--; perdidos--; }  // perdão silencioso
    if (perdidos <= 0) { s.congelado = 0; return; }
    if (perdidos <= 3) { s.congelado = perdidos; return; }                        // turvação
    s.elos = MARCOS.find((m) => m <= s.elos) ?? 0;                               // recua ao marco
    s.congelado = 0;
  }

  function marcarCiclo(c) {
    if (c.ultimo === dia()) return null;
    const hoje = dia();
    if (s.ultimoCiclo !== hoje) {
      const g = s.ultimoCiclo ? diasEntre(s.ultimoCiclo, hoje) : 1;
      s.elos = g <= 1 || s.congelado ? s.elos + 1 : Math.max(1, s.elos);
      s.elosMax = Math.max(s.elosMax, s.elos);
      s.ultimoCiclo = hoje;
      s.congelado = 0;
    }
    c.ultimo = hoje;
    s.marcas.ciclosFeitos++;
    return registrar({ base: 15, dif: c.dif, ramo: c.ramo, k: 'ciclo', r: c.nome });
  }

  /* ─── manutenção de abertura ──────────────────────────────────────────── */
  function manutencaoDiaria() {
    const hoje = dia();
    const pausa = s.ultimoAcesso ? diasEntre(s.ultimoAcesso, hoje) : 0;
    if (pausa > 1) {
      s.marcas.maiorPausa = Math.max(s.marcas.maiorPausa, pausa - 1);
      s.marcas.diasRetorno++;
    }
    s.ultimoAcesso = hoje;
    if (s.bruma.mes !== mesDe()) s.bruma = { mes: mesDe(), fichas: 2 };
    avaliarCorrente();
    if (s.vendaval.semana !== semanaDe()) s.vendaval = { semana: semanaDe(), dano: 0, vencido: false };
    s.pausaAtual = pausa;
    salvar();
  }

  /* ─── vendaval ────────────────────────────────────────────────────────── */
  function somaSemanal(inicioISO) {
    const ini = new Date(inicioISO + 'T00:00').getTime(), fim = ini + 7 * 864e5;
    return s.ledger.filter((e) => e.t >= ini && e.t < fim).reduce((a, e) => a + e.s, 0);
  }
  function vendavalHP() {
    const base = new Date(semanaDe() + 'T00:00');
    const semanas = [1, 2, 3, 4].map((i) => {
      const d = new Date(base); d.setDate(d.getDate() - 7 * i); return somaSemanal(dia(d));
    }).filter((v) => v > 0).sort((a, b) => a - b);
    if (semanas.length < 2) return 300;
    const m = semanas.length % 2
      ? semanas[(semanas.length - 1) / 2]
      : (semanas[semanas.length / 2 - 1] + semanas[semanas.length / 2]) / 2;
    return Math.max(300, Math.round(0.8 * m));
  }
  function danoVendaval(q) {
    if (s.vendaval.vencido) return null;
    s.vendaval.dano += q;
    if (s.vendaval.dano >= vendavalHP()) {
      s.vendaval.vencido = true;
      s.marcas.vendavaisVencidos++;
      const r = registrar({ base: 200, ramo: 'ordem', k: 'vendaval', r: 'tempestade vencida' });
      return r;
    }
    return null;
  }

  /* ─── ramos, nós, silhueta ────────────────────────────────────────────── */
  const custoNo = (t) => Math.round(50 * Math.pow(1.9, t - 1));
  const temNo = (ramo, i) => s.nos.includes(ramo + ':' + i);

  function nosDisponiveis(ramo) {
    const lista = DB.NOS[ramo];
    const out = [];
    lista.forEach((no, i) => {
      if (temNo(ramo, i)) return;
      const anteriores = lista.filter((n, j) => n.t === no.t - 1 && temNo(ramo, j)).length;
      if (no.t === 1 || anteriores > 0) {
        // bifurcação exclusiva na profundidade 2
        if (no.ramifica && lista.some((n, j) => n.ramifica && temNo(ramo, j))) return;
        out.push({ ramo, i, ...no, custo: custoNo(no.t) });
      }
    });
    return out;
  }
  /* a interface mostra no máximo 4 · custo mais baixo primeiro, Ramo mais ativo depois */
  function quatroNos() {
    const ativos = ramoAtividade();
    return DB.RAMOS.flatMap((r) => nosDisponiveis(r.id))
      .sort((a, b) => a.custo - b.custo || (ativos[b.ramo] || 0) - (ativos[a.ramo] || 0))
      .slice(0, 4);
  }
  /* Seiva por Ramo nos últimos 7 dias — decide quais 4 nós a tela oferece */
  function ramoAtividade() {
    const lim = Date.now() - 7 * 864e5, out = {};
    s.ledger.filter((e) => e.t >= lim).forEach((e) => { out[e.m] = (out[e.m] || 0) + e.s; });
    return out;
  }
  function comprarNo(n) {
    if (!gastar(n.custo)) return false;
    s.nos.push(n.ramo + ':' + n.i);
    s.invest[n.ramo] = (s.invest[n.ramo] || 0) + n.custo;
    revisar(); salvar();
    return true;
  }

  function calcularSilhueta(forcar) {
    const semana = 7 * 864e5;
    if (!forcar && Date.now() - s.silhuetaCalc < semana) return s.silhueta;
    const V = Object.values(s.invest).reduce((a, b) => a + b, 0);
    s.silhuetaCalc = Date.now();
    if (!V) { s.silhueta = null; salvar(); return null; }
    const p = Object.entries(s.invest).map(([r, v]) => [r, v / V]).sort((a, b) => b[1] - a[1]);
    const [t1, t2] = [p[0], p[1] || ['', 0]];
    if (t1[1] >= 0.25 && t2[1] >= 0.25 && t1[1] + t2[1] >= 0.55) {
      const k1 = [t1[0], t2[0]].sort().join('+');
      const def = DB.SILHUETAS[k1] || DB.SILHUETAS[[t2[0], t1[0]].join('+')];
      s.silhueta = def ? { chave: k1, ...def } : null;
    } else s.silhueta = null;
    salvar();
    return s.silhueta;
  }

  /* ─── herbário ────────────────────────────────────────────────────────── */
  const SEIVA_MIDIA = {
    livro: { por: 10, q: 1, fim: 20 }, manga: { por: 1, q: 3, fim: 30 },
    anime: { por: 1, q: 2, fim: 25 },  serie: { por: 1, q: 2, fim: 25 },
    jogo:  { por: 10, q: 1, fim: 25 }, filme: { por: 20, q: 2, fim: 8 },
    album: { por: 1, q: 4, fim: 4 },
  };
  function prensarFolha(f, estado) {
    const antes = f.estado; f.estado = estado;
    if (estado === 'prensado' && antes !== 'prensado') {
      f.prog = f.total;
      s.marcas.obraEstrangeira = s.marcas.obraEstrangeira || !!f.estrangeira;
      const r = registrar({ base: (SEIVA_MIDIA[f.k] || SEIVA_MIDIA.livro).fim, ramo: 'cultura', k: 'folha', r: f.t });
      salvar(); return r;
    }
    if (estado === 'deixado') {
      s.marcas.deixadas++;
      const bonus = temNo('cultura', 8) ? 25 : 10;
      const r = registrar({ base: bonus, ramo: 'cultura', k: 'folha', r: 'deixou ir · ' + f.t });
      salvar(); return r;
    }
    salvar(); return null;
  }
  function avancarFolha(f, passos = 1) {
    const cfg = SEIVA_MIDIA[f.k] || SEIVA_MIDIA.livro;
    f.prog = Math.min(f.total, f.prog + passos * cfg.por);
    if (f.estado === 'semeado') f.estado = 'curso';
    const r = registrar({ base: cfg.q * passos, ramo: 'cultura', k: 'progresso', r: f.t });
    if (f.prog >= f.total) { const p = prensarFolha(f, 'prensado'); if (p) r.seiva += p.seiva; r.prensou = true; }
    salvar(); return r;
  }

  /* ─── enxertos ────────────────────────────────────────────────────────── */
  function enxertosDisponiveis() {
    const pr = s.folhas.filter((f) => f.estado === 'prensado');
    const feitos = new Set(s.enxertos.map((e) => e.nome));
    const out = [];
    DB.ENXERTOS_CURADOS.forEach((c) => {
      if (feitos.has(c.nome)) return;
      const a = pr.find((f) => f.t === c.a), b = pr.find((f) => f.t === c.b);
      if (a && b) out.push({ ...c, curado: true, ta: a.t, tb: b.t });
    });
    const par = (x, y) => [x, y].sort().join('|');
    const jaVistos = new Set(out.map((o) => par(o.ta, o.tb))
      .concat(DB.ENXERTOS_CURADOS.map((c) => par(c.a, c.b)))
      .concat(s.enxertos.map((e) => par(e.a, e.b))));
    const min = temNo('cultura', 14) ? 1 : 2;
    for (let i = 0; i < pr.length; i++) for (let j = i + 1; j < pr.length; j++) {
      const com = (pr[i].tags || []).filter((t) => (pr[j].tags || []).includes(t));
      if (com.length < min || jaVistos.has(par(pr[i].t, pr[j].t))) continue;
      const nome = 'Ecos de ' + com[0].charAt(0).toUpperCase() + com[0].slice(1);
      if (feitos.has(nome) || out.some((o) => o.nome === nome)) continue;
      out.push({ nome, ramo: 'cultura', a: pr[i].t, b: pr[j].t, ta: pr[i].t, tb: pr[j].t,
        txt: 'Duas obras que dividem o mesmo chão: ' + com.slice(0, 2).join(' e ') + '.' });
    }
    return out.slice(0, 3);
  }
  function enxertar(e) {
    s.enxertos.push({ nome: e.nome, ramo: e.ramo, a: e.a, b: e.b, t: Date.now(), curado: !!e.curado });
    const r = registrar({ base: e.curado ? 60 : 30, ramo: e.ramo, k: 'enxerto', r: e.nome });
    revisar(); salvar();
    return r;
  }

  /* ─── inclusões ───────────────────────────────────────────────────────── */
  const CUSTO_ALIM = [400, 1600];
  function alimentar(id) {
    const inc = s.inclusoes[id];
    if (!inc || inc.estagio >= 2) return false;
    if (!gastar(CUSTO_ALIM[inc.estagio])) return false;
    inc.estagio++;
    const def = DB.INCLUSOES.find((i) => i.id === id);
    if (def) s.invest[def.ramo] = (s.invest[def.ramo] || 0) + 0;   // alimentar não conta p/ Silhueta
    revisar(); salvar();
    return true;
  }

  /* ─── estatísticas derivadas (predicados de Fóssil/Inclusão) ──────────── */
  function stats() {
    const inc = Object.values(s.inclusoes);
    return {
      acoes: s.ledger.length,
      ambar: ambar(), camada: camada(),
      elosMax: s.elosMax, elos: s.elos,
      folhasPrensadas: s.folhas.filter((f) => f.estado === 'prensado').length,
      enxertos: s.enxertos.length,
      inclusoesDespertas: inc.filter((i) => i.estagio >= 1).length,
      inclusoesPlenas: inc.filter((i) => i.estagio >= 2).length,
      silhuetaDefinida: !!s.silhueta,
      podas: s.podas,
      ...s.marcas,
    };
  }

  /* revisar: desbloqueia Fósseis e Inclusões. Só adiciona — nunca remove. */
  function revisar() {
    const st = stats(), novos = { fosseis: [], inclusoes: [] };
    DB.FOSSEIS.forEach((f) => {
      if (s.fosseis.includes(f.id)) return;
      try { if (f.p(st)) { s.fosseis.push(f.id); novos.fosseis.push(f); } } catch (e) {}
    });
    DB.INCLUSOES.forEach((i) => {
      if (s.inclusoes[i.id]) return;
      try { if (i.desbl(st)) { s.inclusoes[i.id] = { estagio: 0, alim: 0 }; novos.inclusoes.push(i); } } catch (e) {}
    });
    return novos;
  }

  /* ─── poda (New Game+) ────────────────────────────────────────────────── */
  const podaLiberada = () => camada() >= 30 && s.marcas.aneisFechados >= 1;
  function podar() {
    if (!podaLiberada()) return false;
    s.nos = []; s.invest = {}; s.gasto = ambar();   // zera o SALDO, não o Âmbar
    s.podas++; s.epitetos.push(null);
    s.silhueta = null; s.silhuetaCalc = 0;
    revisar(); salvar();
    return true;
  }

  /* ─── estação ─────────────────────────────────────────────────────────── */
  function estacao() {
    const m = new Date().getMonth();
    return DB.ESTACOES.find((e) => e.meses.includes(m)) || DB.ESTACOES[0];
  }
  /* Sem servidor não existe número global real. Estimativa local honesta. */
  function colheitaComum() {
    const est = estacao(), ini = new Date(); ini.setMonth(est.meses[0], 1);
    const dias = Math.max(1, Math.round((Date.now() - ini) / 864e5));
    const minha = s.ledger.filter((e) => e.t >= ini.getTime()).reduce((a, e) => a + e.s, 0);
    return { pc: Math.min(1, (dias / 90) * 0.72), minha, simulada: true, est };
  }

  window.AMBAR = {
    get s() { return s; }, carregar, salvar, dia, diasEntre, semanaDe,
    ambar, seiva, camada, progressoCamada, A,
    registrar, gastar, calcular, multFoco, multCorrente, multEnxerto, multCerne,
    marcarCiclo, avaliarCorrente, manutencaoDiaria,
    vendavalHP, danoVendaval, somaSemanal,
    custoNo, temNo, nosDisponiveis, quatroNos, comprarNo, calcularSilhueta,
    prensarFolha, avancarFolha, SEIVA_MIDIA,
    enxertosDisponiveis, enxertar, alimentar, CUSTO_ALIM,
    stats, revisar, podaLiberada, podar, estacao, colheitaComum,
    zerar() { localStorage.removeItem(CHAVE); s = inicial(); salvar(); },
  };
})();
