// Flag to track if the script is ready
let isInitialized = false;
let initializationPromise = null;

// Initialize the extension
async function initializeExtension() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise(async (resolve) => {
    try {
      console.log("[YT-Transcript] Initializing extension...");

      // Wait for DOM to be ready
      if (document.readyState !== "complete") {
        await new Promise((resolve) =>
          window.addEventListener("load", resolve, { once: true })
        );
      }

      // Send ready message to background script
      await chrome.runtime.sendMessage({ action: "contentScriptReady" });
      console.log("[YT-Transcript] Sent ready message to background script");

      isInitialized = true;

      // Set up URL change listener
      let lastUrl = location.href;
      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          console.log("[YT-Transcript] URL changed, checking for video...");
          checkForVideoAndProcess();
        }
      }).observe(document, { subtree: true, childList: true });

      // Initial check for video
      await checkForVideoAndProcess();

      resolve();
    } catch (error) {
      console.error("[YT-Transcript] Initialization error:", error);
      isInitialized = false;
      initializationPromise = null;
    }
  });

  return initializationPromise;
}

// Function to check if we're on a video page and process it
async function checkForVideoAndProcess() {
  console.log("[YT-Transcript] Checking for video...");
  if (window.location.href.includes("youtube.com/watch")) {
    console.log("[YT-Transcript] Video page detected, getting API key...");

    // Wait for page to fully load
    await waitForElement(
      "h1.title.style-scope.ytd-video-primary-info-renderer"
    );

    // Get API key from storage and process video
    chrome.storage.local.get(["geminiApiKey"], function (result) {
      if (result.geminiApiKey) {
        console.log("[YT-Transcript] API key found, processing video...");
        getAndProcessTranscript(result.geminiApiKey)
          .then((result) => {
            console.log("[YT-Transcript] Analysis result:", result);
            if (result.isProduct) {
              console.log(
                "[YT-Transcript] Non-productive content detected, redirecting..."
              );
              window.location.href = "https://www.youtube.com/";
            }
          })
          .catch((error) => {
            console.error("[YT-Transcript] Error:", error);
          });
      } else {
        console.log(
          "[YT-Transcript] No API key found. Please set your Gemini API key in the extension."
        );
      }
    });
  }
}

