(function () {
    function each(selector, scope, callback) {
        Array.prototype.forEach.call((scope || document).querySelectorAll(selector), callback);
    }

    each('[data-menu-toggle]', document, function (button) {
        var menu = document.querySelector('[data-nav-menu]');
        button.addEventListener('click', function () {
            if (menu) {
                menu.classList.toggle('is-open');
            }
        });
    });

    each('[data-hero]', document, function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
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
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    each('[data-search-scope]', document, function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-card'));
        var empty = scope.querySelector('[data-no-results]');
        var activeFilter = 'all';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var term = normalize(input ? input.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var termMatch = !term || haystack.indexOf(term) !== -1;
                var filterMatch = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
                var show = termMatch && filterMatch;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query) {
                input.value = query;
            }
            input.addEventListener('input', applyFilter);
        }

        each('[data-filter-value]', scope, function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter-value') || 'all';
                each('[data-filter-value]', scope, function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    });

    var video = document.querySelector('[data-player]');
    var button = document.querySelector('[data-play-button]');
    var stream = typeof streamUrl === 'string' ? streamUrl : '';
    var pending = null;
    var hls = null;

    function preparePlayer() {
        if (!video || !stream) {
            return Promise.resolve();
        }

        if (pending) {
            return pending;
        }

        pending = new Promise(function (resolve) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                resolve();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hls.on(Hls.Events.ERROR, function () {
                    resolve();
                });
                return;
            }

            video.src = stream;
            resolve();
        });

        return pending;
    }

    function playMovie() {
        if (!video) {
            return;
        }

        if (button) {
            button.classList.add('is-hidden');
        }

        preparePlayer().then(function () {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        });
    }

    if (button) {
        button.addEventListener('click', playMovie);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!video.src) {
                playMovie();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
})();
