import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getJobById } from '@/lib/actions/jobs.server';
import AplicarJobContent from './aplicar_job_content';

interface Props {
  params: Promise<{ jobId: string }>;
}

export default async function AplicarJobPage({ params }: Props) {
  const { jobId } = await params;
  const id = parseInt(jobId, 10);
  if (isNaN(id)) redirect('/buscar-empleos');

  const { user, profile } = await getCurrentUser();
  if (!user || !profile) redirect(`/login?returnUrl=/aplicar/${jobId}`);
  if (profile.user_role !== 'postulant') redirect('/buscar-empleos');

  const { data: job } = await getJobById(id);
  if (!job || job.status !== 'active') redirect('/buscar-empleos');

  return (
    <AplicarJobContent
      job={job}
      userName={profile.name}
      userEmail={user.email ?? ''}
    />
  );
}
