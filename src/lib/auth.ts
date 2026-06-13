import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Configurações essenciais
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
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
});
