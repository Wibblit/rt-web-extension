import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Briefcase,
  CircleDollarSign,
  MapPin as MapPinHouse,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import JobPageSkeleton from "./JobPageSkeleton";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import { Label } from "@src/components/ui/label";

type JobState =
  | "bookmark"
  | "applied"
  | "shortlisted"
  | "interviewing"
  | "negotiation";

interface Job {
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
  url: string | URL;
}

const DESCRIPTION_LIMIT = 1600; // Limit for the truncated description

function JobDetails() {
  const [job, setJob] = useState<Job | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isStateModified, setIsStateModified] = useState(false); // Track if state is modified

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function getJobData() {
      chrome.runtime.sendMessage({ type: "getJobData" }, (response) => {
        setJob({ ...response.data, state: response.jobState ?? "bookmark" });
        setIsSaved(response.isExists);
        if (response.success) {
          clearInterval(intervalId);
        }
      });
    } 

    getJobData();
    intervalId = setInterval(getJobData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (!job) {
    return <JobPageSkeleton />;
  }

  const truncateDescription = (description: string) => {
    if (description.length <= DESCRIPTION_LIMIT) return description;
    return description.slice(0, DESCRIPTION_LIMIT) + "...";
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleSaveJob = async () => {
    setIsStateModified(false);
    setIsSaved(!isSaved);
    if (!isSaved) {
      chrome.runtime.sendMessage(
        {
          type: "saveJob",
          jobId: job.id,
          job: job,
        },
        (response) => {
          if (response.success) {
            setIsSaved(!isSaved);
            setIsStateModified(false); // Reset state modification flag
          }
        }
      );
    } else {
      chrome.runtime.sendMessage(
        {
          type: "deleteJob",
          jobId: job.id,
        },
        (response) => {
          if (response.success) {
            setIsSaved(!isSaved);
            setIsStateModified(false); // Reset state modification flag
          }
        }
      );
    }
  };

  const handleStateChange = (value: JobState) => {
    setJob((prevJob) => {
      if (prevJob && prevJob.state !== value) {
        setIsStateModified(true); // Set state modification flag
      }
      return { ...prevJob, state: value } as Job;
    });
  };

  const handleUpdateJob = async () => {
    if (!job) return;

    chrome.runtime.sendMessage(
      {
        type: "updateJob",
        jobId: job.id,
        updatedJob: { state: job.state },
      },
      (response) => {
        if (response.success) {
          setIsStateModified(false); // Reset state modification flag
        }
      }
    );
  };
  return (
    <div className="w-full h-full bg-background flex flex-col p-4">
      <Header />
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="space-y-4">
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
              <h1 className="text-base font-semibold leading-tight truncate">
                {job.jobTitle}
              </h1>
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
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              {job.employmentType ?? "Not specified"}
            </Badge>
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              <MapPinHouse className="h-3 w-3 mr-1" />
              {job.workType ?? "Not specified"}
            </Badge>
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              <CircleDollarSign className="h-3 w-3 mr-1" />
              {job.salaryRange ?? "Not specified"}
            </Badge>
          </div>
          <Separator className="my-2" />
          <div className="flex flex-col space-y-2 items-start">
            <Label className="text-sm font-medium" htmlFor="state">
              Application State
            </Label>
            <Select onValueChange={handleStateChange} value={job.state}>
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
          <Separator className="my-2" />
          <div className="space-y-2">
            <h2 className="text-sm font-medium">Job Description</h2>
            <div
              className="text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: showFullDescription
                  ? job.jobDescription
                  : truncateDescription(job.jobDescription),
              }}
            ></div>
            {job.jobDescription.length > DESCRIPTION_LIMIT && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDescription}
                className="flex items-center mt-2"
              >
                {showFullDescription ? (
                  <>
                    Read Less <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Read More <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 left-4 right-4 flex gap-2">
        {isSaved && isStateModified && (
          <Button
            className="flex-1"
            variant="default"
            onClick={handleUpdateJob}
          >
            Update Job
          </Button>
        )}
        <Button
          className="flex-1"
          variant={isSaved ? "secondary" : "default"}
          onClick={handleSaveJob}
        >
          {isSaved ? "Unsave Job" : "Save Job"}
        </Button>
      </div>
    </div>
  );
}

export default JobDetails;
