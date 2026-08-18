/* ============================================================
   Motion layer. Progressive enhancement only —
   every element is readable and visible if this file never runs.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  /* ---------- always-on: header state, nav, year ---------- */
  var head = document.querySelector('.site-head');
  var onScroll = function () {
    if (head) head.classList.toggle('is-stuck', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // close mobile nav after tapping a link
  var toggle = document.getElementById('navtoggle');
  document.querySelectorAll('nav.mainnav a').forEach(function (a) {
    a.addEventListener('click', function () { if (toggle) toggle.checked = false; });
  });

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- pointer glow on cards (cheap, CSS vars) ---------- */
  document.querySelectorAll('.cell').forEach(function (cell) {
    cell.addEventListener('pointermove', function (e) {
      var r = cell.getBoundingClientRect();
      cell.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      cell.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  if (reduced || !hasGSAP) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- scroll progress bar ---------- */
  var prog = document.querySelector('.progress');
  if (prog) {
    gsap.to(prog, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.25 }
    });
  }

  /* ---------- hero: masked line reveal ---------- */
  var heroLines = gsap.utils.toArray('.hero .line-mask > span');
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });

  if (heroLines.length) {
    gsap.set(heroLines, { yPercent: 118 });
    intro.to(heroLines, { yPercent: 0, duration: 1.25, stagger: 0.085 }, 0.12);
  }
  intro.to('.hero .reveal', { opacity: 1, y: 0, duration: 0.95, stagger: 0.1 }, 0.45);
  gsap.set('.hero .reveal', { y: 22 });

  /* ---------- generic reveals, batched ---------- */
  var revealables = gsap.utils.toArray('.reveal:not(.hero .reveal)');
  gsap.set(revealables, { y: 34 });
  ScrollTrigger.batch(revealables, {
    start: 'top 88%',
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, {
        opacity: 1, y: 0, duration: 1, ease: 'expo.out',
        stagger: 0.075, overwrite: true
      });
    }
  });

  /* ---------- inner-page masked headings ---------- */
  gsap.utils.toArray('.masthead .line-mask > span').forEach(function (span, i) {
    gsap.fromTo(span, { yPercent: 118 },
      { yPercent: 0, duration: 1.15, ease: 'expo.out', delay: 0.1 + i * 0.08 });
  });

  /* ---------- marquee, velocity-aware ---------- */
  var track = document.querySelector('.marquee-track');
  if (track) {
    var loop = gsap.to(track, {
      xPercent: -50, ease: 'none', duration: 26, repeat: -1
    });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var v = gsap.utils.clamp(-3.5, 3.5, self.getVelocity() / 260);
        if (Math.abs(v) < 0.06) return;
        gsap.to(loop, { timeScale: 1 + Math.abs(v), duration: 0.25, overwrite: true });
        gsap.to(loop, { timeScale: 1, duration: 0.9, delay: 0.3, overwrite: 'auto' });
      }
    });
  }

  /* ---------- counting stats ---------- */
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: function () { el.textContent = Math.round(obj.v); }
    });
  });

  /* ---------- process bars fill on scroll ---------- */
  gsap.utils.toArray('.step .bar-fill i').forEach(function (bar) {
    gsap.to(bar, {
      width: '100%', ease: 'none',
      scrollTrigger: { trigger: bar.closest('.step'), start: 'top 82%', end: 'bottom 55%', scrub: 0.6 }
    });
  });

  /* ---------- hero glow parallax ---------- */
  var glow = document.querySelector('.hero-glow');
  if (glow) {
    gsap.to(glow, {
      yPercent: 26, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
    });
  }

  /* ---------- magnetic buttons + custom cursor (fine pointers only) ---------- */
  var mm = gsap.matchMedia();
  mm.add('(hover: hover) and (pointer: fine) and (min-width: 901px)', function () {
    var cursor = document.querySelector('.cursor');
    if (cursor) {
      var cx = gsap.quickTo(cursor, 'x', { duration: 0.42, ease: 'power3' });
      var cy = gsap.quickTo(cursor, 'y', { duration: 0.42, ease: 'power3' });
      window.addEventListener('pointermove', function (e) {
        cursor.classList.add('is-on'); cx(e.clientX); cy(e.clientY);
      });
      document.querySelectorAll('a,button,summary,input,textarea,select').forEach(function (el) {
        el.addEventListener('pointerenter', function () { gsap.to(cursor, { scale: 1.9, duration: 0.3 }); });
        el.addEventListener('pointerleave', function () { gsap.to(cursor, { scale: 1, duration: 0.3 }); });
      });
    }

    var mags = gsap.utils.toArray('.btn');
    var handlers = [];
    mags.forEach(function (btn) {
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
      var move = function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.32);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.42);
      };
      var out = function () { xTo(0); yTo(0); };
      btn.addEventListener('pointermove', move);
      btn.addEventListener('pointerleave', out);
      handlers.push([btn, move, out]);
    });

    return function () {
      handlers.forEach(function (h) {
        h[0].removeEventListener('pointermove', h[1]);
        h[0].removeEventListener('pointerleave', h[2]);
        gsap.set(h[0], { x: 0, y: 0 });
      });
    };
  });

  ScrollTrigger.refresh();
})();
