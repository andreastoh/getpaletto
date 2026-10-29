// Loaded in <head> on every page.
// Flip LIVE to true the day Paletto is on the App Store: every page swaps its
// "coming soon" lines for the download buttons.
var LIVE = false;
var APP_STORE = 'https://apps.apple.com/app/id6827217518';

document.documentElement.classList.add('js');
if (LIVE) document.documentElement.classList.add('live');

document.addEventListener('DOMContentLoaded', function () {
  // App Store links share one URL.
  document.querySelectorAll('[data-store]').forEach(function (a) { a.href = APP_STORE; });

  // Fade sections in as they scroll into view.
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  var toast = document.querySelector('.toast');
  function say(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.classList.remove('show'); }, 1400);
  }

  // Swatch chips copy their hex, like tapping a swatch in the app.
  function chip(hex) {
    var b = document.createElement('button');
    b.type = 'button';
    b.style.background = hex;
    b.title = hex + ' — click to copy';
    b.setAttribute('aria-label', 'Copy ' + hex);
    b.addEventListener('click', function () {
      var done = function () { say(hex + ' copied'); };
      if (navigator.clipboard) navigator.clipboard.writeText(hex).then(done, done); else done();
    });
    return b;
  }

  // A new palette on every visit: one of the site's frames, read by the app's own extractor
  // (palettes.js, made by Marketing/tools/site-palettes.py).
  var palettes = window.PALETTES || [];
  var current = null;
  function paint(p) {
    current = p;
    var root = document.documentElement.style;
    for (var i = 0; i < 8; i++) root.setProperty('--sw' + (i + 1), p.hexes[i % p.hexes.length]);
    document.querySelectorAll('[data-palette-chips]').forEach(function (box) {
      box.innerHTML = '';
      p.hexes.forEach(function (h) { box.appendChild(chip(h)); });
    });
    document.querySelectorAll('[data-palette-strip]').forEach(function (s) {
      s.innerHTML = '';
      p.hexes.forEach(function (h) { var i = document.createElement('i'); i.style.background = h; s.appendChild(i); });
    });
    document.querySelectorAll('[data-palette-place]').forEach(function (a) { a.textContent = p.place; });
  }
  if (palettes.length) {
    var last = null;
    try { last = sessionStorage.getItem('paletto.lastPalette'); } catch (e) {}
    var pick = function () {
      var choices = palettes.filter(function (p) { return p.img !== (current ? current.img : last); });
      return choices[Math.floor(Math.random() * choices.length)] || palettes[0];
    };
    paint(pick());
    try { sessionStorage.setItem('paletto.lastPalette', current.img); } catch (e) {}
    document.querySelectorAll('[data-palette-shuffle]').forEach(function (b) {
      b.addEventListener('click', function () { paint(pick()); });
    });
    document.querySelectorAll('[data-palette-place]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); openFrame(current.img); });
    });
  }

  // Screen recordings play while on screen, and not at all for people who turn off motion;
  // they can still tap to play.
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clips = document.querySelectorAll('video[data-autoplay]');
  clips.forEach(function (v) {
    v.addEventListener('click', function () { if (v.paused) v.play(); else v.pause(); });
  });
  if (!still && 'IntersectionObserver' in window) {
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.4 });
    clips.forEach(function (v) { watch.observe(v); });
  }

  // Frames open larger when clicked, with their palette underneath.
  var frames = Array.prototype.slice.call(document.querySelectorAll('main img[data-frame]'));
  var box, boxImg, boxCap, boxChips, at = 0;
  function byImg(src) {
    for (var i = 0; i < palettes.length; i++) if (palettes[i].img === src) return palettes[i];
    return null;
  }
  function show(i) {
    at = (i + frames.length) % frames.length;
    var img = frames[at], src = img.getAttribute('src'), p = byImg(src);
    boxImg.src = src;
    boxImg.alt = img.alt;
    boxCap.textContent = p ? p.place : '';
    boxChips.innerHTML = '';
    if (p) p.hexes.forEach(function (h) { boxChips.appendChild(chip(h)); });
  }
  function openFrame(src) {
    for (var i = 0; i < frames.length; i++) if (frames[i].getAttribute('src') === src) break;
    if (i === frames.length) return;
    show(i);
    box.showModal ? box.showModal() : box.setAttribute('open', '');
    document.documentElement.classList.add('boxed');
  }
  if (frames.length) {
    box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Frame');
    box.innerHTML =
      '<button class="lb-close" type="button" aria-label="Close">×</button>' +
      '<button class="lb-prev" type="button" aria-label="Previous frame">‹</button>' +
      '<figure><img alt=""><figcaption><span class="lb-place"></span><span class="chips lb-chips"></span></figcaption></figure>' +
      '<button class="lb-next" type="button" aria-label="Next frame">›</button>';
    document.body.appendChild(box);
    boxImg = box.querySelector('img');
    boxCap = box.querySelector('.lb-place');
    boxChips = box.querySelector('.lb-chips');
    var close = function () { box.close ? box.close() : box.removeAttribute('open'); };
    box.addEventListener('close', function () { document.documentElement.classList.remove('boxed'); });
    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function () { show(at - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { show(at + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(dx < 0 ? at + 1 : at - 1);
    });
    frames.forEach(function (img) {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.addEventListener('click', function () { openFrame(img.getAttribute('src')); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFrame(img.getAttribute('src')); }
      });
    });
  }
});
