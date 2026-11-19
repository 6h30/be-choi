/* Bé chơi nào — phần lõi: cài đặt, âm thanh, giọng nói, hiệu ứng, tiện ích */
(function () {
  'use strict';
  const BE = window.BE = { GAMES: [], DATA: {} };

  const $ = (s, r = document) => r.querySelector(s);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  Object.assign(BE, { $, rand, pick, shuffle });

  /* ---------- Cài đặt (lưu trong máy) ---------- */
  const DEF = { volume: 0.8, voice: true, lang: 'vi', timer: 10, age: 3 };
  const S = BE.S = Object.assign({}, DEF);
  try { Object.assign(S, JSON.parse(localStorage.getItem('bechoi-v1') || '{}')); } catch (e) { }
  S.lang = 'en'; // the whole site is in English (older saved settings may say 'vi')
  BE.save = () => { try { localStorage.setItem('bechoi-v1', JSON.stringify(S)); } catch (e) { } };

  /* ---------- Âm thanh: tự tổng hợp bằng WebAudio, không cần tệp ---------- */
  const Snd = BE.Snd = (function () {
    let ctx = null, master = null, noise = null;
    function init() {
      if (ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try { ctx = new AC(); } catch (e) { return false; }
      master = ctx.createGain(); master.gain.value = S.volume;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp); comp.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    }
    function unlock() {
      if (!init()) return;
      if (ctx.state !== 'running') ctx.resume();
      decodeAll();
    }
    function vol(v) { if (master) master.gain.value = v; }
    function tone(f, o = {}) {
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime + (o.at || 0), dur = o.dur || 0.4;
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(o.vol == null ? 0.3 : o.vol, t + (o.att || 0.01));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(master);
      osc.start(t); osc.stop(t + dur + 0.05);
    }
    function hiss(o = {}) {
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime + (o.at || 0), dur = o.dur || 0.2;
      const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
      const fl = ctx.createBiquadFilter(); fl.type = o.ft || 'bandpass';
      fl.frequency.setValueAtTime(o.f || 1000, t);
      if (o.to) fl.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      fl.Q.value = o.q || 1;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(o.vol == null ? 0.3 : o.vol, t + (o.att || 0.01));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(fl); fl.connect(g); g.connect(master);
      src.start(t); src.stop(t + dur + 0.05);
    }
    // Giọng tổng hợp: sóng răng cưa (dây thanh) đi qua các bộ lọc "formant" (khoang miệng)
    // o.pts: đường cao độ [[0..1 theo thời gian, Hz]], o.fm: các formant (Hz hoặc [từ,đến]), o.vib: [tần số, độ sâu]
    function voc(o) {
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime + (o.at || 0), dur = o.dur;
      const osc = ctx.createOscillator(); osc.type = o.type || 'sawtooth';
      o.pts.forEach((p, i) => { const tt = t + p[0] * dur; if (i) osc.frequency.linearRampToValueAtTime(p[1], tt); else osc.frequency.setValueAtTime(p[1], tt); });
      if (o.vib) {
        const lfo = ctx.createOscillator(), lg = ctx.createGain();
        lfo.frequency.value = o.vib[0]; lg.gain.value = o.vib[1];
        lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + dur + 0.1);
      }
      const g = ctx.createGain(), v = o.vol == null ? 0.4 : o.vol;
      const att = Math.min(o.att || 0.03, dur * 0.3), rel = dur * 0.3;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + att);
      g.gain.setValueAtTime(v, t + dur - rel); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      const mix = ctx.createGain(); mix.gain.value = o.boost || 5;
      if (o.fm) o.fm.forEach(f => {
        const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = o.q || 5;
        b.frequency.setValueAtTime(Array.isArray(f) ? f[0] : f, t);
        if (Array.isArray(f)) b.frequency.linearRampToValueAtTime(f[1], t + dur);
        osc.connect(b); b.connect(mix);
      }); else osc.connect(mix);
      mix.connect(g); g.connect(master);
      osc.start(t); osc.stop(t + dur + 0.05);
    }
    // Tiếng kêu từng con vật (tự tổng hợp). Mỗi hàm trả về độ dài (giây).
    const ANIMAL = {
      '🐱'() { voc({ pts: [[0, 480], [.3, 820], [.65, 700], [1, 360]], dur: .85, fm: [[850, 550], [1900, 1500]], q: 7, vib: [6, 14] }); return .85; },
      '🐶'() { [0, .3].forEach(at => { voc({ at, pts: [[0, 270], [.3, 210], [1, 130]], dur: .2, fm: [[750, 520], [1300, 1000]], q: 3, vol: .4, att: .01 }); hiss({ at, f: 1600, dur: .1, vol: .16, q: .7 }); }); return .55; },
      '🐮'() { voc({ pts: [[0, 105], [.3, 135], [.8, 120], [1, 85]], dur: 1.5, fm: [[420, 320], [950, 720]], q: 5, vib: [5, 3], boost: 7 }); return 1.5; },
      '🦆'() { [0, .25, .5].forEach(at => voc({ at, pts: [[0, 560], [1, 400]], dur: .17, fm: [1100, 2100], q: 4, att: .01, vol: .45 })); return .75; },
      '🐔'() { [0, .17, .34, .58].forEach((a, i) => voc({ at: a, pts: [[0, 480 + i * 20], [.5, 650], [1, 380]], dur: .13, fm: [1200, 2300], q: 4, att: .01, vol: .38 })); return .8; },
      '🐓'() { voc({ pts: [[0, 480], [1, 800]], dur: .32, fm: [1300, 2600], q: 4, vib: [11, 25], vol: .35 }); voc({ at: .36, pts: [[0, 860], [.5, 740], [1, 640]], dur: .4, fm: [1300, 2600], q: 4, vib: [11, 25], vol: .35 }); voc({ at: .8, pts: [[0, 900], [1, 460]], dur: .55, fm: [1300, 2600], q: 4, vib: [11, 25], vol: .35 }); return 1.4; },
      '🐷'() { voc({ pts: [[0, 150], [.3, 260], [1, 120]], dur: .38, fm: [[500, 900], 1500], q: 4, vol: .5 }); voc({ at: .42, pts: [[0, 180], [1, 110]], dur: .26, fm: [[600, 800], 1400], q: 4, vol: .45 }); hiss({ at: .42, f: 2200, dur: .2, vol: .12, q: .8 }); return .75; },
      '🐸'() { [0, .55].forEach(g0 => { for (let i = 0; i < 4; i++) voc({ at: g0 + i * .055, type: 'square', pts: [[0, 300], [1, 230]], dur: .05, fm: [[800, 600], 1700], q: 4, att: .004, vol: .4 }); }); return 1.0; },
      '🐑'() { voc({ pts: [[0, 340], [1, 290]], dur: .95, fm: [[900, 700], [1500, 1700]], q: 6, vib: [30, 22], vol: .45, boost: 6 }); return .95; },
      '🐴'() { voc({ pts: [[0, 480], [.15, 1150], [.4, 920], [.7, 720], [1, 340]], dur: 1.3, fm: [[1500, 1200], 2800], q: 3, vib: [13, 45], vol: .4 }); return 1.3; },
      '🐦'() { [[0, 3000, 4300], [.13, 3200, 4500], [.26, 3000, 4300], [.46, 3800, 2900]].forEach(c => tone(c[1], { at: c[0], dur: .09, to: c[2], vol: .55 })); return .6; },
      '🦁'() { voc({ pts: [[0, 70], [.2, 115], [1, 55]], dur: 1.6, fm: [[320, 220], [750, 520]], q: 2, vib: [22, 16], vol: .3, boost: 6, att: .1 }); hiss({ f: 500, dur: 1.4, vol: .2, ft: 'lowpass', att: .1 }); return 1.6; },
      '🐘'() { voc({ pts: [[0, 300], [.25, 820], [.7, 760], [1, 480]], dur: 1.2, fm: [[1000, 1400], [2200, 3000]], q: 3, vib: [14, 32], vol: .4 }); return 1.2; },
      // Gecko: quick clicks, then "tac ... ke", twice
      '🦎'() { [0, .9].forEach(o => { [0, .07, .14].forEach(a => { tone(1500, { at: o + a, dur: .05, to: 900, type: 'square', vol: .12 }); hiss({ at: o + a, f: 3500, dur: .04, vol: .12, q: 1, ft: 'highpass' }); }); voc({ at: o + .24, pts: [[0, 720], [1, 520]], dur: .13, fm: [[1100, 800], [2200, 1800]], q: 5, vol: .45 }); voc({ at: o + .42, pts: [[0, 520], [1, 360]], dur: .3, fm: [[900, 700], [1800, 1400]], q: 5, vib: [14, 12], vol: .45 }); }); return 1.7; },
      '🐒'() { [0, .2, .45, .65].forEach((a, i) => voc({ at: a, pts: [[0, i % 2 ? 750 : 520], [.5, i % 2 ? 950 : 800], [1, i % 2 ? 700 : 560]], dur: .15, fm: [[950, 1300], 2300], q: 4, vol: .4 })); return .85; },
      '🐯'() { voc({ pts: [[0, 95], [.25, 150], [1, 70]], dur: 1.2, fm: [[330, 250], [780, 560]], q: 2, vib: [26, 18], vol: .32, boost: 6, att: .06 }); hiss({ f: 600, dur: 1.0, vol: .18, ft: 'lowpass', att: .06 }); return 1.2; },
      '🐻'() { voc({ pts: [[0, 100], [.3, 135], [1, 78]], dur: 1.1, fm: [[360, 290], [820, 620]], q: 2, vib: [24, 16], vol: .3, boost: 6, att: .08 }); hiss({ f: 450, dur: .9, vol: .16, ft: 'lowpass' }); return 1.1; },
      '🐺'() { voc({ type: 'triangle', pts: [[0, 330], [.3, 720], [.8, 740], [1, 480]], dur: 2.0, fm: [[800, 1100], [1700, 2000]], q: 3, vib: [5, 12], vol: .38, boost: 6, att: .2 }); return 2.0; },
      '🦉'() { [[0, .26], [.36, .26], [.85, .55]].forEach(c => tone(410, { at: c[0], dur: c[1], to: 360, vol: .45 })); return 1.4; },
      '🐝'() { voc({ pts: [[0, 180], [.5, 210], [1, 175]], dur: 1.1, fm: [[500, 800], [1100, 1400]], q: 2, vib: [35, 45], vol: .3 }); return 1.1; },
      '🐍'() { hiss({ f: 6000, dur: 1.3, vol: .28, ft: 'highpass', att: .15 }); hiss({ at: .1, f: 3500, dur: 1.1, vol: .12, q: .8, att: .2 }); return 1.3; },
      '🦗'() { [0, .4, .8].forEach(g => [0, .07, .14].forEach(p => tone(4300, { at: g + p, dur: .05, vol: .4 }))); return 1.1; },
      '🐐'() { voc({ pts: [[0, 430], [.6, 400], [1, 340]], dur: .85, fm: [[1100, 900], [1900, 2100]], q: 6, vib: [22, 28], vol: .42, boost: 6 }); return .85; },
      '🐬'() { [[0, 2000, 4500], [.28, 4300, 2400], [.55, 2500, 5200]].forEach(c => tone(c[1], { at: c[0], dur: .22, to: c[2], vol: .42 })); for (let i = 0; i < 8; i++) hiss({ at: .85 + i * .05, f: 5500, dur: .02, vol: .18, ft: 'highpass' }); return 1.3; },
      '🐋'() { voc({ type: 'triangle', pts: [[0, 170], [.4, 420], [.75, 280], [1, 190]], dur: 2.2, vib: [4, 10], vol: .45, boost: 1.8, att: .25 }); return 2.2; },
      '🐰'() { [0, .2].forEach(a => voc({ at: a, pts: [[0, 1300], [1, 1800]], dur: .1, fm: [2500, 3500], q: 3, vol: .35 })); return .4; },
      '🦃'() { voc({ pts: [[0, 400], [.1, 650], [.2, 420], [.3, 700], [.4, 430], [.5, 720], [.6, 440], [.7, 700], [.8, 450], [1, 380]], dur: .9, fm: [[900, 1300], 2000], q: 4, vol: .4 }); return .9; },
      '🦜'() { [[0, .4, 900, 1400, 700], [.5, .35, 1100, 1500, 800]].forEach(c => voc({ at: c[0], pts: [[0, c[2]], [.35, c[3]], [1, c[4]]], dur: c[1], fm: [[1500, 2000], 3000], q: 3, vol: .4 })); return .9; },
      '🦊'() { [0, .3, .6].forEach(a => voc({ at: a, pts: [[0, 900], [.4, 1500], [1, 700]], dur: .22, fm: [1400, 2600], q: 4, vol: .4 })); return .85; },
      '🐧'() { [0, .5].forEach(a => voc({ at: a, pts: [[0, 500], [.3, 720], [1, 520]], dur: .45, fm: [[1000, 1200], [2000, 2200]], q: 3, vib: [15, 40], vol: .4 })); return 1.0; }
    };
    // Vehicle sounds
    const VEH = {
      horn() { tone(392, { dur: .18, type: 'square', vol: .1 }); tone(494, { at: .24, dur: .18, type: 'square', vol: .1 }); return .5; },
      siren() { for (let i = 0; i < 4; i++) tone(i % 2 ? 650 : 880, { at: i * .28, dur: .27, type: 'triangle', vol: .18 }); return 1.1; },
      choo() { [0, .28, .56, .84].forEach(a => hiss({ at: a, f: 1800, to: 600, dur: .16, vol: .3, q: .6 })); tone(520, { at: 1.15, dur: .5, vol: .18, type: 'triangle' }); tone(655, { at: 1.15, dur: .5, vol: .14, type: 'triangle' }); return 1.7; },
      busHorn() { tone(220, { dur: .5, type: 'square', vol: .1 }); tone(277, { dur: .5, type: 'square', vol: .08 }); return .55; },
      plane() { hiss({ f: 300, to: 1600, dur: 1.2, vol: .25, ft: 'lowpass', att: .3 }); return 1.2; },
      heli() { for (let i = 0; i < 14; i++) hiss({ at: i * .075, f: 250, dur: .06, vol: .28, ft: 'lowpass' }); return 1.1; },
      bike() { tone(2200, { dur: .5, vol: .22 }); tone(2200, { at: .17, dur: .5, vol: .22 }); return .7; },
      tractor() { for (let i = 0; i < 10; i++) tone(90, { at: i * .1, dur: .07, type: 'square', vol: .12 }); return 1.0; },
      ship() { tone(180, { dur: .9, type: 'sawtooth', vol: .1 }); tone(135, { dur: .9, type: 'sawtooth', vol: .1 }); return 1.0; },
      rocket() { hiss({ f: 200, to: 1800, dur: 1.3, vol: .28, ft: 'lowpass' }); tone(80, { dur: 1.3, to: 300, type: 'sawtooth', vol: .08 }); return 1.3; }
    };
    const VEH_MAP = { '🚗': 'horn', '🚕': 'horn', '🚙': 'horn', '🚓': 'siren', '🚑': 'siren', '🚒': 'siren', '🚌': 'busHorn', '🚂': 'choo', '✈️': 'plane', '🚁': 'heli', '🚲': 'bike', '🚜': 'tractor', '🚢': 'ship', '⛵': 'ship', '🚀': 'rocket' };
    // Drum pads
    const DRUMS = [
      () => { tone(150, { dur: .35, to: 45, vol: .7 }); hiss({ f: 200, dur: .06, vol: .2, ft: 'lowpass' }); },
      () => { hiss({ f: 2200, dur: .18, vol: .35, q: .8 }); tone(200, { dur: .1, to: 140, type: 'triangle', vol: .25 }); },
      () => { hiss({ f: 9000, dur: .07, vol: .25, ft: 'highpass' }); },
      () => { tone(240, { dur: .3, to: 120, vol: .55 }); },
      () => { hiss({ f: 5000, dur: 1.0, vol: .25, ft: 'highpass', att: .005 }); },
      () => { [0, .02, .045].forEach(a => hiss({ at: a, f: 1500, dur: .05, vol: .3, q: 1 })); hiss({ at: .07, f: 1500, dur: .18, vol: .25, q: 1 }); },
      () => { tone(540, { dur: .25, type: 'square', vol: .12 }); tone(800, { dur: .25, type: 'square', vol: .12 }); },
      () => { tone(330, { dur: .2, to: 250, vol: .5 }); hiss({ f: 900, dur: .04, vol: .2, q: 2 }); }
    ];
    // ---- Real animal recordings (sounds/*.mp3). The synthesized sounds above are the fallback. ----
    const REAL = {};   // key -> { dur, raw, buf }
    let CREDITS = [];
    const KEY = { '🐱': 'cat', '🐶': 'dog', '🦎': 'gecko', '🐦': 'bird', '🦗': 'cricket', '🐰': 'bunny', '🐮': 'cow', '🐷': 'pig', '🐑': 'sheep', '🐐': 'goat',
      '🐴': 'horse', '🐔': 'chicken', '🦆': 'duck', '🐸': 'frog', '🐝': 'bee', '🐍': 'snake', '🦃': 'turkey', '🐓': 'rooster', '🦁': 'lion', '🐯': 'tiger',
      '🐘': 'elephant', '🐒': 'monkey', '🦜': 'parrot', '🐻': 'bear', '🐺': 'wolf', '🦉': 'owl', '🦊': 'fox', '🐧': 'penguin', '🐬': 'dolphin', '🐋': 'whale' };
    function decodeOne(k) {
      const s = REAL[k];
      if (!s || !s.raw || !ctx || s.buf || s.dec) return;
      s.dec = true;
      try { ctx.decodeAudioData(s.raw.slice(0), b => { s.buf = b; }, () => { s.bad = true; }); } catch (e) { s.bad = true; }
    }
    function decodeAll() { Object.keys(REAL).forEach(decodeOne); }
    function loadReal() {
      if (!window.fetch) return;
      fetch('sounds/index.json').then(r => r.json()).then(list => {
        CREDITS = list;
        list.forEach(m => {
          REAL[m.key] = { dur: m.dur };
          fetch('sounds/' + m.file).then(r => r.arrayBuffer()).then(ab => { REAL[m.key].raw = ab; decodeOne(m.key); }).catch(() => { delete REAL[m.key]; });
        });
      }).catch(() => { });
    }
    function playReal(k) {
      const s = REAL[k];
      if (!s || !s.buf || !ctx || ctx.state !== 'running') return false;
      const src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = s.buf; g.gain.value = 1.4; src.connect(g); g.connect(master); src.start();
      return true;
    }
    loadReal();
    // Thang âm ngũ cung: chạm bừa vẫn nghe hài hòa
    const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
    const api = {
      unlock, vol, tone, hiss, voc, PENTA,
      animal(emoji) {
        const k = KEY[emoji], r = k && REAL[k];
        if (r && !r.bad && r.buf && playReal(k)) return r.dur;
        if (r && r.raw) decodeOne(k);      // not decoded yet: use the synthesized sound this one time
        const f = ANIMAL[emoji]; return f ? f() : 0;
      },
      credits() { return CREDITS; },
      hasReal(emoji) { const k = KEY[emoji], r = k && REAL[k]; return !!(r && r.buf); },
      marimba(f) { tone(f, { dur: 0.9, vol: 0.35, att: 0.004 }); tone(f * 4, { dur: 0.25, vol: 0.1, att: 0.002 }); tone(f * 2, { dur: 0.5, vol: 0.08 }); },
      pop(i) { const f = PENTA[(i == null ? Math.floor(Math.random() * PENTA.length) : i) % PENTA.length]; tone(f, { dur: 0.2, vol: 0.3, to: f * 1.5 }); hiss({ f: 2600, to: 800, dur: 0.1, vol: 0.22, q: 0.8 }); },
      ding(f) { f = f || 880; tone(f, { dur: 0.7, vol: 0.3 }); tone(f * 2.01, { dur: 0.3, vol: 0.1 }); },
      boing() { tone(260, { dur: 0.35, to: 520, type: 'triangle', vol: 0.3 }); tone(520, { at: 0.17, dur: 0.3, to: 260, type: 'triangle', vol: 0.2 }); },
      cheer() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, { at: i * 0.09, dur: 0.4, type: 'triangle', vol: 0.26 })); },
      oops() { tone(330, { dur: 0.22, to: 250, vol: 0.14 }); },
      munch() { for (let i = 0; i < 3; i++) { hiss({ f: 900, to: 300, dur: 0.09, at: i * 0.17, vol: 0.4, q: 2 }); tone(120, { at: i * 0.17, dur: 0.08, vol: 0.2 }); } },
      whoosh() { hiss({ f: 300, to: 2500, dur: 0.35, vol: 0.22, q: 0.7 }); },
      bell() { tone(988, { dur: 1.4, vol: 0.3 }); tone(988 * 2.76, { dur: 0.6, vol: 0.12 }); tone(988 * 5.4, { dur: 0.3, vol: 0.05 }); },
      drum() { tone(160, { dur: 0.3, to: 55, vol: 0.6 }); hiss({ f: 400, dur: 0.08, vol: 0.25, ft: 'lowpass' }); },
      horn() { tone(392, { dur: 0.18, type: 'square', vol: 0.1 }); tone(494, { at: 0.24, dur: 0.18, type: 'square', vol: 0.1 }); },
      click() { tone(1200, { dur: 0.05, vol: 0.18, type: 'square' }); },
      blip() { tone(660, { dur: 0.14, vol: 0.22, type: 'square' }); },
      rocket() { hiss({ f: 200, to: 1800, dur: 1.3, vol: 0.28, ft: 'lowpass' }); tone(80, { dur: 1.3, to: 300, type: 'sawtooth', vol: 0.08 }); },
      light(on) { on ? tone(700, { dur: 0.25, to: 1300, type: 'triangle', vol: 0.25 }) : tone(1000, { dur: 0.25, to: 450, type: 'triangle', vol: 0.2 }); },
      piano(f) { tone(f, { dur: 1.4, type: 'triangle', vol: .32, att: .006 }); tone(f * 2, { dur: .7, vol: .1, att: .004 }); tone(f * 3, { dur: .35, vol: .05, att: .003 }); },
      bells(f) { tone(f * 2, { dur: 1.6, vol: .22 }); tone(f * 2 * 2.76, { dur: .7, vol: .08 }); tone(f * 2 * 5.4, { dur: .3, vol: .04 }); },
      drumpad(i) { DRUMS[i % DRUMS.length](); },
      vehicle(emoji) { const k = VEH_MAP[emoji]; return k ? VEH[k]() : VEH.horn(); },
      choo() { return VEH.choo(); },
      alarm() { for (let i = 0; i < 10; i++) tone(i % 2 ? 1700 : 2000, { at: i * .1, dur: .07, type: 'square', vol: .1 }); },
      squeak() { tone(1500, { dur: .09, to: 2600, vol: .35 }); tone(2000, { at: .1, dur: .12, to: 3000, vol: .3 }); },
      lullaby() { [392, 330, 262].forEach((f, i) => tone(f, { at: i * 0.5, dur: 1.2, vol: 0.2 })); }
    };
    return api;
  })();

  /* ---------- Giọng nói (trình duyệt tự đọc, không cần mạng khi máy đã có giọng) ---------- */
  const Voice = BE.Voice = (function () {
    let voices = [];
    const ok = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    function load() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
    if (ok) { load(); try { speechSynthesis.addEventListener('voiceschanged', load); } catch (e) { speechSynthesis.onvoiceschanged = load; } }
    function find(lang) {
      const p = lang === 'vi' ? 'vi' : 'en';
      const list = voices.filter(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith(p));
      return list.find(v => /female|linh|hoai|my|samantha|google/i.test(v.name)) || list[0] || null;
    }
    function say(text) {
      if (!ok || !S.voice || !text) return;
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = S.lang === 'vi' ? 'vi-VN' : 'en-US';
        const v = find(S.lang); if (v) u.voice = v;
        u.rate = 0.82; u.pitch = 1.25; u.volume = Math.min(1, S.volume + 0.2);
        speechSynthesis.speak(u);
      } catch (e) { }
    }
    function stop() { if (ok) try { speechSynthesis.cancel(); } catch (e) { } }
    return { say, stop, has: l => !!find(l), supported: ok, count: () => voices.length };
  })();

  /* ---------- Hiệu ứng pháo giấy / ngôi sao trên một lớp canvas ---------- */
  const FX = BE.FX = (function () {
    const cv = $('#fx'), c = cv.getContext('2d');
    let W = 0, H = 0, ps = [], running = false;
    const PAL = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#b197fc', '#f783ac'];
    function size() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    addEventListener('resize', size); size();
    function star(x, y, r) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); }
    function burst(x, y, o = {}) {
      const n = o.n || 16, cols = o.colors || PAL, em = o.emoji;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = rand(2, 7) * (o.power || 1);
        ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, life: 1, decay: rand(0.012, 0.022), s: rand(8, 16) * (o.size || 1), col: pick(cols), em: em ? pick(em) : null, shape: pick(['c', 's']), rot: rand(0, 6), vr: rand(-0.2, 0.2) });
      }
      if (!running) { running = true; requestAnimationFrame(frame); }
    }
    function frame() {
      c.clearRect(0, 0, W, H);
      ps = ps.filter(p => p.life > 0);
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.vx *= 0.99; p.life -= p.decay; p.rot += p.vr;
        c.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
        if (p.em) { c.font = (p.s * 2) + 'px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.em, p.x, p.y); }
        else { c.fillStyle = p.col; if (p.shape === 's') star(p.x, p.y, p.s); else { c.beginPath(); c.arc(p.x, p.y, p.s * 0.6, 0, 7); c.fill(); } }
      }
      c.globalAlpha = 1;
      if (ps.length) requestAnimationFrame(frame); else { running = false; c.clearRect(0, 0, W, H); }
    }
    return { burst };
  })();

  /* ---------- Tiện ích ---------- */
  // Chia lưới n ô sao cho ô to nhất trong khung W x H
  BE.fit = function (n, W, H, g = 0.1, max = 280) {
    let best = { s: 0, cols: 1, rows: n };
    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols);
      const s = Math.min(W / (cols + (cols - 1) * g), H / (rows + (rows - 1) * g));
      if (s > best.s) best = { s, cols, rows };
    }
    best.s = Math.max(40, Math.min(best.s, max)); best.gap = best.s * g;
    return best;
  };

  BE.floatText = function (root, text, x, y, cls = '') {
    const s = document.createElement('span');
    s.className = 'ftext ' + cls; s.textContent = text;
    s.style.left = x + 'px'; s.style.top = y + 'px';
    root.appendChild(s); setTimeout(() => s.remove(), 1400);
  };

  // Kéo thả: chạm nhẹ (không di chuyển) được coi là "chạm", để vật tự bay tới đích
  BE.draggable = function (el, h) {
    let id = null, sx = 0, sy = 0, moved = false;
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', e => {
      if (id !== null) return;
      id = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
      try { el.setPointerCapture(id); } catch (_) { }
      h.onStart && h.onStart(e); e.preventDefault();
    });
    el.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > (h.slop || 12)) moved = true;
      if (moved) h.onMove && h.onMove(dx, dy, e);
    });
    const end = (e, cancel) => {
      if (e.pointerId !== id) return;
      id = null;
      try { el.releasePointerCapture(e.pointerId); } catch (_) { }
      if (moved) h.onDrop && h.onDrop(e, cancel); else h.onTap && h.onTap(e);
    };
    el.addEventListener('pointerup', e => end(e, false));
    el.addEventListener('pointercancel', e => end(e, true));
  };

  // Hình dạng SVG dùng chung (xếp hình)
  BE.SHAPES = {
    circle: '<circle cx="50" cy="50" r="42"/>',
    square: '<rect x="9" y="9" width="82" height="82" rx="10"/>',
    triangle: '<polygon points="50,10 92,86 8,86" stroke-linejoin="round" stroke-width="8" stroke="currentColor"/>',
    star: '<polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" stroke-linejoin="round" stroke-width="5" stroke="currentColor"/>',
    heart: '<path d="M50 90 C8 60 4 30 24 17 C38 8 50 22 50 30 C50 22 62 8 76 17 C96 30 92 60 50 90Z"/>',
    diamond: '<polygon points="50,6 94,50 50,94 6,50" stroke-linejoin="round" stroke-width="6" stroke="currentColor"/>',
    oval: '<ellipse cx="50" cy="50" rx="45" ry="30"/>',
    hexagon: '<polygon points="29,12 71,12 94,50 71,88 29,88 6,50" stroke-linejoin="round" stroke-width="6" stroke="currentColor"/>',
    rectangle: '<rect x="6" y="24" width="88" height="52" rx="8"/>',
    plus: '<path d="M38 8h24v30h30v24H62v30H38V62H8V38h30z" stroke-linejoin="round" stroke-width="5" stroke="currentColor"/>'
  };
})();
