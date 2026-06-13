"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type UserAvatarButtonProps = {
  className?: string;
};

export function UserAvatarButton({ className }: UserAvatarButtonProps) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const displayName = user?.name?.trim() || user?.email || "Usuário";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Link
      aria-label="Abrir perfil"
      className={cn(
        "grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-accent text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      href="/profile"
    >
      {isPending ? (
        <Loader2 aria-hidden className="size-4 animate-spin text-muted-foreground" />
      ) : user?.image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img alt="" className="size-full object-cover" src={user.image} />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </Link>
  );
}
