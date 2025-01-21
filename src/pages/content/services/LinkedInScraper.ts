export class LinkedInScraper {
    static async extractJobTitle(): Promise<{ jobTitle: string | null }> {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const titleContainer = document.querySelector(
            ".job-details-jobs-unified-top-card__job-title"
          );
          if (titleContainer) {
            clearInterval(interval);
            const jobTitleElement = titleContainer.querySelector(
              "h1.t-24.t-bold.inline a"
            );
            if (jobTitleElement instanceof HTMLElement) {
              resolve({ jobTitle: jobTitleElement.innerText });
            } else {
              resolve({ jobTitle: null });
            }
          }
        }, 100);
      });
    }
  
    static async extractLocation(): Promise<{ location: string | null }> {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const locationContainer = document.querySelector(
            ".job-details-jobs-unified-top-card__primary-description-container .tvm__text--low-emphasis"
          );
          if (locationContainer) {
            clearInterval(interval);
            if (locationContainer instanceof HTMLElement) {
              const locationText = locationContainer.innerText.trim();
              resolve({ location: locationText });
            } else {
              resolve({ location: null });
            }
          }
        }, 100);
      });
    }
  
    static async extractCompanyInfo(): Promise<{
      companyName: string | null;
      logoSrc: string | null;
    }> {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const companyContainer = document.querySelector(
            ".relative.job-details-jobs-unified-top-card__container--two-pane"
          );
          if (companyContainer) {
            clearInterval(interval);
  
            // Get company name
            const companyNameElement = companyContainer.querySelector(
              ".job-details-jobs-unified-top-card__company-name a"
            );
            const companyName = companyNameElement instanceof HTMLElement
              ? companyNameElement.innerText
              : null;
  
            // Get company logo image source
            const logoImageElement = companyContainer.querySelector(
              ".ivm-image-view-model img"
            ) as InstanceType<typeof HTMLImageElement>;
            const logoSrc = logoImageElement ? logoImageElement.src : null;
  
            resolve({ companyName, logoSrc });
          }
        }, 100);
      });
    }
  
    static extractJobDescription(): Promise<string> {
      return new Promise((resolve, reject) => {
        const interval = 100; // Check every 100ms
        const timeout = 5000; // Timeout after 5 seconds
        const startTime = Date.now();
  
        const intervalId = setInterval(() => {
          const element = document.querySelector(
            ".jobs-description-content__text--stretch"
          );
  
          if (element instanceof HTMLElement) {
            clearInterval(intervalId);
  
            // Extract raw HTML
            const rawHTML = element.innerHTML;
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = rawHTML;
  
            // Remove unwanted elements (optional, customize as needed)
            tempDiv.querySelectorAll("script, style, iframe").forEach((el) => {
              el.remove(); // Remove scripts, styles, or other unnecessary elements
            });
  
            // Return the cleaned HTML
            resolve(tempDiv.innerHTML.trim());
          }
  
          if (Date.now() - startTime > timeout) {
            clearInterval(intervalId);
            reject(new Error("Timeout: Unable to find the job details element."));
          }
        }, interval);
      });
    }
  
    static async scrapeJobData(): Promise<{
      jobTitle: string | null;
      location: string | null;
      companyName: string | null;
      logoSrc: string | null;
      jobDescription: string;
    }> {
      try {
        const { jobTitle } = await this.extractJobTitle();
        const { location } = await this.extractLocation();
        const { companyName, logoSrc } = await this.extractCompanyInfo();
        const jobDescription = await this.extractJobDescription();
  
        return {
          jobTitle,
          location,
          companyName,
          logoSrc,
          jobDescription,
        };
      } catch (error) {
        console.error(error);
        return {
          jobTitle: null,
          location: null,
          companyName: null,
          logoSrc: null,
          jobDescription: '',
        };
      }
    }
  }
  