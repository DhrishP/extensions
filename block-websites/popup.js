document.addEventListener("DOMContentLoaded", function () {
  const websiteInput = document.getElementById("websiteInput");
  const addButton = document.getElementById("addButton");
  const blockedList = document.getElementById("blockedList");
  const redirectInput = document.getElementById("redirectInput");
  const setRedirectButton = document.getElementById("setRedirectButton");
  const currentRedirect = document.getElementById("currentRedirect");

  // Load data when popup opens
  loadBlockedWebsites();
  loadRedirectSite();

  addButton.addEventListener("click", function () {
    addWebsite();
  });

  setRedirectButton.addEventListener("click", function () {
    setRedirectSite();
  });

  websiteInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addWebsite();
    }
  });

  redirectInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      setRedirectSite();
    }
  });

  function setRedirectSite() {
    const url = redirectInput.value.trim();
    if (url) {
      // Validate URL format
      try {
        new URL(url);
        chrome.storage.sync.set({ redirectSite: url }, function () {
          redirectInput.value = "";
          loadRedirectSite();
        });
      } catch (error) {
        alert("Please enter a valid URL (e.g., https://www.google.com)");
      }
    }
  }

  function loadRedirectSite() {
    chrome.storage.sync.get(["redirectSite"], function (result) {
      const redirectSite = result.redirectSite || "https://www.google.com";
      currentRedirect.textContent = redirectSite;
      redirectInput.value = redirectSite;
    });
  }

  function addWebsite() {
    const url = websiteInput.value.trim().toLowerCase();
    if (url) {
      chrome.storage.sync.get(["blockedSites"], function (result) {
        const blockedSites = result.blockedSites || [];
        if (!blockedSites.includes(url)) {
          blockedSites.push(url);
          chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
            websiteInput.value = "";
            loadBlockedWebsites();
          });
        }
      });
    }
  }

  function loadBlockedWebsites() {
    chrome.storage.sync.get(["blockedSites"], function (result) {
      const blockedSites = result.blockedSites || [];
      blockedList.innerHTML = "";

      blockedSites.forEach(function (site) {
        const li = document.createElement("li");
        li.className = "blocked-item";

        const span = document.createElement("span");
        span.textContent = site;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "remove-btn";
        removeButton.onclick = function () {
          removeWebsite(site);
        };

        li.appendChild(span);
        li.appendChild(removeButton);
        blockedList.appendChild(li);
      });
    });
  }

  function removeWebsite(site) {
    chrome.storage.sync.get(["blockedSites"], function (result) {
      const blockedSites = result.blockedSites || [];
      const index = blockedSites.indexOf(site);
      if (index > -1) {
        blockedSites.splice(index, 1);
        chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
          loadBlockedWebsites();
        });
      }
    });
  }
});
