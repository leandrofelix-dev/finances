"use client";

import { AlertCircle, CheckCircle2, Info, Loader2, X } from "lucide-react";
import { toast, Toaster, type Toast } from "react-hot-toast";
import { Button } from "@/components/atoms/Button";

type ToastKind = "success" | "error" | "loading" | "info";

type ToastOptions = {
  description?: string;
  id?: string;
  title: string;
  type?: ToastKind;
};

const toastIcons = {
  error: AlertCircle,
  info: Info,
  loading: Loader2,
  success: CheckCircle2,
};

function ToastCard({
  description,
  title,
  toastInstance,
  type,
}: {
  description?: string;
  title: string;
  toastInstance: Toast;
  type: ToastKind;
}) {
  const Icon = toastIcons[type];

  return (
    <div className={`fynixToast fynixToast--${type} ${toastInstance.visible ? "fynixToast--visible" : ""}`}>
      <div className="fynixToast__icon">
        <Icon className={type === "loading" ? "fynixToast__spinner" : ""} size={18} />
      </div>
      <div className="fynixToast__content">
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
      </div>
      {type !== "loading" ? (
        <Button aria-label="Fechar notificação" className="fynixToast__close" onClick={() => toast.dismiss(toastInstance.id)} size="icon" type="button" variant="secondary">
          <X size={14} />
        </Button>
      ) : null}
    </div>
  );
}

export function notify({ description, id, title, type = "info" }: ToastOptions) {
  return toast.custom(
    (toastInstance) => (
      <ToastCard
        description={description}
        title={title}
        toastInstance={toastInstance}
        type={type}
      />
    ),
    {
      duration: type === "loading" ? Infinity : 3800,
      id,
      position: "top-right",
    }
  );
}

export function dismissToast(id?: string) {
  toast.dismiss(id);
}

export function AppToaster() {
  return (
    <Toaster
      gutter={10}
      position="top-right"
      toastOptions={{
        className: "fynixToastHost",
      }}
    />
  );
}
