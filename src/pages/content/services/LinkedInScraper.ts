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

  /**
   * Extracts the jobId from the current LinkedIn job URL.
   * @returns {Promise<{ jobId: string | null }>} The jobId or null if not found.
   */
  static async extractJobId(): Promise<{ jobId: string | null }> {
    return new Promise((resolve) => {
      const currentUrl = window.location.href;

      try {
        const url = new URL(currentUrl);

        // Check if the URL is a LinkedIn job search or view URL
        if (
          url.pathname === "/jobs/search/" ||
          url.pathname === "/jobs/view/"
        ) {
          const jobId = url.searchParams.get("currentJobId");
          resolve({ jobId: jobId + "-linkedin" });
        } else {
          resolve({ jobId: null });
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
        resolve({ jobId: null });
      }
    });
  }

  static async extractEmploymentDetails(): Promise<{
    employmentType: string | null;
    workType: string | null;
    salaryRange: string | null;
  }> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const jobDetailsContainer = document.querySelectorAll(
          ".job-details-preferences-and-skills__pill span[aria-hidden='true'], .job-details-preferences-and-skills__pill span"
        );

        if (jobDetailsContainer.length > 0) {
          clearInterval(interval);

          let employmentType: string | null = null;
          let workType: string | null = null;
          let salaryRange: string | null = null;

          jobDetailsContainer.forEach((detail) => {
            if (detail instanceof HTMLElement) {
              const textContent = detail.innerText.trim();

              // Extract key terms instead of entire sentences
              if (
                textContent === "Full-time" ||
                textContent === "Part-time" ||
                textContent === "Internship"
              ) {
                employmentType = textContent;
              }

              if (
                textContent === "On-site" ||
                textContent === "Remote" ||
                textContent === "Hybrid"
              ) {
                workType = textContent;
              }

              // Identify salary range with dynamic formats
              if (
                /^[^\d]*\d+([.,]?\d+)?[^\d]*-\s?[^\d]*\d+([.,]?\d+)?[^\d]*(\/(yr|month|week|day|hr))?$/i.test(
                  textContent
                )
              ) {
                salaryRange = textContent;
              }
            }
          });

          resolve({ employmentType, workType, salaryRange });
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
          const companyName =
            companyNameElement instanceof HTMLElement
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

          // Remove specific unwanted text or elements
          const feedbackElement = tempDiv.querySelector(
            ".artdeco-inline-feedback"
          );
          if (feedbackElement) {
            feedbackElement.remove(); // Remove the "This job is sourced from a job board" section
          }

          // Remove "About the job" text if present
          const aboutJobHeader = tempDiv.querySelector("h2.text-heading-large");
          if (
            aboutJobHeader &&
            aboutJobHeader.textContent?.trim() === "About the job"
          ) {
            aboutJobHeader.remove();
          }

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
    id: string | null;
    jobTitle: string | null;
    location: string | null;
    companyName: string | null;
    logoSrc: string | null;
    jobDescription: string;
    employmentType: string | null;
    workType: string | null;
    salaryRange: string | null;
  }> {
    try {
      const { jobTitle } = await this.extractJobTitle();
      const { location } = await this.extractLocation();
      const { companyName, logoSrc } = await this.extractCompanyInfo();
      const jobDescription = await this.extractJobDescription();
      const { employmentType, workType, salaryRange } =
        await this.extractEmploymentDetails();
      const { jobId } = await this.extractJobId();

      return {
        id: jobId,
        jobTitle,
        location,
        companyName,
        logoSrc,
        jobDescription,
        employmentType,
        workType,
        salaryRange,
      };
    } catch (error) {
      console.error(error);
      return {
        jobTitle: null,
        location: null,
        companyName: null,
        logoSrc: null,
        jobDescription: "",
        employmentType: null,
        workType: null,
        salaryRange: null,
        id: null,
      };
    }
  }
}
