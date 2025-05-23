function limitSpeed() {
  const videos = document.querySelectorAll("video");
  videos.forEach((video) => {
    if (video.playbackRate > 1) {
      video.playbackRate = 1;
    }

    video.addEventListener("ratechange", () => {
      if (video.playbackRate > 1) {
        video.playbackRate = 1;
      }
    });
  });
}

const observer = new MutationObserver(limitSpeed);
observer.observe(document, { childList: true, subtree: true });
