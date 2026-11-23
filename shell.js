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

  // A tap counts when the finger is lifted on the button, even if it wiggled a little (toddler fingers slide).
  function onTap(el, fn) {
    let down = false;
    el.addEventListener('pointerdown', () => { down = true; });
    el.addEventListener('pointerup', e => { if (down) { down = false; fn(e); } });
    ['pointercancel', 'pointerleave'].forEach(ev => el.addEventListener(ev, () => { down = false; }));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } });
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
      onTap(b, () => startGame(g));
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
  onTap($('#home'), () => { Snd.whoosh(); exitGame(false); });

  /* ---------- Giữ lâu để vào khu phụ huynh (trẻ nhỏ không làm được) ---------- */
  function gate(btn, ms, cb) {
    let t = null;
    btn.style.setProperty('--ms', ms + 'ms');
    btn.addEventListener('pointerdown', e => { e.preventDefault(); btn.classList.add('holding'); t = setTimeout(() => { btn.classList.remove('holding'); t = null; cb(); }, ms); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => btn.addEventListener(ev, () => { clearTimeout(t); t = null; btn.classList.remove('holding'); }));
  }
  /* ---------- Grown-ups check: after the 2-second hold, type a number that is written in words ---------- */
  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const words = n => n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  let adultOk = null, adultTarget = 0, adultTyped = '';
  function adultFresh() {
    adultTarget = 21 + Math.floor(Math.random() * 78); adultTyped = '';
    $('#adultWord').textContent = words(adultTarget); showTyped();
  }
  function showTyped() { $('#adultDisp').textContent = (adultTyped + '– –'.replace(/ /g, '').slice(0, 2 - adultTyped.length)).split('').join(' '); }
  function askAdult(ok) { adultOk = ok; adultFresh(); $('#adult').classList.remove('hidden'); }
  $('#adult').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const k = b.dataset.k, disp = $('#adultDisp');
    if (k === 'x') { $('#adult').classList.add('hidden'); adultOk = null; return; }
    if (k === 'b') { adultTyped = adultTyped.slice(0, -1); showTyped(); return; }
    if (adultTyped.length >= 2) return;
    adultTyped += k; showTyped();
    if (adultTyped.length === 2) {
      if (+adultTyped === adultTarget) { $('#adult').classList.add('hidden'); const f = adultOk; adultOk = null; f && f(); }
      else { disp.classList.remove('bad'); void disp.offsetWidth; disp.classList.add('bad'); setTimeout(() => { disp.classList.remove('bad'); adultFresh(); }, 450); }
    }
  });
  gate($('#gear'), 2000, () => askAdult(openPanel));
  gate($('#byeResume'), 2000, () => askAdult(() => { playSec = 0; bye.classList.add('hidden'); }));

  /* ---------- Khu phụ huynh ---------- */
  function syncPanel() {
    $('#vol').value = Math.round(S.volume * 100);
    panel.querySelectorAll('.seg').forEach(seg => {
      const key = seg.dataset.key;
      seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(S[key]) === b.dataset.v));
    });
    const en = Voice.has('en');
    $('#voiceInfo').textContent = !Voice.supported ? 'This browser can\'t read text aloud. The games still have sound and animation.'
      : en ? 'An English voice is available on this device.'
        : 'No English voice was found on this device, so spoken words may be skipped. On iPhone/iPad: Settings → Accessibility → Spoken Content → Voices → English. On Android: Settings → Language → Text-to-speech output.';
  }
  const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function fillCredits() {
    const nm = m => m.label || (m.key.charAt(0).toUpperCase() + m.key.slice(1));
    const list = Snd.credits().slice().sort((a, b) => nm(a).localeCompare(nm(b)));
    $('#creditList').innerHTML = list.length
      ? '<ul class="why">' + list.map(m => `<li><b>${esc(nm(m))}</b>: ${isNative() ? esc(m.title) : `<a href="${esc(m.source)}" target="_blank" rel="noopener">${esc(m.title)}</a>`} by ${esc(m.author)}, ${esc(m.license)}</li>`).join('') + '</ul>'
        + '<p class="note">Animal and vehicle recordings come from Wikimedia Commons and OpenGameArt. They were trimmed, volume-levelled and compressed for this site, and keep their original licenses (CC0 and public domain need no credit; CC BY and CC BY-SA are credited above). The tiger and the instruments use computer-made sounds.</p>'
      : 'Animal sounds on this device are computer-made.';
  }
  function openPanel() { syncPanel(); fillCredits(); panel.classList.remove('hidden'); }
  $('#panelClose').addEventListener('click', () => { panel.classList.add('hidden'); renderMenu(); });
  $('#vol').addEventListener('input', e => { S.volume = e.target.value / 100; Snd.vol(S.volume); BE.save(); });
  $('#vol').addEventListener('change', () => { Snd.unlock(); Snd.ding(784); });
  panel.querySelectorAll('.seg').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const v = b.dataset.v, key = seg.dataset.key;
    S[key] = v === 'true' ? true : v === 'false' ? false : (isNaN(+v) ? v : +v);
    BE.save(); syncPanel();
  }));
  $('#testVoice').addEventListener('click', () => { Snd.unlock(); Voice.say('Hello! Let us play together!'); });
  $('#fsBtn').addEventListener('click', () => {
    const d = document.documentElement;
    try { if (document.fullscreenElement) document.exitFullscreen(); else (d.requestFullscreen || d.webkitRequestFullscreen || function () { }).call(d); } catch (e) { }
  });
  $('#resetTimer').addEventListener('click', () => { playSec = 0; });

  /* ---------- Screen lock (Android screen pinning, native app only) ---------- */
  // The parent turns it on from the parent area; while it is on, Home, Recents and the notification
  // shade are blocked by Android. A small 🔒 button (hold 3 seconds) turns it off again.
  const nativePlugin = name => (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins[name]) || null;
  const unlockBtn = $('#unlock');
  let locked = false;
  function setLocked(v) { locked = !!v; unlockBtn.classList.toggle('hidden', !locked); }
  async function pollLock() {
    const p = nativePlugin('ScreenLock'); if (!p) return;
    try { const r = await p.state(); setLocked(r && r.locked); } catch (e) { }
  }
  $('#lockBtn').addEventListener('click', async () => {
    const p = nativePlugin('ScreenLock'); if (!p) return;
    panel.classList.add('hidden'); renderMenu();
    try { await p.start(); } catch (e) { }
    setTimeout(pollLock, 600); setTimeout(pollLock, 2500);
  });
  gate(unlockBtn, 3000, async () => {
    const p = nativePlugin('ScreenLock');
    if (p) { try { await p.stop(); } catch (e) { } }
    setLocked(false); setTimeout(pollLock, 400);
  });
  // Back button: blocked while locked, otherwise goes back one step instead of closing the app by accident
  function wireBackButton() {
    const App = nativePlugin('App'); if (!App || !App.addListener) return;
    App.addListener('backButton', () => {
      if (locked) return;
      if (!$('#adult').classList.contains('hidden')) { $('#adult').classList.add('hidden'); adultOk = null; return; }
      if (!panel.classList.contains('hidden')) { $('#panelClose').click(); return; }
      if (!bye.classList.contains('hidden')) return;
      if (cur) { Snd.whoosh(); exitGame(false); return; }
      try { App.minimizeApp(); } catch (e) { }
    });
  }

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
    setTimeout(() => Voice.say('All done playing. See you next time!'), 400);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) Voice.stop(); });

  /* ---------- Khởi động ---------- */
  function boot() {
    BE.GAMES.sort((a, b) => a.min - b.min);
    renderMenu();
    const native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    if (native) {
      const root = document.documentElement;
      root.classList.add('native');
      let platform = ''; try { platform = window.Capacitor.getPlatform(); } catch (e) { }
      root.classList.add(platform === 'ios' ? 'ios' : 'android');
      try { window.Capacitor.Plugins.StatusBar.hide(); } catch (e) { }
      wireBackButton();
      if (platform !== 'ios') { pollLock(); setInterval(pollLock, 1500); } // screen pinning exists on Android only; iPhone uses Guided Access
    } else if (location.protocol.startsWith('http') && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  boot();
})();
