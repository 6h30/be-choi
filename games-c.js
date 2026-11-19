/* Little Play: three more games (vehicles, bath time, colour baskets) */
(function () {
  'use strict';
  const { rand, pick, shuffle, Snd, FX, S, DATA } = BE;

  /* ============ 10. VEHICLES (15 months+): vehicles drive on their own road, rails, water or sky lane ============ */
  // k = which lane: road, rail, water (bottom lane) or air (top lane)
  const V = (e, vi, en, k) => ({ e, n: { vi, en }, k });
  const VPAGES = [
    { t: 'On the road', bg: 'linear-gradient(#cfe9ff,#e8f7d8)', list: [V('🚗', 'xe hơi', 'car', 'road'), V('🚕', 'xe taxi', 'taxi', 'road'), V('🚌', 'xe buýt', 'bus', 'road'), V('🚓', 'xe cảnh sát', 'police car', 'road'), V('🚑', 'xe cứu thương', 'ambulance', 'road'), V('🚒', 'xe cứu hỏa', 'fire truck', 'road')] },
    { t: 'Rails, sky and wheels', bg: 'linear-gradient(#d6ecff,#fff3d6)', list: [V('🚂', 'tàu hỏa', 'train', 'rail'), V('✈️', 'máy bay', 'airplane', 'air'), V('🚁', 'trực thăng', 'helicopter', 'air'), V('🚀', 'tên lửa', 'rocket', 'air'), V('🚲', 'xe đạp', 'bicycle', 'road'), V('🛵', 'xe máy', 'scooter', 'road')] },
    { t: 'Work and water', bg: 'linear-gradient(#cdf3ff,#e6f6d8)', list: [V('🚜', 'máy cày', 'tractor', 'road'), V('🚛', 'xe tải', 'truck', 'road'), V('🚚', 'xe giao hàng', 'delivery truck', 'road'), V('🚢', 'con tàu', 'ship', 'water'), V('⛵', 'thuyền buồm', 'sailboat', 'water'), V('🚤', 'ca nô', 'speedboat', 'water')] }
  ];
  const TURN = { '✈️': 'rot', '🚀': 'rot', '🚁': 'flip' };   // make flyers point right as they cross the sky lane
  BE.GAMES.push({
    id: 'vehicles', icon: '🚗', color: '#ffd6cc', bg: 'linear-gradient(#cfe9ff,#e8f7d8)', min: 15,
    name: { vi: 'Xe cộ', en: 'Vehicles' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="lane sky"></div><div class="an-grid"></div><div class="lane ground" data-kind="road"></div><div class="page-title"></div>'
        + '<button class="round-btn clearbtn" aria-label="Next vehicles">▶&#xFE0E;</button>';
      const sky = root.querySelector('.sky'), gridEl = root.querySelector('.an-grid'), ground = root.querySelector('.ground'),
        title = root.querySelector('.page-title'), next = root.querySelector('.clearbtn');
      const BG = ['#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#ffc6ff'];
      const TRANSIT = 3200;          // every vehicle takes the same time to cross, so none can catch up with another
      let page = 0, nameT = null, R = 60;
      // one lane = one track: vehicles enter one after another (queue) and never overlap
      const lanes = { sky: { el: sky, free: 0, clear: 0, kind: 'air', waiting: 0 }, ground: { el: ground, free: 0, clear: 0, kind: 'road', waiting: 0 } };

      function layout() {
        const W = innerWidth, H = innerHeight;
        R = Math.round(Math.max(44, Math.min(64, H * 0.075)));
        const probe = document.createElement('div');            // measure the bottom safe area (iPhone home bar)
        probe.style.cssText = 'position:fixed;bottom:0;visibility:hidden;padding-bottom:env(safe-area-inset-bottom,0px)';
        root.appendChild(probe); const sb = parseFloat(getComputedStyle(probe).paddingBottom) || 0; probe.remove();
        const laneH = Math.round(R * 1.3), top = H < 500 ? 66 : 84, bottomGap = 12 + sb;
        sky.style.top = top + 'px'; sky.style.height = laneH + 'px';
        ground.style.height = laneH + 'px'; ground.style.bottom = bottomGap + 'px';
        const gridTop = top + laneH + 10, gridBottom = H - bottomGap - laneH - 10;
        gridEl.classList.add('veh'); gridEl.style.top = gridTop + 'px'; gridEl.style.bottom = (H - gridBottom) + 'px'; gridEl.style.padding = '0 10px';
        const f = BE.fit(6, W - 24, gridBottom - gridTop, 0.1, 240);
        gridEl.style.setProperty('--s', f.s + 'px'); gridEl.style.setProperty('--g', f.gap + 'px');
        root.style.setProperty('--R', R + 'px');
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
      // Send a vehicle along its lane; it waits its turn if the lane is busy
      function send(v) {
        const air = v.k === 'air', lane = air ? lanes.sky : lanes.ground;
        if (lane.waiting >= 3) return;                              // enough vehicles are already waiting
        const now = performance.now();
        let start = Math.max(now, lane.free);
        if (!air && v.k !== lane.kind) start = Math.max(start, lane.clear);   // wait until the old road/rail/water has cleared
        const gap = (1.9 * R) / ((innerWidth + 3 * R) / TRANSIT);   // time for the vehicle ahead to move on by about two vehicle lengths
        lane.free = start + gap; lane.clear = Math.max(lane.clear, start + TRANSIT);
        lane.waiting++;
        api.timeout(() => {
          lane.waiting--;
          if (!air) { lane.kind = v.k; ground.dataset.kind = v.k; }
          run(lane.el, v, air);
          Snd.vehicle(v.e);
        }, Math.max(0, start - now));
      }
      function run(laneEl, v, air) {
        const W = laneEl.clientWidth, el = document.createElement('div');
        el.className = 'runner'; el.style.fontSize = R + 'px';
        el.innerHTML = `<span class="${TURN[v.e] || ''}">${v.e}</span>`;
        const x0 = air ? -2 * R : W + R, x1 = air ? W + R : -2 * R;
        el.style.transition = 'none'; el.style.transform = `translateX(${x0}px)`;
        laneEl.appendChild(el); void el.offsetWidth;
        el.style.transition = `transform ${TRANSIT}ms linear`; el.style.transform = `translateX(${x1}px)`;
        setTimeout(() => el.remove(), TRANSIT + 30);
      }
      layout(); fill();
      api.on(window, 'resize', () => { layout(); });
      api.on(gridEl, 'pointerdown', e => {
        const t = e.target.closest && e.target.closest('.an-tile'); if (!t) return;
        const v = t._v;
        t.classList.remove('hit'); void t.offsetWidth; t.classList.add('hit');
        BE.Voice.stop(); api.say(v.n.vi, v.n.en);
        send(v);
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
