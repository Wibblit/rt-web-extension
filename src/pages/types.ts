export type JobState =
  | "bookmark"
  | "applied"
  | "shortlisted"
  | "interviewing"
  | "negotiation";

export interface Job {
  id: string;
  jobTitle: string;
  location: string;
  companyName: string;
  logoSrc: string;
  jobDescription: string;
  employmentType: string;
  workType: string;
  salaryRange: string;
  state: JobState;
  addedOn: string;
  url: URL;
}

export interface Data {
  isChanged: boolean;
  data: Job[];
}
