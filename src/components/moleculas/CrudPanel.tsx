"use client";

import type { ReactNode } from "react";

import { Card } from "@/components/atoms/card";
import { Button } from "@/components/atoms/Button";
import { Field, StyledInput } from "@/components/moleculas/FormControls";

export function CrudPanel({
  children,
  extraFilters,
  hasActiveFilters,
  onClear,
  onCreate,
  onQueryChange,
  query,
  title,
}: {
  children: ReactNode;
  extraFilters?: ReactNode;
  hasActiveFilters: boolean;
  onClear: () => void;
  onCreate: () => void;
  onQueryChange: (query: string) => void;
  query: string;
  title: string;
}) {
  return (
    <Card className="overflow-hidden rounded-[var(--fynix-radius-lg)] border border-border bg-card p-0 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="m-0 text-base font-bold text-foreground">{title}</h2>
          <span className="text-sm text-muted-foreground">busque, filtre e gerencie os registros</span>
        </div>
        <Button onClick={onCreate}>Cadastrar</Button>
      </div>

      <form className="grid gap-3 border-b border-border bg-muted/30 px-5 py-4" onSubmit={(event) => event.preventDefault()}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="m-0 text-sm font-semibold text-foreground">Busca e filtros</h3>
          {hasActiveFilters ? (
            <Button onClick={onClear} type="button" variant="secondary">
              Limpar filtros
            </Button>
          ) : null}
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Buscar">
            <StyledInput
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={`Buscar em ${title.toLowerCase()}...`}
              type="search"
              value={query}
            />
          </Field>
          {extraFilters}
        </div>
      </form>

      <div className="grid gap-3 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="m-0 text-sm font-semibold text-foreground">Registros</h3>
        </div>
        <div className="grid gap-3">{children}</div>
      </div>
    </Card>
  );
}
