"use client";

import { useState, useTransition } from "react";
import type { UserRole } from "@/types/auth";
import {
  createInvite,
  updateUserRole,
  toggleUserStatus,
  deleteInvite,
  resendInvite,
  type UserProfileData,
  type UserInviteData,
} from "@/lib/actions/roles";

interface RolesTabProps {
  users: UserProfileData[];
  invites: UserInviteData[];
  currentUserProfileId: string;
  onShowMessage: (type: "error" | "success", message: string) => void;
  onUpdateUsers: (updater: (users: UserProfileData[]) => UserProfileData[]) => void;
  onUpdateInvites: (updater: (invites: UserInviteData[]) => UserInviteData[]) => void;
}

// Mapeo de roles internos a nombres para mostrar
const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: "Administrador",
  hr: "RRHH",
  postulant: "Postulante",
};

export default function RolesTab({
  users,
  invites,
  currentUserProfileId,
  onShowMessage,
  onUpdateUsers,
  onUpdateInvites,
}: RolesTabProps) {
  const [form, setForm] = useState({ email: "", role: "hr" as UserRole });
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("role", form.role);

    startTransition(async () => {
      const result = await createInvite(formData);
      if (result.error) {
        onShowMessage("error", result.error);
      } else {
        onShowMessage("success", "Invitación enviada correctamente");
        setForm({ email: "", role: "hr" });
        window.location.reload();
      }
    });
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUserProfileId) {
      onShowMessage("error", "No puedes desactivar tu propia cuenta");
      return;
    }

    startTransition(async () => {
      const result = await toggleUserStatus(userId, !currentStatus);
      if (result.error) {
        onShowMessage("error", result.error);
      } else {
        onUpdateUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
        );
        onShowMessage("success", `Usuario ${!currentStatus ? "activado" : "desactivado"} correctamente`);
      }
    });
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === currentUserProfileId) {
      onShowMessage("error", "No puedes cambiar tu propio rol");
      return;
    }

    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.error) {
        onShowMessage("error", result.error);
      } else {
        onUpdateUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, user_role: newRole } : u))
        );
        setEditingUser(null);
        onShowMessage("success", "Rol actualizado correctamente");
      }
    });
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta invitación?")) return;

    startTransition(async () => {
      const result = await deleteInvite(inviteId);
      if (result.error) {
        onShowMessage("error", result.error);
      } else {
        onUpdateInvites((prev) => prev.filter((i) => i.id !== inviteId));
        onShowMessage("success", "Invitación eliminada");
      }
    });
  };

  const handleResendInvite = async (inviteId: string) => {
    startTransition(async () => {
      const result = await resendInvite(inviteId);
      if (result.error) {
        onShowMessage("error", result.error);
      } else {
        onShowMessage("success", "Invitación reenviada");
        window.location.reload();
      }
    });
  };

  const getInviteStatus = (invite: UserInviteData): "Pendiente" | "Aceptado" | "Expirado" => {
    if (invite.accepted_at) return "Aceptado";
    const createdAt = new Date(invite.created_at);
    const expiresAt = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    if (new Date() > expiresAt) return "Expirado";
    return "Pendiente";
  };

  const getExpirationDate = (createdAt: string): string => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 14);
    return date.toLocaleDateString("es-CR");
  };

  return (
    <>
      {/* Invitar nuevo usuario */}
      <section className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-brand-900">Invitar nuevo usuario</h2>
        <p className="text-sm text-brand-900/70">
          Define el rol antes de enviar el correo de invitación.
        </p>
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleInvite}>
          <label className="text-sm text-brand-900/70 md:col-span-1">
            Correo corporativo
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              disabled={isPending}
              className="mt-1 w-full rounded-2xl border border-transparent bg-brand-50 px-3 py-2 text-brand-900 outline-none focus:ring-2 focus:ring-brand-400/40 disabled:opacity-50"
            />
          </label>
          <label className="text-sm text-brand-900/70">
            Rol
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
              disabled={isPending}
              className="mt-1 w-full rounded-2xl border border-transparent bg-brand-50 px-3 py-2 text-brand-900 outline-none focus:ring-2 focus:ring-brand-400/40 disabled:opacity-50"
            >
              <option value="admin">Administrador</option>
              <option value="hr">RRHH</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-2xl bg-brand-400 px-6 py-2 text-sm font-semibold text-brand-50 shadow-[0_20px_55px_rgba(0,0,0,0.12)] disabled:opacity-50"
            >
              {isPending ? "Enviando..." : "Enviar invitación"}
            </button>
          </div>
          <p className="md:col-span-3 text-xs text-brand-900/70">
            La invitación expira en 14 días. El invitado completará sus datos antes de activar el usuario.
          </p>
        </form>
      </section>

      {/* Usuarios del sistema */}
      <section className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-brand-900">Usuarios del sistema</h2>
        <p className="text-sm text-brand-900/70 mb-4">
          Usuarios con rol de administrador o RRHH
        </p>
        <div className="mt-4 overflow-x-auto">
          {users.length === 0 ? (
            <p className="text-sm text-brand-900/60 text-center py-8">
              No hay usuarios registrados con roles administrativos
            </p>
          ) : (
            <table className="min-w-full divide-y divide-brand-50 text-sm">
              <thead className="bg-brand-50 text-left text-xs uppercase tracking-widest text-brand-900/60">
                <tr>
                  <th className="px-3 py-3">Nombre</th>
                  <th className="px-3 py-3">Rol</th>
                  <th className="px-3 py-3">Fecha de registro</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50/80">
                {users.map((user) => (
                  <tr key={user.id} className={user.id === currentUserProfileId ? "bg-brand-50/50" : ""}>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-brand-900">
                        {user.name || "Sin nombre"}
                        {user.id === currentUserProfileId && (
                          <span className="ml-2 text-xs text-brand-400">(Tú)</span>
                        )}
                      </p>
                      <p className="text-xs text-brand-900/60">{user.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      {editingUser === user.id ? (
                        <select
                          value={user.user_role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          disabled={isPending}
                          className="rounded-xl border border-brand-200 bg-white px-2 py-1 text-sm"
                        >
                          <option value="admin">Administrador</option>
                          <option value="hr">RRHH</option>
                        </select>
                      ) : (
                        ROLE_DISPLAY_NAMES[user.user_role]
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-brand-900/60">
                      {new Date(user.created_at).toLocaleDateString("es-CR")}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.is_active
                            ? "bg-brand-400/25 text-brand-900"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        {user.id !== currentUserProfileId && (
                          <>
                            <button
                              onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                              disabled={isPending}
                              className="rounded-full border border-transparent bg-brand-50 px-3 py-1 text-xs text-brand-900 shadow-[0_8px_20px_rgba(0,0,0,0.05)] disabled:opacity-50"
                            >
                              {editingUser === user.id ? "Cancelar" : "Editar rol"}
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user.id, user.is_active)}
                              disabled={isPending}
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                user.is_active
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-green-50 text-green-700"
                              } disabled:opacity-50`}
                            >
                              {user.is_active ? "Desactivar" : "Activar"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Invitaciones */}
      <section className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-brand-900">Invitaciones</h2>
        <div className="mt-4 overflow-x-auto">
          {invites.length === 0 ? (
            <p className="text-sm text-brand-900/60 text-center py-8">
              No hay invitaciones pendientes
            </p>
          ) : (
            <table className="min-w-full divide-y divide-brand-50 text-sm">
              <thead className="bg-brand-50 text-left text-xs uppercase tracking-widest text-brand-900/60">
                <tr>
                  <th className="px-3 py-3">Correo</th>
                  <th className="px-3 py-3">Rol</th>
                  <th className="px-3 py-3">Invitó</th>
                  <th className="px-3 py-3">Enviada</th>
                  <th className="px-3 py-3">Expira</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50/80">
                {invites.map((invite) => {
                  const status = getInviteStatus(invite);
                  return (
                    <tr key={invite.id}>
                      <td className="px-3 py-3 font-medium text-brand-900">{invite.email}</td>
                      <td className="px-3 py-3">{ROLE_DISPLAY_NAMES[invite.role]}</td>
                      <td className="px-3 py-3 text-brand-900/60">{invite.creator_name || "Sistema"}</td>
                      <td className="px-3 py-3">
                        {new Date(invite.created_at).toLocaleDateString("es-CR")}
                      </td>
                      <td className="px-3 py-3">{getExpirationDate(invite.created_at)}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            status === "Pendiente"
                              ? "bg-amber-50 text-amber-700"
                              : status === "Aceptado"
                              ? "bg-brand-400/25 text-brand-900"
                              : "bg-brand-50 text-brand-700"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          {status === "Pendiente" && (
                            <button
                              onClick={() => handleDeleteInvite(invite.id)}
                              disabled={isPending}
                              className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700 disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          )}
                          {status === "Expirado" && (
                            <>
                              <button
                                onClick={() => handleResendInvite(invite.id)}
                                disabled={isPending}
                                className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-900 disabled:opacity-50"
                              >
                                Reenviar
                              </button>
                              <button
                                onClick={() => handleDeleteInvite(invite.id)}
                                disabled={isPending}
                                className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700 disabled:opacity-50"
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}