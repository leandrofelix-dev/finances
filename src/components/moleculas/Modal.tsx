"use client";

import type { ReactNode } from "react";

import { Dialog } from "@/components/atoms/dialog";

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose?.();
        }
      }}
      open
    >
      {children}
    </Dialog>
  );
}
