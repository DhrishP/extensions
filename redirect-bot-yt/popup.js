document.addEventListener("DOMContentLoaded", function () {
  const wordList = document.getElementById("word-list");
  const newWordInput = document.getElementById("new-word");
  const addBtn = document.getElementById("add-btn");
  const DEFAULT_WORDS = ["reaction", "prank", "compilation", "funny"];

  // Load and display words
  function loadWords() {
    chrome.storage.sync.get(["redirectWords"], function (result) {
      const words = result.redirectWords || DEFAULT_WORDS;
      wordList.innerHTML = words
        .map(
          (word) => `
        <div class="word-item">
          <span>${word}</span>
          <span class="remove-btn" data-word="${word}">×</span>
        </div>
      `
        )
        .join("");
    });
  }

  // Add new word
  function addWord() {
    const newWord = newWordInput.value.trim().toLowerCase();
    if (newWord) {
      chrome.storage.sync.get(["redirectWords"], function (result) {
        const words = result.redirectWords || DEFAULT_WORDS;
        if (!words.includes(newWord)) {
          words.push(newWord);
          chrome.storage.sync.set({ redirectWords: words }, function () {
            loadWords();
            newWordInput.value = "";
            newWordInput.focus();
          });
        }
      });
    }
  }

  // Add word on button click
  addBtn.addEventListener("click", addWord);

  // Add word on Enter key
  newWordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addWord();
    }
  });

  // Remove word
  wordList.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-btn")) {
      const wordToRemove = e.target.dataset.word;
      chrome.storage.sync.get(["redirectWords"], function (result) {
        const words = result.redirectWords.filter(
          (word) => word !== wordToRemove
        );
        chrome.storage.sync.set({ redirectWords: words }, function () {
          loadWords();
        });
      });
    }
  });

  // Initialize with default words if empty
  chrome.storage.sync.get(["redirectWords"], function (result) {
    if (!result.redirectWords) {
      chrome.storage.sync.set({ redirectWords: DEFAULT_WORDS }, function () {
        loadWords();
      });
    } else {
      loadWords();
    }
  });
});
