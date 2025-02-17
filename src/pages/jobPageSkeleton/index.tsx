import React from "react";
import Header from "@src/components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { createRoot } from "react-dom/client";
import "@assets/styles/tailwind.css";

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Panel root element");
  const root = createRoot(rootContainer);
  root.render(
    <div className="w-full h-full bg-background p-4">
      <Header />
      <div className="p-3 space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-3 w-[140px]" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}

init();
