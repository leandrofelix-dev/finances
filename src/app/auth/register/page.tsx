"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/label";
import { toast } from "react-hot-toast";
import { Camera } from "lucide-react";

import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pass: string) => {
    // 8 characters, with letters and numbers
    const hasLetter = /[A-Za-z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    return pass.length >= 8 && hasLetter && hasNumber;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword(password)) {
      setError("A senha deve ter pelo menos 8 caracteres, contendo letras e números.");
      return;
    }

    setLoading(true);
    try {
      await authClient.signUp.email(
        {
          email,
          password,
          name,
          image: avatar || undefined,
        },
        {
          onSuccess: () => {
            window.location.href = "/";
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Erro ao criar conta.");
          },
        }
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <Card className="w-full max-w-md shadow-xl backdrop-blur-md bg-white/60">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Cadastre-se para gerenciar suas finanças de forma simples e elegante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres com letras e números"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Mínimo de 8 caracteres, contendo pelo menos uma letra e um número.
              </p>
            </div>
            <div className="space-y-1">
              <Label>Foto de Perfil (Opcional)</Label>
              <div className="flex items-center gap-6 mt-2">
                <div className="relative group size-24 shrink-0 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={loading}
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
                          toast.success("Foto carregada com sucesso!", { id: toastId, duration: 4000 });
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
                  <p>Clique na imagem para enviar uma foto de perfil.</p>
                  <p className="text-xs mt-1">Imagens no formato JPG, PNG ou GIF.</p>
                </div>
              </div>
            </div>
            {error && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 p-2.5 rounded-md border border-red-200">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              Criar Conta
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>
            Já tem uma conta? <Link href="/auth/login" className="text-primary underline">Entrar</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
