chrome.storage.local.get(["savedUrls"], (result) => {
  const urls = result.savedUrls;

  if (urls && urls.length > 0) {
    const randomIndex = Math.floor(Math.random() * urls.length);
    // Replace the current blank startup page with the random URL
    window.location.replace(urls[randomIndex]);
  } else {
    // Only shows if you haven't saved any URLs yet
    document.body.innerHTML =
      '<p style="font-family: Arial; padding: 20px;">Please click the extension icon to add your startup URLs.</p>';
  }
});
