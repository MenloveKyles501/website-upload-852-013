(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-empty");
      });
    });

    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("form.site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (input && input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = form.getAttribute("action") || "search.html";
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    if (slides.length > 1) {
      var active = 0;
      var show = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
          slide.classList.toggle("is-active", idx === active);
        });
        dots.forEach(function (dot, idx) {
          dot.classList.toggle("is-active", idx === active);
        });
      };
      dots.forEach(function (dot, idx) {
        dot.addEventListener("click", function () {
          show(idx);
        });
      });
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      var keyword = document.querySelector("[data-filter-keyword]");
      var region = document.querySelector("[data-filter-region]");
      var genre = document.querySelector("[data-filter-genre]");
      var year = document.querySelector("[data-filter-year]");
      var result = document.querySelector("[data-filter-result]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      if (keyword) {
        keyword.value = q;
      }
      var normalize = function (value) {
        return String(value || "").trim().toLowerCase();
      };
      var apply = function () {
        var key = normalize(keyword && keyword.value);
        var regionValue = normalize(region && region.value);
        var genreValue = normalize(genre && genre.value);
        var yearValue = normalize(year && year.value);
        var count = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.year
          ].join(" "));
          var ok = true;
          if (key && haystack.indexOf(key) === -1) {
            ok = false;
          }
          if (regionValue && normalize(card.dataset.region).indexOf(regionValue) === -1) {
            ok = false;
          }
          if (genreValue && normalize(card.dataset.genre).indexOf(genreValue) === -1 && normalize(card.dataset.tags).indexOf(genreValue) === -1) {
            ok = false;
          }
          if (yearValue && normalize(card.dataset.year) !== yearValue) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            count += 1;
          }
        });
        if (result) {
          result.textContent = "匹配影片：" + count + " 部";
        }
      };
      [keyword, region, genre, year].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });
      apply();
    }

    var player = document.querySelector("[data-player]");
    if (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var configNode = document.getElementById("player-config");
      var config = configNode ? JSON.parse(configNode.textContent) : {};
      var streamUrl = config.url || "";
      var started = false;
      var start = function () {
        if (!video || !streamUrl) {
          return;
        }
        if (cover) {
          cover.hidden = true;
        }
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = streamUrl;
          video.play().catch(function () {});
        }
      };
      if (cover) {
        cover.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started || video.paused) {
            start();
          } else {
            video.pause();
          }
        });
      }
    }
  });
})();
