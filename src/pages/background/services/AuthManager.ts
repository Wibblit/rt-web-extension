const loginPageUrl = chrome.runtime.getURL("src/pages/auth/index.html");

export class AuthManager {
  /**
   * Sets the login status in chrome.storage.local.
   * @param isLoggedIn - The login status to set (true or false).
   * @returns A Promise that resolves when the operation is complete.
   */
  static setLoginStatus(isLoggedIn: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ loginStatus: isLoggedIn }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error setting login status:",
            chrome.runtime.lastError
          );
          reject(chrome.runtime.lastError);
        } else {
          console.log(`Login status set to: ${isLoggedIn}`);
          resolve();
        }
      });
    });
  }

  /**
   * Retrieves the login status from chrome.storage.local.
   * @returns A Promise that resolves to the login status (true or false).
   */
  static checkAuthStatus(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get("loginStatus", (data) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error checking auth status:",
            chrome.runtime.lastError
          );
          reject(chrome.runtime.lastError);
        } else {
          resolve(data.loginStatus || false); // Default to false if not set
        }
      });
    });
  }

  /**
   * Redirects the user to the login page if they are not logged in.
   * @param tabId - The ID of the tab to redirect (optional).
   * @returns A Promise that resolves after checking the login status and performing the redirect if necessary.
   */
  static async redirectIfNotLoggedIn(): Promise<void> {
    const isLoggedIn = await this.checkAuthStatus();
    if (!isLoggedIn) {
      chrome.sidePanel.setOptions({
        path: loginPageUrl,
        enabled: true,
      });
    }
  }
}
