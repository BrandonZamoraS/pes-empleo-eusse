'use server';

import { createClient } from '@/lib/supabase/server';

export type CvType = 'general' | 'job_specific';

export interface GeneralCvData {
  id: number;
  user_id: string;
  cv_type: CvType;
  bucket: string;
  path: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
  candidate?: {
    id: string;
    name: string;
    supabase_id: string;
  };
  talent_pool?: {
    id: number;
    position_id: number | null;
    location_id: number | null;
    position?: { id: number; description: string } | null;
    location?: { id: number; name: string } | null;
  };
}

type CandidateData = NonNullable<GeneralCvData['candidate']>;
type TalentPoolData = NonNullable<GeneralCvData['talent_pool']>;

interface GeneralCvRow extends Omit<GeneralCvData, 'candidate' | 'talent_pool'> {
  candidate?: CandidateData;
}

interface TalentPoolCvRow {
  id: number;
  position: NonNullable<TalentPoolData['position']>[] | null;
  location: NonNullable<TalentPoolData['location']>[] | null;
  cv: GeneralCvRow[] | null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error inesperado';
}

const handleSupabaseError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);
  return { data: null, error: getErrorMessage(error) };
};

const validateSupabaseClient = async () => {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error('Error de configuración del servidor');
  }
  return supabase;
};

export async function getGeneralCvs(): Promise<{ data: GeneralCvData[] | null; error?: string }> {
  try {
    const supabase = await validateSupabaseClient();

    const { data: entries, error } = await supabase
      .from('talent_pool_cv')
      .select(`
        id,
        position:position_id (id, description),
        location:location_id (id, name),
        cv:candidate_cvs (*, candidate:user_id (id, name, supabase_id))
      `)
      .eq('cv.cv_type', 'general')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const data: GeneralCvData[] = ((entries ?? []) as unknown as TalentPoolCvRow[])
      .filter((entry) => entry.cv !== null && entry.cv.length > 0)
      .map((entry) => ({
        ...entry.cv![0],
        candidate: entry.cv?.[0]?.candidate,
        talent_pool: {
          id: entry.id,
          position_id: entry.position?.[0]?.id ?? null,
          location_id: entry.location?.[0]?.id ?? null,
          position: entry.position?.[0] ?? null,
          location: entry.location?.[0] ?? null,
        },
      }));

    return { data };
  } catch (error) {
    return handleSupabaseError(error, 'getGeneralCvs');
  }
}

export async function getCvById(cvId: number): Promise<{ data: GeneralCvData | null; error?: string }> {
  try {
    const supabase = await validateSupabaseClient();

    const { data: cv, error } = await supabase
      .from('candidate_cvs')
      .select('*, candidate:user_id (id, name, supabase_id)')
      .eq('id', cvId)
      .single();

    if (error) {
      throw error;
    }

    const { data: talentPool } = await supabase
      .from('talent_pool_cv')
      .select('*, position:position_id (id, description), location:location_id (id, name)')
      .eq('cv_id', cvId)
      .single();

    return { data: { ...cv, talent_pool: talentPool ?? null } as GeneralCvData };
  } catch (error) {
    return handleSupabaseError(error, 'getCvById');
  }
}
