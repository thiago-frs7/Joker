/* ÂMBAR · átomos de interface, arte procedural e feedback sensorial
 * Orçamento: háptico + partícula em ~120 ms, número flutuante em 300 ms. */
(function () {
  'use strict';
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* glifos de linha: nenhum emoji colorido no produto final */
  const G = '<svg class="ug" viewBox="0 0 12 16" aria-hidden="true"><path d="M6 1C3 6 1 8.6 1 11a5 5 0 0 0 10 0C11 8.6 9 6 6 1z" fill="currentColor" opacity=".92"/></svg>';
  const S = 'stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const ICO = {
    hoje:     `<svg viewBox="0 0 24 24" ${S}><path d="M12 21v-8"/><path d="M12 13c0-4-3-6-6-6 0 4 3 6 6 6z"/><path d="M12 13c0-4 3-6 6-6 0 4-3 6-6 6z"/></svg>`,
    arvore:   `<svg viewBox="0 0 24 24" ${S}><path d="M12 21v-7"/><path d="M12 14 7.5 9.5M12 14l4.5-4.5M12 9.5V6"/><path d="M5 10a7 7 0 0 1 14 0"/></svg>`,
    herbario: `<svg viewBox="0 0 24 24" ${S}><path d="M4 20C4 11 11 4 20 4c0 9-7 16-16 16z"/><path d="M4 20 18 6"/></svg>`,
    estufa:   `<svg viewBox="0 0 24 24" ${S}><path d="M3 21V9l9-6 9 6v12z"/><path d="M12 3v18M3 12h18"/></svg>`,
    estrato:  `<svg viewBox="0 0 24 24" ${S}><path d="M5 7h14M3 12h18M6 17h12"/></svg>`,
    mic:      `<svg viewBox="0 0 24 24" ${S}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>`,
    vendaval: `<svg viewBox="0 0 24 24" ${S}><path d="M4 7h13a3 3 0 1 0-3-3"/><path d="M3 12h16"/><path d="M6 17h10a3 3 0 1 1-3 3"/></svg>`,
  };

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }

  /* ─── capa procedural (offline, determinística) ────────────────────────── */
  const MATIZ = { livro: 32, manga: 18, anime: 268, jogo: 292, filme: 210, serie: 196, album: 140 };
  function capaSVG(titulo, k) {
    const h = hash(titulo), id = 'g' + (h % 99999);
    const mat = (MATIZ[k] ?? 32) + (h % 22) - 11;
    const c1 = `hsl(${mat} 14% 24%)`, c2 = `hsl(${mat} 11% 12%)`;
    const ini = titulo.replace(/[^A-Za-zÀ-ú ]/g, '').split(/\s+/).filter(Boolean)
      .slice(0, 2).map((w) => w[0].toUpperCase()).join('');
    let linhas = '';
    for (let i = 0; i < 7; i++) {
      const y = 8 + i * 9 + (hash(titulo + i) % 4);
      linhas += `<path d="M2 ${y} Q26 ${y - 4 + (i % 3) * 3} 50 ${y}" stroke="hsl(${mat} 18% 50%)" stroke-width=".5" fill="none" opacity=".22"/>`;
    }
    return `<svg viewBox="0 0 52 74" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      <rect width="52" height="74" fill="url(#${id})"/>${linhas}
      <rect x="1" y="1" width="50" height="72" fill="none" stroke="hsl(${mat} 16% 44%)" stroke-width=".7" opacity=".5"/>
      <text x="26" y="43" text-anchor="middle" font-family="Georgia,serif" font-size="19"
        fill="hsl(${mat} 20% 70%)" opacity=".85">${esc(ini || '·')}</text></svg>`;
  }

  /* ─── criaturas em resina ─────────────────────────────────────────────── */
  const T = 'stroke="#3A2405" stroke-width="1.4" fill="none" stroke-linecap="round"';
  const BICHOS = {
    beetle: `<ellipse cx="20" cy="21" rx="9" ry="12" ${T}/><path d="M20 9v24" ${T}/><path d="M11 14 4 9M11 21H3M11 28 4 33M29 14l7-5M29 21h8M29 28l7 5" ${T}/><circle cx="20" cy="7" r="3" ${T}/>`,
    moth: `<path d="M20 12v18" ${T}/><path d="M20 15C12 6 4 10 6 19s10 8 14 2" ${T}/><path d="M20 15c8-9 16-5 14 4s-10 8-14 2" ${T}/><path d="M18 11 14 5M22 11l4-6" ${T}/>`,
    ant: `<circle cx="20" cy="10" r="4" ${T}/><circle cx="20" cy="19" r="3.5" ${T}/><ellipse cx="20" cy="30" rx="5.5" ry="7" ${T}/><path d="M17 8l-4-5M23 8l4-5M16 18l-8-3M24 18l8-3M16 22l-8 4M24 22l8 4" ${T}/>`,
    bee: `<ellipse cx="20" cy="22" rx="7" ry="11" ${T}/><path d="M13 18h14M13 24h14" ${T}/><circle cx="20" cy="9" r="3.5" ${T}/><path d="M14 13C6 8 2 16 9 20M26 13c8-5 12 3 5 7" ${T}/>`,
    butterfly: `<path d="M20 12v17" ${T}/><path d="M19 16C10 6 2 12 6 20s10 6 13 0M21 16c9-10 17-4 13 4s-10 6-13 0" ${T}/><path d="M18 11l-3-6M22 11l3-6" ${T}/>`,
    spider: `<circle cx="20" cy="21" r="7" ${T}/><path d="M14 16 4 8M14 20H3M14 25 4 32M26 16l10-8M26 20h11M26 25l10 7" ${T}/><circle cx="20" cy="12" r="3" ${T}/>`,
    seed: `<path d="M20 6c9 8 9 20 0 28C11 26 11 14 20 6z" ${T}/><path d="M20 10v20" ${T}/>`,
    feather: `<path d="M20 4c8 10 6 24-2 32" ${T}/><path d="M19 12l-7 2M20 18l-8 3M21 24l-7 3M19 10l7 1M20 16l7 2M21 22l6 3" ${T}/>`,
    dragonfly: `<path d="M20 6v28" ${T}/><path d="M18 14C8 10 2 16 8 19s8 0 10-2M22 14c10-4 16 2 10 5s-8 0-10-2" ${T}/><path d="M19 22c-8-2-12 4-7 6s7-2 8-3M21 22c8-2 12 4 7 6s-7-2-8-3" ${T}/>`,
    firefly: `<circle cx="20" cy="26" r="8" fill="#FFE9A8" opacity=".55"/><ellipse cx="20" cy="22" rx="5" ry="8" ${T}/><path d="M15 16C8 11 4 18 10 20M25 16c7-5 11 2 5 4" ${T}/>`,
    leaf: `<path d="M8 32C8 14 20 6 32 6c0 18-12 26-24 26z" ${T}/><path d="M8 32 32 6M14 26l4-9M20 22l4-9" ${T}/>`,
    ring: `<circle cx="20" cy="20" r="14" ${T}/><circle cx="20" cy="20" r="9" ${T}/><circle cx="20" cy="20" r="4" ${T}/>`,
  };
  function bichoSVG(tipo) {
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">${BICHOS[tipo] || BICHOS.seed}</svg>`;
  }

  const ESTAGIOS = ['dormente', 'desperta', 'plena'];
  function blocoHTML(def, estagio, grande) {
    const cls = ['bloco', ESTAGIOS[estagio] || 'dormente', grande ? 'grande' : ''].join(' ');
    return `<div class="${cls}" data-inc="${def.id}"><div class="cubo">
      <div class="f f1"></div><div class="f f2"></div><div class="f f3"></div>
      <div class="f f4"></div><div class="f f5"></div><div class="f f6"></div>
      <div class="bicho">${bichoSVG(def.bicho)}</div></div></div>`;
  }

  /* ─── feedback sensorial ──────────────────────────────────────────────── */
  let ctxAudio = null;
  function som(freq, dur = 0.28, tipo = 'sine', vol = 0.16) {
    if (!AMBAR.s.prefs.som) return;
    try {
      ctxAudio = ctxAudio || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctxAudio.createOscillator(), g = ctxAudio.createGain();
      o.type = tipo; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, ctxAudio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctxAudio.currentTime + dur);
      o.connect(g).connect(ctxAudio.destination); o.start(); o.stop(ctxAudio.currentTime + dur);
    } catch (e) {}
  }
  const somDe = (id) => som(180 + (hash(id) % 9) * 55, 0.9, 'triangle', 0.2);
  function haptic(p) { if (AMBAR.s.prefs.haptic && navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} }

  /* número flutuante + faíscas, ancorado no elemento tocado */
  function ganho(el, q) {
    const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2 - 20, top: innerHeight / 2, width: 40 };
    const x = r.left + r.width / 2, y = r.top;
    const n = document.createElement('div');
    n.className = 'flut'; n.innerHTML = (typeof q === 'number' ? '+' + q : q) + G;
    n.style.left = (x - 34) + 'px'; n.style.top = y + 'px';
    document.body.appendChild(n); setTimeout(() => n.remove(), 1150);
    for (let i = 0; i < 7; i++) {
      const f = document.createElement('div'); f.className = 'faisca';
      f.style.left = x + 'px'; f.style.top = (y + 10) + 'px';
      f.style.setProperty('--dx', (Math.random() * 90 - 45) + 'px');
      f.style.setProperty('--dy', (-25 - Math.random() * 55) + 'px');
      f.style.animationDelay = (i * 18) + 'ms';
      document.body.appendChild(f); setTimeout(() => f.remove(), 900);
    }
    haptic(18); som(520 + Math.min(typeof q === 'number' ? q : 40, 90) * 4, 0.16, 'sine', 0.1);
  }

  let torradaT = null;
  function torrada(msg, ms = 3200) {
    const el = $('#torrada'); el.textContent = msg; el.classList.add('on');
    clearTimeout(torradaT); torradaT = setTimeout(() => el.classList.remove('on'), ms);
  }

  /* ─── celebração (fila: nunca duas seguidas) ──────────────────────────── */
  let fila = [], mostrando = false, ultima = 0;
  function celebrar(c) {
    if (mostrando || Date.now() - ultima < 45000) { fila.push(c); return; }
    mostrando = true; ultima = Date.now();
    $('#cel-n').textContent = c.num || '';
    $('#cel-t').textContent = c.titulo;
    $('#cel-p').textContent = c.texto || '';
    $('#celebra').classList.add('on');
    haptic([0, 40, 60, 90]); som(196, 1.4, 'triangle', 0.22);
    setTimeout(() => som(294, 1.6, 'sine', 0.14), 260);
  }
  function fecharCelebra() {
    $('#celebra').classList.remove('on'); mostrando = false;
  }
  function escoarFila() {                       /* chamado na troca de tela */
    if (!mostrando && fila.length) { ultima = 0; celebrar(fila.shift()); }
  }

  window.UI = { $, $$, esc, hash, G, ICO, capaSVG, bichoSVG, blocoHTML, ESTAGIOS,
                som, somDe, haptic, ganho, torrada, celebrar, fecharCelebra, escoarFila };
})();
