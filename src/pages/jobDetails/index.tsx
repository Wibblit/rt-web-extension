import React from 'react';
import { createRoot } from 'react-dom/client';
import '@assets/styles/tailwind.css';
import JobDetails from './JobDetails';

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Panel root element");
  const root = createRoot(rootContainer);
  root.render(<div className="bg-background text-primary h-full w-full">
    <JobDetails />
  </div>);
}

init();
