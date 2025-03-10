import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  manifest: {
    name: "YouTube Productivity Filter",
    description: "Analyzes YouTube videos and blocks unproductive content",
    permissions: [
      "storage",
      "tabs",
      "https://www.youtube.com/*",
      "https://generativelanguage.googleapis.com/*",
    ],
  },
  modules: ["@wxt-dev/module-react"],
});
