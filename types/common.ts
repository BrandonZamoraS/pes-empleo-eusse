// Shared types for server actions and API responses

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export interface DataResult<T> {
  data: T | null;
  error?: string;
}

// Common CRUD operation types
export interface CrudOperations<T, CreateData = FormData, UpdateData = FormData> {
  get: () => Promise<DataResult<T[]>>;
  create: (data: CreateData) => Promise<ActionResult>;
  update: (id: number, data: UpdateData) => Promise<ActionResult>;
  delete: (id: number) => Promise<ActionResult>;
}

// Status types for entities that can be active/inactive
export interface StatusToggleable {
  toggle: (id: number, isActive: boolean) => Promise<ActionResult>;
}

// Common entity with ID and timestamps
export interface BaseEntity {
  id: number;
  created_at: string;
}

// Helper type for entities with active status
export interface ActiveEntity extends BaseEntity {
  is_active: boolean;
}