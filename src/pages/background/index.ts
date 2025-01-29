import { AuthManager } from "./services/AuthManager";
import { JobStorage } from "./services/JobStorage";

const defaultPage = chrome.runtime.getURL("src/pages/panel/index.html");
const jobDetilsPage = chrome.runtime.getURL("src/pages/jobDetails/index.html");
const jobLoadingPage = chrome.runtime.getURL(
  "src/pages/jobPageSkeleton/index.html"
);

let jobData = {};

// Open the side panel when the extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.log("Failed to set side panel behavior:", error));

// Open the side panel when the content script sends a message
chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
  if (message.action === "openSidePanel" && sender.tab && sender.tab.id) {
    chrome.sidePanel.open({ tabId: sender.tab.id });
  }
});

//Auth sync
chrome.runtime.onMessageExternal.addListener(
  async (request, _sender, sendResponse) => {
    if (request.type === "LOGIN_SUCCESS") {
      await AuthManager.setLoginStatus(true);
      chrome.sidePanel.setOptions({
        path: defaultPage,
        enabled: true,
      });
      sendResponse({ status: "success" });
      return true;
    }

    if (request.type === "LOGOUT_SUCCESS") {
      await AuthManager.setLoginStatus(false);
      chrome.sidePanel.setOptions({
        path: defaultPage,
        enabled: true,
      });
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
        async (response) => {
          console.log(response, "response from content script");
          chrome.sidePanel.setOptions({
            path: jobDetilsPage,
            enabled: true,
            tabId: tabId,
          });
          const isExists = await JobStorage.exists(response.data.id);
          jobData = {
            ...response,
            isExists: isExists.exists,
            jobState: isExists.state,
          };
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

//send jobData to jobDetails page
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "getJobData") {
    sendResponse(jobData);
    return true;
  }
});

//Save and Unsave
chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
  if (message.type === "saveJob") {
    await JobStorage.addJob(message.job);
    sendResponse({
      jobId: message.jobId,
      success: true,
      message: "Added job successfully",
    });
    return true;
  }
  if (message.type === "deleteJob") {
    JobStorage.deleteJob(message.jobId)
      .then(() => {
        sendResponse({
          jobId: message.jobId,
          success: true,
          message: "Deleted job successfully",
        });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

//GET & UPDATE job
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "getJobs") {
    JobStorage.getData()
      .then((response) => {
        sendResponse({
          success: true,
          data: response.data.slice(-5).reverse(),
        });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  if (message.type === "updateJob") {
    JobStorage.updateJob(message.jobId, message.updatedJob)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async response
  }
});
