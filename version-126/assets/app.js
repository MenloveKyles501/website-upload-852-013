(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('.mobile-menu-button');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        schedule();
      });
    });
    schedule();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var root = scope.parentElement || document;
      var input = scope.querySelector('[data-filter-input]');
      var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
      var empty = scope.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));

      function apply() {
        var term = normalize(input ? input.value : '');
        var visible = 0;
        var filters = selects.map(function (select) {
          return {
            field: select.getAttribute('data-field'),
            value: normalize(select.value)
          };
        });

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          var ok = !term || haystack.indexOf(term) !== -1;
          filters.forEach(function (filter) {
            if (!filter.value) {
              return;
            }
            var actual = normalize(card.getAttribute('data-' + filter.field));
            if (actual.indexOf(filter.value) === -1) {
              ok = false;
            }
          });
          card.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
    });
  }

  window.SitePlayer = {
    init: function (id, url) {
      var box = document.getElementById(id);
      if (!box) {
        return;
      }
      var video = box.querySelector('video');
      var start = box.querySelector('.player-start');
      var loaded = false;
      if (!video || !start) {
        return;
      }

      function play() {
        if (!loaded) {
          loaded = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
              hls.loadSource(url);
            });
            box.hls = hls;
          } else {
            video.src = url;
          }
          video.setAttribute('controls', 'controls');
        }
        start.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            start.classList.remove('is-hidden');
          });
        }
      }

      start.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (!loaded) {
          play();
        }
      });
    }
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
