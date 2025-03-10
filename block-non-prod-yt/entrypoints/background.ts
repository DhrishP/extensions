import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { Storage } from "@plasmohq/storage";
import { YoutubeTranscript } from "youtube-transcript";
import { z } from "zod";

const storage = new Storage();

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "ANALYZE_VIDEO") {
      analyzeVideo(message.videoId, sender.tab?.id);
    }
  });
});

async function analyzeVideo(videoId: string, tabId?: number) {
  try {
    // Check if productive mode is enabled
    const isEnabled = await storage.get("productiveMode");
    if (!isEnabled) return;

    // Get API key from storage
    const apiKey = await storage.get("GOOGLE_API_KEY");
    if (!apiKey) {
      throw new Error("API key not found");
    }

    // Get video transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const transcriptText = transcript.map((item) => item.text).join(" ");

    // Analyze with Gemini
    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: z.object({
        isProductive: z.boolean(),
        reason: z.string(),
        confidence: z.number().min(0).max(1),
      }),
      prompt: `Analyze if this video transcript is productive/educational content or entertainment/distraction. Transcript: "${transcriptText}"`,
    });
    console.log(object);

    if (!object.isProductive && tabId) {
      chrome.tabs.update(tabId, { url: "https://www.youtube.com" });
    }
  } catch (error) {
    console.error("Failed to analyze video:", error);
  }
}
