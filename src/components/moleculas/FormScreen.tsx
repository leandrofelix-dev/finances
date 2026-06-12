"use client";

import type { ReactNode } from "react";

import { ArrowLeft } from "lucide-react";
import { DialogContent } from "@/components/atoms/dialog";
import { BackButton } from "@/components/atoms/Button";

export function FormScreen({ children, onBack }: { children: ReactNode; onBack: () => void }) {
  return (
    <DialogContent
      className="max-h-[90vh] w-[min(100%-2rem,860px)] overflow-hidden p-0 sm:max-w-[860px]"
      showCloseButton={false}
    >
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <BackButton onClick={onBack}>
          <ArrowLeft size={18} />
        </BackButton>
        <div>
          <h2 className="m-0 text-base font-bold text-foreground">Dados do registro</h2>
          <span className="text-sm text-muted-foreground">preencha os campos abaixo e salve para voltar à listagem</span>
        </div>
      </div>
      <div className="grid gap-3 p-5">{children}</div>
    </DialogContent>
  );
}
