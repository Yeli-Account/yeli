(function () {
  'use strict';

  /* ===== 强制电脑版视图：窄屏设备一律按 1280px 桌面布局渲染 ===== */
  function forceDesktopView() {
    var vp = document.querySelector('meta[name="viewport"]');
    if (!vp) {
      vp = document.createElement('meta');
      vp.name = 'viewport';
      document.head.appendChild(vp);
    }
    function assert() {
      if (document.documentElement.clientWidth < 1280) {
        vp.setAttribute('content', 'width=1280');
      }
    }
    assert();
    window.addEventListener('resize', assert, { passive: true });
  }
  forceDesktopView();

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
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();

        for (var j = i + 1; j < parts.length; j++) {
          var q = parts[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            var a = 0.13 * (1 - Math.sqrt(d2) / LINK_DIST);
            ctx.strokeStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
            ctx.lineWidth = 0.6;
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
})();
