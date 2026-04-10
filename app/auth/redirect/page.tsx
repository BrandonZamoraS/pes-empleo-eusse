import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/auth";

const ROLE_REDIRECT: Record<UserRole, string> = {
  postulant: "/dashboard/postulante",
  hr:        "/dashboard/puestos",
  admin:     "/dashboard/puestos",
};

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as UserRole | undefined;
  redirect(ROLE_REDIRECT[role!] ?? "/dashboard/postulante");
}
