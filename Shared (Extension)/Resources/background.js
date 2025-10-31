chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  /*if (message.type === "checkPurchase") {
    try {
      // Try native messaging
      chrome.runtime.sendNativeMessage(
        "com.ulriklyngs.mind-shield",
        { action: "checkPurchase" }
      )
      .then(response => {
        if (response && response.paid !== undefined) {
          sendResponse({ paid: response.paid, reason: response.message || "Payment status checked" });
        } else {
          sendResponse({ paid: false, reason: "Invalid response" });
        }
      })
      .catch(err => {
        // Native messaging failed - return null to indicate no payment flow
        sendResponse(null);
      });
    } catch (err) {
      // Any other error - return null
      sendResponse(null);
    }
    
    return true; // Keep sendResponse async
  }*/
});
