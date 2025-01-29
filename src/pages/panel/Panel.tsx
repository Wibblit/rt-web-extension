"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, MapPin, Trash2, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import { AuthManager } from "../background/services/AuthManager";
import { Job, JobState } from "../types";
import { Avatar } from "@src/components/ui/avatar";

export function Panel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [newJob, setNewJob] = useState<Job>({
    id: uuidv4() + "-manual",
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    state: "bookmark",
    location: "",
    logoSrc: "",
    employmentType: "",
    workType: "",
    salaryRange: "",
  });

  const isFormValid =
    newJob.jobTitle.trim() !== "" && newJob.companyName.trim() !== "";

  useEffect(() => {
    (async () => {
      const isLoggedIn = await AuthManager.checkAuthStatus();
      if (!isLoggedIn) {
        await AuthManager.redirectIfNotLoggedIn();
        return;
      }
    })();

    async function getRecentJobs() {
      chrome.runtime.sendMessage({ type: "getJobs" }, (response) => {
        if (response.success) {
          // Only show the 5 most recent jobs
          setJobs(response.data.slice(0, 5));
        }
      });
    }
    getRecentJobs();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const handleStateChange = (value: JobState) => {
    setNewJob({ ...newJob, state: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const jobToSave: Job = { ...newJob };

    chrome.runtime.sendMessage({
      type: "saveJob",
      job: jobToSave,
      jobId: jobToSave.id,
      save: true,
    });
    setJobs([jobToSave, ...jobs].slice(0, 5));
    setNewJob({
      id: uuidv4() + "-manual",
      jobTitle: "",
      companyName: "",
      jobDescription: "",
      state: "bookmark",
      location: "",
      logoSrc: "",
      employmentType: "",
      workType: "",
      salaryRange: "",
    });
  };

  const handleDelete = async (id: string) => {
    chrome.runtime.sendMessage({
      type: "deleteJob",
      jobId: id,
    });
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Header />
      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-8 my-4">
          {/* Job Title */}
          <div className="flex flex-col space-y-1.5 items-start">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              placeholder="e.g., Software Engineer"
              className="placeholder:text-sm"
              value={newJob.jobTitle}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Company */}
          <div className="flex flex-col space-y-1.5 items-start">
            <Label htmlFor="companyName">Company</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="e.g., Google"
              value={newJob.companyName}
              className="placeholder:text-sm"
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Job Description */}
          <div className="flex flex-col space-y-1.5 items-start">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              name="jobDescription"
              className="placeholder:text-sm min-h-28"
              placeholder="Briefly describe the job role or key responsibilities"
              value={newJob.jobDescription}
              onChange={handleInputChange}
            />
          </div>

          {/* Location */}
          <div className="flex flex-col space-y-1.5 items-start">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., San Francisco, CA"
              value={newJob.location}
              className="placeholder:text-sm"
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Application State */}
          <div className="flex flex-col space-y-1.5 items-start">
            <Label htmlFor="state">Application State</Label>
            <Select onValueChange={handleStateChange} value={newJob.state}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="bookmark">Bookmark</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>

      <Button
        type="submit"
        className="w-full my-4"
        onClick={handleSubmit}
        disabled={!isFormValid}
      >
        Save Job
      </Button>

      <div className="mt-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Jobs</h2>
          <a
            href="https://jobtrackr.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            View All Jobs
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </div>

        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="relative group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 flex items-center justify-center bg-gray-100">
                    {job.logoSrc ? (
                      <img
                        src={job.logoSrc}
                        alt={`${job.companyName} logo`}
                        className="object-cover h-full w-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Building2 className="h-5 w-5 text-gray-500" />
                    )}
                  </Avatar>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-medium leading-none truncate">
                      {job.jobTitle}
                    </h3>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="truncate">{job.companyName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                    onClick={() => handleDelete(job.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardFooter className="pt-0 pb-3">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {job.state}
                </span>
              </CardFooter>
            </Card>
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No jobs saved yet. Start by adding your first job application!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}