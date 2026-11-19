/* Little Play: games for ages 12 months and up (touch, see, hear) */
(function () {
  'use strict';
  const { $, rand, pick, shuffle, Snd, FX, S, DATA } = BE;

  /* ---------- Shared data ---------- */
  // [emoji, Vietnamese name, Vietnamese sound, English name, English sound]
  DATA.ANIMALS = [
    ['🐱', 'con mèo', 'meo meo', 'cat', 'meow meow'],
    ['🐶', 'con chó', 'gâu gâu', 'dog', 'woof woof'],
    ['🦎', 'con tắc kè', 'tắc kè', 'gecko', 'geck-o geck-o'],
    ['🐦', 'con chim', 'chíp chíp', 'bird', 'tweet tweet'],
    ['🦗', 'con dế', 'rí rí', 'cricket', 'chirp chirp'],
    ['🐰', 'con thỏ', 'chít chít', 'bunny', 'squeak squeak'],
    ['🐮', 'con bò', 'ò ò', 'cow', 'moo moo'],
    ['🐷', 'con heo', 'ụt ịt', 'pig', 'oink oink'],
    ['🐑', 'con cừu', 'bê bê', 'sheep', 'baa baa'],
    ['🐐', 'con dê', 'be he', 'goat', 'meh meh'],
    ['🐴', 'con ngựa', 'hí hí', 'horse', 'neigh neigh'],
    ['🐔', 'con gà', 'cục tác', 'chicken', 'cluck cluck'],
    ['🦆', 'con vịt', 'cạp cạp', 'duck', 'quack quack'],
    ['🐸', 'con ếch', 'ộp ộp', 'frog', 'ribbit ribbit'],
    ['🐝', 'con ong', 'vo ve', 'bee', 'buzz buzz'],
    ['🐍', 'con rắn', 'xì xì', 'snake', 'sss sss'],
    ['🦃', 'con gà tây', 'gù gù', 'turkey', 'gobble gobble'],
    ['🐓', 'con gà trống', 'ò ó o o', 'rooster', 'cock-a-doodle-doo'],
    ['🦁', 'con sư tử', 'gào gào', 'lion', 'roar roar'],
    ['🐯', 'con hổ', 'gừ gừ', 'tiger', 'grrr grrr'],
    ['🐘', 'con voi', 'pa pa', 'elephant', 'toot toot'],
    ['🐒', 'con khỉ', 'ú ú', 'monkey', 'ooh ooh ah ah'],
    ['🦜', 'con vẹt', 'chào chào', 'parrot', 'squawk squawk'],
    ['🐻', 'con gấu', 'gừ gừ', 'bear', 'growl growl'],
    ['🐺', 'con sói', 'au u u', 'wolf', 'ow-oooo'],
    ['🦉', 'con cú', 'cú cú', 'owl', 'hoo hoo'],
    ['🦊', 'con cáo', 'ăng ẳng', 'fox', 'yip yip'],
    ['🐧', 'chim cánh cụt', 'quạc quạc', 'penguin', 'honk honk'],
    ['🐬', 'con cá heo', 'ríu rít', 'dolphin', 'eek eek'],
    ['🐋', 'con cá voi', 'ù ù', 'whale', 'wooo wooo']
  ].map(a => ({ e: a[0], n: { vi: a[1], en: a[3] }, s: { vi: a[2], en: a[4] }, animal: true }));

  // [emoji, Vietnamese, English]
  const mk = list => list.map(a => ({ e: a[0], n: { vi: a[1], en: a[2] } }));
  DATA.FOODS = mk([
    ['🍎', 'quả táo', 'apple'], ['🍌', 'quả chuối', 'banana'], ['🍓', 'quả dâu', 'strawberry'],
    ['🍊', 'quả cam', 'orange'], ['🍇', 'chùm nho', 'grapes'], ['🥕', 'củ cà rốt', 'carrot'],
    ['🍞', 'bánh mì', 'bread'], ['🍉', 'miếng dưa hấu', 'watermelon'], ['🍯', 'hũ mật ong', 'honey'],
    ['🧀', 'miếng phô mai', 'cheese'], ['🍪', 'cái bánh quy', 'cookie'], ['🍅', 'quả cà chua', 'tomato'],
    ['🍐', 'quả lê', 'pear'], ['🥦', 'bông cải xanh', 'broccoli'], ['🐟', 'con cá', 'fish'], ['🍖', 'miếng thịt', 'meat']
  ]);
  DATA.FRUIT = mk([
    ['🍎', 'quả táo', 'apple'], ['🍌', 'quả chuối', 'banana'], ['🍊', 'quả cam', 'orange'], ['🍓', 'quả dâu', 'strawberry'],
    ['🍇', 'chùm nho', 'grapes'], ['🍉', 'miếng dưa hấu', 'watermelon'], ['🍐', 'quả lê', 'pear'], ['🍍', 'quả dứa', 'pineapple'],
    ['🍒', 'quả anh đào', 'cherries'], ['🍋', 'quả chanh', 'lemon'], ['🥕', 'củ cà rốt', 'carrot'], ['🍅', 'quả cà chua', 'tomato']
  ]);
  DATA.VEHICLES = mk([
    ['🚗', 'chiếc xe hơi', 'car'], ['🚓', 'xe cảnh sát', 'police car'], ['🚑', 'xe cứu thương', 'ambulance'],
    ['🚒', 'xe cứu hỏa', 'fire truck'], ['🚌', 'xe buýt', 'bus'], ['🚂', 'tàu hỏa', 'train'],
    ['✈️', 'máy bay', 'airplane'], ['🚁', 'trực thăng', 'helicopter'], ['🚲', 'xe đạp', 'bicycle'],
    ['🚜', 'máy cày', 'tractor'], ['🚢', 'con tàu', 'ship'], ['🚀', 'tên lửa', 'rocket']
  ]);
  DATA.TOYS = mk([
    ['🧸', 'gấu bông', 'teddy bear'], ['⚽', 'quả bóng', 'ball'], ['🎈', 'quả bóng bay', 'balloon'],
    ['🎁', 'hộp quà', 'present'], ['🎺', 'cái kèn', 'trumpet'], ['🧩', 'mảnh ghép', 'puzzle piece'], ['🥁', 'cái trống', 'drum']
  ]);
  DATA.ITEMS = DATA.FRUIT.concat(mk([
    ['⚽', 'quả bóng', 'ball'], ['🚗', 'chiếc xe', 'car'], ['🐱', 'con mèo', 'cat'], ['🐶', 'con chó', 'dog'],
    ['🐟', 'con cá', 'fish'], ['🌸', 'bông hoa', 'flower'], ['⭐', 'ngôi sao', 'star'], ['☀️', 'mặt trời', 'sun'],
    ['🌳', 'cái cây', 'tree'], ['🏠', 'ngôi nhà', 'house'], ['👟', 'chiếc giày', 'shoe'], ['🐔', 'con gà', 'chicken'],
    ['🍞', 'bánh mì', 'bread'], ['🚌', 'xe buýt', 'bus'], ['✈️', 'máy bay', 'airplane'], ['🚲', 'xe đạp', 'bicycle'],
    ['🎈', 'quả bóng bay', 'balloon'], ['🧸', 'gấu bông', 'teddy bear'], ['👕', 'cái áo', 'shirt'], ['👒', 'cái mũ', 'hat'],
    ['🌙', 'mặt trăng', 'moon'], ['🌈', 'cầu vồng', 'rainbow'], ['🦋', 'con bướm', 'butterfly'], ['🐢', 'con rùa', 'turtle']
  ]));
  DATA.COLORS = [
    ['#ff5b5b', 'đỏ', 'red'], ['#ffd43b', 'vàng', 'yellow'], ['#4dabf7', 'xanh dương', 'blue'], ['#51cf66', 'xanh lá', 'green'],
    ['#ff9f43', 'cam', 'orange'], ['#b197fc', 'tím', 'purple'], ['#f783ac', 'hồng', 'pink'], ['#8d5524', 'nâu', 'brown'], ['#343a40', 'đen', 'black']
  ].map(a => ({ c: a[0], n: { vi: a[1], en: a[2] } }));
  // Things children can count: [emoji, singular, plural]
  DATA.COUNTABLE = [
    ['🍎', 'apple', 'apples'], ['⭐', 'star', 'stars'], ['⚽', 'ball', 'balls'], ['🐟', 'fish', 'fish'],
    ['🌸', 'flower', 'flowers'], ['🚗', 'car', 'cars'], ['🦆', 'duck', 'ducks'], ['🎈', 'balloon', 'balloons'], ['🍌', 'banana', 'bananas']
  ];
  DATA.NUM = ['zero', 'one', 'two', 'three', 'four'];
  const byEmoji = {}; DATA.ANIMALS.forEach(a => byEmoji[a.e] = a); DATA.byEmoji = byEmoji;

  /* ============ 1. BUBBLES (12 months+) ============ */
  BE.GAMES.push({
    id: 'bubbles', icon: '🎈', color: '#bfe9ff', bg: 'linear-gradient(#d9f2ff,#fdeaff)', min: 12,
    name: { vi: 'Bong bóng', en: 'Bubbles' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="bub-layer"></div>';
      const layer = root.firstChild;
      const COLS = ['#ff9ec4', '#ffd166', '#8fe3a8', '#9ad1ff', '#c3a6ff', '#ffb38a'];
      const REV = ['⭐', '🐠', '🦋', '🐥', '🌈', '💖', '🐞', '🌼'];
      // Some bubbles carry a thing inside: pop it to see it and hear its name
      const POOL = DATA.ITEMS.concat(DATA.VEHICLES, DATA.TOYS, DATA.ANIMALS);
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
        let kind = 'plain', item = null;
        const r = Math.random();
        if (!tapped && r < 0.45) { kind = 'item'; item = pick(POOL); }
        else if (!tapped && r < 0.55) { kind = 'rainbow'; el.classList.add('rainbow'); }
        if (item) { const s = document.createElement('span'); s.className = 'inside'; s.textContent = item.e; s.style.fontSize = (d * 0.5) + 'px'; el.appendChild(s); }
        layer.appendChild(el);
        const b = { el, d, col, kind, item, x: x == null ? rand(d / 2, innerWidth - d / 2) : x, y: y == null ? innerHeight + d / 2 : y,
          vy: rand(28, 55), ph: rand(0, 6.28), sw: rand(8, 26), t: 0, grow: tapped ? 0.05 : 1 };
        el._b = b; bubs.push(b); place(b);
      }
      function reveal(emoji, x, y) {
        const s = document.createElement('div');
        s.className = 'reveal'; s.textContent = emoji;
        s.style.left = x + 'px'; s.style.top = y + 'px';
        root.appendChild(s); setTimeout(() => s.remove(), 1500);
      }
      let nameT = null;
      function pop(b) {
        const i = bubs.indexOf(b); if (i < 0) return;
        bubs.splice(i, 1);
        const x = b.x, y = b.y;
        b.el.remove();
        const idx = Math.max(0, Math.min(7, Math.round(8 - (b.d / base()) * 18)));
        Snd.pop(idx);
        if (b.kind === 'rainbow') {
          FX.burst(x, y, { n: 40, power: 1.3 }); Snd.cheer();
        } else {
          FX.burst(x, y, { colors: [b.col, '#ffffff', '#fff3a0'], n: 14 });
        }
        if (b.item) {
          reveal(b.item.e, x, y);
          clearTimeout(nameT); BE.Voice.stop();
          if (b.item.animal) { const len = Snd.animal(b.item.e); nameT = setTimeout(() => api.say(b.item.n.vi, b.item.n.en), len * 1000 + 100); }
          else api.say(b.item.n.vi, b.item.n.en);
        } else if (b.kind === 'plain' && Math.random() < 0.35) reveal(pick(REV), x, y);
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

  /* ============ 2. PEEKABOO (12 months+): animals, fruit, vehicles, toys ============ */
  BE.GAMES.push({
    id: 'peekaboo', icon: '🙈', color: '#ffd6e0', bg: 'linear-gradient(#ffe9f0,#fff4d6)', min: 12,
    name: { vi: 'Ú òa', en: 'Peekaboo' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="pk"></div><div class="page-title"></div>';
      const pk = root.firstChild, title = root.lastChild;
      const CV = ['#ff8fab', '#74c0fc', '#ffd43b', '#8ce99a', '#b197fc', '#ffa94d'];
      const KINDS = [
        { t: 'Who is hiding?', pool: () => DATA.ANIMALS, snd: x => Snd.animal(x.e) },
        { t: 'What fruit is hiding?', pool: () => DATA.FRUIT, snd: () => { Snd.pop(); return .3; } },
        { t: 'What is hiding?', pool: () => DATA.VEHICLES, snd: x => Snd.vehicle(x.e) },
        { t: 'What toy is hiding?', pool: () => DATA.TOYS, snd: () => { Snd.ding(660); return .6; } }
      ];
      let slots = [], opened = 0, locked = false, order = [], kind = null;

      function layout() {
        const f = BE.fit(6, innerWidth - 24, innerHeight - 110, 0.1, 260);
        pk.style.setProperty('--s', f.s + 'px'); pk.style.setProperty('--g', f.gap + 'px');
      }
      function round() {
        pk.innerHTML = ''; slots = []; opened = 0; locked = false;
        if (!order.length) order = shuffle(KINDS);
        kind = order.pop();
        title.textContent = kind.t;
        shuffle(kind.pool()).slice(0, 6).forEach((a, i) => {
          const s = document.createElement('div'); s.className = 'slot';
          s.innerHTML = `<div class="an">${a.e}</div><div class="cv" style="--c:${CV[i]};animation-delay:${-i * 0.4}s"></div>`;
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
          const k = kind;
          api.timeout(() => k.snd(s._a), 1200);
          if (opened === slots.length && !locked) {
            locked = true;
            api.timeout(() => { Snd.whoosh(); slots.forEach(x => x.classList.remove('open')); api.timeout(round, 550); }, 3600);
          }
        } else {
          an.classList.remove('hop'); void an.offsetWidth; an.classList.add('hop');
          kind.snd(s._a);
          BE.floatText(root, s._a.n[S.lang], e.clientX, e.clientY, 'big');
        }
      });
    }
  });

  /* ============ 3. ANIMAL SOUNDS (12 months+): 30 animals on 5 pages ============ */
  BE.GAMES.push({
    id: 'animals', icon: '🐮', color: '#d8f5c8', bg: 'linear-gradient(#e6fbd6,#d6f0ff)', min: 12,
    name: { vi: 'Con vật kêu', en: 'Animal sounds' },
    start(api) {
      const root = api.root;
      root.innerHTML = '<div class="an-grid"></div><div class="page-title"></div><button class="round-btn bottom-center" aria-label="Next animals">▶&#xFE0E;</button>';
      const gridEl = root.firstChild, title = root.querySelector('.page-title'), next = root.lastChild;
      const BG = ['#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#ffadad'];
      const PAGES = [
        { t: 'Around the house', bg: 'linear-gradient(#ffeedd,#ffe3ec)', list: ['🐱', '🐶', '🦎', '🐦', '🦗', '🐰'] },
        { t: 'On the farm', bg: 'linear-gradient(#e6fbd6,#d6f0ff)', list: ['🐮', '🐷', '🐑', '🐐', '🐴', '🐔'] },
        { t: 'Pond and garden', bg: 'linear-gradient(#d8f3ff,#e4ffe0)', list: ['🦆', '🐸', '🐝', '🐍', '🦃', '🐓'] },
        { t: 'In the jungle', bg: 'linear-gradient(#e0f7c8,#c8ecb8)', list: ['🦁', '🐯', '🐘', '🐒', '🦜', '🐻'] },
        { t: 'Forest, night and sea', bg: 'linear-gradient(#dbe4ff,#c8d6f5)', list: ['🐺', '🦉', '🦊', '🐧', '🐬', '🐋'] }
      ];
      let page = 0;

      function layout() {
        const f = BE.fit(6, innerWidth - 24, innerHeight - 190, 0.1, 240);
        gridEl.style.setProperty('--s', f.s + 'px'); gridEl.style.setProperty('--g', f.gap + 'px');
      }
      function fill() {
        const P = PAGES[page];
        gridEl.innerHTML = '';
        root.style.background = P.bg; title.textContent = P.t;
        P.list.forEach((em, i) => {
          const a = byEmoji[em];
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
        // Play the animal's own sound, then say its name
        BE.Voice.stop(); clearTimeout(nameT);
        const len = Snd.animal(a.e);
        const r = t.getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 10, emoji: ['🎵', '✨'] });
        BE.floatText(root, a.s[S.lang] + '!', r.left + r.width / 2, r.top + r.height * 0.2, 'big');
        nameT = api.timeout(() => api.say(a.n.vi, a.n.en), len * 1000 + 150);
      });
      api.on(next, 'pointerdown', () => { Snd.whoosh(); page = (page + 1) % PAGES.length; fill(); });
    }
  });

  /* ============ 4. MUSIC (12 months+): five instruments ============ */
  BE.GAMES.push({
    id: 'xylo', icon: '🎹', color: '#fff0b3', bg: 'linear-gradient(#fff6cc,#ffe3ec)', min: 12,
    name: { vi: 'Âm nhạc', en: 'Music' },
    start(api) {
      const root = api.root;
      const NOTES = [{ f: 261.63, n: 'Do' }, { f: 293.66, n: 'Re' }, { f: 329.63, n: 'Mi' }, { f: 349.23, n: 'Fa' }, { f: 392.00, n: 'Sol' }, { f: 440.00, n: 'La' }, { f: 493.88, n: 'Ti' }, { f: 523.25, n: 'Do' }];
      const COL = ['#ff6b6b', '#ffa94d', '#ffd43b', '#a9e34b', '#38d9a9', '#4dabf7', '#9775fa', '#f783ac'];
      const DRUMLAB = ['Boom', 'Snare', 'Hat', 'Tom', 'Crash', 'Clap', 'Cowbell', 'Conga'];
      const BAND = ['🐱', '🐶', '🐮', '🦆', '🐷', '🐑', '🐴', '🐓'];
      const TWINKLE = [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0]; // Twinkle, Twinkle, Little Star
      const note = i => NOTES[i].n;
      const INST = [
        { id: 'xylo', icon: '🎶', name: 'Xylophone', melodic: true, play: i => Snd.marimba(NOTES[i].f), lab: note, mel: TWINKLE },
        { id: 'piano', icon: '🎹', name: 'Piano', melodic: true, play: i => Snd.piano(NOTES[i].f), lab: note, mel: TWINKLE },
        { id: 'bells', icon: '🔔', name: 'Bells', melodic: true, play: i => Snd.bells(NOTES[i].f), lab: note, mel: TWINKLE },
        { id: 'drums', icon: '🥁', name: 'Drums', melodic: false, play: i => Snd.drumpad(i), lab: i => DRUMLAB[i], mel: [0, 2, 1, 2, 0, 2, 1, 5], gap: 300 },
        { id: 'band', icon: '🐮', name: 'Animal band', melodic: false, play: i => Snd.animal(BAND[i]), lab: i => BAND[i], mel: [0, 1, 2, 3, 4, 5, 6, 7], gap: 950 }
      ];
      root.innerHTML = '<div class="xy"></div><button class="round-btn xyinst" aria-label="Change instrument"></button><button class="round-btn xybtn" aria-label="Play a song">▶&#xFE0E;</button>';
      const xy = root.firstChild, instBtn = root.querySelector('.xyinst'), playBtn = root.querySelector('.xybtn');
      let cur = 0, bars = [];
      function build() {
        const I = INST[cur];
        xy.innerHTML = ''; xy.dataset.inst = I.id; bars = [];
        for (let i = 0; i < 8; i++) {
          const b = document.createElement('div');
          b.className = 'bar'; b.dataset.i = i; b.textContent = I.lab(i);
          b.style.setProperty('--c', I.id === 'piano' ? '#fffdf8' : COL[i]);
          b.style.setProperty('--k', I.melodic ? 1 - i / 7 : 1);
          xy.appendChild(b); bars.push(b);
        }
        instBtn.textContent = I.icon;
      }
      function hit(i, x, y) {
        INST[cur].play(i);
        const b = bars[i]; b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
        const r = b.getBoundingClientRect();
        x = x == null ? r.left + r.width / 2 : x; y = y == null ? r.top + r.height / 2 : y;
        if (INST[cur].melodic) BE.floatText(root, pick(['♪', '♫', '🎵']), x, y);
        FX.burst(x, y, { n: 6, power: .6, colors: [COL[i], '#fff'] });
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

      api.on(instBtn, 'pointerdown', () => {
        cur = (cur + 1) % INST.length; last.clear(); build(); Snd.click();
        BE.floatText(root, INST[cur].name, innerWidth / 2, innerHeight * 0.22, 'big');
        api.say(INST[cur].name, INST[cur].name);
      });
      // The play button plays a short tune or rhythm as a model for grown-ups
      let playing = false;
      api.on(playBtn, 'pointerdown', () => {
        if (playing) return; playing = true;
        const I = INST[cur], gap = I.gap || 520;
        I.mel.forEach((n, k) => api.timeout(() => { if (INST[cur] === I) hit(n); }, k * gap));
        api.timeout(() => { playing = false; }, I.mel.length * gap);
      });
      build();
    }
  });
})();
