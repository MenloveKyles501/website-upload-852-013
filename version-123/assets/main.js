(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
        panel.hidden = expanded;
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var current = 0;

      function setSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          setSlide(index);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          setSlide(current + 1);
        }, 5600);
      }
    }

    var pageInput = document.getElementById("search-page-input");
    var status = document.querySelector(".search-status");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));

    function filterCards(query) {
      var keyword = normalize(query);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matched = keyword === "" || text.indexOf(keyword) !== -1;
        card.classList.toggle("hidden-by-filter", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = keyword ? "筛选结果：" + visible + " 部影片" : "";
      }
    }

    if (pageInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      pageInput.value = query;
      filterCards(query);
      pageInput.addEventListener("input", function () {
        filterCards(pageInput.value);
      });
    }

    var categoryInput = document.querySelector(".category-filter");
    if (categoryInput && cards.length) {
      categoryInput.addEventListener("input", function () {
        filterCards(categoryInput.value);
      });
    }
  });
})();
