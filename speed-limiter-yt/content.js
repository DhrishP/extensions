let maxPlaybackRate = 1;
const handledVideos = new WeakSet();

function enforceMaxRateOnVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  
  // Enforce current rate
  if (video.playbackRate > maxPlaybackRate) {
    video.playbackRate = maxPlaybackRate;
  }
  
  // Set up event listeners if not already handled
  if (!handledVideos.has(video)) {
    handledVideos.add(video);
    
    // Listen for rate changes
    video.addEventListener("ratechange", () => {
      if (video.playbackRate > maxPlaybackRate) {
        video.playbackRate = maxPlaybackRate;
      }
    });
    
    // Listen for when video becomes ready
    video.addEventListener("loadedmetadata", () => {
      if (video.playbackRate > maxPlaybackRate) {
        video.playbackRate = maxPlaybackRate;
      }
    });
    
    // Override the setter for this specific video instance
    const originalDescriptor = Object.getOwnPropertyDescriptor(video, 'playbackRate');
    if (originalDescriptor && originalDescriptor.configurable) {
      Object.defineProperty(video, 'playbackRate', {
        get: originalDescriptor.get,
        set: function(value) {
          const newRate = Number(value);
          if (Number.isFinite(newRate) && newRate > 0) {
            const clampedRate = Math.min(newRate, maxPlaybackRate);
            originalDescriptor.set.call(this, clampedRate);
          } else {
            originalDescriptor.set.call(this, value);
          }
        },
        enumerable: originalDescriptor.enumerable,
        configurable: false
      });
    }
  }
}

function applyToAllVideos() {
  const videos = document.querySelectorAll("video");
  videos.forEach(enforceMaxRateOnVideo);
}

// Observe DOM for new videos
const observer = new MutationObserver((mutations) => {
  let shouldApply = false;
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'VIDEO' || node.querySelector('video')) {
            shouldApply = true;
          }
        }
      });
    }
  });
  
  if (shouldApply) {
    // Small delay to ensure video elements are fully initialized
    setTimeout(applyToAllVideos, 100);
  }
});

// Start observing
observer.observe(document, { 
  childList: true, 
  subtree: true 
});

// Apply immediately with default until stored value loads
applyToAllVideos();

// Load initial settings
chrome.storage.sync.get({ maxRate: 1 }, (data) => {
  const value = Number(data.maxRate);
  maxPlaybackRate = Number.isFinite(value) && value > 0 ? value : 1;
  applyToAllVideos();
});

// React to changes from popup
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  
  if (changes.maxRate) {
    const value = Number(changes.maxRate.newValue);
    maxPlaybackRate = Number.isFinite(value) && value > 0 ? value : 1;
    applyToAllVideos();
  }
});

// Additional enforcement: check periodically for any videos that might have bypassed our limits
setInterval(() => {
  const videos = document.querySelectorAll("video");
  videos.forEach((video) => {
    if (video.playbackRate > maxPlaybackRate) {
      video.playbackRate = maxPlaybackRate;
    }
  });
}, 2000);
