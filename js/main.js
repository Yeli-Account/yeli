(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  var progress = document.getElementById('scrollProgress');
  var backToTop = document.getElementById('backToTop');
  var cursorGlow = document.getElementById('cursorGlow');

  /* ----- 导航栏滚动状态 ----- */
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (backToTop) backToTop.classList.toggle('show', y > 480);

    if (progress) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? y / max : 0;
      progress.style.width = (ratio * 100).toFixed(2) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- 移动端菜单 ----- */
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

  /* ----- 返回顶部 ----- */
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----- 滚动入场 + 交错动画（含移动端兜底） ----- */
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

  // 兜底：部分移动端 WebView 的 IntersectionObserver 不触发时，
  // 通过滚动/加载/定时检测强制显示，避免内容停留在透明状态
  window.addEventListener('scroll', checkInView, { passive: true });
  window.addEventListener('resize', checkInView, { passive: true });
  window.addEventListener('load', checkInView);
  setTimeout(checkInView, 1200);

  /* ----- 鼠标跟随光效（仅精细指针设备） ----- */
  if (cursorGlow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var gx = window.innerWidth / 2;
    var gy = window.innerHeight / 3;
    var cx = gx;
    var cy = gy;
    var shown = false;

    window.addEventListener('mousemove', function (e) {
      gx = e.clientX;
      gy = e.clientY;
      if (!shown) {
        shown = true;
        cursorGlow.classList.add('visible');
      }
    }, { passive: true });

    (function loop() {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      cursorGlow.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
  }
})();
