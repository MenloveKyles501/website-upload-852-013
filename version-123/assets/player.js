import { H as Hls } from "./hls-dru42stk.js";

export function initPlayer(options) {
  const video = document.getElementById("movie-player");
  const shell = document.getElementById("player-shell");
  const overlay = document.getElementById("player-overlay");
  const toggle = document.getElementById("player-toggle");
  const mute = document.getElementById("player-mute");
  const progress = document.getElementById("player-progress");
  const bar = document.getElementById("player-progress-bar");
  const time = document.getElementById("player-time");
  const fullscreen = document.getElementById("player-fullscreen");
  const source = options.source;
  let loaded = false;
  let hls = null;

  if (!video || !source) {
    return;
  }

  if (options.poster) {
    video.setAttribute("poster", options.poster);
  }

  function bindSource() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
    return minutes + ":" + rest;
  }

  function updateProgress() {
    const duration = video.duration || 0;
    const current = video.currentTime || 0;
    const percent = duration ? current / duration * 100 : 0;

    if (bar) {
      bar.style.width = percent + "%";
    }

    if (time) {
      time.textContent = formatTime(current) + " / " + formatTime(duration);
    }
  }

  function play() {
    bindSource();

    if (video.paused) {
      const request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    } else {
      video.pause();
    }
  }

  function setPlayingState() {
    const playing = !video.paused;

    if (toggle) {
      toggle.textContent = playing ? "❚❚" : "▶";
    }

    if (overlay) {
      overlay.classList.toggle("is-hidden", playing);
    }

    if (shell) {
      shell.classList.toggle("is-playing", playing);
    }
  }

  if (overlay) {
    overlay.addEventListener("click", function (event) {
      event.preventDefault();
      play();
    });
  }

  if (toggle) {
    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      play();
    });
  }

  video.addEventListener("click", function () {
    play();
  });

  video.addEventListener("play", setPlayingState);
  video.addEventListener("pause", setPlayingState);
  video.addEventListener("timeupdate", updateProgress);
  video.addEventListener("loadedmetadata", updateProgress);

  if (mute) {
    mute.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      video.muted = !video.muted;
      mute.textContent = video.muted ? "🔇" : "🔊";
    });
  }

  if (progress) {
    progress.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      bindSource();

      const rect = progress.getBoundingClientRect();
      const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);

      if (Number.isFinite(video.duration)) {
        video.currentTime = ratio * video.duration;
      }
    });
  }

  if (fullscreen && shell) {
    fullscreen.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (shell.requestFullscreen) {
        shell.requestFullscreen();
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
