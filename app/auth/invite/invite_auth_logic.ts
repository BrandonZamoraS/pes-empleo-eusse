export type InviteAuthOutcome = "wait" | "onboarding" | "error";

interface InviteAuthState {
  hasSession: boolean;
  timedOut: boolean;
  hasErrored: boolean;
}

export function getInviteAuthOutcome({
  hasSession,
  timedOut,
  hasErrored,
}: InviteAuthState): InviteAuthOutcome {
  if (hasSession) {
    return "onboarding";
  }

  if (timedOut || hasErrored) {
    return "error";
  }

  return "wait";
}
