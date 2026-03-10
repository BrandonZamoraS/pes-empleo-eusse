import { NextResponse } from 'next/server';
import { createClient, getCurrentUser } from '@/lib/supabase/server';

export async function GET() {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile || profile.user_role !== 'postulant') {
    return NextResponse.json({ cv: null });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ cv: null });
  }

  const { data: cv } = await supabase
    .from('candidate_cvs')
    .select('id, path, mime_type, file_size_bytes, created_at')
    .eq('user_id', profile.id)
    .eq('cv_type', 'general')
    .single();

  return NextResponse.json({ cv: cv ?? null });
}
