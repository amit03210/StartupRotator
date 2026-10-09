function openRandomUrl(urls) {
  if (urls.length === 0) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * urls.length);
  chrome.tabs.create({ url: urls[randomIndex] }, () => {
    if (chrome.runtime.lastError) {
      console.error(
        "Failed to open a startup URL:",
        chrome.runtime.lastError.message,
      );
    }
  });
}

chrome.windows.onCreated.addListener((window) => {
  if (window.type !== "normal") {
    return;
  }

  chrome.storage.session.get(["startupFired"], (sessionResult) => {
    if (chrome.runtime.lastError) {
      console.error(
        "Failed to check browser startup state:",
        chrome.runtime.lastError.message,
      );
      return;
    }

    if (sessionResult.startupFired) {
      return;
    }

    chrome.storage.session.set({ startupFired: true }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Failed to save browser startup state:",
          chrome.runtime.lastError.message,
        );
        return;
      }

      chrome.storage.local.get(["savedUrls"], (localResult) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Failed to load startup URLs:",
            chrome.runtime.lastError.message,
          );
          return;
        }

        const savedUrls = localResult.savedUrls;
        if (Array.isArray(savedUrls) && savedUrls.length > 0) {
          openRandomUrl(savedUrls);
          return;
        }

        fetch(chrome.runtime.getURL("urlList.txt"))
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.text();
          })
          .then((text) => {
            const urls = text
              .split(/\r?\n/)
              .map((url) => url.trim())
              .filter((url) => url.length > 0);
            openRandomUrl(urls);
          })
          .catch((error) => {
            console.error("Failed to load URLs from urlList.txt:", error);
          });
      });
    });
  });
});

chrome.windows.onRemoved.addListener(() => {
  chrome.windows.getAll((windows) => {
    if (windows.length === 0) {
      chrome.storage.session.remove(["startupFired"]);
    }
  });
});
