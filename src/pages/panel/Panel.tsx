"use client";

import { useState, useEffect } from "react";
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
import { Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { AuthManager } from "../background/services/AuthManager";

type JobState =
  | "bookmark"
  | "applied"
  | "shortlisted"
  | "interviewing"
  | "negotiation";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  state: JobState;
  location: string;
}

export function Panel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [newJob, setNewJob] = useState<Omit<Job, "id">>({
    title: "",
    company: "",
    description: "",
    state: "bookmark",
    location: "",
  });

  const isFormValid =
    newJob.title.trim() !== "" && newJob.company.trim() !== "";

  useEffect(() => {
    (async () => {
      const islogined = await AuthManager.checkAuthStatus()
      if (islogined) {
        await AuthManager.redirectIfNotLoggedIn();
        return;
      }
    })()
    const savedJobs = localStorage.getItem("jobs");
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }, [jobs]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const handleStateChange = (value: JobState) => {
    setNewJob({ ...newJob, state: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setJobs([...jobs, { ...newJob, id: Date.now().toString() }]);
    setNewJob({
      title: "",
      company: "",
      description: "",
      state: "bookmark",
      location: "",
    });
  };

  const handleDelete = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Header />
      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-8 my-4">
          {/* Job Title */}
          <div className="flex flex-col space-y-1.5 items-start">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Software Engineer"
              className="placeholder:text-sm"
              value={newJob.title}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Company */}
          <div className="flex flex-col space-y-1.5 items-start">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              placeholder="e.g., Google"
              value={newJob.company}
              className="placeholder:text-sm"
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Job Description */}
          <div className="flex flex-col space-y-1.5 items-start">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              name="description"
              className="placeholder:text-sm min-h-28"
              placeholder="Briefly describe the job role or key responsibilities"
              value={newJob.description}
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
        <h2 className="text-xl font-semibold mb-4 w-full text-center">
          Saved Jobs
        </h2>
        {jobs.map((job) => (
          <Card key={job.id} className="mb-4">
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>{job.company}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{job.description}</p>
              <p className="text-sm font-semibold mt-2">Status: {job.state}</p>
            </CardContent>
            <CardFooter className="flex justify-end pt-0">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(job.id)}
                className="hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
