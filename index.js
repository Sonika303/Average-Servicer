/**
 * index.js — Average Servicer
 * Ultra-lightweight scroll reveals + hero entrance animation.
 * No dependencies. ~70 lines.
 */

(function () {
  'use strict';

  /* ── 1. Hero Entrance (staggered, CSS-driven) ─────────────────── */
  const heroEls = document.querySelectorAll('#hero .reveal');

  heroEls.forEach((el, i) => {
    el.style.transition = `opacity 0.75s ease ${i * 0.15 + 0.2}s,
                           transform 0.75s cubic-bezier(.22,.68,0,1.2) ${i * 0.15 + 0.2}s`;
    // Small rAF delay ensures CSS transition fires after paint
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('revealed')));
  });


  /* ── 2. Scroll Reveal (IntersectionObserver) ──────────────────── */
  const revealEls = document.querySelectorAll('.card, .contact-icon');

  // Stagger cards when they enter viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // Give siblings inside the same parent a stagger offset
      const siblings = Array.from(el.parentElement.children).filter(
        c => c.classList.contains('card') || c.classList.contains('contact-icon')
      );
      const idx = siblings.indexOf(el);

      el.style.transition = `opacity 0.65s ease ${idx * 0.12}s,
                             transform 0.65s cubic-bezier(.22,.68,0,1.2) ${idx * 0.12}s,
                             box-shadow 0.35s cubic-bezier(.22,.68,0,1.2),
                             border-color 0.35s ease,
                             background 0.35s ease`;

      requestAnimationFrame(() => el.classList.add('revealed'));
      observer.unobserve(el);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  revealEls.forEach(el => observer.observe(el));


  /* ── 3. Frosted Nav Opacity on Scroll ────────────────────────── */
  const nav = document.querySelector('nav');

  const updateNav = () => {
    const y = window.scrollY;
    const opacity = Math.min(0.95, 0.72 + y / 400);
    nav.style.background = `rgba(252,252,252,${opacity})`;
  };

  window.addEventListener('scroll', updateNav, { passive: true });


  /* ── 4. Card Tilt on Mouse Move (subtle, GPU-safe) ───────────── */
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);   // -1 → 1
      const dy     = (e.clientY - cy) / (rect.height / 2);   // -1 → 1
      const rotX   = dy * -5;   // max ±5°
      const rotY   = dx *  5;

      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });


  /* ── 5. Smooth anchor scrolling (fallback for older Safari) ───── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

})();
