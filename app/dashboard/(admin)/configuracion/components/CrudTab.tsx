"use client";

import { useState, useTransition } from "react";

interface CrudItem {
  id: number;
  name?: string;
  description?: string;
  is_active?: boolean;
  created_at: string;
}

interface CrudTabProps<T extends CrudItem> {
  title: string;
  items: T[];
  itemName: string; // "compañía", "ubicación", "posición"
  fieldName: "name" | "description";
  placeholder: string;
  showActiveStatus?: boolean;
  onShowMessage: (type: "error" | "success", message: string) => void;
  onUpdateItems: (updater: (items: T[]) => T[]) => void;
  onCreate: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onUpdate: (id: number, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onDelete: (id: number) => Promise<{ error?: string; success?: boolean }>;
  onToggleStatus?: (id: number, isActive: boolean) => Promise<{ error?: string; success?: boolean }>;
}

export default function CrudTab<T extends CrudItem>({
  title,
  items,
  itemName,
  fieldName,
  placeholder,
  showActiveStatus = false,
  onShowMessage,
  onUpdateItems,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
}: CrudTabProps<T>) {
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const getValue = (item: T) => {
    return fieldName === "name" ? item.name : item.description;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    const formData = new FormData();
    formData.append(fieldName, newValue);

    startTransition(async () => {
      const result = await onCreate(formData);
      if (result.error) {
        onShowMessage("error", result.error);
      } else {
        onShowMessage("success", `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} creada correctamente`);
        setNewValue("");
        window.location.reload();
      }
    });
  };

  const handleUpdate = async (id: number) => {
    if (!editValue.trim()) return;

    const formData = new FormData();
    formData.append(fieldName, editValue);

    startTransition(async () => {
      const result = await onUpdate(id, formData);
      if (result.error) {
        onShowMessage("error", result.error);
      } else {
        onUpdateItems((prev) =>
          prev.map((item) => item.id === id 
            ? { ...item, [fieldName]: editValue } as T 
            : item
          )
        );
        setEditingId(null);
        onShowMessage("success", `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} actualizada correctamente`);
      }
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`¿Estás seguro de eliminar esta ${itemName}?`)) return;

    startTransition(async () => {
      const result = await onDelete(id);
      if (result.error) {
        onShowMessage("error", result.error);
      } else {
        onUpdateItems((prev) => prev.filter((item) => item.id !== id));
        onShowMessage("success", `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} eliminada correctamente`);
      }
    });
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    if (!onToggleStatus) return;

    startTransition(async () => {
      const result = await onToggleStatus(id, !currentStatus);
      if (result.error) {
        onShowMessage("error", result.error);
      } else {
        onUpdateItems((prev) =>
          prev.map((item) => item.id === id 
            ? { ...item, is_active: !currentStatus } as T 
            : item
          )
        );
        onShowMessage("success", `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} ${!currentStatus ? "activada" : "desactivada"} correctamente`);
      }
    });
  };

  const displayValue = fieldName === "name" ? "nombre" : "descripción";

  return (
    <>
      {/* Agregar nuevo */}
      <section className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-brand-900">Agregar nueva {itemName}</h2>
        <p className="text-sm text-brand-900/70">
          {fieldName === "name" 
            ? `Las ${itemName}s se utilizan al crear ofertas de empleo.`
            : `Las ${itemName}s son los tipos de puestos disponibles (ej: Técnico Automotriz, Gerente, etc.)`
          }
        </p>
        <form className="mt-4 flex gap-4" onSubmit={handleCreate}>
          <input
            required
            type="text"
            placeholder={placeholder}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            disabled={isPending}
            className="flex-1 rounded-2xl border border-transparent bg-brand-50 px-3 py-2 text-brand-900 outline-none focus:ring-2 focus:ring-brand-400/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-2xl bg-brand-400 px-6 py-2 text-sm font-semibold text-brand-50 shadow-[0_20px_55px_rgba(0,0,0,0.12)] disabled:opacity-50"
          >
            {isPending ? "Creando..." : "Agregar"}
          </button>
        </form>
      </section>

      {/* Lista de items */}
      <section className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-brand-900">{title} registradas</h2>
        <div className="mt-4 overflow-x-auto">
          {items.length === 0 ? (
            <p className="text-sm text-brand-900/60 text-center py-8">
              No hay {itemName}s registradas
            </p>
          ) : (
            <table className="min-w-full divide-y divide-brand-50 text-sm">
              <thead className="bg-brand-50 text-left text-xs uppercase tracking-widest text-brand-900/60">
                <tr>
                  <th className="px-3 py-3">{fieldName === "name" ? "Nombre" : "Descripción"}</th>
                  {showActiveStatus && <th className="px-3 py-3">Estado</th>}
                  <th className="px-3 py-3">Fecha de creación</th>
                  <th className="px-3 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50/80">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-3">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full rounded-xl border border-brand-200 bg-white px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="font-medium text-brand-900">{getValue(item)}</span>
                      )}
                    </td>
                    {showActiveStatus && (
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.is_active
                              ? "bg-brand-400/25 text-brand-900"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.is_active ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-3 text-xs text-brand-900/60">
                      {new Date(item.created_at).toLocaleDateString("es-CR")}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        {editingId === item.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(item.id)}
                              disabled={isPending}
                              className="rounded-full bg-brand-400 px-3 py-1 text-xs text-white disabled:opacity-50"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={isPending}
                              className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-900 disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setEditValue(getValue(item) || "");
                              }}
                              disabled={isPending}
                              className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-900 disabled:opacity-50"
                            >
                              Editar
                            </button>
                            {showActiveStatus && onToggleStatus && (
                              <button
                                onClick={() => handleToggleStatus(item.id, item.is_active!)}
                                disabled={isPending}
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  item.is_active
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-green-50 text-green-700"
                                } disabled:opacity-50`}
                              >
                                {item.is_active ? "Desactivar" : "Activar"}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item.id)}
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}