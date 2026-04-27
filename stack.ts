import "server-only";

// Auth disabled for initial deploy. The dashboard runs against Neon DB with a
// hardcoded user identity. Re-enable by replacing this with a Better Auth
// session lookup once the Neon Auth keys are in place.
export interface CurrentUser {
  primaryEmail: string;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return { primaryEmail: "owner@example.com" };
}
