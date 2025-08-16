let rules = [];
let redirectUrl = "https://www.google.com"; // Default redirect URL

// Function to update blocking rules
async function updateRules() {
  try {
    const { blockedSites = [], redirectSite = "https://www.google.com" } = await chrome.storage.sync.get([
      "blockedSites",
      "redirectSite"
    ]);

    redirectUrl = redirectSite;

    // Remove existing rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRules.map((rule) => rule.id),
    });

    // Create new rules
    rules = blockedSites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: "redirect", redirect: { url: redirectUrl } },
      condition: {
        urlFilter: site,
        resourceTypes: ["main_frame"],
      },
    }));

    // Add new rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules,
    });
  } catch (error) {
    console.error("Error updating rules:", error);
  }
}

// Listen for changes in storage
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && (changes.blockedSites || changes.redirectSite)) {
    updateRules();
  }
});

// Initialize rules when extension loads
updateRules();
