"use server";

import "server-only";
import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import type {
  JobStatus,
  CompanyData,
  LocationData,
  PositionData,
  QuestionData,
  QuestionFormat,
  JobData,
} from '@/types/jobs';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

type QuestionPayload = {
  id?: number;
  description: string;
  expected_format?: QuestionFormat;
};

function parseQuestionsFromForm(formData: FormData): { questions: QuestionPayload[]; provided: boolean } {
  if (!formData.has('questions')) {
    return { questions: [], provided: false };
  }

  const validFormats: QuestionFormat[] = ['text', 'int', 'decimal', 'boolean', 'date'];

  const rawQuestions = formData.get('questions');
  if (!rawQuestions || typeof rawQuestions !== 'string') {
    return { questions: [], provided: true };
  }

  try {
    const parsed = JSON.parse(rawQuestions);
    if (!Array.isArray(parsed)) return { questions: [], provided: true };

    const questions = parsed
      .map((item) => {
        if (typeof item === 'string') {
          return { description: item, expected_format: 'text' } as QuestionPayload;
        }
        if (item && typeof item.description === 'string') {
          const formatValue = item.expected_format as QuestionFormat | undefined;
          const format = formatValue && validFormats.includes(formatValue) ? formatValue : 'text';
          return {
            id: typeof item.id === 'number' ? item.id : undefined,
            description: item.description,
            expected_format: format,
          } as QuestionPayload;
        }
        return null;
      })
      .filter((q): q is QuestionPayload => Boolean(q));

    return { questions, provided: true };
  } catch (error) {
    console.error('Error parsing questions:', error);
    return { questions: [], provided: true };
  }
}

/**
 * Obtiene todas las ofertas de trabajo
 */
