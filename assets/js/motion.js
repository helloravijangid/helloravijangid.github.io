/* ============================================================
   Motion layer. Progressive enhancement only.
   Every element is readable and visible if this never runs.
   Each animation earns its place: hierarchy, storytelling, or feedback.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  /* ---- always on: header state, nav close, year ---- */
  var head = document.querySelector('.site-head');
  function onScroll() { if (head) head.classList.toggle('is-stuck', window.scrollY > 12); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = document.getElementById('navtoggle');
  document.querySelectorAll('nav.mainnav a').forEach(function (a) {
    a.addEventListener('click', function () { if (toggle) toggle.checked = false; });
  });
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- query line: storytelling. Shows what an AI search actually looks like. ---- */
  var qEl = document.querySelector('.query .q');
  if (qEl && !reduced) {
    var questions = JSON.parse(qEl.getAttribute('data-questions') || '[]');
    if (questions.length) {
      var qi = 0, ci = 0, deleting = false;
      (function tick() {
        var full = questions[qi];
        ci += deleting ? -1 : 1;
        qEl.textContent = full.slice(0, ci);
        var wait = deleting ? 26 : 42;
        if (!deleting && ci === full.length) { deleting = true; wait = 2100; }
        else if (deleting && ci === 0) { deleting = false; qi = (qi + 1) % questions.length; wait = 320; }
        setTimeout(tick, wait);
      })();
    }
  } else if (qEl) {
    var qs = JSON.parse(qEl.getAttribute('data-questions') || '[]');
    if (qs.length) qEl.textContent = qs[0];
  }

  if (reduced || !hasGSAP) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---- smooth scroll ---- */
  if (typeof window.Lenis !== 'undefined') {
    var lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---- scroll progress: feedback on position in a long page ---- */
  var prog = document.querySelector('.progress');
  if (prog) {
    gsap.to(prog, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .25 } });
  }

  /* ---- hero entry: hierarchy. Headline lands first, support follows. ---- */
  var heroLines = gsap.utils.toArray('.hero .line-mask > span');
  var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if (heroLines.length) {
    gsap.set(heroLines, { yPercent: 116 });
    tl.to(heroLines, { yPercent: 0, duration: 1.2, stagger: .08 }, .1);
  }
  gsap.set('.hero .reveal', { y: 20 });
  tl.to('.hero .reveal', { opacity: 1, y: 0, duration: .9, stagger: .09 }, .4);

  /* ---- section reveals: hierarchy on enter ---- */
  var rest = gsap.utils.toArray('.reveal').filter(function (el) { return !el.closest('.hero'); });
  gsap.set(rest, { y: 30 });
  ScrollTrigger.batch(rest, {
    start: 'top 88%', once: true,
    onEnter: function (b) {
      gsap.to(b, { opacity: 1, y: 0, duration: .95, ease: 'expo.out', stagger: .07, overwrite: true });
    }
  });

  /* ---- inner-page headings ---- */
  gsap.utils.toArray('.masthead .line-mask > span').forEach(function (s, i) {
    gsap.fromTo(s, { yPercent: 116 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', delay: .08 + i * .07 });
  });

  /* ---- marquee: reacts to scroll velocity, so it reads as responsive not decorative ---- */
  var track = document.querySelector('.marquee-track');
  if (track) {
    var loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 28, repeat: -1 });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var v = gsap.utils.clamp(-3, 3, self.getVelocity() / 300);
        if (Math.abs(v) < .06) return;
        gsap.to(loop, { timeScale: 1 + Math.abs(v), duration: .25, overwrite: true });
        gsap.to(loop, { timeScale: 1, duration: .9, delay: .3, overwrite: 'auto' });
      }
    });
  }

  /* ---- metric counters: draws the eye to the number, which is the point ---- */
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = (el.getAttribute('data-dec') | 0);
    var o = { v: 0 };
    gsap.to(o, {
      v: target, duration: 1.5, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: function () { el.textContent = o.v.toFixed(dec); }
    });
  });

  /* ---- hero glow parallax: depth cue only ---- */
  var glow = document.querySelector('.hero-glow');
  if (glow) {
    gsap.to(glow, {
      yPercent: 22, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 }
    });
  }

  /* ---- chart line draws on enter: storytelling, the growth is the message ---- */
  gsap.utils.toArray('.chart .spark').forEach(function (el) {
    var len = el.getTotalLength ? el.getTotalLength() : 1400;
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(el, {
      strokeDashoffset: 0, duration: 1.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  /* ---- bars grow from the baseline ---- */
  gsap.utils.toArray('.chart rect[rx="4"]').forEach(function (r, i) {
    var h = +r.getAttribute('height'), y = +r.getAttribute('y');
    gsap.fromTo(r, { attr: { height: 0, y: y + h } }, {
      attr: { height: h, y: y }, duration: 1, ease: 'expo.out', delay: i * 0.08,
      scrollTrigger: { trigger: r, start: 'top 92%', once: true }
    });
  });

  ScrollTrigger.refresh();
})();
