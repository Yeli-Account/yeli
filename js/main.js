(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  var progress = document.getElementById('scrollProgress');
  var backToTop = document.getElementById('backToTop');
  var cursorGlow = document.getElementById('cursorGlow');

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

  var joinEl = document.querySelector('.join');
  if (joinEl) {
    var pressTimer = null;
    function pressStart() {
      joinEl.classList.add('pressed');
      clearTimeout(pressTimer);
      pressTimer = setTimeout(function () {
        joinEl.classList.remove('pressed');
      }, 350);
    }
    function pressEnd() {
      clearTimeout(pressTimer);
      pressTimer = setTimeout(function () {
        joinEl.classList.remove('pressed');
      }, 150);
    }
    joinEl.addEventListener('pointerdown', pressStart);
    joinEl.addEventListener('mousedown', pressStart);
    joinEl.addEventListener('touchstart', pressStart, { passive: true });
    joinEl.addEventListener('pointerup', pressEnd);
    joinEl.addEventListener('pointercancel', pressEnd);
    joinEl.addEventListener('mouseleave', pressEnd);
    joinEl.addEventListener('touchend', pressEnd, { passive: true });
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
})();
