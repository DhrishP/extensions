export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  async main() {
    // Listen for navigation changes
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        onUrlChange();
      }
    }).observe(document, { subtree: true, childList: true });
  },
});

async function onUrlChange() {
  if (!location.pathname.includes('/watch')) return;
  
  const videoId = new URLSearchParams(location.search).get('v');
  if (!videoId) return;

  // Send message to background script
  chrome.runtime.sendMessage({ 
    type: 'ANALYZE_VIDEO',
    videoId 
  });
}