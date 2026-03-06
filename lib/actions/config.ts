'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Types
export interface ActionResult {
  error?: string;
  success?: boolean;
}

export interface CompanyData {
  id: number;
  name: string;
  created_at: string;
}

export interface LocationData {
  id: number;
  name: string;
  created_at: string;
}

export interface PositionData {
  id: number;
  description: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

// Shared helpers
const handleSupabaseError = (error: any, context: string): ActionResult => {
  console.error(`Error in ${context}:`, error);
  if (error.message?.includes('violates foreign key constraint')) {
    const entityMap: Record<string, string> = {
      'company': 'No se puede eliminar: hay ofertas de empleo asociadas a esta compañía',
      'location': 'No se puede eliminar: hay ofertas de empleo asociadas a esta ubicación',
      'position': 'No se puede eliminar: hay ofertas de empleo asociadas a esta posición'
    };
    const entityType = context.toLowerCase().includes('company') ? 'company' : 
                      context.toLowerCase().includes('location') ? 'location' : 'position';
    return { error: entityMap[entityType] || error.message };
  }
  return { error: error.message || 'Error inesperado' };
};

const validateSupabaseClient = async () => {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error('Error de configuración del servidor');
  }
  return supabase;
};

const validateFormData = (formData: FormData, fieldName: string) => {
  const value = formData.get(fieldName) as string;
  if (!value?.trim()) {
    throw new Error(`${fieldName === 'name' ? 'El nombre' : 'La descripción'} es requerid${fieldName === 'name' ? 'o' : 'a'}`);
  }
  return value.trim();
};

const getCurrentUserProfile = async (supabase: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');
  
  const { data: profile } = await supabase
    .from('user_profile')
    .select('id')
    .eq('supabase_id', user.id)
    .single();
    
  if (!profile) throw new Error('Perfil de usuario no encontrado');
  return profile;
};

// =====================================================================
// COMPANIES
// =====================================================================

/**
 * Obtiene todas las compañías
 */
export async function getCompanies(): Promise<{ data: CompanyData[] | null; error?: string }> {
  try {
    const supabase = await validateSupabaseClient();
    const { data, error } = await supabase
      .from('company')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data };
  } catch (error) {
    return { data: null, ...handleSupabaseError(error, 'getCompanies') };
  }
}

/**
 * Crea una nueva compañía
 */
export async function createCompany(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await validateSupabaseClient();
    const name = validateFormData(formData, 'name');

    const { error } = await supabase.from('company').insert({ name });
    if (error) throw error;

    revalidatePath('/dashboard/configuracion');
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error, 'createCompany');
  }
}

/**
 * Actualiza una compañía existente
 */
export async function updateCompany(id: number, formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await validateSupabaseClient();
    const name = validateFormData(formData, 'name');

    const { error } = await supabase
      .from('company')
      .update({ name })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard/configuracion');
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error, 'updateCompany');
  }
}

/**
 * Elimina una compañía
 */
export async function deleteCompany(id: number): Promise<ActionResult> {
  try {
    const supabase = await validateSupabaseClient();

    const { error } = await supabase.from('company').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/dashboard/configuracion');
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error, 'deleteCompany');
  }
}

// =====================================================================
// LOCATIONS
// =====================================================================

/**
 * Obtiene todas las ubicaciones
 */
export async function getLocations(): Promise<{ data: LocationData[] | null; error?: string }> {
  try {
    const supabase = await validateSupabaseClient();
    const { data, error } = await supabase
      .from('location')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data };
  } catch (error) {
    return { data: null, ...handleSupabaseError(error, 'getLocations') };
  }
}

/**
 * Crea una nueva ubicación
 */
export async function createLocation(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await validateSupabaseClient();
    const name = validateFormData(formData, 'name');

    const { error } = await supabase.from('location').insert({ name });
    if (error) throw error;

    revalidatePath('/dashboard/configuracion');
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error, 'createLocation');
  }
}

/**
 * Actualiza una ubicación existente
 */
export async function updateLocation(id: number, formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await validateSupabaseClient();
    const name = validateFormData(formData, 'name');

    const { error } = await supabase
      .from('location')
      .update({ name })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard/configuracion');
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error, 'updateLocation');
  }
}

/**
 * Elimina una ubicación
 */
export async function deleteLocation(id: number): Promise<ActionResult> {
  try {
    const supabase = await validateSupabaseClient();

    const { error } = await supabase.from('location').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/dashboard/configuracion');
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error, 'deleteLocation');
  }
}

// =====================================================================
// POSITIONS
// =====================================================================

/**
 * Obtiene todas las posiciones
 */
export async function getPositions(): Promise<{ data: PositionData[] | null; error?: string }> {
  try {
    const supabase = await validateSupabaseClient();
    const { data, error } = await supabase
      .from('position')
      .select('*')
      .order('description', { ascending: true });

    if (error) throw error;
    return { data };
  } catch (error) {
    return { data: null, ...handleSupabaseError(error, 'getPositions') };
  }
}

/**
 * Crea una nueva posición
 */
export async function createPosition(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await validateSupabaseClient();
    const description = validateFormData(formData, 'description');
    const currentProfile = await getCurrentUserProfile(supabase);

    const { error } = await supabase.from('position').insert({ 
      description,
      created_by: currentProfile.id,
      is_active: true
    });

    if (error) throw error;

    revalidatePath('/dashboard/configuracion');
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error, 'createPosition');
  }
}

/**
 * Actualiza una posición existente
 */
export async function updatePosition(id: number, formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await validateSupabaseClient();
    const description = validateFormData(formData, 'description');

    const { error } = await supabase
      .from('position')
      .update({ description })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard/configuracion');
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error, 'updatePosition');
  }
}

/**
 * Activa o desactiva una posición
 */
export async function togglePositionStatus(id: number, isActive: boolean): Promise<ActionResult> {
  try {
    const supabase = await validateSupabaseClient();

    const { error } = await supabase
      .from('position')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard/configuracion');
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error, 'togglePositionStatus');
  }
}

/**
 * Elimina una posición
 */
export async function deletePosition(id: number): Promise<ActionResult> {
  try {
    const supabase = await validateSupabaseClient();

    const { error } = await supabase.from('position').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/dashboard/configuracion');
    return { success: true };
  } catch (error) {
    return handleSupabaseError(error, 'deletePosition');
  }
}
