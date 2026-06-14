import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Optional override; when unset, requests use same-origin `/api/auth`
  ...(process.env.NEXT_PUBLIC_BASE_URL
    ? { baseURL: process.env.NEXT_PUBLIC_BASE_URL }
    : {}),
});
