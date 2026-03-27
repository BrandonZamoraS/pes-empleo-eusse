import LoginContent from "./login_content";
import { getSafeInternalPath } from "@/lib/invite_registration_utils";

type SearchParams = Promise<{
  error?: string;
  returnUrl?: string;
  redirect?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const authError = resolvedSearchParams.error ?? null;
  const returnUrl = getSafeInternalPath(
    resolvedSearchParams.returnUrl ?? resolvedSearchParams.redirect,
  ) ?? "";

  return (
    <div className="flex flex-1 items-center justify-center bg-brand-50 px-4 py-8 text-brand-900">
      <LoginContent authError={authError} returnUrl={returnUrl} />
    </div>
  );
}
