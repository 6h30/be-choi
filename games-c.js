/* Little Play: three more games (vehicles, bath time, colour baskets) */
(function () {
  'use strict';
  const { rand, pick, shuffle, Snd, FX, S, DATA } = BE;

  /* ============ 10. VEHICLES (15 months+): tap a vehicle and it drives across the screen ============ */
  const V = (e, vi, en) => ({ e, n: { vi, en } });
  const FLY = ['✈️', '🚀'];   // these head up and to the right; the rest drive right to left (most emoji face left)
  const VPAGES = [
    { t: 'On the road', bg: 'linear-gradient(#cfe9ff,#e8f7d8)', list: [V('🚗', 'xe hơi', 'car'), V('🚕', 'xe taxi', 'taxi'), V('🚌', 'xe buýt', 'bus'), V('🚓', 'xe cảnh sát', 'police car'), V('🚑', 'xe cứu thương', 'ambulance'), V('🚒', 'xe cứu hỏa', 'fire truck')] },
    { t: 'Rails, sky and wheels', bg: 'linear-gradient(#d6ecff,#fff3d6)', list: [V('🚂', 'tàu hỏa', 'train'), V('✈️', 'máy bay', 'airplane'), V('🚁', 'trực thăng', 'helicopter'), V('🚀', 'tên lửa', 'rocket'), V('🚲', 'xe đạp', 'bicycle'), V('🛵', 'xe máy', 'scooter')] },
    { t: 'Work and water', bg: 'linear-gradient(#cdf3ff,#e6f6d8)', list: [V('🚜', 'máy cày', 'tractor'), V('🚛', 'xe tải', 'truck'), V('🚚', 'xe giao hàng', 'delivery truck'), V('🚢', 'con tàu', 'ship'), V('⛵', 'thuyền buồm', 'sailboat'), V('🚤', 'ca nô', 'speedboat')] }
  ];
  BE.GAMES.push({
    id: 'vehicles', icon: '🚗', color: '#ffd6cc', bg: 'linear-gradient(#cfe9ff,#e8f7d8)', min: 15,
    name: { vi: 'Xe cộ', en: 'Vehicles' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="an-grid"></div><div class="page-title"></div><button class="round-btn bottom-center" aria-label="Next vehicles">▶&#xFE0E;</button>';
      const gridEl = root.firstChild, title = root.querySelector('.page-title'), next = root.lastChild;
      const BG = ['#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#ffc6ff'];
      let page = 0, nameT = null;

      function layout() {
        const f = BE.fit(6, innerWidth - 24, innerHeight - 190, 0.1, 240);
        gridEl.style.setProperty('--s', f.s + 'px'); gridEl.style.setProperty('--g', f.gap + 'px');
      }
      function fill() {
        const P = VPAGES[page];
        gridEl.innerHTML = ''; root.style.background = P.bg; title.textContent = P.t;
        P.list.forEach((v, i) => {
          const t = document.createElement('div');
          t.className = 'an-tile'; t.style.background = BG[i % BG.length];
          t.innerHTML = `${v.e}<small>${v.n[S.lang]}</small>`;
          t._v = v; gridEl.appendChild(t);
        });
      }
      function drive(t, v) {
        const r = t.getBoundingClientRect(), fs = Math.round(r.width * 0.55);
        const run = document.createElement('div');
        run.className = 'runner'; run.textContent = v.e; run.style.fontSize = fs + 'px';
        const cy = r.top + r.height / 2 - fs * 0.55, fly = FLY.includes(v.e);
        const x0 = fly ? r.left + r.width / 2 - fs / 2 : innerWidth + fs, y0 = cy;
        const x1 = fly ? innerWidth + fs : -fs * 2, y1 = fly ? cy - innerHeight * 0.4 : cy;
        run.style.transform = `translate(${x0}px,${y0}px)`;
        root.appendChild(run);
        requestAnimationFrame(() => requestAnimationFrame(() => { run.style.transform = `translate(${x1}px,${y1}px)`; }));
        setTimeout(() => run.remove(), 2800);
      }
      layout(); fill();
      api.on(window, 'resize', layout);
      api.on(gridEl, 'pointerdown', e => {
        const t = e.target.closest && e.target.closest('.an-tile'); if (!t) return;
        const v = t._v;
        t.classList.remove('hit'); void t.offsetWidth; t.classList.add('hit');
        BE.Voice.stop(); clearTimeout(nameT);
        api.say(v.n.vi, v.n.en);
        nameT = api.timeout(() => Snd.vehicle(v.e), 900);
        drive(t, v);
      });
      api.on(next, 'pointerdown', () => { Snd.whoosh(); page = (page + 1) % VPAGES.length; fill(); });
    }
  });

  /* ============ 11. BATH TIME (18 months+): rub the mud off with a finger ============ */
  BE.GAMES.push({
    id: 'bath', icon: '🛁', color: '#c9ecff', bg: 'linear-gradient(#d9f3ff,#f0fbff)', min: 18,
    name: { vi: 'Tắm cho thú', en: 'Bath time' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="bath"><div class="tub"><div class="pet"></div><canvas></canvas></div></div><div class="page-title">Scrub the mud away!</div>';
      const tub = root.querySelector('.tub'), pet = root.querySelector('.pet'), cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
      const ANIMALS = shuffle(['🐷', '🐶', '🐘', '🐮', '🐻', '🦆', '🐴', '🐑']);
      let idx = 0, D = 300, dpr = 1, done = false, total = 1, lastSq = 0;
      const ptrs = new Map();
      const tmp = document.createElement('canvas'); tmp.width = tmp.height = 24;
      const tctx = tmp.getContext('2d', { willReadFrequently: true });

      function paintMud() {
        dpr = Math.min(2, window.devicePixelRatio || 1);
        D = Math.round(Math.min(innerWidth * 0.88, (innerHeight - 140) * 0.92, 440));
        tub.style.width = tub.style.height = D + 'px'; tub.style.setProperty('--D', D + 'px');
        cv.width = cv.height = D * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, D, D);
        const g = ctx.createRadialGradient(D * .4, D * .35, D * .05, D / 2, D / 2, D / 2);
        g.addColorStop(0, '#9a6b3f'); g.addColorStop(1, '#6e4524');
        ctx.globalAlpha = 0.95; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(D / 2, D / 2, D / 2 - 3, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
        for (let i = 0; i < 70; i++) {            // dirt specks and blotches
          const a = Math.random() * 6.28, rr = Math.sqrt(Math.random()) * (D / 2 - 14);
          ctx.fillStyle = Math.random() < .5 ? 'rgba(60,35,15,.45)' : 'rgba(170,125,80,.4)';
          ctx.beginPath(); ctx.arc(D / 2 + Math.cos(a) * rr, D / 2 + Math.sin(a) * rr, rand(D * .012, D * .05), 0, 7); ctx.fill();
        }
        total = measure(true);
      }
      // how much mud is left (share of the circle that is still covered)
      function measure(initial) {
        tctx.clearRect(0, 0, 24, 24); tctx.drawImage(cv, 0, 0, 24, 24);
        const d = tctx.getImageData(0, 0, 24, 24).data; let n = 0, all = 0;
        for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
          if ((x - 11.5) ** 2 + (y - 11.5) ** 2 > 10.5 ** 2) continue;
          all++; if (d[(y * 24 + x) * 4 + 3] > 110) n++;
        }
        return initial ? Math.max(1, n) : n / total;
      }
      function newAnimal() {
        done = false; tub.classList.remove('clean'); cv.style.transition = 'none'; cv.style.opacity = 1; void cv.offsetWidth; cv.style.transition = '';
        const a = DATA.byEmoji[ANIMALS[idx % ANIMALS.length]];
        pet.textContent = a.e; paintMud();
        api.say(`Let's wash the ${a.n.vi}!`, `Let's wash the ${a.n.en}!`);
      }
      function finish() {
        if (done) return; done = true;
        const a = DATA.byEmoji[ANIMALS[idx % ANIMALS.length]]; idx++;
        cv.style.opacity = 0; tub.classList.add('clean');
        Snd.cheer(); FX.burst(innerWidth / 2, innerHeight / 2, { n: 40, power: 1.3 });
        api.say('Squeaky clean!', 'Squeaky clean!');
        api.timeout(() => Snd.animal(a.e), 1500);
        api.timeout(newAnimal, 4200);
      }
      api.on(cv, 'pointerdown', e => { if (done) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, d: 0 }); scrub(e.clientX, e.clientY, e.clientX, e.clientY); });
      api.on(cv, 'pointermove', e => {
        const p = ptrs.get(e.pointerId); if (!p || done) return;
        const dist = Math.hypot(e.clientX - p.x, e.clientY - p.y);
        scrub(p.x, p.y, e.clientX, e.clientY); p.d += dist; p.x = e.clientX; p.y = e.clientY;
        if (p.d > D * 0.09) {                         // soapy bubbles and squeaky sounds while scrubbing
          p.d = 0; FX.burst(e.clientX, e.clientY, { n: 3, power: .5, size: .9, colors: ['#ffffff', '#bfe9ff', '#d0ecff'] });
          const now = performance.now();
          if (now - lastSq > 180) { lastSq = now; Snd.tone(900 + Math.random() * 700, { dur: .07, vol: .12 }); Snd.hiss({ f: 3000, dur: .08, vol: .06, q: .7 }); }
        }
      });
      ['pointerup', 'pointercancel'].forEach(ev => api.on(cv, ev, e => ptrs.delete(e.pointerId)));
      function scrub(x0, y0, x1, y1) {
        const r = cv.getBoundingClientRect(), k = D / r.width;
        ctx.globalCompositeOperation = 'destination-out'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = D * 0.17;
        ctx.beginPath(); ctx.moveTo((x0 - r.left) * k, (y0 - r.top) * k); ctx.lineTo((x1 - r.left) * k, (y1 - r.top) * k); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      let acc = 0;
      api.loop(dt => { acc += dt; if (acc > 0.3 && !done) { acc = 0; if (measure(false) < 0.3) finish(); } });
      api.on(window, 'resize', () => { if (!done) paintMud(); });
      newAnimal();
    }
  });

  /* ============ 12. COLOUR BASKETS (28 months+): drag each thing into the basket of its colour ============ */
  const COLS = {
    red: { c: '#ff5b5b', items: [['🍎', 'apple'], ['🍓', 'strawberry'], ['🍅', 'tomato'], ['🍒', 'cherries']] },
    yellow: { c: '#ffd43b', items: [['🍌', 'banana'], ['🍋', 'lemon'], ['🌽', 'corn'], ['⭐', 'star'], ['🐥', 'chick']] },
    green: { c: '#51cf66', items: [['🥦', 'broccoli'], ['🥒', 'cucumber'], ['🍏', 'green apple'], ['🐸', 'frog'], ['🐢', 'turtle']] },
    orange: { c: '#ff9f43', items: [['🍊', 'orange'], ['🥕', 'carrot'], ['🦊', 'fox'], ['🎃', 'pumpkin']] }
  };
  BE.GAMES.push({
    id: 'baskets', icon: '🧺', color: '#e3f6c8', bg: 'linear-gradient(#f4ffe0,#ffeede)', min: 28,
    name: { vi: 'Xếp theo màu', en: 'Colour baskets' },
    start(api) {
      const root = api.root;
      let rc = 0, placed = 0, total = 0, over = false;

      function round() {
        placed = 0; over = false;
        const nc = (rc % 3 === 2) ? 3 : 2; rc++;
        const names = shuffle(Object.keys(COLS)).slice(0, nc);
        const items = [];
        names.forEach(n => shuffle(COLS[n].items).slice(0, 2).forEach(it => items.push({ color: n, e: it[0], name: it[1] })));
        total = items.length;
        const W = innerWidth, H = innerHeight;
        const B = Math.max(84, Math.min((W - 24) / (nc + (nc - 1) * 0.2), (H - 110) / 3.4, 190));
        const I = Math.max(80, Math.min(B * 0.9, (W - 24) / 3.4, 128));
        root.innerHTML = '<div class="bk"><div class="bk-row"></div><div class="bk-items"></div></div>';
        const bk = root.firstChild; bk.style.setProperty('--B', B + 'px'); bk.style.setProperty('--I', I + 'px');
        const row = bk.querySelector('.bk-row'), pile = bk.querySelector('.bk-items');
        pile.style.width = Math.min(W - 24, 3 * I + 2 * I * 0.18 + 6) + 'px';
        const baskets = {};
        names.forEach(n => {
          const b = document.createElement('div'); b.className = 'basket'; b.style.setProperty('--c', COLS[n].c);
          b.innerHTML = `<div class="bowl"></div><small>${n}</small>`; row.appendChild(b); baskets[n] = b;
        });
        shuffle(items).forEach(it => {
          const el = document.createElement('div'); el.className = 'bk-item'; el.textContent = it.e; pile.appendChild(el);
          const t = { x: 0, y: 0 };
          const cen = n => { const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
          function land(glide) {
            const bowl = baskets[it.color].querySelector('.bowl'), bc = cen(bowl), pc = cen(el);
            t.x += bc.x - pc.x; t.y += bc.y - pc.y;
            el.classList.remove('back'); el.classList.add(glide ? 'glide' : 'back');
            el.style.transform = `translate(${t.x}px,${t.y}px) scale(.6)`;
            api.timeout(() => {
              el.classList.add('placed');
              const s = document.createElement('span'); s.textContent = it.e; bowl.appendChild(s);
              Snd.ding(Snd.PENTA[placed % 8]); placed++;
              FX.burst(bc.x, bc.y, { n: 10, colors: [COLS[it.color].c, '#fff'] });
              api.say(`${it.name}. ${it.color}!`, `${it.name}. ${it.color}!`);
              if (placed === total && !over) {
                over = true;
                api.timeout(() => { Snd.cheer(); FX.burst(innerWidth / 2, innerHeight / 2, { n: 40, power: 1.4 }); api.say('All sorted! Great job!', 'All sorted! Great job!'); }, 900);
                api.timeout(() => { Snd.whoosh(); round(); }, 3800);
              }
            }, glide ? 480 : 420);
          }
          BE.draggable(el, {
            onStart() { el.classList.remove('back', 'glide', 'wrong'); },
            onMove(dx, dy) { el.style.transform = `translate(${t.x + dx}px,${t.y + dy}px) scale(1.12)`; },
            onDrop() {
              const pc = cen(el), bc = cen(baskets[it.color].querySelector('.bowl'));
              if (Math.hypot(pc.x - bc.x, pc.y - bc.y) < B * 0.6) { land(false); return; }
              const wrong = names.some(n => n !== it.color && Math.hypot(pc.x - cen(baskets[n]).x, pc.y - cen(baskets[n]).y) < B * 0.55);
              if (wrong) Snd.oops();
              el.classList.add('back'); el.style.transform = `translate(${t.x}px,${t.y}px)`;
            },
            onTap() { land(true); }
          });
        });
        api.timeout(() => api.say('Put each one in the basket with its color!', 'Put each one in the basket with its color!'), 500);
      }
      round();
      api.on(window, 'resize', () => { if (placed < total) round(); });
    }
  });
})();
