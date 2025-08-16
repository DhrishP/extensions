document.addEventListener("DOMContentLoaded", function () {
  const websiteInput = document.getElementById("websiteInput");
  const addButton = document.getElementById("addButton");
  const blockedList = document.getElementById("blockedList");
  const redirectInput = document.getElementById("redirectInput");
  const addRedirectButton = document.getElementById("addRedirectButton");
  const redirectList = document.getElementById("redirectList");

  // Load data when popup opens
  loadBlockedWebsites();
  loadRedirectSites();

  // Add smooth entrance animation
  animateEntrance();

  addButton.addEventListener("click", function () {
    addWebsite();
  });

  addRedirectButton.addEventListener("click", function () {
    addRedirectSite();
  });

  websiteInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addWebsite();
    }
  });

  redirectInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addRedirectSite();
    }
  });

  // Add focus effects
  [websiteInput, redirectInput].forEach(input => {
    input.addEventListener("focus", function() {
      this.parentElement.style.transform = "scale(1.02)";
    });
    
    input.addEventListener("blur", function() {
      this.parentElement.style.transform = "scale(1)";
    });
  });

  function animateEntrance() {
    const elements = document.querySelectorAll('.redirect-section, .blocked-sites');
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  function addRedirectSite() {
    const url = redirectInput.value.trim();
    if (url) {
      // Validate URL format
      try {
        new URL(url);
        chrome.storage.sync.get(["redirectSites"], function (result) {
          const redirectSites = result.redirectSites || ["https://www.google.com"];
          if (!redirectSites.includes(url)) {
            redirectSites.push(url);
            chrome.storage.sync.set({ redirectSites: redirectSites }, function () {
              redirectInput.value = "";
              loadRedirectSites();
              showSuccessMessage("Redirect site added successfully!");
            });
          } else {
            showErrorMessage("This redirect site is already in your list!");
          }
        });
      } catch (error) {
        showErrorMessage("Please enter a valid URL (e.g., https://www.google.com)");
      }
    }
  }

  function loadRedirectSites() {
    chrome.storage.sync.get(["redirectSites"], function (result) {
      const redirectSites = result.redirectSites || ["https://www.google.com"];
      redirectList.innerHTML = "";

      redirectSites.forEach(function (site) {
        const li = document.createElement("li");
        li.className = "redirect-item";

        const span = document.createElement("span");
        span.textContent = site;

        const removeButton = document.createElement("button");
        removeButton.innerHTML = '<i class="fas fa-trash"></i>';
        removeButton.className = "remove-btn";
        removeButton.title = "Remove redirect site";
        removeButton.onclick = function () {
          removeRedirectSite(site);
        };

        li.appendChild(span);
        li.appendChild(removeButton);
        redirectList.appendChild(li);
      });
    });
  }

  function removeRedirectSite(site) {
    chrome.storage.sync.get(["redirectSites"], function (result) {
      const redirectSites = result.redirectSites || ["https://www.google.com"];
      // Don't allow removing the last redirect site
      if (redirectSites.length <= 1) {
        showErrorMessage("You must have at least one redirect site!");
        return;
      }
      
      const index = redirectSites.indexOf(site);
      if (index > -1) {
        redirectSites.splice(index, 1);
        chrome.storage.sync.set({ redirectSites: redirectSites }, function () {
          loadRedirectSites();
          showSuccessMessage("Redirect site removed successfully!");
        });
      }
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
            showSuccessMessage("Website blocked successfully!");
          });
        } else {
          showErrorMessage("This website is already blocked!");
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
        removeButton.innerHTML = '<i class="fas fa-trash"></i>';
        removeButton.className = "remove-btn";
        removeButton.title = "Remove blocked website";
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
          showSuccessMessage("Website unblocked successfully!");
        });
      }
    });
  }

  function showSuccessMessage(message) {
    showMessage(message, 'success');
  }

  function showErrorMessage(message) {
    showMessage(message, 'error');
  }

  function showMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement("div");
    messageEl.className = `message-toast ${type}`;
    messageEl.textContent = message;
    
    // Add styles
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 12px;
      color: white;
      font-size: 13px;
      font-weight: 500;
      z-index: 1000;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;

    if (type === 'success') {
      messageEl.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else {
      messageEl.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    }

    document.body.appendChild(messageEl);

    // Animate in
    setTimeout(() => {
      messageEl.style.transform = 'translateX(0)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        messageEl.remove();
      }, 300);
    }, 3000);
  }
});
