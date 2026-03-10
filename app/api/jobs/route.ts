import { NextRequest, NextResponse } from "next/server";
import {
  getJobs,
  getCompanies,
  getLocations,
  createJob,
  updateJob,
  updateJobStatus,
  duplicateJob,
  deleteJob,
  addQuestion,
  deleteQuestion,
  createCompany,
  createLocation,
} from "@/lib/actions/jobs.server";
import type { JobStatus, QuestionFormat } from "@/types/jobs";

export async function GET() {
  const [jobsResult, companiesResult, locationsResult] = await Promise.all([
    getJobs(),
    getCompanies(),
    getLocations(),
  ]);

  if (jobsResult.error) {
    return NextResponse.json(
      { error: jobsResult.error, jobs: [], companies: [], locations: [] },
      { status: 500 }
    );
  }

  return NextResponse.json({
    jobs: jobsResult.data || [],
    companies: companiesResult.data || [],
    locations: locationsResult.data || [],
  });
}

export async function POST(request: NextRequest) {
  let body: { action: string; payload: Record<string, unknown> };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const { action, payload } = body;

  if (!action || typeof action !== "string") {
    return NextResponse.json({ error: "Acción no especificada" }, { status: 400 });
  }

  switch (action) {
    case "createJob": {
      const formData = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (key === "questions") {
          formData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }
      const result = await createJob(formData);
      return NextResponse.json(result, { status: result.error ? 400 : 200 });
    }

    case "updateJob": {
      const jobId = Number(payload.jobId);
      const formFields = payload.formData as Record<string, unknown> | undefined;
      if (!jobId || !formFields) {
        return NextResponse.json({ error: "jobId y formData son requeridos" }, { status: 400 });
      }
      const formData = new FormData();
      for (const [key, value] of Object.entries(formFields)) {
        if (key === "questions") {
          formData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }
      const result = await updateJob(jobId, formData);
      return NextResponse.json(result, { status: result.error ? 400 : 200 });
    }

    case "updateJobStatus": {
      const jobId = Number(payload.jobId);
      const status = payload.status as JobStatus;
      if (!jobId || !status) {
        return NextResponse.json({ error: "jobId y status son requeridos" }, { status: 400 });
      }
      const result = await updateJobStatus(jobId, status);
      return NextResponse.json(result, { status: result.error ? 400 : 200 });
    }

    case "duplicateJob": {
      const jobId = Number(payload.jobId);
      if (!jobId) {
        return NextResponse.json({ error: "jobId es requerido" }, { status: 400 });
      }
      const result = await duplicateJob(jobId);
      return NextResponse.json(result, { status: result.error ? 400 : 200 });
    }

    case "deleteJob": {
      const jobId = Number(payload.jobId);
      if (!jobId) {
        return NextResponse.json({ error: "jobId es requerido" }, { status: 400 });
      }
      const result = await deleteJob(jobId);
      return NextResponse.json(result, { status: result.error ? 400 : 200 });
    }

    case "addQuestion": {
      const jobId = Number(payload.jobId);
      const description = payload.description as string;
      const expected_format = (payload.expected_format as QuestionFormat) || "text";
      if (!jobId || !description) {
        return NextResponse.json({ error: "jobId y description son requeridos" }, { status: 400 });
      }
      const result = await addQuestion(jobId, description, expected_format);
      return NextResponse.json(result, { status: result.error ? 400 : 200 });
    }

    case "deleteQuestion": {
      const questionId = Number(payload.questionId);
      if (!questionId) {
        return NextResponse.json({ error: "questionId es requerido" }, { status: 400 });
      }
      const result = await deleteQuestion(questionId);
      return NextResponse.json(result, { status: result.error ? 400 : 200 });
    }

    case "createCompany": {
      const name = payload.name as string;
      if (!name) {
        return NextResponse.json({ error: "name es requerido" }, { status: 400 });
      }
      const result = await createCompany(name);
      return NextResponse.json(result, { status: result.error ? 400 : 200 });
    }

    case "createLocation": {
      const name = payload.name as string;
      if (!name) {
        return NextResponse.json({ error: "name es requerido" }, { status: 400 });
      }
      const result = await createLocation(name);
      return NextResponse.json(result, { status: result.error ? 400 : 200 });
    }

    default:
      return NextResponse.json({ error: `Acción desconocida: ${action}` }, { status: 400 });
  }
}
