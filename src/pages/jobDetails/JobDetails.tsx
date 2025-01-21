import { useEffect, useState } from "react";
import { Building2, MapPin, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import JobPageSkeleton from "./JobPageSkeleton";
import { Avatar } from "@/components/ui/avatar";
import Header from "@/components/Header";

interface Job {
  jobTitle: string;
  location: string;
  companyName: string;
  logoSrc: string;
  jobDescription: string;
}

function JobDetails() {
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function getJobData() {
      chrome.runtime.sendMessage({ type: "getJobData" }, (response) => {
        setJob(response.data);
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

  return (
    <div className="w-full h-full bg-background flex flex-col p-4">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <img
                src={job.logoSrc || "https://via.placeholder.com/40"}
                alt={`${job.companyName} logo`}
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/40";
                }}
              />
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
          <div>
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              Full Time
            </Badge>
          </div>
          <Separator className="my-2" />
          <div className="space-y-2">
            <h2 className="text-sm font-medium">Job Description</h2>
            <div
              className="text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.jobDescription }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
