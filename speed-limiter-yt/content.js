let maxPlaybackRate = 1;
let limiterEnabled = true;
const handledVideos = new WeakSet();

function enforceMaxRateOnVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  if (limiterEnabled && video.playbackRate > maxPlaybackRate) {
    video.playbackRate = maxPlaybackRate;
  }
  if (!handledVideos.has(video)) {
    handledVideos.add(video);
    video.addEventListener("ratechange", () => {
      if (!limiterEnabled) return;
      if (video.playbackRate > maxPlaybackRate) {
        video.playbackRate = maxPlaybackRate;
      }
    });
  }
}

function applyToAllVideos() {
  const videos = document.querySelectorAll("video");
  videos.forEach(enforceMaxRateOnVideo);
}

// Observe DOM for new videos
const observer = new MutationObserver(() => {
  applyToAllVideos();
});
observer.observe(document, { childList: true, subtree: true });
// Apply immediately with default until stored value loads
applyToAllVideos();

// Load initial settings
chrome.storage.sync.get({ maxRate: 1, enabled: true }, (data) => {
  const value = Number(data.maxRate);
  limiterEnabled = Boolean(data.enabled);
  maxPlaybackRate = Number.isFinite(value) && value > 0 ? value : 1;
  applyToAllVideos();
});

// React to changes from popup
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (changes.maxRate) {
    const value = Number(changes.maxRate.newValue);
    maxPlaybackRate = Number.isFinite(value) && value > 0 ? value : 1;
  }
  if (changes.enabled) {
    limiterEnabled = Boolean(changes.enabled.newValue);
  }
  applyToAllVideos();
});