// Helper function to wait for an element to be present in the DOM
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Add timeout
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${selector}`));
    }, timeout);
  });
}

// Listen for messages from the popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[YT-Transcript] Message received:", request);

  const handleMessage = async () => {
    try {
      // Ensure initialization
      if (!isInitialized) {
        console.log("[YT-Transcript] Initializing on message...");
        await initializeExtension();
      }

      if (request.action === "checkVideo") {
        await checkForVideoAndProcess();
        sendResponse({ status: "checking" });
      } else if (request.action === "getTranscript") {
        console.log("[YT-Transcript] Manual transcript request received");
        const result = await getAndProcessTranscript(request.apiKey);
        console.log("[YT-Transcript] Sending transcript result:", result);
        sendResponse(result);
      }
    } catch (error) {
      console.error("[YT-Transcript] Message handling error:", error);
      sendResponse({ error: error.message || "Unknown error occurred" });
    }
  };

  // Return true to indicate we'll send response asynchronously
  handleMessage();
  return true;
});

// Initialize on script load
initializeExtension().catch((error) => {
  console.error("[YT-Transcript] Initial initialization failed:", error);
});

// Function to get and process the transcript
async function getAndProcessTranscript(apiKey) {
  try {
    console.log("[YT-Transcript] Starting transcript processing...");

    // Check if we're on a YouTube video page
    if (!window.location.href.includes("youtube.com/watch")) {
      throw new Error("Not a YouTube video page");
    }

    // Get video ID from URL
    const videoId = new URLSearchParams(window.location.search).get("v");
    if (!videoId) {
      throw new Error("Could not find video ID");
    }
    console.log("[YT-Transcript] Processing video ID:", videoId);

    // Get video title and description
    const videoTitle =
      document.querySelector(
        "h1.title.style-scope.ytd-video-primary-info-renderer"
      )?.textContent || "";
    const videoDescription =
      document.querySelector("ytd-expander.ytd-video-secondary-info-renderer")
        ?.textContent || "";

    console.log("[YT-Transcript] Found video metadata:", { title: videoTitle });

    // Get transcript data
    console.log("[YT-Transcript] Fetching transcript...");
    const transcript = await fetchTranscript(videoId);
    console.log(
      "[YT-Transcript] Transcript fetched, length:",
      transcript.length
    );

    // Analyze transcript using Gemini API
    console.log("[YT-Transcript] Analyzing with Gemini API...");
    const analysis = await analyzeTranscriptWithGemini(apiKey, {
      title: videoTitle,
      description: videoDescription,
      transcript: transcript,
    });
    console.log("[YT-Transcript] Analysis complete:", analysis);

    return {
      isProduct: !analysis.isProductive,
      analysis: {
        contentType: analysis.isProductive
          ? "Productive Content"
          : "Non-Productive Content",
        keyPoints: [analysis.reason],
        productInfo: null,
      },
    };
  } catch (error) {
    console.error("[YT-Transcript] Error processing transcript:", error);
    throw error;
  }
}

// Function to analyze transcript using Gemini API
async function analyzeTranscriptWithGemini(apiKey, data) {
  try {
    console.log("[YT-Transcript] Preparing Gemini API request...");

    // Truncate long content to avoid token limits
    const truncatedTranscript =
      data.transcript.slice(0, 1000) +
      (data.transcript.length > 1000 ? "..." : "");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this YouTube video content and determine if it's productive content (educational, informative, skill-building) or non-productive content (entertainment, casual vlogs, product reviews). Here's the information:
            
Title: ${data.title}
Description: ${data.description}
Transcript: ${truncatedTranscript}

Format your response as a JSON object with the following structure:
{
  "isProductive": boolean,
  "reason": "brief explanation of why this content is considered productive or not"
}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    console.log("[YT-Transcript] Gemini API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[YT-Transcript] Gemini API error response:", errorText);
      throw new Error(
        `Gemini API request failed: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log("[YT-Transcript] Gemini API raw response:", result);

    // Extract the JSON response from the text
    const textResponse = result.candidates[0].content.parts[0].text;
    console.log("[YT-Transcript] Extracted text response:", textResponse);

    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("[YT-Transcript] Failed to parse JSON from response");
      throw new Error("Failed to parse Gemini API response");
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log("[YT-Transcript] Parsed analysis:", analysis);
    return analysis;
  } catch (error) {
    console.error("[YT-Transcript] Error analyzing with Gemini:", error);
    throw new Error("Failed to analyze content: " + error.message);
  }
}

// Function to fetch transcript from YouTube - Multiple methods with fallbacks
async function fetchTranscript(videoId) {
  console.log("[YT-Transcript] Starting transcript fetch for video:", videoId);

  // Try multiple methods in sequence until one works
  try {
    // METHOD 1: Direct API call to get transcript
    try {
      console.log("[YT-Transcript] Trying direct API method...");
      const transcript = await fetchTranscriptDirect(videoId);
      if (transcript) {
        console.log("[YT-Transcript] Direct API method succeeded");
        return transcript;
      }
    } catch (error) {
      console.log("[YT-Transcript] Direct API method failed:", error);
    }

    // METHOD 2: Try to get auto-generated transcript
    try {
      console.log("[YT-Transcript] Trying auto-generated transcript method...");
      const transcript = await fetchAutoGeneratedTranscript(videoId);
      if (transcript) {
        console.log(
          "[YT-Transcript] Auto-generated transcript method succeeded"
        );
        return transcript;
      }
    } catch (error) {
      console.log(
        "[YT-Transcript] Auto-generated transcript method failed:",
        error
      );
    }

    // METHOD 3: Parse ytInitialPlayerResponse from page
    try {
      console.log("[YT-Transcript] Trying player response method...");
      const transcript = await fetchTranscriptFromPlayerResponse();
      if (transcript) {
        console.log("[YT-Transcript] Player response method succeeded");
        return transcript;
      }
    } catch (error) {
      console.log("[YT-Transcript] Player response method failed:", error);
    }

    // METHOD 4: UI method as last resort
    console.log("[YT-Transcript] Trying UI method as last resort...");
    const uiTranscript = await fetchTranscriptFromUI();
    if (uiTranscript) {
      console.log("[YT-Transcript] UI method succeeded");
      return uiTranscript;
    }

    throw new Error("All transcript methods failed");
  } catch (error) {
    console.error("[YT-Transcript] Failed to get transcript:", error);
    // Return a minimal transcript with just the title as fallback
    const videoTitle =
      document.querySelector(
        "h1.title.style-scope.ytd-video-primary-info-renderer"
      )?.textContent || "";
    console.log(
      "[YT-Transcript] Using video title as minimal transcript:",
      videoTitle
    );
    return "Title: " + videoTitle;
  }
}

