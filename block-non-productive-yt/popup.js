document.addEventListener("DOMContentLoaded", function () {
  const getTranscriptButton = document.getElementById("get-transcript");
  const statusMessage = document.getElementById("status-message");
  const loadingElement = document.getElementById("loading");
  const transcriptContainer = document.getElementById("transcript-container");
  const transcriptContent = document.getElementById("transcript-content");
  const apiKeyInput = document.getElementById("gemini-api-key");
  const saveApiKeyButton = document.getElementById("save-api-key");
  const apiKeyStatus = document.getElementById("api-key-status");

  // Check if already running on load
  checkActiveTab();

  // Load saved API key
  chrome.storage.local.get(["geminiApiKey"], function (result) {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
      apiKeyStatus.textContent = "✓ API key saved";
      apiKeyStatus.style.color = "#4CAF50";
    }
  });

  // Save API key
  saveApiKeyButton.addEventListener("click", function () {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.local.set({ geminiApiKey: apiKey }, function () {
        apiKeyStatus.textContent = "✓ API key saved";
        apiKeyStatus.style.color = "#4CAF50";

        // Check current tab to see if we should start analysis
        checkActiveTab();
      });
    } else {
      apiKeyStatus.textContent = "⚠ Please enter an API key";
      apiKeyStatus.style.color = "#f44336";
    }
  });

  // Function to check active tab and act if it's a YouTube video
  function checkActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (
        currentTab &&
        currentTab.url &&
        currentTab.url.includes("youtube.com/watch")
      ) {
        statusMessage.textContent = "YouTube video detected. Ready to analyze.";

        // Check if API key exists
        chrome.storage.local.get(["geminiApiKey"], function (result) {
          if (result.geminiApiKey) {
            // Auto-start analysis if API key exists
            getTranscriptButton.click();
          }
        });
      } else {
        statusMessage.textContent = "Please navigate to a YouTube video first.";
      }
    });
  }

  getTranscriptButton.addEventListener("click", async function () {
    // Check for API key
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      statusMessage.textContent = "Please enter your Gemini API key first";
      return;
    }

    // Show loading state
    getTranscriptButton.disabled = true;
    statusMessage.textContent = "Analyzing video...";
    loadingElement.classList.remove("hidden");
    transcriptContainer.classList.add("hidden");

    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Check if we're on a YouTube video page
      if (!tab.url.includes("youtube.com/watch")) {
        statusMessage.textContent =
          "Please navigate to a YouTube video page first.";
        loadingElement.classList.add("hidden");
        getTranscriptButton.disabled = false;
        return;
      }

      // Create a Promise to handle retry logic
      const getTranscriptWithRetry = async (maxRetries = 3) => {
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(
              `[YT-Transcript] Popup: Attempt ${attempt} to get transcript`
            );

            // Force tab update to ensure content script is injected
            if (attempt > 1) {
              await chrome.tabs.update(tab.id, { url: tab.url });
              // Wait for page to load
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }

            // Send message to content script
            const response = await new Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                reject(new Error("Timeout waiting for response"));
              }, 30000); // 30 second timeout

              chrome.tabs.sendMessage(
                tab.id,
                { action: "getTranscript", apiKey },
                function (response) {
                  clearTimeout(timeoutId);
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else if (!response) {
                    reject(new Error("Empty response received"));
                  } else {
                    resolve(response);
                  }
                }
              );
            });

            return response;
          } catch (error) {
            console.error(
              `[YT-Transcript] Popup: Attempt ${attempt} failed:`,
              error
            );
            lastError = error;

            // Last attempt failed, don't wait
            if (attempt < maxRetries) {
              // Wait before retry with increasing backoff
              await new Promise((r) => setTimeout(r, attempt * 1000));
            }
          }
        }

        // All retries failed
        throw (
          lastError || new Error("Failed to get transcript after all retries")
        );
      };

      // Try to get transcript with retries
      const response = await getTranscriptWithRetry();

      loadingElement.classList.add("hidden");
      getTranscriptButton.disabled = false;

      if (response.error) {
        statusMessage.textContent = response.error;
        return;
      }

      if (response.isProduct) {
        // Add a countdown before redirect
        let countdown = 3;
        const updateCountdown = setInterval(() => {
          statusMessage.textContent = `This appears to be non-productive content. Redirecting in ${countdown} seconds...`;
          countdown--;
          if (countdown < 0) {
            clearInterval(updateCountdown);
            chrome.tabs.update(tab.id, { url: "https://www.youtube.com/" });
            window.close(); // Close the popup
          }
        }, 1000);
      } else {
        // Display the analysis results
        statusMessage.textContent =
          "This is productive content. You may continue watching!";
        transcriptContainer.classList.remove("hidden");

        // Format and display the analysis results
        if (response.analysis) {
          const analysisHTML = `
            <div class="analysis-section">
              <h3>Content Analysis</h3>
              <p class="content-type ${
                response.isProduct ? "non-productive" : "productive"
              }">
                ${response.analysis.contentType}
              </p>
              <h3>Reason</h3>
              <p>${response.analysis.keyPoints[0]}</p>
            </div>
          `;
          transcriptContent.innerHTML = analysisHTML;
        } else {
          transcriptContent.innerHTML = "<p>No analysis results available.</p>";
        }
      }
    } catch (error) {
      loadingElement.classList.add("hidden");
      getTranscriptButton.disabled = false;
      statusMessage.textContent =
        "Error: " + (error.message || "Unknown error occurred");
      console.error("[YT-Transcript] Popup error:", error);
    }
  });
});
