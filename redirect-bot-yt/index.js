const log = (...args) => console.log("[YouTube Filter]:", ...args);

// Default words
const DEFAULT_WORDS = ["reaction", "prank", "compilation", "funny"];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    log("Tab updated:", tab.url);
    if (
      tab.url === "https://www.youtube.com/" ||
      tab.url.includes("accounts.youtube.com")
    ) {
      log("Ignoring homepage/accounts page");
      return;
    }

    try {
      let url = new URL(tab.url);
      let searchQuery = url.searchParams.get("search_query") || "";
      let pathName = url.pathname.toLowerCase();

      // Get stored words
      chrome.storage.sync.get(["redirectWords"], function (result) {
        const words = result.redirectWords || DEFAULT_WORDS;

        // Create regex pattern from words
        const pattern = new RegExp(`(${words.join("|")})`, "i");

        if (
          url.hostname === "www.youtube.com" &&
          (pattern.test(pathName) || pattern.test(searchQuery))
        ) {
          log("Match found! Redirecting...");
          chrome.tabs.update(tabId, { url: "https://www.youtube.com" });
        }
      });
    } catch (error) {
      log("Error processing URL:", error);
    }
  }
});
