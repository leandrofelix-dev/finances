"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/label";
import { toast } from "react-hot-toast";
import { User as UserIcon, LogOut, Loader2, Camera } from "lucide-react";

interface UserType {
  name: string;
  email: string;
  image?: string | null;
}

function ProfileEditForm({ user, router }: { user: UserType; router: ReturnType<typeof useRouter> }) {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.image || "");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("O nome não pode ficar vazio.");
      return;
    }

    setUpdating(true);
    try {
      await authClient.updateUser(
        {
          name,
          image: avatar || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Perfil atualizado com sucesso!");
            router.refresh();
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Erro ao atualizar perfil.");
          },
        }
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar perfil.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <UserIcon size={18} className="text-primary" />
          Editar Dados
        </CardTitle>
        <CardDescription>
          Atualize as informações do seu perfil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="profile-name">Nome</Label>
            <Input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="profile-email">E-mail (Não editável)</Label>
            <Input
              id="profile-email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>
          <div className="space-y-1">
            <Label>Foto de Perfil</Label>
            <div className="flex items-center gap-6 mt-2">
              <div className="relative group size-24 shrink-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  disabled={updating}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const formData = new FormData();
                    formData.append("file", file);
                    
                    const toastId = toast.loading("Enviando foto...");
                    try {
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });
                      
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Erro no upload");
                      
                      if (data.url) {
                        setAvatar(data.url);
                        toast.success("Foto carregada com sucesso! Clique em 'Salvar' para atualizar o perfil.", { id: toastId, duration: 4000 });
                      } else {
                        throw new Error("Erro desconhecido no upload");
                      }
                    } catch (err: unknown) {
                      const errorMsg = err instanceof Error ? err.message : "Erro no upload";
                      toast.error(errorMsg, { id: toastId });
                    }
                  }}
                />
                
                {avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={avatar} alt="Avatar Preview" className="size-24 rounded-full object-cover border-2 border-primary shadow-sm" />
                ) : (
                  <div className="size-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl border-2 border-primary/20 shadow-sm">
                    {name ? name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="text-white size-8" />
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground flex flex-col justify-center">
                <p>Clique na imagem para enviar uma nova foto de perfil.</p>
                <p className="text-xs mt-1">Imagens no formato JPG, PNG ou GIF.</p>
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto" loading={updating}>
            Salvar Alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Handle route protection
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Sessão encerrada.");
            router.push("/auth/login");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Erro ao sair.");
          },
        },
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao sair.");
    }
  };

  const fallbackLetter = session.user.name ? session.user.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-border">
        {session.user.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={session.user.image}
            alt={session.user.name}
            className="size-24 rounded-full object-cover border-2 border-primary shadow-md"
          />
        ) : (
          <div className="size-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl border-2 border-primary/20 shadow-md">
            {fallbackLetter}
          </div>
        )}
        <div className="text-center md:text-left space-y-1">
          <h1 className="text-2xl font-bold text-foreground">{session.user.name}</h1>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ProfileEditForm
            key={session.user.name + "-" + (session.user.image || "")}
            user={session.user}
            router={router}
          />
        </div>

        <Card className="h-fit shadow-sm border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-destructive flex items-center gap-2">
              <LogOut size={18} />
              Sair da Conta
            </CardTitle>
            <CardDescription>
              Encerre sua sessão atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogout}
              variant="danger"
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
