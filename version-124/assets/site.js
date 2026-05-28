(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const mobileToggle = $('[data-mobile-toggle]');
  const nav = $('[data-nav]');
  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // Hero slider
  const slides = $$('.hero-slide');
  const dots = $$('.dot');
  let current = 0;
  let timer = null;
  const showSlide = (idx) => {
    if (!slides.length) return;
    current = (idx + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };
  const next = () => showSlide(current + 1);
  if (slides.length) {
    showSlide(0);
    timer = window.setInterval(next, 4800);
    $$('.hero-controls [data-slide]').forEach(btn => {
      btn.addEventListener('click', () => {
        showSlide(parseInt(btn.getAttribute('data-slide'), 10) || 0);
        window.clearInterval(timer);
        timer = window.setInterval(next, 4800);
      });
    });
  }

  // Search / filtering on pages that have cards
  const search = $('[data-search]');
  const filterButtons = $$('[data-filter]');
  const cards = $$('[data-card]');
  const empty = $('[data-empty]');
  let activeFilter = 'all';
  const normalize = (s) => (s || '').toString().toLowerCase().replace(/\s+/g, '');

  const applyFilter = () => {
    const q = normalize(search ? search.value : '');
    let visible = 0;
    cards.forEach(card => {
      const hay = normalize(card.getAttribute('data-searchable'));
      const cate = card.getAttribute('data-category') || 'all';
      const okQuery = !q || hay.includes(q);
      const okFilter = activeFilter === 'all' || cate === activeFilter;
      const show = okQuery && okFilter;
      card.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });
    if (empty) empty.classList.toggle('hidden', visible !== 0);
  };
  if (search) search.addEventListener('input', applyFilter);
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-filter') || 'all';
      filterButtons.forEach(b => b.classList.toggle('active', b === btn));
      applyFilter();
    });
  });
  if (search || cards.length) applyFilter();

  // Video player setup
  const video = $('[data-player]');
  const overlay = $('[data-play-overlay]');
  if (video) {
    const src = video.getAttribute('data-src');
    const tryPlay = async () => {
      try { await video.play(); } catch (e) {}
      if (overlay) overlay.classList.add('hidden');
    };

    const init = () => {
      if (!src) return;
      if (window.Hls && Hls.isSupported() && src.includes('.m3u8')) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
        hls.on(Hls.Events.ERROR, function (event, data) {
          // fall back to native source when possible
          if (!video.src) video.src = src;
        });
      } else {
        video.src = src;
      }
    };
    init();
    if (overlay) overlay.addEventListener('click', tryPlay);
    video.addEventListener('click', () => { if (video.paused) tryPlay(); });
    video.addEventListener('play', () => overlay && overlay.classList.add('hidden'));
    video.addEventListener('pause', () => overlay && overlay.classList.remove('hidden'));
  }
})();