export async function getJobs(): Promise<{ data: JobData[] | null; error?: string }> {
  const supabase = await createClient();

  if (!supabase) {
    return { data: null, error: 'Error de configuración del servidor' };
  }

  const { data: jobs, error } = await supabase
    .from('job')
    .select(`
      *,
      company_data:company (id, name, created_at),
      location_data:location (id, name, created_at),
      questions:question (id, description, job_id, created_at, expected_format)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    return { data: null, error: error.message };
  }

  // Obtener conteo de aplicaciones para cada job
  const jobsWithCounts = await Promise.all(
    (jobs || []).map(async (job) => {
      const { count } = await supabase
        .from('job_application')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', job.id);
      
      return {
        ...job,
        applicants_count: count || 0,
      };
    })
  );

  return { data: jobsWithCounts as JobData[] };
}

/**
 * Obtiene una oferta de trabajo por ID
 */
export async function getJobById(jobId: number): Promise<{ data: JobData | null; error?: string }> {
  const supabase = await createClient();

  if (!supabase) {
    return { data: null, error: 'Error de configuración del servidor' };
  }

  const { data: job, error } = await supabase
    .from('job')
    .select(`
      *,
      company_data:company (id, name, created_at),
      location_data:location (id, name, created_at),
      questions:question (id, description, job_id, created_at, expected_format)
    `)
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return { data: null, error: error.message };
  }

  return { data: job as JobData };
}

/**
 * Obtiene todas las compañías
 */
export async function getCompanies(): Promise<{ data: CompanyData[] | null; error?: string }> {
  const supabase = await createClient();

  if (!supabase) {
    return { data: null, error: 'Error de configuración del servidor' };
  }

  const { data, error } = await supabase
    .from('company')
    .select('*')
    .order('name');

  if (error) {
    return { data: null, error: error.message };
  }

  return { data };
}

/**
 * Obtiene todas las ubicaciones
 */
export async function getLocations(): Promise<{ data: LocationData[] | null; error?: string }> {
  const supabase = await createClient();

  if (!supabase) {
    return { data: null, error: 'Error de configuración del servidor' };
  }

  const { data, error } = await supabase
    .from('location')
    .select('*')
    .order('name');

  if (error) {
    return { data: null, error: error.message };
  }

  return { data };
}

/**
 * Obtiene todas las posiciones
 */
export async function getPositions(): Promise<{ data: PositionData[] | null; error?: string }> {
  const supabase = await createClient();

  if (!supabase) {
    return { data: null, error: 'Error de configuración del servidor' };
  }

  const { data, error } = await supabase
    .from('position')
    .select('*')
    .eq('is_active', true)
    .order('description');

  if (error) {
    return { data: null, error: error.message };
  }

  return { data };
}

/**
 * Crea una nueva oferta de trabajo
 */
export async function createJob(formData: FormData): Promise<{ data?: JobData; error?: string }> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Error de configuración del servidor' };
  }

  // Obtener el perfil del usuario actual
  const { profile } = await getCurrentUser();
  if (!profile) {
    return { error: 'Usuario no autenticado' };
  }

  const company = parseInt(formData.get('company') as string);
  const location = parseInt(formData.get('location') as string);
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const status = (formData.get('status') as JobStatus) || 'draft';
  const activate_at = formData.get('activate_at') as string || null;
  const { questions } = parseQuestionsFromForm(formData);

  const { data: job, error } = await supabase
    .from('job')
    .insert({
      company,
      location,
      title,
      description,
      status,
      activate_at,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating job:', error);
    return { error: error.message };
  }

  // Crear preguntas si se proporcionaron
  const cleanedQuestions = questions
    .map((q) => ({
      description: (q.description || '').trim(),
      expected_format: q.expected_format || 'text',
      job_id: job.id,
    }))
    .filter((q) => q.description.length > 0);

  if (cleanedQuestions.length > 0) {
    const { error: questionError } = await supabase.from('question').insert(cleanedQuestions);
    if (questionError) {
      console.error('Error creating questions:', questionError);
    }
  }

  revalidatePath('/dashboard/puestos');
  return { data: job };
}

/**
 * Actualiza una oferta de trabajo
 */
export async function updateJob(jobId: number, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Error de configuración del servidor' };
  }

  const { questions, provided: questionsProvided } = parseQuestionsFromForm(formData);
  const updates: Record<string, unknown> = {};

  const company = formData.get('company');
  if (company) updates.company = parseInt(company as string);

  const location = formData.get('location');
  if (location) updates.location = parseInt(location as string);

  const title = formData.get('title');
  if (title) updates.title = title;

  const description = formData.get('description');
  if (description) updates.description = description;

  const status = formData.get('status');
  if (status) updates.status = status;

  const activate_at = formData.get('activate_at');
  if (activate_at !== null) updates.activate_at = activate_at || null;

  const { error } = await supabase
    .from('job')
    .update(updates)
    .eq('id', jobId);

  if (error) {
    console.error('Error updating job:', error);
    return { error: error.message };
  }

  // Sincronizar preguntas solo si el formulario las envió
  if (questionsProvided) {
    const cleanedQuestions = questions
      .map((q) => ({
        id: q.id,
        description: (q.description || '').trim(),
        expected_format: q.expected_format || 'text',
      }))
      .filter((q) => q.description.length > 0);

    // Consultar preguntas existentes del job
    const { data: existingQuestions, error: fetchQuestionsError } = await supabase
      .from('question')
      .select('id, description, expected_format')
      .eq('job_id', jobId);

    if (fetchQuestionsError) {
      console.error('Error fetching questions:', fetchQuestionsError);
      return { error: fetchQuestionsError.message };
    }

    const existingMap = new Map<number, { description: string; expected_format?: QuestionFormat }>();
    (existingQuestions || []).forEach((q) =>
      existingMap.set(q.id, { description: q.description as string, expected_format: q.expected_format as QuestionFormat | undefined })
    );

    const submittedIds = new Set(cleanedQuestions.filter((q) => q.id).map((q) => q.id as number));
    const toDelete = (existingQuestions || []).filter((q) => !submittedIds.has(q.id));

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('question')
        .delete()
        .in('id', toDelete.map((q) => q.id));

      if (deleteError) {
        console.error('Error deleting questions:', deleteError);
        return { error: deleteError.message };
      }
    }

    // Actualizar descripciones / formatos existentes
    for (const question of cleanedQuestions) {
      if (question.id && existingMap.has(question.id)) {
        const current = existingMap.get(question.id);
        if (current?.description !== question.description || current?.expected_format !== question.expected_format) {
          const { error: updateQuestionError } = await supabase
            .from('question')
            .update({ description: question.description, expected_format: question.expected_format })
            .eq('id', question.id);

          if (updateQuestionError) {
            console.error('Error updating question:', updateQuestionError);
            return { error: updateQuestionError.message };
          }
        }
      }
    }

    // Insertar nuevas preguntas
    const toInsert = cleanedQuestions.filter((q) => !q.id);
    if (toInsert.length > 0) {
      const inserts = toInsert.map((q) => ({
        description: q.description,
        expected_format: q.expected_format || 'text',
        job_id: jobId,
      }));

      const { error: insertError } = await supabase.from('question').insert(inserts);
      if (insertError) {
        console.error('Error inserting questions:', insertError);
        return { error: insertError.message };
      }
    }
  }

  revalidatePath('/dashboard/puestos');
  return { success: true };
}

/**
 * Cambia el estado de una oferta
 */
export async function updateJobStatus(jobId: number, status: JobStatus): Promise<ActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Error de configuración del servidor' };
  }

  const updates: Record<string, unknown> = { status };
  
  // Si se cierra o pausa, registrar la fecha
  if (status === 'closed' || status === 'paused') {
    updates.deactivated_at = new Date().toISOString();
  } else if (status === 'active') {
    updates.deactivated_at = null;
  }

  const { error } = await supabase
    .from('job')
    .update(updates)
    .eq('id', jobId);

  if (error) {
    console.error('Error updating job status:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/puestos');
  return { success: true };
}

/**
 * Duplica una oferta de trabajo
 */
export async function duplicateJob(jobId: number): Promise<{ data?: JobData; error?: string }> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Error de configuración del servidor' };
  }

  // Obtener el job original
  const { data: original, error: fetchError } = await supabase
    .from('job')
    .select('*, questions:question (description, expected_format)')
    .eq('id', jobId)
    .single();

  if (fetchError || !original) {
    return { error: 'Oferta no encontrada' };
  }

  // Obtener el perfil del usuario actual
  const { profile } = await getCurrentUser();
  if (!profile) {
    return { error: 'Usuario no autenticado' };
  }

  // Crear la copia
  const { data: newJob, error: insertError } = await supabase
    .from('job')
    .insert({
      company: original.company,
      location: original.location,
      title: `${original.title} (copia)`,
      description: original.description,
      status: 'draft',
      created_by: profile.id,
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  // Duplicar preguntas si existen
  if (original.questions && original.questions.length > 0) {
    const questionInserts = original.questions.map(
      (q: { description: string; expected_format?: string | null }) => ({
        description: q.description,
        expected_format: q.expected_format || 'text',
        job_id: newJob.id,
      })
    );
    await supabase.from('question').insert(questionInserts);
  }

  revalidatePath('/dashboard/puestos');
  return { data: newJob };
}

/**
 * Elimina una oferta (la cierra permanentemente)
 */
export async function deleteJob(jobId: number): Promise<ActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Error de configuración del servidor' };
  }

  // En lugar de eliminar, cambiamos a estado closed
  const { error } = await supabase
    .from('job')
    .update({ status: 'closed', deactivated_at: new Date().toISOString() })
    .eq('id', jobId);

  if (error) {
    console.error('Error deleting job:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/puestos');
  return { success: true };
}

/**
 * Añade una pregunta a un job
 */
export async function addQuestion(jobId: number, description: string, expected_format: QuestionFormat = 'text'): Promise<ActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Error de configuración del servidor' };
  }

  const { error } = await supabase
    .from('question')
    .insert({ job_id: jobId, description, expected_format });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/puestos');
  return { success: true };
}

/**
 * Elimina una pregunta
 */
export async function deleteQuestion(questionId: number): Promise<ActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Error de configuración del servidor' };
  }

  const { error } = await supabase
    .from('question')
    .delete()
    .eq('id', questionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/puestos');
  return { success: true };
}

/**
 * Crea una nueva compañía
 */
export async function createCompany(name: string): Promise<{ data?: CompanyData; error?: string }> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Error de configuración del servidor' };
  }

  const { data, error } = await supabase
    .from('company')
    .insert({ name })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/puestos');
  return { data };
}

/**
 * Crea una nueva ubicación
 */
export async function createLocation(name: string): Promise<{ data?: LocationData; error?: string }> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Error de configuración del servidor' };
  }

  const { data, error } = await supabase
    .from('location')
    .insert({ name })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/puestos');
  return { data };
}

/**
 * Crea una nueva posición
 */
export async function createPosition(description: string): Promise<{ data?: PositionData; error?: string }> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: 'Error de configuración del servidor' };
  }

  // Obtener el perfil del usuario actual
  const { profile } = await getCurrentUser();
  if (!profile) {
    return { error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('position')
    .insert({ description, created_by: profile.id })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/puestos');
  return { data };
}
