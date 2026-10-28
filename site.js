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

  // Swatch chips copy their hex, like tapping a swatch in the app.
  var toast = document.querySelector('.toast');
  document.querySelectorAll('[data-hex]').forEach(function (b) {
    b.style.background = b.dataset.hex;
    b.title = b.dataset.hex + ' — click to copy';
    b.setAttribute('aria-label', 'Copy ' + b.dataset.hex);
    b.addEventListener('click', function () {
      var done = function () {
        if (!toast) return;
        toast.textContent = b.dataset.hex + ' copied';
        toast.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { toast.classList.remove('show'); }, 1400);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.hex).then(done, done); else done();
    });
  });
});
