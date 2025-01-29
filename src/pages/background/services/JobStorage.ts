import { Data, Job } from "@src/pages/types";

export class JobStorage {
  private static storageKey: string = "jobData";

  // Get data from Chrome storage
  static async getData(): Promise<Data> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([this.storageKey], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[this.storageKey] || { isChanged: false, data: [] });
        }
      });
    });
  }

  // Save data to Chrome storage
  private static async saveData(data: Data): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [this.storageKey]: data }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  // Check if a job exists by ID
  static async exists(jobId: string): Promise<{ exists: boolean; state?: string }> {
    const currentData = await this.getData();
    const job = currentData.data.find((job) => job.id === jobId);
  
    if (job) {
      return { exists: true, state: job.state }; // Return the job's state if it exists
    } else {
      return { exists: false, state: undefined }; // Return false if the job doesn't exist
    }
  }

  // Add a new job to the data if it doesn't already exist
  static async addJob(job: Job): Promise<void> {
    const currentData = await this.getData();
    const jobExists = await this.exists(job.id);

    if (jobExists.exists) {
      throw new Error(`Job with ID ${job.id} already exists.`);
    }

    currentData.data.push(job);
    currentData.isChanged = true;
    await this.saveData(currentData);
  }

  // Update an existing job by ID
  static async updateJob(
    jobId: string,
    updatedJob: Partial<Job>
  ): Promise<void> {
    const currentData = await this.getData();
    const jobIndex = currentData.data.findIndex((job) => job.id === jobId);

    if (jobIndex !== -1) {
      currentData.data[jobIndex] = {
        ...currentData.data[jobIndex],
        ...updatedJob,
      };
      currentData.isChanged = true;
      await this.saveData(currentData);
    } else {
      throw new Error(`Job with ID ${jobId} not found.`);
    }
  }

  // Delete a job by ID
  static async deleteJob(jobId: string): Promise<void> {
    const currentData = await this.getData();
    const updatedData = currentData.data.filter((job) => job.id !== jobId);

    if (updatedData.length !== currentData.data.length) {
      currentData.data = updatedData;
      currentData.isChanged = true;
      await this.saveData(currentData);
    } else {
      throw new Error(`Job with ID ${jobId} not found.`);
    }
  }

  // Set isChanged to true
  static async setIsChanged(): Promise<void> {
    const currentData = await this.getData();
    currentData.isChanged = true;
    await this.saveData(currentData);
  }

  // Set isChanged to false
  static async unsetIsChanged(): Promise<void> {
    const currentData = await this.getData();
    currentData.isChanged = false;
    await this.saveData(currentData);
  }

  // Clear all data
  static async clearData(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(this.storageKey, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}

