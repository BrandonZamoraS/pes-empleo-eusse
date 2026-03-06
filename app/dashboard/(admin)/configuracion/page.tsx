import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getAdminUsers, getInvites } from '@/lib/actions/roles';
import { getCompanies, getLocations, getPositions } from '@/lib/actions/config';
import ConfiguracionContent from './configuracion_content';

export default async function ConfiguracionDashboardPage() {
  const { user, profile } = await getCurrentUser();

  // Verificación de autorización
  if (!user || !profile || profile.user_role !== 'admin') {
    redirect('/dashboard/puestos');
  }

  try {
    // Obtener todos los datos en paralelo
    const [usersResult, invitesResult, companiesResult, locationsResult, positionsResult] = 
      await Promise.all([
        getAdminUsers(),
        getInvites(),
        getCompanies(),
        getLocations(),
        getPositions(),
      ]);

    return (
      <ConfiguracionContent
        initialUsers={usersResult.data || []}
        initialInvites={invitesResult.data || []}
        initialCompanies={companiesResult.data || []}
        initialLocations={locationsResult.data || []}
        initialPositions={positionsResult.data || []}
        currentUserProfileId={profile.id}
      />
    );
  } catch (error) {
    // En caso de error, mostrar interfaz vacía con mensaje
    return (
      <div className="rounded-3xl border border-transparent bg-white p-8 shadow-[0_25px_70px_rgba(0,0,0,0.06)] text-center">
        <p className="text-brand-900/70">Error al cargar la configuración. Intenta recargar la página.</p>
      </div>
    );
  }
}
