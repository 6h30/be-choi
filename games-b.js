/* Bé chơi nào — nhóm trò cho bé 15–36 tháng: vẽ nguệch ngoạc, nút bấm, cho ăn, xếp hình, tìm đồ */
(function () {
  'use strict';
  const { $, rand, pick, shuffle, Snd, FX, S, DATA, SHAPES } = BE;

  /* ============ 5. VẼ BẰNG NGÓN TAY (15 tháng+) ============ */
  BE.GAMES.push({
    id: 'paint', icon: '🎨', color: '#ffd9a8', bg: '#fffdf4', min: 15,
    name: { vi: 'Vẽ', en: 'Draw' },
    start(api) {
      const root = api.root;
      root.innerHTML = `<div class="paint"><canvas></canvas></div>
        <div class="tools">
          <button class="round-btn on" data-m="line" aria-label="Rainbow brush">🌈</button>
          <button class="round-btn" data-m="stamp" aria-label="Stamps">⭐</button>
          <button class="round-btn" data-m="clear" aria-label="Clear">🧽</button>
        </div>`;
      const cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
      let W = 0, H = 0, dpr = 1, mode = 'line', hue = 0;
      const ptrs = new Map();
      const STAMPS = ['⭐', '🌸', '💖', '🐠', '🦋', '🌈', '🍀'];

      function resize() {
        dpr = Math.min(2, window.devicePixelRatio || 1);
        const keep = (W && H) ? (() => { const t = document.createElement('canvas'); t.width = cv.width; t.height = cv.height; t.getContext('2d').drawImage(cv, 0, 0); return t; })() : null;
        W = innerWidth; H = innerHeight;
        cv.width = W * dpr; cv.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (keep) ctx.drawImage(keep, 0, 0, W, H);
      }
      resize(); api.on(window, 'resize', resize);
      const brush = () => Math.max(26, Math.min(W, H) * 0.075);

      function dot(x, y) {
        hue = (hue + 37) % 360;
        ctx.fillStyle = `hsl(${hue},90%,60%)`;
        ctx.beginPath(); ctx.arc(x, y, brush() * 0.55, 0, 7); ctx.fill();
      }
      function stamp(x, y) {
        const s = brush() * rand(1.6, 2.6);
        ctx.save(); ctx.translate(x, y); ctx.rotate(rand(-.5, .5));
        ctx.font = s + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(pick(STAMPS), 0, 0); ctx.restore();
        Snd.pop();
      }
      api.on(cv, 'pointerdown', e => {
        ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, d: 0 });
        if (mode === 'line') dot(e.clientX, e.clientY); else stamp(e.clientX, e.clientY);
      });
      api.on(cv, 'pointermove', e => {
        const p = ptrs.get(e.pointerId); if (!p) return;
        const x = e.clientX, y = e.clientY, dist = Math.hypot(x - p.x, y - p.y);
        if (mode === 'line') {
          hue = (hue + dist * 0.9) % 360;
          ctx.strokeStyle = `hsl(${hue},90%,60%)`; ctx.lineWidth = brush(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(x, y); ctx.stroke();
          p.x = x; p.y = y;
        } else {
          p.d += dist; p.x = x; p.y = y;
          if (p.d > brush() * 2.2) { p.d = 0; stamp(x, y); }
        }
      });
      ['pointerup', 'pointercancel'].forEach(ev => api.on(cv, ev, e => ptrs.delete(e.pointerId)));

      api.on(root.querySelector('.tools'), 'pointerdown', e => {
        const b = e.target.closest('button'); if (!b) return;
        const m = b.dataset.m;
        if (m === 'clear') {
          Snd.whoosh(); cv.style.opacity = 0;
          api.timeout(() => { ctx.clearRect(0, 0, W, H); cv.style.opacity = 1; }, 380);
        } else {
          mode = m; Snd.click();
          root.querySelectorAll('.tools .round-btn').forEach(x => x.classList.toggle('on', x === b));
        }
      });
    }
  });

  /* ============ 6. BẢNG NÚT BẤM (18 tháng+) ============ */
  BE.GAMES.push({
    id: 'busy', icon: '🔔', color: '#e1d4ff', bg: 'linear-gradient(#efe6ff,#d9ecff)', min: 18,
    name: { vi: 'Nút bấm', en: 'Buttons' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="busy"></div>';
      const busy = root.firstChild;
      let lightOn = false, night = false;
      const tiles = [
        { c: '#5b5f85', cls: 'off', e: '💡', act(t, big) {
            lightOn = !lightOn; t.classList.toggle('on', lightOn); t.classList.toggle('off', !lightOn);
            Snd.light(lightOn); api.say(lightOn ? 'Đèn sáng!' : 'Đèn tắt rồi!', lightOn ? 'Light on!' : 'Light off!');
            if (lightOn) FX.burst(...center(t), { n: 12, colors: ['#ffd43b', '#fff3a0', '#fff'] });
          } },
        { c: '#ffe08a', e: '🔔', act(t, big) { Snd.bell(); ani(big, 'ring'); api.say('Kính coong!', 'Ding dong!'); } },
        { c: '#ffb3b3', e: '🥁', act(t, big) { Snd.drum(); ani(big, 'squash'); api.say('Tùng tùng!', 'Boom boom!'); FX.burst(...center(t), { n: 8, emoji: ['🎵'] }); } },
        { c: '#b8e0ff', e: '🚗', act(t, big) { Snd.horn(); ani(big, 'drive'); api.say('Bíp bíp! Xe chạy!', 'Beep beep! The car goes!'); } },
        { c: '#d3f9d8', e: '🚀', act(t, big) { launch(t, big); } },
        { c: '#ffe3a3', e: '☀️', act(t, big) {
            night = !night; big.textContent = night ? '🌙' : '☀️';
            t.style.background = night ? '#3b3f78' : '#ffe3a3';
            busy.classList.toggle('night', night);
            Snd.light(!night); ani(big, 'squash');
            api.say(night ? 'Trời tối rồi. Ngủ ngon nhé!' : 'Trời sáng rồi!', night ? 'Night time. Sleep tight!' : 'Good morning!');
          } }
      ];
      function center(t) { const r = t.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
      function ani(el, cls) { el.classList.remove('ring', 'squash', 'drive', 'launch'); void el.offsetWidth; el.classList.add(cls); }
      let launching = false;
      function launch(t, big) {
        if (launching) return; launching = true;
        api.say('Ba, hai, một, bay!', 'Three, two, one, blast off!');
        const cnt = document.createElement('div'); cnt.className = 'cnt'; t.appendChild(cnt);
        [3, 2, 1].forEach((n, i) => api.timeout(() => { cnt.textContent = n; Snd.blip(); }, i * 800));
        api.timeout(() => { cnt.remove(); Snd.rocket(); ani(big, 'launch'); FX.burst(...center(t), { n: 24, emoji: ['🔥', '✨'] }); }, 2400);
        api.timeout(() => { big.classList.remove('launch'); launching = false; }, 4100);
      }
      tiles.forEach(d => {
        const t = document.createElement('div');
        t.className = 'tile ' + (d.cls || ''); t.style.setProperty('--c', d.c);
        t.innerHTML = `<div class="big">${d.e}</div>`;
        t._d = d; busy.appendChild(t);
      });
      function layout() {
        const f = BE.fit(6, innerWidth - 24, innerHeight - 100, 0.1, 240);
        busy.style.setProperty('--s', f.s + 'px'); busy.style.setProperty('--g', f.gap + 'px');
      }
      layout(); api.on(window, 'resize', layout);
      api.on(busy, 'pointerdown', e => {
        const t = e.target.closest && e.target.closest('.tile'); if (!t) return;
        t._d.act(t, t.querySelector('.big'));
      });
    }
  });

  /* ============ 7. CHO GẤU ĂN (24 tháng+) ============ */
  const BEAR = `<svg viewBox="0 0 200 200">
    <circle cx="36" cy="44" r="28" fill="#a3682f"/><circle cx="36" cy="44" r="14" fill="#f4b6c2"/>
    <circle cx="164" cy="44" r="28" fill="#a3682f"/><circle cx="164" cy="44" r="14" fill="#f4b6c2"/>
    <circle cx="100" cy="106" r="76" fill="#b9803f"/>
    <ellipse cx="100" cy="132" rx="42" ry="34" fill="#f1d3a5"/>
    <g class="eye"><circle cx="72" cy="88" r="9" fill="#33231a"/><circle cx="75" cy="85" r="3" fill="#fff"/></g>
    <g class="eye"><circle cx="128" cy="88" r="9" fill="#33231a"/><circle cx="131" cy="85" r="3" fill="#fff"/></g>
    <circle cx="52" cy="112" r="10" fill="#ff9aa8" opacity=".55"/><circle cx="148" cy="112" r="10" fill="#ff9aa8" opacity=".55"/>
    <ellipse cx="100" cy="114" rx="12" ry="8.5" fill="#33231a"/>
    <g class="mouth"><ellipse class="hole" cx="100" cy="142" rx="19" ry="13" fill="#7a1f2b"/><ellipse cx="100" cy="148" rx="11" ry="6" fill="#ff7b8b"/></g>
  </svg>`;

  BE.GAMES.push({
    id: 'feed', icon: '🐻', color: '#ffe0c2', bg: 'linear-gradient(#fff1de,#ffe0ec)', min: 24,
    name: { vi: 'Cho gấu ăn', en: 'Feed the bear' },
    start(api) {
      const root = api.root;
      root.innerHTML = `<div class="fd"><div class="bear">${BEAR}</div><div class="tray"></div></div>`;
      const fd = root.firstChild, bear = fd.querySelector('.bear'), tray = fd.querySelector('.tray'), hole = fd.querySelector('.hole');
      let eating = false;
      const mc = () => { const r = hole.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
      const bearR = () => bear.getBoundingClientRect().width;

      function sizeTray() { tray.style.setProperty('--f', Math.max(84, Math.min(innerWidth * 0.26, innerHeight * 0.24, 170)) + 'px'); }
      sizeTray(); api.on(window, 'resize', sizeTray);

      function shown() { return [...tray.querySelectorAll('.food')].map(f => f._f.e); }
      function addFood(slot) {
        const opts = DATA.FOODS.filter(f => !shown().includes(f.e));
        const f = pick(opts), el = document.createElement('div');
        el.className = 'food'; el.textContent = f.e; el._f = f; el._t = { x: 0, y: 0 };
        slot.appendChild(el);
        BE.draggable(el, {
          onStart() { if (eating) return; el.classList.remove('back'); el.style.zIndex = 30; },
          onMove(dx, dy) {
            el._t = { x: dx, y: dy };
            el.style.transform = `translate(${dx}px,${dy}px) scale(1.15)`;
            const r = el.getBoundingClientRect(), c = mc();
            bear.classList.toggle('near', Math.hypot(r.left + r.width / 2 - c.x, r.top + r.height / 2 - c.y) < bearR() * 0.5);
          },
          onDrop() {
            const r = el.getBoundingClientRect(), c = mc();
            if (!eating && Math.hypot(r.left + r.width / 2 - c.x, r.top + r.height / 2 - c.y) < bearR() * 0.42) swallow(el, slot);
            else back(el);
          },
          onTap() { if (!eating) swallow(el, slot); }
        });
      }
      function back(el) {
        bear.classList.remove('near');
        el.classList.add('back'); el.style.transform = 'translate(0,0)'; el._t = { x: 0, y: 0 };
        api.timeout(() => { el.style.zIndex = ''; }, 420);
      }
      function swallow(el, slot) {
        eating = true; bear.classList.add('near');
        const r = el.getBoundingClientRect(), c = mc(), t = el._t || { x: 0, y: 0 };
        const dx = t.x + (c.x - (r.left + r.width / 2)), dy = t.y + (c.y - (r.top + r.height / 2));
        el.style.transition = 'transform .35s ease-in, opacity .35s';
        el.style.transform = `translate(${dx}px,${dy}px) scale(.2)`; el.style.opacity = '.3';
        Snd.whoosh();
        api.timeout(() => {
          el.remove(); bear.classList.remove('near');
          bear.classList.add('chomp', 'happy'); Snd.munch();
          FX.burst(c.x, c.y, { n: 8, emoji: ['💖', '✨'] });
          api.say(`${el._f.n.vi}. Ngon quá!`, `${el._f.n.en}. Yummy!`);
          api.timeout(() => { bear.classList.remove('chomp', 'happy'); eating = false; addFood(slot); }, 1000);
        }, 340);
      }
      for (let i = 0; i < 3; i++) { const s = document.createElement('div'); s.className = 'slotf'; tray.appendChild(s); addFood(s); }
      api.timeout(() => api.say('Cho gấu ăn nhé!', 'Let us feed the bear!'), 500);
    }
  });

  /* ============ 8. XẾP HÌNH (24 tháng+) ============ */
  BE.GAMES.push({
    id: 'shapes', icon: '🧩', color: '#c9f0ee', bg: 'linear-gradient(#dbf7f4,#eee4ff)', min: 24,
    name: { vi: 'Xếp hình', en: 'Shapes' },
    start(api) {
      const root = api.root;
      const NAMES = { circle: ['hình tròn', 'circle'], square: ['hình vuông', 'square'], triangle: ['hình tam giác', 'triangle'], star: ['ngôi sao', 'star'], heart: ['trái tim', 'heart'] };
      const COLS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#51cf66', '#4dabf7', '#b197fc', '#f783ac'];
      let placed = 0, over = false;

      function round() {
        placed = 0; over = false;
        const ids = shuffle(Object.keys(SHAPES)).slice(0, 3), cols = shuffle(COLS).slice(0, 3);
        const items = ids.map((id, i) => ({ id, c: cols[i] }));
        const S_ = Math.max(84, Math.min(innerWidth * 0.27, (innerHeight - 120) / 2.1, 170));
        root.innerHTML = '<div class="sh"><div class="row-s holes"></div><div class="row-s pieces"></div></div>';
        const sh = root.firstChild; sh.style.setProperty('--S', S_ + 'px');
        const holesEl = sh.querySelector('.holes'), piecesEl = sh.querySelector('.pieces');
        const holes = {};
        shuffle(items).forEach(it => {
          const h = document.createElement('div'); h.className = 'hole'; h.style.setProperty('--c', it.c);
          h.innerHTML = `<svg viewBox="0 0 100 100">${SHAPES[it.id]}</svg>`; holesEl.appendChild(h); holes[it.id] = h;
        });
        shuffle(items).forEach(it => {
          const p = document.createElement('div'); p.className = 'piece'; p.style.setProperty('--c', it.c);
          p.innerHTML = `<svg viewBox="0 0 100 100">${SHAPES[it.id]}</svg>`; piecesEl.appendChild(p);
          const t = { x: 0, y: 0 };
          const cen = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
          function snap(glide) {
            const hc = cen(holes[it.id]), pc = cen(p);
            t.x += hc.x - pc.x; t.y += hc.y - pc.y;
            p.classList.remove('back'); p.classList.add(glide ? 'glide' : 'back');
            p.style.transform = `translate(${t.x}px,${t.y}px)`;
            api.timeout(() => {
              p.classList.add('placed'); holes[it.id].classList.add('done');
              Snd.ding(Snd.PENTA[placed % 8] * (placed % 8 > 3 ? 1 : 1)); placed++;
              FX.burst(hc.x, hc.y, { n: 12, colors: [it.c, '#fff'] });
              api.say(NAMES[it.id][0], NAMES[it.id][1]);
              if (placed === 3 && !over) {
                over = true;
                api.timeout(() => { Snd.cheer(); FX.burst(innerWidth / 2, innerHeight / 2, { n: 40, power: 1.4 }); api.say('Giỏi quá!', 'Great job!'); }, 900);
                api.timeout(() => { Snd.whoosh(); round(); }, 3600);
              }
            }, glide ? 480 : 420);
          }
          p._snap = snap;
          BE.draggable(p, {
            onStart() { p.classList.remove('back', 'glide', 'wrong'); },
            onMove(dx, dy) { p.style.transform = `translate(${t.x + dx}px,${t.y + dy}px) scale(1.12)`; },
            onDrop() {
              const pc = cen(p), hc = cen(holes[it.id]);
              if (Math.hypot(pc.x - hc.x, pc.y - hc.y) < S_ * 0.65) { snap(false); return; }
              const wrong = Object.keys(holes).some(k => k !== it.id && !holes[k].classList.contains('done') && Math.hypot(pc.x - cen(holes[k]).x, pc.y - cen(holes[k]).y) < S_ * 0.5);
              if (wrong) { Snd.oops(); }
              p.classList.add('back'); p.style.transform = `translate(${t.x}px,${t.y}px)`;
            },
            onTap() { snap(true); }
          });
        });
        api.timeout(() => api.say('Bỏ hình vào ô nhé!', 'Put the shapes in the holes!'), 500);
      }
      round();
      api.on(window, 'resize', () => { if (placed < 3) round(); });
    }
  });

  /* ============ 9. TÌM ĐỒ VẬT, TÌM MÀU (30 tháng+) ============ */
  BE.GAMES.push({
    id: 'find', icon: '🔍', color: '#ffcfd2', bg: 'linear-gradient(#ffe4e6,#e4f1ff)', min: 30,
    name: { vi: 'Tìm đồ', en: 'Find it' },
    start(api) {
      const root = api.root;
      root.innerHTML = `<div class="fn"><div class="fn-top"><button class="round-btn" aria-label="Hear it again">🔊</button><div class="fn-q"></div></div><div class="fn-opts"></div></div>`;
      const q = root.querySelector('.fn-q'), opts = root.querySelector('.fn-opts'), again = root.querySelector('.round-btn');
      let target = null, mode = 'item', n = 0, wrongs = 0, lock = false, lastKey = '';

      function prompt() {
        const nm = target.n;
        const vi = mode === 'item' ? `Đâu là ${nm.vi}?` : `Màu ${nm.vi} đâu rồi?`;
        const en = mode === 'item' ? `Where is the ${nm.en}?` : `Which one is ${nm.en}?`;
        q.textContent = S.lang === 'vi' ? vi : en;
        api.say(vi, en);
      }
      function layout() {
        const f = BE.fit(3, innerWidth - 24, innerHeight - 130, 0.12, 250);
        opts.style.setProperty('--s', f.s + 'px'); opts.style.setProperty('--g', f.gap + 'px');
      }
      function round() {
        lock = false; wrongs = 0; opts.innerHTML = '';
        mode = (n % 3 === 2) ? 'color' : 'item'; n++;
        const pool = mode === 'item' ? DATA.ITEMS : DATA.COLORS;
        let three; do { three = shuffle(pool).slice(0, 3); target = pick(three); } while ((mode + (target.e || target.c)) === lastKey);
        lastKey = mode + (target.e || target.c);
        three.forEach((it, i) => {
          const o = document.createElement('div'); o.className = 'opt'; o._it = it; o.style.animationDelay = (i * 0.08) + 's';
          o.innerHTML = mode === 'item' ? it.e : `<div class="dot" style="background:${it.c}"></div>`;
          opts.appendChild(o);
        });
        layout();
        api.timeout(prompt, 600);
      }
      api.on(again, 'pointerdown', () => { Snd.click(); prompt(); });
      api.on(window, 'resize', layout);
      api.on(opts, 'pointerdown', e => {
        const o = e.target.closest && e.target.closest('.opt'); if (!o || lock) return;
        if (o._it === target) {
          lock = true; o.classList.add('win');
          opts.querySelectorAll('.opt').forEach(x => { if (x !== o) x.classList.add('lose'); });
          Snd.cheer();
          const r = o.getBoundingClientRect();
          FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 30, power: 1.2 });
          api.say(`Đúng rồi! ${target.n.vi}!`, `Yes! ${target.n.en}!`);
          api.timeout(round, 2800);
        } else {
          wrongs++; Snd.oops();
          o.classList.remove('wrong'); void o.offsetWidth; o.classList.add('wrong');
          if (wrongs >= 2) { opts.querySelectorAll('.opt').forEach(x => x.classList.toggle('hint', x._it === target)); }
          api.timeout(prompt, 900);
        }
      });
      round();
    }
  });
})();
