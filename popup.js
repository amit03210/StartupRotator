document.addEventListener("DOMContentLoaded", () => {
  const urlListTextarea = document.getElementById("urlList");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  // Load existing URLs from Chrome storage
  chrome.storage.local.get(["savedUrls"], (result) => {
    if (result.savedUrls) {
      urlListTextarea.value = result.savedUrls.join("\n");
    }
  });

  // Save URLs when the button is clicked
  saveBtn.addEventListener("click", () => {
    const lines = urlListTextarea.value.split("\n");

    const urls = lines
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const validUrls = urls.map((url) => {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return "https://" + url;
      }
      return url;
    });

    chrome.storage.local.set({ savedUrls: validUrls }, () => {
      statusDiv.style.display = "block";
      setTimeout(() => {
        statusDiv.style.display = "none";
      }, 2000);
    });
  });
});
