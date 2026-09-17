// Clear the flag on a hard browser startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.session.remove(["startupFired"]);
});

// Clear the flag when the last visible window is closed
// This fixes the issue where Chrome stays running in the background
chrome.windows.onRemoved.addListener(() => {
  chrome.windows.getAll((windows) => {
    if (windows.length === 0) {
      chrome.storage.session.remove(["startupFired"]);
    }
  });
});
