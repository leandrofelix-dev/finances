import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

const trustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const productionBaseURL =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL;

const baseURL =
  process.env.NODE_ENV === "production" && productionBaseURL
    ? productionBaseURL
    : {
        allowedHosts: [
          "localhost:*",
          "127.0.0.1:*",
          "192.168.*.*:*",
          "10.*.*.*:*",
        ],
        protocol: "http",
        fallback: productionBaseURL ?? "http://localhost:3000",
      };

const useSecureCookies =
  typeof baseURL === "string"
    ? baseURL.startsWith("https://")
    : process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Configurações essenciais
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me",
  baseURL,
  advanced: {
    useSecureCookies,
  },
  ...(trustedOrigins?.length ? { trustedOrigins } : {}),
  // Enable email and password authentication
  emailAndPassword: {
    enabled: true,
  },
  // Configuração do token JWT / Session
  session: {
    // Access token expira em 15 min, refresh em 1 hora conforme pedido
    maxAge: 60 * 60, // 1h em segundos
    updateAge: 15 * 60, // 15min
  },
  plugins: [nextCookies()],
});
