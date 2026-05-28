(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
            document.body.classList.toggle('menu-open', mobilePanel.classList.contains('open'));
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var index = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });

        showSlide(0);
        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var target = document.querySelector(panel.getAttribute('data-target'));
        if (!target) {
            return;
        }
        var input = panel.querySelector('.filter-input');
        var year = panel.querySelector('.filter-year');
        var sort = panel.querySelector('.filter-sort');
        var empty = panel.parentElement.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(target.querySelectorAll('[data-filter-card]'));
        var original = cards.slice();

        function valueOf(card, name) {
            return card.getAttribute(name) || '';
        }

        function run() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = valueOf(card, 'data-search').toLowerCase();
                var cardYear = valueOf(card, 'data-year');
                var matched = (!query || haystack.indexOf(query) !== -1) && (!selectedYear || cardYear === selectedYear);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (sort && sort.value !== 'default') {
                var sorted = cards.slice().sort(function (a, b) {
                    if (sort.value === 'year') {
                        return (parseInt(valueOf(b, 'data-year'), 10) || 0) - (parseInt(valueOf(a, 'data-year'), 10) || 0);
                    }
                    var aScore = parseFloat((a.querySelector('.rating-badge') || a.querySelector('.rank-score') || {}).textContent || '0');
                    var bScore = parseFloat((b.querySelector('.rating-badge') || b.querySelector('.rank-score') || {}).textContent || '0');
                    return bScore - aScore;
                });
                sorted.forEach(function (card) {
                    target.appendChild(card);
                });
            } else {
                original.forEach(function (card) {
                    target.appendChild(card);
                });
            }

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', run);
        }
        if (year) {
            year.addEventListener('change', run);
        }
        if (sort) {
            sort.addEventListener('change', run);
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input && target.id === 'search-grid') {
            input.value = query;
        }
        run();
    });
})();
