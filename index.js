/* ═══════════════════════════════════════════
   index.js — Average Servicer
   Scroll reveals · Nav · Card tilt
   No typewriter. No heavy libs. ~55 lines.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* 1 · Hero fade-in on load
  ─────────────────────────────────────────── */
  const heroItems = document.querySelectorAll('#hero .fi');

  heroItems.forEach(function (el, i) {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition =
      'opacity .7s ease ' + (i * .14 + .15) + 's, ' +
      'transform .7s cubic-bezier(.22,.68,0,1.18) ' + (i * .14 + .15) + 's';
  });

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      heroItems.forEach(function (el) {
        el.style.opacity   = '1';
        el.style.transform = 'none';
      });
    });
  });


  /* 2 · Scroll reveal (IntersectionObserver)
  ─────────────────────────────────────────── */
  var targets = document.querySelectorAll('.card, .pill');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el  = entry.target;
      var siblings = Array.from(el.parentElement.children).filter(function (c) {
        return c.classList.contains('card') || c.classList.contains('pill');
      });
      var idx = siblings.indexOf(el);
      el.style.transitionDelay = (idx * .1) + 's';
      el.classList.add('visible');
      io.unobserve(el);
    });
  }, { threshold: .1, rootMargin: '0px 0px -30px 0px' });

  targets.forEach(function (el) { io.observe(el); });


  /* 3 · Nav opacity on scroll
  ─────────────────────────────────────────── */
  var nav = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    var alpha = Math.min(.96, .75 + window.scrollY / 350);
    nav.style.background = 'rgba(252,252,252,' + alpha + ')';
  }, { passive: true });


  /* 4 · Card subtle tilt on hover
  ─────────────────────────────────────────── */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r  = card.getBoundingClientRect();
      var dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
      var dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
      card.style.transform =
        'translateY(-5px) perspective(700px) rotateX(' + (dy * -4) + 'deg) rotateY(' + (dx * 4) + 'deg)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

}());