// Method 1: Direct API call
async function fetchTranscriptDirect(videoId) {
  const response = await fetch(
    `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`
  );

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const data = await response.text();
  if (!data || data.length < 50) {
    throw new Error("API returned empty or too short response");
  }

  // Parse XML
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, "text/xml");
  const textElements = xmlDoc.getElementsByTagName("text");

  if (!textElements || textElements.length === 0) {
    throw new Error("No text elements found in transcript XML");
  }

  let transcriptText = "";
  for (let i = 0; i < textElements.length; i++) {
    transcriptText += textElements[i].textContent + " ";
  }

  if (transcriptText.trim().length < 20) {
    throw new Error("Transcript text too short to be valid");
  }

  return transcriptText;
}

// Method 2: Auto-generated transcript
async function fetchAutoGeneratedTranscript(videoId) {
  const response = await fetch(
    `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&kind=asr`
  );

  if (!response.ok) {
    throw new Error(`ASR API returned ${response.status}`);
  }

  const data = await response.text();
  if (!data || data.length < 50) {
    throw new Error("ASR API returned empty or too short response");
  }

  // Parse XML
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, "text/xml");
  const textElements = xmlDoc.getElementsByTagName("text");

  if (!textElements || textElements.length === 0) {
    throw new Error("No text elements found in ASR transcript XML");
  }

  let transcriptText = "";
  for (let i = 0; i < textElements.length; i++) {
    transcriptText += textElements[i].textContent + " ";
  }

  if (transcriptText.trim().length < 20) {
    throw new Error("ASR transcript text too short to be valid");
  }

  return transcriptText;
}

// Method 3: Parse from player response
async function fetchTranscriptFromPlayerResponse() {
  // Try to get the player response from the window object
  let playerResponse = null;

  if (window.ytInitialPlayerResponse) {
    console.log("[YT-Transcript] Found ytInitialPlayerResponse in window");
    playerResponse = window.ytInitialPlayerResponse;
  } else {
    // Try to extract it from the page source
    console.log(
      "[YT-Transcript] Extracting ytInitialPlayerResponse from page source"
    );
    const htmlStr = document.documentElement.innerHTML;
    const playerResponseMatch = htmlStr.match(
      /ytInitialPlayerResponse\s*=\s*({.+?})\s*;/
    );
    if (playerResponseMatch && playerResponseMatch[1]) {
      try {
        playerResponse = JSON.parse(playerResponseMatch[1]);
      } catch (e) {
        console.error(
          "[YT-Transcript] Error parsing ytInitialPlayerResponse:",
          e
        );
      }
    }
  }

  if (!playerResponse) {
    throw new Error("Could not find player response data");
  }

  // Check if captions are available
  if (
    !playerResponse.captions ||
    !playerResponse.captions.playerCaptionsTracklistRenderer ||
    !playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks ||
    playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks
      .length === 0
  ) {
    throw new Error("No caption tracks available in player response");
  }

  // Get the first available caption track
  const captionTrack =
    playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks[0];
  const captionUrl = captionTrack.baseUrl;

  if (!captionUrl) {
    throw new Error("No caption URL found");
  }

  // Fetch the captions
  const response = await fetch(`${captionUrl}&fmt=json3`);
  if (!response.ok) {
    throw new Error(`Caption fetch failed: ${response.status}`);
  }

  const captionData = await response.json();
  if (!captionData || !captionData.events) {
    throw new Error("Invalid caption data format");
  }

  // Process the captions
  const transcript = captionData.events
    .filter((event) => event.segs) // Filter out events without segments
    .map((event) => event.segs.map((seg) => seg.utf8 || "").join(" "))
    .join(" ")
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  if (transcript.length < 20) {
    throw new Error("Processed transcript too short to be valid");
  }

  return transcript;
}

