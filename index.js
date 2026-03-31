/* ═══════════════════════════════════════════
   index.js — Average Servicer
   Hero fade · Scroll reveal · Nav · Tilt
   Zero dependencies. ~60 lines.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. Hero entrance (staggered fade-in) ────────────────── */
  var heroItems = document.querySelectorAll('#hero .fi');

  heroItems.forEach(function (el, i) {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition =
      'opacity .7s ease '    + (i * .13 + .12) + 's,' +
      'transform .7s cubic-bezier(.22,.68,0,1.18) ' + (i * .13 + .12) + 's';
  });

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      heroItems.forEach(function (el) {
        el.style.opacity   = '1';
        el.style.transform = 'none';
      });
    });
  });


  /* ── 2. Scroll reveal ────────────────────────────────────── */
  var revealTargets = document.querySelectorAll('.card, .pill');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el       = entry.target;
      var parent   = el.parentElement;
      var siblings = Array.from(parent.children).filter(function (c) {
        return c.classList.contains('card') || c.classList.contains('pill');
      });
      var idx = siblings.indexOf(el);

      el.style.transitionDelay = (idx * .09) + 's';
      el.classList.add('visible');
      io.unobserve(el);
    });
  }, { threshold: .1, rootMargin: '0px 0px -28px 0px' });

  revealTargets.forEach(function (el) { io.observe(el); });


  /* ── 3. Nav background on scroll ────────────────────────── */
  var nav = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    var alpha = Math.min(.96, .75 + window.scrollY / 320);
    nav.style.background = 'rgba(252,252,252,' + alpha + ')';
  }, { passive: true });


  /* ── 4. Card tilt on hover ───────────────────────────────── */
  document.querySelectorAll('.card:not(.soon-card)').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r  = card.getBoundingClientRect();
      var dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
      var dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
      card.style.transform =
        'translateY(-5px) perspective(700px) ' +
        'rotateX(' + (dy * -4) + 'deg) ' +
        'rotateY(' + (dx *  4) + 'deg)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ── 5. Block right-click context menu ──────────────────── */
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

}());
