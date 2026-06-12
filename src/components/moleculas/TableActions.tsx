"use client";

import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/atoms/Button";

export function TableActions({
  onDelete,
  onEdit,
}: {
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {onEdit ? (
        <IconButton label="Editar" onClick={onEdit}>
          <Pencil size={15} />
        </IconButton>
      ) : null}
      {onDelete ? (
        <IconButton
          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          label="Excluir"
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </IconButton>
      ) : null}
    </div>
  );
}
