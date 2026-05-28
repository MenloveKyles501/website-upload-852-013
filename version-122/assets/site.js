document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var section = panel.closest("section");
    var grid = section ? section.querySelector("[data-movie-grid]") : null;
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var search = panel.querySelector(".js-grid-search");
    var year = panel.querySelector(".js-filter-year");
    var region = panel.querySelector(".js-filter-region");
    var genre = panel.querySelector(".js-filter-genre");

    function normalized(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalized(search && search.value);
      var selectedYear = normalized(year && year.value);
      var selectedRegion = normalized(region && region.value);
      var selectedGenre = normalized(genre && genre.value);

      cards.forEach(function (card) {
        var title = normalized(card.getAttribute("data-title"));
        var cardYear = normalized(card.getAttribute("data-year"));
        var cardRegion = normalized(card.getAttribute("data-region"));
        var cardGenre = normalized(card.getAttribute("data-genre"));
        var text = normalized(card.textContent);
        var visible = true;

        if (query && title.indexOf(query) === -1 && text.indexOf(query) === -1) {
          visible = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          visible = false;
        }
        if (selectedRegion && cardRegion !== selectedRegion) {
          visible = false;
        }
        if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
          visible = false;
        }

        card.classList.toggle("is-hidden", !visible);
      });
    }

    [search, year, region, genre].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    });
  });

  document.querySelectorAll("[data-global-search]").forEach(function (box) {
    var input = box.querySelector(".js-global-search");
    var results = box.querySelector("[data-search-results]");
    if (!input || !results || !window.SEARCH_INDEX) {
      return;
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.classList.remove("open");
        results.innerHTML = "";
        return;
      }

      var matches = window.SEARCH_INDEX.filter(function (item) {
        return item.text.toLowerCase().indexOf(query) !== -1;
      }).slice(0, 12);

      results.innerHTML = matches.map(function (item) {
        return '<a href="./' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong>' +
          '<span>' + escapeHtml(item.meta) + '</span></span>' +
          '</a>';
      }).join("");
      results.classList.toggle("open", matches.length > 0);
    }

    input.addEventListener("input", render);
    document.addEventListener("click", function (event) {
      if (!box.contains(event.target)) {
        results.classList.remove("open");
      }
    });
  });
});

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;"
    }[character];
  });
}
