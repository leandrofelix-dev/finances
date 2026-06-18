"use client";

import { useRouter } from "next/navigation";
import { Loader2, LogOut, User, Settings } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/atoms/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/atoms/dialog";
import { Separator } from "@/components/atoms/separator";
import { toast } from "react-hot-toast";

type UserAvatarButtonProps = {
  className?: string;
};

export function UserAvatarButton({ className }: UserAvatarButtonProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const displayName = user?.name?.trim() || user?.email || "Usuário";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch {
      // fallback: ignore error
    }
    document.cookie = "better-auth.session_token=; max-age=0; path=/;";
    window.location.href = "/auth/login";
  };

  const avatarClass = cn(
    "grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-accent text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    className
  );

  const avatarContent = (
    <>
      {isPending ? (
        <Loader2 aria-hidden className="size-4 animate-spin text-muted-foreground" />
      ) : user?.image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img alt="" className="size-full object-cover" src={user.image} />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </>
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={cn(avatarClass, "hidden md:grid")} aria-label="Menu do usuário">
          {avatarContent}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User size={16} />
            Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <Settings size={16} />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog>
        <DialogTrigger className={cn(avatarClass, "md:hidden")} aria-label="Menu do usuário">
          {avatarContent}
        </DialogTrigger>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1 pt-2">
            <DialogClose
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent"
              onClick={() => router.push("/profile")}
            >
              <User size={18} />
              Meu Perfil
            </DialogClose>
            <Separator />
            <DialogClose
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent"
              onClick={() => router.push("/profile")}
            >
              <Settings size={18} />
              Configurações
            </DialogClose>
            <Separator />
            <DialogClose
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Sair
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
