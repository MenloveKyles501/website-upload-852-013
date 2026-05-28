(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", open);
            button.setAttribute("aria-expanded", open ? "true" : "false");
            button.textContent = open ? "×" : "☰";
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function setupSearch() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-filter-grid]");
        if (!panel || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var empty = document.querySelector("[data-empty-state]");
        var query = panel.querySelector("[data-filter-query]");
        var genre = panel.querySelector("[data-filter-genre]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var year = panel.querySelector("[data-filter-year]");
        function value(node) {
            return node ? node.value.trim().toLowerCase() : "";
        }
        function includes(haystack, needle) {
            return !needle || String(haystack || "").toLowerCase().indexOf(needle) !== -1;
        }
        function apply() {
            var q = value(query);
            var g = value(genre);
            var r = value(region);
            var t = value(type);
            var y = value(year);
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.tags
                ].join(" ").toLowerCase();
                var match = includes(text, q) &&
                    includes(card.dataset.genre, g) &&
                    includes(card.dataset.region, r) &&
                    includes(card.dataset.type, t) &&
                    includes(card.dataset.year, y);
                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        [query, genre, region, type, year].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
}());

function initPlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-player-button]");
    if (!video || !cover || !button || !streamUrl) {
        return;
    }
    var started = false;
    var instance = null;
    function begin() {
        if (started) {
            video.play().catch(function () {});
            return;
        }
        started = true;
        cover.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            instance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            instance.loadSource(streamUrl);
            instance.attachMedia(video);
            instance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = streamUrl;
        video.play().catch(function () {});
    }
    button.addEventListener("click", begin);
    cover.addEventListener("click", begin);
    video.addEventListener("click", function () {
        if (!started) {
            begin();
        }
    });
    window.addEventListener("pagehide", function () {
        if (instance) {
            instance.destroy();
        }
    });
}
