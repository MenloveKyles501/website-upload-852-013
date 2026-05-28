(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function initPageFilter() {
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var input = document.querySelector('.page-search');
    var year = document.querySelector('.page-year');
    var cards = selectAll('.movie-card', list);
    function apply() {
      var keyword = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' '));
        var cardYear = normalize(card.getAttribute('data-year'));
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okYear = !selectedYear || cardYear === selectedYear;
        card.hidden = !(okKeyword && okYear);
      });
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
  }

  function createMovieCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card compact';
    article.setAttribute('data-title', movie.title || '');
    article.setAttribute('data-tags', movie.tags || '');
    article.setAttribute('data-year', movie.year || '');
    article.setAttribute('data-region', movie.region || '');
    article.setAttribute('data-genre', movie.genre || '');
    article.innerHTML = [
      '<a class="movie-cover" href="./' + movie.link + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-pill">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>',
      '<h3><a href="./' + movie.link + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-tags"><span class="chip">' + escapeHtml(movie.category) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSearch() {
    var panel = document.querySelector('[data-search-page]');
    var results = document.querySelector('.search-results');
    if (!panel || !results || !window.MOVIES) {
      return;
    }
    var input = panel.querySelector('.global-search-input');
    var category = panel.querySelector('.global-category-select');
    var region = panel.querySelector('.global-region-select');
    function render() {
      var keyword = normalize(input && input.value);
      var cat = normalize(category && category.value);
      var reg = normalize(region && region.value);
      var matches = window.MOVIES.filter(function (movie) {
        var haystack = normalize([movie.title, movie.tags, movie.year, movie.region, movie.genre, movie.category].join(' '));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okCategory = !cat || normalize(movie.category) === cat;
        var okRegion = !reg || normalize(movie.region).indexOf(reg) !== -1;
        return okKeyword && okCategory && okRegion;
      }).slice(0, 120);
      results.innerHTML = '';
      matches.forEach(function (movie) {
        results.appendChild(createMovieCard(movie));
      });
    }
    [input, category, region].forEach(function (element) {
      if (element) {
        element.addEventListener(element.tagName === 'SELECT' ? 'change' : 'input', render);
      }
    });
    render();
  }

  function initPlayers() {
    selectAll('.movie-player').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var source = player.getAttribute('data-play');
      var hlsInstance = null;
      if (!video || !source) {
        return;
      }
      function attach() {
        if (player.getAttribute('data-ready') === 'true') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        player.setAttribute('data-ready', 'true');
      }
      function begin() {
        attach();
        if (cover) {
          cover.classList.add('is-hidden');
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener('click', begin);
      }
      video.addEventListener('click', function () {
        if (player.getAttribute('data-ready') !== 'true') {
          begin();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHeroSlider();
    initPageFilter();
    initSearch();
    initPlayers();
  });
})();
