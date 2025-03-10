document.addEventListener("DOMContentLoaded", function () {
  const websiteInput = document.getElementById("websiteInput");
  const addButton = document.getElementById("addButton");
  const blockedList = document.getElementById("blockedList");

  // Load blocked websites when popup opens
  loadBlockedWebsites();

  addButton.addEventListener("click", function () {
    addWebsite();
  });

  websiteInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addWebsite();
    }
  });

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
