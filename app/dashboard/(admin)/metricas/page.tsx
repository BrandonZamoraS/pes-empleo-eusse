import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import MetricsContent from './metrics_content';

export default async function MetricsPage() {
  const { user, profile } = await getCurrentUser();

  // Verificación adicional a nivel de página
  if (!user || !profile || profile.user_role !== 'admin') {
    redirect('/dashboard/puestos');
  }

  return <MetricsContent />;
}
