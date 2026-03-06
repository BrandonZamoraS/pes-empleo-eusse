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
    position?: { id: number; description: string };
    location?: { id: number; name: string };
  };
}

// Helpers
const handleSupabaseError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  return { data: null, error: error.message || 'Error inesperado' };
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

    if (error) throw error;

    const data: GeneralCvData[] = (entries ?? []).map((entry: any) => ({
      ...entry.cv,
      candidate: entry.cv.candidate,
      talent_pool: {
        id: entry.id,
        position_id: entry.position?.id ?? null,
        location_id: entry.location?.id ?? null,
        position: entry.position ?? null,
        location: entry.location ?? null,
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

    if (error) throw error;

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
