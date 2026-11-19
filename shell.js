/* Bé chơi nào — khung ứng dụng: menu, vào/ra trò chơi, khu phụ huynh, hẹn giờ */
(function () {
  'use strict';
  const { $, S, Snd, Voice } = BE;
  const menu = $('#menu'), stage = $('#stage'), gameEl = $('#game'), grid = $('#grid'), wrap = $('#gridwrap');
  const panel = $('#panel'), bye = $('#bye');
  let cur = null, curApi = null, playSec = 0;

  /* Mở khóa âm thanh ở cử chỉ đầu tiên (iOS cần touchend/click) */
  ['touchend', 'click', 'pointerup', 'keydown'].forEach(ev => document.addEventListener(ev, () => Snd.unlock(), { capture: true, passive: true }));
  // Chặn zoom/cuộn do cử chỉ của Safari
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => e.preventDefault()));
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

  /* ---------- Bộ công cụ cho từng trò (tự dọn khi thoát) ---------- */
  function makeApi(root) {
    const cl = [];
    const api = {
      root, S,
      L: o => o[S.lang] || o.vi,
      say: (vi, en) => Voice.say(S.lang === 'vi' ? vi : (en == null ? vi : en)),
      on(t, ev, fn, opt) { t.addEventListener(ev, fn, opt); cl.push(() => t.removeEventListener(ev, fn, opt)); },
      timeout(fn, ms) { const h = setTimeout(fn, ms); cl.push(() => clearTimeout(h)); return h; },
      loop(fn) {
        let last = performance.now(), h;
        const f = t => { const dt = Math.min(0.05, (t - last) / 1000); last = t; fn(dt, t); h = requestAnimationFrame(f); };
        h = requestAnimationFrame(f); cl.push(() => cancelAnimationFrame(h));
      },
      cleanup() { cl.forEach(f => f()); cl.length = 0; }
    };
    return api;
  }

  /* ---------- Menu ---------- */
  const ageMax = () => ({ 1: 18, 2: 30, 3: 99 }[S.age] || 99);
  const visible = () => BE.GAMES.filter(g => g.min <= ageMax());

  function renderMenu() {
    grid.innerHTML = '';
    visible().forEach(g => {
      const b = document.createElement('button');
      b.className = 'card'; b.style.setProperty('--c', g.color);
      b.innerHTML = `<span class="ic">${g.icon}</span><span class="lb">${g.name[S.lang] || g.name.vi}</span>`;
      b.addEventListener('click', () => startGame(g));
      grid.appendChild(b);
    });
    layoutMenu();
  }
  function layoutMenu() {
    const n = grid.children.length; if (!n) return;
    const f = BE.fit(n, wrap.clientWidth, wrap.clientHeight, 0.12, 230);
    grid.style.setProperty('--s', f.s + 'px');
    grid.style.width = (f.cols * f.s + (f.cols - 1) * f.gap + 1) + 'px';
    grid.style.gap = f.gap + 'px';
  }
  addEventListener('resize', () => { layoutMenu(); });

  /* ---------- Vào / ra trò chơi ---------- */
  function startGame(g) {
    Snd.unlock(); Snd.click();
    exitGame(true);
    cur = g;
    menu.classList.add('hidden'); stage.classList.remove('hidden');
    gameEl.className = 'g-' + g.id;
    gameEl.style.background = g.bg;
    gameEl.innerHTML = '';
    curApi = makeApi(gameEl);
    try { g.start(curApi); } catch (e) { console.error(e); }
  }
  function exitGame(silent) {
    if (curApi) { curApi.cleanup(); curApi = null; }
    cur = null; gameEl.innerHTML = '';
    Voice.stop();
    if (!silent) { stage.classList.add('hidden'); menu.classList.remove('hidden'); layoutMenu(); }
  }
  $('#home').addEventListener('click', () => { Snd.whoosh(); exitGame(false); });

  /* ---------- Giữ lâu để vào khu phụ huynh (trẻ nhỏ không làm được) ---------- */
  function gate(btn, ms, cb) {
    let t = null;
    btn.style.setProperty('--ms', ms + 'ms');
    btn.addEventListener('pointerdown', e => { e.preventDefault(); btn.classList.add('holding'); t = setTimeout(() => { btn.classList.remove('holding'); t = null; cb(); }, ms); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => btn.addEventListener(ev, () => { clearTimeout(t); t = null; btn.classList.remove('holding'); }));
  }
  gate($('#gear'), 2000, openPanel);
  gate($('#byeResume'), 2000, () => { playSec = 0; bye.classList.add('hidden'); });

  /* ---------- Khu phụ huynh ---------- */
  function syncPanel() {
    $('#vol').value = Math.round(S.volume * 100);
    panel.querySelectorAll('.seg').forEach(seg => {
      const key = seg.dataset.key;
      seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(S[key]) === b.dataset.v));
    });
    const vi = Voice.has('vi');
    $('#voiceInfo').textContent = !Voice.supported ? 'Trình duyệt này không hỗ trợ đọc giọng nói. Trò chơi vẫn có âm thanh và hình ảnh.'
      : vi ? 'Máy đã có giọng đọc tiếng Việt.'
        : 'Máy chưa có giọng tiếng Việt, nên lời đọc có thể bị bỏ qua hoặc đọc bằng giọng khác. Trên iPhone/iPad: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Việt. Trên Android: Cài đặt → Ngôn ngữ → Chuyển văn bản thành giọng nói.';
  }
  function openPanel() { syncPanel(); panel.classList.remove('hidden'); }
  $('#panelClose').addEventListener('click', () => { panel.classList.add('hidden'); renderMenu(); });
  $('#vol').addEventListener('input', e => { S.volume = e.target.value / 100; Snd.vol(S.volume); BE.save(); });
  $('#vol').addEventListener('change', () => { Snd.unlock(); Snd.ding(784); });
  panel.querySelectorAll('.seg').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const v = b.dataset.v, key = seg.dataset.key;
    S[key] = v === 'true' ? true : v === 'false' ? false : (isNaN(+v) ? v : +v);
    BE.save(); syncPanel();
  }));
  $('#testVoice').addEventListener('click', () => { Snd.unlock(); Voice.say(S.lang === 'vi' ? 'Xin chào bé! Mình cùng chơi nhé!' : 'Hello! Let us play together!'); });
  $('#fsBtn').addEventListener('click', () => {
    const d = document.documentElement;
    try { if (document.fullscreenElement) document.exitFullscreen(); else (d.requestFullscreen || d.webkitRequestFullscreen || function () { }).call(d); } catch (e) { }
  });
  $('#resetTimer').addEventListener('click', () => { playSec = 0; });

  /* ---------- Hẹn giờ: chỉ tính lúc bé đang chơi ---------- */
  setInterval(() => {
    if (stage.classList.contains('hidden') || document.hidden) return;
    playSec++;
    if (S.timer > 0 && playSec >= S.timer * 60) showBye();
  }, 1000);
  function showBye() {
    exitGame(false);
    bye.classList.remove('hidden');
    Snd.lullaby();
    setTimeout(() => Voice.say(S.lang === 'vi' ? 'Hết giờ chơi rồi. Hẹn gặp lại bé nhé!' : 'All done playing. See you soon!'), 400);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) Voice.stop(); });

  /* ---------- Khởi động ---------- */
  function boot() {
    BE.GAMES.sort((a, b) => a.min - b.min);
    renderMenu();
    if (location.protocol.startsWith('http') && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  boot();
})();
