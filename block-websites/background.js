let rules = [];

// Function to update blocking rules
async function updateRules() {
  try {
    const { blockedSites = [] } = await chrome.storage.sync.get([
      "blockedSites",
    ]);

    // Remove existing rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRules.map((rule) => rule.id),
    });

    // Create new rules
    rules = blockedSites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: "block" },
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
  if (namespace === "sync" && changes.blockedSites) {
    updateRules();
  }
});

// Initialize rules when extension loads
updateRules();
