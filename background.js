function openNextUrlInDailyCycle(urls) {
  if (urls.length === 0) {
    return;
  }

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const urlListKey = JSON.stringify(urls);

  chrome.storage.local.get(["dailyUrlCycle"], (result) => {
    if (chrome.runtime.lastError) {
      console.error(
        "Failed to load the daily URL cycle:",
        chrome.runtime.lastError.message,
      );
      return;
    }

    const cycle = result.dailyUrlCycle;
    const usedIndices =
      cycle &&
      cycle.date === today &&
      cycle.urlListKey === urlListKey &&
      Array.isArray(cycle.usedIndices)
        ? [...new Set(
            cycle.usedIndices.filter(
              (index) =>
                Number.isInteger(index) && index >= 0 && index < urls.length,
            ),
          )]
        : [];
    const availableIndices = urls
      .map((_, index) => index)
      .filter((index) => !usedIndices.includes(index));
    const choices =
      availableIndices.length > 0
        ? availableIndices
        : urls.map((_, index) => index);
    const randomIndex = choices[Math.floor(Math.random() * choices.length)];
    const nextUsedIndices =
      availableIndices.length > 0 ? [...usedIndices, randomIndex] : [randomIndex];

    chrome.storage.local.set(
      {
        dailyUrlCycle: {
          date: today,
          urlListKey,
          usedIndices: nextUsedIndices,
        },
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Failed to save the daily URL cycle:",
            chrome.runtime.lastError.message,
          );
          return;
        }

        chrome.tabs.create({ url: urls[randomIndex] }, () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Failed to open a startup URL:",
              chrome.runtime.lastError.message,
            );
          }
        });
      },
    );
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
          openNextUrlInDailyCycle(savedUrls);
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
            openNextUrlInDailyCycle(urls);
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
