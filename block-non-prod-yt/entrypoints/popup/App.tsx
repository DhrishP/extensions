import { useState, useEffect } from "react";
import { Storage } from "@plasmohq/storage";
import "./App.css";

const storage = new Storage();

function App() {
  const [apiKey, setApiKey] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedApiKey = (await storage.get("GOOGLE_API_KEY")) || "";
    const savedMode = Boolean(await storage.get("productiveMode")) || false;
    setApiKey(savedApiKey);
    setIsEnabled(savedMode);
  };

  const saveSettings = async () => {
    await storage.set("GOOGLE_API_KEY", apiKey);
    await storage.set("productiveMode", isEnabled);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="container">
      <h1>YouTube Productivity Filter</h1>

      <div className="toggle-container">
        <label className="switch">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
          <span className="slider round"></span>
        </label>
        <span className="toggle-label">
          Productive Mode {isEnabled ? "On" : "Off"}
        </span>
      </div>

      <div className="form-group">
        <label>Google API Key:</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key"
        />
      </div>

      <button onClick={saveSettings} className="save-button">
        Save Settings
      </button>

      {isSaved && (
        <div className="success-message">Settings saved successfully!</div>
      )}
    </div>
  );
}

export default App;
