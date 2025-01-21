const defaultPage = chrome.runtime.getURL("src/pages/panel/index.html");
const jobDetilsPage = chrome.runtime.getURL("src/pages/jobDetails/index.html");
const jobLoadingPage = chrome.runtime.getURL("src/pages/jobPageSkeleton/index.html");

let loginStatus = false;
let jobData = {};   

// Open the side panel when the extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.log(error));

// Open the side panel when the content script sends a message
chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
  if (message.action === "openSidePanel" && sender.tab && sender.tab.id) {
    chrome.sidePanel.open({ tabId: sender.tab.id });
  }
});

//Auth sync
chrome.runtime.onMessageExternal.addListener(
  (request, _sender, sendResponse) => {
    if (request.type === "LOGIN_SUCCESS") {
      loginStatus = true;
      sendResponse({ status: "success" });
      return true;
    }

    if (request.type === "LOGOUT_SUCCESS") {
      loginStatus = false;
      sendResponse({ status: "success" });
      return true;
    }
    sendResponse({ status: "unknown" });
  }
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.status) return;
  if (
    tab.url &&
    (tab.url.includes("linkedin.com/jobs/search/") ||
      tab.url.includes("linkedin.com/jobs/view/"))
  ) {
    if (changeInfo.status === "complete") {
      // Send a message to the content script
      chrome.tabs.sendMessage(
        tabId,
        { action: "scrapeJobData" },
        (response) => {
          console.log(response, "response from content script");
          chrome.sidePanel.setOptions({
            path: jobDetilsPage,
            enabled: true,
            tabId: tabId,
          });
          jobData = response;
        }
      );
    } else if (changeInfo.status === "loading") {
      // Show loading page during intermediate state
      chrome.sidePanel.setOptions({
        path: jobLoadingPage,
        enabled: true,
        tabId: tabId,
      });
    }
  } else {
    // Handle non-LinkedIn pages or default case
    if (changeInfo.status === "complete") {
      chrome.sidePanel.setOptions({
        path: defaultPage,
        enabled: true,
        tabId: tabId,
      });
    }
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "getJobData") {
    sendResponse(jobData);
  }
});
