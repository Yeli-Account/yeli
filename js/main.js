(function () {
  'use strict';

  /* ===== 触摸设备检测：覆盖 hover 粘滞导致的「点不动」 ===== */
  function initTouchMode() {
    var root = document.documentElement;
    var touch = ('ontouchstart' in window) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      (window.PointerEvent && window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    if (touch) root.setAttribute('data-touch', '');
  }
  initTouchMode();

  /* ===== 双主题（浅色 / 深色，新粗野主义） ===== */
  function initTheme() {
    var root = document.documentElement;
    var btn = document.getElementById('themeToggle');
    var meta = document.querySelector('meta[name="theme-color"]');
    var stored = null;
    try { stored = localStorage.getItem('xs-theme'); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    function apply(t) {
      root.setAttribute('data-theme', t);
      if (btn) btn.classList.toggle('dark', t === 'dark');
      if (meta) meta.setAttribute('content', t === 'dark' ? '#151513' : '#F2EFE8');
      try { localStorage.setItem('xs-theme', t); } catch (e) {}
    }
    apply(theme);
    if (btn) {
      btn.addEventListener('click', function () {
        theme = theme === 'dark' ? 'light' : 'dark';
        apply(theme);
      });
    }
  }
  initTheme();

  /* ===== 配色主题（默认绿 / 黄 / 蓝 / 紫） ===== */
  function initPalette() {
    var root = document.documentElement;
    var btn = document.getElementById('paletteToggle');
    var pop = document.getElementById('palettePop');
    var stored = null;
    try { stored = localStorage.getItem('xs-accent'); } catch (e) {}
    var accent = stored || 'green';
    root.setAttribute('data-accent', accent);

    function mark() {
      var list = pop ? pop.querySelectorAll('.swatch') : [];
      for (var i = 0; i < list.length; i++) {
        list[i].classList.toggle('active', list[i].getAttribute('data-accent') === accent);
      }
    }
    mark();

    if (btn && pop) {
      btn.addEventListener('click', function () {
        var open = pop.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', function (e) {
        if (!pop.contains(e.target) && !btn.contains(e.target)) {
          pop.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
      var swatches = pop.querySelectorAll('.swatch');
      for (var i = 0; i < swatches.length; i++) {
        swatches[i].addEventListener('click', function () {
          accent = this.getAttribute('data-accent');
          root.setAttribute('data-accent', accent);
          try { localStorage.setItem('xs-accent', accent); } catch (e) {}
          mark();
          pop.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        });
      }
    }
  }
  initPalette();

  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  var progress = document.getElementById('scrollProgress');
  var backToTop = document.getElementById('backToTop');
  var cursorGlow = document.getElementById('cursorGlow');
  var bttRing = document.getElementById('bttRing');

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (backToTop) backToTop.classList.toggle('show', y > 480);

    if (progress || bttRing) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? y / max : 0;
      if (progress) progress.style.width = (ratio * 100).toFixed(2) + '%';
      if (bttRing) {
        var CIRC = 2 * Math.PI * 21;
        bttRing.style.strokeDasharray = CIRC;
        bttRing.style.strokeDashoffset = (CIRC * (1 - ratio)).toFixed(2);
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function toggleMenu(force) {
    var open = typeof force === 'boolean' ? force : !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () { toggleMenu(); });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') toggleMenu(false);
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function markVisible(el) {
    if (!el.classList.contains('visible')) el.classList.add('visible');
  }

  function checkInView() {
    var vh = window.innerHeight;
    revealEls.forEach(function (el) {
      if (el.classList.contains('visible')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh - 40 && r.bottom > 0) markVisible(el);
    });
  }

  if ('IntersectionObserver' in window) {
    var lastParent = null;
    var idx = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          markVisible(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealEls.forEach(function (el) {
      var parent = el.closest('.container') || el.parentElement;
      if (parent !== lastParent) { idx = 0; lastParent = parent; }
      el.style.transitionDelay = (idx * 90) + 'ms';
      idx++;
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.style.transitionDelay = '0ms';
      markVisible(el);
    });
  }

  window.addEventListener('scroll', checkInView, { passive: true });
  window.addEventListener('resize', checkInView, { passive: true });
  window.addEventListener('load', checkInView);
  setTimeout(checkInView, 1200);

  if (cursorGlow) {
    var gx = window.innerWidth / 2;
    var gy = window.innerHeight / 3;
    var cx = gx;
    var cy = gy;
    var shown = false;

    function moveGlow(e) {
      gx = e.clientX;
      gy = e.clientY;
      if (!shown) {
        shown = true;
        cursorGlow.classList.add('visible');
      }
    }

    window.addEventListener('pointermove', moveGlow, { passive: true });
    window.addEventListener('pointerdown', moveGlow, { passive: true });

    (function loop() {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      cursorGlow.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* ===== 预加载动画 ===== */
  function initPreloader() {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    function hide() { pre.classList.add('hide'); }
    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide);
    setTimeout(hide, 2600);
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) hide();
  }
  initPreloader();

  /* ===== 粒子光效背景（白色星尘 + 微光连线） ===== */
  function initParticles() {
    var canvas = document.getElementById('particles');
    if (!canvas) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, parts = [];
    var COUNT = 72;
    var LINK_DIST = 140;

    function inkRgb() {
      var v = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#141414';
      var n = parseInt(v.replace('#', ''), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function spawn() {
      parts = [];
      for (var i = 0; i < COUNT; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          r: Math.random() * 1.6 + 0.7
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      var rgb = inkRgb();
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        else if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.4)';
        ctx.fill();

        for (var j = i + 1; j < parts.length; j++) {
          var q = parts[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            var a = 0.12 * (1 - Math.sqrt(d2) / LINK_DIST);
            ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }

    resize();
    spawn();
    tick();
    window.addEventListener('resize', function () { resize(); spawn(); }, { passive: true });
  }
  initParticles();

  /* ===== 卡片 3D 悬浮倾斜 ===== */
  function initTilt() {
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-tilt]'));
    var MAX = 7;
    cards.forEach(function (card) {
      card.addEventListener('pointerenter', function () { card.classList.add('tilting'); });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(900px) rotateY(' + (px * MAX).toFixed(2) + 'deg) rotateX(' +
          (-py * MAX).toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('tilting');
        card.style.transform = '';
      });
    });
  }
  initTilt();

  /* ===== 磁吸按钮 ===== */
  function initMagnetic() {
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var btns = Array.prototype.slice.call(document.querySelectorAll('.hero-actions .btn, .join-actions .btn'));
    btns.forEach(function (btn) {
      var strength = 0.22;
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * strength;
        var dy = (e.clientY - r.top - r.height / 2) * strength;
        btn.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });
  }
  initMagnetic();

  /* ===== Hero 背景鼠标视差 ===== */
  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    var bg = document.querySelector('.hero-bg');
    if (!hero || !bg) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    hero.addEventListener('pointermove', function (e) {
      var nx = e.clientX / window.innerWidth - 0.5;
      var ny = e.clientY / window.innerHeight - 0.5;
      bg.style.transform = 'scale(1.09) translate(' + (nx * -20).toFixed(1) + 'px,' + (ny * -14).toFixed(1) + 'px)';
    });
    hero.addEventListener('pointerleave', function () {
      bg.style.transform = '';
    });
  }
  initHeroParallax();

  /* ===== 点击涟漪 ===== */
  function initClickRing() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    function spawn(e) {
      var ring = document.createElement('span');
      ring.className = 'click-ring';
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
      document.body.appendChild(ring);
      setTimeout(function () { ring.remove(); }, 700);
    }
    window.addEventListener('pointerdown', spawn, { passive: true });
  }
  initClickRing();
})();
