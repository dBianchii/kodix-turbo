"use client";

import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@kdx/ui/dialog";

const LogsContent = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold">Task Logs</h2>
    <ul className="list-disc space-y-2 pl-5">
      <li>Task created - 2023-05-01 09:00</li>
      <li>Status updated to "In Progress" - 2023-05-02 14:30</li>
      <li>Comment added by John: "Let's prioritize this" - 2023-05-03 11:15</li>
      <li>Attachment uploaded: "requirements.pdf" - 2023-05-04 16:45</li>
      <li>Deadline extended to 2023-05-15 - 2023-05-05 10:00</li>
      <li>New subtask added: "Review final output" - 2023-05-06 09:30</li>
      <li>Status updated to "Under Review" - 2023-05-07 14:00</li>
    </ul>
  </div>
);

const EditTaskContent = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold">Edit Task</h2>
    <div>
      <label
        htmlFor="task-name"
        className="block text-sm font-medium text-gray-700"
      >
        Task Name
      </label>
      <input
        type="text"
        id="task-name"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        placeholder="Enter task name"
      />
    </div>
    <div>
      <label
        htmlFor="task-description"
        className="block text-sm font-medium text-gray-700"
      >
        Description
      </label>
      <textarea
        id="task-description"
        rows={3}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        placeholder="Enter task description"
      ></textarea>
    </div>
    <div>
      <label
        htmlFor="task-status"
        className="block text-sm font-medium text-gray-700"
      >
        Status
      </label>
      <select
        id="task-status"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      >
        <option>Not Started</option>
        <option>In Progress</option>
        <option>Under Review</option>
        <option>Completed</option>
      </select>
    </div>
    <Button>Save Changes</Button>
  </div>
);

export function ExpandableDialog() {
  const [mode, setMode] = useState<"logs" | "edit">("logs");
  const [contentRef] = useAutoAnimate<HTMLDivElement>({
    duration: 300,
    easing: "ease-in-out",
  });

  const toggleMode = () => {
    setMode(mode === "logs" ? "edit" : "logs");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent
        className={cn("overflow-hidden", {
          "max-w-[650px]": mode === "logs",
        })}
      >
        <div>
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {mode === "logs" ? "Task Logs" : "Edit Task"}
              </h3>
              <Button onClick={toggleMode} size="sm">
                {mode === "logs" ? "Edit Task" : "View Logs"}
              </Button>
            </div>
            <div ref={contentRef}>
              {mode === "logs" ? <LogsContent /> : <EditTaskContent />}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
