/* Little Play: games for ages 15 months and up (draw, buttons, feeding, shapes, finding) */
(function () {
  'use strict';
  const { $, rand, pick, shuffle, Snd, FX, S, DATA, SHAPES } = BE;

  /* ============ 5. DRAW (15 months+): rainbow, stamps, animal stamps, sparkles ============ */
  BE.GAMES.push({
    id: 'paint', icon: '🎨', color: '#ffd9a8', bg: '#fffdf4', min: 15,
    name: { vi: 'Vẽ', en: 'Draw' },
    start(api) {
      const root = api.root;
      root.innerHTML = `<div class="paint"><canvas></canvas></div>
        <div class="tools">
          <button class="round-btn on" data-m="line" aria-label="Rainbow brush">🌈</button>
          <button class="round-btn" data-m="stamp" aria-label="Star and flower stamps">⭐</button>
          <button class="round-btn" data-m="animal" aria-label="Animal stamps">🐾</button>
          <button class="round-btn" data-m="spark" aria-label="Sparkle trail">✨</button>
        </div>
        <button class="round-btn clearbtn" aria-label="Clear the page">🧽</button>`;
      const cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
      let W = 0, H = 0, dpr = 1, mode = 'line', hue = 0, lastSnd = 0;
      const ptrs = new Map();
      const STAMPS = ['⭐', '🌸', '💖', '🐠', '🦋', '🌈', '🍀', '🌼', '🍓'];

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

      function dot(x, y, k) {
        hue = (hue + 37) % 360;
        ctx.fillStyle = `hsl(${hue},90%,60%)`;
        ctx.beginPath(); ctx.arc(x, y, brush() * (k || 0.55), 0, 7); ctx.fill();
      }
      function stamp(x, y, animal, first) {
        const s = brush() * (animal ? rand(2.4, 3.2) : rand(1.6, 2.6));
        let em;
        if (animal) {
          const a = pick(DATA.ANIMALS); em = a.e;
          if (first && performance.now() - lastSnd > 700) { lastSnd = performance.now(); Snd.animal(a.e); }
        } else { em = pick(STAMPS); Snd.pop(); }
        ctx.save(); ctx.translate(x, y); ctx.rotate(rand(-.5, .5));
        ctx.font = s + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(em, 0, 0); ctx.restore();
      }
      api.on(cv, 'pointerdown', e => {
        ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, d: 0 });
        if (mode === 'line') dot(e.clientX, e.clientY);
        else if (mode === 'spark') { dot(e.clientX, e.clientY, .25); FX.burst(e.clientX, e.clientY, { n: 8, power: .7 }); Snd.tone(900 + Math.random() * 600, { dur: .15, vol: .15 }); }
        else stamp(e.clientX, e.clientY, mode === 'animal', true);
      });
      api.on(cv, 'pointermove', e => {
        const p = ptrs.get(e.pointerId); if (!p) return;
        const x = e.clientX, y = e.clientY, dist = Math.hypot(x - p.x, y - p.y);
        if (mode === 'line' || mode === 'spark') {
          hue = (hue + dist * 0.9) % 360;
          ctx.strokeStyle = `hsl(${hue},90%,60%)`; ctx.lineWidth = mode === 'line' ? brush() : brush() * 0.3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(x, y); ctx.stroke();
          p.d += dist;
          if (mode === 'spark' && p.d > 28) { p.d = 0; FX.burst(x, y, { n: 3, power: .6, size: .8 }); }
          p.x = x; p.y = y;
        } else {
          p.d += dist; p.x = x; p.y = y;
          if (p.d > brush() * 2.2) { p.d = 0; stamp(x, y, mode === 'animal', false); }
        }
      });
      ['pointerup', 'pointercancel'].forEach(ev => api.on(cv, ev, e => ptrs.delete(e.pointerId)));

      api.on(root.querySelector('.tools'), 'pointerdown', e => {
        const b = e.target.closest('button'); if (!b) return;
        mode = b.dataset.m; Snd.click();
        root.querySelectorAll('.tools .round-btn').forEach(x => x.classList.toggle('on', x === b));
      });
      api.on(root.querySelector('.clearbtn'), 'pointerdown', () => {
        Snd.whoosh(); cv.style.opacity = 0;
        api.timeout(() => { ctx.clearRect(0, 0, W, H); cv.style.opacity = 1; }, 380);
      });
    }
  });

  /* ============ 6. BUTTONS (18 months+): twelve things to switch, ring, drive and pop ============ */
  BE.GAMES.push({
    id: 'busy', icon: '🔔', color: '#e1d4ff', bg: 'linear-gradient(#efe6ff,#d9ecff)', min: 18,
    name: { vi: 'Nút bấm', en: 'Buttons' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="busy"></div>';
      const busy = root.firstChild;
      let lightOn = false, night = false, launching = false, doorOpen = false, tl = 0, balloon = 0;
      const center = t => { const r = t.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
      const ani = (el, cls) => { el.classList.remove('ring', 'squash', 'drive', 'launch'); void el.offsetWidth; el.classList.add(cls); };
      const say = s => api.say(s, s);

      const tiles = [
        { c: '#5b5f85', cls: 'off', e: '💡', act(t) {
            lightOn = !lightOn; t.classList.toggle('on', lightOn); t.classList.toggle('off', !lightOn);
            Snd.light(lightOn); say(lightOn ? 'Light on!' : 'Light off!');
            if (lightOn) FX.burst(...center(t), { n: 12, colors: ['#ffd43b', '#fff3a0', '#fff'] });
          } },
        { c: '#ffe08a', e: '🔔', act(t, big) { Snd.bell(); ani(big, 'ring'); say('Ding dong!'); } },
        { c: '#ffb3b3', e: '🥁', act(t, big) { Snd.drum(); ani(big, 'squash'); say('Boom boom!'); FX.burst(...center(t), { n: 8, emoji: ['🎵'] }); } },
        { c: '#b8e0ff', e: '🚗', act(t, big) { Snd.horn(); ani(big, 'drive'); say('Beep beep! The car goes!'); } },
        { c: '#d3f9d8', e: '🚀', act(t, big) { launch(t, big); } },
        { c: '#ffe3a3', e: '☀️', act(t, big) {
            night = !night; big.textContent = night ? '🌙' : '☀️';
            t.style.background = night ? '#3b3f78' : '#ffe3a3';
            busy.classList.toggle('night', night);
            Snd.light(!night); ani(big, 'squash');
            say(night ? 'Night time. Sleep tight!' : 'Good morning!');
          } },
        { c: '#ffd8a8', e: '🚪', act(t, big) {
            doorOpen = !doorOpen;
            if (doorOpen) {
              const a = pick(DATA.ANIMALS); big.textContent = a.e; ani(big, 'squash');
              say('Knock knock! Peekaboo! ' + a.n.en + '!'); api.timeout(() => Snd.animal(a.e), 1500);
              FX.burst(...center(t), { n: 12 });
            } else { big.textContent = '🚪'; Snd.click(); say('Door closed.'); }
          } },
        { c: '#e9ecef', e: '🚦', act(t, big) {
            tl = (tl + 1) % 3;
            const st = [['🔴', 'Red! Stop!', '#ffc9c9', 330], ['🟡', 'Yellow! Slow down!', '#fff3bf', 440], ['🟢', 'Green! Go!', '#b2f2bb', 660]][tl];
            big.textContent = st[0]; t.style.background = st[2]; Snd.tone(st[3], { dur: .3, vol: .25, type: 'triangle' }); ani(big, 'squash'); say(st[1]);
          } },
        { c: '#c5f6fa', e: '🚂', act(t, big) { Snd.choo(); ani(big, 'drive'); say('Choo choo!'); } },
        { c: '#ffec99', e: '⏰', act(t, big) { Snd.alarm(); ani(big, 'ring'); say('Ring ring! Wake up!'); } },
        { c: '#ffdeeb', e: '🎈', act(t, big) {
            balloon++;
            if (balloon >= 3) {
              balloon = 0; big.textContent = '💥'; big.style.transform = 'scale(1.1)'; Snd.pop(2); Snd.drum();
              FX.burst(...center(t), { n: 24 }); say('Pop!');
              api.timeout(() => { big.textContent = '🎈'; big.style.transform = 'scale(1)'; }, 800);
            } else { big.style.transform = `scale(${1 + balloon * 0.28})`; Snd.tone(500 + balloon * 150, { dur: .25, to: 800 + balloon * 150, vol: .2 }); say(balloon === 1 ? 'Bigger!' : 'Even bigger!'); }
          } },
        { c: '#fff3bf', e: '🦆', act(t, big) { Snd.squeak(); ani(big, 'squash'); say('Squeak squeak!'); } }
      ];
      function launch(t, big) {
        if (launching) return; launching = true;
        say('Three, two, one, blast off!');
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
        const f = BE.fit(tiles.length, innerWidth - 24, innerHeight - 100, 0.1, 240);
        busy.style.setProperty('--s', f.s + 'px'); busy.style.setProperty('--g', f.gap + 'px');
      }
      layout(); api.on(window, 'resize', layout);
      api.on(busy, 'pointerdown', e => {
        const t = e.target.closest && e.target.closest('.tile'); if (!t) return;
        t._d.act(t, t.querySelector('.big'));
      });
    }
  });

  /* ============ 7. FEED THE FRIENDS (24 months+): six hungry animals ============ */
  function faceSVG(c) {
    let ears;
    if (c.ear === 'round') ears = `<circle cx="36" cy="44" r="28" fill="${c.earC}"/><circle cx="36" cy="44" r="14" fill="${c.earIn}"/><circle cx="164" cy="44" r="28" fill="${c.earC}"/><circle cx="164" cy="44" r="14" fill="${c.earIn}"/>`;
    else if (c.ear === 'long') ears = `<ellipse cx="68" cy="34" rx="18" ry="48" fill="${c.earC}" stroke="${c.stroke}" stroke-width="3"/><ellipse cx="68" cy="34" rx="9" ry="36" fill="${c.earIn}"/><ellipse cx="132" cy="34" rx="18" ry="48" fill="${c.earC}" stroke="${c.stroke}" stroke-width="3"/><ellipse cx="132" cy="34" rx="9" ry="36" fill="${c.earIn}"/>`;
    else if (c.ear === 'cat') ears = `<polygon points="30,76 38,14 86,46" fill="${c.earC}"/><polygon points="44,58 41,32 68,48" fill="${c.earIn}"/><polygon points="170,76 162,14 114,46" fill="${c.earC}"/><polygon points="156,58 159,32 132,48" fill="${c.earIn}"/>`;
    else ears = `<ellipse cx="32" cy="88" rx="22" ry="46" fill="${c.earC}" transform="rotate(12 32 88)"/><ellipse cx="168" cy="88" rx="22" ry="46" fill="${c.earC}" transform="rotate(-12 168 88)"/>`;
    const patch = c.patch ? `<ellipse cx="70" cy="90" rx="17" ry="21" fill="#2b2b2b" transform="rotate(-22 70 90)"/><ellipse cx="130" cy="90" rx="17" ry="21" fill="#2b2b2b" transform="rotate(22 130 90)"/><circle cx="72" cy="88" r="11" fill="#fff"/><circle cx="128" cy="88" r="11" fill="#fff"/>` : '';
    const whisk = c.whiskers ? '<g stroke="#8a5a2b" stroke-width="2.5" stroke-linecap="round"><line x1="40" y1="122" x2="12" y2="116"/><line x1="40" y1="130" x2="12" y2="134"/><line x1="160" y1="122" x2="188" y2="116"/><line x1="160" y1="130" x2="188" y2="134"/></g>' : '';
    return `<svg viewBox="0 0 200 200">${ears}
      <circle cx="100" cy="106" r="76" fill="${c.head}" stroke="${c.stroke || 'none'}" stroke-width="3"/>
      <ellipse cx="100" cy="132" rx="42" ry="34" fill="${c.muzzle}"/>${patch}
      <g class="eye"><circle cx="72" cy="88" r="9" fill="#33231a"/><circle cx="75" cy="85" r="3" fill="#fff"/></g>
      <g class="eye"><circle cx="128" cy="88" r="9" fill="#33231a"/><circle cx="131" cy="85" r="3" fill="#fff"/></g>
      <circle cx="52" cy="112" r="10" fill="#ff9aa8" opacity=".5"/><circle cx="148" cy="112" r="10" fill="#ff9aa8" opacity=".5"/>
      <ellipse cx="100" cy="114" rx="12" ry="8.5" fill="${c.nose}"/>${whisk}
      <g class="mouth"><ellipse class="hole" cx="100" cy="142" rx="19" ry="13" fill="#7a1f2b"/><ellipse cx="100" cy="148" rx="11" ry="6" fill="#ff7b8b"/></g>
    </svg>`;
  }
  const CHARS = [
    { name: 'bear', head: '#b9803f', ear: 'round', earC: '#a3682f', earIn: '#f4b6c2', muzzle: '#f1d3a5', nose: '#33231a', fav: '🍯' },
    { name: 'bunny', head: '#f7eef4', stroke: '#e2c9d9', ear: 'long', earC: '#f7eef4', earIn: '#f9b4c9', muzzle: '#ffffff', nose: '#f78fb3', fav: '🥕' },
    { name: 'kitty', head: '#f4a259', ear: 'cat', earC: '#f4a259', earIn: '#f9c9a4', muzzle: '#fde8d0', nose: '#e07a7a', whiskers: true, fav: '🐟' },
    { name: 'puppy', head: '#d9a566', ear: 'floppy', earC: '#8a5a2b', muzzle: '#f3dfc0', nose: '#33231a', fav: '🍖' },
    { name: 'panda', head: '#ffffff', stroke: '#d8d0c8', ear: 'round', earC: '#2b2b2b', earIn: '#555555', muzzle: '#f3f0ea', nose: '#2b2b2b', patch: true, fav: null },
    { name: 'monkey', head: '#8d5a35', ear: 'round', earC: '#8d5a35', earIn: '#f1c9a5', muzzle: '#f1c9a5', nose: '#5a3720', fav: '🍌' }
  ];

  BE.GAMES.push({
    id: 'feed', icon: '🐻', color: '#ffe0c2', bg: 'linear-gradient(#fff1de,#ffe0ec)', min: 24,
    name: { vi: 'Cho ăn', en: 'Feed the animals' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="fd"><div class="bear"></div><div class="tray"></div></div><button class="round-btn newfriend" aria-label="New friend">&#x21BB;</button>';
      const fd = root.firstChild, bear = fd.querySelector('.bear'), tray = fd.querySelector('.tray'), swapBtn = root.querySelector('.newfriend');
      let eating = false, ci = 0, meals = 0, hole = null;
      const say = s => api.say(s, s);
      const mc = () => { const r = hole.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
      const bearR = () => bear.getBoundingClientRect().width;

      function setChar(hello) {
        const c = CHARS[ci];
        bear.innerHTML = faceSVG(c); hole = bear.querySelector('.hole');
        bear.classList.remove('happy'); void bear.offsetWidth; bear.classList.add('happy');
        setTimeout(() => bear.classList.remove('happy'), 800);
        if (hello) say(`Hello, ${c.name}!`);
        // Make sure this friend's favourite food shows up sometimes
        tray.querySelectorAll('.slotf').forEach(sl => { const f = sl.querySelector('.food'); if (f && Math.random() < .4 && c.fav) { f.remove(); addFood(sl); } });
      }
      function sizeTray() { tray.style.setProperty('--f', Math.max(84, Math.min(innerWidth * 0.26, innerHeight * 0.24, 170)) + 'px'); }
      sizeTray(); api.on(window, 'resize', sizeTray);

      function shown() { return [...tray.querySelectorAll('.food')].map(f => f._f.e); }
      function chooseFood() {
        const fav = CHARS[ci].fav, have = shown();
        if (fav && !have.includes(fav) && Math.random() < .5) return DATA.FOODS.find(f => f.e === fav);
        return pick(DATA.FOODS.filter(f => !have.includes(f.e)));
      }
      function addFood(slot) {
        const f = chooseFood(), el = document.createElement('div');
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
          const isFav = el._f.e === CHARS[ci].fav;
          FX.burst(c.x, c.y, { n: isFav ? 20 : 8, emoji: ['💖', '✨'] });
          if (isFav) { api.timeout(() => Snd.cheer(), 500); say(`${el._f.n.en}! My favorite!`); }
          else say(`${el._f.n.en}. Yummy!`);
          meals++;
          api.timeout(() => {
            bear.classList.remove('chomp', 'happy'); eating = false; addFood(slot);
            if (meals % 3 === 0) { ci = (ci + 1) % CHARS.length; Snd.whoosh(); setChar(true); }
          }, 1000);
        }, 340);
      }
      for (let i = 0; i < 3; i++) { const s = document.createElement('div'); s.className = 'slotf'; tray.appendChild(s); addFood(s); }
      setChar(false);
      api.timeout(() => say('Feed the bear!'), 500);
      api.on(swapBtn, 'pointerdown', () => { if (eating) return; ci = (ci + 1) % CHARS.length; Snd.whoosh(); setChar(true); });
    }
  });

  /* ============ 8. SHAPES (24 months+): ten shapes, three or four holes ============ */
  BE.GAMES.push({
    id: 'shapes', icon: '🧩', color: '#c9f0ee', bg: 'linear-gradient(#dbf7f4,#eee4ff)', min: 24,
    name: { vi: 'Xếp hình', en: 'Shapes' },
    start(api) {
      const root = api.root;
      const COLS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#51cf66', '#4dabf7', '#b197fc', '#f783ac', '#20c997'];
      let placed = 0, over = false, rc = 0, total = 3;

      function round() {
        placed = 0; over = false;
        total = (rc >= 2 && rc % 2 === 0) ? 4 : 3; rc++;
        const ids = shuffle(Object.keys(SHAPES)).slice(0, total), cols = shuffle(COLS).slice(0, total);
        const items = ids.map((id, i) => ({ id, c: cols[i] }));
        const W = innerWidth, H = innerHeight;
        let cols_ = total, S_ = Math.min((W - 24) / (total + (total - 1) * 0.25), (H - 120) / 2.1, 170);
        if (total === 4) {
          const s2 = Math.min((W - 24) / 2.25, (H - 130) / 4.9, 170);
          if (s2 > S_ * 1.15) { cols_ = 2; S_ = s2; }
        }
        S_ = Math.max(70, S_);
        const rowW = cols_ * S_ + (cols_ - 1) * S_ * 0.25 + 4;
        root.innerHTML = '<div class="sh"><div class="row-s holes"></div><div class="row-s pieces"></div></div>';
        const sh = root.firstChild; sh.style.setProperty('--S', S_ + 'px');
        const holesEl = sh.querySelector('.holes'), piecesEl = sh.querySelector('.pieces');
        holesEl.style.width = piecesEl.style.width = rowW + 'px';
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
              Snd.ding(Snd.PENTA[placed % 8]); placed++;
              FX.burst(hc.x, hc.y, { n: 12, colors: [it.c, '#fff'] });
              api.say(it.id, it.id);
              if (placed === total && !over) {
                over = true;
                api.timeout(() => { Snd.cheer(); FX.burst(innerWidth / 2, innerHeight / 2, { n: 40, power: 1.4 }); api.say('Great job!', 'Great job!'); }, 900);
                api.timeout(() => { Snd.whoosh(); round(); }, 3600);
              }
            }, glide ? 480 : 420);
          }
          BE.draggable(p, {
            onStart() { p.classList.remove('back', 'glide', 'wrong'); },
            onMove(dx, dy) { p.style.transform = `translate(${t.x + dx}px,${t.y + dy}px) scale(1.12)`; },
            onDrop() {
              const pc = cen(p), hc = cen(holes[it.id]);
              if (Math.hypot(pc.x - hc.x, pc.y - hc.y) < S_ * 0.65) { snap(false); return; }
              const wrong = Object.keys(holes).some(k => k !== it.id && !holes[k].classList.contains('done') && Math.hypot(pc.x - cen(holes[k]).x, pc.y - cen(holes[k]).y) < S_ * 0.5);
              if (wrong) Snd.oops();
              p.classList.add('back'); p.style.transform = `translate(${t.x}px,${t.y}px)`;
            },
            onTap() { snap(true); }
          });
        });
        api.timeout(() => api.say('Put the shapes in the holes!', 'Put the shapes in the holes!'), 500);
      }
      round();
      api.on(window, 'resize', () => { if (placed < total) round(); });
    }
  });

  /* ============ 9. FIND IT (30 months+): things, colours, animal sounds, counting ============ */
  BE.GAMES.push({
    id: 'find', icon: '🔍', color: '#ffcfd2', bg: 'linear-gradient(#ffe4e6,#e4f1ff)', min: 30,
    name: { vi: 'Tìm đồ', en: 'Find it' },
    start(api) {
      const root = api.root;
      root.innerHTML = `<div class="fn"><div class="fn-top"><button class="round-btn" aria-label="Hear it again">🔊</button><div class="fn-q"></div></div><div class="fn-opts"></div></div>`;
      const q = root.querySelector('.fn-q'), opts = root.querySelector('.fn-opts'), again = root.querySelector('.round-btn');
      const MODES = ['item', 'color', 'sound', 'count', 'item', 'sound', 'color', 'item', 'count', 'sound'];
      let cur = null, n = 0, wrongs = 0, lock = false, lastKey = '', nameT = null;

      function make(mode) {
        if (mode === 'item') {
          const three = shuffle(DATA.ITEMS).slice(0, 3), t = pick(three);
          return { mode, key: 'i' + t.e, opts: three.map(x => ({ html: x.e })), t: three.indexOf(t),
            text: `Where is the ${t.n.en}?`, praise: `Yes! ${t.n.en}!` };
        }
        if (mode === 'color') {
          const three = shuffle(DATA.COLORS).slice(0, 3), t = pick(three);
          return { mode, key: 'c' + t.c, opts: three.map(x => ({ html: `<div class="dot" style="background:${x.c}"></div>` })), t: three.indexOf(t),
            text: `Which one is ${t.n.en}?`, praise: `Yes! ${t.n.en}!` };
        }
        if (mode === 'sound') {
          const three = shuffle(DATA.ANIMALS).slice(0, 3), t = pick(three);
          return { mode, key: 's' + t.e, opts: three.map(x => ({ html: x.e })), t: three.indexOf(t),
            text: 'Who makes this sound?', praise: `Yes! ${t.n.en}!`, sound: t.e };
        }
        const c = pick(DATA.COUNTABLE), nums = shuffle([1, 2, 3]), tn = pick(nums);
        const word = tn === 1 ? c[1] : c[2];
        return { mode, key: 'n' + c[0] + tn, count: true,
          opts: nums.map(k => ({ html: `<span class="cnt-row" style="font-size:calc(var(--s)*${[.46, .29, .22][k - 1]})">${c[0].repeat(k)}</span>` })), t: nums.indexOf(tn),
          text: tn === 1 ? `Where is one ${c[1]}?` : `Where are ${DATA.NUM[tn]} ${word}?`, praise: `Yes! ${DATA.NUM[tn]} ${word}!` };
      }
      function prompt() {
        q.textContent = cur.text;
        clearTimeout(nameT);
        if (cur.sound) { const len = Snd.animal(cur.sound); nameT = api.timeout(() => api.say(cur.text, cur.text), len * 1000 + 200); }
        else api.say(cur.text, cur.text);
      }
      function layout() {
        const f = BE.fit(3, innerWidth - 24, innerHeight - 130, 0.12, 250);
        opts.style.setProperty('--s', f.s + 'px'); opts.style.setProperty('--g', f.gap + 'px');
      }
      function round() {
        lock = false; wrongs = 0; opts.innerHTML = '';
        const mode = MODES[n % MODES.length]; n++;
        do { cur = make(mode); } while (cur.key === lastKey);
        lastKey = cur.key;
        cur.opts.forEach((o, i) => {
          const el = document.createElement('div'); el.className = 'opt'; el.style.animationDelay = (i * 0.08) + 's';
          el.innerHTML = o.html; el._i = i;
          if (i === cur.t) el.dataset.correct = '1';
          opts.appendChild(el);
        });
        layout();
        api.timeout(prompt, 600);
      }
      api.on(again, 'pointerdown', () => { Snd.click(); prompt(); });
      api.on(window, 'resize', layout);
      api.on(opts, 'pointerdown', e => {
        const o = e.target.closest && e.target.closest('.opt'); if (!o || lock) return;
        if (o._i === cur.t) {
          lock = true; o.classList.add('win'); clearTimeout(nameT); BE.Voice.stop();
          opts.querySelectorAll('.opt').forEach(x => { if (x !== o) x.classList.add('lose'); });
          Snd.cheer();
          const r = o.getBoundingClientRect();
          FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 30, power: 1.2 });
          api.say(cur.praise, cur.praise);
          api.timeout(round, 2800);
        } else {
          wrongs++; Snd.oops();
          o.classList.remove('wrong'); void o.offsetWidth; o.classList.add('wrong');
          if (wrongs >= 2) opts.querySelectorAll('.opt').forEach(x => x.classList.toggle('hint', x._i === cur.t));
          api.timeout(prompt, 900);
        }
      });
      round();
    }
  });
})();
