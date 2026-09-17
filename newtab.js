// Check if this is the very first tab opened since Chrome started
chrome.storage.session.get(["startupFired"], (sessionResult) => {
  if (!sessionResult.startupFired) {
    // Mark startup as complete for the duration of this browsing session
    chrome.storage.session.set({ startupFired: true }, () => {
      // Fetch saved URLs and redirect
      chrome.storage.local.get(["savedUrls"], (localResult) => {
        const urls = localResult.savedUrls;

        if (urls && urls.length > 0) {
          const randomIndex = Math.floor(Math.random() * urls.length);
          window.location.replace(urls[randomIndex]);
        }
      });
    });
  }
  // If startupFired IS true, the script does nothing.
  // The page remains on the black newtab.html.
});
