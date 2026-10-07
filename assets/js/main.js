/* ==========================================================
   FLY WASH | فلاي واش
   No dependencies. Arabic ships in the markup; EN is the toggle.
   ========================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var isAr = function () { return document.documentElement.getAttribute('lang') === 'ar'; };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var AR = '٠١٢٣٤٥٦٧٨٩';
  function arNum(s) { return String(s).replace(/\d/g, function (d) { return AR[+d]; }).replace(/,/g, '٬').replace(/\./g, '٫'); }
  function fmt(n, dec) {
    var s = dec ? n.toFixed(dec) : Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return isAr() ? arNum(s) : s;
  }

  /* ---------- opening hours, in Jeddah time ---------- */
  // minutes from midnight; a close past 1440 runs into the next day.
  // 0 = Sunday … 6 = Saturday. Friday is closed.
  var SCHED = { 0: [[900, 1440]], 1: [[900, 1440]], 2: [[900, 1440]], 3: [[900, 1440]], 4: [[900, 1440]], 5: [], 6: [[900, 1440]] };
  var DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function jeddahNow() {
    // the visitor may be anywhere; the shop is on Riyadh time
    var p = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    var dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
    return { dow: dow, min: (+o.hour) * 60 + (+o.minute) };
  }
  function tLabel(m) {
    m = ((m % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60, h12 = h % 12 || 12;
    var t = h12 + (mm ? ':' + (mm < 10 ? '0' : '') + mm : '');
    return isAr() ? arNum(t) + (h < 12 ? ' ص' : ' م') : t + (h < 12 ? 'am' : 'pm');
  }
  function openState() {
    var n = jeddahNow(), i, r;
    var today = SCHED[n.dow] || [], prev = SCHED[(n.dow + 6) % 7] || [];
    for (i = 0; i < today.length; i++) { r = today[i]; if (n.min >= r[0] && n.min < r[1]) return { open: true, closes: r[1] }; }
    for (i = 0; i < prev.length; i++) { r = prev[i]; if (r[1] > 1440 && n.min < r[1] - 1440) return { open: true, closes: r[1] }; }
    for (var k = 0; k < 8; k++) {
      var d = (n.dow + k) % 7, list = SCHED[d] || [];
      for (i = 0; i < list.length; i++) {
        if (k > 0 || list[i][0] > n.min) return { open: false, day: k === 0 ? null : (k === 1 ? 'tmr' : d), opens: list[i][0] };
      }
    }
    return { open: false };
  }
  function paintOpen() {
    var el = $('#openNow'); if (!el) return;
    var s = openState(), ar = isAr(), txt;
    if (s.open) txt = ar ? 'نستقبل الحجوزات الحين · لين ' + tLabel(s.closes) : 'Taking bookings now · until ' + tLabel(s.closes);
    else {
      var when = s.day === null ? (ar ? 'اليوم' : 'today') : s.day === 'tmr' ? (ar ? 'بكرة' : 'tomorrow') : (ar ? DAYS_AR[s.day] : DAYS_EN[s.day]);
      txt = ar ? 'مغلق الحين · نرجع ' + when + ' ' + tLabel(s.opens) : 'Closed now · back ' + when + ' at ' + tLabel(s.opens);
    }
    el.innerHTML = '<i></i>' + txt;
    el.classList.toggle('closed', !s.open);
    var row = $('#tbl tr[data-d="' + jeddahNow().dow + '"]');
    $$('#tbl tr').forEach(function (r) { r.classList.remove('today'); });
    if (row && !row.classList.contains('off')) row.classList.add('today');
  }

  /* ---------- language ---------- */
  var KEY = 'fw-lang', lngTx = $('#lngTx');
  function apply(lang) {
    var h = document.documentElement;
    h.setAttribute('lang', lang); h.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    $$('[data-en]').forEach(function (el) {
      var v = el.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en');
      if (v != null) el.innerHTML = v;
    });
    if (lngTx) lngTx.textContent = lang === 'ar' ? 'EN' : 'ع';
    document.title = lang === 'ar' ? 'فلاي واش | Fly Wash — مغسلة سيارات متنقلة في جدة' : 'Fly Wash | فلاي واش — Mobile car wash in Jeddah';
    splitWords($('#heroH'));
    paintOpen();
    $$('.num.done').forEach(function (n) { n.textContent = fmt(+n.getAttribute('data-to'), +(n.getAttribute('data-dec') || 0)); });
    route();
  }
  $('#lngBtn').addEventListener('click', function () {
    var next = isAr() ? 'en' : 'ar'; apply(next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
  });

  /* Words, never characters. Arabic is cursive — a span per letter breaks
     the joining and the word renders as loose, disconnected glyphs. */
  function splitWords(el) {
    if (!el) return;
    var txt = (el.textContent || '').trim(); if (!txt) return;
    el.textContent = '';
    txt.split(/\s+/).forEach(function (w, i) {
      var m = document.createElement('span'); m.className = 'wm';
      var x = document.createElement('i'); x.textContent = w; x.style.setProperty('--i', i);
      m.appendChild(x); el.appendChild(m); el.appendChild(document.createTextNode(' '));
    });
  }

  /* ---------- nav ---------- */
  var nav = $('#nav'), brg = $('#brg'), menu = $('#menu');
  function closeMenu() { menu.classList.remove('open'); brg.classList.remove('on'); brg.setAttribute('aria-expanded', 'false'); document.body.classList.remove('lock'); }
  brg.addEventListener('click', function () {
    nav.classList.remove('slid');
    var o = menu.classList.toggle('open');
    brg.classList.toggle('on', o); brg.setAttribute('aria-expanded', o ? 'true' : 'false');
    document.body.classList.toggle('lock', o);
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- the route ---------- */
  var path = $('#route'), van = $('#van'), eta = $('#eta'), hero = $('.hero');
  var L = path ? path.getTotalLength() : 0, intro = 0, arrived = null;
  if (path) { path.style.strokeDasharray = L; path.style.strokeDashoffset = L; }

  function route() {
    if (!path) return;
    var h = hero.offsetHeight || 1;
    var sp = Math.max(0, Math.min(1, window.scrollY / (h * .62)));
    var p = Math.min(1, intro * .34 + sp * .66);
    path.style.strokeDashoffset = (L * (1 - p)).toFixed(1);
    var a = path.getPointAtLength(L * p), b = path.getPointAtLength(Math.min(L, L * p + 2));
    var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    // keep the van the right way up whichever way the road turns
    var flip = Math.abs(ang) > 90 ? ' scale(1,-1)' : '';
    van.setAttribute('transform', 'translate(' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')' + flip);
    var done = p > .985;
    if (done !== arrived) {
      arrived = done;
      eta.classList.toggle('done', done);
      eta.setAttribute('data-en', done ? 'Arrived' : 'On the way');
      eta.setAttribute('data-ar', done ? 'وصلنا' : 'في الطريق إليك');
    }
    eta.textContent = eta.getAttribute(isAr() ? 'data-ar' : 'data-en');
  }
  // the intro drive is time-based, not frame-based, so a backgrounded tab
  // can't leave the van parked halfway
  (function () {
    var t0 = Date.now(), dur = reduce ? 1 : 1600;
    var iv = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / dur);
      intro = 1 - Math.pow(1 - k, 3); route();
      if (k >= 1) clearInterval(iv);
    }, 16);
  })();

  /* ---------- counters ---------- */
  function count(el) {
    if (el.classList.contains('done')) return;
    el.classList.add('done');
    var to = +el.getAttribute('data-to'), dec = +(el.getAttribute('data-dec') || 0), t0 = Date.now(), dur = reduce ? 1 : 1500;
    var iv = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / dur);
      el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)), dec);
      if (k >= 1) clearInterval(iv);
    }, 30);
  }

  /* ---------- scroll ---------- */
  var reveals = $$('.rv'), steps = $('#steps'), stepEls = $$('.step'), fill = $('#progFill'), dock = $('#dock');
  var lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY, vh = window.innerHeight, max = document.documentElement.scrollHeight - vh;
    if (fill) fill.style.width = (max > 0 ? y / max * 100 : 0) + '%';
    nav.classList.toggle('stuck', y > 30);
    if (!menu.classList.contains('open')) {
      if (y > 500 && y > lastY + 4) nav.classList.add('slid');
      else if (y < lastY - 4 || y < 500) nav.classList.remove('slid');
    }
    lastY = y;
    if (dock) dock.classList.toggle('on', y > vh * .7);
    route();

    if (steps) {
      var r = steps.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh * .6 - r.top) / r.height));
      steps.style.setProperty('--p', p.toFixed(3));
      stepEls.forEach(function (s) { s.classList.toggle('lit', s.getBoundingClientRect().top < vh * .6); });
    }
    $$('.num:not(.done)').forEach(function (n) { if (n.getBoundingClientRect().top < vh * .95) count(n); });
    // one-way: once revealed it stays revealed, so an anchor jump can never
    // strand a section at opacity 0
    for (var i = reveals.length - 1; i >= 0; i--) {
      if (reveals[i].getBoundingClientRect().top < vh * .9) { reveals[i].classList.add('in'); reveals.splice(i, 1); }
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);

  var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'en') apply('en'); else { splitWords($('#heroH')); paintOpen(); }
  setInterval(paintOpen, 60000);
  onScroll(); setTimeout(onScroll, 250);
})();
