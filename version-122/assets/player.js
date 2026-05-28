window.MoviePlayer = {
  mount: function (id, source) {
    var root = document.getElementById(id);
    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var overlay = root.querySelector(".video-overlay");
    var ready = false;
    var hls = null;

    function prepare() {
      if (ready || !video) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      ready = true;
    }

    function play() {
      prepare();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!ready || video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("hidden");
        }
      });
      video.addEventListener("ended", function () {
        if (hls) {
          hls.stopLoad();
        }
      });
    }
  }
};
