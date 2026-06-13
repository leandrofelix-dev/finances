import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Base URL of the Next.js app (should match NEXT_PUBLIC_BASE_URL)
  baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
});
