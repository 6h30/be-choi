/* Bé chơi nào — nhóm trò cho bé 12–24 tháng: chạm là có tiếng, có hình */
(function () {
  'use strict';
  const { $, rand, pick, shuffle, Snd, FX, S, DATA } = BE;

  /* ---------- Dữ liệu dùng chung ---------- */
  // [emoji, tên VN, tiếng kêu VN, tên EN, tiếng kêu EN]
  DATA.ANIMALS = [
    ['🐱', 'con mèo', 'meo meo', 'cat', 'meow meow'],
    ['🐶', 'con chó', 'gâu gâu', 'dog', 'woof woof'],
    ['🐮', 'con bò', 'ò ò', 'cow', 'moo moo'],
    ['🦆', 'con vịt', 'cạp cạp', 'duck', 'quack quack'],
    ['🐔', 'con gà', 'ò ó o o', 'chicken', 'cluck cluck'],
    ['🐷', 'con heo', 'ụt ịt', 'pig', 'oink oink'],
    ['🐸', 'con ếch', 'ộp ộp', 'frog', 'ribbit ribbit'],
    ['🐑', 'con cừu', 'bê bê', 'sheep', 'baa baa'],
    ['🐴', 'con ngựa', 'hí hí', 'horse', 'neigh neigh'],
    ['🐦', 'con chim', 'chíp chíp', 'bird', 'tweet tweet'],
    ['🦁', 'con sư tử', 'gào gào', 'lion', 'roar roar'],
    ['🐘', 'con voi', 'pa pa', 'elephant', 'toot toot']
  ].map(a => ({ e: a[0], n: { vi: a[1], en: a[3] }, s: { vi: a[2], en: a[4] } }));

  DATA.FOODS = [
    ['🍎', 'quả táo', 'apple'], ['🍌', 'quả chuối', 'banana'], ['🍓', 'quả dâu', 'strawberry'],
    ['🍊', 'quả cam', 'orange'], ['🍇', 'chùm nho', 'grapes'], ['🥕', 'củ cà rốt', 'carrot'],
    ['🍞', 'bánh mì', 'bread'], ['🍉', 'miếng dưa hấu', 'watermelon'], ['🍯', 'hũ mật ong', 'honey']
  ].map(a => ({ e: a[0], n: { vi: a[1], en: a[2] } }));

  DATA.ITEMS = [
    ['🍎', 'quả táo', 'apple'], ['🍌', 'quả chuối', 'banana'], ['🍊', 'quả cam', 'orange'], ['🍓', 'quả dâu', 'strawberry'],
    ['🥕', 'củ cà rốt', 'carrot'], ['⚽', 'quả bóng', 'ball'], ['🚗', 'chiếc xe', 'car'], ['🐱', 'con mèo', 'cat'],
    ['🐶', 'con chó', 'dog'], ['🐟', 'con cá', 'fish'], ['🌸', 'bông hoa', 'flower'], ['⭐', 'ngôi sao', 'star'],
    ['☀️', 'mặt trời', 'sun'], ['🌳', 'cái cây', 'tree'], ['🏠', 'ngôi nhà', 'house'], ['👟', 'chiếc giày', 'shoe'],
    ['🐔', 'con gà', 'chicken'], ['🍞', 'bánh mì', 'bread']
  ].map(a => ({ e: a[0], n: { vi: a[1], en: a[2] } }));

  DATA.COLORS = [
    ['#ff5b5b', 'đỏ', 'red'], ['#ffd43b', 'vàng', 'yellow'], ['#4dabf7', 'xanh dương', 'blue'],
    ['#51cf66', 'xanh lá', 'green'], ['#ff9f43', 'cam', 'orange'], ['#b197fc', 'tím', 'purple'], ['#f783ac', 'hồng', 'pink']
  ].map(a => ({ c: a[0], n: { vi: a[1], en: a[2] } }));

  /* ============ 1. BONG BÓNG (12 tháng+) ============ */
  BE.GAMES.push({
    id: 'bubbles', icon: '🎈', color: '#bfe9ff', bg: 'linear-gradient(#d9f2ff,#fdeaff)', min: 12,
    name: { vi: 'Bong bóng', en: 'Bubbles' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="bub-layer"></div>';
      const layer = root.firstChild;
      const COLS = ['#ff9ec4', '#ffd166', '#8fe3a8', '#9ad1ff', '#c3a6ff', '#ffb38a'];
      const REV = ['⭐', '🐠', '🦋', '🐥', '🌈', '💖', '🐞', '🌼'];
      const bubs = [];
      const base = () => Math.min(innerWidth, innerHeight);

      function place(b) {
        b.el.style.transform = `translate(${b.x + Math.sin(b.t * 1.2 + b.ph) * b.sw - b.d / 2}px,${b.y - b.d / 2}px) scale(${b.grow})`;
      }
      function spawn(x, y, tapped) {
        if (bubs.length > 14) return;
        const el = document.createElement('div');
        el.className = 'bubble';
        const d = base() * rand(0.26, 0.4), col = pick(COLS);
        el.style.cssText = `width:${d}px;height:${d}px;--c:${col}`;
        layer.appendChild(el);
        const b = { el, d, col, x: x == null ? rand(d / 2, innerWidth - d / 2) : x, y: y == null ? innerHeight + d / 2 : y,
          vy: rand(28, 55), ph: rand(0, 6.28), sw: rand(8, 26), t: 0, grow: tapped ? 0.05 : 1 };
        el._b = b; bubs.push(b); place(b);
      }
      function pop(b) {
        const i = bubs.indexOf(b); if (i < 0) return;
        bubs.splice(i, 1);
        const x = b.x, y = b.y;
        b.el.remove();
        // bóng nhỏ kêu cao hơn
        const idx = Math.max(0, Math.min(7, Math.round(8 - (b.d / base()) * 18)));
        Snd.pop(idx);
        FX.burst(x, y, { colors: [b.col, '#ffffff', '#fff3a0'], n: 14 });
        if (Math.random() < 0.4) {
          const s = document.createElement('div');
          s.className = 'reveal'; s.textContent = pick(REV);
          s.style.left = x + 'px'; s.style.top = y + 'px';
          root.appendChild(s); setTimeout(() => s.remove(), 1500);
        }
      }
      for (let i = 0; i < 6; i++) spawn(rand(60, innerWidth - 60), rand(innerHeight * 0.3, innerHeight));
      api.on(layer, 'pointerdown', e => {
        const t = e.target.closest && e.target.closest('.bubble');
        if (t && t._b) pop(t._b);
        else { Snd.tone(500, { dur: .15, to: 900, vol: .15 }); spawn(e.clientX, e.clientY, true); }
      });
      api.loop(dt => {
        for (let i = bubs.length - 1; i >= 0; i--) {
          const b = bubs[i];
          b.t += dt; b.y -= b.vy * dt;
          if (b.grow < 1) b.grow = Math.min(1, b.grow + dt * 2.5);
          place(b);
          if (b.y < -b.d) { b.el.remove(); bubs.splice(i, 1); }
        }
        if (bubs.length < 7 && Math.random() < dt * 1.5) spawn();
      });
    }
  });

  /* ============ 2. Ú ÒA (12 tháng+) ============ */
  BE.GAMES.push({
    id: 'peekaboo', icon: '🙈', color: '#ffd6e0', bg: 'linear-gradient(#ffe9f0,#fff4d6)', min: 12,
    name: { vi: 'Ú òa', en: 'Peekaboo' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="pk"></div>';
      const pk = root.firstChild;
      const CV = ['#ff8fab', '#74c0fc', '#ffd43b', '#8ce99a'];
      let slots = [], opened = 0, locked = false;

      function layout() {
        const f = BE.fit(4, innerWidth - 24, innerHeight - 100, 0.1, 260);
        pk.style.setProperty('--s', f.s + 'px'); pk.style.setProperty('--g', f.gap + 'px');
      }
      function round() {
        pk.innerHTML = ''; slots = []; opened = 0; locked = false;
        const an = shuffle(DATA.ANIMALS).slice(0, 4);
        an.forEach((a, i) => {
          const s = document.createElement('div'); s.className = 'slot';
          s.innerHTML = `<div class="an">${a.e}</div><div class="cv" style="--c:${CV[i]};animation-delay:${-i * 0.5}s"></div>`;
          s._a = a; pk.appendChild(s); slots.push(s);
        });
      }
      layout(); round();
      api.on(window, 'resize', layout);
      api.on(pk, 'pointerdown', e => {
        const s = e.target.closest && e.target.closest('.slot'); if (!s) return;
        const an = s.querySelector('.an');
        if (!s.classList.contains('open')) {
          s.classList.add('open'); opened++;
          Snd.boing(); Snd.tone(880, { at: .1, dur: .3, vol: .2, type: 'triangle' });
          const r = s.getBoundingClientRect();
          FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 18 });
          api.say(`Ú òa! ${s._a.n.vi}!`, `Peekaboo! ${s._a.n.en}!`);
          api.timeout(() => Snd.animal(s._a.e), 1200);
          if (opened === slots.length && !locked) {
            locked = true;
            api.timeout(() => { Snd.whoosh(); slots.forEach(x => x.classList.remove('open')); api.timeout(round, 550); }, 3200);
          }
        } else {
          an.classList.remove('hop'); void an.offsetWidth; an.classList.add('hop');
          Snd.animal(s._a.e);
          BE.floatText(root, s._a.s[S.lang] + '!', e.clientX, e.clientY, 'big');
        }
      });
    }
  });

  /* ============ 3. TIẾNG KÊU CON VẬT (12 tháng+) ============ */
  BE.GAMES.push({
    id: 'animals', icon: '🐮', color: '#d8f5c8', bg: 'linear-gradient(#e6fbd6,#d6f0ff)', min: 12,
    name: { vi: 'Con vật kêu', en: 'Animal sounds' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="an-grid"></div><button class="round-btn bottom-center" aria-label="New animals">🔄</button>';
      const gridEl = root.firstChild, next = root.lastChild;
      const BG = ['#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#ffadad'];
      let set = [];

      function layout() {
        const f = BE.fit(6, innerWidth - 24, innerHeight - 170, 0.1, 240);
        gridEl.style.setProperty('--s', f.s + 'px'); gridEl.style.setProperty('--g', f.gap + 'px');
      }
      function fill() {
        gridEl.innerHTML = '';
        set = shuffle(DATA.ANIMALS).slice(0, 6);
        set.forEach((a, i) => {
          const t = document.createElement('div');
          t.className = 'an-tile'; t.style.background = BG[i % BG.length];
          t.innerHTML = `${a.e}<small>${a.n[S.lang]}</small>`;
          t._a = a; gridEl.appendChild(t);
        });
      }
      layout(); fill();
      api.on(window, 'resize', layout);
      let nameT = null;
      api.on(gridEl, 'pointerdown', e => {
        const t = e.target.closest && e.target.closest('.an-tile'); if (!t) return;
        const a = t._a;
        t.classList.remove('hit'); void t.offsetWidth; t.classList.add('hit');
        // Phát đúng tiếng kêu của con vật, rồi mới gọi tên
        BE.Voice.stop(); clearTimeout(nameT);
        const len = Snd.animal(a.e);
        const r = t.getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 10, emoji: ['🎵', '✨'] });
        BE.floatText(root, a.s[S.lang] + '!', r.left + r.width / 2, r.top + r.height * 0.2, 'big');
        nameT = api.timeout(() => api.say(a.n.vi, a.n.en), len * 1000 + 150);
      });
      api.on(next, 'pointerdown', () => { Snd.whoosh(); fill(); });
    }
  });

  /* ============ 4. ĐÀN (12 tháng+) ============ */
  BE.GAMES.push({
    id: 'xylo', icon: '🎹', color: '#fff0b3', bg: 'linear-gradient(#fff6cc,#ffe3ec)', min: 12,
    name: { vi: 'Đàn', en: 'Music' },
    start(api) {
      const root = api.root;
      // 8 notes: Do Re Mi Fa Sol La Ti Do
      const N = [
        { f: 261.63, c: '#ff6b6b', n: 'Do' }, { f: 293.66, c: '#ffa94d', n: 'Re' }, { f: 329.63, c: '#ffd43b', n: 'Mi' },
        { f: 349.23, c: '#a9e34b', n: 'Fa' }, { f: 392.00, c: '#38d9a9', n: 'Sol' }, { f: 440.00, c: '#4dabf7', n: 'La' },
        { f: 493.88, c: '#9775fa', n: 'Ti' }, { f: 523.25, c: '#f783ac', n: 'Do' }
      ];
      root.innerHTML = '<div class="xy"></div><button class="round-btn xybtn" aria-label="Play a song">▶&#xFE0E;</button>';
      const xy = root.firstChild, btn = root.lastChild;
      const bars = N.map((n, i) => {
        const b = document.createElement('div');
        b.className = 'bar'; b.style.setProperty('--c', n.c); b.style.setProperty('--k', 1 - i / (N.length - 1)); b.dataset.i = i;
        b.textContent = n.n;
        xy.appendChild(b); return b;
      });
      function hit(i, x, y) {
        Snd.marimba(N[i].f);
        const b = bars[i]; b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
        const r = b.getBoundingClientRect();
        x = x == null ? r.left + r.width / 2 : x; y = y == null ? r.top + r.height / 2 : y;
        BE.floatText(root, pick(['♪', '♫', '🎵']), x, y);
        FX.burst(x, y, { n: 6, power: .6, colors: [N[i].c, '#fff'] });
      }
      const last = new Map();
      function handle(e) {
        const t = document.elementFromPoint(e.clientX, e.clientY);
        const b = t && t.closest && t.closest('.bar');
        if (!b) { last.delete(e.pointerId); return; }
        const i = +b.dataset.i;
        if (last.get(e.pointerId) !== i) { last.set(e.pointerId, i); hit(i, e.clientX, e.clientY); }
      }
      api.on(xy, 'pointerdown', handle);
      api.on(xy, 'pointermove', e => { if (e.buttons) handle(e); });
      ['pointerup', 'pointercancel'].forEach(ev => api.on(xy, ev, e => last.delete(e.pointerId)));

      // Bấm ▶ để nghe thử một giai điệu quen thuộc (người lớn làm mẫu cho bé)
      let playing = false;
      api.on(btn, 'pointerdown', () => {
        if (playing) return; playing = true;
        // Twinkle, Twinkle, Little Star: Do Do Sol Sol La La Sol | Fa Fa Mi Mi Re Re Do
        const mel = [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0];
        mel.forEach((n, k) => api.timeout(() => hit(n), k * 520));
        api.timeout(() => { playing = false; }, mel.length * 520);
      });
    }
  });
})();