// Method 4: UI method (most complex but sometimes works when APIs fail)
async function fetchTranscriptFromUI() {
  let maxRetries = 3;
  let currentTry = 0;

  while (currentTry < maxRetries) {
    currentTry++;
    console.log(
      `[YT-Transcript] UI method attempt ${currentTry}/${maxRetries}`
    );

    try {
      // First check if transcript sidebar is already open
      const transcriptContainer = document.querySelector(
        "ytd-transcript-renderer"
      );
      if (transcriptContainer) {
        console.log("[YT-Transcript] Transcript sidebar already open");
        const transcriptItems = transcriptContainer.querySelectorAll(
          "ytd-transcript-segment-renderer"
        );
        if (transcriptItems && transcriptItems.length > 0) {
          return Array.from(transcriptItems)
            .map((item) => item.textContent.trim())
            .join(" ");
        }
      }

      // Look for the transcript button
      let transcriptButton = document.querySelector(
        'button[aria-label="Show transcript"]'
      );
      if (!transcriptButton) {
        // Try to open settings menu
        const settingsButton = document.querySelector(
          "button.ytp-button.ytp-settings-button"
        );
        if (!settingsButton) {
          throw new Error("Settings button not found");
        }

        // Click settings button
        settingsButton.click();
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Look for transcript option in menu
        const menuItems = document.querySelectorAll("div.ytp-menuitem");
        let transcriptMenuItem = null;

        for (const item of menuItems) {
          if (item.textContent.includes("Transcript")) {
            transcriptMenuItem = item;
            break;
          }
        }

        if (!transcriptMenuItem) {
          // Close menu and try alternative method
          document.body.click();
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Try the 3-dot menu on mobile/desktop website
          const moreActionsButton = document.querySelector("button#expand");
          if (moreActionsButton) {
            moreActionsButton.click();
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Look for transcript option
            const moreMenuItems = document.querySelectorAll("tp-yt-paper-item");
            for (const item of moreMenuItems) {
              if (item.textContent.includes("Open transcript")) {
                item.click();
                await new Promise((resolve) => setTimeout(resolve, 1500));
                break;
              }
            }
          }
        } else {
          // Click on transcript menu item
          transcriptMenuItem.click();
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      } else {
        // Click on transcript button if found directly
        transcriptButton.click();
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // Now check for transcript elements
      // Try different possible selectors
      const selectors = [
        "ytd-transcript-segment-renderer",
        ".ytd-transcript-segment-renderer",
        "ytd-transcript-body-renderer yt-formatted-string",
        "#transcript-scrollbox ytd-transcript-segment-renderer",
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements && elements.length > 0) {
          console.log(
            `[YT-Transcript] Found transcript elements with selector: ${selector}`
          );
          return Array.from(elements)
            .map((el) => el.textContent.trim())
            .join(" ");
        }
      }

      throw new Error("Transcript elements not found after opening UI");
    } catch (error) {
      console.error(
        `[YT-Transcript] UI method attempt ${currentTry} failed:`,
        error
      );
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("UI method failed after all attempts");
}
