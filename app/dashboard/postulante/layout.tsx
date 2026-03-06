import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';

export default async function PostulanteDashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { user, profile } = await getCurrentUser();

  // Verificar autenticación
  if (!user || !profile) {
    redirect('/login');
  }

  // Verificar que el usuario tenga rol postulant
  if (profile.user_role !== 'postulant') {
    // Si es HR o Admin, redirigir al dashboard de admin
    if (profile.user_role === 'hr' || profile.user_role === 'admin') {
      redirect('/dashboard/puestos');
    }
    // Si tiene otro rol, ir al home
    redirect('/');
  }

  return <>{children}</>;
}
