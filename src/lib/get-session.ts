import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

/**
 * Retorna o ID do usuário atualmente autenticado a partir dos headers da requisição.
 * Deve ser usado em Server Actions e API Routes (App Router).
 */
export async function getSessionUser(req?: NextRequest) {
  // O better-auth permite extrair os headers do Next.js
  const session = await auth.api.getSession({
    headers: req ? req.headers : await headers(),
  });
  return session?.user;
}
