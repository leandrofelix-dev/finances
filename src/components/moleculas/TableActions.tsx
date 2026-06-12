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
    <div className="flex flex-nowrap items-center justify-end gap-1">
      {onEdit ? (
        <IconButton className="size-7" label="Editar" onClick={onEdit} variant="secondary">
          <Pencil size={14} />
        </IconButton>
      ) : null}
      {onDelete ? (
        <IconButton
          className="size-7"
          label="Excluir"
          onClick={onDelete}
          variant="danger"
        >
          <Trash2 size={14} />
        </IconButton>
      ) : null}
    </div>
  );
}
