/**
 * Unified jobs actions file
 * Re-exports server-side and client-side functions
 */

// Export all types from server
export type {
  JobStatus,
  CompanyData,
  LocationData,
  PositionData,
  QuestionData,
  QuestionFormat,
  JobData,
} from '@/types/jobs';

// Export server actions
export {
  getJobs,
  getJobById,
  getCompanies,
  getLocations,
  getPositions,
  createJob,
  updateJob,
  updateJobStatus,
  duplicateJob,
  deleteJob,
  addQuestion,
  deleteQuestion,
  createCompany,
  createLocation,
  createPosition,
} from './jobs.server';

// Export client actions
export {
  createJobClient,
  updateJobClient,
  createCompanyClient,
  createLocationClient,
  updateJobStatusClient,
  duplicateJobClient,
  deleteJobClient,
  addQuestionClient,
  deleteQuestionClient,
  fetchJobsDataClient,
} from './jobs.client';
