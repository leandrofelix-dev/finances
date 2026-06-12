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
        <IconButton className="size-7" label="Editar" onClick={onEdit}>
          <Pencil size={14} />
        </IconButton>
      ) : null}
      {onDelete ? (
        <IconButton
          className="size-7 border-red-200 text-red-400 hover:border-red-300 hover:bg-red-50 hover:text-red-500"
          label="Excluir"
          onClick={onDelete}
        >
          <Trash2 size={14} />
        </IconButton>
      ) : null}
    </div>
  );
}
