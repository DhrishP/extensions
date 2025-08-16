// Background script for YouTube Smart Transcript extension

// Track active content script tabs
let activeTabIds = new Set();

// Track if extension was just installed/updated
let justInstalled = false;

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log("[YT-Transcript] Extension installed/updated:", details.reason);
  activeTabIds.clear(); // Reset on install/update
  justInstalled = true;

  // Initialize storage with default settings if needed
  chrome.storage.local.get(["settings"], function (result) {
    if (!result.settings) {
      chrome.storage.local.set({
        settings: {
          // Default settings
          redirectCodingVideos: true,
          maxImportantPoints: 10,
        },
      });
    }
  });

  // Check for existing YouTube tabs and inject content script
  chrome.tabs.query({ url: "*://www.youtube.com/*" }, function (tabs) {
    console.log("[YT-Transcript] Found existing YouTube tabs:", tabs.length);
    for (const tab of tabs) {
      // Only inject into watch pages
      if (tab.url.includes("youtube.com/watch")) {
        injectContentScript(tab.id);
      }
    }
  });
});

// Function to inject content script
function injectContentScript(tabId) {
  console.log("[YT-Transcript] Injecting content script into tab:", tabId);

  chrome.scripting
    .executeScript({
      target: { tabId: tabId },
      files: ["content.js"],
    })
    .then(() => {
      console.log("[YT-Transcript] Content script injected into tab:", tabId);
      activeTabIds.add(tabId);
    })
    .catch((error) => {
      console.error("[YT-Transcript] Failed to inject content script:", error);
    });
}

// Handle content script ready message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "contentScriptReady") {
    console.log("[YT-Transcript] Content script ready in tab:", sender.tab.id);
    activeTabIds.add(sender.tab.id);
    sendResponse({ status: "acknowledged" });
    return true;
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if this is a YouTube video page that's fully loaded
  if (
    changeInfo.status === "complete" &&
    tab.url?.includes("youtube.com/watch")
  ) {
    console.log("[YT-Transcript] YouTube video page loaded in tab:", tabId);

    // First time after installation/update, try to inject the content script
    if (justInstalled || !activeTabIds.has(tabId)) {
      injectContentScript(tabId);
      justInstalled = false;
    }

    // Try to initialize content script with retries
    let retryCount = 0;
    const maxRetries = 3;

    function tryInitialize() {
      chrome.tabs
        .sendMessage(tabId, { action: "checkVideo" })
        .then(() => {
          console.log(
            "[YT-Transcript] Successfully sent message to tab:",
            tabId
          );
        })
        .catch((error) => {
          console.log("[YT-Transcript] Error sending message:", error);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(
              `[YT-Transcript] Retrying (${retryCount}/${maxRetries})...`
            );
            setTimeout(tryInitialize, 1000); // Wait 1 second before retry
          } else {
            // If all retries fail, try to inject the content script again
            injectContentScript(tabId);
          }
        });
    }

    setTimeout(tryInitialize, 500); // Give a bit of time for the page to settle
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabIds.delete(tabId);
});

// Handle tab replacement (e.g., when navigating from a restored tab)
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  activeTabIds.delete(removedTabId);
});
