import InviteAuthContent from "./invite_auth_content";
import { getSafeInternalPath } from "@/lib/invite_registration_utils";

type SearchParams = Promise<{
  next?: string;
}>;

export default async function InviteAuthPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeInternalPath(resolvedSearchParams.next) ?? "";

  return <InviteAuthContent nextPath={nextPath} />;
}
