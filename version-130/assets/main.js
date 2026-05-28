(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function rootBase() {
    return document.body.getAttribute('data-base') || './';
  }

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function esc(text) {
    return (text || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    if (!slides.length || !dots.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(parseInt(dot.getAttribute('data-slide'), 10) || 0);
        start();
      });
    });
    start();
  }

  function initLocalFilter() {
    var input = qs('[data-filter-input]');
    var list = qs('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var cards = qsa('.movie-card', list);
    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));
        card.classList.toggle('is-filtered-out', keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }

  function initGlobalSearch() {
    var input = qs('#site-search');
    var panel = qs('#search-panel');
    var index = window.MOVIE_SEARCH_INDEX || [];
    if (!input || !panel || !index.length) {
      return;
    }
    var base = rootBase();
    function render(items) {
      if (!items.length) {
        panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
        panel.classList.add('open');
        return;
      }
      panel.innerHTML = items.slice(0, 10).map(function (item) {
        return '<a href="' + base + item.url + '">' +
          '<img src="' + base + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
          '<span><strong>' + item.title + '</strong><span>' + item.region + ' · ' + item.type + ' · ' + item.year + '</span></span>' +
          '</a>';
      }).join('');
      panel.classList.add('open');
    }
    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      if (!keyword) {
        panel.classList.remove('open');
        panel.innerHTML = '';
        return;
      }
      var items = index.filter(function (item) {
        return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.genre + ' ' + item.tags).indexOf(keyword) !== -1;
      });
      render(items);
    });
    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove('open');
      }
    });
  }

  function initImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      }, { once: true });
    });
  }

  function initPlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var source = options.source;
    var hlsInstance = null;
    if (!video || !overlay || !source) {
      return;
    }
    function attach() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function play() {
      attach();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }
    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initLocalFilter();
    initGlobalSearch();
    initImages();
  });
})();
