"use client";

import type { JobStatus, QuestionFormat } from "@/lib/types/jobs";

async function post(action: string, payload: Record<string, unknown>) {
  const res = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  return res.json();
}

export const createJobClient = (payload: Record<string, unknown>) => post("createJob", payload);

export const updateJobClient = (jobId: number, formData: Record<string, unknown>) =>
  post("updateJob", { jobId, formData });

export const createCompanyClient = (name: string) => post("createCompany", { name });

export const createLocationClient = (name: string) => post("createLocation", { name });

export const updateJobStatusClient = (jobId: number, status: JobStatus) =>
  post("updateJobStatus", { jobId, status });

export const duplicateJobClient = (jobId: number) => post("duplicateJob", { jobId });

export const deleteJobClient = (jobId: number) => post("deleteJob", { jobId });

export const addQuestionClient = (jobId: number, description: string, expected_format: QuestionFormat) =>
  post("addQuestion", { jobId, description, expected_format });

export const deleteQuestionClient = (questionId: number) => post("deleteQuestion", { questionId });

export const fetchJobsDataClient = async () => {
  const res = await fetch("/api/jobs", { method: "GET" });
  return res.json();
};
